import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'critical';
}

export function KPICard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend,
  trendValue,
  className,
  variant = 'default'
}: KPICardProps) {
  const variantStyles = {
    default: 'border-border',
    success: 'border-success/30 bg-success-light/30',
    warning: 'border-warning/30 bg-warning-light/30',
    critical: 'border-critical/30 bg-critical-light/30',
  };

  return (
    <div className={cn(
      "bg-card rounded-xl p-5 border shadow-card transition-all duration-200 hover:shadow-soft animate-fade-in",
      variantStyles[variant],
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold text-foreground tracking-tight">{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && trendValue && (
            <div className={cn(
              "mt-2 flex items-center gap-1 text-xs font-medium",
              trend === 'up' && "text-success",
              trend === 'down' && "text-critical",
              trend === 'neutral' && "text-muted-foreground"
            )}>
              {trend === 'up' && <TrendingUp className="w-3 h-3" />}
              {trend === 'down' && <TrendingDown className="w-3 h-3" />}
              {trend === 'neutral' && <Minus className="w-3 h-3" />}
              {trendValue}
            </div>
          )}
        </div>
        <div className={cn(
          "w-12 h-12 rounded-lg flex items-center justify-center",
          variant === 'default' && "bg-primary-light text-primary",
          variant === 'success' && "bg-success-light text-success",
          variant === 'warning' && "bg-warning-light text-warning",
          variant === 'critical' && "bg-critical-light text-critical"
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}
