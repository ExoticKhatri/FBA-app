import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export interface ChatContext {
  skuLabel: string;
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
}

function buildSystemPrompt(ctx: ChatContext): string {
  const disc = (ctx.aggressiveDiscountPct * 100).toFixed(0);
  return `You are an expert Amazon FBA inventory analyst. A seller is using the FBA Liquidation Simulator and needs your advice.

Current simulation data:
- Product / SKU: ${ctx.skuLabel}
- Quantity: ${ctx.quantity} units (${ctx.isOversize ? "Oversize" : "Standard-size"})
- Age in FBA: ${ctx.ageInDays} days
- Monthly sales velocity: ${ctx.monthlySalesVelocity} units/month
- Selling price: $${ctx.currentPrice.toFixed(2)}/unit | Landed cost: $${ctx.landedCost.toFixed(2)}/unit
- FBA storage volume: ${ctx.totalVolumeCubicFeet.toFixed(2)} cubic feet

12-month projection results:
- Do Nothing net: $${ctx.doNothingNet12M.toFixed(0)}
- ${disc}% Discount strategy net: $${ctx.discountNet12M.toFixed(0)}
- Amazon Outlet net: $${ctx.outletNet12M.toFixed(0)}
- Removal Order net: $${ctx.removalNet12M.toFixed(0)}
- Projected 12-month storage fees: $${ctx.projected12MFees.toFixed(0)}
- Optimal liquidation start: ${ctx.optimalLiquidationDate}
- Capital recoverable via discounting vs. holding: $${ctx.capitalRecoverable.toFixed(0)}

Respond in under 150 words. Be direct, specific, and use numbers. Focus on actionable advice. If the question is unrelated to FBA or inventory, politely redirect.`;
}

// POST /api/ai/chat
// Streams an OpenAI chat completion given simulation context + user messages.
export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not configured." }, { status: 500 });
  }

  const { messages, model, context } = await req.json() as {
    messages: OpenAI.Chat.ChatCompletionMessageParam[];
    model: string;
    context: ChatContext;
  };

  const client = new OpenAI({ apiKey });

  const stream = await client.chat.completions.create({
    model: model || process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [{ role: "system", content: buildSystemPrompt(context) }, ...messages],
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
