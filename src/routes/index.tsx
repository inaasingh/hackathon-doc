import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { TopNav } from "@/components/dashboard/TopNav";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { EventStream } from "@/components/dashboard/EventStream";
import { ImpactPanel } from "@/components/dashboard/ImpactPanel";
import { AIWorkspace } from "@/components/dashboard/AIWorkspace";
import { IntegrationHealth } from "@/components/dashboard/IntegrationHealth";
import { Recommendations } from "@/components/dashboard/Recommendations";
import { Schedules } from "@/components/dashboard/Schedules";
import { ChatAssistant } from "@/components/dashboard/ChatAssistant";
import { mockEvents } from "@/data/mockEvents";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Delivery Copilot — Enterprise Change Intelligence" },
      { name: "description", content: "AI-powered enterprise for health checks, governance, and integration intelligence across Jira, Zoho, MuleSoft, Azure DevOps and Salesforce." },
      { property: "og:title", content: "AI Delivery Copilot" },
      { property: "og:description", content: "Enterprise Change Intelligence Platform" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />

      <div className="flex flex-1 min-h-0">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Page header */}
          <div id="top" className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                AI <span className="gradient-text">GENERATOR</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Live enterprise change intelligence across all connected platforms.
              </p>
            </div>
            <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-card/40">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                All systems operational
              </span>
              <span className="px-2.5 py-1 rounded-lg border border-border bg-card/40">
                UTC {new Date().toUTCString().slice(17, 22)}
              </span>
            </div>
          </div>

          <MetricCards />

          {/* Event Stream + Impact Panel */}
          <div id="event-stream" className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <EventStream onSelect={(i) => setSelectedIndex(i)} />
            </div>
            <ImpactPanel selectedIndex={selectedIndex} />
          </div>

          {/* AI Workspace — Governance + Documents land here */}
          <div id="ai-workspace">
            <AIWorkspace selectedEvent={mockEvents[selectedIndex]} />
          </div>

          {/* Integration Health */}
          <div id="integration-health">
            <IntegrationHealth />
          </div>

          {/* Recommendations + Schedules */}
          <div id="schedules" className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Recommendations />
            <Schedules />
          </div>

          <footer className="text-[11px] text-muted-foreground text-center py-4">
            AI Delivery Copilot · Enterprise Change Intelligence Platform · Powered by Claude AI
          </footer>

        </main>
      </div>

      <ChatAssistant />
    </div>
  );
}