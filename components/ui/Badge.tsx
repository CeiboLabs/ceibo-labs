import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'blue' | 'cyan' | 'purple' | 'green' | 'orange';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:
    'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-300/60 dark:border-slate-700/50',
  blue:
    'bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-300/50 dark:border-sky-500/20',
  cyan:
    'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-300/50 dark:border-cyan-500/20',
  purple:
    'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-300/50 dark:border-purple-500/20',
  green:
    'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-300/50 dark:border-emerald-500/20',
  orange:
    'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-300/50 dark:border-orange-500/20',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
