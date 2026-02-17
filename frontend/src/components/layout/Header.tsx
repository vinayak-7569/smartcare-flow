import { Hospital, User, Shield } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';

export function Header() {
  const { userRole, setUserRole } = useApp();

  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
          <Hospital className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display font-semibold text-lg text-foreground leading-tight">
            SmartCare Flow
          </h1>
          <p className="text-xs text-muted-foreground">
            AI-Powered Hospital Operations Optimization
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant={userRole === 'staff' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setUserRole('staff')}
          className="gap-2"
        >
          <User className="w-4 h-4" />
          Staff View
        </Button>
        <Button
          variant={userRole === 'admin' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setUserRole('admin')}
          className="gap-2"
        >
          <Shield className="w-4 h-4" />
          Admin View
        </Button>
      </div>
    </header>
  );
}
