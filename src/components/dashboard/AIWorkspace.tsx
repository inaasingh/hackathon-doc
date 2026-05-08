import { useEffect, useState } from "react";

import {
  Sparkles,
  RefreshCw,
  Copy,
  Download,
  CheckCheck,
  Loader2,
} from "lucide-react";

import { motion } from "framer-motion";

const tabs = [
  "CR Document",
  "Governance Summary",
  "Weekly Report",
  "Executive Summary",
  "Health Analysis",
];

const contentMap: Record<string, string> = {
  "CR Document": `
## AI Change Impact Analysis

Detected enterprise impact across:

• MuleSoft integrations
• Governance workflows
• Weekly delivery reporting
• Executive summaries
• LLD / HLD documentation

### AI Recommendations

1. Update retry policies
2. Trigger governance approval flow
3. Notify DevOps stakeholders
4. Regenerate CR documentation
5. Schedule integration health review

### Risk Assessment

Risk Level: Medium-High

Potential downstream systems impacted:

• Inventory Sync
• Pricing Engine
• CRM Sync

### Business Impact

Estimated engineering effort saved:
~6.5 hours/week

Predicted governance processing reduction:
~72%
`,

  "Governance Summary": `
## Governance Intelligence Summary

RAG STATUS: AMBER

Key Risks:
• Integration latency spikes
• Delayed QA signoff
• MuleSoft dependency issues

Leadership Recommendation:
Increase monitoring thresholds and
enable automated rollback workflows.

Compliance Health:
94.3%

AI Confidence:
96%
`,

  "Weekly Report": `
## Weekly Delivery Governance Report

Completed:
• 14 Jira stories delivered
• 3 production deployments
• 2 governance reviews completed

In Progress:
• MuleSoft retry optimization
• Azure DevOps pipeline enhancements

Risks:
• API timeout issues
• Delayed UAT signoff

Executive Recommendation:
Continue phased rollout strategy.
`,

  "Executive Summary": `
## Executive Delivery Summary

Enterprise delivery velocity improved
by 18% this sprint.

Automation coverage:
81%

Governance processing time reduced
from 11 hours → 2.4 hours.

AI-generated documentation count:
128

Projected annual operational savings:
$480,000
`,

  "Health Analysis": `
## Enterprise Health Analysis

Jira:
Operational

Azure DevOps:
Healthy

MuleSoft:
Minor latency warnings

Salesforce:
Operational

Zoho:
Operational

Overall platform health:
94.3%

AI Recommendation:
Enable proactive alerting for MuleSoft APIs.
`,
};

export function AIWorkspace({
  selectedEvent,
}: {
  selectedEvent: any;
}) {
  const [activeTab, setActiveTab] =
    useState("CR Document");

  const [content, setContent] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  useEffect(() => {
    generateContent();
  }, [activeTab]);

  function generateContent() {
    setLoading(true);

    setTimeout(() => {
      setContent(contentMap[activeTab]);
      setLoading(false);
    }, 1200);
  }

  function handleCopy() {
    navigator.clipboard.writeText(content);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  function handleExport() {
    const blob = new Blob([content], {
      type: "text/plain",
    });

    const a = document.createElement("a");

    a.href = URL.createObjectURL(blob);

    a.download = `${activeTab
      .replace(/\s/g, "-")
      .toLowerCase()}.txt`;

    a.click();
  }

  return (
    <div className="glass rounded-2xl p-5">

      {/* HEADER */}

      <div className="flex items-center justify-between mb-4">

        <div>
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Generated Output
          </h2>

          <p className="text-xs text-muted-foreground mt-1">
            Generated using Claude AI · streaming
          </p>
        </div>

        <div className="flex items-center gap-2">

          {/* GENERATE */}

          <button
            onClick={generateContent}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium gradient-primary-bg text-primary-foreground"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}

            Generate AI Analysis
          </button>

          {/* REGENERATE */}

          <button
            onClick={generateContent}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs border border-border bg-card/50 hover:bg-secondary/50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Regenerate
          </button>

          {/* COPY */}

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs border border-border bg-card/50 hover:bg-secondary/50"
          >
            {copied ? (
              <CheckCheck className="h-3.5 w-3.5 text-green-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}

            {copied ? "Copied" : "Copy"}
          </button>

          {/* EXPORT */}

          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs gradient-primary-bg text-primary-foreground"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>

        </div>
      </div>

      {/* TABS */}

      <div className="flex items-center gap-6 border-b border-border mb-4 overflow-x-auto">

        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm whitespace-nowrap transition ${
              activeTab === tab
                ? "text-primary border-b border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* CONTENT */}

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card/20 p-6 min-h-[600px]"
      >

        {loading ? (
          <div className="h-[500px] flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />

            <p className="text-sm">
              AI is generating enterprise intelligence...
            </p>
          </div>
        ) : (
          <pre className="whitespace-pre-wrap text-sm leading-8 text-foreground/90 font-mono">
            {content}
          </pre>
        )}

      </motion.div>
    </div>
  );
}