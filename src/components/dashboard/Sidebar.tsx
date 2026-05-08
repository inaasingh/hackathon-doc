import { useState } from "react";

import {
  LayoutDashboard,
  Activity,
  ShieldCheck,
  HeartPulse,
  FileText,
  Network,
  CalendarDays,
  CalendarRange,
  Settings,
  ChevronLeft,
  X,
  Download,
  ExternalLink,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

const items = [
  { icon: LayoutDashboard, label: "Dashboard", scrollTo: "top" },

  {
    icon: Activity,
    label: "Event Stream",
    badge: "12",
    scrollTo: "event-stream",
  },

  {
    icon: ShieldCheck,
    label: "Governance",
    modal: "governance",
  },

  {
    icon: HeartPulse,
    label: "Health Reports",
    modal: "health",
  },

  {
    icon: FileText,
    label: "AI Documents",
    badge: "3",
    modal: "docs",
  },

  {
    icon: Network,
    label: "Integration Intelligence",
    modal: "integration",
  },

  {
    icon: CalendarDays,
    label: "Weekly Reports",
    modal: "weekly",
  },

  {
    icon: CalendarRange,
    label: "Monthly Reports",
    modal: "monthly",
  },

  {
    icon: Settings,
    label: "Settings",
    modal: "settings",
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const [activeLabel, setActiveLabel] =
    useState("Dashboard");

  const [modal, setModal] = useState<string | null>(null);

  function handleClick(item: any) {
    setActiveLabel(item.label);

    if (item.modal) {
      setModal(item.modal);
      return;
    }

    if (item.scrollTo === "top") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    const el = document.getElementById(item.scrollTo);

    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  return (
    <>
      <aside
        className={`hidden md:flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        <nav className="flex-1 p-3 space-y-1 mt-3">
          {items.map((it) => {
            const isActive =
              activeLabel === it.label;

            return (
              <motion.button
                key={it.label}
                whileHover={{ x: 2 }}
                onClick={() => handleClick(it)}
                className={`group w-full relative flex items-center gap-3 px-3 h-10 rounded-lg text-sm transition ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="active-pill"
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 rounded-r gradient-primary-bg"
                  />
                )}

                <it.icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? "text-primary" : ""
                  }`}
                />

                {!collapsed && (
                  <span className="flex-1 text-left truncate">
                    {it.label}
                  </span>
                )}

                {!collapsed && it.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-primary/15 text-primary border border-primary/30">
                    {it.badge}
                  </span>
                )}
              </motion.button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <div
            className={`flex ${
              collapsed
                ? "justify-center"
                : "items-center justify-between"
            }`}
          >
            {!collapsed && (
              <div className="text-[10px] text-muted-foreground leading-tight">
                <div className="font-medium text-foreground/80">
                  Claude Sonnet 4.5
                </div>

                <div>Inference: 184ms</div>
              </div>
            )}

            <button
              onClick={() =>
                setCollapsed(!collapsed)
              }
              className="h-7 w-7 rounded-md bg-sidebar-accent/50 hover:bg-sidebar-accent flex items-center justify-center"
            >
              <ChevronLeft
                className={`h-3.5 w-3.5 transition ${
                  collapsed ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </aside>

      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{
                scale: 0.95,
                opacity: 0,
                y: 10,
              }}
              animate={{
                scale: 1,
                opacity: 1,
                y: 0,
              }}
              exit={{
                scale: 0.95,
                opacity: 0,
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
              className="w-full max-w-6xl bg-card border border-border rounded-2xl overflow-hidden shadow-2xl"
            >
              {/* HEADER */}

              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/70">
                <div>
                  <h2 className="text-lg font-semibold">
                    Enterprise Intelligence Workspace
                  </h2>

                  <p className="text-xs text-muted-foreground mt-1">
                    AI-generated operational insights
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary border border-border text-xs hover:bg-secondary/80">
                    <Download className="h-3.5 w-3.5" />
                    Export
                  </button>

                  <button
                    onClick={() =>
                      setModal(null)
                    }
                    className="h-8 w-8 rounded-lg border border-border bg-secondary/50 hover:bg-secondary flex items-center justify-center"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* CONTENT */}

              <div className="p-6 max-h-[85vh] overflow-y-auto">

                {/* GOVERNANCE */}

                {modal === "governance" && (
                  <div className="space-y-4">

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">
                          Executive Governance Report
                        </h3>

                        <p className="text-sm text-muted-foreground mt-1">
                          AI-generated governance intelligence
                        </p>
                      </div>

                      <a
                        href="/reports/governance-report.pdf"
                        target="_blank"
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg gradient-primary-bg text-primary-foreground"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open Full PDF
                      </a>
                    </div>

                    <div className="rounded-2xl overflow-hidden border border-border bg-black h-[70vh]">
                      <iframe
                        src="/reports/governance-report.pdf"
                        className="w-full h-full"
                      />
                    </div>

                  </div>
                )}

                {/* HEALTH */}

                {modal === "health" && (
                  <div className="space-y-4">

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">
                          Enterprise Health Check Report
                        </h3>

                        <p className="text-sm text-muted-foreground mt-1">
                          AI-generated integration health analysis
                        </p>
                      </div>

                      <a
                        href="/reports/health-check.pdf"
                        target="_blank"
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg gradient-primary-bg text-primary-foreground"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open Full PDF
                      </a>
                    </div>

                    <div className="rounded-2xl overflow-hidden border border-border bg-black h-[70vh]">
                      <iframe
                        src="/reports/health-check.pdf"
                        className="w-full h-full"
                      />
                    </div>

                  </div>
                )}

                {/* DOCS */}

                {modal === "docs" && (
                  <div className="space-y-4">

                    <h3 className="text-xl font-semibold">
                      AI Generated Documents
                    </h3>

                    {[
                      {
                        name: "Business Requirements Document",
                        file: "/reports/brd.pdf",
                      },

                      {
                        name: "Technical Design Document",
                        file: "/reports/tdd.pdf",
                      },

                      {
                        name: "Integration Runbook",
                        file: "/reports/runbook.pdf",
                      },
                    ].map((d) => (
                      <a
                        key={d.name}
                        href={d.file}
                        target="_blank"
                        className="rounded-xl border border-border bg-card/30 p-4 flex items-center justify-between hover:bg-card/50 transition"
                      >
                        <div>
                          <div className="font-medium">
                            {d.name}
                          </div>

                          <div className="text-xs text-muted-foreground mt-1">
                            Generated automatically from live enterprise telemetry
                          </div>
                        </div>

                        <div className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg gradient-primary-bg text-primary-foreground">
                          <ExternalLink className="h-3.5 w-3.5" />
                          Open
                        </div>
                      </a>
                    ))}

                  </div>
                )}

                {/* INTEGRATION */}

                {modal === "integration" && (
                  <div className="space-y-4">

                    <h3 className="text-xl font-semibold">
                      Integration Architecture Intelligence
                    </h3>

                    <div className="rounded-2xl overflow-hidden border border-border">
                      <img
                        src="/reports/architecture.png"
                        className="w-full"
                      />
                    </div>

                  </div>
                )}

                {/* WEEKLY */}

                {modal === "weekly" && (
                  <div className="space-y-4">

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">
                          Weekly Governance Report
                        </h3>

                        <p className="text-sm text-muted-foreground mt-1">
                          Auto-generated weekly delivery intelligence report
                        </p>
                      </div>

                      <a
                        href="/reports/weekly-report.pdf"
                        target="_blank"
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg gradient-primary-bg text-primary-foreground"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open Full PDF
                      </a>
                    </div>

                    <div className="rounded-2xl overflow-hidden border border-border bg-black h-[70vh]">
                      <iframe
                        src="/reports/weekly-report.pdf"
                        className="w-full h-full"
                      />
                    </div>

                  </div>
                )}

                {/* MONTHLY */}

                {modal === "monthly" && (
                  <div className="space-y-4">

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">
                          Monthly Executive Report
                        </h3>

                        <p className="text-sm text-muted-foreground mt-1">
                          AI-generated enterprise governance document
                        </p>
                      </div>

                      <a
                        href="/reports/monthly-report.pdf"
                        target="_blank"
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg gradient-primary-bg text-primary-foreground"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open Full PDF
                      </a>
                    </div>

                    <div className="rounded-2xl overflow-hidden border border-border bg-black h-[70vh]">
                      <iframe
                        src="/reports/monthly-report.pdf"
                        className="w-full h-full"
                      />
                    </div>

                  </div>
                )}

                {/* SETTINGS */}

                {modal === "settings" && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold">
                      Platform Settings
                    </h3>

                    <div className="space-y-3">
                      {[
                        "Enable AI Auto Governance",
                        "Real-time Webhook Sync",
                        "Auto Generate Weekly Decks",
                        "Executive Alert Notifications",
                      ].map((s) => (
                        <div
                          key={s}
                          className="rounded-xl border border-border bg-card/30 p-4 flex items-center justify-between"
                        >
                          <span>{s}</span>

                          <div className="h-6 w-11 rounded-full bg-green-500/20 border border-green-500/30 flex items-center px-1">
                            <div className="h-4 w-4 rounded-full bg-green-400 ml-auto" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}