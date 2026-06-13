import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { SkuSummary } from "@/lib/feeEngine";

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

// POST /api/ai/prioritize
// Sends all SKU summaries to GPT and returns ranked removal urgency with explanations.
export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not configured." }, { status: 500 });
  }

  const { skus, model } = await req.json() as PrioritizeRequest;
  if (!skus?.length) {
    return NextResponse.json({ error: "No SKU data provided." }, { status: 400 });
  }

  const skuTable = skus
    .map(
      (s, i) =>
        `${i + 1}. SKU: ${s.sku} | Qty: ${s.quantity} | Age: ${s.ageInDays}d | Monthly fee: $${s.monthlyFee.toFixed(2)} | 12M fees: $${s.projected12MFees.toFixed(0)} | Recovery: $${s.liquidationRecovery.toFixed(0)} | System action: ${s.recommendedAction}`
    )
    .join("\n");

  const systemPrompt = `You are an Amazon FBA inventory specialist. Given the following SKUs, rank them from most urgent to remove to least urgent. For each SKU, provide a one-sentence action recommendation.

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{"rankings":[{"sku":"string","urgencyRank":1,"aiAction":"string","reasoning":"string"}]}

Keep each reasoning under 20 words. aiAction must be one of: Remove Immediately, Discount Aggressively, Submit to Outlet, Monitor, Restock.`;

  const client = new OpenAI({ apiKey });

  let raw: string;
  try {
    const completion = await client.chat.completions.create({
      model: model || process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Rank these SKUs by removal urgency:\n${skuTable}` },
      ],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });
    raw = completion.choices[0].message.content ?? "{}";
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }

  try {
    const parsed = JSON.parse(raw) as { rankings: AiSkuInsight[] };
    return NextResponse.json({ rankings: parsed.rankings ?? [] });
  } catch {
    return NextResponse.json({ error: "Invalid JSON from AI." }, { status: 500 });
  }
}
