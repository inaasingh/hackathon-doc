import { useState } from "react";
import { CalendarClock, Clock, X, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const schedules = [
  {
    type: "Weekly",
    name: "Governance PPT generation",
    next: "Mon 09:00",
    freq: "Weekly",
    status: "scheduled",
    pdf: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },

  {
    type: "Weekly",
    name: "Deployment summaries",
    next: "Fri 18:00",
    freq: "Weekly",
    status: "scheduled",
    pdf: "https://www.orimi.com/pdf-test.pdf",
  },

  {
    type: "Weekly",
    name: "Delivery metrics aggregation",
    next: "Sun 23:00",
    freq: "Weekly",
    status: "running",
    pdf: "https://www.clickdimensions.com/links/TestPDFfile.pdf",
  },

  {
    type: "Monthly",
    name: "Executive deck",
    next: "Jun 1, 08:00",
    freq: "Monthly",
    status: "scheduled",
    pdf: "https://gahp.net/wp-content/uploads/2017/09/sample.pdf",
  },

  {
    type: "Monthly",
    name: "SLA analysis",
    next: "Jun 1, 09:00",
    freq: "Monthly",
    status: "scheduled",
    pdf: "https://www.africau.edu/images/default/sample.pdf",
  },

  {
    type: "Monthly",
    name: "Contract snapshots",
    next: "Jun 5, 10:00",
    freq: "Monthly",
    status: "scheduled",
    pdf: "https://www.orimi.com/pdf-test.pdf",
  },

  {
    type: "Monthly",
    name: "Health trend report",
    next: "Jun 7, 09:00",
    freq: "Monthly",
    status: "draft",
    pdf: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
];

const statusTone: Record<string, string> = {
  scheduled: "bg-info/15 text-info border-info/30",
  running: "bg-success/15 text-success border-success/30",
  draft: "bg-muted text-muted-foreground border-border",
};

export function Schedules() {
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);

  return (
    <>
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold tracking-tight flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-primary" />
            Automation Schedules
          </h2>

          <span className="text-[10px] text-muted-foreground">
            7 active jobs
          </span>
        </div>

        <div className="space-y-1">
          {schedules.map((s, i) => (
            <motion.button
              whileHover={{ x: 3 }}
              key={s.name}
              onClick={() => setSelectedDoc(s)}
              className="w-full text-left relative flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-secondary/40 transition border border-transparent hover:border-border"
            >
              <div className="flex flex-col items-center w-12 shrink-0">
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    s.type === "Weekly"
                      ? "bg-primary/15 text-primary"
                      : "bg-ai/15 text-ai"
                  }`}
                >
                  {s.type}
                </span>
              </div>

              <div className="relative shrink-0">
                <div className="h-2 w-2 rounded-full gradient-primary-bg" />

                {i < schedules.length - 1 && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-px h-6 bg-border" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {s.name}
                </div>

                <div className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Next: {s.next} · {s.freq}
                </div>
              </div>

              <span
                className={`text-[10px] px-1.5 py-0.5 rounded border ${statusTone[s.status]}`}
              >
                {s.status === "running" && (
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-success mr-1 animate-pulse" />
                )}

                {s.status.toUpperCase()}
              </span>

              <span className="text-[10px] text-muted-foreground hidden md:inline">
                open report
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* PDF MODAL */}
      <AnimatePresence>
        {selectedDoc && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setSelectedDoc(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-7xl h-[92vh] rounded-2xl overflow-hidden border border-border bg-background shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
                <div>
                  <h2 className="text-lg font-semibold">
                    {selectedDoc.name}
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Auto-generated enterprise schedule report
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={selectedDoc.pdf}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary-bg text-primary-foreground text-sm font-medium hover:opacity-90 transition"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Full PDF
                  </a>

                  <button
                    onClick={() => setSelectedDoc(null)}
                    className="h-10 w-10 rounded-xl border border-border hover:bg-secondary transition flex items-center justify-center"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* PDF */}
              <iframe
                src={selectedDoc.pdf}
                className="w-full flex-1 bg-white"
                title={selectedDoc.name}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}