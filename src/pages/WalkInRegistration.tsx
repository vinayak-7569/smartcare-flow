import { useState } from 'react';
import { Users, Plus, Clock } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DisclaimerNote } from '@/components/dashboard/DisclaimerNote';
import { DEPARTMENTS, WalkInPatient, PatientPriority } from '@/types/healthcare';
import { toast } from '@/hooks/use-toast';

export default function WalkInRegistration() {
  const { walkInPatients, setWalkInPatients, doctors } = useApp();
  const [formData, setFormData] = useState({
    patientName: '',
    department: '',
    priority: 'normal' as PatientPriority,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientName || !formData.department) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    const availableDoctor = doctors.find(d => d.department === formData.department && d.status !== 'on-leave');
    const baseWaitTime = formData.priority === 'high' ? 10 : 25;
    const queueWaitTime = availableDoctor ? availableDoctor.queueLength * 5 : 30;

    const newPatient: WalkInPatient = {
      id: Date.now().toString(),
      patientName: formData.patientName,
      department: formData.department,
      priority: formData.priority,
      arrivalTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      estimatedWaitTime: baseWaitTime + queueWaitTime,
      assignedDoctor: availableDoctor?.name,
    };

    setWalkInPatients([...walkInPatients, newPatient]);
    setFormData({ patientName: '', department: '', priority: 'normal' });
    toast({ title: 'Success', description: 'Patient added to queue' });
  };

  // Group patients by department
  const patientsByDepartment = walkInPatients.reduce((acc, patient) => {
    if (!acc[patient.department]) {
      acc[patient.department] = [];
    }
    acc[patient.department].push(patient);
    return acc;
  }, {} as Record<string, WalkInPatient[]>);

  const getPriorityBadgeVariant = (priority: PatientPriority) => {
    switch (priority) {
      case 'critical': return 'critical';
      case 'high': return 'warning';
      case 'normal': return 'info';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Walk-in Registration</h1>
        <p className="page-subtitle">Register unplanned patient arrivals and manage live queue</p>
      </div>

      <DisclaimerNote>
        Walk-ins are registered by staff, not by patients. Priority level is assigned by clinical staff at intake based on patient condition.
      </DisclaimerNote>

      {/* Registration Form */}
      <div className="form-section">
        <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          Register Walk-in Patient
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <div>
            <Label className="form-label">Priority Level</Label>
            <Select 
              value={formData.priority} 
              onValueChange={(v) => setFormData({ ...formData, priority: v as PatientPriority })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card">
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Add to Queue
            </Button>
          </div>
        </form>
      </div>

      {/* Live Queue by Department */}
      <div className="space-y-4">
        <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Live Queue by Department
        </h2>

        {Object.keys(patientsByDepartment).length === 0 ? (
          <div className="bg-card rounded-xl p-8 border border-border text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No walk-in patients in queue</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(patientsByDepartment).map(([department, patients]) => (
              <div key={department} className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/30">
                  <h3 className="font-semibold text-foreground">{department}</h3>
                  <p className="text-sm text-muted-foreground">{patients.length} patients waiting</p>
                </div>
                <div className="divide-y divide-border">
                  {patients.map((patient, index) => (
                    <div key={patient.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary-light text-primary text-sm font-semibold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-foreground">{patient.patientName}</p>
                          <p className="text-xs text-muted-foreground">Arrived at {patient.arrivalTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={getPriorityBadgeVariant(patient.priority)}>
                          {patient.priority.toUpperCase()}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          ~{patient.estimatedWaitTime} min
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
