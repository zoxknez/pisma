'use client';

import { motion } from 'framer-motion';
import type { SealDesign } from '@/types';
import { useI18n } from '@/lib/i18n';

interface WaxSealProps {
  color: string;
  design: SealDesign;
  initials?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  selected?: boolean;
  ariaLabel?: string;
  className?: string;
}

export function WaxSeal({ color, design, initials, size = 'md', onClick, selected, ariaLabel, className = '' }: WaxSealProps) {
  const { t } = useI18n();
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
  };

  const fontSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
  };

  const getDesignIcon = () => {
    switch (design) {
      case 'heart':
        return (
          <svg viewBox="0 0 24 24" className="w-1/2 h-1/2 fill-current opacity-80" aria-hidden="true">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        );
      case 'star':
        return (
          <svg viewBox="0 0 24 24" className="w-1/2 h-1/2 fill-current opacity-80" aria-hidden="true">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        );
      case 'crown':
        return (
          <svg viewBox="0 0 24 24" className="w-1/2 h-1/2 fill-current opacity-80" aria-hidden="true">
            <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm0 2h14v2H5v-2z"/>
          </svg>
        );
      case 'letter':
        return (
          <span className={`font-serif font-bold ${fontSizes[size]} opacity-90`} aria-hidden="true">
            {initials || 'P'}
          </span>
        );
      default:
        return (
          <span className={`font-serif font-bold ${fontSizes[size]} opacity-90`} aria-hidden="true">
            {initials ? initials.substring(0, 2).toUpperCase() : t.letter.sealed.toUpperCase()}
          </span>
        );
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel || `${design} wax seal${initials ? ` with initials ${initials}` : ''}`}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`
        ${sizeClasses[size]} 
        rounded-full 
        flex items-center justify-center
        ${onClick ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black' : ''}
        shadow-lg
        relative
        overflow-hidden
        ${selected ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''}
        ${className}
      `}
      style={{  
        backgroundColor: color,
        boxShadow: `0 4px 20px ${color}40, inset 0 2px 4px rgba(255,255,255,0.2), inset 0 -2px 4px rgba(0,0,0,0.3)`
      }}
    >
      {/* Wax texture overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 50%)',
        }}
      />
      
      {/* Drip effects */}
      <div 
        className="absolute -bottom-1 left-1/4 w-3 h-4 rounded-full"
        style={{ backgroundColor: color }}
      />
      <div 
        className="absolute -bottom-2 right-1/3 w-2 h-3 rounded-full"
        style={{ backgroundColor: color }}
      />
      
      {/* Inner circle with design */}
      <div 
        className="absolute inset-2 rounded-full flex items-center justify-center text-white/90"
        style={{
          boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4)'
        }}
      >
        {getDesignIcon()}
      </div>
    </motion.div>
  );
}

interface WaxSealSelectorProps {
  selectedColor: string;
  selectedDesign: string;
  initials: string;
  onColorChange: (color: string) => void;
  onDesignChange: (design: string) => void;
  onInitialsChange: (initials: string) => void;
}

export function WaxSealSelector({
  selectedColor,
  selectedDesign,
  initials,
  onColorChange,
  onDesignChange,
  onInitialsChange,
}: WaxSealSelectorProps) {
  const { t } = useI18n();

  const sealColors = [
    { name: t.sealColors.crimson, value: '#8B0000' },
    { name: t.sealColors.burgundy, value: '#722F37' },
    { name: t.sealColors.navy, value: '#1B3A57' },
    { name: t.sealColors.forest, value: '#2D5A3D' },
    { name: t.sealColors.royalPurple, value: '#4B2D73' },
    { name: t.sealColors.gold, value: '#B8860B' },
    { name: t.sealColors.black, value: '#1a1a1a' },
    { name: t.sealColors.rose, value: '#C08081' },
  ];

  const sealDesigns = [
    { name: t.sealDesigns.classic, value: 'classic' },
    { name: t.sealDesigns.heart, value: 'heart' },
    { name: t.sealDesigns.star, value: 'star' },
    { name: t.sealDesigns.crown, value: 'crown' },
    { name: t.sealDesigns.letter, value: 'letter' },
  ];

  return (
    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md space-y-6">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-300" id="wax-seal-label">{t.write.waxSeal}</label>
        <WaxSeal 
          color={selectedColor} 
          design={selectedDesign as SealDesign} 
          initials={initials}
          size="md"
          ariaLabel={t.write.waxSeal}
        />
      </div>

      {/* Color Selection */}
      <div className="space-y-2" role="group" aria-labelledby="seal-color-label">
        <label className="text-xs text-gray-500" id="seal-color-label">{t.write.sealColor}</label>
        <div className="flex flex-wrap gap-2">
          {sealColors.map((c) => (
            <button
              key={c.value}
              onClick={() => onColorChange(c.value)}
              className={`w-8 h-8 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black ${
                selectedColor === c.value ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : ''
              }`}
              style={{ backgroundColor: c.value }}
              title={c.name}
              aria-label={`${c.name} ${t.write.sealColor}`}
              aria-pressed={selectedColor === c.value}
            />
          ))}
        </div>
      </div>

      {/* Design Selection */}
      <div className="space-y-2" role="group" aria-labelledby="seal-design-label">
        <label className="text-xs text-gray-500" id="seal-design-label">{t.write.sealDesign}</label>
        <div className="flex gap-2" role="radiogroup">
          {sealDesigns.map((d) => (
            <button
              key={d.value}
              onClick={() => onDesignChange(d.value)}
              role="radio"
              aria-checked={selectedDesign === d.value}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-1 focus:ring-offset-black ${
                selectedDesign === d.value 
                  ? 'bg-white text-black' 
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>
      </div>

      {/* Initials Input */}
      {(selectedDesign === 'classic' || selectedDesign === 'letter') && (
        <div className="space-y-2">
          <label className="text-xs text-gray-500" htmlFor="seal-initials">{t.write.sealInitials}</label>
          <input
            id="seal-initials"
            type="text"
            value={initials}
            onChange={(e) => onInitialsChange(e.target.value.substring(0, 2).toUpperCase())}
            placeholder="AB"
            maxLength={2}
            aria-describedby="initials-hint"
            className="w-20 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-center text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 focus:ring-2 focus:ring-white/20 font-serif font-bold"
          />
          <span id="initials-hint" className="sr-only">Enter up to 2 characters for your seal initials</span>
        </div>
      )}
    </div>
  );
}
