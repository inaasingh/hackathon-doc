import { motion } from "framer-motion";
import { useState } from "react";
import { Brain, ChevronDown, FileText, Server, AlertTriangle, GitBranch, Sparkles } from "lucide-react";

export function ImpactPanel() {
  const [open, setOpen] = useState(true);

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-ai" /> AI Impact Analysis
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">MULE-2391 · Order API · SLA breach</p>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-ai/10 text-ai border border-ai/30">CONFIDENCE 96%</span>
      </div>

      {/* Mini graph visualization */}
      <div className="relative h-44 rounded-xl border border-border bg-background/40 grid-bg overflow-hidden mb-4">
        <Node x="50%" y="50%" label="Order API" tone="critical" big />
        <Node x="15%" y="25%" label="Inventory" tone="warning" />
        <Node x="85%" y="25%" label="Pricing" tone="info" />
        <Node x="20%" y="80%" label="CRM Sync" tone="success" />
        <Node x="80%" y="80%" label="LLD" tone="ai" />
        <Edge x1="50%" y1="50%" x2="15%" y2="25%" />
        <Edge x1="50%" y1="50%" x2="85%" y2="25%" />
        <Edge x1="50%" y1="50%" x2="20%" y2="80%" />
        <Edge x1="50%" y1="50%" x2="80%" y2="80%" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Card icon={FileText}        label="Impacted Docs"     value="4" tone="ai" />
        <Card icon={Server}          label="Impacted Systems"  value="3" tone="info" />
        <Card icon={AlertTriangle}   label="Downstream Risks"  value="2" tone="critical" />
        <Card icon={GitBranch}       label="Dependencies"      value="7" tone="warning" />
      </div>

      <div className="mt-4 rounded-xl border border-border bg-secondary/30 overflow-hidden">
        <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium hover:bg-secondary/50">
          <span className="inline-flex items-center gap-2"><Brain className="h-3.5 w-3.5 text-ai" /> AI Reasoning</span>
          <ChevronDown className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} className="px-4 pb-3 text-xs text-muted-foreground leading-relaxed border-t border-border">
            Detected SLA breach on <b className="text-foreground/90">Order API</b> exceeds the 800ms p95 threshold. Tracing
            indicates the regression originated from MuleSoft retry policy change (MULE-2391). Inventory and Pricing show
            cascading latency. Recommend updating the LLD, regenerating the runbook, and notifying the Governance lead.
          </motion.div>
        )}
      </div>

      <div className="mt-4">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Suggested Actions</div>
        <div className="space-y-1.5">
          {["Regenerate LLD for Order API","Notify governance owner @priya","Schedule rollback window 21:00 UTC"].map((a) => (
            <button key={a} className="w-full text-left text-xs px-3 py-2 rounded-lg border border-border bg-card/50 hover:bg-card hover:glow-border transition flex items-center justify-between">
              <span>{a}</span>
              <span className="text-[10px] gradient-text font-medium">RUN</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone: string }) {
  const tm: Record<string, string> = {
    ai: "text-ai bg-[oklch(0.72_0.2_295)]/10",
    info: "text-info bg-info/10",
    critical: "text-critical bg-critical/10",
    warning: "text-warning bg-warning/10",
  };
  return (
    <div className="rounded-xl border border-border bg-card/40 p-3">
      <div className="flex items-center justify-between">
        <div className={`h-7 w-7 rounded-md flex items-center justify-center ${tm[tone]}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <span className="text-lg font-semibold">{value}</span>
      </div>
      <div className="text-[11px] text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function Node({ x, y, label, tone, big }: any) {
  const tm: Record<string, string> = {
    critical: "border-critical/60 text-critical bg-critical/10",
    warning:  "border-warning/60 text-warning bg-warning/10",
    info:     "border-info/60 text-info bg-info/10",
    success:  "border-success/60 text-success bg-success/10",
    ai:       "border-ai/60 text-ai bg-[oklch(0.72_0.2_295)]/10",
  };
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ left: x, top: y }}
      className={`absolute -translate-x-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg border text-[10px] font-medium backdrop-blur ${tm[tone]} ${big ? "ai-glow text-xs px-3 py-1.5" : ""}`}
    >
      {label}
    </motion.div>
  );
}

function Edge({ x1, y1, x2, y2 }: any) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="oklch(0.7 0.18 270 / 35%)" strokeWidth="1" strokeDasharray="3 3" />
    </svg>
  );
}
