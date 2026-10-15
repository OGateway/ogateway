import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/cn';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'og-input box-border h-11 w-full rounded-og-lg border border-og-border bg-og-bg px-3.5 text-sm text-og-secondary font-og-sans',
        'placeholder:text-og-placeholder outline-none transition-colors',
        'focus:border-og-primary focus:ring-2 focus:ring-og-primary/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className, children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        'og-select box-border h-11 w-full appearance-none rounded-og-lg border border-og-border bg-og-bg px-3.5 pr-9 text-sm text-og-secondary font-og-sans',
        'outline-none transition-colors',
        'focus:border-og-primary focus:ring-2 focus:ring-og-primary/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22%23555555%22><path d=%22M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z%22/></svg>')] bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat",
        className,
      )}
      {...props}>
      {children}
    </select>
  );
});
Select.displayName = 'Select';
