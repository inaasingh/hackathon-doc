// Vercel Serverless Function — proxies Claude API calls
// API key stays server-side, never exposed to the browser

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured in Vercel environment variables" });
  }

  const { prompt, type } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "prompt is required" });
  }

  // Build system prompt based on request type
  const systemPrompt = type === "chat"
    ? `You are an AI Delivery Copilot for AbsoluteLabs, an enterprise platform management assistant.
You have access to live data from: MuleSoft CloudHub (41 APIs, 99.99% uptime), Jira (current sprint),
Zoho Desk (10 open tickets), Datadog (6 monitors), Azure DevOps (deployments).
Current platform health: 94.3%. Active alerts: Order API SLA breach (critical), Salesforce latency (warning).
Be concise, professional, and actionable. Answer in 2-4 sentences unless asked for detail.`
    : `You are an enterprise integration platform analyst for AbsoluteLabs.
Analyse the provided change event and respond with EXACTLY this structure (no markdown, no bullet asterisks, use • for bullets):

WHAT CHANGED
[1-2 sentences describing the technical change]

BUSINESS IMPACT
[2-3 sentences on downstream effects and business risk]

IMPACTED DOCUMENTS
[List 2-3 documents that need updating, each on a new line starting with -]

RECOMMENDED ACTION
[3 bullet points starting with •]

RISK LEVEL: [CRITICAL / HIGH / WARNING / SUCCESS]

Be specific, technical, and actionable. Reference real system names from the event.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 600,
        system: systemPrompt,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic API error:", err);
      return res.status(response.status).json({ error: "Anthropic API error", detail: err });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "";
    return res.json({ text });

  } catch (err) {
    console.error("Claude proxy error:", err);
    return res.status(500).json({ error: "Internal server error", detail: err.message });
  }
}
