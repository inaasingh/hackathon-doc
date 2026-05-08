import { motion, AnimatePresence } from "framer-motion";

import {
  Sparkles,
  ArrowRight,
  X,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Download,
  Copy,
  CheckCheck,
} from "lucide-react";

import { useState } from "react";

const recs = [
  {
    title: "Regenerate LLD due to deployment changes",
    desc: "Inventory Sync v2.14.3 introduced 4 new endpoints.",
    sev: "info",

    details: `
## AI Recommendation Analysis

Detected Change:
Inventory Sync deployment v2.14.3

AI Findings:
• 4 new endpoints detected
• Existing LLD outdated
• Swagger contract mismatch possible

Recommended Actions:
1. Regenerate LLD
2. Trigger architecture review
3. Notify API consumers
4. Revalidate downstream integrations

Business Impact:
Potential integration mismatch risk reduced by 82%.
`,
  },

  {
    title: "Governance deck due in 2 days",
    desc: "Auto-prepared draft is 87% complete.",
    sev: "warning",

    details: `
## Governance Deck Readiness

Current Completion:
87%

Pending Sections:
• Executive KPI summary
• Financial variance
• Delivery dependencies

AI Recommendations:
1. Auto-generate KPI section
2. Pull Jira sprint metrics
3. Validate RAG status

Estimated completion time:
12 minutes
`,
  },

  {
    title: "CRM sync health below threshold",
    desc: "Error rate 1.4% vs 0.5% target. Investigate.",
    sev: "critical",

    details: `
## Critical Integration Health Alert

Affected System:
CRM Sync Pipeline

Observed Error Rate:
1.4%

Target Threshold:
0.5%

AI Root Cause Prediction:
• API retry saturation
• MuleSoft queue congestion
• Timeout escalation

Recommended Mitigation:
1. Increase retry backoff
2. Scale integration workers
3. Enable alert escalation
4. Activate fallback queue

Risk Level:
HIGH
`,
  },

  {
    title: "Contract renewal risk detected",
    desc: "Vendor Acme Corp · expiry in 18 days.",
    sev: "warning",

    details: `
## Vendor Risk Detection

Vendor:
Acme Corp

Contract Expiry:
18 days remaining

AI Risk Assessment:
• Renewal approval not initiated
• Dependency risk on middleware support
• Possible SLA interruption

Recommended Actions:
1. Trigger procurement workflow
2. Notify delivery governance
3. Escalate to vendor management

Business Risk:
Medium-High
`,
  },
];

const sevTone: Record<string, string> = {
  info: "border-info/40 bg-info/5",

  warning:
    "border-warning/40 bg-warning/5",

  critical:
    "border-critical/40 bg-critical/5",
};

export function Recommendations() {
  const [selected, setSelected] =
    useState<any>(null);

  const [copied, setCopied] =
    useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(
      selected.details
    );

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  function handleExport() {
    const blob = new Blob(
      [selected.details],
      {
        type: "text/plain",
      }
    );

    const a =
      document.createElement("a");

    a.href =
      URL.createObjectURL(blob);

    a.download = `${selected.title
      .replace(/\s/g, "-")
      .toLowerCase()}.txt`;

    a.click();
  }

  return (
    <>
      <div className="glass rounded-2xl p-5">

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold tracking-tight flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-ai" />
            AI Recommendations
          </h2>

          <span className="text-[10px] text-muted-foreground">
            Updated 12s ago
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

          {recs.map((r, i) => (
            <motion.button
              key={r.title}
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: i * 0.05,
              }}
              whileHover={{
                y: -2,
              }}
              onClick={() =>
                setSelected(r)
              }
              className={`rounded-xl border p-4 transition group text-left ${sevTone[r.sev]}`}
            >
              <div className="flex items-start gap-3">

                <div className="h-8 w-8 rounded-lg gradient-ai-bg flex items-center justify-center shrink-0 ai-glow">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>

                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {r.title}
                  </div>

                  <div className="text-xs text-muted-foreground mt-0.5">
                    {r.desc}
                  </div>
                </div>

                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition" />

              </div>
            </motion.button>
          ))}

        </div>
      </div>

      {/* MODAL */}

      <AnimatePresence>

        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() =>
              setSelected(null)
            }
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 10,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
              className="w-full max-w-4xl bg-card border border-border rounded-2xl overflow-hidden shadow-2xl"
            >

              {/* HEADER */}

              <div className="flex items-center justify-between px-6 py-4 border-b border-border">

                <div className="flex items-center gap-3">

                  <div className="h-10 w-10 rounded-xl gradient-primary-bg flex items-center justify-center">
                    {selected.sev ===
                    "critical" ? (
                      <AlertTriangle className="h-5 w-5 text-white" />
                    ) : selected.sev ===
                      "warning" ? (
                      <ShieldAlert className="h-5 w-5 text-white" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">
                      {selected.title}
                    </h3>

                    <p className="text-xs text-muted-foreground mt-1">
                      AI-generated enterprise recommendation
                    </p>
                  </div>

                </div>

                <div className="flex items-center gap-2">

                  {/* COPY */}

                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-secondary/50 text-xs hover:bg-secondary"
                  >
                    {copied ? (
                      <CheckCheck className="h-3.5 w-3.5 text-green-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}

                    {copied
                      ? "Copied"
                      : "Copy"}
                  </button>

                  {/* EXPORT */}

                  <button
                    onClick={handleExport}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg gradient-primary-bg text-primary-foreground text-xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export
                  </button>

                  {/* CLOSE */}

                  <button
                    onClick={() =>
                      setSelected(null)
                    }
                    className="h-8 w-8 rounded-lg border border-border bg-secondary/50 hover:bg-secondary flex items-center justify-center"
                  >
                    <X className="h-4 w-4" />
                  </button>

                </div>

              </div>

              {/* BODY */}

              <div className="p-6 max-h-[75vh] overflow-y-auto">

                <div className="rounded-2xl border border-border bg-card/20 p-6">

                  <pre className="whitespace-pre-wrap text-sm leading-8 text-foreground/90 font-mono">
                    {selected.details}
                  </pre>

                </div>

              </div>

            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </>
  );
}