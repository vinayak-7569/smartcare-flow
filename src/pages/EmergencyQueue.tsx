import { AlertTriangle, Clock, ShieldAlert, User } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Badge } from '@/components/ui/badge';
import { DisclaimerNote } from '@/components/dashboard/DisclaimerNote';

export default function EmergencyQueue() {
  const { emergencyPatients } = useApp();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-critical" />
          Emergency Queue
        </h1>
        <p className="page-subtitle">Critical cases with highest priority handling</p>
      </div>

      {/* Emergency Protocol Notice */}
      <div className="bg-critical-light rounded-xl p-5 border border-critical/20">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-6 h-6 text-critical shrink-0" />
          <div>
            <h3 className="font-display font-semibold text-critical mb-2">Emergency Handling Protocol</h3>
            <ul className="space-y-1 text-sm text-critical/80">
              <li>• Emergency priority is assigned at intake by clinical staff</li>
              <li>• Emergency cases are NEVER delayed or rescheduled</li>
              <li>• Emergency cases are NEVER redirected to other departments</li>
              <li>• Immediate attention is guaranteed</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Emergency Patients Table */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-critical" />
            Active Emergency Cases ({emergencyPatients.length})
          </h2>
          <Badge variant="critical" className="animate-pulse-soft">
            CRITICAL PRIORITY
          </Badge>
        </div>
        
        {emergencyPatients.length === 0 ? (
          <div className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No emergency cases currently</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Department</th>
                  <th>Arrival Time</th>
                  <th>Assigned Doctor</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {emergencyPatients.map((patient) => (
                  <tr key={patient.id} className="bg-critical-light/30">
                    <td className="font-medium text-foreground flex items-center gap-2">
                      <User className="w-4 h-4 text-critical" />
                      {patient.patientName}
                    </td>
                    <td>{patient.department}</td>
                    <td className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {patient.arrivalTime}
                    </td>
                    <td className="font-medium">{patient.assignedDoctor}</td>
                    <td>
                      <Badge variant="critical" className="font-bold">
                        <AlertTriangle className="w-3 h-3" />
                        CRITICAL
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DisclaimerNote variant="warning">
        Emergency priority is assigned at intake by qualified clinical staff. AI does not assess or predict medical severity.
      </DisclaimerNote>
    </div>
  );
}
