import { useEffect, useState } from "react";
import {
  Brain,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  ArrowRight,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { DisclaimerNote } from "@/components/dashboard/DisclaimerNote";
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/services/api";

/* ---------------- BACKEND SHAPE ---------------- */
type AIDecisionLogAPI = {
  id: string;
  timestamp: string;
  trigger_event: string;
  observation: string;
  recommendation: string;
  reason: string;
  outcome: string;
  accepted_by_staff: boolean;
};

/* ---------------- UI SHAPE ---------------- */
type AIDecisionLogUI = {
  id: string;
  timestamp: string;
  triggerEvent: string;
  observation: string;
  recommendation: string;
  reason: string;
  outcome: string;
  acceptedByStaff: boolean;
};

export default function AIDecisionsLogs() {
  const [logs, setLogs] = useState<AIDecisionLogUI[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH LOGS ---------------- */
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const rows = await apiRequest<AIDecisionLogAPI[]>("/ai/decisions");

      const mapped: AIDecisionLogUI[] = rows.map((l) => ({
        id: l.id,
        timestamp: l.timestamp,
        triggerEvent: l.trigger_event,
        observation: l.observation,
        recommendation: l.recommendation,
        reason: l.reason,
        outcome: l.outcome,
        acceptedByStaff: l.accepted_by_staff,
      }));

      setLogs(mapped);
    } catch (err) {
      console.error("Failed to fetch AI decision logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  /* ---------------- TOGGLE ACCEPTANCE ---------------- */
  const handleToggleAcceptance = async (logId: string, value: boolean) => {
    try {
      await apiRequest(`/ai/decisions/${logId}`, "PATCH", {
        accepted_by_staff: value,
      });

      setLogs((prev) =>
        prev.map((log) =>
          log.id === logId
            ? { ...log, acceptedByStaff: value }
            : log
        )
      );
    } catch (err) {
      console.error("Failed to update AI decision acceptance", err);
    }
  };

  /* ---------------- UI HELPERS ---------------- */
  const getTriggerBadgeVariant = (trigger: string) => {
    const t = trigger.toLowerCase();
    if (t.includes("emergency")) return "critical";
    if (t.includes("overload")) return "warning";
    if (t.includes("delay")) return "info";
    return "default";
  };

  const acceptedCount = logs.filter((l) => l.acceptedByStaff).length;
  const rejectedCount = logs.length - acceptedCount;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          AI Decisions & Logs
        </h1>
        <p className="page-subtitle">
          Transparent record of all AI-driven scheduling recommendations and
          their outcomes
        </p>
      </div>

      {/* ---------------- SUMMARY ---------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-5 border shadow-card">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-success" />
            <div>
              <p className="text-2xl font-bold">{acceptedCount}</p>
              <p className="text-sm text-muted-foreground">
                Accepted by Staff
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 border shadow-card">
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-warning" />
            <div>
              <p className="text-2xl font-bold">{rejectedCount}</p>
              <p className="text-sm text-muted-foreground">
                Overridden by Staff
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 border shadow-card">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-primary" />
            <div>
              <p className="text-2xl font-bold">{logs.length}</p>
              <p className="text-sm text-muted-foreground">
                Total AI Decisions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- LOGS ---------------- */}
      <div className="bg-card rounded-xl border shadow-card overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-display font-semibold">Decision Timeline</h2>
        </div>

        {loading ? (
          <div className="p-4 text-sm text-muted-foreground">
            Loading AI decision logs…
          </div>
        ) : (
          <div className="divide-y">
            {logs.map((log) => (
              <div key={log.id} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {log.timestamp}
                    </span>
                    <Badge
                      variant={getTriggerBadgeVariant(log.triggerEvent)}
                    >
                      {log.triggerEvent}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {log.acceptedByStaff ? "Accepted" : "Overridden"}
                    </span>
                    <Switch
                      checked={log.acceptedByStaff}
                      onCheckedChange={(v) =>
                        handleToggleAcceptance(log.id, v)
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">
                      Observation
                    </p>
                    <p>{log.observation}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">
                      Recommendation
                    </p>
                    <p>{log.recommendation}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">
                      Reason
                    </p>
                    <p>{log.reason}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">
                      Outcome
                    </p>
                    <div className="flex items-center gap-1 text-success">
                      <ArrowRight className="w-4 h-4" />
                      <span className="font-medium">{log.outcome}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DisclaimerNote>
        AI recommendations can always be overridden by hospital staff. AI assists
        with scheduling optimization only and does not make medical decisions.
      </DisclaimerNote>
    </div>
  );
}
