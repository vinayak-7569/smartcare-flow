import { useEffect, useState } from "react";
import {
  Users,
  Clock,
  UserCheck,
  AlertTriangle,
  TrendingDown,
  Sparkles,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { KPICard } from "@/components/dashboard/KPICard";
import { DisclaimerNote } from "@/components/dashboard/DisclaimerNote";
import { apiRequest } from "@/services/api";

/* ---------------- Types ---------------- */
type DashboardOverviewData = {
  kpis: {
    totalPatientsToday: number;
    avgWaitingTimeBefore: number;
    avgWaitingTimeAfter: number;
    activeDoctorsToday: number;
    emergencyCasesToday: number;
  };
  summary: {
    doctors: {
      total: number;
      available: number;
    };
    counts: {
      appointments_open: number;
      walkins_waiting: number;
      emergency_open?: number;
      queue_waiting?: number;
    };
  };
  charts: {
    waitingTime: {
      time: string;
      before: number;
      after: number;
    }[];
    doctorWorkload: {
      name: string;
      patients: number;
      department?: string;
    }[];
  };
};

/* Backend wrapper response (ok({...})) */
type DashboardOverviewResponse =
  | DashboardOverviewData
  | { success: boolean; data: DashboardOverviewData };

/* ✅ Type Guard (No `any`) */
const isWrappedResponse = (
  x: DashboardOverviewResponse
): x is { success: boolean; data: DashboardOverviewData } => {
  return typeof x === "object" && x !== null && "data" in x;
};

export default function DashboardOverview() {
  const [data, setData] = useState<DashboardOverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- AUTO REFRESH ---------------- */
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await apiRequest<DashboardOverviewResponse>(
          "/dashboard/overview"
        );

        const payload = isWrappedResponse(res) ? res.data : res;
        setData(payload);
      } catch (err) {
        console.error("Dashboard overview fetch failed", err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
    const interval = setInterval(fetchDashboard, 10000);

    return () => clearInterval(interval);
  }, []);

  const kpis = data?.kpis;
  const charts = data?.charts;

  const waitingTimeReduction =
    kpis && kpis.avgWaitingTimeBefore > 0
      ? Math.round(
          ((kpis.avgWaitingTimeBefore - kpis.avgWaitingTimeAfter) /
            kpis.avgWaitingTimeBefore) *
            100
        )
      : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Dashboard Overview</h1>
        <p className="page-subtitle">
          Real-time hospital operations monitoring and AI optimization insights
        </p>
      </div>

      {/* ================= KPI Cards ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Total Patients Today"
          value={loading ? "—" : kpis?.totalPatientsToday ?? 0}
          icon={<Users className="w-6 h-6" />}
          trend="up"
          trendValue="Live"
        />

        <KPICard
          title="Avg Wait Time (Before AI)"
          value={loading ? "—" : `${kpis?.avgWaitingTimeBefore ?? 0} min`}
          icon={<Clock className="w-6 h-6" />}
          variant="warning"
        />

        <KPICard
          title="Avg Wait Time (After AI)"
          value={loading ? "—" : `${kpis?.avgWaitingTimeAfter ?? 0} min`}
          subtitle={`${waitingTimeReduction}% reduction`}
          icon={<TrendingDown className="w-6 h-6" />}
          variant="success"
          trend="down"
          trendValue="Optimized"
        />

        <KPICard
          title="Active Doctors Today"
          value={loading ? "—" : kpis?.activeDoctorsToday ?? 0}
          icon={<UserCheck className="w-6 h-6" />}
        />

        <KPICard
          title="Emergency Cases"
          value={loading ? "—" : kpis?.emergencyCasesToday ?? 0}
          icon={<AlertTriangle className="w-6 h-6" />}
          variant="critical"
        />
      </div>

      {/* ================= Charts ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waiting Time Chart */}
        <div className="bg-card rounded-xl p-6 border border-border shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold">
              Waiting Time Reduction Over Time
            </h2>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts?.waitingTime ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis unit=" min" />
                <Tooltip />
                <Legend />
                <Line dataKey="before" stroke="hsl(var(--warning))" />
                <Line dataKey="after" stroke="hsl(var(--success))" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Doctor Workload Chart */}
        <div className="bg-card rounded-xl p-6 border border-border shadow-card">
          <h2 className="font-display font-semibold mb-4">
            Doctor Workload Distribution
          </h2>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.doctorWorkload ?? []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={90} />
                <Tooltip />
                <Bar dataKey="patients" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <DisclaimerNote>
        AI optimizes hospital scheduling and queues only. No medical decisions are
        made. Priority levels are assigned at intake by clinical staff.
      </DisclaimerNote>
    </div>
  );
}
      