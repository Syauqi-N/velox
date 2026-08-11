type MarketPulseProps = {
  compact?: boolean;
  className?: string;
};

export default function MarketPulse({ compact = false, className = "" }: MarketPulseProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 360 96"
      className={`market-pulse ${compact ? "market-pulse-compact" : ""} ${className}`}
      fill="none"
      preserveAspectRatio="none"
    >
      <path className="market-pulse-base" d="M0 66H360" />
      <path className="market-pulse-path" d="M0 68C24 62 28 46 48 54S78 72 95 56s24-31 43-22 25 30 46 18 23-34 45-25 25 35 47 21 24-25 43-15 23 22 41 10" />
      <circle className="market-pulse-dot" cx="317" cy="43" r="4" />
    </svg>
  );
}
