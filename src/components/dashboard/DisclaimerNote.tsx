import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DisclaimerNoteProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'info' | 'warning';
}

export function DisclaimerNote({ children, className, variant = 'default' }: DisclaimerNoteProps) {
  const variantStyles = {
    default: 'bg-muted/50 border-border/50 text-muted-foreground',
    info: 'bg-info-light border-info/20 text-info',
    warning: 'bg-warning-light border-warning/20 text-warning',
  };

  return (
    <div className={cn(
      "flex items-start gap-2 text-xs rounded-lg p-3 border",
      variantStyles[variant],
      className
    )}>
      <Info className="w-4 h-4 shrink-0 mt-0.5" />
      <p>{children}</p>
    </div>
  );
}
