import { GitPullRequest, FileText, ClipboardCheck, AlertTriangle, ShieldCheck, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

const metrics = [
  { label: "Changes Today", value: "47", trend: "+12%", up: true, icon: GitPullRequest, tone: "primary",
    data: [3,5,4,6,8,7,9,12,10,14,16,15] },
  { label: "Documents Generated", value: "128", trend: "+24%", up: true, icon: FileText, tone: "ai",
    data: [8,10,12,15,18,17,20,22,24,26,28,30] },
  { label: "Pending Reviews", value: "9", trend: "-3", up: false, icon: ClipboardCheck, tone: "warning",
    data: [14,13,12,12,11,10,11,10,9,9,9,9] },
  { label: "Critical Alerts", value: "2", trend: "+1", up: true, icon: AlertTriangle, tone: "critical",
    data: [0,1,0,1,2,1,1,2,1,2,2,2] },
  { label: "Governance Health", value: "94.3%", trend: "+1.2%", up: true, icon: ShieldCheck, tone: "success",
    data: [89,90,91,90,92,92,93,93,94,94,94,94] },
];

const toneMap: Record<string, { text: string; bg: string; stroke: string }> = {
  primary: { text: "text-primary", bg: "bg-primary/10", stroke: "var(--primary)" },
  ai:      { text: "text-ai",      bg: "bg-[oklch(0.72_0.2_295)]/10", stroke: "var(--ai)" },
  warning: { text: "text-warning", bg: "bg-warning/10", stroke: "var(--warning)" },
  critical:{ text: "text-critical",bg: "bg-critical/10",stroke: "var(--critical)" },
  success: { text: "text-success", bg: "bg-success/10", stroke: "var(--success)" },
};

export function MetricCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {metrics.map((m, i) => {
        const t = toneMap[m.tone];
        return (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -3 }}
            className="group glass rounded-2xl p-4 relative overflow-hidden hover:glow-border transition-all"
          >
            <div className="flex items-start justify-between">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${t.bg}`}>
                <m.icon className={`h-4 w-4 ${t.text}`} />
              </div>
              <div className={`inline-flex items-center gap-0.5 text-[11px] font-medium px-1.5 py-0.5 rounded ${
                m.up ? "text-success bg-success/10" : "text-warning bg-warning/10"
              }`}>
                {m.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {m.trend}
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-semibold tracking-tight">{m.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{m.label}</div>
            </div>
            <div className="h-10 -mx-4 -mb-4 mt-2 opacity-70 group-hover:opacity-100 transition">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={m.data.map(v => ({ v }))}>
                  <defs>
                    <linearGradient id={`g-${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={t.stroke} stopOpacity={0.5} />
                      <stop offset="100%" stopColor={t.stroke} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke={t.stroke} strokeWidth={1.5} fill={`url(#g-${i})`} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
