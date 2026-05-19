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
};

interface BlastResult {
  source: string;
  affectedNodes: string[];
  affectedCount: number;
  prediction: string;
  severity: string;
  confidence: number;
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
    const msgs: Record<string, string> = {
      critical: "Critical incident detected — downstream services may experience cascading failures. Immediate intervention required.",
      warning:  "Degraded performance propagating through integration layer. Monitor downstream latency closely.",
      info:     "Configuration change propagated successfully. No adverse impact detected on downstream systems.",
      success:  "Deployment verified across integration chain. All downstream health checks passing.",
    };
    return {
      source,
      affectedNodes: affected,
      affectedCount: affected.length,
      prediction: msgs[sev] ?? msgs.info,
      severity: sev,
      confidence: sev === "critical" ? 94 : sev === "warning" ? 82 : 76,
    };
  }

  function handleNodeClick(node: ServiceNode) {
    runBlastRadius(node.source, "warning", `Manual blast radius analysis from ${node.label}`);
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

                  <p className="text-xs" style={{ color: "var(--foreground)" }}>{blastResult.prediction}</p>
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
          <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
            Simulate blast from:
          </span>
          {(["Azure", "MuleSoft", "Jira", "Zoho"] as const).map(src => (
            <button
              key={src}
              onClick={() => runBlastRadius(src, src === "MuleSoft" ? "critical" : "warning", `Simulated ${src} incident`)}
              className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-lg transition hover:opacity-80"
              style={{
                background: "rgba(124,110,245,0.08)",
                border: "1px solid rgba(124,110,245,0.18)",
                color: "#9b8ff5",
              }}
            >
              <ChevronRight className="h-2.5 w-2.5" />{src}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
