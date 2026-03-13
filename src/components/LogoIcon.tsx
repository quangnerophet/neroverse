/**
 * Inline SVG logo — a circle + slash mark.
 * Uses fill="currentColor" so it adapts to light/dark mode via Tailwind text color.
 */
export function LogoIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Slash / parallelogram — top */}
      <polygon
        points="36,10 60,10 52,42 28,42"
        fill="currentColor"
      />
      {/* Circle — bottom */}
      <circle cx="50" cy="70" r="24" fill="currentColor" />
    </svg>
  );
}
