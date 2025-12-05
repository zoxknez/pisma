'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CharacterCounterProps {
  current: number;
  max: number;
  className?: string;
}

export function CharacterCounter({ current, max, className }: CharacterCounterProps) {
  const percentage = (current / max) * 100;
  const isNearLimit = percentage >= 80;
  const isOverLimit = current > max;

  return (
    <div className={cn('flex items-center gap-2 text-xs', className)}>
      <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={cn(
            'h-full rounded-full',
            isOverLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-white/30'
          )}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <span className={cn(
        isOverLimit ? 'text-red-400' : isNearLimit ? 'text-amber-400' : 'text-gray-500'
      )}>
        {current}/{max}
      </span>
    </div>
  );
}

interface EnhancedTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  showEmojiPicker?: boolean;
  className?: string;
  label?: string;
}

const QUICK_EMOJIS = ['❤️', '😊', '🥺', '✨', '💝', '🌹', '💫', '🦋', '🌸', '💌'];

export function EnhancedTextarea({
  value,
  onChange,
  placeholder,
  maxLength = 10000,
  showEmojiPicker = true,
  className,
  label,
}: EnhancedTextareaProps) {
  const [showEmojis, setShowEmojis] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const insertEmoji = useCallback((emoji: string) => {
    if (value.length + emoji.length <= maxLength) {
      onChange(value + emoji);
    }
    setShowEmojis(false);
  }, [value, onChange, maxLength]);

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">{label}</label>
          <CharacterCounter current={value.length} max={maxLength} />
        </div>
      )}
      
      <div className={cn(
        'relative bg-black/20 rounded-lg border transition-all duration-300',
        isFocused ? 'border-white/30 ring-1 ring-white/10' : 'border-white/10',
        className
      )}>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full bg-transparent p-3 text-sm text-white placeholder:text-gray-600 focus:outline-none min-h-[120px] resize-none"
          aria-label={label || 'Message input'}
        />
        
        {showEmojiPicker && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1">
            <AnimatePresence>
              {showEmojis && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, x: 10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: 10 }}
                  className="flex items-center gap-1 bg-black/80 backdrop-blur-sm rounded-full px-2 py-1 border border-white/10"
                >
                  {QUICK_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => insertEmoji(emoji)}
                      className="p-1 hover:scale-125 transition-transform"
                      aria-label={`Insert ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            
            <button
              type="button"
              onClick={() => setShowEmojis(!showEmojis)}
              className={cn(
                'p-2 rounded-full transition-all',
                showEmojis ? 'bg-white/20 text-white' : 'text-gray-500 hover:text-white hover:bg-white/10'
              )}
              aria-label="Toggle emoji picker"
              aria-expanded={showEmojis}
            >
              {showEmojis ? <X className="w-4 h-4" /> : <Smile className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface InputWithValidationProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export function InputWithValidation({
  label,
  error,
  hint,
  icon,
  className,
  ...props
}: InputWithValidationProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-xs text-gray-500">{label}</label>
      )}
      
      <div className={cn(
        'relative flex items-center bg-black/50 rounded-lg border transition-all duration-300',
        error ? 'border-red-500/50' : isFocused ? 'border-white/30' : 'border-white/10',
        className
      )}>
        {icon && (
          <span className="pl-3 text-gray-500">{icon}</span>
        )}
        <input
          {...props}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className={cn(
            'flex-1 bg-transparent px-4 py-2 text-white placeholder:text-gray-600 focus:outline-none',
            icon && 'pl-2'
          )}
        />
      </div>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-400"
        >
          {error}
        </motion.p>
      )}
      
      {hint && !error && (
        <p className="text-xs text-gray-600">{hint}</p>
      )}
    </div>
  );
}
