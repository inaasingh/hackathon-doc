import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X, Send, Bot, User } from "lucide-react";

const examples = [
  "What changed this week?",
  "Generate governance summary",
  "Which APIs are unhealthy?",
  "Show impacted documents",
];

type Msg = { role: "user" | "ai"; text: string };

export function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "ai", text: "Hi Ina 👋 I'm your Delivery Copilot. Ask me anything about changes, risks, or governance." },
  ]);
  const [typing, setTyping] = useState(false);

  const FALLBACK_REPLIES = [
    "Across this week: 47 changes, 2 SLA breaches, 1 critical (Order API). Governance health is up 1.2%. Want me to draft the weekly report?",
    "Order API is currently at CRITICAL risk — p95 latency is 1.8s vs 800ms SLA target. Recommend rolling back the retry config change immediately.",
    "I can see 6 integrations connected. MuleSoft Runtime is healthy at 99.99% uptime. Salesforce Connector has the most errors at 3.8% error rate.",
    "128 governance documents were auto-generated this week. 3 are pending review past their deadline — owned by @priya.",
  ];
  let fallbackIdx = 0;

  const send = async (t?: string) => {
    const text = (t ?? input).trim();
    if (!text) return;
    setMsgs((m) => [...m, { role: "user", text }]);
    setInput("");
    setTyping(true);

    try {
      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: text, type: "chat" }),
      });

      if (res.ok) {
        const data = await res.json();
        setTyping(false);
        setMsgs((m) => [...m, { role: "ai", text: data.text ?? FALLBACK_REPLIES[0] }]);
      } else {
        throw new Error("API error");
      }
    } catch {
      // Graceful fallback if API key not yet configured
      setTimeout(() => {
        setTyping(false);
        setMsgs((m) => [...m, {
          role: "ai",
          text: FALLBACK_REPLIES[fallbackIdx++ % FALLBACK_REPLIES.length],
        }]);
      }, 1000);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-2xl gradient-primary-bg ai-glow flex items-center justify-center text-primary-foreground transition-transform duration-150 hover:scale-105 active:scale-95"
      >
        {open ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            className="fixed bottom-24 right-6 z-40 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] glass rounded-2xl elegant-shadow flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg gradient-ai-bg flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Delivery Copilot</div>
                  <div className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> Online · Claude Sonnet 4.5
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {msgs.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : ""}`}>
                  {m.role === "ai" && (
                    <div className="h-7 w-7 rounded-lg gradient-ai-bg flex items-center justify-center shrink-0">
                      <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
                    </div>
                  )}
                  <div className={`text-xs leading-relaxed rounded-2xl px-3 py-2 max-w-[80%] ${
                    m.role === "ai" ? "bg-secondary/60 border border-border" : "gradient-primary-bg text-primary-foreground"
                  }`}>
                    {m.text}
                  </div>
                  {m.role === "user" && (
                    <div className="h-7 w-7 rounded-lg bg-secondary border border-border flex items-center justify-center shrink-0">
                      <User className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              ))}
              {typing && (
                <div className="flex gap-2">
                  <div className="h-7 w-7 rounded-lg gradient-ai-bg flex items-center justify-center">
                    <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                  <div className="bg-secondary/60 border border-border rounded-2xl px-3 py-2 flex gap-1 items-center">
                    {[0,1,2].map(i => (
                      <span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                        style={{
                          animation: "typing-dot 1.2s ease-in-out infinite",
                          animationDelay: `${i * 0.2}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {msgs.length === 1 && (
                <div className="grid grid-cols-2 gap-1.5 pt-2">
                  {examples.map((e) => (
                    <button key={e} onClick={() => send(e)}
                      className="text-left text-[11px] px-2.5 py-2 rounded-lg border border-border bg-card/40 hover:bg-card hover:glow-border transition">
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-border">
              <div className="flex gap-2 items-center bg-input/40 border border-border rounded-xl px-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Ask anything…"
                  className="flex-1 h-10 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
                />
                <button onClick={() => send()} className="h-7 w-7 rounded-lg gradient-primary-bg flex items-center justify-center">
                  <Send className="h-3.5 w-3.5 text-primary-foreground" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
