// Claude AI — calls the Vercel serverless proxy (/api/claude)
// The API key lives in Vercel env vars, never in the browser bundle

const PROXY = "/api/claude";

// ── Fallback responses used when API key is not set ───────────────
const FALLBACK_IMPACT = `WHAT CHANGED
MuleSoft retry policy on Order API was updated — p95 latency now exceeding 1.8s SLA threshold.

BUSINESS IMPACT
Downstream services including Inventory Sync and Pricing Engine are experiencing cascading delays of up to 400ms. Customer-facing checkout flows may see increased timeout errors during peak hours.

IMPACTED DOCUMENTS
- LLD (Order API): Update timeout and retry configuration diagrams
- Runbook: Add SLA breach escalation steps for on-call engineers

RECOMMENDED ACTION
• Roll back MuleSoft retry count to previous value (2 retries) immediately
• Notify governance lead @priya and schedule emergency change window
• Regenerate LLD for Order API and re-run integration test suite

RISK LEVEL: CRITICAL`;

const FALLBACK_GOV = `EXECUTIVE SUMMARY
The Retail Integration Platform recorded 47 change events this week. Critical alerts on Order API and MuleSoft Runtime require immediate governance attention. Overall platform health stands at 94.3%, marginally below the 95% SLA target.

RAG STATUS: AMBER
Reason: One critical SLA breach on Order API unresolved; two warning-level issues pending owner assignment.

KEY HIGHLIGHTS
• MuleSoft Runtime maintained 99.99% uptime despite configuration changes
• Azure DevOps successfully delivered Release-147 with zero rollbacks
• Governance documentation auto-generated for 128 artefacts this week

RISKS AND ISSUES
- Order API SLA breach (Owner: Platform Team | Mitigation: Rollback retry policy, monitor 24h)
- CRM Sync latency degradation (Owner: Integration Lead | Mitigation: Scale horizontally)

NEXT WEEK PRIORITIES
1. Resolve Order API SLA breach and validate fix in production
2. Complete overdue governance document reviews
3. Onboard Salesforce connector health monitoring to the dashboard

LEADERSHIP RECOMMENDATION
The platform is stable but requires focused attention on Order API reliability before the Q2 client review.`;

const FALLBACK_WEEKLY = `DELIVERY STATUS SUMMARY — AMBER
Platform health at 94.3%. One SLA breach on Order API under active investigation.

COMPLETED WORK
✓ Release-147 deployed to production (Retail Order API)
✓ MuleSoft Runtime configuration updated and validated
✓ 128 governance documents auto-generated via AI pipeline
✓ Inventory Sync migration completed with 99.98% uptime

IN PROGRESS
→ Order API SLA breach root cause analysis
→ CRM Sync latency optimisation (scaling review)

BLOCKERS AND RISKS
⚠ Order API p95 latency 1.8s vs 800ms SLA target — needs rollback decision by EOD
⚠ Salesforce Connector error rate at 3.8% — may impact CRM data sync reliability

METRICS SUMMARY
- Changes this week: 47 (+12%)
- Documents generated: 128 (+24%)
- Governance health: 94.3% (+1.2%)
- Critical alerts: 2`;

// ── Core proxy call ───────────────────────────────────────────────
async function callClaude(prompt: string, type: "analysis" | "chat" | "report"): Promise<string> {
  try {
    const res = await fetch(PROXY, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ prompt, type }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      // If API key not configured, fall back to mock responses gracefully
      if (res.status === 500 && (err as any)?.error?.includes("ANTHROPIC_API_KEY")) {
        return null as any;
      }
      throw new Error((err as any)?.error ?? `HTTP ${res.status}`);
    }

    const data = await res.json();
    return data.text ?? "";
  } catch (e) {
    console.warn("Claude API unavailable, using fallback:", e);
    return null as any;
  }
}

// ── Public exports ────────────────────────────────────────────────

export async function generateImpactAnalysis(event: any): Promise<string> {
  const prompt = `Analyse this enterprise system change event:

System: ${event?.source ?? "Unknown"}
Service: ${event?.svc ?? "Unknown service"}
Summary: ${event?.summary ?? "No details provided"}
Severity: ${event?.sev ?? "unknown"}
Confidence: ${event?.conf ?? 0}%
Affected documents: ${(event?.docs ?? []).join(", ") || "None listed"}

Provide a full impact analysis.`;

  const result = await callClaude(prompt, "analysis");
  return result ?? FALLBACK_IMPACT;
}

export async function generateGovernanceReport(events: any[]): Promise<string> {
  const eventSummary = events.slice(0, 5).map((e: any) =>
    `• [${e?.source}] ${e?.svc}: ${e?.summary} (${e?.sev})`
  ).join("\n") || "No recent events";

  const prompt = `Generate a weekly governance report for the AbsoluteLabs Retail Integration Platform.

Recent events (last 5):
${eventSummary}

Platform stats: 47 total changes this week, 94.3% health, 2 critical alerts, 128 documents generated.
Include: Executive Summary, RAG Status, Key Highlights, Risks and Issues, Next Week Priorities, Leadership Recommendation.`;

  const result = await callClaude(prompt, "report");
  return result ?? FALLBACK_GOV;
}

export async function generateWeeklyReport(events: any[]): Promise<string> {
  const eventSummary = events.slice(0, 5).map((e: any) =>
    `• [${e?.source}] ${e?.svc}: ${e?.summary} (${e?.sev})`
  ).join("\n") || "No recent events";

  const prompt = `Generate a weekly delivery status report for the AbsoluteLabs platform team.

Recent events:
${eventSummary}

Include: Delivery Status Summary (with RAG), Completed Work, In Progress, Blockers and Risks, Metrics Summary, Next Week Plan.`;

  const result = await callClaude(prompt, "report");
  return result ?? FALLBACK_WEEKLY;
}
