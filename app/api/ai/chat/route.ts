import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/utils/supabase/server";

export interface ChatSkuRow {
  sku: string;
  quantity: number;
  ageInDays: number;
  monthlyFee: number;
  projected12MFees: number;
  urgencyScore: number;
  recommendedAction: string;
}

export interface ChatContext {
  skuLabel: string;
  todayDate: string;            // e.g. "Saturday, June 21, 2026"
  quantity: number;
  isOversize: boolean;
  ageInDays: number;
  monthlySalesVelocity: number;
  currentPrice: number;
  landedCost: number;
  aggressiveDiscountPct: number;
  projected12MFees: number;
  optimalLiquidationDate: string;
  capitalRecoverable: number;
  totalVolumeCubicFeet: number;
  doNothingNet12M: number;
  discountNet12M: number;
  outletNet12M: number;
  removalNet12M: number;
  // All SKUs from uploaded CSV (may be empty for manual-only sessions)
  skuSummaries?: ChatSkuRow[];
}

const ALLOWED_MODELS = new Set(["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"]);
const MAX_MESSAGES = 20;
const MAX_CONTENT_LENGTH = 2000;

function safeNum(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function buildSystemPrompt(ctx: ChatContext): string {
  const label = String(ctx.skuLabel ?? "Unknown SKU").slice(0, 100).replace(/[\r\n]/g, " ");
  const qty = safeNum(ctx.quantity);
  const oversize = Boolean(ctx.isOversize);
  const age = safeNum(ctx.ageInDays);
  const velocity = safeNum(ctx.monthlySalesVelocity);
  const price = safeNum(ctx.currentPrice);
  const cost = safeNum(ctx.landedCost);
  const volume = safeNum(ctx.totalVolumeCubicFeet);
  const disc = (safeNum(ctx.aggressiveDiscountPct) * 100).toFixed(0);
  const doNothing = safeNum(ctx.doNothingNet12M);
  const discount = safeNum(ctx.discountNet12M);
  const outlet = safeNum(ctx.outletNet12M);
  const removal = safeNum(ctx.removalNet12M);
  const fees = safeNum(ctx.projected12MFees);
  const date = String(ctx.optimalLiquidationDate ?? "N/A").slice(0, 30).replace(/[\r\n]/g, "");
  const capital = safeNum(ctx.capitalRecoverable);

  // Build CSV SKU table when the seller uploaded multi-SKU data
  let skuTable = "";
  if (Array.isArray(ctx.skuSummaries) && ctx.skuSummaries.length > 0) {
    const rows = ctx.skuSummaries.slice(0, 25);
    const lines = rows.map((s) => {
      const sku = String(s.sku ?? "").slice(0, 30).replace(/[\r\n|]/g, " ");
      const action = String(s.recommendedAction ?? "").replace(/[\r\n]/g, " ");
      return `• ${sku}: ${safeNum(s.quantity)} units, ${safeNum(s.ageInDays)}d old, $${safeNum(s.monthlyFee).toFixed(0)}/mo fees, urgency ${safeNum(s.urgencyScore)}/10 → ${action}`;
    });
    const more = ctx.skuSummaries.length > 25
      ? `\n  …and ${ctx.skuSummaries.length - 25} more SKUs`
      : "";
    skuTable = `\n\nCSV Upload — ${ctx.skuSummaries.length} SKUs analyzed:\n${lines.join("\n")}${more}`;
  }

  const today = String(ctx.todayDate ?? new Date().toDateString()).slice(0, 50).replace(/[\r\n]/g, "");

  return `You are an expert Amazon FBA inventory analyst. A seller is using the FBA Liquidation Simulator and needs your advice.

Today's date: ${today}
Active simulation — ${label}:
- Quantity: ${qty} units (${oversize ? "Oversize" : "Standard-size"})
- Age in FBA: ${age} days
- Monthly sales velocity: ${velocity} units/month
- Selling price: $${price.toFixed(2)}/unit | Landed cost: $${cost.toFixed(2)}/unit
- FBA storage volume: ${volume.toFixed(2)} cubic feet

12-month projections:
- Do Nothing net: $${doNothing.toFixed(0)}
- ${disc}% Discount strategy net: $${discount.toFixed(0)}
- Amazon Outlet net: $${outlet.toFixed(0)}
- Removal Order net: $${removal.toFixed(0)}
- Projected 12-month storage fees: $${fees.toFixed(0)}
- Optimal liquidation start: ${date}
- Capital recoverable vs. holding: $${capital.toFixed(0)}${skuTable}

Respond in under 150 words. Be direct, specific, and use numbers. Focus on actionable advice. If the question is unrelated to FBA or inventory, politely redirect.`;
}

// POST /api/ai/chat
// Requires authenticated premium user. Streams an OpenAI completion.
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

  const { messages, model, context } = await req.json() as {
    messages: { role: string; content: string }[];
    model: string;
    context: ChatContext;
  };

  const safeModel = ALLOWED_MODELS.has(model)
    ? model
    : (process.env.OPENAI_MODEL ?? "gpt-4o-mini");

  const safeMessages = (Array.isArray(messages) ? messages : [])
    .filter((m) => m.role === "user" && typeof m.content === "string")
    .slice(-MAX_MESSAGES)
    .map((m) => ({
      role: "user" as const,
      content: m.content.slice(0, MAX_CONTENT_LENGTH),
    }));

  const client = new OpenAI({ apiKey });

  const stream = await client.chat.completions.create({
    model: safeModel,
    messages: [{ role: "system", content: buildSystemPrompt(context) }, ...safeMessages],
    stream: true,
    temperature: 0.6,
    max_tokens: 350,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) controller.enqueue(encoder.encode(delta));
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-cache",
    },
  });
}
