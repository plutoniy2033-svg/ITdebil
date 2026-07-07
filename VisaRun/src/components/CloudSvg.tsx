import { useId } from 'react';

export type CloudVariant = 'cumulus-a' | 'cumulus-b' | 'cumulus-c' | 'stratus';

interface CloudSvgProps {
  variant: CloudVariant;
  className?: string;
  depth?: 'near' | 'mid' | 'far';
}

// Органические контуры кучевых облаков — не круги, а неровные «подушки»
const CLOUD_PATHS: Record<CloudVariant, string> = {
  'cumulus-a':
    'M18 78 C4 78 0 62 8 52 C2 38 18 28 34 34 C38 16 58 12 72 26 C88 18 108 30 104 48 C118 52 122 68 108 76 C112 90 92 98 74 94 C58 102 34 98 28 84 C16 86 10 78 18 78 Z',
  'cumulus-b':
    'M12 70 C0 68 2 52 14 44 C6 30 26 22 40 30 C48 14 70 10 82 24 C98 16 116 32 110 50 C124 56 126 72 110 78 C114 92 94 100 76 96 C60 104 36 100 30 86 C18 88 8 78 12 70 Z',
  'cumulus-c':
    'M22 74 C8 74 4 58 14 48 C6 34 24 26 38 32 C44 14 66 12 78 26 C94 18 112 34 106 52 C120 58 122 74 106 80 C110 94 88 100 70 96 C54 104 32 98 26 84 C14 86 8 76 22 74 Z',
  stratus:
    'M8 62 C2 62 0 54 6 48 C2 40 12 34 22 36 C26 28 40 26 48 32 C58 28 72 30 76 38 C86 36 94 44 90 52 C96 56 94 64 84 66 C86 72 74 76 64 74 C54 78 40 76 34 68 C24 70 14 66 8 62 Z',
};

// SVG-фильтр размывает и «рвёт» края — облако выглядит пушистым, а не геометрическим
function CloudFilter({ id, depth }: { id: string; depth: 'near' | 'mid' | 'far' }) {
  const blur = depth === 'near' ? 1.2 : depth === 'mid' ? 2 : 3.2;
  const turb = depth === 'near' ? 0.011 : depth === 'mid' ? 0.009 : 0.007;

  return (
    <filter id={id} x="-35%" y="-45%" width="170%" height="190%" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency={turb} numOctaves={4} seed={depth === 'near' ? 3 : depth === 'mid' ? 7 : 11} result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale={depth === 'near' ? 10 : depth === 'mid' ? 14 : 18} xChannelSelector="R" yChannelSelector="G" result="displaced" />
      <feGaussianBlur in="displaced" stdDeviation={blur} result="soft" />
      <feColorMatrix
        in="soft"
        type="matrix"
        values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.92 0"
        result="cloudBody"
      />
      <feOffset in="cloudBody" dx="0" dy={depth === 'near' ? 5 : 3} result="shadowOffset" />
      <feGaussianBlur in="shadowOffset" stdDeviation={depth === 'near' ? 6 : 4} result="shadowBlur" />
      <feColorMatrix
        in="shadowBlur"
        type="matrix"
        values="0 0 0 0 0.45  0 0 0 0 0.55  0 0 0 0 0.68  0 0 0 0.14 0"
        result="shadow"
      />
      <feMerge>
        <feMergeNode in="shadow" />
        <feMergeNode in="cloudBody" />
      </feMerge>
    </filter>
  );
}

export function CloudSvg({ variant, className = '', depth = 'mid' }: CloudSvgProps) {
  const uid = useId().replace(/:/g, '');
  const filterId = `cloud-filter-${uid}`;
  const gradId = `cloud-grad-${uid}`;
  const gradSoftId = `cloud-grad-soft-${uid}`;

  return (
    <svg
      className={`cloud-svg cloud-svg--${depth} ${className}`.trim()}
      viewBox="0 0 128 108"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        <CloudFilter id={filterId} depth={depth} />
        <radialGradient id={gradId} cx="42%" cy="36%" r="68%" fx="38%" fy="30%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
          <stop offset="45%" stopColor="#f8fbff" stopOpacity="0.94" />
          <stop offset="78%" stopColor="#e8f0f8" stopOpacity="0.72" />
          <stop offset="100%" stopColor="#d8e4f0" stopOpacity="0.35" />
        </radialGradient>
        <radialGradient id={gradSoftId} cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g filter={`url(#${filterId})`}>
        {/* Нижний слой — объём и мягкая тень внутри облака */}
        <path d={CLOUD_PATHS[variant]} fill={`url(#${gradSoftId})`} transform="translate(4 8) scale(0.96)" opacity="0.7" />
        <path d={CLOUD_PATHS[variant]} fill={`url(#${gradId})`} />
        {/* Верхний блик — как у настоящих кучевых облаков на солнце */}
        <ellipse cx="52" cy="42" rx="22" ry="14" fill="#ffffff" opacity="0.45" />
      </g>
    </svg>
  );
}
