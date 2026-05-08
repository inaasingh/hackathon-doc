import { motion } from "framer-motion";
import { Line, LineChart, ResponsiveContainer } from "recharts";

const services = [
  { name: "Order API",        uptime: 99.42, latency: "1.8s", err: "2.1%", sla: "warning", trend: [40,42,45,50,60,70,80,75,85,90,95,100] },
  { name: "Inventory Sync",   uptime: 99.98, latency: "120ms",err: "0.02%",sla: "healthy", trend: [50,55,52,58,60,62,65,63,66,68,70,72] },
  { name: "Pricing Engine",   uptime: 99.91, latency: "210ms",err: "0.1%", sla: "healthy", trend: [60,62,61,65,67,66,68,69,70,71,73,75] },
  { name: "CRM Sync",         uptime: 98.74, latency: "640ms",err: "1.4%", sla: "warning", trend: [70,72,68,74,80,75,82,78,85,80,86,84] },
  { name: "MuleSoft Runtime", uptime: 99.99, latency: "45ms", err: "0.0%", sla: "healthy", trend: [50,51,52,52,53,53,54,54,55,55,56,56] },
  { name: "Salesforce Conn.", uptime: 97.21, latency: "1.2s", err: "3.8%", sla: "critical",trend: [60,55,70,65,80,75,90,85,95,90,100,98] },
];

const slaTone: Record<string, { dot: string; chip: string; stroke: string }> = {
  healthy:  { dot: "bg-success",  chip: "bg-success/15 text-success border-success/30",  stroke: "var(--success)" },
  warning:  { dot: "bg-warning",  chip: "bg-warning/15 text-warning border-warning/30",  stroke: "var(--warning)" },
  critical: { dot: "bg-critical", chip: "bg-critical/15 text-critical border-critical/30",stroke: "var(--critical)" },
};

export function IntegrationHealth() {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Integration Health</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Live SLA & latency monitoring across platforms</p>
        </div>
        <div className="text-[11px] text-muted-foreground">28d rolling · auto-refresh 30s</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {services.map((s, i) => {
          const t = slaTone[s.sla];
          const uptimeColor = s.uptime >= 99.9 ? "text-success" : s.uptime >= 99 ? "text-warning" : "text-critical";
          return (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -2 }}
              className="rounded-xl border border-border bg-card/40 p-4 hover:glow-border transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${t.dot}`}>
                    <span className={`block h-2 w-2 rounded-full ${t.dot} animate-ping opacity-50`} />
                  </span>
                  <span className="text-sm font-medium">{s.name}</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${t.chip}`}>{s.sla.toUpperCase()}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                <div>
                  <div className={`text-base font-semibold ${uptimeColor}`}>{s.uptime}%</div>
                  <div className="text-[10px] text-muted-foreground">uptime</div>
                </div>
                <div>
                  <div className="text-base font-semibold">{s.latency}</div>
                  <div className="text-[10px] text-muted-foreground">latency</div>
                </div>
                <div>
                  <div className="text-base font-semibold">{s.err}</div>
                  <div className="text-[10px] text-muted-foreground">errors</div>
                </div>
              </div>

              <div className="h-2 mt-3 rounded-full bg-secondary/50 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${s.uptime}%`, background: `linear-gradient(90deg, ${t.stroke}, oklch(0.72 0.2 295))` }}
                />
              </div>

              <div className="h-10 mt-2 -mx-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={s.trend.map(v => ({ v }))}>
                    <Line type="monotone" dataKey="v" stroke={t.stroke} strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
