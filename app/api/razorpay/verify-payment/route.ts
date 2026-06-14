import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/utils/supabase/server";

interface VerifyPaymentBody {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// POST /api/razorpay/verify-payment
// Standard Web Checkout signature verification.
// HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
export async function POST(req: NextRequest) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  }

  let body: VerifyPaymentBody;
  try {
    body = (await req.json()) as VerifyPaymentBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;
  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing payment fields." }, { status: 400 });
  }

  // Razorpay order signature: HMAC-SHA256(order_id + "|" + payment_id, key_secret)
  const message = `${razorpay_order_id}|${razorpay_payment_id}`;
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

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const premiumExpiresAt = new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString();

  const { error: dbError } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      email: user.email!,
      is_premium: true,
      premium_expires_at: premiumExpiresAt,
      razorpay_payment_id,
      updated_at: new Date().toISOString(),
    });

  if (dbError) {
    return NextResponse.json({ error: "Failed to activate premium." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
