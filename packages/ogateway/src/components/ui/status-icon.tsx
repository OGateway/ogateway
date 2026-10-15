export function SuccessIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="32" fill="#00cc60" fillOpacity="0.12" />
      <circle cx="32" cy="32" r="22" fill="#00cc60" />
      <path d="M22 32.5l6.5 6.5L42 25" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FailureIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="32" fill="#dc2626" fillOpacity="0.1" />
      <circle cx="32" cy="32" r="22" fill="#dc2626" />
      <path d="M25 25l14 14M39 25L25 39" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
