import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { SkuSummary } from "@/lib/feeEngine";
import { createClient } from "@/utils/supabase/server";

interface PrioritizeRequest {
  skus: SkuSummary[];
  model?: string;
}

export interface AiSkuInsight {
  sku: string;
  urgencyRank: number;
  aiAction: string;
  reasoning: string;
}

const ALLOWED_MODELS = new Set(["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"]);
const MAX_SKUS = 100;

// POST /api/ai/prioritize
// Requires authenticated premium user. Returns ranked SKU removal urgency.
export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not configured." }, { status: 500 });
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_premium, premium_expires_at")
    .eq("id", user.id)
    .single();

  const isPremium =
    profile?.is_premium &&
    profile.premium_expires_at &&
    new Date(profile.premium_expires_at) > new Date();

  if (!isPremium) {
    return NextResponse.json({ error: "Premium subscription required." }, { status: 403 });
  }

  const { skus, model } = await req.json() as PrioritizeRequest;
  if (!Array.isArray(skus) || skus.length === 0) {
    return NextResponse.json({ error: "No SKU data provided." }, { status: 400 });
  }
  if (skus.length > MAX_SKUS) {
    return NextResponse.json({ error: `Too many SKUs. Maximum is ${MAX_SKUS}.` }, { status: 400 });
  }

  const safeModel = ALLOWED_MODELS.has(model ?? "")
    ? (model as string)
    : (process.env.OPENAI_MODEL ?? "gpt-4o-mini");

  const skuTable = skus
    .map((s, i) => {
      const sku = String(s.sku ?? "").slice(0, 80).replace(/[\r\n]/g, " ");
      const qty = Number.isFinite(s.quantity) ? s.quantity : 0;
      const age = Number.isFinite(s.ageInDays) ? s.ageInDays : 0;
      const fee = Number.isFinite(s.monthlyFee) ? s.monthlyFee.toFixed(2) : "0.00";
      const fees12 = Number.isFinite(s.projected12MFees) ? s.projected12MFees.toFixed(0) : "0";
      const recovery = Number.isFinite(s.liquidationRecovery) ? s.liquidationRecovery.toFixed(0) : "0";
      const action = String(s.recommendedAction ?? "").slice(0, 50).replace(/[\r\n]/g, " ");
      return `${i + 1}. SKU: ${sku} | Qty: ${qty} | Age: ${age}d | Monthly fee: $${fee} | 12M fees: $${fees12} | Recovery: $${recovery} | System action: ${action}`;
    })
    .join("\n");

  const systemPrompt = `You are an Amazon FBA inventory specialist. Given the following SKUs, rank them from most urgent to remove to least urgent. For each SKU, provide a one-sentence action recommendation.

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{"rankings":[{"sku":"string","urgencyRank":1,"aiAction":"string","reasoning":"string"}]}

Keep each reasoning under 20 words. aiAction must be one of: Remove Immediately, Discount Aggressively, Submit to Outlet, Monitor, Restock.`;

  const client = new OpenAI({ apiKey });

  let raw: string;
  try {
    const completion = await client.chat.completions.create({
      model: safeModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Rank these SKUs by removal urgency:\n${skuTable}` },
      ],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });
    raw = completion.choices[0].message.content ?? "{}";
  } catch {
    return NextResponse.json({ error: "AI service temporarily unavailable." }, { status: 502 });
  }

  try {
    const parsed = JSON.parse(raw) as { rankings: AiSkuInsight[] };
    return NextResponse.json({ rankings: parsed.rankings ?? [] });
  } catch {
    return NextResponse.json({ error: "Invalid response from AI service." }, { status: 500 });
  }
}
