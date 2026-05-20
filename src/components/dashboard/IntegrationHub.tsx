import { useState, useEffect, useCallback } from "react";
import {
  Ticket, AlertTriangle, CheckCircle2, Clock, Pause,
  ExternalLink, ChevronDown, ChevronUp,
  AlertCircle, BarChart3, Loader2,
  Activity, CloudCog, Wifi, WifiOff, X, Download,
  Server, Zap, Brain, Radio,
} from "lucide-react";
import {
  MULESOFT_APIS, MULESOFT_ALERTS,
  MULESOFT_SCHEDULERS, JIRA_TICKETS,
} from "@/data/mockIntegrationData";
import { useTicketPipeline } from "@/hooks/useTicketPipeline";

const BACKEND = "http://localhost:3001";

export type IntegrationId = "zoho" | "mulesoft" | "anypoint" | "jira" | "datadog";

export const INTEGRATIONS: {
  id: IntegrationId; label: string; shortLabel: string;
  color: string; bg: string; url: string;
}[] = [
  { id: "zoho",      label: "Zoho Desk",        shortLabel: "Zoho",      color: "#e05c5c", bg: "#ffeaea", url: "https://desk.zoho.in"               },
  { id: "mulesoft",  label: "MuleSoft CloudHub", shortLabel: "CloudHub",  color: "#002060", bg: "#e8eaf6", url: "https://anypoint.mulesoft.com/cloudhub" },
  { id: "anypoint",  label: "Anypoint Studio",   shortLabel: "Anypoint",  color: "#1976d2", bg: "#e3f2fd", url: "https://anypoint.mulesoft.com"      },
  { id: "jira",      label: "Jira",              shortLabel: "Jira",      color: "#0052cc", bg: "#e6f0ff", url: "https://www.atlassian.com/software/jira" },
  { id: "datadog",   label: "Datadog",           shortLabel: "Datadog",   color: "#774aa4", bg: "#f3e8ff", url: "https://app.datadoghq.com"          },
];

const priorityCfg: Record<string, { col: string; bg: string }> = {
  Urgent: { col: "#e05c5c", bg: "#ffeaea" }, High: { col: "#f0a500", bg: "#fff7e6" },
  Critical:{ col:"#e05c5c", bg:"#ffeaea" }, Medium:{ col:"#7c6ef5", bg:"#ede8ff" },
  Low:    { col: "#52b788", bg: "#edfaf3" },
};
const statusCfg: Record<string, { col: string; bg: string; Icon: any }> = {
  "Open":        { col: "#e05c5c", bg: "#ffeaea", Icon: AlertCircle  },
  "In Progress": { col: "#7c6ef5", bg: "#ede8ff", Icon: Activity     },
  "On Hold":     { col: "#f0a500", bg: "#fff7e6", Icon: Pause        },
  "Done":        { col: "#52b788", bg: "#edfaf3", Icon: CheckCircle2 },
  "Resolved":    { col: "#52b788", bg: "#edfaf3", Icon: CheckCircle2 },
};

// ── Shared: AI Report Modal ───────────────────────────────────────────────────
function ReportModal({ system, stats, items, onClose }: {
  system: string; stats: any; items: any[]; onClose: () => void;
}) {
  const [report,   setReport]   = useState("");
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${BACKEND}/report`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ system, stats, items }),
        });
        const d = await r.json();
        setReport(d.report || "Failed to generate report.");
      } catch {
        setReport("Could not reach backend.\nMake sure the server is running:\n  cd server && node index.js");
      }
      setLoading(false);
    })();
  }, []);

  function download() {
    const blob = new Blob([report], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${system}-governance-report-${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
  }

  const intg = INTEGRATIONS.find(i => i.id === system);
  const col  = intg?.color ?? "#9b8ff5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-xl max-h-[85vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "var(--card)", border: `1px solid ${col}30` }}>
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: `1px solid ${col}15` }}>
          <div>
            <h3 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
              {intg?.label ?? system} — AI Governance Report
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              Generated · {new Date().toDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {report && !loading && (
              <button onClick={download}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold text-white"
                style={{ background: `linear-gradient(135deg,${col},${col}cc)` }}>
                <Download className="h-3 w-3" /> Download
              </button>
            )}
            <button onClick={onClose} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-secondary transition">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
        {/* body */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
              <Loader2 className="h-7 w-7 animate-spin" style={{ color: col }} />
              <p className="text-xs">Generating AI report from live data…</p>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap text-xs leading-6 font-sans" style={{ color: "var(--foreground)" }}>
              {report}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Shared: Stats row ─────────────────────────────────────────────────────────
function StatCards({ cards }: { cards: { label: string; value: number | string; col: string; bg: string; Icon?: any }[] }) {
  return (
    <div className="flex gap-3">
      {cards.map(s => (
        <div key={s.label} className="flex-1 rounded-xl p-3 flex flex-col gap-1"
          style={{ background: s.bg, border: `1px solid ${s.col}33` }}>
          {s.Icon && <s.Icon className="h-3.5 w-3.5 mb-0.5" style={{ color: s.col }} />}
          <p className="text-xl font-bold leading-none" style={{ color: s.col }}>{s.value}</p>
          <p className="text-[10px] font-medium" style={{ color: s.col, opacity: 0.75 }}>{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ── Shared: Tab header row ────────────────────────────────────────────────────
function TabHeader({ subtitle, url, label, isLive, onReport, system, stats, items }: {
  subtitle: string; url: string; label: string; isLive: boolean;
  onReport: () => void; system: string; stats: any; items: any[];
}) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{subtitle}</p>
        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold mt-1 px-1.5 py-0.5 rounded-full`}
          style={{
            background: isLive ? "rgba(82,183,136,0.10)" : "rgba(240,165,0,0.10)",
            color: isLive ? "#52b788" : "#f0a500",
            border: `1px solid ${isLive ? "rgba(82,183,136,0.25)" : "rgba(240,165,0,0.25)"}`,
          }}>
          {isLive ? <Wifi className="h-2.5 w-2.5" /> : <WifiOff className="h-2.5 w-2.5" />}
          {isLive ? "Live data" : "Mock data"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onReport}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-semibold text-white hover:opacity-90 transition"
          style={{ background: "linear-gradient(135deg,#7c6ef5,#a78ef8)" }}>
          <BarChart3 className="h-3 w-3" /> Generate Report
        </button>
        <a href={url} target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium text-white transition hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#002060,#1a4a8a)" }}>
          <ExternalLink className="h-3 w-3" /> Open {label}
        </a>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ZOHO TAB — Real-time pipeline via WebSocket
// ══════════════════════════════════════════════════════════════════════════════
function ZohoTab() {
  const { tickets, stats, status, lastEvent, processing } = useTicketPipeline();
  const [expanded,    setExpanded]    = useState(false);
  const [showReport,  setShowReport]  = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  const isLive   = status === "connected";
  const visible  = expanded ? tickets : tickets.slice(0, 6);
  const liveStats = stats ?? {
    total: tickets.length,
    open:  tickets.filter(t => t.status === "Open").length,
    onHold: tickets.filter(t => t.status === "On Hold").length,
    resolved: tickets.filter(t => ["Resolved","Closed"].includes(t.status)).length,
  };

  return (
    <div className="space-y-4">
      {showReport && <ReportModal system="zoho" stats={liveStats} items={tickets} onClose={() => setShowReport(false)} />}
      {selectedTicket && <TicketDetailModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />}

      {/* Header */}
      <TabHeader
        subtitle={`${liveStats.total} tickets · Synapse Pipeline`}
        url="https://desk.zoho.in" label="Zoho Desk"
        isLive={isLive} onReport={() => setShowReport(true)}
        system="zoho" stats={liveStats} items={tickets}
      />

      {/* Pipeline status bar */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
        style={{
          background: status === "connected" ? "rgba(82,183,136,0.06)" : "rgba(240,165,0,0.06)",
          border: `1px solid ${status === "connected" ? "rgba(82,183,136,0.2)" : "rgba(240,165,0,0.2)"}`,
        }}>
        <Radio className="h-3 w-3 shrink-0" style={{ color: status === "connected" ? "#52b788" : "#f0a500" }} />
        <span style={{ color: status === "connected" ? "#52b788" : "#f0a500" }}>
          {status === "connected" ? "Pipeline live" : status === "connecting" ? "Connecting…" : "Pipeline offline — run: node pipeline.js"}
        </span>
        {processing && (
          <span className="flex items-center gap-1 ml-auto" style={{ color: "#9b8ff5" }}>
            <Loader2 className="h-3 w-3 animate-spin" />
            <Brain className="h-3 w-3" />
            AI processing…
          </span>
        )}
        {lastEvent && !processing && (
          <span className="ml-auto text-[10px] truncate max-w-[200px]" style={{ color: "var(--muted-foreground)" }}>
            {lastEvent}
          </span>
        )}
      </div>

      {/* Drop-zone hint */}
      <div className="rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs"
        style={{ background: "rgba(124,110,245,0.05)", border: "1px dashed rgba(124,110,245,0.2)" }}>
        <Zap className="h-3.5 w-3.5 shrink-0" style={{ color: "#9b8ff5" }} />
        <span style={{ color: "var(--muted-foreground)" }}>
          Drop any <code className="px-1 rounded" style={{ background: "var(--muted)" }}>.json</code> ticket file into{" "}
          <code className="px-1 rounded" style={{ background: "var(--muted)" }}>server/data/inbox/</code>{" "}
          → AI auto-classifies &amp; updates here in real-time. Use{" "}
          <strong style={{ color: "#9b8ff5" }}>sample-new-ticket.json</strong> to test.
        </span>
      </div>

      {/* Stats */}
      <StatCards cards={[
        { label: "Total",    value: liveStats.total,    col: "#7c6ef5", bg: "#ede8ff", Icon: Ticket       },
        { label: "Open",     value: liveStats.open,     col: "#e05c5c", bg: "#ffeaea", Icon: AlertCircle  },
        { label: "On Hold",  value: liveStats.onHold,   col: "#f0a500", bg: "#fff7e6", Icon: Pause        },
        { label: "Resolved", value: liveStats.resolved, col: "#52b788", bg: "#edfaf3", Icon: CheckCircle2 },
      ]} />

      {/* Avg urgency bar */}
      {stats && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--muted)" }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${stats.avgUrgency}%`,
                background: stats.avgUrgency > 75 ? "#e05c5c" : stats.avgUrgency > 50 ? "#f0a500" : "#52b788",
              }} />
          </div>
          <span className="text-[10px] font-semibold shrink-0" style={{ color: "var(--muted-foreground)" }}>
            Avg AI urgency: <strong style={{ color: stats.avgUrgency > 75 ? "#e05c5c" : "#f0a500" }}>{stats.avgUrgency}</strong>/100
          </span>
        </div>
      )}

      {/* Ticket list */}
      {status === "connecting" && tickets.length === 0 ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground py-4">
          <Loader2 className="h-4 w-4 animate-spin" /> Connecting to pipeline…
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map((t: any) => {
            const sCfg = statusCfg[t.status] ?? statusCfg["Open"];
            const pCfg = priorityCfg[t.priority] ?? priorityCfg["Medium"];
            const SI   = sCfg.Icon;
            const ai   = t.aiAnalysis;

            return (
              <button key={t.id}
                onClick={() => setSelectedTicket(t)}
                className="w-full text-left rounded-xl p-3 hover:bg-secondary/40 transition border border-transparent hover:border-border"
                style={{ background: t.isEscalated ? "rgba(224,92,92,0.04)" : "transparent" }}>
                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: sCfg.bg }}>
                    <SI className="h-3.5 w-3.5" style={{ color: sCfg.col }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium leading-snug truncate" style={{ color: "var(--foreground)" }}>{t.subject}</p>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className="text-[10px] font-mono" style={{ color: "var(--muted-foreground)" }}>#{t.id}</span>
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: sCfg.bg, color: sCfg.col }}>{t.status}</span>
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: pCfg.bg, color: pCfg.col }}>{t.priority}</span>
                      <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{t.department?.name ?? ""}</span>
                      {t.isEscalated && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#ffeaea", color: "#e05c5c" }}>ESCALATED</span>
                      )}
                    </div>
                    {/* AI urgency bar */}
                    {ai && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <Brain className="h-2.5 w-2.5 shrink-0" style={{ color: "#9b8ff5" }} />
                        <div className="flex-1 h-1 rounded-full" style={{ background: "var(--muted)" }}>
                          <div className="h-full rounded-full"
                            style={{
                              width: `${ai.urgencyScore}%`,
                              background: ai.urgencyScore > 80 ? "#e05c5c" : ai.urgencyScore > 60 ? "#f0a500" : "#52b788",
                            }} />
                        </div>
                        <span className="text-[9px] font-semibold shrink-0" style={{ color: "var(--muted-foreground)" }}>
                          {ai.urgencyScore}/100
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] shrink-0 mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                    {new Date(t.createdTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {tickets.length > 6 && (
        <button onClick={() => setExpanded(e => !e)}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium hover:bg-secondary/40 transition"
          style={{ border: "1px dashed rgba(124,110,245,0.20)", color: "var(--muted-foreground)" }}>
          {expanded ? <><ChevronUp className="h-3.5 w-3.5" /> Show less</> : <><ChevronDown className="h-3.5 w-3.5" /> Show {tickets.length - 6} more</>}
        </button>
      )}
    </div>
  );
}

// ── Ticket detail modal with AI analysis ─────────────────────────────────────
function TicketDetailModal({ ticket, onClose }: { ticket: any; onClose: () => void }) {
  const ai  = ticket.aiAnalysis;
  const sCfg = statusCfg[ticket.status] ?? statusCfg["Open"];
  const pCfg = priorityCfg[ticket.priority] ?? priorityCfg["Medium"];
  const SI   = sCfg.Icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "var(--card)", border: "1px solid rgba(124,110,245,0.2)" }}>

        {/* Header */}
        <div className="flex items-start gap-3 px-5 py-4 shrink-0"
          style={{ borderBottom: "1px solid rgba(124,110,245,0.08)" }}>
          <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: sCfg.bg }}>
            <SI className="h-4 w-4" style={{ color: sCfg.col }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-snug" style={{ color: "var(--foreground)" }}>{ticket.subject}</p>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="text-[10px] font-mono font-bold" style={{ color: "#9b8ff5" }}>#{ticket.id}</span>
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: sCfg.bg, color: sCfg.col }}>{ticket.status}</span>
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: pCfg.bg, color: pCfg.col }}>{ticket.priority}</span>
            </div>
          </div>
          <button onClick={onClose} className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-secondary transition shrink-0">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Description */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "var(--muted-foreground)" }}>Description</p>
            <p className="text-xs leading-5" style={{ color: "var(--foreground)" }}>{ticket.description}</p>
          </div>

          {/* Contact + Dept */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3" style={{ background: "var(--background)", border: "1px solid rgba(124,110,245,0.08)" }}>
              <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "var(--muted-foreground)" }}>Contact</p>
              <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>{ticket.contact?.firstName} {ticket.contact?.lastName}</p>
              <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{ticket.contact?.email}</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: "var(--background)", border: "1px solid rgba(124,110,245,0.08)" }}>
              <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "var(--muted-foreground)" }}>Department</p>
              <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>{ticket.department?.name}</p>
              <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{ticket.channel} · {ticket.classification}</p>
            </div>
          </div>

          {/* AI Analysis */}
          {ai && (
            <div className="rounded-xl p-4 space-y-3"
              style={{ background: "rgba(155,143,245,0.06)", border: "1px solid rgba(155,143,245,0.2)" }}>
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4" style={{ color: "#9b8ff5" }} />
                <p className="text-xs font-bold" style={{ color: "#9b8ff5" }}>AI Analysis — Groq LLaMA 3</p>
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold"
                  style={{ background: ai.urgencyScore > 80 ? "#ffeaea" : ai.urgencyScore > 60 ? "#fff7e6" : "#edfaf3",
                           color: ai.urgencyScore > 80 ? "#e05c5c" : ai.urgencyScore > 60 ? "#f0a500" : "#52b788" }}>
                  Urgency {ai.urgencyScore}/100
                </span>
              </div>

              <div>
                <p className="text-[10px] font-semibold mb-1" style={{ color: "var(--muted-foreground)" }}>PATTERN DETECTED</p>
                <p className="text-xs" style={{ color: "var(--foreground)" }}>{ai.pattern}</p>
              </div>

              {ai.riskFlag && (
                <div className="flex items-start gap-2 rounded-lg px-3 py-2"
                  style={{ background: "rgba(224,92,92,0.08)", border: "1px solid rgba(224,92,92,0.2)" }}>
                  <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5 text-[#e05c5c]" />
                  <p className="text-[11px]" style={{ color: "#e05c5c" }}>{ai.riskFlag}</p>
                </div>
              )}

              <div>
                <p className="text-[10px] font-semibold mb-1.5" style={{ color: "var(--muted-foreground)" }}>AI DRAFT RESPONSE</p>
                <div className="rounded-lg p-3 text-xs leading-5"
                  style={{ background: "var(--card)", border: "1px solid rgba(124,110,245,0.12)", color: "var(--foreground)" }}>
                  {ai.draftResponse}
                </div>
              </div>

              <div className="flex items-center gap-4 text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                <span>Est. resolution: <strong style={{ color: "var(--foreground)" }}>{ai.estimatedResolutionHours}h</strong></span>
                <span>Category: <strong style={{ color: "var(--foreground)" }}>{ai.category}</strong></span>
                <span className="ml-auto">Processed: {new Date(ai.processedAt).toLocaleTimeString("en-GB")}</span>
              </div>
            </div>
          )}

          {/* Resolution if closed */}
          {ticket.resolution && (
            <div className="rounded-xl p-3" style={{ background: "rgba(82,183,136,0.06)", border: "1px solid rgba(82,183,136,0.2)" }}>
              <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "#52b788" }}>Resolution</p>
              <p className="text-xs" style={{ color: "var(--foreground)" }}>{ticket.resolution}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MULESOFT TAB
// ══════════════════════════════════════════════════════════════════════════════
function MuleSoftTab() {
  const [services,   setServices]   = useState<any[]>([]);
  const [isLive,     setIsLive]     = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [showAll,    setShowAll]    = useState(false);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${BACKEND}/health/integrations`);
        if (r.ok) { const d = await r.json(); setServices(d.services ?? []); setIsLive(true); }
      } catch {}
      setLoading(false);
    })();
  }, []);

  // Merge backend health with mock API list for display
  const apis    = MULESOFT_APIS;
  const visible = showAll ? apis : apis.slice(0, 8);
  const stats   = {
    total:      apis.length,
    running:    apis.filter(a => a.status === "Started").length,
    alerts:     MULESOFT_ALERTS.length,
    schedulers: MULESOFT_SCHEDULERS.filter(s => s.status === "Enabled").length,
  };

  return (
    <div className="space-y-5">
      {showReport && <ReportModal system="mulesoft" stats={stats} items={[...apis.slice(0,10), ...MULESOFT_ALERTS]} onClose={() => setShowReport(false)} />}

      <TabHeader subtitle={`${apis.length} APIs · CloudHub Production`} url="https://anypoint.mulesoft.com/cloudhub" label="CloudHub"
        isLive={isLive} onReport={() => setShowReport(true)} system="mulesoft" stats={stats} items={apis} />

      {/* Backend health cards if live */}
      {!loading && services.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {services.slice(0, 3).map(s => {
            const up = parseFloat(s.uptime);
            const col = up >= 99 ? "#52b788" : up >= 95 ? "#f0a500" : "#e05c5c";
            return (
              <div key={s.name} className="rounded-xl p-3" style={{ background: "var(--secondary)", border: `1px solid ${col}30` }}>
                <p className="text-[10px] font-semibold truncate mb-1" style={{ color: "var(--muted-foreground)" }}>{s.name}</p>
                <p className="text-sm font-bold" style={{ color: col }}>{s.uptime}%</p>
                <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{s.latency} · {s.err} err</p>
              </div>
            );
          })}
        </div>
      )}

      <StatCards cards={[
        { label: "Total APIs",  value: stats.total,      col: "#002060", bg: "#e8eaf6" },
        { label: "Running",     value: stats.running,    col: "#52b788", bg: "#edfaf3" },
        { label: "Alerts",      value: stats.alerts,     col: "#e05c5c", bg: "#ffeaea" },
        { label: "Schedulers",  value: stats.schedulers, col: "#7c6ef5", bg: "#ede8ff" },
      ]} />

      <div>
        <p className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: "var(--foreground)" }}>
          <Server className="h-3.5 w-3.5 text-primary" /> Deployed APIs
        </p>
        <div className="space-y-1">
          {visible.map((api: any) => (
            <div key={api.api} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/40 transition">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ background: "#52b788", boxShadow: "0 0 6px #52b78866" }} />
              <span className="text-xs font-mono flex-1" style={{ color: "var(--foreground)" }}>{api.api}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: "#e8eaf6", color: "#002060" }}>{api.workerSize}</span>
              <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{api.workers}w · v{api.runtime}</span>
            </div>
          ))}
        </div>
        {apis.length > 8 && (
          <button onClick={() => setShowAll(s => !s)}
            className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium hover:bg-secondary/40 transition"
            style={{ border: "1px dashed rgba(0,32,96,0.20)", color: "var(--muted-foreground)" }}>
            {showAll ? <><ChevronUp className="h-3.5 w-3.5" /> Collapse</> : <><ChevronDown className="h-3.5 w-3.5" /> Show all {apis.length} APIs</>}
          </button>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: "var(--foreground)" }}>
          <AlertTriangle className="h-3.5 w-3.5" style={{ color: "#e05c5c" }} /> Active Alerts
        </p>
        {MULESOFT_ALERTS.map((a: any, i: number) => (
          <div key={i} className="rounded-xl p-3 mb-2" style={{ background: "#ffeaea", border: "1px solid #e05c5c33" }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono font-bold" style={{ color: "#002060" }}>{a.api}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#e05c5c22", color: "#e05c5c" }}>{a.alerts} alerts</span>
            </div>
            <p className="text-[11px] leading-relaxed" style={{ color: "#5a3a3a" }}>{a.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ANYPOINT TAB
// ══════════════════════════════════════════════════════════════════════════════
const ANYPOINT_FLOWS = [
  { name: "MB-005 Orders → OMS Flow",           type: "API-Led",   layer: "Process",    status: "Running", lastRun: "2m ago",  calls: "1,240/day" },
  { name: "MB-019 GCP Daily Sync",              type: "Batch",     layer: "Process",    status: "Running", lastRun: "8h ago",  calls: "1/day"     },
  { name: "MB-040 Prima ↔ Manhattan Sync",      type: "Scheduler", layer: "System",     status: "Running", lastRun: "28m ago", calls: "48/day"    },
  { name: "MB-061 Zigzag Returns Processor",    type: "Listener",  layer: "System",     status: "Running", lastRun: "4m ago",  calls: "143/day"   },
  { name: "MB-065 EOD Tulip-Prima Reconcile",   type: "Scheduler", layer: "System",     status: "Running", lastRun: "11h ago", calls: "4/day"     },
  { name: "MB-066 Recoverable Order Retry",     type: "Scheduler", layer: "Process",    status: "Running", lastRun: "6m ago",  calls: "144/day"   },
  { name: "SFSC Customer Sync",                 type: "API-Led",   layer: "System",     status: "Paused",  lastRun: "2h ago",  calls: "24/day"    },
  { name: "Adyen Payment Webhook Listener",     type: "Listener",  layer: "Experience", status: "Running", lastRun: "1m ago",  calls: "320/day"   },
];

function AnypointTab() {
  const [showReport, setShowReport] = useState(false);
  const running = ANYPOINT_FLOWS.filter(f => f.status === "Running").length;
  const paused  = ANYPOINT_FLOWS.filter(f => f.status === "Paused").length;
  const stats   = { total: ANYPOINT_FLOWS.length, running, paused };

  const layerColor = (l: string) => {
    if (l === "Experience") return { col: "#7c6ef5", bg: "#ede8ff" };
    if (l === "Process")    return { col: "#002060", bg: "#e8eaf6" };
    return                         { col: "#52b788", bg: "#edfaf3" };
  };

  return (
    <div className="space-y-5">
      {showReport && <ReportModal system="anypoint" stats={stats} items={ANYPOINT_FLOWS} onClose={() => setShowReport(false)} />}

      <TabHeader subtitle={`${ANYPOINT_FLOWS.length} flows · API-Led Connectivity`} url="https://anypoint.mulesoft.com" label="Anypoint"
        isLive={false} onReport={() => setShowReport(true)} system="anypoint" stats={stats} items={ANYPOINT_FLOWS} />

      <StatCards cards={[
        { label: "Total Flows", value: ANYPOINT_FLOWS.length, col: "#1976d2", bg: "#e3f2fd" },
        { label: "Running",     value: running,               col: "#52b788", bg: "#edfaf3" },
        { label: "Paused",      value: paused,                col: "#f0a500", bg: "#fff7e6" },
        { label: "Experience",  value: ANYPOINT_FLOWS.filter(f=>f.layer==="Experience").length, col: "#7c6ef5", bg: "#ede8ff" },
      ]} />

      <div className="space-y-1.5">
        {ANYPOINT_FLOWS.map((f, i) => {
          const lc = layerColor(f.layer);
          return (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/40 transition border border-transparent hover:border-border">
              <span className="h-2 w-2 rounded-full shrink-0"
                style={{ background: f.status === "Running" ? "#52b788" : "#f0a500", boxShadow: f.status === "Running" ? "0 0 6px #52b78866" : "none" }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: "var(--foreground)" }}>{f.name}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>{f.type} · {f.calls}</p>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0" style={{ background: lc.bg, color: lc.col }}>{f.layer}</span>
              <span className="text-[10px] shrink-0" style={{ color: "var(--muted-foreground)" }}>{f.lastRun}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// JIRA TAB
// ══════════════════════════════════════════════════════════════════════════════
function JiraTab() {
  const [allTeams,   setAllTeams]   = useState<any[]>([]);
  const [isLive,     setIsLive]     = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${BACKEND}/api/teams`);
        if (r.ok) { const d = await r.json(); if (d.teams?.length) { setAllTeams(d.teams); setIsLive(d.teams.some((t:any)=>t.live)); } }
      } catch {}
      setLoading(false);
    })();
  }, []);

  // Aggregate jira stats from teams or fall back to mock
  const jiraStats = allTeams.length > 0
    ? allTeams.reduce((acc, t) => ({
        total:      acc.total      + (t.jira?.total      ?? 0),
        open:       acc.open       + (t.jira?.open       ?? 0),
        inProgress: acc.inProgress + (t.jira?.inProgress ?? 0),
        done:       acc.done       + (t.jira?.done       ?? 0),
        critical:   acc.critical   + (t.jira?.critical   ?? 0),
      }), { total: 0, open: 0, inProgress: 0, done: 0, critical: 0 })
    : { total: JIRA_TICKETS.length, open: JIRA_TICKETS.filter(t=>t.status==="Open").length,
        inProgress: JIRA_TICKETS.filter(t=>t.status==="In Progress").length,
        done: JIRA_TICKETS.filter(t=>t.status==="Done").length, critical: 0 };

  const displayTickets = JIRA_TICKETS;

  return (
    <div className="space-y-4">
      {showReport && <ReportModal system="jira" stats={jiraStats} items={displayTickets} onClose={() => setShowReport(false)} />}

      <TabHeader subtitle={`${jiraStats.total} issues · ${allTeams.length || 1} teams`} url="https://www.atlassian.com/software/jira" label="Jira"
        isLive={isLive} onReport={() => setShowReport(true)} system="jira" stats={jiraStats} items={displayTickets} />

      {loading ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Fetching Jira data…
        </div>
      ) : (
        <StatCards cards={[
          { label: "Total",       value: jiraStats.total,      col: "#0052cc", bg: "#e6f0ff" },
          { label: "In Progress", value: jiraStats.inProgress, col: "#7c6ef5", bg: "#ede8ff" },
          { label: "Open",        value: jiraStats.open,       col: "#e05c5c", bg: "#ffeaea" },
          { label: "Done",        value: jiraStats.done,       col: "#52b788", bg: "#edfaf3" },
        ]} />
      )}

      <div className="space-y-1.5">
        {displayTickets.map((t: any) => {
          const sCfg = statusCfg[t.status] ?? statusCfg["Open"];
          const pCfg = priorityCfg[t.priority] ?? priorityCfg["Medium"];
          const SI   = sCfg.Icon;
          return (
            <div key={t.id} className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/40 transition border border-transparent hover:border-border">
              <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: sCfg.bg }}>
                <SI className="h-3.5 w-3.5" style={{ color: sCfg.col }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium leading-snug" style={{ color: "var(--foreground)" }}>{t.summary}</p>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className="text-[10px] font-mono font-bold" style={{ color: "#0052cc" }}>{t.id}</span>
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: sCfg.bg, color: sCfg.col }}>{t.status}</span>
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: pCfg.bg, color: pCfg.col }}>{t.priority}</span>
                  <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{t.sprint}</span>
                  <span className="text-[10px] ml-auto" style={{ color: "var(--muted-foreground)" }}>{t.updated}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DATADOG TAB
// ══════════════════════════════════════════════════════════════════════════════
const DATADOG_MONITORS = [
  { name: "Order API — p95 Latency",     status: "ALERT", value: "1.8s",  threshold: "< 800ms", service: "p-orders-mb-api",     updated: "2m ago"  },
  { name: "CloudHub CPU Utilisation",    status: "OK",    value: "68%",   threshold: "< 80%",   service: "all-workers",         updated: "1m ago"  },
  { name: "CloudHub Memory",             status: "OK",    value: "71%",   threshold: "< 80%",   service: "all-workers",         updated: "1m ago"  },
  { name: "MuleSoft Error Rate",         status: "WARN",  value: "3.8%",  threshold: "< 1%",    service: "s-salesforce-mb-api", updated: "5m ago"  },
  { name: "Salesforce Connector",        status: "WARN",  value: "1.2s",  threshold: "< 500ms", service: "s-salesforce-mb-api", updated: "8m ago"  },
  { name: "Inventory Sync Throughput",   status: "OK",    value: "99.8%", threshold: "> 99%",   service: "p-inventory-mb-api",  updated: "3m ago"  },
  { name: "Payment Gateway Error Rate",  status: "ALERT", value: "12.4%", threshold: "< 0.5%",  service: "e-adyen-mb-api",      updated: "15m ago" },
  { name: "GCP Data Pipeline Lag",       status: "OK",    value: "0s",    threshold: "< 60s",   service: "s-gcp-ods-mb-api",    updated: "4m ago"  },
];

function DatadogTab() {
  const [services,   setServices]   = useState<any[]>([]);
  const [isLive,     setIsLive]     = useState(false);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${BACKEND}/health/integrations`);
        if (r.ok) { const d = await r.json(); setServices(d.services ?? []); setIsLive(true); }
      } catch {}
    })();
  }, []);

  const alerts = DATADOG_MONITORS.filter(m => m.status === "ALERT").length;
  const warns  = DATADOG_MONITORS.filter(m => m.status === "WARN").length;
  const ok     = DATADOG_MONITORS.filter(m => m.status === "OK").length;
  const stats  = { total: DATADOG_MONITORS.length, alerts, warns, ok };

  function monitorColor(s: string) {
    if (s === "ALERT") return { col: "#e05c5c", bg: "#ffeaea" };
    if (s === "WARN")  return { col: "#f0a500", bg: "#fff7e6" };
    return                    { col: "#52b788", bg: "#edfaf3" };
  }

  return (
    <div className="space-y-5">
      {showReport && <ReportModal system="datadog" stats={stats} items={DATADOG_MONITORS} onClose={() => setShowReport(false)} />}

      <TabHeader subtitle={`${DATADOG_MONITORS.length} monitors · Infrastructure + APM`} url="https://app.datadoghq.com" label="Datadog"
        isLive={isLive} onReport={() => setShowReport(true)} system="datadog" stats={stats} items={DATADOG_MONITORS} />

      {/* Live backend health if available */}
      {services.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {services.slice(0, 3).map(s => {
            const up = parseFloat(s.uptime);
            const col = up >= 99 ? "#52b788" : up >= 95 ? "#f0a500" : "#e05c5c";
            return (
              <div key={s.name} className="rounded-xl p-3" style={{ background: "var(--secondary)", border: `1px solid ${col}30` }}>
                <p className="text-[10px] font-semibold truncate mb-1" style={{ color: "var(--muted-foreground)" }}>{s.name}</p>
                <p className="text-sm font-bold" style={{ color: col }}>{s.uptime}%</p>
                <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{s.latency}</p>
              </div>
            );
          })}
        </div>
      )}

      <StatCards cards={[
        { label: "Monitors",  value: stats.total,  col: "#774aa4", bg: "#f3e8ff" },
        { label: "Alerting",  value: alerts,       col: "#e05c5c", bg: "#ffeaea" },
        { label: "Warning",   value: warns,        col: "#f0a500", bg: "#fff7e6" },
        { label: "OK",        value: ok,           col: "#52b788", bg: "#edfaf3" },
      ]} />

      <div className="space-y-1.5">
        {DATADOG_MONITORS.map((m, i) => {
          const mc = monitorColor(m.status);
          return (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/40 transition border border-transparent hover:border-border">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 w-12 text-center" style={{ background: mc.bg, color: mc.col }}>{m.status}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: "var(--foreground)" }}>{m.name}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>{m.service}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-bold" style={{ color: mc.col }}>{m.value}</p>
                <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{m.threshold}</p>
              </div>
              <span className="text-[10px] shrink-0 w-14 text-right" style={{ color: "var(--muted-foreground)" }}>{m.updated}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB BUTTON
// ══════════════════════════════════════════════════════════════════════════════
function TabButton({ id, label, color, bg, active, onClick }: {
  id: string; label: string; color: string; bg: string; active: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0"
      style={{
        background: active ? bg : "transparent",
        color:      active ? color : "var(--muted-foreground)",
        border:     active ? `1.5px solid ${color}44` : "1.5px solid transparent",
        boxShadow:  active ? `0 1px 6px ${color}22` : "none",
      }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />{label}
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════════════════
interface Props { activeIntegration?: IntegrationId; }

export function IntegrationHub({ activeIntegration }: Props) {
  const [activeTab, setActiveTab] = useState<IntegrationId>("zoho");

  useEffect(() => { if (activeIntegration) setActiveTab(activeIntegration); }, [activeIntegration]);

  const current = INTEGRATIONS.find(i => i.id === activeTab)!;

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "var(--card)", border: "1px solid rgba(124,110,245,0.11)", boxShadow: "0 1px 4px rgba(124,110,245,0.06)" }}>

      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(124,110,245,0.08)" }}>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ background: current.bg }}>
            <CloudCog className="h-4 w-4" style={{ color: current.color }} />
          </div>
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Integration Hub</h2>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              Connected systems · real-time data · auto-generated reports
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: "#edfaf3", color: "#52b788" }}>
          <span className="h-1.5 w-1.5 rounded-full bg-[#52b788] animate-pulse inline-block" />
          {INTEGRATIONS.length} CONNECTED
        </span>
      </div>

      <div className="flex items-center gap-1.5 px-5 py-3 overflow-x-auto"
        style={{ borderBottom: "1px solid rgba(124,110,245,0.08)", background: "var(--muted)" }}>
        {INTEGRATIONS.map(intg => (
          <TabButton key={intg.id} id={intg.id} label={intg.shortLabel}
            color={intg.color} bg={intg.bg} active={activeTab === intg.id} onClick={() => setActiveTab(intg.id)} />
        ))}
      </div>

      <div className="p-5">
        {activeTab === "zoho"     && <ZohoTab />}
        {activeTab === "mulesoft" && <MuleSoftTab />}
        {activeTab === "anypoint" && <AnypointTab />}
        {activeTab === "jira"     && <JiraTab />}
        {activeTab === "datadog"  && <DatadogTab />}
      </div>
    </div>
  );
}
