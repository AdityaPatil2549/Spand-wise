import React from 'react';
import { clsx } from 'clsx';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  subtitle?: string;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = false,
  subtitle,
  className,
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  }[size];

  const iconSvgSizes = {
    sm: 18,
    md: 22,
    lg: 26,
  }[size];

  return (
    <div className={clsx('flex items-center gap-2.5 select-none', className)}>
      {/* Precision Geometric FinTech Emblem */}
      <div
        className={clsx(
          iconDimensions,
          'relative flex items-center justify-center rounded-xl bg-gradient-to-b from-theme-surface via-theme-base to-theme-base border border-theme-border/80 shadow-sm group-hover:border-theme-accent/50 transition-all duration-300'
        )}
      >
        {/* Subtle Specular Glow */}
        <div className="absolute inset-0 rounded-xl bg-theme-accent/10 opacity-60 blur-xs pointer-events-none" />

        <svg
          width={iconSvgSizes}
          height={iconSvgSizes}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 text-theme-primary transition-transform duration-300 group-hover:scale-105"
        >
          {/* Base facet: upward geometric foundation */}
          <path
            d="M3 16.5L12 3L21 16.5H15L12 12L9 16.5H3Z"
            fill="currentColor"
            fillOpacity="0.15"
          />
          {/* Primary dynamic prism apex */}
          <path
            d="M12 3L20 15H14.5L12 11.25L9.5 15H4L12 3Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Signature Key Gem / Vault Diamond */}
          <path
            d="M12 8L14.5 12L12 16L9.5 12L12 8Z"
            className="fill-theme-accent"
          />
        </svg>
      </div>

      {showText && (
        <div className="min-w-0 flex-1 leading-none">
          <div className="flex items-center gap-1.5">
            <span className="font-sans font-bold text-base tracking-tight text-theme-primary">
              SpendWise
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-theme-accent" />
          </div>
          {subtitle && (
            <p className="text-[11px] font-sans font-medium text-theme-secondary tracking-normal mt-1">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

