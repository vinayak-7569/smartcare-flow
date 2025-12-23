import { useState } from 'react';
import { Calendar, Plus, Sparkles } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DEPARTMENTS, Appointment, AppointmentType, AppointmentStatus } from '@/types/healthcare';
import { toast } from '@/hooks/use-toast';

export default function OnlineAppointments() {
  const { appointments, setAppointments, doctors } = useApp();
  const [formData, setFormData] = useState({
    patientName: '',
    department: '',
    preferredDate: '',
    preferredTime: '',
    appointmentType: 'new' as AppointmentType,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientName || !formData.department || !formData.preferredDate || !formData.preferredTime) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    // Find an available doctor in the selected department
    const availableDoctor = doctors.find(d => d.department === formData.department && d.status !== 'on-leave');
    
    const newAppointment: Appointment = {
      id: Date.now().toString(),
      patientName: formData.patientName,
      department: formData.department,
      appointmentTime: formData.preferredTime,
      appointmentDate: formData.preferredDate,
      appointmentType: formData.appointmentType,
      assignedDoctor: availableDoctor?.name || 'Pending Assignment',
      status: 'scheduled',
      isAIOptimized: false,
    };

    setAppointments([...appointments, newAppointment]);
    setFormData({ patientName: '', department: '', preferredDate: '', preferredTime: '', appointmentType: 'new' });
    toast({ title: 'Success', description: 'Appointment booked successfully' });
  };

  const getStatusBadgeVariant = (status: AppointmentStatus) => {
    switch (status) {
      case 'scheduled': return 'scheduled';
      case 'rescheduled': return 'warning';
      case 'delayed': return 'critical';
      case 'completed': return 'success';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Online Appointment Booking</h1>
        <p className="page-subtitle">Schedule and manage patient appointments with AI-optimized slot allocation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Form */}
        <div className="form-section">
          <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Book New Appointment
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="form-label">Patient Name</Label>
              <Input
                placeholder="Full Name"
                value={formData.patientName}
                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
              />
            </div>
            <div>
              <Label className="form-label">Department</Label>
              <Select value={formData.department} onValueChange={(v) => setFormData({ ...formData, department: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="form-label">Preferred Date</Label>
                <Input
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                />
              </div>
              <div>
                <Label className="form-label">Preferred Time</Label>
                <Input
                  type="time"
                  value={formData.preferredTime}
                  onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label className="form-label">Appointment Type</Label>
              <Select 
                value={formData.appointmentType} 
                onValueChange={(v) => setFormData({ ...formData, appointmentType: v as AppointmentType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  <SelectItem value="new">New Consultation</SelectItem>
                  <SelectItem value="follow-up">Follow-up Visit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Book Appointment
            </Button>
          </form>
        </div>

        {/* Info Panel */}
        <div className="bg-primary-light rounded-xl p-6 border border-primary/20">
          <h3 className="font-display font-semibold text-primary mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI Optimization Active
          </h3>
          <ul className="space-y-2 text-sm text-primary/80">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
              Appointments are automatically assigned to the least busy doctor within the selected department
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
              Time slots are optimized to minimize patient waiting time
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
              Rescheduling recommendations are made when delays are detected
            </li>
          </ul>
        </div>
      </div>

      {/* Appointment List */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-display font-semibold text-foreground">
            Scheduled Appointments ({appointments.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Department</th>
                <th>Appointment Time</th>
                <th>Assigned Doctor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr key={apt.id}>
                  <td className="font-medium text-foreground">{apt.patientName}</td>
                  <td>{apt.department}</td>
                  <td>{apt.appointmentDate} at {apt.appointmentTime}</td>
                  <td>{apt.assignedDoctor}</td>
                  <td className="flex items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(apt.status)}>
                      {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                    </Badge>
                    {apt.isAIOptimized && (
                      <Badge variant="ai">
                        <Sparkles className="w-3 h-3" />
                        AI Optimized
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
