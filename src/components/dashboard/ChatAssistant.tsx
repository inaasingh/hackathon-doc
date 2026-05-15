import { useState, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X, Send, Bot, User } from "lucide-react";

// ── Constants outside component — never recreated on re-render ────
const EXAMPLES = [
  "What changed this week?",
  "Which APIs are unhealthy?",
  "Generate governance summary",
  "Show impacted documents",
];

const FALLBACK_REPLIES = [
  "Across this week: 47 changes, 2 SLA breaches, 1 critical (Order API). Governance health is up 1.2%. Want me to draft the weekly report?",
  "Order API is currently at CRITICAL risk — p95 latency is 1.8s vs 800ms SLA target. Recommend rolling back the retry config change immediately.",
  "6 integrations connected. MuleSoft Runtime is healthy at 99.99% uptime. Salesforce Connector has the most errors at 3.8% error rate.",
  "128 governance documents were auto-generated this week. 3 are pending review past their deadline — owned by @priya.",
  "Release-147 deployed successfully 3 hours ago. No rollbacks. All downstream APIs confirmed healthy post-deployment.",
];

type Msg = { role: "user" | "ai"; text: string };

const INITIAL_MSGS: Msg[] = [
  { role: "ai", text: "Hi 👋 I'm your Delivery Copilot. Ask me anything about changes, risks, or governance." },
];

export function ChatAssistant() {
  const [open,   setOpen]   = useState(false);
  const [input,  setInput]  = useState("");
  const [msgs,   setMsgs]   = useState<Msg[]>(INITIAL_MSGS);
  const [typing, setTyping] = useState(false);

  // Stable refs — never cause re-renders
  const fallbackIdx  = useRef(0);
  const abortRef     = useRef<AbortController | null>(null);

  const showFallback = useCallback(() => {
    setTyping(false);
    setMsgs(m => [...m, {
      role: "ai",
      text: FALLBACK_REPLIES[fallbackIdx.current++ % FALLBACK_REPLIES.length],
    }]);
  }, []);

  const send = useCallback(async (override?: string) => {
    const text = (override ?? input).trim();
    if (!text) return;

    // Cancel any in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const controller = abortRef.current;

    setMsgs(m => [...m, { role: "user", text }]);
    setInput("");
    setTyping(true);

    // 8-second timeout
    const timer = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch("/api/claude", {
        method:  "POST",
        headers: { "content-type": "application/json" },
        body:    JSON.stringify({ prompt: text, type: "chat" }),
        signal:  controller.signal,
      });
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        setTyping(false);
        setMsgs(m => [...m, { role: "ai", text: data.text?.trim() || FALLBACK_REPLIES[0] }]);
      } else {
        showFallback();
      }
    } catch {
      clearTimeout(timer);
      showFallback();
    }
  }, [input, showFallback]);

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-2xl gradient-primary-bg ai-glow flex items-center justify-center text-primary-foreground transition-transform duration-150 hover:scale-105 active:scale-95"
      >
        {open ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1     }}
            exit={{    opacity: 0, y: 16, scale: 0.97  }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-24 right-6 z-40 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] rounded-2xl elegant-shadow flex flex-col overflow-hidden"
            style={{
              background: "var(--card)",
              border: "1px solid rgba(124,110,245,0.18)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg gradient-ai-bg flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Delivery Copilot</div>
                  <div className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                    Online · Claude Sonnet
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {msgs.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : ""}`}>
                  {m.role === "ai" && (
                    <div className="h-7 w-7 rounded-lg gradient-ai-bg flex items-center justify-center shrink-0">
                      <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
                    </div>
                  )}
                  <div className={`text-xs leading-relaxed rounded-2xl px-3 py-2 max-w-[80%] ${
                    m.role === "ai"
                      ? "bg-secondary/60 border border-border"
                      : "gradient-primary-bg text-primary-foreground"
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

              {/* Typing indicator */}
              {typing && (
                <div className="flex gap-2">
                  <div className="h-7 w-7 rounded-lg gradient-ai-bg flex items-center justify-center shrink-0">
                    <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                  <div className="bg-secondary/60 border border-border rounded-2xl px-3 py-2 flex gap-1 items-center">
                    {[0, 1, 2].map(i => (
                      <span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                        style={{ animation: "typing-dot 1.2s ease-in-out infinite", animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Example prompts — only shown when chat is empty */}
              {msgs.length === 1 && !typing && (
                <div className="grid grid-cols-2 gap-1.5 pt-2">
                  {EXAMPLES.map(e => (
                    <button
                      key={e}
                      onClick={() => send(e)}
                      className="text-left text-[11px] px-2.5 py-2 rounded-lg border border-border bg-card/40 hover:bg-secondary transition-colors"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
              <div className="flex gap-2 items-center rounded-xl px-3" style={{ background: "var(--input, var(--secondary))", border: "1px solid var(--border)" }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
                  placeholder="Ask anything…"
                  className="flex-1 h-10 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
                />
                <button
                  onClick={() => send()}
                  disabled={!input.trim() || typing}
                  className="h-7 w-7 rounded-lg gradient-primary-bg flex items-center justify-center disabled:opacity-40 transition-opacity"
                >
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
