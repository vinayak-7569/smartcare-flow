import { BarChart3, TrendingDown, Activity, Clock, Users } from 'lucide-react';
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
  Cell 
} from 'recharts';
import { DisclaimerNote } from '@/components/dashboard/DisclaimerNote';
import { mockKPIData, waitingTimeChartData, doctorWorkloadData } from '@/data/mockData';

const queueCongestionData = [
  { department: 'General Medicine', congestion: 65 },
  { department: 'Cardiology', congestion: 85 },
  { department: 'Orthopedics', congestion: 92 },
  { department: 'Pediatrics', congestion: 45 },
  { department: 'Neurology', congestion: 55 },
  { department: 'ENT', congestion: 70 },
];

const emergencyResponseData = [
  { name: 'Under 5 min', value: 75, color: 'hsl(var(--success))' },
  { name: '5-10 min', value: 20, color: 'hsl(var(--warning))' },
  { name: 'Over 10 min', value: 5, color: 'hsl(var(--critical))' },
];

export default function ReportsAnalytics() {
  const waitingTimeReduction = Math.round(
    ((mockKPIData.avgWaitingTimeBefore - mockKPIData.avgWaitingTimeAfter) / mockKPIData.avgWaitingTimeBefore) * 100
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          Reports & Analytics
        </h1>
        <p className="page-subtitle">Operational performance metrics and AI optimization impact analysis</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-5 border border-border shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success-light flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-success">{waitingTimeReduction}%</p>
              <p className="text-sm text-muted-foreground">Wait Time Reduction</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-5 border border-border shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">94%</p>
              <p className="text-sm text-muted-foreground">AI Recommendation Rate</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-5 border border-border shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-info-light flex items-center justify-center">
              <Clock className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{mockKPIData.avgWaitingTimeAfter} min</p>
              <p className="text-sm text-muted-foreground">Current Avg Wait</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-5 border border-border shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning-light flex items-center justify-center">
              <Users className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{mockKPIData.totalPatientsToday}</p>
              <p className="text-sm text-muted-foreground">Patients Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Before vs After Comparison */}
        <div className="bg-card rounded-xl p-6 border border-border shadow-card">
          <h2 className="font-display font-semibold text-foreground mb-4">
            Before vs After AI Optimization
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={waitingTimeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} unit=" min" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="before" 
                  stroke="hsl(var(--warning))" 
                  strokeWidth={2}
                  name="Before AI"
                  dot={{ fill: 'hsl(var(--warning))' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="after" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={2}
                  name="After AI"
                  dot={{ fill: 'hsl(var(--success))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Doctor Workload Balance */}
        <div className="bg-card rounded-xl p-6 border border-border shadow-card">
          <h2 className="font-display font-semibold text-foreground mb-4">
            Doctor Workload Balance
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={doctorWorkloadData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={11}
                  width={90}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }} 
                />
                <Bar 
                  dataKey="patients" 
                  fill="hsl(var(--primary))" 
                  radius={[0, 4, 4, 0]}
                  name="Patients"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Queue Congestion Trends */}
        <div className="bg-card rounded-xl p-6 border border-border shadow-card">
          <h2 className="font-display font-semibold text-foreground mb-4">
            Queue Congestion by Department
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={queueCongestionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="department" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={10}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} unit="%" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }} 
                />
                <Bar 
                  dataKey="congestion" 
                  fill="hsl(var(--warning))" 
                  radius={[4, 4, 0, 0]}
                  name="Congestion Level"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Emergency Response Efficiency */}
        <div className="bg-card rounded-xl p-6 border border-border shadow-card">
          <h2 className="font-display font-semibold text-foreground mb-4">
            Emergency Response Efficiency
          </h2>
          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={emergencyResponseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                  labelLine={false}
                >
                  {emergencyResponseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {emergencyResponseData.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DisclaimerNote>
        All reports represent operational metrics. No medical data is collected or used in these analytics.
      </DisclaimerNote>
    </div>
  );
}
