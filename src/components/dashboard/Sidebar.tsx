import { useState } from "react";
import {
  Sparkles, LayoutDashboard, Activity, FileText,
  HeartPulse, ShieldCheck, Settings, LogOut,
  CalendarClock, Bot, Lightbulb, Ticket,
} from "lucide-react";
import logoSrc from "../../assets/logo.png";
import { auth } from "../../lib/auth";

const LOGO_SRC     = logoSrc;
const COMPANY_NAME = "AbsoluteLabs";

const navItems = [
  { icon: LayoutDashboard, label: "Overview",        scrollTo: "top"                        },
  { icon: Activity,        label: "Live Updates",    scrollTo: "event-stream",   badge: 12  },
  { icon: FileText,        label: "Smart Reports",   scrollTo: "ai-workspace",   badge: 3   },
  { icon: HeartPulse,      label: "System Health",   scrollTo: "integration-health"         },
  { icon: CalendarClock,   label: "Schedules",       scrollTo: "schedules"                  },
  { icon: Lightbulb,       label: "Recommendations", scrollTo: "recommendations"            },
  { icon: Ticket,          label: "Zoho Desk",       scrollTo: "zoho-desk"                  },
  { icon: Bot,             label: "AI Copilot",      scrollTo: null,             badge: "AI"},
  { icon: ShieldCheck,     label: "Compliance",      scrollTo: null                         },
  { icon: Settings,        label: "Settings",        scrollTo: null                         },
];

export function Sidebar() {
  const [active, setActive] = useState("Overview");

  function handleNav(item: typeof navItems[0]) {
    setActive(item.label);
    if (!item.scrollTo) return;
    if (item.scrollTo === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    document.getElementById(item.scrollTo)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <aside
      className="flex flex-col shrink-0 h-screen"
      style={{
        width: 220,
        background: "var(--sidebar)",
        borderRight: "1px solid rgba(124,110,245,0.10)",
        zIndex: 10,
        position: "relative",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-5 h-[68px]"
        style={{ borderBottom: "1px solid rgba(124,110,245,0.08)" }}
      >
        {LOGO_SRC ? (
          /* ── Custom company logo + name ── */
          <>
            <img
              src={LOGO_SRC}
              alt={COMPANY_NAME}
              className="h-8 w-auto max-w-[32px] object-contain shrink-0"
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
            <span className="font-bold text-base tracking-tight" style={{ color: "var(--foreground)" }}>
              {COMPANY_NAME}
            </span>
          </>
        ) : (
          /* ── Default purple icon + name ── */
          <>
            <div
              className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg,#7c6ef5,#a78ef8)" }}
            >
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight" style={{ color: "var(--foreground)" }}>
              {COMPANY_NAME}
            </span>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(item => {
          const isActive = active === item.label;
          return (
            <button
              key={item.label}
              onClick={() => handleNav(item)}
              className="relative w-full flex items-center gap-3 px-3 h-10 rounded-xl text-sm transition-all"
              style={{
                background: isActive ? "var(--secondary)" : "transparent",
                color: isActive ? "var(--primary)" : "var(--muted-foreground)",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              <span
                className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full transition-all duration-200"
                style={{ width: 3, height: 20, background: "var(--primary)", opacity: isActive ? 1 : 0 }}
              />
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge != null && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: isActive ? "var(--primary)" : "var(--secondary)",
                    color: isActive ? "var(--primary-foreground)" : "var(--primary)",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom sign out */}
      <div className="px-3 py-4" style={{ borderTop: "1px solid rgba(124,110,245,0.08)" }}>
        <button
          onClick={() => auth.logout()}
          className="w-full flex items-center gap-3 px-3 h-10 rounded-xl text-sm transition-all"
          style={{ color: "var(--muted-foreground)" }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = "var(--muted)")}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
