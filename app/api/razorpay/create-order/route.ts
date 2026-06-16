import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// POST /api/razorpay/create-order
// Creates a Razorpay order for Standard Web Checkout.
// Uses direct fetch instead of the SDK to avoid serverless bundle issues.
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

  const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  try {
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: "INR",
        receipt: `premium_${user.id.slice(0, 8)}_${Date.now()}`,
      }),
    });

    if (!res.ok) {
      const err = await res.json() as { error?: { description?: string; code?: string } };
      const msg = err?.error?.description ?? `Razorpay API error ${res.status}`;
      console.error("[create-order] Razorpay rejected:", res.status, err);
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    const data = await res.json() as { id: string; amount: number; currency: string };
    return NextResponse.json({ orderId: data.id, amount: data.amount, currency: data.currency, keyId });
  } catch (e) {
    console.error("[create-order] fetch failed:", e);
    return NextResponse.json({ error: "Failed to reach Razorpay API." }, { status: 502 });
  }
}
