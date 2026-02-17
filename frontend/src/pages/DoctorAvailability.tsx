import { useEffect, useState } from "react";
import { Stethoscope } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { DisclaimerNote } from "@/components/dashboard/DisclaimerNote";
import { apiRequest } from "@/services/api";
import { DoctorStatus } from "@/types/healthcare";

/* ---------------- BACKEND SHAPE ---------------- */
type DoctorAPI = {
  doctor_id: string;
  name: string;
  specialization?: string;
  department: string;
  status: DoctorStatus;
  shift_start: string;
  shift_end: string;
};

/* ---------------- UI SHAPE ---------------- */
type DoctorUI = {
  id: string;
  name: string;
  department: string;
  specialization?: string;
  status: DoctorStatus;
  shiftStart: string;
  shiftEnd: string;
};

export default function DoctorAvailability() {
  const [doctors, setDoctors] = useState<DoctorUI[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- AUTO REFRESH (10s) ---------------- */
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const rows = await apiRequest<DoctorAPI[]>("/availability");

        const mapped: DoctorUI[] = rows.map((d) => ({
          id: d.doctor_id,
          name: d.name,
          department: d.department,
          specialization: d.specialization,
          status: d.status,
          shiftStart: d.shift_start,
          shiftEnd: d.shift_end,
        }));

        setDoctors(mapped);
      } catch (err) {
        console.error("Doctor availability fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
    const interval = setInterval(fetchAvailability, 10000);
    return () => clearInterval(interval);
  }, []);

  /* ---------------- STATUS UI ---------------- */
  const getStatusConfig = (status: DoctorStatus) => {
    switch (status) {
      case "available":
        return {
          variant: "available" as const,
          label: "Available",
          color: "border-success/30 bg-success-light/20",
        };
      case "busy":
        return {
          variant: "warning" as const,
          label: "Busy",
          color: "border-warning/30 bg-warning-light/20",
        };
      case "overloaded":
        return {
          variant: "critical" as const,
          label: "Overloaded",
          color: "border-critical/30 bg-critical-light/20",
        };
      case "on-leave":
        return {
          variant: "secondary" as const,
          label: "On Leave",
          color: "border-border bg-muted/30",
        };
      default:
        return {
          variant: "default" as const,
          label: status,
          color: "border-border",
        };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Doctor Availability</h1>
        <p className="page-subtitle">
          Live doctor availability synced with backend
        </p>
      </div>

      {/* ---------------- LOADING STATE ---------------- */}
      {loading && (
        <div className="text-muted-foreground text-sm">
          Loading doctor availability…
        </div>
      )}

      {/* ---------------- DOCTOR GRID ---------------- */}
      {!loading && doctors.length === 0 && (
        <div className="text-muted-foreground text-sm">
          No doctors available at the moment.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {doctors.map((doctor) => {
          const statusConfig = getStatusConfig(doctor.status);

          return (
            <div
              key={doctor.id}
              className={`bg-card rounded-xl p-5 border-2 shadow-card ${statusConfig.color}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-primary" />
                </div>
                <Badge variant={statusConfig.variant}>
                  {statusConfig.label}
                </Badge>
              </div>

              <h3 className="font-display font-semibold text-foreground mb-1">
                {doctor.name}
              </h3>

              <p className="text-sm text-muted-foreground">
                {doctor.department}
              </p>

              {doctor.specialization && (
                <p className="text-xs text-muted-foreground mt-1">
                  {doctor.specialization}
                </p>
              )}

              <div className="mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
                Shift: {doctor.shiftStart} – {doctor.shiftEnd}
              </div>
            </div>
          );
        })}
      </div>

      <DisclaimerNote>
        Availability is synced from backend every 10 seconds. Emergency cases
        always override availability.
      </DisclaimerNote>
    </div>
  );
}
