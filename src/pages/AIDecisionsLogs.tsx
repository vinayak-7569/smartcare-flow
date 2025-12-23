import { Brain, CheckCircle, XCircle, Clock, Zap, ArrowRight } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Badge } from '@/components/ui/badge';
import { DisclaimerNote } from '@/components/dashboard/DisclaimerNote';
import { Switch } from '@/components/ui/switch';

export default function AIDecisionsLogs() {
  const { aiDecisionLogs, setAIDecisionLogs } = useApp();

  const handleToggleAcceptance = (logId: string) => {
    setAIDecisionLogs(logs =>
      logs.map(log =>
        log.id === logId ? { ...log, acceptedByStaff: !log.acceptedByStaff } : log
      )
    );
  };

  const getTriggerBadgeVariant = (trigger: string) => {
    if (trigger.toLowerCase().includes('emergency')) return 'critical';
    if (trigger.toLowerCase().includes('overload')) return 'warning';
    if (trigger.toLowerCase().includes('delay')) return 'info';
    return 'default';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          AI Decisions & Logs
        </h1>
        <p className="page-subtitle">Transparent record of all AI-driven scheduling recommendations and their outcomes</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-5 border border-border shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success-light flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {aiDecisionLogs.filter(l => l.acceptedByStaff).length}
              </p>
              <p className="text-sm text-muted-foreground">Accepted by Staff</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-5 border border-border shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning-light flex items-center justify-center">
              <XCircle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {aiDecisionLogs.filter(l => !l.acceptedByStaff).length}
              </p>
              <p className="text-sm text-muted-foreground">Overridden by Staff</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-5 border border-border shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{aiDecisionLogs.length}</p>
              <p className="text-sm text-muted-foreground">Total AI Decisions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Decision Logs Timeline */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-display font-semibold text-foreground">Decision Timeline</h2>
        </div>
        <div className="divide-y divide-border">
          {aiDecisionLogs.map((log) => (
            <div key={log.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {log.timestamp}
                  </div>
                  <Badge variant={getTriggerBadgeVariant(log.triggerEvent)}>
                    {log.triggerEvent}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {log.acceptedByStaff ? 'Accepted' : 'Overridden'}
                  </span>
                  <Switch 
                    checked={log.acceptedByStaff} 
                    onCheckedChange={() => handleToggleAcceptance(log.id)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Observation</p>
                  <p className="text-foreground">{log.observation}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Recommendation</p>
                  <p className="text-foreground">{log.recommendation}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Reason</p>
                  <p className="text-foreground">{log.reason}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Outcome</p>
                  <div className="flex items-center gap-1 text-success">
                    <ArrowRight className="w-4 h-4" />
                    <span className="font-medium">{log.outcome}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <DisclaimerNote>
        AI recommendations can always be overridden by hospital staff. AI assists with scheduling optimization only and does not make medical decisions.
      </DisclaimerNote>
    </div>
  );
}
