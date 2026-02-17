import { useEffect, useState } from "react";
import { Plus, Clock, Users as UsersIcon } from "lucide-react";

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
import { DEPARTMENTS, DoctorStatus } from "@/types/healthcare";

/* ---------------- BACKEND SHAPE ---------------- */
type DoctorAPI = {
  id: string;
  name: string;
  specialization?: string | null;
  department: string;
  shift_start: string;
  shift_end: string;
  status: DoctorStatus;
  current_queue_length?: number; // backend may send this
};

/* Backend response wrapper */
type DoctorsResponse = {
  success: boolean;
  count?: number;
  doctors: DoctorAPI[];
};

/* ---------------- UI SHAPE ---------------- */
type DoctorUI = {
  id: string;
  name: string;
  specialization?: string | null;
  department: string;
  shiftStart: string;
  shiftEnd: string;
  status: DoctorStatus;
  queueLength: number;
};

export default function DoctorSetup() {
  const [doctors, setDoctors] = useState<DoctorUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    department: "",
    shiftStart: "",
    shiftEnd: "",
    status: "available" as DoctorStatus,
  });

  /* ---------------- FETCH DOCTORS ---------------- */
  const fetchDoctors = async () => {
    try {
      setLoading(true);

      // ✅ backend returns { success, count, doctors: [...] }
      const res = await apiRequest<DoctorsResponse>("/doctors/");

      const rows = res?.doctors ?? [];

      const mapped: DoctorUI[] = rows.map((d) => ({
        id: d.id,
        name: d.name,
        specialization: d.specialization ?? null,
        department: d.department,
        shiftStart: d.shift_start,
        shiftEnd: d.shift_end,
        status: d.status,
        queueLength: d.current_queue_length ?? 0,
      }));

      setDoctors(mapped);
    } catch (err) {
      console.error("Failed to fetch doctors", err);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.department ||
      !formData.shiftStart ||
      !formData.shiftEnd
    ) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      await apiRequest("/doctors/", "POST", {
        name: formData.name,
        specialization: formData.specialization || null,
        department: formData.department,
        shift_start: formData.shiftStart,
        shift_end: formData.shiftEnd,
        status: formData.status,
      });

      toast({
        title: "Success",
        description: "Doctor added successfully",
      });

      setFormData({
        name: "",
        specialization: "",
        department: "",
        shiftStart: "",
        shiftEnd: "",
        status: "available",
      });

      fetchDoctors();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to add doctor",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- STATUS BADGE ---------------- */
  const getStatusBadgeVariant = (status: DoctorStatus) => {
    switch (status) {
      case "available":
        return "available";
      case "busy":
        return "busy";
      case "overloaded":
        return "overloaded";
      case "on-leave":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Doctor Setup</h1>
        <p className="page-subtitle">
          Configure doctor availability and shift timings
        </p>
      </div>

      <DisclaimerNote variant="info">
        Doctor setup is an administrative operation. All doctors are saved to the
        backend database.
      </DisclaimerNote>

      {/* ---------------- FORM ---------------- */}
      <div className="form-section">
        <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          Add New Doctor
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <div>
            <Label>Doctor Name</Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Dr. Name"
            />
          </div>

          <div>
            <Label>Specialization (optional)</Label>
            <Input
              value={formData.specialization}
              onChange={(e) =>
                setFormData({ ...formData, specialization: e.target.value })
              }
              placeholder="Cardiologist"
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
            <Label>Shift Start</Label>
            <Input
              type="time"
              value={formData.shiftStart}
              onChange={(e) =>
                setFormData({ ...formData, shiftStart: e.target.value })
              }
            />
          </div>

          <div>
            <Label>Shift End</Label>
            <Input
              type="time"
              value={formData.shiftEnd}
              onChange={(e) =>
                setFormData({ ...formData, shiftEnd: e.target.value })
              }
            />
          </div>

          <div>
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(v) =>
                setFormData({ ...formData, status: v as DoctorStatus })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="on-leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button type="submit" disabled={submitting} className="w-full gap-2">
              <Plus className="w-4 h-4" />
              {submitting ? "Adding..." : "Add Doctor"}
            </Button>
          </div>
        </form>
      </div>

      {/* ---------------- TABLE ---------------- */}
      <div className="bg-card rounded-xl border shadow-card overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-display font-semibold flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-primary" />
            Doctor List ({doctors.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-4 text-sm text-muted-foreground">
            Loading doctors…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Shift</th>
                  <th>Queue</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((d) => (
                  <tr key={d.id}>
                    <td className="font-medium">
                      {d.name}
                      {d.specialization ? (
                        <div className="text-xs text-muted-foreground">
                          {d.specialization}
                        </div>
                      ) : null}
                    </td>
                    <td>{d.department}</td>
                    <td className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {d.shiftStart} – {d.shiftEnd}
                    </td>
                    <td>
                      <span className="font-semibold">{d.queueLength}</span>
                    </td>
                    <td>
                      <Badge variant={getStatusBadgeVariant(d.status)}>
                        {d.status.replace("-", " ")}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {doctors.length === 0 && (
              <div className="p-4 text-sm text-muted-foreground">
                No doctors found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
