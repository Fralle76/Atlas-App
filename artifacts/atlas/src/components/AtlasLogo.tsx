interface AtlasLogoProps {
  size?: number;
  className?: string;
}

export function AtlasLogoMark({ size = 56, className = "" }: AtlasLogoProps) {
  const id = `logo-${size}`;
  const r = size / 2;
  const cx = r;
  const cy = r;
  const outerR = r * 0.9;
  const innerR = r * 0.72;

  const scale = size / 200;
  const aTop = 70 * scale;
  const aBottom = 135 * scale;
  const aLeft = 75 * scale;
  const aRight = 125 * scale;
  const aMidY = 115 * scale;
  const aMidLeft = 85 * scale;
  const aMidRight = 115 * scale;
  const hlLeft = 95 * scale;
  const hlRight = 105 * scale;
  const hlMid = 90 * scale;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className} aria-label="Atlas logo">
      <circle cx={cx} cy={cy} r={outerR} fill={`url(#chrome-${id})`} stroke={`url(#stroke-${id})`} strokeWidth={size * 0.025} />
      <circle cx={cx} cy={cy} r={innerR} fill="#0a0a0a" />
      <path
        d={`M ${aLeft} ${aBottom} L ${cx} ${aTop} L ${aRight} ${aBottom}`}
        fill="none"
        stroke={`url(#letter-${id})`}
        strokeWidth={size * 0.07}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1={aMidLeft} y1={aMidY}
        x2={aMidRight} y2={aMidY}
        stroke={`url(#letter-${id})`}
        strokeWidth={size * 0.055}
        strokeLinecap="round"
      />
      <path
        d={`M ${hlLeft} ${hlMid} L ${cx} ${aTop} L ${hlRight} ${hlMid}`}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={size * 0.015}
        opacity="0.6"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id={`chrome-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4A90E2" />
          <stop offset="50%" stopColor="#2E5C8A" />
          <stop offset="100%" stopColor="#1A3A5C" />
        </linearGradient>
        <linearGradient id={`stroke-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#87CEEB" />
          <stop offset="100%" stopColor="#4A90E2" />
        </linearGradient>
        <linearGradient id={`letter-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E8F4F8" />
          <stop offset="100%" stopColor="#B0D4E8" />
        </linearGradient>
      </defs>
    </svg>
  );
}
