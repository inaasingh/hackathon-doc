const impactResponses = [
  `WHAT CHANGED
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

RISK LEVEL: CRITICAL`,

  `WHAT CHANGED
Jira ticket RETAIL-4821 updated retry logic for downstream timeout handling in the Order Management API.

BUSINESS IMPACT
The change increases system resilience against transient failures but may cause elevated latency during high-load periods. SLA compliance for Order API could drop below the 99.9% target threshold.

IMPACTED DOCUMENTS
- TDD: Retry policy section requires update to reflect new values
- BRD: Non-functional requirements for response time need re-validation

RECOMMENDED ACTION
• Validate retry changes in staging with production traffic simulation
• Update TDD with new retry configuration and test evidence
• Monitor p95 latency for 24 hours post-deployment

RISK LEVEL: WARNING`,

  `WHAT CHANGED
Azure DevOps pipeline Release-147 successfully deployed Retail Order API to production at 14:32 UTC.

BUSINESS IMPACT
New build includes 3 performance patches reducing average response time by 12%. All downstream integrations confirmed healthy post-deployment with no SLA breaches detected.

IMPACTED DOCUMENTS
- Release Notes: Capture build R-147 changes and deployment timestamp
- LLD: Update service version references to reflect production state

RECOMMENDED ACTION
• Archive Release-147 deployment record in governance tracker
• Notify stakeholders of successful deployment via Slack channel
• Schedule post-deployment review for 48-hour mark

RISK LEVEL: SUCCESS`,
];

const governanceResponses = [
  `EXECUTIVE SUMMARY
The Retail Integration Platform recorded 47 change events this week, a 12% increase from last week. Critical alerts on Order API and MuleSoft Runtime require immediate governance attention. Overall platform health stands at 94.3%, marginally below the 95% SLA target.

RAG STATUS: AMBER
Reason: One critical SLA breach on Order API unresolved; two warning-level issues pending owner assignment.

KEY HIGHLIGHTS
• MuleSoft Runtime maintained 99.99% uptime despite configuration changes
• Azure DevOps successfully delivered Release-147 with zero rollbacks
• Governance documentation auto-generated for 128 artefacts this week

RISKS AND ISSUES
- Order API SLA breach (Owner: Platform Team | Mitigation: Rollback retry policy, monitor 24h)
- CRM Sync latency degradation (Owner: Integration Lead | Mitigation: Scale horizontally)
- 3 governance documents pending review past deadline (Owner: @priya | Mitigation: Review sprint scheduled)

NEXT WEEK PRIORITIES
1. Resolve Order API SLA breach and validate fix in production
2. Complete overdue governance document reviews
3. Onboard Salesforce connector health monitoring to the dashboard

LEADERSHIP RECOMMENDATION
The platform is stable but requires focused attention on Order API reliability before the Q2 client review. Recommend assigning a dedicated engineer for the SLA resolution this sprint and scheduling a governance review checkpoint by end of week.`,

  `EXECUTIVE SUMMARY
Delivery velocity improved 18% this sprint with 128 AI-generated documents and 3 successful production deployments. MuleSoft configuration changes introduced short-lived latency warnings now resolved. Governance health trending positively at 94.3%.

RAG STATUS: GREEN
Reason: All critical issues resolved within SLA window; no open P1 incidents.

KEY HIGHLIGHTS
• All 6 integration services maintained uptime above 97% threshold
• AI documentation generation reduced manual effort by an estimated 6.2 hours
• Zero rollbacks recorded across all Azure DevOps pipelines this week

RISKS AND ISSUES
- Salesforce Connector error rate at 3.8% (Owner: CRM Team | Mitigation: Retry logic review scheduled)
- Q2 governance risk scores pending Zoho refresh (Owner: Compliance | Mitigation: Automated refresh enabled)

NEXT WEEK PRIORITIES
1. Investigate and resolve Salesforce Connector elevated error rate
2. Complete Q2 governance risk score validation in Zoho
3. Publish platform health report to leadership stakeholders

LEADERSHIP RECOMMENDATION
Platform performance is strong this sprint. Recommend maintaining current deployment cadence and fast-tracking the Salesforce error rate investigation to prevent escalation ahead of the Q2 client showcase.`,
];

const weeklyResponses = [
  `DELIVERY STATUS SUMMARY — AMBER
Platform health at 94.3%. One SLA breach on Order API under active investigation.

COMPLETED WORK
✓ Release-147 deployed to production (Retail Order API)
✓ MuleSoft Runtime configuration updated and validated
✓ 128 governance documents auto-generated via AI pipeline
✓ Inventory Sync migration completed with 99.98% uptime

IN PROGRESS
→ Order API SLA breach root cause analysis
→ CRM Sync latency optimisation (scaling review)
→ Zoho Q2 governance risk score recalculation

BLOCKERS AND RISKS
⚠ Order API p95 latency 1.8s vs 800ms SLA target — needs rollback decision by EOD
⚠ Salesforce Connector error rate at 3.8% — may impact CRM data sync reliability

METRICS SUMMARY
- Changes this week: 47 (+12%)
- Documents generated: 128 (+24%)
- Governance health: 94.3% (+1.2%)
- Critical alerts: 2 (up from 1 last week)

NEXT WEEK PLAN
1. Resolve Order API SLA breach and validate in staging
2. Complete CRM Sync scaling review
3. Publish Q2 governance report to leadership`,

  `DELIVERY STATUS SUMMARY — GREEN
Strong delivery week. All pipelines healthy, 3 deployments shipped with zero incidents.

COMPLETED WORK
✓ MuleSoft API timeout parameters updated across 4 services
✓ Jira retry logic changes reviewed and approved by architecture board
✓ Contract Vault governance risk score updated in Zoho
✓ Integration health monitoring extended to Salesforce Connector

IN PROGRESS
→ Q2 governance artefact review (3 documents pending)
→ Pricing Engine TDD update post-retry logic change
→ Dashboard performance optimisation for mobile clients

BLOCKERS AND RISKS
⚠ 3 governance documents past review deadline — escalation pending
⚠ Salesforce Connector showing intermittent 1.2s latency spikes

METRICS SUMMARY
- Changes this week: 41 (+7%)
- Documents generated: 114 (+18%)
- Governance health: 94.3% (stable)
- Critical alerts: 1 (down from 3 last week)

NEXT WEEK PLAN
1. Close out overdue governance document reviews
2. Investigate Salesforce latency spikes with vendor support
3. Begin Q3 platform roadmap planning sessions`,
];

let impactIdx = 0;
let govIdx = 0;
let weeklyIdx = 0;

export function generateImpactAnalysis(_event: any): Promise<string> {
  const text = impactResponses[impactIdx % impactResponses.length];
  impactIdx++;
  return Promise.resolve(text);
}

export function generateGovernanceReport(_events: any[]): Promise<string> {
  const text = governanceResponses[govIdx % governanceResponses.length];
  govIdx++;
  return Promise.resolve(text);
}

export function generateWeeklyReport(_events: any[]): Promise<string> {
  const text = weeklyResponses[weeklyIdx % weeklyResponses.length];
  weeklyIdx++;
  return Promise.resolve(text);
}
