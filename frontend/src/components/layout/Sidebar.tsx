import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserCog, 
  Calendar, 
  Users, 
  AlertTriangle, 
  Stethoscope,
  Brain,
  BarChart3,
  ChevronRight
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard Overview', href: '/', icon: LayoutDashboard, adminOnly: false },
  { name: 'Doctor Setup', href: '/doctor-setup', icon: UserCog, adminOnly: true },
  { name: 'Online Appointments', href: '/appointments', icon: Calendar, adminOnly: false },
  { name: 'Walk-in Registration', href: '/walk-in', icon: Users, adminOnly: false },
  { name: 'Emergency Queue', href: '/emergency', icon: AlertTriangle, adminOnly: false },
  { name: 'Doctor Availability', href: '/availability', icon: Stethoscope, adminOnly: false },
  { name: 'AI Decisions & Logs', href: '/ai-logs', icon: Brain, adminOnly: false },
  { name: 'Reports & Analytics', href: '/reports', icon: BarChart3, adminOnly: false },
];

export function Sidebar() {
  const { userRole } = useApp();
  const location = useLocation();

  const filteredNavigation = navigation.filter(item => 
    !item.adminOnly || userRole === 'admin'
  );

  return (
    <aside className="w-64 border-r border-border bg-sidebar min-h-[calc(100vh-4rem)] p-4">
      <nav className="space-y-1">
        {filteredNavigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 shrink-0",
                isActive ? "text-primary" : "text-muted-foreground"
              )} />
              <span className="flex-1">{item.name}</span>
              {isActive && (
                <ChevronRight className="w-4 h-4 text-primary" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {userRole === 'admin' && (
        <div className="mt-6 p-3 rounded-lg bg-primary-light border border-primary/20">
          <p className="text-xs font-medium text-primary">Admin Mode Active</p>
          <p className="text-xs text-primary/70 mt-1">
            Full access to doctor setup and system configuration.
          </p>
        </div>
      )}
    </aside>
  );
}
