import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

interface ClassLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBadge?: boolean;
  src?: string;
}

const SIZES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

/**
 * Professional Personal Teacher Logo for Cô Cao Tình (Lớp 8/1 - Yêu Khoa Học)
 * Styled in elegant royal blue and sky blue tones with STEM & Science symbols.
 */
export const ClassLogo: React.FC<ClassLogoProps> = ({
  size = 'md',
  className = '',
  showBadge = true,
  src,
}) => {
  const { config } = useApp();
  const [imgError, setImgError] = useState(false);
  const sizeClass = SIZES[size] || SIZES.md;
  const imageSource = src || config.customLogoUrl;

  if (imageSource && !imgError) {
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 ${sizeClass} ${className}`}>
        <img
          src={imageSource}
          alt="Logo Cô Cao Tình"
          className="h-full w-full rounded-full object-cover ring-2 ring-blue-500/80 shadow-md transition-transform hover:scale-105"
          onError={() => setImgError(true)}
        />
        {showBadge && size !== 'sm' && (
          <span
            className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[9px] font-black text-slate-950 shadow-xs ring-2 ring-white"
            title="Lớp 8/1 - Cô Cao Tình"
          >
            ★
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${sizeClass} ${className}`}>
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full drop-shadow-sm select-none transition-transform hover:scale-105"
      >
        <defs>
          {/* Main Blue Gradients */}
          <linearGradient id="logoBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>

          <linearGradient id="logoRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>

          <linearGradient id="logoInnerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f0f9ff" />
            <stop offset="60%" stopColor="#e0f2fe" />
            <stop offset="100%" stopColor="#bae6fd" />
          </linearGradient>

          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          <filter id="logoShadow" x="-10%" y="-10%" width="120%" height="125%" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#1e3a8a" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Outer Ring */}
        <circle cx="60" cy="60" r="58" fill="url(#logoRingGrad)" />
        <circle cx="60" cy="60" r="54" fill="#ffffff" />
        <circle cx="60" cy="60" r="51" fill="url(#logoInnerGrad)" />

        {/* Outer Concentric Dotted / Dashed Accent Ring */}
        <circle
          cx="60"
          cy="60"
          r="48"
          stroke="#0284c7"
          strokeWidth="1.2"
          strokeDasharray="2.5 2.5"
          opacity="0.6"
          fill="none"
        />

        {/* Atom Orbits in Background */}
        <ellipse
          cx="60"
          cy="50"
          rx="28"
          ry="11"
          stroke="#38bdf8"
          strokeWidth="1.5"
          transform="rotate(-25 60 50)"
          opacity="0.85"
        />
        <ellipse
          cx="60"
          cy="50"
          rx="28"
          ry="11"
          stroke="#38bdf8"
          strokeWidth="1.5"
          transform="rotate(25 60 50)"
          opacity="0.85"
        />

        {/* Electron Particles */}
        <circle cx="36" cy="40" r="2.5" fill="#0284c7" />
        <circle cx="84" cy="40" r="2.5" fill="#0284c7" />
        <circle cx="60" cy="61" r="2" fill="#2563eb" />

        {/* Science Sparkles */}
        <path d="M22 28L24 33L29 35L24 37L22 42L20 37L15 35L20 33Z" fill="url(#goldGrad)" opacity="0.9" />
        <path d="M98 28L100 33L105 35L100 37L98 42L96 37L91 35L96 33Z" fill="url(#goldGrad)" opacity="0.9" />

        {/* Microscope Silhouette (Left) */}
        <path
          d="M26 62C26 58 29 55 33 55H36V65H32C28.7 65 26 63.7 26 62Z"
          fill="#1d4ed8"
          opacity="0.8"
        />
        <rect x="33" y="48" width="4" height="12" rx="2" fill="#0284c7" transform="rotate(-15 35 54)" />
        <rect x="25" y="66" width="13" height="3" rx="1.5" fill="#1e40af" />

        {/* Laboratory Flask (Right) */}
        <path
          d="M87 50V56L93 66C93.5 66.8 93 68 92 68H78C77 68 76.5 66.8 77 66L83 56V50H87Z"
          fill="#0284c7"
          opacity="0.85"
        />
        <rect x="82" y="48" width="6" height="3" rx="1" fill="#1e40af" />
        <path d="M79 64L82 58H88L91 64C91 65 90 66 89 66H81C80 66 79 65 79 64Z" fill="#38bdf8" />
        <circle cx="83" cy="62" r="1.5" fill="#ffffff" opacity="0.8" />
        <circle cx="87" cy="64" r="1" fill="#ffffff" opacity="0.8" />

        {/* Center Shield / Crest */}
        <path
          d="M60 22C68 22 75 26 75 35C75 49 60 62 60 62C60 62 45 49 45 35C45 26 52 22 60 22Z"
          fill="url(#logoBlueGrad)"
          filter="url(#logoShadow)"
        />

        {/* Center Monogram / Star Icon */}
        <text
          x="60"
          y="42"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="14"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="0.5"
        >
          8/1
        </text>
        <circle cx="60" cy="49" r="2" fill="#fbbf24" />

        {/* Teacher Banner / Ribbon (Bottom Arch) */}
        <g filter="url(#logoShadow)">
          {/* Ribbon Ends */}
          <path d="M12 84L22 76V92L12 84Z" fill="#1e3a8a" />
          <path d="M108 84L98 76V92L108 84Z" fill="#1e3a8a" />

          {/* Main Ribbon Body */}
          <path
            d="M18 80C34 74 86 74 102 80C104 88 100 95 98 97C82 91 38 91 22 97C20 95 16 88 18 80Z"
            fill="url(#logoBlueGrad)"
          />
          <path
            d="M20 81C35 76 85 76 100 81"
            stroke="#7dd3fc"
            strokeWidth="1"
            fill="none"
          />

          {/* Ribbon Text: CÔ CAO TÌNH */}
          <text
            x="60"
            y="90"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="8.5"
            fontWeight="900"
            fontFamily="system-ui, -apple-system, sans-serif"
            letterSpacing="0.8"
          >
            CÔ CAO TÌNH
          </text>
        </g>

        {/* Open Book Motif (Bottom Center) */}
        <path
          d="M48 99C53 97 58 98 60 100C62 98 67 97 72 99V106C67 104 62 105 60 107C58 105 53 104 48 106V99Z"
          fill="#0284c7"
        />
        <path
          d="M49 100C53 98.5 57.5 99 59.5 101V105C57.5 103.5 53 103 49 104V100Z"
          fill="#ffffff"
        />
        <path
          d="M71 100C67 98.5 62.5 99 60.5 101V105C62.5 103.5 67 103 71 104V100Z"
          fill="#ffffff"
        />

        {/* Sub-text: Yêu Khoa Học (Curved top or bottom tagline) */}
        <text
          x="60"
          y="18"
          textAnchor="middle"
          fill="#0369a1"
          fontSize="7"
          fontWeight="800"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="1"
        >
          ✦ YÊU KHOA HỌC ✦
        </text>
      </svg>

      {/* Floating Active Badge */}
      {showBadge && size !== 'sm' && (
        <span
          className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[9px] font-black text-slate-950 shadow-xs ring-2 ring-white"
          title="Lớp 8/1 - Cô Cao Tình"
        >
          ★
        </span>
      )}
    </div>
  );
};
