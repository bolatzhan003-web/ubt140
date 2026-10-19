export default function Mascot({ size = 'md', greeting, showCloud = true, animated = true }) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-36 h-36',
    xl: 'w-48 h-48 sm:w-56 sm:h-56'
  };

  return (
    <div className="relative inline-flex flex-col items-center select-none group">
      {/* Speech Cloud */}
      {showCloud && greeting && (
        <div className="relative mb-3 max-w-xs sm:max-w-sm bg-white text-gray-800 text-xs sm:text-sm font-medium px-4 py-2.5 rounded-2xl shadow-xl border-2 border-amber-300 animate-bounce">
          <span className="font-bold text-amber-600 block mb-0.5">🐆 Барсик (UBT 140 Mascot):</span>
          {greeting}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-2 border-b-2 border-amber-300 transform rotate-45" />
        </div>
      )}

      {/* SVG Mascot - Snow Leopard "Barsik" with Graduation Cap & Kazakh Ornament details */}
      <div className={`${sizeClasses[size] || sizeClasses.md} ${animated ? 'hover:scale-105 transition-transform duration-300' : ''}`}>
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="50%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#eab308" />
            </linearGradient>
            <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
          </defs>

          {/* Aura ring */}
          <circle cx="100" cy="100" r="92" fill="#f0f9ff" stroke="#38bdf8" strokeWidth="4" strokeDasharray="6 4" opacity="0.8" />

          {/* Ears */}
          <circle cx="60" cy="55" r="22" fill="#cbd5e1" stroke="#475569" strokeWidth="3" />
          <circle cx="60" cy="55" r="13" fill="#f43f5e" opacity="0.7" />
          <circle cx="140" cy="55" r="22" fill="#cbd5e1" stroke="#475569" strokeWidth="3" />
          <circle cx="140" cy="55" r="13" fill="#f43f5e" opacity="0.7" />

          {/* Head */}
          <ellipse cx="100" cy="98" rx="60" ry="52" fill="url(#bodyGrad)" stroke="#334155" strokeWidth="3.5" />

          {/* Leopard spots on cheeks and forehead */}
          <circle cx="65" cy="75" r="4.5" fill="#475569" />
          <circle cx="76" cy="68" r="3" fill="#475569" />
          <circle cx="135" cy="75" r="4.5" fill="#475569" />
          <circle cx="124" cy="68" r="3" fill="#475569" />
          <circle cx="100" cy="64" r="3.5" fill="#475569" />

          {/* Cheeks blush */}
          <ellipse cx="62" cy="112" rx="9" ry="5" fill="#fda4af" opacity="0.8" />
          <ellipse cx="138" cy="112" rx="9" ry="5" fill="#fda4af" opacity="0.8" />

          {/* Big Sparkly Eyes */}
          <ellipse cx="78" cy="96" rx="13" ry="16" fill="#0284c7" />
          <ellipse cx="122" cy="96" rx="13" ry="16" fill="#0284c7" />
          {/* Eye Pupils & Highlights */}
          <ellipse cx="78" cy="98" rx="8" ry="12" fill="#0f172a" />
          <ellipse cx="122" cy="98" rx="8" ry="12" fill="#0f172a" />
          <circle cx="74" cy="92" r="4" fill="#ffffff" />
          <circle cx="81" cy="103" r="2" fill="#ffffff" />
          <circle cx="118" cy="92" r="4" fill="#ffffff" />
          <circle cx="125" cy="103" r="2" fill="#ffffff" />

          {/* Cute Muzzle */}
          <ellipse cx="100" cy="118" rx="22" ry="15" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
          {/* Nose */}
          <polygon points="94,110 106,110 100,118" fill="#e11d48" rx="2" />
          {/* Smile */}
          <path d="M 94 121 Q 100 127 100 120 Q 100 127 106 121" fill="none" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />

          {/* Kazakh Flag Tie / Scarf */}
          <path d="M 85 142 L 115 142 L 105 178 L 100 172 L 95 178 Z" fill="url(#blueGrad)" stroke="#0369a1" strokeWidth="1.5" />
          {/* Gold sun ornament on tie */}
          <circle cx="100" cy="155" r="5" fill="url(#goldGrad)" />
          <circle cx="100" cy="155" r="8" fill="none" stroke="#fde047" strokeWidth="1" strokeDasharray="2 2" />

          {/* Academic Graduation Cap (Конфедератка) */}
          <polygon points="100,20 165,42 100,56 35,42" fill="#1e1b4b" stroke="#312e81" strokeWidth="2" />
          <path d="M 65 47 L 65 62 Q 100 75 135 62 L 135 47" fill="#1e1b4b" stroke="#312e81" strokeWidth="1.5" />
          {/* Cap Button & Tassel */}
          <circle cx="100" cy="38" r="4" fill="url(#goldGrad)" />
          <path d="M 100 38 Q 138 42 144 65" fill="none" stroke="#eab308" strokeWidth="3" strokeLinecap="round" />
          <rect x="141" y="65" width="6" height="12" rx="2" fill="#eab308" />

          {/* 140 Star Badge on paws */}
          <circle cx="100" cy="184" r="14" fill="url(#goldGrad)" stroke="#ca8a04" strokeWidth="2" />
          <text x="100" y="188" textAnchor="middle" fontSize="10" fontWeight="900" fill="#78350f" fontFamily="sans-serif">140</text>
        </svg>
      </div>
    </div>
  );
}
