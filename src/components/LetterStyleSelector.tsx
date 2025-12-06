'use client';

import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface PaperStyle {
  id: string;
  name: string;
  nameEn: string;
  preview: string;
  textColor: string;
}

interface LetterStyle {
  id: string;
  name: string;
  nameEn: string;
  description: string;
}

const paperStyles: PaperStyle[] = [
  { id: 'classic', name: 'Klasično', nameEn: 'Classic', preview: 'bg-[#fdfbf7]', textColor: 'text-gray-800' },
  { id: 'vintage', name: 'Vintage', nameEn: 'Vintage', preview: 'bg-[#efe5cd]', textColor: 'text-gray-800' },
  { id: 'parchment', name: 'Pergament', nameEn: 'Parchment', preview: 'bg-[#d4c4a8]', textColor: 'text-gray-800' },
  { id: 'elegant', name: 'Elegantno', nameEn: 'Elegant', preview: 'bg-gradient-to-br from-[#f8f6f0] to-[#e8e4d8]', textColor: 'text-gray-800' },
  { id: 'dark', name: 'Tamno', nameEn: 'Dark', preview: 'bg-neutral-900', textColor: 'text-white' },
  { id: 'midnight', name: 'Ponoć', nameEn: 'Midnight', preview: 'bg-gradient-to-br from-[#1a1a2e] to-[#16213e]', textColor: 'text-blue-200' },
  { id: 'rose', name: 'Ruža', nameEn: 'Rose', preview: 'bg-gradient-to-br from-[#fff5f5] to-[#ffe4e6]', textColor: 'text-rose-800' },
  { id: 'forest', name: 'Šuma', nameEn: 'Forest', preview: 'bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7]', textColor: 'text-green-800' },
];

const letterStyles: LetterStyle[] = [
  { id: 'minimal', name: 'Minimalno', nameEn: 'Minimal', description: 'Čisto i jednostavno' },
  { id: 'elegant', name: 'Elegantno', nameEn: 'Elegant', description: 'Zlatni okvir' },
  { id: 'romantic', name: 'Romantično', nameEn: 'Romantic', description: 'Meki sjaj' },
  { id: 'royal', name: 'Kraljevsko', nameEn: 'Royal', description: 'Dvostruki okvir' },
  { id: 'vintage', name: 'Starinski', nameEn: 'Vintage', description: 'Antički stil' },
];

interface LetterStyleSelectorProps {
  selectedPaper: string;
  selectedStyle: string;
  onPaperChange: (paper: string) => void;
  onStyleChange: (style: string) => void;
}

export function LetterStyleSelector({
  selectedPaper,
  selectedStyle,
  onPaperChange,
  onStyleChange,
}: LetterStyleSelectorProps) {
  const { language } = useI18n();

  return (
    <div className="space-y-6">
      {/* Paper Type */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
          <Sparkles className="w-4 h-4" />
          {language === 'sr' ? 'Vrsta papira' : 'Paper Type'}
        </label>
        
        <div className="grid grid-cols-4 gap-2">
          {paperStyles.map((paper) => (
            <motion.button
              key={paper.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPaperChange(paper.id)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                selectedPaper === paper.id 
                  ? 'border-white ring-2 ring-white/30' 
                  : 'border-white/10 hover:border-white/30'
              }`}
            >
              <div className={`absolute inset-0 ${paper.preview}`} />
              
              {/* Sample text */}
              <div className={`absolute inset-0 flex items-center justify-center ${paper.textColor}`}>
                <span className="font-serif text-xs opacity-60">Aa</span>
              </div>

              {/* Selected indicator */}
              {selectedPaper === paper.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-black" />
                </motion.div>
              )}

              {/* Name on hover */}
              <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm p-1 opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white text-[10px] font-medium">
                  {language === 'sr' ? paper.name : paper.nameEn}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Letter Style */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
          <Sparkles className="w-4 h-4" />
          {language === 'sr' ? 'Stil pisma' : 'Letter Style'}
        </label>
        
        <div className="flex flex-wrap gap-2">
          {letterStyles.map((style) => (
            <motion.button
              key={style.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onStyleChange(style.id)}
              className={`px-4 py-2 rounded-lg border transition-all ${
                selectedStyle === style.id 
                  ? 'bg-white text-black border-white' 
                  : 'bg-white/5 text-white border-white/10 hover:border-white/30'
              }`}
            >
              <span className="text-sm font-medium">
                {language === 'sr' ? style.name : style.nameEn}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Hook to get paper styles for preview
export function usePaperStyles() {
  return paperStyles;
}

export function useLetterStyles() {
  return letterStyles;
}
