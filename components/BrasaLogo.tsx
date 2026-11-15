// AI-assisted: generated with Claude (Anthropic) and reviewed by the Brasa team.

interface Props {
  size?: number;        // height in px; width follows the 100:120 ratio
  className?: string;
  title?: string;       // set it when the logo stands alone (no "brasa" text next to it)
}

/** Brasa symbol: a green leaf and a tongue of fire forming one flame. Colors follow the theme. */
export default function BrasaLogo({ size = 28, className = "", title }: Props) {
  return (
    <svg
      viewBox="0 0 100 120"
      height={size}
      width={(size * 100) / 120}
      className={`shrink-0 ${className}`}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <path d="M50 112 C26 108 14 86 20 64 C26 42 44 30 56 6 C60 40 48 70 50 112 Z" fill="var(--logo-leaf)" />
      <path d="M56 112 C58 76 66 48 62 18 C76 34 88 54 86 76 C84 98 72 110 56 112 Z" fill="var(--logo-ember)" />
    </svg>
  );
}