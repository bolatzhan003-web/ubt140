export default function BrandLogo({ 
  size = 'md', 
  variant = 'light',
  showDotKz = true,
  showIcon = true,
  className = '' 
}) {
  const iconSizes = {
    sm: 'h-7 w-7',
    md: 'h-9 w-9',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-4xl'
  };

  const isDark = variant === 'dark';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {showIcon && (
        <img
          src="/logo.png"
          alt="UBT140"
          className={`${iconSizes[size] || iconSizes.md} object-contain transition-transform group-hover:scale-105`}
        />
      )}
      <div className="flex items-baseline">
        <span className={`font-brand-ubt ${textSizes[size] || textSizes.md} leading-none tracking-tight`}>
          <span className={isDark ? 'text-white' : 'text-[#0a214d]'}>UBT</span>
          <span className="text-[#f59e0b]">140</span>
        </span>
        {showDotKz && (
          <span
            className={`font-sans font-extrabold text-[11px] leading-none ml-1 px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
              isDark
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                : 'bg-blue-50 text-blue-600 border border-blue-100 shadow-sm'
            }`}
          >
            KZ
          </span>
        )}
      </div>
    </div>
  );
}
