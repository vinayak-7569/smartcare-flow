import { useEffect, useMemo, useState } from "react";
import { Users, Plus, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DisclaimerNote } from "@/components/dashboard/DisclaimerNote";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/services/api";
import { DEPARTMENTS, PatientPriority } from "@/types/healthcare";

/* ---------------- BACKEND SHAPE ---------------- */
type WalkInAPI = {
  id: number;
  patient_name: string;
  patient_phone: string | null;
  reason: string | null;
  assigned_doctor_id: string | null;
  priority: number; // ✅ backend uses number
  status: string;
  created_at: string | null;
};

/* Backend response wrapper */
type WalkinsResponse = {
  success: boolean;
  data: WalkInAPI[];
};

/* ---------------- UI SHAPE ---------------- */
type WalkInUI = {
  id: string;
  patientName: string;
  department: string;
  priority: PatientPriority;
  arrivalTime: string;
  assignedDoctor?: string;
  status?: string;
};

/* ---------------- Helpers ---------------- */
const uiToPriorityNumber = (p: PatientPriority): number => {
  if (p === "critical") return 5;
  if (p === "high") return 4;
  return 3;
};

const priorityToUI = (p: number): PatientPriority => {
  if (p >= 5) return "critical";
  if (p >= 4) return "high";
  return "normal";
};

export default function WalkInRegistration() {
  const [walkIns, setWalkIns] = useState<WalkInUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    patientName: "",
    department: "",
    priority: "normal" as PatientPriority,
  });

  /* ---------------- FETCH WALK-INS ---------------- */
  const fetchWalkIns = async () => {
    try {
      setLoading(true);

      // ✅ trailing slash avoids redirect issues
      const res = await apiRequest<WalkinsResponse>("/walkins/");

      const rows = res?.data ?? [];

      // ✅ backend doesn't store department directly.
      // We will store selected department inside "reason"
      // (because backend supports `reason` field)
      const mapped: WalkInUI[] = rows.map((w) => ({
        id: String(w.id),
        patientName: w.patient_name,
        department: w.reason || "Unknown",
        priority: priorityToUI(w.priority),
        arrivalTime: w.created_at
          ? new Date(w.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "--:--",
        assignedDoctor: w.assigned_doctor_id ?? undefined,
        status: w.status ?? undefined,
      }));

      setWalkIns(mapped);
    } catch (err) {
      console.error("Failed to fetch walk-ins", err);
      setWalkIns([]);

      toast({
        title: "Error",
        description: "Failed to load walk-in queue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalkIns();
    const interval = setInterval(fetchWalkIns, 5000);
    return () => clearInterval(interval);
  }, []);

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patientName || !formData.department) {
      toast({
        title: "Error",
        description: "Please fill Patient Name + Department",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      await apiRequest("/walkins/", "POST", {
        patient_name: formData.patientName,
        patient_phone: "",

        // ✅ We store department inside reason because backend supports reason field
        reason: formData.department,

        assigned_doctor_id: null,

        // ✅ CRITICAL/HIGH/NORMAL -> numeric priority for backend
        priority: uiToPriorityNumber(formData.priority),
      });

      toast({
        title: "Success",
        description: "Patient added to walk-in queue",
      });

      setFormData({
        patientName: "",
        department: "",
        priority: "normal",
      });

      fetchWalkIns();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to register walk-in",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- GROUP BY DEPARTMENT ---------------- */
  const grouped = useMemo(() => {
    return walkIns.reduce((acc, w) => {
      const dept = w.department || "Unknown";
      if (!acc[dept]) acc[dept] = [];
      acc[dept].push(w);
      return acc;
    }, {} as Record<string, WalkInUI[]>);
  }, [walkIns]);

  const getPriorityVariant = (priority: PatientPriority) => {
    switch (priority) {
      case "critical":
        return "critical";
      case "high":
        return "warning";
      case "normal":
        return "info";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Walk-in Registration</h1>
        <p className="page-subtitle">
          Register unplanned patient arrivals and manage live queue
        </p>
      </div>

      <DisclaimerNote>
        Walk-ins are registered by staff. Priority is assigned at intake by
        clinical staff.
      </DisclaimerNote>

      {/* ---------------- FORM ---------------- */}
      <div className="form-section">
        <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          Register Walk-in Patient
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div>
            <Label>Patient Name</Label>
            <Input
              value={formData.patientName}
              onChange={(e) =>
                setFormData({ ...formData, patientName: e.target.value })
              }
            />
          </div>

          <div>
            <Label>Department</Label>
            <Select
              value={formData.department}
              onValueChange={(v) =>
                setFormData({ ...formData, department: v })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(v) =>
                setFormData({
                  ...formData,
                  priority: v as PatientPriority,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button
              type="submit"
              disabled={submitting}
              className="w-full gap-2"
            >
              <Plus className="w-4 h-4" />
              {submitting ? "Adding..." : "Add to Queue"}
            </Button>
          </div>
        </form>
      </div>

      {/* ---------------- QUEUE ---------------- */}
      <div className="space-y-4">
        <h2 className="font-display font-semibold flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Live Queue by Department
        </h2>

        {loading ? (
          <div className="text-sm text-muted-foreground">
            Loading walk-in queue…
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="bg-card rounded-xl p-8 border text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              No walk-in patients in queue
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(grouped).map(([dept, patients]) => (
              <div
                key={dept}
                className="bg-card rounded-xl border shadow-card overflow-hidden"
              >
                <div className="p-4 border-b bg-muted/30">
                  <h3 className="font-semibold">{dept}</h3>
                  <p className="text-sm text-muted-foreground">
                    {patients.length} patients waiting
                  </p>
                </div>

                <div className="divide-y">
                  {patients.map((p, idx) => (
                    <div
                      key={p.id}
                      className="p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary-light text-primary text-sm font-semibold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-medium">{p.patientName}</p>
                          <p className="text-xs text-muted-foreground">
                            Arrived at {p.arrivalTime}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge variant={getPriorityVariant(p.priority)}>
                          {p.priority.toUpperCase()}
                        </Badge>

                        {/* Backend does not return wait time currently */}
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          --
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
