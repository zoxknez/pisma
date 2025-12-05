'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReactionPickerProps {
  letterId: string;
  existingReaction?: string;
  onReact: (emoji: string) => void;
}

const reactionEmojis = ['💝', '😢', '😊', '🥰', '😮', '🙏', '💪', '🎉'];

export function ReactionPicker({ letterId, existingReaction, onReact }: ReactionPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(existingReaction || null);

  const handleSelect = (emoji: string) => {
    setSelectedReaction(emoji);
    onReact(emoji);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
          selectedReaction
            ? 'bg-white/20'
            : 'bg-white/10 hover:bg-white/20 border border-white/20'
        }`}
      >
        {selectedReaction || '💭'}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black/90 border border-white/20 rounded-2xl p-2 flex gap-1 backdrop-blur-xl"
          >
            {reactionEmojis.map((emoji) => (
              <motion.button
                key={emoji}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleSelect(emoji)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xl hover:bg-white/20 transition-colors ${
                  selectedReaction === emoji ? 'bg-white/30' : ''
                }`}
              >
                {emoji}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ReactionDisplayProps {
  reactions: { emoji: string; userName?: string | null }[];
}

export function ReactionDisplay({ reactions }: ReactionDisplayProps) {
  if (reactions.length === 0) return null;

  // Group reactions by emoji
  const grouped = reactions.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex gap-2 flex-wrap">
      {Object.entries(grouped).map(([emoji, count]) => (
        <motion.div
          key={emoji}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-1 bg-white/10 rounded-full px-2 py-1"
        >
          <span className="text-lg">{emoji}</span>
          {count > 1 && (
            <span className="text-xs text-gray-400">{count}</span>
          )}
        </motion.div>
      ))}
    </div>
  );
}
