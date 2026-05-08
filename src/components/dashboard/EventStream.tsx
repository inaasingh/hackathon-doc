import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Info,
  RefreshCw,
} from "lucide-react";

import { mockEvents } from "../../data/mockEvents";

const SourceBadge = ({ name }: { name: string }) => {
  const map: Record<string, { bg: string; label: string }> = {
    Jira: {
      bg: "bg-info/15 text-info border-info/30",
      label: "JIRA",
    },
    Zoho: {
      bg: "bg-warning/15 text-warning border-warning/30",
      label: "ZOHO",
    },
    MuleSoft: {
      bg: "bg-critical/15 text-critical border-critical/30",
      label: "MULE",
    },
    Azure: {
      bg: "bg-primary/15 text-primary border-primary/30",
      label: "AZURE",
    },
    Salesforce: {
      bg: "bg-accent/15 text-accent border-accent/30",
      label: "SFDC",
    },
  };

  const m = map[name] ?? map.Jira;

  return (
    <span
      className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${m.bg}`}
    >
      {m.label}
    </span>
  );
};

const sevStyles: Record<string, any> = {
  critical: {
    dot: "text-critical",
    icon: AlertTriangle,
    accent: "border-l-critical",
    chip: "bg-critical/15 text-critical border-critical/30",
  },

  warning: {
    dot: "text-warning",
    icon: AlertCircle,
    accent: "border-l-warning",
    chip: "bg-warning/15 text-warning border-warning/30",
  },

  success: {
    dot: "text-success",
    icon: CheckCircle2,
    accent: "border-l-success",
    chip: "bg-success/15 text-success border-success/30",
  },

  info: {
    dot: "text-info",
    icon: Info,
    accent: "border-l-info",
    chip: "bg-info/15 text-info border-info/30",
  },
};

export function EventStream({
  onSelect,
}: {
  onSelect: (i: number) => void;
}) {
  const [events, setEvents] = useState(mockEvents);

  const [selected, setSelected] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setEvents((prev) => {
        const pool = [
          {
            sev: "info",
            source: "Jira",
            id: `JIRA-${Math.floor(Math.random() * 9000) + 1000}`,
            svc: "Order API",
            summary: "Story moved to In Review",
            conf: 90,
            ts: "now",
            docs: ["BRD"],
          },

          {
            sev: "warning",
            source: "Azure",
            id: `ADO-${Math.floor(Math.random() * 900) + 100}`,
            svc: "Pricing Engine",
            summary: "Pipeline quality gate flagged 2 issues",
            conf: 87,
            ts: "now",
            docs: ["TDD"],
          },
        ];

        const next =
          pool[Math.floor(Math.random() * pool.length)];

        return [next, ...prev].slice(0, 6);
      });
    }, 6000);

    return () => clearInterval(t);
  }, []);

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight flex items-center gap-2">
            Recent Detected Changes

            <span className="relative inline-block h-2 w-2 rounded-full bg-success">
              <span className="absolute inset-0 rounded-full bg-success animate-ping" />
            </span>
          </h2>

          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time enterprise event stream
          </p>
        </div>

        <button className="inline-flex items-center gap-1.5 text-xs px-2.5 h-8 rounded-lg bg-secondary/50 border border-border hover:bg-secondary transition">
          <RefreshCw className="h-3 w-3" />
          Refresh
        </button>
      </div>

      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {events.map((e, i) => {
            const s = sevStyles[e.sev] || sevStyles.info;

            const Icon = s.icon;

            const isSel = selected === i;

            return (
              <motion.button
                key={`${e.id}-${i}`}
                layout
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                onClick={() => {
                  setSelected(i);
                  onSelect(i);
                }}
                className={`w-full text-left rounded-xl border border-border p-3 pl-4 border-l-4 ${s.accent} bg-card/40 hover:bg-card transition group ${
                  isSel ? "glow-border" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`h-4 w-4 mt-0.5 ${s.dot}`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <SourceBadge name={e.source} />

                      <span className="text-xs font-mono text-muted-foreground">
                        {e.id}
                      </span>

                      <span className="text-xs font-medium">
                        {e.svc}
                      </span>

                      <span
                        className={`ml-auto px-1.5 py-0.5 rounded text-[10px] border ${s.chip}`}
                      >
                        {(e.sev || "info").toUpperCase()}
                      </span>
                    </div>

                    <p className="text-sm mt-1.5 text-foreground/90">
                      {e.summary}
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                      <span>⏱ {e.ts} ago</span>

                      <span className="inline-flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full gradient-ai-bg" />

                        AI confidence{" "}
                        <b className="text-foreground/80">
                          {e.conf}%
                        </b>
                      </span>

                      <div className="flex gap-1 flex-wrap">
                        {e.docs?.map((d: string) => (
                          <span
                            key={d}
                            className="px-1.5 py-0.5 rounded bg-secondary/60 border border-border text-[10px]"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}