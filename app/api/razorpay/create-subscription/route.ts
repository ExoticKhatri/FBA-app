import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// POST /api/razorpay/create-subscription
// Creates a Razorpay subscription and returns the subscription_id for checkout.
// Requires an authenticated session — unauthenticated callers cannot trigger billing.
export async function POST() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const planId = process.env.RAZORPAY_PLAN_ID;

  if (!keyId || !keySecret || !planId) {
    return NextResponse.json(
      { error: "Razorpay environment variables are not configured." },
      { status: 500 }
    );
  }

  const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const body = {
    plan_id: planId,
    quantity: 1,
    total_count: 120,
    notify_info: {},
  };

  let data: Record<string, unknown>;
  try {
    const res = await fetch("https://api.razorpay.com/v1/subscriptions", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json() as { error?: { description?: string } };
      return NextResponse.json(
        { error: err?.error?.description ?? "Razorpay error" },
        { status: 502 }
      );
    }

    data = await res.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Failed to reach Razorpay API." }, { status: 502 });
  }

  return NextResponse.json({ subscriptionId: data.id, keyId });
}
