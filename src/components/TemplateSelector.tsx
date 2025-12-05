'use client';

import { motion } from 'framer-motion';
import { Heart, Clock, Gift, Sparkles, Send } from 'lucide-react';

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

export const letterTemplates: LetterTemplate[] = [
  {
    id: 'love',
    name: 'Love Letter',
    type: 'love',
    description: 'Express your deepest feelings to someone special',
    promptText: 'Write about what makes them special to you, your favorite memories together, and your hopes for the future...',
    icon: <Heart className="w-6 h-6" />,
    paperType: 'vintage',
    sealColor: '#8B0000',
    sealDesign: 'heart',
    defaultDuration: 24,
  },
  {
    id: 'future-self',
    name: 'Letter to Future Self',
    type: 'future-self',
    description: 'Send a message to your future self',
    promptText: 'What do you want to remember? What are your current dreams, fears, and hopes? What advice would you give yourself?',
    icon: <Clock className="w-6 h-6" />,
    paperType: 'classic',
    sealColor: '#1B3A57',
    sealDesign: 'star',
    defaultDuration: 8760, // 1 year
  },
  {
    id: 'greeting',
    name: 'Special Occasion',
    type: 'greeting',
    description: 'Birthday wishes, anniversaries, and celebrations',
    promptText: 'Celebrate this special moment with heartfelt words. Share your wishes and what this occasion means to you...',
    icon: <Gift className="w-6 h-6" />,
    paperType: 'classic',
    sealColor: '#B8860B',
    sealDesign: 'crown',
    defaultDuration: 48,
  },
  {
    id: 'thank-you',
    name: 'Thank You Note',
    type: 'thank-you',
    description: 'Show gratitude in a meaningful way',
    promptText: 'Express your appreciation. What did they do? How did it make you feel? What impact did it have on your life?',
    icon: <Sparkles className="w-6 h-6" />,
    paperType: 'classic',
    sealColor: '#2D5A3D',
    sealDesign: 'classic',
    defaultDuration: 12,
  },
];

interface TemplateSelectorProps {
  selectedTemplate: string | null;
  onSelect: (template: LetterTemplate | null) => void;
}

export function TemplateSelector({ selectedTemplate, onSelect }: TemplateSelectorProps) {
  return (
    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
          <Send className="w-4 h-4" /> Letter Template
        </label>
        {selectedTemplate && (
          <button
            onClick={() => onSelect(null)}
            className="text-xs text-gray-500 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {letterTemplates.map((template) => (
          <motion.button
            key={template.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(template)}
            className={`p-4 rounded-xl text-left transition-all ${
              selectedTemplate === template.id
                ? 'bg-white/20 border-2 border-white'
                : 'bg-black/30 border border-white/10 hover:border-white/30'
            }`}
          >
            <div className={`mb-2 ${selectedTemplate === template.id ? 'text-white' : 'text-gray-400'}`}>
              {template.icon}
            </div>
            <h3 className="font-medium text-sm text-white mb-1">{template.name}</h3>
            <p className="text-xs text-gray-500 line-clamp-2">{template.description}</p>
          </motion.button>
        ))}
      </div>

      {selectedTemplate && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-white/5 rounded-lg"
        >
          <p className="text-xs text-gray-400 italic">
            "{letterTemplates.find(t => t.id === selectedTemplate)?.promptText}"
          </p>
        </motion.div>
      )}
    </div>
  );
}
