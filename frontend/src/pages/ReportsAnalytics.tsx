import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingDown,
  Activity,
  Clock,
  Users,
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
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { DisclaimerNote } from "@/components/dashboard/DisclaimerNote";
import { apiRequest } from "@/services/api";

/* ---------------- TYPES ---------------- */
type ReportsResponse = {
  kpis: {
    waiting_time_reduction_pct: number;
    ai_recommendation_rate: number;
    current_avg_wait: number;
    patients_today: number;
  };
  charts: {
    waiting_time: {
      time: string;
      before: number;
      after: number;
    }[];
    doctor_workload: {
      name: string;
      patients: number;
    }[];
    queue_congestion: {
      department: string;
      congestion: number;
    }[];
    emergency_response: {
      name: string;
      value: number;
    }[];
  };
};

export default function ReportsAnalytics() {
  const [data, setData] = useState<ReportsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH REPORTS ---------------- */
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const res = await apiRequest<ReportsResponse>("/reports/analytics");
        setData(res);
      } catch (err) {
        console.error("Failed to load reports", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const kpis = data?.kpis;
  const charts = data?.charts;

  const emergencyColors = [
    "hsl(var(--success))",
    "hsl(var(--warning))",
    "hsl(var(--critical))",
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          Reports & Analytics
        </h1>
        <p className="page-subtitle">
          Operational performance metrics and AI optimization impact analysis
        </p>
      </div>

      {/* ---------------- KPI SUMMARY ---------------- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard
          icon={<TrendingDown className="w-5 h-5 text-success" />}
          value={`${kpis?.waiting_time_reduction_pct ?? "—"}%`}
          label="Wait Time Reduction"
          loading={loading}
        />
        <KpiCard
          icon={<Activity className="w-5 h-5 text-primary" />}
          value={`${kpis?.ai_recommendation_rate ?? "—"}%`}
          label="AI Recommendation Rate"
          loading={loading}
        />
        <KpiCard
          icon={<Clock className="w-5 h-5 text-info" />}
          value={`${kpis?.current_avg_wait ?? "—"} min`}
          label="Current Avg Wait"
          loading={loading}
        />
        <KpiCard
          icon={<Users className="w-5 h-5 text-warning" />}
          value={kpis?.patients_today ?? "—"}
          label="Patients Today"
          loading={loading}
        />
      </div>

      {/* ---------------- CHARTS ROW 1 ---------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Before vs After AI Optimization">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={charts?.waiting_time ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis unit=" min" />
              <Tooltip />
              <Legend />
              <Line dataKey="before" stroke="hsl(var(--warning))" />
              <Line dataKey="after" stroke="hsl(var(--success))" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Doctor Workload Balance">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts?.doctor_workload ?? []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={90} />
              <Tooltip />
              <Bar dataKey="patients" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ---------------- CHARTS ROW 2 ---------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Queue Congestion by Department">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts?.queue_congestion ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" angle={-30} textAnchor="end" />
              <YAxis unit="%" />
              <Tooltip />
              <Bar dataKey="congestion" fill="hsl(var(--warning))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Emergency Response Efficiency">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={charts?.emergency_response ?? []}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                label
              >
                {(charts?.emergency_response ?? []).map((_, i) => (
                  <Cell key={i} fill={emergencyColors[i % emergencyColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <DisclaimerNote>
        All reports represent operational metrics. No medical data is collected or
        used in these analytics.
      </DisclaimerNote>
    </div>
  );
}

/* ---------------- SMALL UI HELPERS ---------------- */
function KpiCard({
  icon,
  value,
  label,
  loading,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  loading: boolean;
}) {
  return (
    <div className="bg-card rounded-xl p-5 border shadow-card">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold">
            {loading ? "—" : value}
          </p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card rounded-xl p-6 border shadow-card h-[22rem]">
      <h2 className="font-display font-semibold mb-4">{title}</h2>
      <div className="h-full">{children}</div>
    </div>
  );
}
