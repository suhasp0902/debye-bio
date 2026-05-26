/**
 * Reusable Debye logo using the Sunset Bio-Wave theme.
 */
export default function BrandLogo({ idPrefix = 'logo', svgClass = 'nav-logo-svg', textClass = 'nav-logo-text' }) {
  const gradientA = `${idPrefix}-gradient-a`;
  const gradientB = `${idPrefix}-gradient-b`;

  return (
    <>
      <svg
        className={svgClass}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id={gradientA} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#581c87" />
            <stop offset="50%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#ffedd5" />
          </linearGradient>
          <linearGradient id={gradientB} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffedd5" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
        </defs>
        <polygon
          points="50,15 80,32.5 80,67.5 50,85 20,67.5 20,32.5"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.32"
          strokeWidth="4.5"
        />
        <circle cx="50" cy="15" r="4" fill="#f43f5e" />
        <circle cx="80" cy="32.5" r="4" fill="#ffedd5" />
        <circle cx="80" cy="67.5" r="4" fill="#f59e0b" />
        <circle cx="50" cy="85" r="4" fill="#ea580c" />
        <circle cx="20" cy="67.5" r="4" fill="#581c87" />
        <circle cx="20" cy="32.5" r="4" fill="#f43f5e" />
        <path d="M30,38 Q50,68 70,38" fill="none" stroke={`url(#${gradientA})`} strokeWidth="5" strokeLinecap="round" />
        <path d="M30,62 Q50,32 70,62" fill="none" stroke={`url(#${gradientB})`} strokeWidth="5" strokeLinecap="round" />
        <circle cx="50" cy="50" r="4.5" fill="#f43f5e" stroke="#f8fdff" strokeWidth="2" />
      </svg>
      <span className={textClass}>DEBYE</span>
    </>
  );
}
