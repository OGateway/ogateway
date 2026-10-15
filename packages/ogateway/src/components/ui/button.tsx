import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

const buttonVariants = cva(
  'og-button box-border inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-og-lg text-sm font-medium transition-colors outline-none disabled:pointer-events-none disabled:opacity-50 font-og-sans',
  {
    variants: {
      variant: {
        default: 'bg-og-primary text-white hover:bg-og-primary/90 border border-transparent',
        outline: 'bg-og-bg text-og-secondary border border-og-border hover:bg-og-muted',
        ghost: 'bg-transparent text-og-secondary border border-transparent hover:bg-og-muted',
      },
      size: {
        default: 'h-11 px-4',
        sm: 'h-9 px-3 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, loading, disabled, children, ...props }, ref) => {
  return (
    <button ref={ref} type="button" className={cn(buttonVariants({ variant, size, className }))} disabled={disabled || loading} {...props}>
      {loading && (
        <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {children}
    </button>
  );
});
Button.displayName = 'Button';
