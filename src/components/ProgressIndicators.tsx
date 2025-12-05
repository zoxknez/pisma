'use client';

import { motion } from 'framer-motion';
import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  label: string;
  description?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function StepIndicator({ steps, currentStep, className }: StepIndicatorProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isUpcoming = index > currentStep;

        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <motion.div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                  isCompleted && 'bg-green-500 border-green-500',
                  isCurrent && 'bg-white/10 border-white',
                  isUpcoming && 'bg-transparent border-white/20'
                )}
                initial={false}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                }}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    <Check className="w-5 h-5 text-white" />
                  </motion.div>
                ) : (
                  <span className={cn(
                    'text-sm font-medium',
                    isCurrent ? 'text-white' : 'text-white/40'
                  )}>
                    {index + 1}
                  </span>
                )}
              </motion.div>
              
              {/* Labels */}
              <div className="mt-2 text-center">
                <p className={cn(
                  'text-xs font-medium transition-colors',
                  isCurrent ? 'text-white' : isCompleted ? 'text-green-400' : 'text-white/40'
                )}>
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-[10px] text-white/30 mt-0.5 hidden sm:block">
                    {step.description}
                  </p>
                )}
              </div>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 bg-white/10 relative overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-green-500"
                  initial={{ width: 0 }}
                  animate={{ width: isCompleted ? '100%' : '0%' }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface UploadProgressProps {
  status: 'idle' | 'uploading' | 'processing' | 'sealing' | 'success' | 'error';
  progress?: number;
  message?: string;
  className?: string;
}

const statusConfig = {
  idle: { color: 'bg-white/20', text: 'text-white/60' },
  uploading: { color: 'bg-blue-500', text: 'text-blue-300' },
  processing: { color: 'bg-purple-500', text: 'text-purple-300' },
  sealing: { color: 'bg-amber-500', text: 'text-amber-300' },
  success: { color: 'bg-green-500', text: 'text-green-300' },
  error: { color: 'bg-red-500', text: 'text-red-300' },
};

export function UploadProgress({ status, progress = 0, message, className }: UploadProgressProps) {
  const config = statusConfig[status];

  if (status === 'idle') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn('space-y-3', className)}
    >
      {/* Progress bar */}
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', config.color)}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Status message */}
      <div className="flex items-center justify-between text-xs">
        <span className={config.text}>{message || status}</span>
        <span className="text-white/40">{progress}%</span>
      </div>

      {/* Animated dots for loading states */}
      {['uploading', 'processing', 'sealing'].includes(status) && (
        <div className="flex items-center gap-1 justify-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={cn('w-1.5 h-1.5 rounded-full', config.color)}
              animate={{
                y: [0, -5, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

interface SealingAnimationProps {
  isSealing: boolean;
  onComplete?: () => void;
}

export function SealingAnimation({ isSealing, onComplete }: SealingAnimationProps) {
  if (!isSealing) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onAnimationComplete={onComplete}
    >
      <div className="text-center">
        {/* Wax seal animation */}
        <motion.div
          className="relative w-32 h-32 mx-auto mb-8"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 1, bounce: 0.3 }}
        >
          {/* Outer glow */}
          <motion.div
            className="absolute inset-0 bg-red-500/30 rounded-full blur-xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          {/* Seal */}
          <div className="relative w-full h-full bg-gradient-to-br from-red-700 to-red-900 rounded-full flex items-center justify-center shadow-2xl">
            <motion.div
              className="text-4xl font-serif text-white/90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              ✉
            </motion.div>
          </div>
          
          {/* Dripping wax effect */}
          <motion.div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-8 bg-gradient-to-b from-red-800 to-red-900 rounded-full"
            initial={{ scaleY: 0, originY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          />
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className="text-2xl font-serif text-white mb-2">Sealing your letter...</h2>
          <p className="text-gray-400 text-sm">Adding the finishing touches</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
