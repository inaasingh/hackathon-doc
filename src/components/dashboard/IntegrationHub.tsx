/**
 * IntegrationHub — tabbed view for all connected integrations.
 * Each tab shows that integration's live data + report actions.
 * Active integration controlled by parent via `activeIntegration` prop.
 */
import { useState, useEffect } from "react";
import {
  Ticket, AlertTriangle, CheckCircle2, Clock, Pause,
  RefreshCw, ExternalLink, ChevronDown, ChevronUp,
  AlertCircle, Users, BarChart3, Zap, FileDown,
  Loader2, FileSpreadsheet, Activity, GitBranch,
  Server, Cpu, MemoryStick, Radio, CloudCog,
} from "lucide-react";
import { generateZohoReport }      from "@/lib/zohoReportPdf";
import { generateHealthCheckXLSX } from "@/lib/xlsxHealthReport";
import {
  ZOHO_TICKETS, MULESOFT_APIS, MULESOFT_ALERTS,
  MULESOFT_SCHEDULERS, JIRA_TICKETS,
} from "@/data/mockIntegrationData";

// ── Integration config ─────────────────────────────────────────────────────
export type IntegrationId = "zoho" | "mulesoft" | "anypoint" | "jira" | "datadog";

export const INTEGRATIONS: {
  id: IntegrationId; label: string; shortLabel: string;
  color: string; bg: string; url: string; status: string;
}[] = [
  { id: "zoho",      label: "Zoho Desk",         shortLabel: "Zoho",      color: "#e05c5c", bg: "#ffeaea", url: "https://desk.zoho.in",              status: "Connected" },
  { id: "mulesoft",  label: "MuleSoft CloudHub",  shortLabel: "CloudHub",  color: "#002060", bg: "#e8eaf6", url: "https://anypoint.mulesoft.com/cloudhub", status: "Connected" },
  { id: "anypoint",  label: "Anypoint Studio",    shortLabel: "Anypoint",  color: "#1976d2", bg: "#e3f2fd", url: "https://anypoint.mulesoft.com",     status: "Connected" },
  { id: "jira",      label: "Jira",               shortLabel: "Jira",      color: "#0052cc", bg: "#e6f0ff", url: "https://www.atlassian.com/software/jira", status: "Connected" },
  { id: "datadog",   label: "Datadog",            shortLabel: "Datadog",   color: "#774aa4", bg: "#f3e8ff", url: "https://app.datadoghq.com",         status: "Connected" },
];

// ── Priority / Status colours ──────────────────────────────────────────────
const priorityCfg: Record<string, { col: string; bg: string }> = {
  Urgent:   { col: "#e05c5c", bg: "#ffeaea" },
  High:     { col: "#f0a500", bg: "#fff7e6" },
  Critical: { col: "#e05c5c", bg: "#ffeaea" },
  Medium:   { col: "#7c6ef5", bg: "#ede8ff" },
  Low:      { col: "#52b788", bg: "#edfaf3" },
};
const statusCfg: Record<string, { col: string; bg: string; Icon: typeof CheckCircle2 }> = {
  "Open":       { col: "#e05c5c", bg: "#ffeaea", Icon: AlertCircle  },
  "In Progress":{ col: "#7c6ef5", bg: "#ede8ff", Icon: Activity     },
  "In Review":  { col: "#f0a500", bg: "#fff7e6", Icon: Clock        },
  "On Hold":    { col: "#f0a500", bg: "#fff7e6", Icon: Pause        },
  "Done":       { col: "#52b788", bg: "#edfaf3", Icon: CheckCircle2 },
  "Resolved":   { col: "#52b788", bg: "#edfaf3", Icon: CheckCircle2 },
};

// ── Mock Datadog metrics ───────────────────────────────────────────────────
const DATADOG_MONITORS = [
  { name: "Order API — p95 Latency",          status: "ALERT",  value: "1.8s",  threshold: "< 800ms",  service: "p-orders-mb-api",       updated: "2m ago"  },
  { name: "CloudHub CPU Utilisation",          status: "OK",     value: "68%",   threshold: "< 80%",    service: "all-workers",           updated: "1m ago"  },
  { name: "CloudHub Memory Utilisation",       status: "OK",     value: "71%",   threshold: "< 80%",    service: "all-workers",           updated: "1m ago"  },
  { name: "MuleSoft Error Rate",               status: "WARN",   value: "3.8%",  threshold: "< 1%",     service: "s-salesforce-mb-api",   updated: "5m ago"  },
  { name: "Salesforce Connector Latency",      status: "WARN",   value: "1.2s",  threshold: "< 500ms",  service: "s-salesforce-mb-api",   updated: "8m ago"  },
  { name: "Inventory Sync Throughput",         status: "OK",     value: "99.8%", threshold: "> 99%",    service: "p-inventory-mb-api",    updated: "3m ago"  },
  { name: "Payment Gateway Error Rate",        status: "ALERT",  value: "12.4%", threshold: "< 0.5%",   service: "e-adyen-mb-api",        updated: "15m ago" },
  { name: "GCP Data Pipeline Lag",             status: "OK",     value: "0s",    threshold: "< 60s",    service: "s-gcp-ods-mb-api",      updated: "4m ago"  },
];

const DATADOG_METRICS = [
  { label: "Avg Response Time", value: "342ms",  delta: "+8ms",   up: true,  col: "#7c6ef5" },
  { label: "Error Rate",        value: "1.2%",   delta: "+0.4%",  up: true,  col: "#e05c5c" },
  { label: "Req / min",         value: "4,821",  delta: "+12%",   up: false, col: "#52b788" },
  { label: "Apdex Score",       value: "0.94",   delta: "-0.02",  up: true,  col: "#f0a500" },
];

const ANYPOINT_FLOWS = [
  { name: "MB-005 Orders → OMS Flow",           type: "API-Led", layer: "Process", status: "Running", lastRun: "2m ago",  calls: "1,240/day"  },
  { name: "MB-019 GCP Daily Sync",              type: "Batch",   layer: "Process", status: "Running", lastRun: "8h ago",  calls: "1/day"      },
  { name: "MB-040 Prima ↔ Manhattan Sync",      type: "Scheduler",layer: "System", status: "Running", lastRun: "28m ago", calls: "48/day"     },
  { name: "MB-061 Zigzag Returns Processor",    type: "Listener",layer: "System", status: "Running", lastRun: "4m ago",  calls: "143/day"    },
  { name: "MB-065 EOD Tulip-Prima Reconcile",   type: "Scheduler",layer: "System", status: "Running", lastRun: "11h ago", calls: "4/day"      },
  { name: "MB-066 Recoverable Order Retry",     type: "Scheduler",layer: "Process", status: "Running", lastRun: "6m ago",  calls: "144/day"    },
  { name: "SFSC Customer Sync",                 type: "API-Led", layer: "System", status: "Paused",  lastRun: "2h ago",  calls: "24/day"     },
  { name: "Adyen Payment Webhook Listener",     type: "Listener",layer: "Experience",status:"Running",lastRun: "1m ago",  calls: "320/day"    },
];

// ── Small reusable components ──────────────────────────────────────────────
function TabButton({ id, label, color, bg, active, onClick }: {
  id: string; label: string; color: string; bg: string;
  active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0"
      style={{
        background:  active ? bg   : "transparent",
        color:       active ? color : "var(--muted-foreground)",
        border:      active ? `1.5px solid ${color}44` : "1.5px solid transparent",
        boxShadow:   active ? `0 1px 6px ${color}22` : "none",
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {label}
    </button>
  );
}

function OpenBtn({ url, label }: { url: string; label: string }) {
  return (
    <a href={url} target="_blank" rel="noreferrer"
      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium text-white transition hover:opacity-90"
      style={{ background: "linear-gradient(135deg,#002060,#1a4a8a)" }}
    >
      <ExternalLink className="h-3 w-3" /> Open {label}
    </a>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB CONTENT: ZOHO DESK
// ══════════════════════════════════════════════════════════════════════════════
function ZohoTab() {
  const [expanded,   setExpanded]   = useState(false);
  const [generating, setGenerating] = useState(false);
  const visible = expanded ? ZOHO_TICKETS : ZOHO_TICKETS.slice(0, 5);
  const total    = ZOHO_TICKETS.length;
  const open     = ZOHO_TICKETS.filter(t => t.status === "Open").length;
  const onHold   = ZOHO_TICKETS.filter(t => t.status === "On Hold").length;
  const resolved = ZOHO_TICKETS.filter(t => t.status === "Resolved").length;

  function handlePdf() {
    setGenerating(true);
    setTimeout(() => { try { generateZohoReport(ZOHO_TICKETS); } finally { setGenerating(false); } }, 300);
  }

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Last 7 days · {total} tickets across 4 departments</p>
        <div className="flex gap-2">
          <button onClick={handlePdf} disabled={generating}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50 transition"
            style={{ background: "linear-gradient(135deg,#7c6ef5,#a78ef8)" }}>
            {generating ? <><Loader2 className="h-3 w-3 animate-spin" /> Generating…</> : <><FileDown className="h-3 w-3" /> Download PDF</>}
          </button>
          <OpenBtn url="https://desk.zoho.in" label="Zoho Desk" />
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-3">
        {[
          { label: "Total",    value: total,    col: "#7c6ef5", bg: "#ede8ff", Icon: Ticket       },
          { label: "Open",     value: open,     col: "#e05c5c", bg: "#ffeaea", Icon: AlertCircle  },
          { label: "On Hold",  value: onHold,   col: "#f0a500", bg: "#fff7e6", Icon: Pause        },
          { label: "Resolved", value: resolved, col: "#52b788", bg: "#edfaf3", Icon: CheckCircle2 },
        ].map(s => (
          <div key={s.label} className="flex-1 rounded-xl p-3 flex flex-col gap-1" style={{ background: s.bg, border: `1px solid ${s.col}33` }}>
            <s.Icon className="h-3.5 w-3.5" style={{ color: s.col }} />
            <p className="text-xl font-bold leading-none mt-1" style={{ color: s.col }}>{s.value}</p>
            <p className="text-[10px] font-medium" style={{ color: s.col, opacity: 0.75 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Ticket list */}
      <div className="space-y-1.5">
        {visible.map(t => {
          const sCfg = statusCfg[t.status] ?? statusCfg["Open"];
          const pCfg = priorityCfg[t.priority] ?? priorityCfg["Medium"];
          const StatusIcon = sCfg.Icon;
          return (
            <div key={t.id} className="flex items-start gap-3 rounded-xl p-3 hover:bg-secondary/40 transition border border-transparent hover:border-border">
              <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: sCfg.bg }}>
                <StatusIcon className="h-3.5 w-3.5" style={{ color: sCfg.col }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium leading-snug truncate" style={{ color: "var(--foreground)" }}>{t.subject}</p>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className="text-[10px] font-mono" style={{ color: "var(--muted-foreground)" }}>#{t.id}</span>
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: sCfg.bg, color: sCfg.col }}>{t.status}</span>
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: pCfg.bg, color: pCfg.col }}>{t.priority}</span>
                  <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{t.dept}</span>
                  <span className="text-[10px] ml-auto" style={{ color: "var(--muted-foreground)" }}>{t.age}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {ZOHO_TICKETS.length > 5 && (
        <button onClick={() => setExpanded(e => !e)}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium hover:bg-secondary/40 transition"
          style={{ border: "1px dashed rgba(124,110,245,0.20)", color: "var(--muted-foreground)" }}>
          {expanded ? <><ChevronUp className="h-3.5 w-3.5" /> Show less</> : <><ChevronDown className="h-3.5 w-3.5" /> Show {ZOHO_TICKETS.length - 5} more</>}
        </button>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB CONTENT: MULESOFT CLOUDHUB
// ══════════════════════════════════════════════════════════════════════════════
function MuleSoftTab() {
  const [generatingXlsx, setGeneratingXlsx] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const visibleApis = showAll ? MULESOFT_APIS : MULESOFT_APIS.slice(0, 8);

  return (
    <div className="space-y-5">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{MULESOFT_APIS.length} APIs · CloudHub Production · Anypoint Runtime Manager</p>
        <div className="flex gap-2">
          <button onClick={() => { setGeneratingXlsx(true); setTimeout(() => { try { generateHealthCheckXLSX(); } finally { setGeneratingXlsx(false); } }, 300); }}
            disabled={generatingXlsx}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50 transition"
            style={{ background: "linear-gradient(135deg,#002060,#1a4a8a)" }}>
            {generatingXlsx ? <><Loader2 className="h-3 w-3 animate-spin" /> Generating…</> : <><FileSpreadsheet className="h-3 w-3" /> Health Check XLSX</>}
          </button>
          <OpenBtn url="https://anypoint.mulesoft.com/cloudhub" label="CloudHub" />
        </div>
      </div>

      {/* Summary stats */}
      <div className="flex gap-3">
        {[
          { label: "Total APIs",  value: MULESOFT_APIS.length, col: "#002060", bg: "#e8eaf6" },
          { label: "Started",     value: MULESOFT_APIS.filter(a => a.status === "Started").length, col: "#52b788", bg: "#edfaf3" },
          { label: "Alerts",      value: MULESOFT_ALERTS.length, col: "#e05c5c", bg: "#ffeaea" },
          { label: "Schedulers",  value: MULESOFT_SCHEDULERS.filter(s => s.status === "Enabled").length, col: "#7c6ef5", bg: "#ede8ff" },
        ].map(s => (
          <div key={s.label} className="flex-1 rounded-xl p-3 flex flex-col gap-1" style={{ background: s.bg, border: `1px solid ${s.col}33` }}>
            <p className="text-xl font-bold leading-none" style={{ color: s.col }}>{s.value}</p>
            <p className="text-[10px] font-medium" style={{ color: s.col, opacity: 0.75 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* API list */}
      <div>
        <p className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: "var(--foreground)" }}>
          <Server className="h-3.5 w-3.5 text-primary" /> Deployed APIs
        </p>
        <div className="space-y-1">
          {visibleApis.map(api => (
            <div key={api.api} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/40 transition">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ background: "#52b788", boxShadow: "0 0 6px #52b78866" }} />
              <span className="text-xs font-mono flex-1" style={{ color: "var(--foreground)" }}>{api.api}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "#e8eaf6", color: "#002060", fontWeight: 600 }}>{api.workerSize}</span>
              <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{api.workers}w · v{api.runtime}</span>
            </div>
          ))}
        </div>
        {MULESOFT_APIS.length > 8 && (
          <button onClick={() => setShowAll(s => !s)}
            className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium hover:bg-secondary/40 transition"
            style={{ border: "1px dashed rgba(0,32,96,0.20)", color: "var(--muted-foreground)" }}>
            {showAll ? <><ChevronUp className="h-3.5 w-3.5" /> Collapse</> : <><ChevronDown className="h-3.5 w-3.5" /> Show all {MULESOFT_APIS.length} APIs</>}
          </button>
        )}
      </div>

      {/* Major Alerts */}
      <div>
        <p className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: "var(--foreground)" }}>
          <AlertTriangle className="h-3.5 w-3.5" style={{ color: "#e05c5c" }} /> Major Alerts This Week
        </p>
        <div className="space-y-2">
          {MULESOFT_ALERTS.map((a, i) => (
            <div key={i} className="rounded-xl p-3" style={{ background: "#ffeaea", border: "1px solid #e05c5c33" }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono font-bold" style={{ color: "#002060" }}>{a.api}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#e05c5c22", color: "#e05c5c" }}>{a.alerts}</span>
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: "#5a3a3a" }}>{a.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB CONTENT: ANYPOINT STUDIO
// ══════════════════════════════════════════════════════════════════════════════
function AnypointTab() {
  const layerColor = (l: string) => {
    if (l === "Experience") return { col: "#7c6ef5", bg: "#ede8ff" };
    if (l === "Process")    return { col: "#002060", bg: "#e8eaf6" };
    return                         { col: "#52b788", bg: "#edfaf3" };
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{ANYPOINT_FLOWS.length} flows · API-Led Connectivity · Anypoint Platform</p>
        <OpenBtn url="https://anypoint.mulesoft.com" label="Anypoint" />
      </div>

      {/* Layer summary */}
      <div className="flex gap-3">
        {[
          { label: "Experience", col: "#7c6ef5", bg: "#ede8ff" },
          { label: "Process",    col: "#002060", bg: "#e8eaf6" },
          { label: "System",     col: "#52b788", bg: "#edfaf3" },
        ].map(l => (
          <div key={l.label} className="flex-1 rounded-xl p-3" style={{ background: l.bg, border: `1px solid ${l.col}33` }}>
            <p className="text-lg font-bold" style={{ color: l.col }}>
              {ANYPOINT_FLOWS.filter(f => f.layer === l.label).length}
            </p>
            <p className="text-[10px] font-semibold mt-0.5" style={{ color: l.col, opacity: 0.75 }}>{l.label} Layer</p>
          </div>
        ))}
      </div>

      {/* Flow list */}
      <div className="space-y-1.5">
        {ANYPOINT_FLOWS.map((f, i) => {
          const lc = layerColor(f.layer);
          const running = f.status === "Running";
          return (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/40 transition border border-transparent hover:border-border">
              <span className="h-2 w-2 rounded-full shrink-0"
                style={{ background: running ? "#52b788" : "#f0a500", boxShadow: running ? "0 0 6px #52b78866" : "none" }} />
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
// TAB CONTENT: JIRA
// ══════════════════════════════════════════════════════════════════════════════
function JiraTab() {
  const done       = JIRA_TICKETS.filter(t => t.status === "Done").length;
  const inProgress = JIRA_TICKETS.filter(t => t.status === "In Progress").length;
  const open       = JIRA_TICKETS.filter(t => t.status === "Open").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{JIRA_TICKETS.length} issues · Sprint 47 · Platform Engineering board</p>
        <OpenBtn url="https://www.atlassian.com/software/jira" label="Jira" />
      </div>

      <div className="flex gap-3">
        {[
          { label: "Total",       value: JIRA_TICKETS.length, col: "#0052cc", bg: "#e6f0ff" },
          { label: "In Progress", value: inProgress,          col: "#7c6ef5", bg: "#ede8ff" },
          { label: "Open",        value: open,                col: "#e05c5c", bg: "#ffeaea" },
          { label: "Done",        value: done,                col: "#52b788", bg: "#edfaf3" },
        ].map(s => (
          <div key={s.label} className="flex-1 rounded-xl p-3 flex flex-col gap-1" style={{ background: s.bg, border: `1px solid ${s.col}33` }}>
            <p className="text-xl font-bold leading-none" style={{ color: s.col }}>{s.value}</p>
            <p className="text-[10px] font-medium" style={{ color: s.col, opacity: 0.75 }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        {JIRA_TICKETS.map(t => {
          const sCfg = statusCfg[t.status] ?? statusCfg["Open"];
          const pCfg = priorityCfg[t.priority] ?? priorityCfg["Medium"];
          const StatusIcon = sCfg.Icon;
          return (
            <div key={t.id} className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/40 transition border border-transparent hover:border-border">
              <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: sCfg.bg }}>
                <StatusIcon className="h-3.5 w-3.5" style={{ color: sCfg.col }} />
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
// TAB CONTENT: DATADOG
// ══════════════════════════════════════════════════════════════════════════════
function DatadogTab() {
  const alerts = DATADOG_MONITORS.filter(m => m.status === "ALERT").length;
  const warns  = DATADOG_MONITORS.filter(m => m.status === "WARN").length;
  const ok     = DATADOG_MONITORS.filter(m => m.status === "OK").length;

  function monitorColor(s: string) {
    if (s === "ALERT") return { col: "#e05c5c", bg: "#ffeaea" };
    if (s === "WARN")  return { col: "#f0a500", bg: "#fff7e6" };
    return                    { col: "#52b788", bg: "#edfaf3" };
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          {DATADOG_MONITORS.length} monitors · Infrastructure + APM · Last 1 hour
        </p>
        <OpenBtn url="https://app.datadoghq.com" label="Datadog" />
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-4 gap-3">
        {DATADOG_METRICS.map(m => (
          <div key={m.label} className="rounded-xl p-3" style={{ background: "var(--secondary)", border: "1px solid rgba(124,110,245,0.10)" }}>
            <p className="text-[10px] font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>{m.label}</p>
            <p className="text-lg font-bold leading-none" style={{ color: m.col }}>{m.value}</p>
            <p className="text-[10px] mt-1 font-medium" style={{ color: m.up ? "#e05c5c" : "#52b788" }}>{m.delta} vs 1h ago</p>
          </div>
        ))}
      </div>

      {/* Monitor status summary */}
      <div className="flex gap-3">
        {[
          { label: "Alerting", value: alerts, col: "#e05c5c", bg: "#ffeaea" },
          { label: "Warning",  value: warns,  col: "#f0a500", bg: "#fff7e6" },
          { label: "OK",       value: ok,     col: "#52b788", bg: "#edfaf3" },
        ].map(s => (
          <div key={s.label} className="flex-1 rounded-xl p-3" style={{ background: s.bg, border: `1px solid ${s.col}33` }}>
            <p className="text-xl font-bold leading-none" style={{ color: s.col }}>{s.value}</p>
            <p className="text-[10px] font-medium mt-1" style={{ color: s.col, opacity: 0.75 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Monitor list */}
      <div className="space-y-1.5">
        {DATADOG_MONITORS.map((m, i) => {
          const mc = monitorColor(m.status);
          return (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/40 transition border border-transparent hover:border-border">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 w-12 text-center"
                style={{ background: mc.bg, color: mc.col }}>{m.status}</span>
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
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
interface Props { activeIntegration?: IntegrationId; }

export function IntegrationHub({ activeIntegration }: Props) {
  const [activeTab, setActiveTab] = useState<IntegrationId>("zoho");

  // Sync to sidebar selection
  useEffect(() => {
    if (activeIntegration) setActiveTab(activeIntegration);
  }, [activeIntegration]);

  const current = INTEGRATIONS.find(i => i.id === activeTab)!;

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "var(--card)", border: "1px solid rgba(124,110,245,0.11)", boxShadow: "0 1px 4px rgba(124,110,245,0.06)" }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid rgba(124,110,245,0.08)" }}>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl flex items-center justify-center"
            style={{ background: current.bg }}>
            <CloudCog className="h-4 w-4" style={{ color: current.color }} />
          </div>
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              Integration Hub
            </h2>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              Connected systems · real-time data · auto-generated reports
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: "#edfaf3", color: "#52b788" }}>
            <span className="h-1.5 w-1.5 rounded-full bg-[#52b788] animate-pulse inline-block" />
            {INTEGRATIONS.length} CONNECTED
          </span>
        </div>
      </div>

      {/* ── Integration tabs ── */}
      <div className="flex items-center gap-1.5 px-5 py-3 overflow-x-auto"
        style={{ borderBottom: "1px solid rgba(124,110,245,0.08)", background: "var(--muted)" }}>
        {INTEGRATIONS.map(intg => (
          <TabButton
            key={intg.id}
            id={intg.id}
            label={intg.shortLabel}
            color={intg.color}
            bg={intg.bg}
            active={activeTab === intg.id}
            onClick={() => setActiveTab(intg.id)}
          />
        ))}
      </div>

      {/* ── Tab content ── */}
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
