'use client';

import { motion } from 'framer-motion';
import { Heart, Clock, Gift, Sparkles, Send } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useMemo } from 'react';

export interface LetterTemplate {
  id: string;
  name: string;
  type: 'love' | 'future-self' | 'greeting' | 'thank-you';
  description: string;
  promptText: string;
  icon: React.ReactNode;
  paperType: string;
  sealColor: string;
  sealDesign: string;
  defaultDuration: number; // in hours
}

export function useLetterTemplates() {
  const { t } = useI18n();

  const templates: LetterTemplate[] = useMemo(() => [
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
  ], [t]);

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
            className={`p-4 rounded-xl text-left transition-all ${
              selectedTemplate === template.id
                ? 'bg-white text-black'
                : 'bg-white/5 hover:bg-white/10 text-gray-300'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={selectedTemplate === template.id ? 'text-black' : 'text-gray-400'}>
                {template.icon}
              </div>
              <span className="font-serif font-bold text-sm">{template.name}</span>
            </div>
            <p className={`text-xs ${selectedTemplate === template.id ? 'text-black/60' : 'text-gray-500'}`}>
              {template.description}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
