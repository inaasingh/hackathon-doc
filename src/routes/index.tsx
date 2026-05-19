import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { EventStream } from "@/components/dashboard/EventStream";
import { AIWorkspace } from "@/components/dashboard/AIWorkspace";
import { WebhookTrigger } from "@/components/dashboard/WebhookTrigger";
import { IntegrationHealth } from "@/components/dashboard/IntegrationHealth";
import { Schedules } from "@/components/dashboard/Schedules";
import { Recommendations } from "@/components/dashboard/Recommendations";
import { ChatAssistant } from "@/components/dashboard/ChatAssistant";
import { QuickReports } from "@/components/dashboard/QuickReports";
import { DependencyGraph } from "@/components/dashboard/DependencyGraph";
import { IntegrationHub } from "@/components/dashboard/IntegrationHub";
import { MinecraftPlayground } from "@/components/dashboard/MinecraftPlayground";
import type { IntegrationId } from "@/components/dashboard/IntegrationHub";
import { mockEvents } from "@/data/mockEvents";
import {
  Bell, Search, AlertCircle, CheckCircle2, Clock,
  ArrowRight, Sun, Moon, Gamepad2,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";

const DEFAULT_EVENT = mockEvents[0];

const healthItems = [
  { name: "Order API",       pct: 65, status: "critical" },
  { name: "Inventory Sync",  pct: 99, status: "healthy"  },
  { name: "Pricing Engine",  pct: 92, status: "healthy"  },
  { name: "CRM Sync",        pct: 79, status: "warning"  },
  { name: "MuleSoft",        pct: 99, status: "healthy"  },
  { name: "Salesforce",      pct: 72, status: "warning"  },
];

const alertItems = [
  { Icon: AlertCircle,  col: "#e05c5c", title: "Order API SLA breach",        sub: "Needs attention · 12m ago"  },
  { Icon: Clock,        col: "#f0a500", title: "3 reports pending review",     sub: "Due today · 1h ago"         },
  { Icon: CheckCircle2, col: "#52b788", title: "Release-147 deployed",         sub: "All clear · 3h ago"         },
  { Icon: AlertCircle,  col: "#f0a500", title: "Salesforce latency elevated",  sub: "Monitoring · 5h ago"        },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "Synapse — Business Intelligence" }],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [selectedEvent,      setSelectedEvent]      = useState<any>(DEFAULT_EVENT);
  const [liveEvents,         setLiveEvents]         = useState<any[]>([]);
  const [dark,               setDark]               = useState(() =>
    typeof window !== "undefined" && document.documentElement.classList.contains("dark")
  );
  const [showRightPanel,     setShowRightPanel]     = useState(true);
  const [activeIntegration,  setActiveIntegration]  = useState<IntegrationId | undefined>(undefined);
  const [showPlayground,     setShowPlayground]     = useState(false);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  function handleNewEvent(event: any) {
    setLiveEvents(prev => [event, ...prev].slice(0, 20));
  }

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "short", year: "numeric",
  });

  return (
    <>
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--background)" }}
    >

      {/* ── LEFT SIDEBAR ── */}
      <Sidebar onIntegrationSelect={setActiveIntegration} />

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 overflow-y-auto min-w-0">

        {/* Page header */}
        <div
          className="sticky top-0 z-20 flex items-center justify-between px-8 py-4"
          style={{
            background: dark ? "#0f0d16" : "#f5f0eb",
            borderBottom: "1px solid rgba(124,110,245,0.10)",
          }}
        >
          <h1 className="text-base font-semibold tracking-tight">Dashboard</h1>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground mr-1">{today}</span>

            {/* Dark / Light toggle */}
            <button
              onClick={() => setDark(d => !d)}
              className="relative h-8 w-[58px] rounded-full border transition-colors duration-300 flex items-center px-1 shadow-sm"
              style={{
                background: dark ? "#261f3a" : "#ede8ff",
                borderColor: dark ? "rgba(155,143,245,0.30)" : "rgba(124,110,245,0.20)",
              }}
              title={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {/* sliding pill */}
              <span
                className="absolute h-6 w-6 rounded-full flex items-center justify-center transition-all duration-300 shadow"
                style={{
                  left: dark ? "calc(100% - 28px)" : "2px",
                  background: dark ? "linear-gradient(135deg,#9b8ff5,#c4b0fc)" : "linear-gradient(135deg,#7c6ef5,#a78ef8)",
                }}
              >
                {dark
                  ? <Moon className="h-3 w-3 text-white" />
                  : <Sun  className="h-3 w-3 text-white" />}
              </span>
            </button>

           <div className="flex items-center gap-2">

  <button
    onClick={() => setShowRightPanel(prev => !prev)}
    className="h-8 w-8 rounded-xl border bg-card flex items-center justify-center hover:bg-secondary transition shadow-sm"
  >
    {showRightPanel ? (
      <PanelRightClose className="h-4 w-4 text-muted-foreground" />
    ) : (
      <PanelRightOpen className="h-4 w-4 text-muted-foreground" />
    )}
  </button>

  <button className="h-8 w-8 rounded-xl border bg-card flex items-center justify-center hover:bg-secondary transition shadow-sm">
    <Search className="h-3.5 w-3.5 text-muted-foreground" />
  </button>

  <button
    onClick={() => setShowPlayground(true)}
    className="h-8 flex items-center gap-1.5 px-3 rounded-xl border bg-card hover:bg-secondary transition shadow-sm"
    title="Open Minecraft Playground"
  >
    <Gamepad2 className="h-3.5 w-3.5 text-[#52b788]" />
    <span className="text-xs font-medium text-[#52b788]">Playground</span>
  </button>

</div>
          </div>
        </div>

        <div className="p-8 space-y-5">

          {/* ── WELCOME HERO CARD ── */}
          <div
            className="rounded-2xl p-7 relative overflow-hidden"
            style={{
              background: dark
                ? "linear-gradient(135deg,#1e1635 0%,#261f3a 100%)"
                : "linear-gradient(135deg,#f5e6d8 0%,#ede4f8 100%)",
              border: "1px solid rgba(124,110,245,0.12)",
            }}
          >
            {/* decorative blobs */}
            <div style={{ position: "absolute", right: "-20px", top: "-30px", width: "160px", height: "160px", borderRadius: "50%", background: "rgba(124,110,245,0.08)", filter: "blur(30px)" }} />
            <div style={{ position: "absolute", right: "80px", bottom: "-20px", width: "120px", height: "120px", borderRadius: "50%", background: "rgba(240,180,160,0.18)", filter: "blur(24px)" }} />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: "#9b8ff5" }}>GOOD DAY 👋</p>
                <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
                  Here's your business overview
                </h2>
                <p className="text-sm" style={{ color: "var(--foreground)" }}>
                  <strong style={{ color: "#7c6ef5" }}>94.3%</strong> of your systems are healthy &nbsp;·&nbsp;
                  <strong style={{ color: "#7c6ef5" }}>47</strong> updates since yesterday &nbsp;·&nbsp;
                  <strong style={{ color: "#e05c5c" }}>2</strong> issues need your attention
                </p>
                <button
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white transition hover:opacity-90"
                  style={{ background: "linear-gradient(135deg,#7c6ef5,#a78ef8)" }}
                >
                  View full report <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="hidden lg:block text-6xl select-none">📊</div>
            </div>
          </div>

          {/* ── METRIC CARDS ── */}
          <MetricCards />

          {/* ── 2-COL: EVENT STREAM + QUICK REPORTS + DEPENDENCY GRAPH | AI WORKSPACE ── */}
          <div className="grid grid-cols-5 gap-5 items-start">
            <div className="col-span-3 flex flex-col gap-5" id="event-stream">
              <EventStream onSelect={setSelectedEvent} liveEvents={liveEvents} />
              <QuickReports />
              <DependencyGraph liveEvents={liveEvents} />
            </div>
            <div className="col-span-2 sticky top-[73px]" id="ai-workspace">
              <AIWorkspace selectedEvent={selectedEvent} />
            </div>
          </div>

          {/* ── SYSTEM HEALTH ── */}
          <div id="integration-health">
            <IntegrationHealth />
          </div>

          {/* ── AI RECOMMENDATIONS ── */}
          <div id="recommendations">
            <Recommendations />
          </div>

          {/* ── WEEKLY / MONTHLY SCHEDULES ── */}
          <div id="schedules">
            <Schedules />
          </div>

          {/* ── INTEGRATION HUB ── */}
          <div id="integration-hub">
            <IntegrationHub activeIntegration={activeIntegration} />
          </div>

          {/* ── SIMULATE UPDATES ── */}
          <WebhookTrigger onNewEvent={handleNewEvent} />

          <p className="text-center text-xs text-muted-foreground py-4">
            Synapse · Business Intelligence Platform
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div
        className={`
          transition-all
          duration-300
          ease-in-out
          overflow-y-auto
          shrink-0
          ${showRightPanel ? "w-72 opacity-100" : "w-0 opacity-0"}
        `}
      >

        {/* Profile */}
        <div className="p-6" style={{ borderBottom: "1px solid rgba(124,110,245,0.08)" }}>
          <div className="flex flex-col items-center text-center gap-2 pt-2">
            <div className="relative">
              <div
                className="h-16 w-16 rounded-full flex items-center justify-center text-lg font-bold text-white"
                style={{ background: "linear-gradient(135deg,#7c6ef5,#a78ef8)" }}
              >
                VK
              </div>
              <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-success border-2" style={{ borderColor: "var(--sidebar)" }} />
            </div>
            <div>
              <p className="font-semibold text-sm">Virat Kohli</p>
              <p className="text-xs text-muted-foreground">Platform Manager</p>
            </div>
          </div>
        </div>

        {/* System Performance */}
        <div className="p-6 space-y-4" style={{ borderBottom: "1px solid rgba(124,110,245,0.08)" }}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">System Performance</h3>
            <span
              className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: "rgba(82,183,136,0.12)", color: "#52b788" }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse inline-block" />
              LIVE
            </span>
          </div>
          <div className="space-y-3.5">
            {healthItems.map(h => {
              const col = h.pct >= 90 ? "#52b788" : h.pct >= 75 ? "#f0a500" : "#e05c5c";
              return (
                <div key={h.name}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs">{h.name}</span>
                    <span className="text-xs font-semibold" style={{ color: col }}>{h.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: "var(--muted)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${h.pct}%`, background: col }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Recent Alerts</h3>
            <Bell className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            {alertItems.map((a, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-secondary/40 transition cursor-pointer"
              >
                <a.Icon className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: a.col }} />
                <div className="min-w-0">
                  <p className="text-xs font-medium leading-tight">{a.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{a.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>

    {/* ── FLOATING CHAT BOT — outside stacking context so z-index works ── */}
    <ChatAssistant />

    {/* ── MINECRAFT PLAYGROUND ── */}
    {showPlayground && <MinecraftPlayground onClose={() => setShowPlayground(false)} />}
</>
  );
}
