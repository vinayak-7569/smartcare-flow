import { Users, Clock, UserCheck, AlertTriangle, TrendingDown, Sparkles } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { KPICard } from '@/components/dashboard/KPICard';
import { DisclaimerNote } from '@/components/dashboard/DisclaimerNote';
import { mockKPIData, waitingTimeChartData, doctorWorkloadData } from '@/data/mockData';

export default function DashboardOverview() {
  const waitingTimeReduction = Math.round(
    ((mockKPIData.avgWaitingTimeBefore - mockKPIData.avgWaitingTimeAfter) / mockKPIData.avgWaitingTimeBefore) * 100
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Dashboard Overview</h1>
        <p className="page-subtitle">Real-time hospital operations monitoring and AI optimization insights</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Total Patients Today"
          value={mockKPIData.totalPatientsToday}
          icon={<Users className="w-6 h-6" />}
          trend="up"
          trendValue="+12% from yesterday"
        />
        <KPICard
          title="Avg Wait Time (Before AI)"
          value={`${mockKPIData.avgWaitingTimeBefore} min`}
          icon={<Clock className="w-6 h-6" />}
          variant="warning"
        />
        <KPICard
          title="Avg Wait Time (After AI)"
          value={`${mockKPIData.avgWaitingTimeAfter} min`}
          subtitle={`${waitingTimeReduction}% reduction`}
          icon={<TrendingDown className="w-6 h-6" />}
          variant="success"
          trend="down"
          trendValue="Optimized"
        />
        <KPICard
          title="Active Doctors Today"
          value={mockKPIData.activeDoctorsToday}
          icon={<UserCheck className="w-6 h-6" />}
        />
        <KPICard
          title="Emergency Cases"
          value={mockKPIData.emergencyCasesToday}
          icon={<AlertTriangle className="w-6 h-6" />}
          variant="critical"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waiting Time Chart */}
        <div className="bg-card rounded-xl p-6 border border-border shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-foreground">Waiting Time Reduction Over Time</h2>
          </div>
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

        {/* Doctor Workload Chart */}
        <div className="bg-card rounded-xl p-6 border border-border shadow-card">
          <h2 className="font-display font-semibold text-foreground mb-4">Doctor Workload Distribution</h2>
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

      {/* Disclaimer */}
      <DisclaimerNote>
        AI optimizes hospital scheduling and queues only. No medical decisions are made. Priority levels are assigned at intake by clinical staff.
      </DisclaimerNote>
    </div>
  );
}
