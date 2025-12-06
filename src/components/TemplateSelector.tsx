'use client';

import { motion } from 'framer-motion';
import { Heart, Clock, Gift, Sparkles, Send, PartyPopper } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useMemo } from 'react';

export interface LetterTemplate {
  id: string;
  name: string;
  type: 'love' | 'future-self' | 'greeting' | 'thank-you' | 'new-year';
  description: string;
  promptText: string;
  icon: React.ReactNode;
  paperType: string;
  sealColor: string;
  sealDesign: string;
  defaultDuration: number; // in hours
  seasonal?: boolean;
}

export function useLetterTemplates() {
  const { t } = useI18n();

  // Check if it's New Year season (Dec 1 - Jan 15)
  const isNewYearSeason = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const day = now.getDate();
    return (month === 11 && day >= 1) || (month === 0 && day <= 15);
  }, []);

  const templates: LetterTemplate[] = useMemo(() => {
    const baseTemplates: LetterTemplate[] = [
      {
        id: 'love',
        name: t.templates.love.name,
        type: 'love',
        description: t.templates.love.desc,
        promptText: t.templates.love.prompt,
        icon: <Heart className="w-6 h-6" />,
        paperType: 'vintage',
        sealColor: '#8B0000',
        sealDesign: 'heart',
        defaultDuration: 24,
      },
      {
        id: 'future-self',
        name: t.templates.future.name,
        type: 'future-self',
        description: t.templates.future.desc,
        promptText: t.templates.future.prompt,
        icon: <Clock className="w-6 h-6" />,
        paperType: 'classic',
        sealColor: '#1B3A57',
        sealDesign: 'star',
        defaultDuration: 8760,
      },
      {
        id: 'greeting',
        name: t.templates.greeting.name,
        type: 'greeting',
        description: t.templates.greeting.desc,
        promptText: t.templates.greeting.prompt,
        icon: <Gift className="w-6 h-6" />,
        paperType: 'classic',
        sealColor: '#B8860B',
        sealDesign: 'crown',
        defaultDuration: 48,
      },
      {
        id: 'thank-you',
        name: t.templates.thankYou.name,
        type: 'thank-you',
        description: t.templates.thankYou.desc,
        promptText: t.templates.thankYou.prompt,
        icon: <Sparkles className="w-6 h-6" />,
        paperType: 'classic',
        sealColor: '#2D5A3D',
        sealDesign: 'classic',
        defaultDuration: 12,
      },
    ];

    // Add New Year template during season
    if (isNewYearSeason) {
      baseTemplates.unshift({
        id: 'new-year',
        name: t.templates.newYear?.name || '🎆 New Year',
        type: 'new-year',
        description: t.templates.newYear?.desc || 'Send wishes for the new year',
        promptText: t.templates.newYear?.prompt || 'Write your new year wishes...',
        icon: <PartyPopper className="w-6 h-6" />,
        paperType: 'dark',
        sealColor: '#FFD700',
        sealDesign: 'star',
        defaultDuration: 24,
        seasonal: true,
      });
    }

    return baseTemplates;
  }, [t, isNewYearSeason]);

  return templates;
}

interface TemplateSelectorProps {
  selectedTemplate: string | null;
  onSelect: (template: LetterTemplate | null) => void;
}

export function TemplateSelector({ selectedTemplate, onSelect }: TemplateSelectorProps) {
  const { t } = useI18n();
  const templates = useLetterTemplates();

  return (
    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
          <Send className="w-4 h-4" /> {t.write.step1}
        </label>
        {selectedTemplate && (
          <button
            onClick={() => onSelect(null)}
            className="text-xs text-gray-500 hover:text-white"
          >
            {t.common.cancel}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {templates.map((template) => (
          <motion.button
            key={template.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(template)}
            className={`p-4 rounded-xl text-left transition-all relative overflow-hidden ${
              selectedTemplate === template.id
                ? 'bg-white text-black'
                : template.seasonal
                ? 'bg-gradient-to-br from-yellow-500/20 via-orange-500/10 to-red-500/20 hover:from-yellow-500/30 hover:via-orange-500/20 hover:to-red-500/30 text-gray-300 border border-yellow-500/30'
                : 'bg-white/5 hover:bg-white/10 text-gray-300'
            }`}
          >
            {/* Seasonal sparkle effect */}
            {template.seasonal && selectedTemplate !== template.id && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1 right-1 w-1 h-1 bg-yellow-400 rounded-full animate-pulse" />
                <div className="absolute top-3 right-4 w-0.5 h-0.5 bg-yellow-300 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
                <div className="absolute bottom-2 left-3 w-0.5 h-0.5 bg-orange-400 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
              </div>
            )}
            
            <div className="flex items-center gap-3 mb-2">
              <div className={`${
                selectedTemplate === template.id 
                  ? 'text-black' 
                  : template.seasonal 
                  ? 'text-yellow-400' 
                  : 'text-gray-400'
              }`}>
                {template.icon}
              </div>
              <span className="font-serif font-bold text-sm">
                {template.name}
                {template.seasonal && (
                  <span className="ml-1 text-[10px] bg-yellow-500/30 text-yellow-300 px-1.5 py-0.5 rounded-full">
                    ✨ Limited
                  </span>
                )}
              </span>
            </div>
            <p className={`text-xs ${
              selectedTemplate === template.id 
                ? 'text-black/60' 
                : template.seasonal 
                ? 'text-yellow-200/60' 
                : 'text-gray-500'
            }`}>
              {template.description}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
