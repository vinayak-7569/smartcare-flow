import { useEffect, useState } from "react";
import { AlertTriangle, Clock, ShieldAlert, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { DisclaimerNote } from "@/components/dashboard/DisclaimerNote";
import { apiRequest } from "@/services/api";

/* ---------------- BACKEND SHAPE ---------------- */
type QueueItemAPI = {
  id: number;
  source_type: string;
  source_id: number;
  doctor_id: string | null;
  priority: number;
  position: number;
  status: string;
  created_at: string;
};

/* backend wrapper */
type QueueResponse = {
  success: boolean;
  data: QueueItemAPI[];
};

/* ---------------- UI SHAPE ---------------- */
type EmergencyItemUI = {
  id: string;
  patientLabel: string;
  sourceType: string;
  createdAt: string;
  status: string;
};

export default function EmergencyQueue() {
  const [patients, setPatients] = useState<EmergencyItemUI[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmergencyQueue = async () => {
    try {
      setLoading(true);

      const res = await apiRequest<QueueResponse>("/queue/");
      const rows = res?.data ?? [];

      const critical = rows.filter(
        (q) =>
          Number(q.priority) === 5 &&
          ["WAITING", "IN_PROGRESS"].includes(String(q.status).toUpperCase())
      );

      const mapped: EmergencyItemUI[] = critical.map((q) => ({
        id: String(q.id),
        patientLabel: `Case #${q.source_id}`,
        sourceType: q.source_type,
        createdAt: q.created_at,
        status: q.status,
      }));

      setPatients(mapped);
    } catch (err) {
      console.error("Failed to fetch emergency queue", err);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencyQueue();
    const interval = setInterval(fetchEmergencyQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-critical" />
          Emergency Queue
        </h1>
        <p className="page-subtitle">
          Critical cases with highest priority handling
        </p>
      </div>

      <div className="bg-critical-light rounded-xl p-5 border border-critical/20">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-6 h-6 text-critical shrink-0" />
          <div>
            <h3 className="font-display font-semibold text-critical mb-2">
              Emergency Handling Protocol
            </h3>
            <ul className="space-y-1 text-sm text-critical/80">
              <li>• CRITICAL queue items are handled first</li>
              <li>• Priority = 5 is treated as emergency</li>
              <li>• Showing WAITING + IN_PROGRESS emergencies</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border shadow-card overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-display font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-critical" />
            Active Emergency Cases ({patients.length})
          </h2>
          <Badge variant="critical" className="animate-pulse-soft">
            CRITICAL PRIORITY
          </Badge>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-muted-foreground">
            Loading emergency cases…
          </div>
        ) : patients.length === 0 ? (
          <div className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No emergency cases currently</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Source</th>
                  <th>Arrival Time</th>
                  <th>Status</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.id} className="bg-critical-light/30">
                    <td className="font-medium flex items-center gap-2">
                      <User className="w-4 h-4 text-critical" />
                      {p.patientLabel}
                    </td>
                    <td>{p.sourceType}</td>
                    <td className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {new Date(p.createdAt).toLocaleString()}
                    </td>
                    <td className="font-medium">{p.status}</td>
                    <td>
                      <Badge variant="critical" className="font-bold">
                        <AlertTriangle className="w-3 h-3" />
                        CRITICAL
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DisclaimerNote variant="warning">
        Emergency priority is assigned by clinical staff. AI does not decide
        medical severity.
      </DisclaimerNote>
    </div>
  );
}
