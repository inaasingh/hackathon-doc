const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

async function callAI(prompt: string): Promise<string> {
  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat:free",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!res.ok) {
      const err = await res.json();

      console.error("OpenRouter API error:", err);

      return `API Error: ${
        err?.error?.message ?? res.status
      }. Check your VITE_OPENROUTER_API_KEY in .env`;
    }

    const data = await res.json();

    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      console.error(
        "Unexpected OpenRouter response shape:",
        JSON.stringify(data)
      );

      return "Error: Unexpected response from OpenRouter.";
    }

    return text;
  } catch (e) {
    console.error("Network/fetch error:", e);

    return "Error: Network request failed. Check console for details.";
  }
}

export function generateImpactAnalysis(event: any): Promise<string> {
  return callAI(`You are an enterprise delivery architect.

A change was detected:
- System: ${event.svc}
- Source: ${event.source}
- Event ID: ${event.id}
- Severity: ${event.sev.toUpperCase()}
- Summary: ${event.summary}
- AI Confidence: ${event.conf}%
- Impacted Documents: ${event.docs?.join(", ")}

Write a concise impact analysis with:
1. WHAT CHANGED (1 sentence)
2. BUSINESS IMPACT (2 sentences)
3. IMPACTED DOCUMENTS (list each and what needs updating)
4. RECOMMENDED ACTION (max 3 bullet points)
5. RISK LEVEL: ${event.sev.toUpperCase()}

Be specific. Under 250 words.`);
}

export function generateGovernanceReport(events: any[]): Promise<string> {
  const list = events
    .map(
      (e) =>
        `- [${e.sev.toUpperCase()}] ${e.svc}: ${e.summary} (${e.source})`
    )
    .join("\n");

  return callAI(`You are a delivery governance analyst. Generate a weekly governance report.

WEEK ENDING: ${new Date().toDateString()}
PROJECT: Retail Integration Platform

DETECTED CHANGES:
${list}

Write a professional governance report with:
1. EXECUTIVE SUMMARY (3 sentences)
2. RAG STATUS: Red / Amber / Green with clear reason
3. KEY HIGHLIGHTS this week (3 bullet points)
4. RISKS AND ISSUES (each with owner suggestion and mitigation)
5. NEXT WEEK PRIORITIES (top 3)
6. LEADERSHIP RECOMMENDATION (1 paragraph)

Be specific. Reference actual system names.`);
}

export function generateWeeklyReport(events: any[]): Promise<string> {
  const list = events
    .map((e) => `- ${e.svc} (${e.source}): ${e.summary}`)
    .join("\n");

  return callAI(`You are a delivery manager. Generate a weekly delivery status report.

WEEK: ${new Date().toDateString()}
PLATFORM: Retail Integration Platform

EVENTS THIS WEEK:
${list}

Write a weekly report with:
1. DELIVERY STATUS SUMMARY (RAG: Red/Amber/Green)
2. COMPLETED WORK
3. IN PROGRESS
4. BLOCKERS AND RISKS
5. METRICS SUMMARY (mention 94.3% governance health)
6. NEXT WEEK PLAN

Professional tone. Under 300 words.`);
}