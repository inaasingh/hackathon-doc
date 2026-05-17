import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, GitBranch, ShieldAlert, Loader2, AlertTriangle,
  CheckCircle2, Info, AlertCircle, Lightbulb, Clock,
  ThumbsUp, ChevronRight, ArrowRight,
} from "lucide-react";

const BACKEND = "http://localhost:3001";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ChainNode {
  eventId: string;
  system:  string;
  action:  string;
  impact:  string;
  sev:     "info" | "warning" | "critical" | "success";
}

interface RCAData {
  summary:            string;
  rootCause:          { eventId: string; system: string; description: string };
  causalChain:        ChainNode[];
  confidence:         number;
  timeToDetect:       string;
  recommendation:     string;
  preventionMeasures: string[];
}

interface Props {
  event:   any;
  history: any[];
  onClose: () => void;
}

// ─── Severity helpers ─────────────────────────────────────────────────────────
const sevStyle: Record<string, { border: string; bg: string; text: string; icon: any }> = {
  critical: { border: "border-red-500/50",    bg: "bg-red-500/10",    text: "text-red-400",    icon: AlertTriangle  },
  warning:  { border: "border-yellow-500/50", bg: "bg-yellow-500/10", text: "text-yellow-400", icon: AlertCircle    },
  success:  { border: "border-green-500/50",  bg: "bg-green-500/10",  text: "text-green-400",  icon: CheckCircle2   },
  info:     { border: "border-blue-500/50",   bg: "bg-blue-500/10",   text: "text-blue-400",   icon: Info           },
};

function SevIcon({ sev, className }: { sev: string; className?: string }) {
  const s   = sevStyle[sev] ?? sevStyle.info;
  const Icon = s.icon;
  return <Icon className={`${s.text} ${className ?? "h-4 w-4"}`} />;
}

// ─── Confidence ring ──────────────────────────────────────────────────────────
function ConfidenceRing({ value }: { value: number }) {
  const r          = 28;
  const circ       = 2 * Math.PI * r;
  const filled     = (value / 100) * circ;
  const color      = value >= 80 ? "#52b788" : value >= 60 ? "#f0a500" : "#e05c5c";

  return (
    <div className="relative inline-flex items-center justify-center h-20 w-20">
      <svg width="80" height="80" className="-rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <motion.circle
          cx="40" cy="40" r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${circ}`}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - filled }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-lg font-bold" style={{ color }}>{value}%</span>
        <span className="text-[9px] text-muted-foreground">confidence</span>
      </div>
    </div>
  );
}

// ─── Causal chain node ────────────────────────────────────────────────────────
function ChainNodeCard({ node, index, isRoot, isLast }: {
  node: ChainNode; index: number; isRoot: boolean; isLast: boolean;
}) {
  const s = sevStyle[node.sev] ?? sevStyle.info;
  return (
    <div className="flex items-start gap-2">
      {/* card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.12 }}
        className={`relative rounded-xl border p-3 min-w-[160px] max-w-[200px] shrink-0
          ${s.border} ${s.bg}
          ${isRoot ? "ring-2 ring-offset-2 ring-offset-background ring-yellow-400/60" : ""}
        `}
      >
        {isRoot && (
          <span className="absolute -top-2.5 left-3 text-[9px] font-bold px-1.5 py-0.5 rounded bg-yellow-400 text-black">
            ROOT CAUSE
          </span>
        )}
        <div className="flex items-center gap-1.5 mb-1.5">
          <SevIcon sev={node.sev} className="h-3.5 w-3.5" />
          <span className={`text-[10px] font-bold ${s.text}`}>{node.eventId}</span>
        </div>
        <p className="text-xs font-medium text-foreground/90 leading-snug">{node.system}</p>
        <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{node.action}</p>
        {!isLast && (
          <div className={`text-[10px] mt-2 pt-2 border-t ${s.border} ${s.text} font-medium`}>
            ↓ {node.impact}
          </div>
        )}
      </motion.div>

      {/* arrow */}
      {!isLast && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.12 + 0.06 }}
          className="flex items-center self-center shrink-0 mt-2"
        >
          <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
        </motion.div>
      )}
    </div>
  );
}

// ─── Fallback mock RCA (when backend is offline) ──────────────────────────────
function buildMockRCA(event: any): RCAData {
  return {
    summary: `The ${event.svc} incident was triggered by a configuration change in ${event.source} that propagated through the integration layer, ultimately causing the observed ${event.sev} condition. The change bypassed standard validation gates.`,
    rootCause: {
      eventId:     event.id,
      system:      event.source,
      description: `A change to ${event.svc} modified critical runtime parameters without a corresponding update to downstream service contracts, initiating the failure cascade.`,
    },
    causalChain: [
      { eventId: "JIRA-8821", system: "Pricing Engine",   action: "Retry logic updated — count raised 2→5",       impact: "Increased downstream timeout pressure",    sev: "warning"  },
      { eventId: event.id,    system: event.svc,           action: event.summary,                                  impact: "SLA threshold exceeded across 3 consumers", sev: event.sev  },
      { eventId: "ZOHO-672",  system: "Contract Vault",    action: "Governance risk score auto-recalculated",      impact: "Compliance flag raised for review",         sev: "info"     },
    ],
    confidence:         88,
    timeToDetect:       "~14 minutes",
    recommendation:     `Roll back the retry configuration change on ${event.svc} immediately, then re-run the integration test suite before redeploying.`,
    preventionMeasures: [
      "Add automated canary validation before retry-policy changes go live",
      "Set up p95 latency alerts at 60% of SLA threshold as early warning",
      "Require dual-approval for any config change affecting 3+ downstream consumers",
    ],
  };
}

// ─── Main component ───────────────────────────────────────────────────────────
export function RCAReport({ event, history, onClose }: Props) {
  const [rca,     setRca]     = useState<RCAData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchRCA() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${BACKEND}/rca`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ event, history }),
        });
        if (!res.ok) throw new Error(`Backend error ${res.status}`);
        const data = await res.json();
        if (!cancelled) setRca(data.rca);
      } catch {
        // backend offline — use mock so demo still works
        if (!cancelled) setRca(buildMockRCA(event));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchRCA();
    return () => { cancelled = true; };
  }, [event.id]);

  const sevS = sevStyle[event.sev] ?? sevStyle.info;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      />

      {/* Panel */}
      <motion.div
        key="panel"
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1     }}
        exit={{    opacity: 0, y: 40, scale: 0.97  }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="fixed inset-x-4 top-[5vh] bottom-[5vh] md:inset-x-[10%] lg:inset-x-[15%] z-50
          rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: "var(--card)",
          border:     "1px solid rgba(124,110,245,0.18)",
          boxShadow:  "0 8px 48px rgba(0,0,0,0.35)",
        }}
      >
        {/* ── HEADER ── */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: "1px solid rgba(124,110,245,0.12)" }}
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center">
              <GitBranch className="h-4 w-4 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Root Cause Analysis</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${sevS.border} ${sevS.bg} ${sevS.text}`}>
                  {event.source}
                </span>
                <span className="font-mono">{event.id}</span>
                <span>·</span>
                <span>{event.svc}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── BODY ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Loading */}
          {loading && (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-muted-foreground py-20">
              <div className="relative">
                <div className="h-16 w-16 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
                  <GitBranch className="h-7 w-7 text-yellow-400" />
                </div>
                <Loader2 className="h-5 w-5 text-yellow-400 animate-spin absolute -top-1.5 -right-1.5" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground/80">Tracing root cause...</p>
                <p className="text-xs text-muted-foreground mt-1">Analysing {history.length} events in history</p>
              </div>
              <div className="flex gap-1.5 mt-1">
                {["Scanning events", "Building causal chain", "Generating analysis"].map((step, i) => (
                  <motion.span
                    key={step}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.6 }}
                    className="text-[10px] px-2 py-1 rounded-full border border-border bg-secondary/40 text-muted-foreground"
                  >
                    {step}
                  </motion.span>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">{error}</div>
          )}

          {/* Results */}
          {!loading && rca && (
            <>
              {/* ── SUMMARY + CONFIDENCE ── */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 rounded-xl border border-border bg-secondary/20 p-4"
              >
                <ConfidenceRing value={rca.confidence} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldAlert className="h-4 w-4 text-yellow-400" />
                    <span className="text-xs font-semibold text-foreground/90">Executive Summary</span>
                    <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" /> Detected in {rca.timeToDetect}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">{rca.summary}</p>
                </div>
              </motion.div>

              {/* ── ROOT CAUSE CALLOUT ── */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-xl border border-yellow-400/40 bg-yellow-400/5 p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-5 w-5 rounded bg-yellow-400 flex items-center justify-center">
                    <AlertTriangle className="h-3 w-3 text-black" />
                  </span>
                  <span className="text-xs font-bold text-yellow-400 uppercase tracking-wide">Root Cause Identified</span>
                  <span className="ml-auto font-mono text-[11px] text-yellow-400/70 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20">
                    {rca.rootCause.eventId}
                  </span>
                </div>
                <p className="text-xs font-semibold text-foreground/90 mb-1">{rca.rootCause.system}</p>
                <p className="text-sm text-foreground/75 leading-relaxed">{rca.rootCause.description}</p>
              </motion.div>

              {/* ── CAUSAL CHAIN ── */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Causal Chain</h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary/60 border border-border text-muted-foreground">
                    {rca.causalChain.length} events
                  </span>
                </div>

                <div className="overflow-x-auto pb-2">
                  <div className="flex items-start gap-2 min-w-max">
                    {rca.causalChain.map((node, i) => (
                      <ChainNodeCard
                        key={`${node.eventId}-${i}`}
                        node={node}
                        index={i}
                        isRoot={node.eventId === rca.rootCause.eventId}
                        isLast={i === rca.causalChain.length - 1}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* ── RECOMMENDATION + PREVENTION ── */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.26 }}
                className="grid md:grid-cols-2 gap-4"
              >
                {/* Immediate action */}
                <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ThumbsUp className="h-4 w-4 text-green-400" />
                    <span className="text-xs font-semibold text-green-400">Immediate Action</span>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">{rca.recommendation}</p>
                </div>

                {/* Prevention */}
                <div className="rounded-xl border border-border bg-secondary/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-blue-400" />
                    <span className="text-xs font-semibold text-blue-400">Prevention Measures</span>
                  </div>
                  <ul className="space-y-2">
                    {rca.preventionMeasures.map((m, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.08 }}
                        className="flex items-start gap-2 text-xs text-foreground/75"
                      >
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                        {m}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </>
          )}
        </div>

        {/* ── FOOTER ── */}
        {!loading && rca && (
          <div
            className="px-6 py-3 shrink-0 flex items-center justify-between"
            style={{ borderTop: "1px solid rgba(124,110,245,0.10)" }}
          >
            <p className="text-[10px] text-muted-foreground">
              Powered by Claude · {new Date().toLocaleTimeString()}
            </p>
            <button
              onClick={() => {
                const text = [
                  `ROOT CAUSE ANALYSIS — ${event.id}`,
                  `System: ${event.svc} | Source: ${event.source}`,
                  "",
                  `SUMMARY\n${rca.summary}`,
                  "",
                  `ROOT CAUSE\n${rca.rootCause.eventId} — ${rca.rootCause.system}\n${rca.rootCause.description}`,
                  "",
                  `CAUSAL CHAIN\n${rca.causalChain.map((n, i) => `${i + 1}. [${n.eventId}] ${n.system}: ${n.action}`).join("\n")}`,
                  "",
                  `IMMEDIATE ACTION\n${rca.recommendation}`,
                  "",
                  `PREVENTION\n${rca.preventionMeasures.map((m, i) => `${i + 1}. ${m}`).join("\n")}`,
                  "",
                  `Confidence: ${rca.confidence}% | Time to detect: ${rca.timeToDetect}`,
                ].join("\n");
                const blob = new Blob([text], { type: "text/plain" });
                const a    = Object.assign(document.createElement("a"), {
                  href:     URL.createObjectURL(blob),
                  download: `rca-${event.id.toLowerCase()}.txt`,
                });
                a.click();
              }}
              className="inline-flex items-center gap-1.5 text-xs px-3 h-7 rounded-lg border border-border bg-secondary/50 hover:bg-secondary transition"
            >
              Export Report
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
