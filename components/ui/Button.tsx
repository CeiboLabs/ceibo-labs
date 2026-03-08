'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  href?: string;
  target?: string;
  rel?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-electric-400 to-cyan-400 text-navy-950 font-semibold hover:from-electric-300 hover:to-cyan-300 shadow-electric hover:shadow-glow-md transition-all duration-200',
  secondary:
    'bg-navy-700 dark:bg-navy-700 text-white border border-navy-600 hover:bg-navy-600 hover:border-electric-400/40 transition-all duration-200',
  outline:
    'border border-electric-400/50 text-electric-400 bg-transparent hover:bg-electric-400/10 hover:border-electric-400 transition-all duration-200',
  ghost:
    'text-slate-300 bg-transparent hover:text-white hover:bg-white/5 transition-all duration-200',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-7 py-3.5 text-base rounded-xl gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, href, target, rel, ...props }, ref) => {
    const classes = cn(
      'inline-flex items-center justify-center font-medium cursor-pointer select-none',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-400 focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      'active:scale-[0.97] transition-transform duration-100',
      variantClasses[variant],
      sizeClasses[size],
      className
    );

    if (href) {
      return (
        <a href={href} target={target} rel={rel} className={classes}>
          {children}
        </a>
      );
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
