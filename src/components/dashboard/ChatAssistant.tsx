import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    { role: "ai", text: "Hi Aman 👋 I'm your Delivery Copilot. Ask me anything about changes, risks, or governance." },
  ]);
  const [typing, setTyping] = useState(false);

  const send = (t?: string) => {
    const text = (t ?? input).trim();
    if (!text) return;
    setMsgs((m) => [...m, { role: "user", text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, {
        role: "ai",
        text: "Across this week: 47 changes, 2 SLA breaches, 1 critical (Order API). Governance health is up 1.2%. Want me to draft the weekly report?"
      }]);
    }, 1400);
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-2xl gradient-primary-bg ai-glow flex items-center justify-center text-primary-foreground"
      >
        {open ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
      </motion.button>

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
                  <div className="bg-secondary/60 border border-border rounded-2xl px-3 py-2 flex gap-1">
                    {[0,1,2].map(i => (
                      <span key={i} className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
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
