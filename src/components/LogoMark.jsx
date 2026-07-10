export default function LogoMark({ className = 'h-8 w-8' }) {
  // Placeholder mark: a registration-mark motif from technical drawing.
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <rect x="7" y="7" width="34" height="34" stroke="currentColor" strokeWidth="2" />
      <path d="M7 41 41 7" stroke="currentColor" strokeWidth="2" />
      <circle cx="41" cy="41" r="4" fill="var(--color-accent)" />
    </svg>
  )
}
