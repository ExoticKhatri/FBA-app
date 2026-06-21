"use client";
import { useRef, useState } from "react";
import type { ChatContext } from "@/app/api/ai/chat/route";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const MODELS = [
  { value: "gpt-4o", label: "GPT-4o (Latest)" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini (Fast)" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (Budget)" },
];

const STARTERS = [
  "Should I liquidate this inventory now?",
  "What's the best strategy for my situation?",
  "How many units should I remove this month?",
  "When will storage fees exceed my recovery value?",
];

interface Props {
  context: ChatContext;
  isPremium: boolean;
  onUpgradeClick: () => void;
}

export default function AIChat({ context, isPremium, onUpgradeClick }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("gpt-4o");
  const [streaming, setStreaming] = useState(false);
  const [open, setOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    if (!text.trim() || streaming) return;

    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);

    const assistantMsg: Message = { role: "assistant", content: "" };
    setMessages([...newMessages, assistantMsg]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          model,
          context,
        }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json() as { error?: string };
        setMessages(m => [...m.slice(0, -1), { role: "assistant", content: err.error ?? "An error occurred." }]);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages(m => [...m.slice(0, -1), { role: "assistant", content: acc }]);
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } catch {
      setMessages(m => [...m.slice(0, -1), { role: "assistant", content: "Network error. Please try again." }]);
    } finally {
      setStreaming(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={isPremium ? () => setOpen(true) : onUpgradeClick}
        className="fixed bottom-20 right-4 sm:bottom-8 sm:right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
      >
        <span className="text-lg">🤖</span>
        <span className="text-sm font-semibold">AI Analyst</span>
        {!isPremium && <span className="text-xs opacity-75">🔒</span>}
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[80vh]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-indigo-600">
        <div className="flex items-center gap-2">
          <span className="text-xl">🤖</span>
          <div>
            <p className="text-white font-semibold text-sm">AI Analyst</p>
            <p className="text-indigo-200 text-xs">Powered by OpenAI</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={model}
            onChange={e => setModel(e.target.value)}
            className="bg-indigo-700 text-white text-xs rounded-lg px-2 py-1 border-none outline-none cursor-pointer"
          >
            {MODELS.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <button type="button" onClick={() => setOpen(false)} className="text-indigo-200 hover:text-white text-lg">✕</button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-slate-400 text-center">Ask me anything about your simulation data.</p>
            {STARTERS.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="text-left text-xs px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={[
                "max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-sm"
                  : "bg-slate-100 text-slate-800 rounded-bl-sm",
              ].join(" ")}
            >
              {msg.content || (
                <span className="flex gap-1">
                  <span className="animate-bounce delay-0">·</span>
                  <span className="animate-bounce delay-75">·</span>
                  <span className="animate-bounce delay-150">·</span>
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-100 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send(input)}
          placeholder="Ask about your inventory…"
          disabled={streaming}
          className="flex-1 text-sm px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
        />
        <button
          type="button"
          disabled={!input.trim() || streaming}
          onClick={() => send(input)}
          className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 transition-colors"
        >
          →
        </button>
      </div>
    </div>
  );
}
