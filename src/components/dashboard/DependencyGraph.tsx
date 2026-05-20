import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, AlertTriangle, Activity, RefreshCw, ChevronRight } from "lucide-react";

// ── Node definitions ─────────────────────────────────────────────────────────
interface ServiceNode {
  id: string;
  label: string;
  sublabel: string;
  x: number;
  y: number;
  color: string;
  icon: string;
  source: string; // matches event.source
}

const NODES: ServiceNode[] = [
  { id: "azure",     label: "Azure DevOps", sublabel: "CI/CD Pipeline",    x: 80,  y: 130, color: "#52b788", icon: "⚙️", source: "Azure"     },
  { id: "jira",      label: "Jira",         sublabel: "Project Tracking",  x: 80,  y: 260, color: "#4da8da", icon: "📋", source: "Jira"      },
  { id: "mulesoft",  label: "MuleSoft",     sublabel: "API Gateway",       x: 260, y: 80,  color: "#e05c5c", icon: "🔁", source: "MuleSoft"  },
  { id: "orderapi",  label: "Order API",    sublabel: "Core Service",      x: 260, y: 240, color: "#f0a500", icon: "🛒", source: "MuleSoft"  },
  { id: "salesforce",label: "Salesforce",   sublabel: "CRM Platform",      x: 430, y: 130, color: "#9b8ff5", icon: "☁️", source: "Salesforce"},
  { id: "zoho",      label: "Zoho Desk",    sublabel: "Support Tickets",   x: 430, y: 260, color: "#f0a500", icon: "🎫", source: "Zoho"      },
];

// ── Directed edges (from → to) ───────────────────────────────────────────────
const EDGES: Array<{ from: string; to: string; label?: string }> = [
  { from: "azure",      to: "mulesoft",   label: "deploys"   },
  { from: "azure",      to: "orderapi",   label: "triggers"  },
  { from: "jira",       to: "orderapi",   label: "tickets"   },
  { from: "mulesoft",   to: "salesforce", label: "syncs"     },
  { from: "mulesoft",   to: "zoho",       label: "routes"    },
  { from: "orderapi",   to: "salesforce", label: "updates"   },
  { from: "orderapi",   to: "zoho",       label: "notifies"  },
];

// SOURCE → which node IDs are affected downstream
const BLAST_MAP: Record<string, string[]> = {
  Azure:      ["azure", "mulesoft", "orderapi", "salesforce", "zoho"],
  MuleSoft:   ["mulesoft", "salesforce", "zoho"],
  Jira:       ["jira", "orderapi", "salesforce", "zoho"],
  Zoho:       ["zoho"],
  Salesforce: ["salesforce", "zoho"],
  OrderAPI:   ["orderapi", "salesforce", "zoho"],
};

// Per-source realistic mock predictions
const BLAST_SCENARIOS: Record<string, {
  critical?: { prediction: string; confidence: number; detail: string };
  warning?:  { prediction: string; confidence: number; detail: string };
  info?:     { prediction: string; confidence: number; detail: string };
  success?:  { prediction: string; confidence: number; detail: string };
}> = {
  Azure: {
    critical: {
      prediction: "CI/CD pipeline failure detected. Deployments to MuleSoft and Order API are blocked — 3 release candidates queued. Rollback to build #1142 recommended immediately.",
      confidence: 96,
      detail: "Build agent pool exhausted · 2 failed pipelines · last deploy 14m ago",
    },
    warning: {
      prediction: "Deployment pipeline running slower than baseline. MuleSoft API gateway may receive a delayed build artifact — expect 12–18 min propagation lag to Order API and Salesforce.",
      confidence: 84,
      detail: "Agent queue depth: 7 · avg build time up 38% · no failures yet",
    },
    info: {
      prediction: "Azure DevOps configuration change pushed. No deployments triggered — downstream systems unaffected. Change log updated in Jira automatically.",
      confidence: 91,
      detail: "Policy update · branch permissions changed · no active pipelines affected",
    },
    success: {
      prediction: "Release-147 deployed successfully through the full integration chain. MuleSoft, Order API and Salesforce health checks all passing. Zoho ticket volume stable.",
      confidence: 99,
      detail: "Deploy time: 4m 12s · all gates passed · no rollback required",
    },
  },
  MuleSoft: {
    critical: {
      prediction: "Circuit breaker tripped on the Order API integration flow. Payment confirmations failing for ~40% of transactions. Salesforce CRM updates halted and Zoho ticket queue growing rapidly.",
      confidence: 94,
      detail: "Error rate: 67% · circuit breaker open · last success 8m ago · 214 failed requests",
    },
    warning: {
      prediction: "MuleSoft API gateway latency elevated to 1.8s p95 — SLA threshold is 1.2s. Downstream Order API response times degrading. Salesforce sync delay now at 4–6 minutes.",
      confidence: 88,
      detail: "p95 latency: 1.8s · p99: 3.1s · 12 timeout errors in last 5 min",
    },
    info: {
      prediction: "MuleSoft connector version updated. New retry policy active — downstream systems will see improved resilience on transient failures. No performance impact detected.",
      confidence: 78,
      detail: "Connector v4.2.1 → v4.3.0 · retry policy: 3x with backoff · tested on staging",
    },
    success: {
      prediction: "MuleSoft runtime restarted cleanly after scheduled maintenance. All 30 API flows active. Order API, Salesforce and Zoho connections re-established with zero message loss.",
      confidence: 97,
      detail: "Runtime uptime: 99.98% · all flows green · 0 messages dropped during restart",
    },
  },
  Jira: {
    critical: {
      prediction: "Jira webhook delivery failing — Order API is not receiving ticket status updates. Sprint board shows 9 stalled items. Risk of SLA breach on 3 P1 tickets if not resolved in 45 min.",
      confidence: 89,
      detail: "Webhook failures: 23 · last delivery: 41m ago · 3 P1 tickets at risk",
    },
    warning: {
      prediction: "Jira ticket sync to Order API running behind schedule. 14 tickets created in the last hour have not triggered downstream workflows. Manual review recommended.",
      confidence: 81,
      detail: "Sync lag: 22 min · queue depth: 14 · no data loss, just delayed",
    },
    info: {
      prediction: "Jira sprint planning completed. 18 new tickets assigned to the MuleSoft integration team — expect increased Order API activity over the next 5 business days.",
      confidence: 74,
      detail: "New sprint: 18 tickets · 6 high priority · 2 escalated from last sprint",
    },
    success: {
      prediction: "Jira–Order API integration verified. All 47 tickets from the current sprint are correctly synced. Automation rules firing as expected across all downstream workflows.",
      confidence: 98,
      detail: "47 tickets synced · 0 failures · automation rules: 12 active",
    },
  },
  Zoho: {
    critical: {
      prediction: "Zoho Desk ticket ingestion halted. Customer-facing support queue not updating. 31 new tickets stuck in processing — client SLAs at immediate risk for Clarks and Mulberry accounts.",
      confidence: 92,
      detail: "Queue blocked · 31 tickets pending · Clarks SLA breaches in 18 min",
    },
    warning: {
      prediction: "Zoho response times elevated — ticket classification taking 3x longer than normal. AI draft responses delayed. Recommend checking Groq API rate limits and Zoho org health.",
      confidence: 79,
      detail: "Response time: 4.2s avg · AI queue: 8 pending · rate limit at 72%",
    },
    info: {
      prediction: "Zoho Desk department configuration updated. Ticket routing rules refreshed for Mulberry and Clarks teams. No impact on existing open tickets.",
      confidence: 83,
      detail: "3 departments updated · routing rules: 7 changed · effective immediately",
    },
    success: {
      prediction: "Zoho Desk operating normally. 92 tickets resolved this week, 7 open. AI urgency scoring active — average score 64/100. All client SLAs within threshold.",
      confidence: 99,
      detail: "92 resolved · 7 open · avg urgency: 64 · SLA compliance: 97.4%",
    },
  },
  Salesforce: {
    critical: {
      prediction: "Salesforce CRM sync failed — Order API updates are not reaching customer records. Revenue reporting data stale by 2+ hours. Billing module may show incorrect figures until resolved.",
      confidence: 91,
      detail: "Sync error: AUTH_TOKEN_EXPIRED · 847 records not updated · billing impacted",
    },
    warning: {
      prediction: "Salesforce API rate limit at 78% of daily allocation. Order API sync may be throttled within 3 hours. Consider batching non-urgent CRM updates to avoid hitting the cap.",
      confidence: 85,
      detail: "API calls today: 78,240 / 100,000 · peak usage at 14:00 UTC · 3h remaining",
    },
    info: {
      prediction: "Salesforce opportunity records updated from Order API sync. 142 new orders reflected in CRM. Pipeline value updated — no manual reconciliation required.",
      confidence: 88,
      detail: "142 records synced · pipeline delta: +£84,200 · sync duration: 1m 12s",
    },
    success: {
      prediction: "Salesforce–Order API integration operating at peak performance. Sub-second sync latency. All customer records up to date. Zoho Desk ticket linkage verified for open accounts.",
      confidence: 99,
      detail: "Sync latency: 0.3s avg · 100% record match · 0 conflicts in last 24h",
    },
  },
  OrderAPI: {
    critical: {
      prediction: "Order API returning HTTP 500 errors on checkout flow — affecting 35–40% of transactions. Salesforce order records stalling and Zoho support tickets spiking. Likely payment gateway issue.",
      confidence: 93,
      detail: "Error rate: 38% · 500 errors on /checkout/confirm · started 7m ago",
    },
    warning: {
      prediction: "Order API p95 latency at 2.1s — above the 1.5s SLA threshold. Downstream Salesforce CRM sync queuing up. Customer-facing checkout experiencing intermittent slowness.",
      confidence: 86,
      detail: "p95: 2.1s · p99: 4.4s · Salesforce queue: 23 pending updates",
    },
    info: {
      prediction: "Order API maintenance window completed. New product catalogue endpoints deployed. Salesforce and Zoho connectors operating with updated field mappings.",
      confidence: 82,
      detail: "v2.4.1 deployed · 3 new endpoints · field mappings updated in Salesforce",
    },
    success: {
      prediction: "Order API fully operational after incident recovery. All 1,240 failed transactions reprocessed. Salesforce records reconciled and Zoho tickets auto-resolved.",
      confidence: 99,
      detail: "1,240 reprocessed · 0 data loss · Salesforce: in sync · Zoho: 8 auto-closed",
    },
  },
};

interface BlastResult {
  source: string;
  affectedNodes: string[];
  affectedCount: number;
  prediction: string;
  severity: string;
  confidence: number;
  detail?: string;
}

function getNodeCenter(node: ServiceNode) {
  return { cx: node.x + 52, cy: node.y + 30 };
}

// Midpoint for edge label
function midpoint(n1: ServiceNode, n2: ServiceNode) {
  const a = getNodeCenter(n1);
  const b = getNodeCenter(n2);
  return { mx: (a.cx + b.cx) / 2, my: (a.cy + b.cy) / 2 };
}

// ── Animated edge pulse dot ───────────────────────────────────────────────────
function PulseDot({ from, to, color, active }: { from: ServiceNode; to: ServiceNode; color: string; active: boolean }) {
  const a = getNodeCenter(from);
  const b = getNodeCenter(to);
  const dur = 1.6 + Math.random() * 0.8;

  if (!active) return null;
  return (
    <circle r="4" fill={color} opacity="0.9">
      <animateMotion dur={`${dur}s`} repeatCount="indefinite" calcMode="linear">
        <mpath xlinkHref={`#edge-${from.id}-${to.id}`} />
      </animateMotion>
    </circle>
  );
}

export function DependencyGraph({ liveEvents = [] }: { liveEvents?: any[] }) {
  const [blastResult, setBlastResult]   = useState<BlastResult | null>(null);
  const [activeNodes, setActiveNodes]   = useState<Set<string>>(new Set());
  const [analyzing,  setAnalyzing]      = useState(false);
  const [lastEventId, setLastEventId]   = useState<string | null>(null);
  const [hovered,    setHovered]        = useState<string | null>(null);
  const prevLenRef = useRef(0);

  // ── Auto-trigger on new live event ────────────────────────────────────────
  useEffect(() => {
    if (!liveEvents.length) return;
    const newest = liveEvents[0];
    if (!newest?.id || newest.id === lastEventId) return;
    if (liveEvents.length <= prevLenRef.current) return;
    prevLenRef.current = liveEvents.length;
    setLastEventId(newest.id);
    runBlastRadius(newest.source, newest.sev, newest.summary);
  }, [liveEvents.length]);

  async function runBlastRadius(source: string, sev: string, summary: string) {
    setAnalyzing(true);
    const affected = BLAST_MAP[source] ?? ["mulesoft"];
    setActiveNodes(new Set(affected));

    try {
      const r = await fetch("http://localhost:3001/blast-radius", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, sev, summary, affectedNodes: affected }),
      });
      if (r.ok) {
        const data = await r.json();
        setBlastResult(data);
      } else {
        setBlastResult(mockBlast(source, affected, sev));
      }
    } catch {
      setBlastResult(mockBlast(source, affected, sev));
    }
    setAnalyzing(false);
  }

  function mockBlast(source: string, affected: string[], sev: string): BlastResult {
    const scenario = BLAST_SCENARIOS[source]?.[sev as keyof typeof BLAST_SCENARIOS[string]];
    const fallbackMsgs: Record<string, string> = {
      critical: "Critical incident detected — downstream services may experience cascading failures. Immediate intervention required.",
      warning:  "Degraded performance propagating through the integration layer. Monitor downstream latency closely.",
      info:     "Configuration change propagated. No adverse impact detected on downstream systems.",
      success:  "Deployment verified across the integration chain. All downstream health checks passing.",
    };
    return {
      source,
      affectedNodes: affected,
      affectedCount: affected.length,
      prediction: scenario?.prediction ?? fallbackMsgs[sev] ?? fallbackMsgs.info,
      severity: sev,
      confidence: scenario?.confidence ?? (sev === "critical" ? 94 : sev === "warning" ? 82 : 76),
      detail: scenario?.detail,
    };
  }

  // Map node id → source key for scenario lookup
  const NODE_SOURCE_MAP: Record<string, string> = {
    azure:      "Azure",
    jira:       "Jira",
    mulesoft:   "MuleSoft",
    orderapi:   "OrderAPI",
    salesforce: "Salesforce",
    zoho:       "Zoho",
  };

  // Each node gets its own realistic severity when clicked
  const NODE_DEFAULT_SEV: Record<string, string> = {
    azure:      "success",
    jira:       "warning",
    mulesoft:   "critical",
    orderapi:   "warning",
    salesforce: "warning",
    zoho:       "info",
  };

  function handleNodeClick(node: ServiceNode) {
    const src = NODE_SOURCE_MAP[node.id] ?? node.source;
    const sev = NODE_DEFAULT_SEV[node.id] ?? "warning";
    const affected = BLAST_MAP[src] ?? [node.id];
    setActiveNodes(new Set(affected));
    setBlastResult(mockBlast(src, affected, sev));
  }

  function clearBlast() {
    setActiveNodes(new Set());
    setBlastResult(null);
  }

  const sevColor: Record<string, string> = {
    critical: "#e05c5c", warning: "#f0a500", success: "#52b788", info: "#4da8da",
  };

  const blastColor = blastResult ? (sevColor[blastResult.severity] ?? "#9b8ff5") : "#9b8ff5";

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--card)",
        border: "1px solid rgba(124,110,245,0.11)",
        boxShadow: "0 1px 4px rgba(124,110,245,0.06)",
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid rgba(124,110,245,0.08)" }}
      >
        <div>
          <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
            <Zap className="h-4 w-4 text-[#9b8ff5]" />
            Cross-System Dependency Intelligence
            {activeNodes.size > 0 && (
              <span
                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse"
                style={{ background: `${blastColor}18`, color: blastColor }}
              >
                <span className="h-1.5 w-1.5 rounded-full inline-block" style={{ background: blastColor }} />
                BLAST RADIUS ACTIVE
              </span>
            )}
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            Click any node to trace AI blast radius · Auto-triggers on live events
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeNodes.size > 0 && (
            <button
              onClick={clearBlast}
              className="text-xs px-3 py-1.5 rounded-xl transition hover:bg-secondary"
              style={{ border: "1px solid rgba(124,110,245,0.15)", color: "var(--muted-foreground)" }}
            >
              Clear
            </button>
          )}
          {analyzing && (
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "#9b8ff5" }}>
              <RefreshCw className="h-3 w-3 animate-spin" />
              Analysing…
            </div>
          )}
        </div>
      </div>

      <div className="p-5 flex flex-col gap-4">

        {/* ── SVG graph ── */}
        <div className="relative rounded-xl overflow-hidden" style={{ background: "var(--background)", border: "1px solid rgba(124,110,245,0.08)" }}>
          <svg
            viewBox="0 0 560 360"
            style={{ width: "100%", display: "block" }}
          >
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="rgba(124,110,245,0.4)" />
              </marker>
              <marker id="arrow-active" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill={blastColor} />
              </marker>
              {/* filters */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* ── Edges ── */}
            {EDGES.map(edge => {
              const fn = NODES.find(n => n.id === edge.from)!;
              const tn = NODES.find(n => n.id === edge.to)!;
              const a  = getNodeCenter(fn);
              const b  = getNodeCenter(tn);
              const isActive = activeNodes.has(edge.from) && activeNodes.has(edge.to);
              const { mx, my } = midpoint(fn, tn);
              return (
                <g key={`${edge.from}-${edge.to}`}>
                  <path
                    id={`edge-${edge.from}-${edge.to}`}
                    d={`M ${a.cx} ${a.cy} L ${b.cx} ${b.cy}`}
                    stroke={isActive ? blastColor : "rgba(124,110,245,0.25)"}
                    strokeWidth={isActive ? 2 : 1.5}
                    fill="none"
                    markerEnd={isActive ? "url(#arrow-active)" : "url(#arrow)"}
                    strokeDasharray={isActive ? "none" : "4 3"}
                    style={{ filter: isActive ? "url(#glow)" : "none", transition: "all 0.4s ease" }}
                  />
                  {edge.label && (
                    <text
                      x={mx} y={my - 5}
                      textAnchor="middle"
                      fontSize="8"
                      fill="rgba(124,110,245,0.5)"
                      fontFamily="system-ui, sans-serif"
                    >
                      {edge.label}
                    </text>
                  )}
                  {/* Animated pulse dot on active edges */}
                  {isActive && <PulseDot from={fn} to={tn} color={blastColor} active={true} />}
                </g>
              );
            })}

            {/* ── Nodes ── */}
            {NODES.map(node => {
              const isActive  = activeNodes.has(node.id);
              const isHovered = hovered === node.id;
              const col       = isActive ? blastColor : node.color;
              const { cx, cy } = getNodeCenter(node);

              return (
                <g
                  key={node.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleNodeClick(node)}
                  onMouseEnter={() => setHovered(node.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* Outer glow ring when active */}
                  {isActive && (
                    <circle
                      cx={cx} cy={cy} r={40}
                      fill="none"
                      stroke={blastColor}
                      strokeWidth="1.5"
                      opacity="0.3"
                      style={{ filter: "url(#glow)" }}
                    >
                      <animate attributeName="r" values="34;44;34" dur="1.8s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.3;0.1;0.3" dur="1.8s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Node card background */}
                  <rect
                    x={node.x} y={node.y}
                    width={104} height={60}
                    rx={10}
                    fill={isActive ? `${blastColor}15` : isHovered ? `${node.color}12` : "var(--card, #1e1a2e)"}
                    stroke={isActive ? blastColor : isHovered ? node.color : `${node.color}50`}
                    strokeWidth={isActive ? 2 : 1.5}
                    style={{ transition: "all 0.3s ease", filter: isActive ? "url(#glow)" : "none" }}
                  />

                  {/* Severity dot top-right */}
                  {isActive && (
                    <circle cx={node.x + 96} cy={node.y + 8} r={5} fill={blastColor}>
                      <animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Icon */}
                  <text x={node.x + 10} y={node.y + 24} fontSize="14" style={{ userSelect: "none" }}>{node.icon}</text>

                  {/* Label */}
                  <text
                    x={node.x + 28} y={node.y + 22}
                    fontSize="9" fontWeight="700"
                    fill={isActive ? blastColor : "var(--foreground, #f0ece8)"}
                    fontFamily="system-ui, sans-serif"
                    style={{ transition: "fill 0.3s ease" }}
                  >
                    {node.label}
                  </text>

                  {/* Sublabel */}
                  <text
                    x={node.x + 10} y={node.y + 38}
                    fontSize="7.5"
                    fill={isActive ? `${blastColor}cc` : "rgba(150,140,200,0.7)"}
                    fontFamily="system-ui, sans-serif"
                  >
                    {node.sublabel}
                  </text>

                  {/* Status bar at bottom of node */}
                  <rect
                    x={node.x + 8} y={node.y + 48}
                    width={isActive ? 88 : 44}
                    height={4} rx={2}
                    fill={isActive ? blastColor : `${node.color}60`}
                    style={{ transition: "all 0.5s ease" }}
                  />
                </g>
              );
            })}

            {/* Legend */}
            <g>
              <circle cx={18} cy={340} r={4} fill="rgba(124,110,245,0.5)" />
              <text x={27} y={344} fontSize="8" fill="rgba(124,110,245,0.6)" fontFamily="system-ui, sans-serif">normal flow</text>
              <circle cx={100} cy={340} r={4} fill={blastColor || "#e05c5c"} />
              <text x={109} y={344} fontSize="8" fill="rgba(124,110,245,0.6)" fontFamily="system-ui, sans-serif">blast radius</text>
              <text x={220} y={344} fontSize="8" fill="rgba(124,110,245,0.4)" fontFamily="system-ui, sans-serif">click any node to analyse →</text>
            </g>
          </svg>
        </div>

        {/* ── Blast Radius Result Card ── */}
        <AnimatePresence>
          {blastResult && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="rounded-xl p-4"
              style={{
                background: `${blastColor}10`,
                border: `1px solid ${blastColor}35`,
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${blastColor}20` }}
                >
                  <AlertTriangle className="h-4 w-4" style={{ color: blastColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold" style={{ color: blastColor }}>
                      AI Blast Radius · {blastResult.affectedCount} systems affected
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: `${blastColor}20`, color: blastColor }}>
                        {blastResult.confidence}% confidence
                      </span>
                    </div>
                  </div>

                  {/* Affected node chips */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {blastResult.affectedNodes.map(nid => {
                      const node = NODES.find(n => n.id === nid);
                      if (!node) return null;
                      return (
                        <span key={nid} className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md"
                          style={{ background: `${blastColor}15`, color: blastColor, border: `1px solid ${blastColor}30` }}>
                          {node.icon} {node.label}
                        </span>
                      );
                    })}
                  </div>

                  <p className="text-xs mb-2" style={{ color: "var(--foreground)" }}>{blastResult.prediction}</p>
                  {blastResult.detail && (
                    <p className="text-[10px] font-mono px-2 py-1 rounded-lg" style={{ color: blastColor, background: `${blastColor}10`, opacity: 0.85 }}>
                      {blastResult.detail}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Empty state ── */}
        {!blastResult && !analyzing && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: "rgba(124,110,245,0.05)", border: "1px dashed rgba(124,110,245,0.15)" }}>
            <Activity className="h-4 w-4 shrink-0" style={{ color: "#9b8ff5" }} />
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              <strong style={{ color: "#9b8ff5" }}>Click any node</strong> to run AI blast radius analysis — or fire a webhook to auto-trigger dependency tracing across all connected systems.
            </p>
          </div>
        )}

        {/* ── Quick trigger row ── */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-semibold uppercase tracking-wide shrink-0" style={{ color: "var(--muted-foreground)" }}>
            Simulate:
          </span>
          {([
            { src: "Azure",      sev: "success",  label: "Azure Deploy"   },
            { src: "MuleSoft",   sev: "critical", label: "MuleSoft Down"  },
            { src: "Jira",       sev: "warning",  label: "Jira Lag"       },
            { src: "OrderAPI",   sev: "critical", label: "Order API 500"  },
            { src: "Salesforce", sev: "warning",  label: "SF Rate Limit"  },
            { src: "Zoho",       sev: "info",     label: "Zoho Update"    },
          ] as const).map(({ src, sev, label }) => {
            const col = sev === "critical" ? "#e05c5c" : sev === "warning" ? "#f0a500" : sev === "success" ? "#52b788" : "#4da8da";
            const affected = BLAST_MAP[src] ?? [src.toLowerCase()];
            return (
              <button
                key={src}
                onClick={() => { setActiveNodes(new Set(affected)); setBlastResult(mockBlast(src, affected, sev)); }}
                className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-lg transition hover:opacity-80"
                style={{
                  background: `${col}12`,
                  border: `1px solid ${col}35`,
                  color: col,
                }}
              >
                <ChevronRight className="h-2.5 w-2.5" />{label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
