import { useState } from 'react';
import { Plus, Clock, Users as UsersIcon } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DisclaimerNote } from '@/components/dashboard/DisclaimerNote';
import { DEPARTMENTS, Doctor, DoctorStatus } from '@/types/healthcare';
import { toast } from '@/hooks/use-toast';

export default function DoctorSetup() {
  const { doctors, setDoctors, userRole } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    shiftStart: '',
    shiftEnd: '',
    status: 'available' as DoctorStatus,
  });

  if (userRole !== 'admin') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground">Access Restricted</h2>
          <p className="text-muted-foreground mt-2">Doctor Setup is only available for Admin users.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.department || !formData.shiftStart || !formData.shiftEnd) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    const newDoctor: Doctor = {
      id: Date.now().toString(),
      name: formData.name,
      department: formData.department,
      shiftStart: formData.shiftStart,
      shiftEnd: formData.shiftEnd,
      status: formData.status,
      queueLength: 0,
    };

    setDoctors([...doctors, newDoctor]);
    setFormData({ name: '', department: '', shiftStart: '', shiftEnd: '', status: 'available' });
    toast({ title: 'Success', description: 'Doctor added successfully' });
  };

  const getStatusBadgeVariant = (status: DoctorStatus) => {
    switch (status) {
      case 'available': return 'available';
      case 'busy': return 'busy';
      case 'overloaded': return 'overloaded';
      case 'on-leave': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Doctor Setup</h1>
        <p className="page-subtitle">Configure doctor availability and shift timings before operations begin</p>
      </div>

      <DisclaimerNote variant="info">
        Doctor setup must be completed before appointments begin. Configure all available doctors for the day.
      </DisclaimerNote>

      {/* Add Doctor Form */}
      <div className="form-section">
        <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          Add New Doctor
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label className="form-label">Doctor Name</Label>
            <Input
              placeholder="Dr. Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
          <div>
            <Label className="form-label">Shift Start Time</Label>
            <Input
              type="time"
              value={formData.shiftStart}
              onChange={(e) => setFormData({ ...formData, shiftStart: e.target.value })}
            />
          </div>
          <div>
            <Label className="form-label">Shift End Time</Label>
            <Input
              type="time"
              value={formData.shiftEnd}
              onChange={(e) => setFormData({ ...formData, shiftEnd: e.target.value })}
            />
          </div>
          <div>
            <Label className="form-label">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(v) => setFormData({ ...formData, status: v as DoctorStatus })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card">
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="on-leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Add Doctor
            </Button>
          </div>
        </form>
      </div>

      {/* Doctor List Table */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-primary" />
            Doctor List ({doctors.length} doctors)
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Doctor Name</th>
                <th>Department</th>
                <th>Shift Timings</th>
                <th>Current Queue</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doctor) => (
                <tr key={doctor.id}>
                  <td className="font-medium text-foreground">{doctor.name}</td>
                  <td>{doctor.department}</td>
                  <td className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    {doctor.shiftStart} - {doctor.shiftEnd}
                  </td>
                  <td>
                    <span className="font-semibold">{doctor.queueLength}</span>
                    <span className="text-muted-foreground"> patients</span>
                  </td>
                  <td>
                    <Badge variant={getStatusBadgeVariant(doctor.status)}>
                      {doctor.status.charAt(0).toUpperCase() + doctor.status.slice(1).replace('-', ' ')}
                    </Badge>
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
