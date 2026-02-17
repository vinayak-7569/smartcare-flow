import { useEffect, useState } from "react";
import { Calendar, Plus, Sparkles } from "lucide-react";

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
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/services/api";
import { DEPARTMENTS } from "@/types/healthcare";

/* ---------------- BACKEND SHAPE ---------------- */
type AppointmentAPI = {
  id: number;
  patient_name: string;
  department: string;
  scheduled_at: string;
  status: string;
  appointment_type: string;
};

/* Backend response wrapper */
type AppointmentsResponse = {
  success: boolean;
  appointments: AppointmentAPI[];
};

export default function OnlineAppointments() {
  const [appointments, setAppointments] = useState<AppointmentAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    patientName: "",
    patientPhone: "",
    department: "",
    preferredDate: "",
    preferredTime: "",
    appointmentType: "NEW" as "NEW" | "FOLLOW_UP",
  });

  /* ---------------- FETCH APPOINTMENTS ---------------- */
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await apiRequest<AppointmentsResponse>("/appointments/");
      setAppointments(res?.appointments ?? []);
    } catch (err) {
      console.error("Failed to fetch appointments", err);
      setAppointments([]);
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.patientName ||
      !formData.patientPhone ||
      !formData.department ||
      !formData.preferredDate ||
      !formData.preferredTime
    ) {
      toast({
        title: "Error",
        description: "Please fill in all fields (including phone number)",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      await apiRequest("/appointments/book", "POST", {
        patient_name: formData.patientName,
        patient_phone: formData.patientPhone, // ✅ REQUIRED
        department: formData.department,
        preferred_date: formData.preferredDate,
        preferred_time: formData.preferredTime,
        appointment_type: formData.appointmentType,
        notes: "",
      });

      toast({
        title: "Success",
        description: "Appointment booked successfully",
      });

      setFormData({
        patientName: "",
        patientPhone: "",
        department: "",
        preferredDate: "",
        preferredTime: "",
        appointmentType: "NEW",
      });

      fetchAppointments();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Appointment booking failed",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- STATUS BADGE ---------------- */
  const statusVariant = (status: string) => {
    switch ((status || "").toUpperCase()) {
      case "SCHEDULED":
        return "scheduled";
      case "CHECKED_IN":
        return "info";
      case "COMPLETED":
        return "success";
      case "CANCELLED":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Online Appointment Booking</h1>
        <p className="page-subtitle">
          Real backend-powered appointment scheduling
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ---------------- FORM ---------------- */}
        <div className="form-section">
          <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Book New Appointment
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label>Patient Phone</Label>
              <Input
                value={formData.patientPhone}
                onChange={(e) =>
                  setFormData({ ...formData, patientPhone: e.target.value })
                }
                placeholder="10-digit number"
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
                  <SelectValue placeholder="Select department" />
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      preferredDate: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Time</Label>
                <Input
                  type="time"
                  value={formData.preferredTime}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      preferredTime: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full gap-2"
            >
              <Plus className="w-4 h-4" />
              {submitting ? "Booking..." : "Book Appointment"}
            </Button>
          </form>
        </div>

        {/* ---------------- INFO ---------------- */}
        <div className="bg-primary-light rounded-xl p-6 border">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI Optimization Enabled
          </h3>
          <p className="text-sm">
            Doctor assignment, queue handling and optimization are handled by the
            backend AI engine.
          </p>
        </div>
      </div>

      {/* ---------------- LIST ---------------- */}
      <div className="bg-card rounded-xl border shadow-card overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold">
            Scheduled Appointments ({appointments.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-4 text-sm text-muted-foreground">
            Loading appointments…
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">
            No appointments found.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Department</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td>{a.patient_name}</td>
                  <td>{a.department}</td>
                  <td>{new Date(a.scheduled_at).toLocaleString()}</td>
                  <td>
                    <Badge variant={statusVariant(a.status)}>{a.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
