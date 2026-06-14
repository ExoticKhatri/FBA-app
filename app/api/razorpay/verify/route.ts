import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/utils/supabase/server";

interface VerifyBody {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}

// POST /api/razorpay/verify
// 1. Validates Razorpay HMAC signature
// 2. Reads the authenticated user from the Supabase session cookie
// 3. Writes premium status to the profiles table (RLS: auth.uid() = id)
export async function POST(req: NextRequest) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  }

  let body: VerifyBody;
  try {
    body = (await req.json()) as VerifyBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = body;
  if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing payment fields." }, { status: 400 });
  }

  // Razorpay subscription signature: HMAC-SHA256(payment_id + "|" + subscription_id, key_secret)
  const message = `${razorpay_payment_id}|${razorpay_subscription_id}`;
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(message)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "hex");
  const actualBuf = Buffer.from(razorpay_signature, "hex");
  if (
    expectedBuf.length !== actualBuf.length ||
    !crypto.timingSafeEqual(expectedBuf, actualBuf)
  ) {
    return NextResponse.json({ error: "Payment verification failed." }, { status: 403 });
  }

  // Get the authenticated user from the session cookie
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  // Write premium status — 35-day window (slightly longer than billing month)
  const premiumExpiresAt = new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString();

  const { error: dbError } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      email: user.email!,
      is_premium: true,
      premium_expires_at: premiumExpiresAt,
      razorpay_subscription_id,
      updated_at: new Date().toISOString(),
    });

  if (dbError) {
    return NextResponse.json({ error: "Failed to activate premium." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
