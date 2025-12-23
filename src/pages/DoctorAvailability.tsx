import { Stethoscope, Users, AlertTriangle, Info } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Badge } from '@/components/ui/badge';
import { DisclaimerNote } from '@/components/dashboard/DisclaimerNote';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DoctorStatus } from '@/types/healthcare';

export default function DoctorAvailability() {
  const { doctors } = useApp();

  const getStatusConfig = (status: DoctorStatus) => {
    switch (status) {
      case 'available':
        return { variant: 'available' as const, label: 'Available', color: 'border-success/30 bg-success-light/20' };
      case 'busy':
        return { variant: 'busy' as const, label: 'Busy', color: 'border-warning/30 bg-warning-light/20' };
      case 'overloaded':
        return { variant: 'overloaded' as const, label: 'Overloaded', color: 'border-critical/30 bg-critical-light/20' };
      case 'on-leave':
        return { variant: 'secondary' as const, label: 'On Leave', color: 'border-border bg-muted/30' };
      default:
        return { variant: 'default' as const, label: status, color: 'border-border' };
    }
  };

  const activeDoctors = doctors.filter(d => d.status !== 'on-leave');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Doctor Availability</h1>
        <p className="page-subtitle">Real-time view of doctor status and queue lengths</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full bg-success" />
          <span className="text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full bg-warning" />
          <span className="text-muted-foreground">Busy (6-10 patients)</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full bg-critical" />
          <span className="text-muted-foreground">Overloaded (11+ patients)</span>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {doctors.map((doctor) => {
          const statusConfig = getStatusConfig(doctor.status);
          const isOverloaded = doctor.status === 'overloaded';

          return (
            <div 
              key={doctor.id} 
              className={`bg-card rounded-xl p-5 border-2 shadow-card transition-all duration-200 hover:shadow-soft ${statusConfig.color}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-primary" />
                </div>
                <Badge variant={statusConfig.variant}>
                  {statusConfig.label}
                </Badge>
              </div>

              <h3 className="font-display font-semibold text-foreground mb-1">{doctor.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{doctor.department}</p>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold text-foreground">{doctor.queueLength}</span>
                  <span className="text-muted-foreground">in queue</span>
                </div>
              </div>

              {isOverloaded && (
                <div className="mt-4 p-3 rounded-lg bg-critical-light border border-critical/20">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-critical shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-critical">Overloaded – Redistribution Recommended</p>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="text-xs text-critical/70 underline flex items-center gap-1 mt-1">
                            <Info className="w-3 h-3" />
                            Learn more
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs bg-popover text-popover-foreground">
                          <p>AI suggests redistributing low-priority patients within the same department to reduce waiting time. Emergency cases are never redirected.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
                Shift: {doctor.shiftStart} - {doctor.shiftEnd}
              </div>
            </div>
          );
        })}
      </div>

      <DisclaimerNote>
        Redirection recommendations are suggestions only. Emergency cases are never redirected. Cross-department doctor assignment is not permitted.
      </DisclaimerNote>
    </div>
  );
}
