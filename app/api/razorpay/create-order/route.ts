import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@/utils/supabase/server";

// POST /api/razorpay/create-order
// Creates a Razorpay order for the Standard Web Checkout flow.
// Amount: ₹1,817 (≈ $19 USD) in paise.
// Requires an authenticated session to prevent anonymous order creation.
export async function POST() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const amountPaise = parseInt(process.env.RAZORPAY_AMOUNT_PAISE ?? "181700", 10);

  if (!keyId || !keySecret) {
    return NextResponse.json({ error: "Razorpay is not configured." }, { status: 500 });
  }

  const client = new Razorpay({ key_id: keyId, key_secret: keySecret });

  try {
    const order = await client.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `premium_${user.id.slice(0, 8)}_${Date.now()}`,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch {
    return NextResponse.json({ error: "Failed to create payment order." }, { status: 502 });
  }
}
