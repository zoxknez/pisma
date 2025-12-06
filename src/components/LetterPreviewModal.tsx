'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Clock, User, Mail, MessageSquare, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

interface LetterPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  data: {
    preview: string | null;
    senderName: string;
    recipientName: string;
    recipientEmail: string;
    message: string;
    paperType: string;
    sealColor: string;
    sealDesign: string;
    sealInitials: string;
    duration: number;
    scheduledDate: Date | null;
    deliveryType: 'duration' | 'scheduled';
    hasAudio: boolean;
    isPublic: boolean;
  };
}

export function LetterPreviewModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isLoading,
  data 
}: LetterPreviewModalProps) {
  const { t } = useI18n();

  const getDeliveryText = () => {
    if (data.deliveryType === 'scheduled' && data.scheduledDate) {
      return data.scheduledDate.toLocaleString();
    }
    if (data.duration < 24) {
      return `${data.duration} ${data.duration === 1 ? 'hour' : 'hours'}`;
    }
    const days = Math.floor(data.duration / 24);
    return `${days} ${days === 1 ? 'day' : 'days'}`;
  };

  const paperStyles = {
    classic: 'bg-[#f7f3e8]',
    vintage: 'bg-[#efe5cd]',
    dark: 'bg-neutral-800',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-neutral-900 border border-white/10 rounded-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-white/10 bg-neutral-900/95 backdrop-blur">
              <h2 className="text-xl font-serif font-bold text-white">
                📨 Preview Your Letter
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Letter Preview */}
              <div className="relative">
                {data.preview && (
                  <div className={`relative rounded-lg overflow-hidden ${paperStyles[data.paperType as keyof typeof paperStyles] || paperStyles.classic}`}>
                    <img 
                      src={data.preview} 
                      alt="Letter preview" 
                      className="w-full h-auto object-contain max-h-64"
                    />
                    
                    {/* Wax Seal Overlay */}
                    <div className="absolute bottom-4 right-4">
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                        style={{ 
                          backgroundColor: data.sealColor,
                          boxShadow: `0 4px 20px ${data.sealColor}66`
                        }}
                      >
                        {data.sealInitials ? (
                          <span className="text-white font-serif font-bold text-lg">
                            {data.sealInitials}
                          </span>
                        ) : (
                          <span className="text-white/80 text-2xl">
                            {data.sealDesign === 'heart' ? '♥' : 
                             data.sealDesign === 'star' ? '★' : 
                             data.sealDesign === 'crown' ? '♛' : '✉'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="grid gap-4">
                {/* From/To */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                      <User className="w-4 h-4" />
                      From
                    </div>
                    <p className="text-white font-medium">{data.senderName || 'Anonymous'}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                      <Mail className="w-4 h-4" />
                      To
                    </div>
                    <p className="text-white font-medium">{data.recipientName || data.recipientEmail}</p>
                    <p className="text-gray-500 text-sm">{data.recipientEmail}</p>
                  </div>
                </div>

                {/* Delivery */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Clock className="w-4 h-4" />
                    Delivery Time
                  </div>
                  <p className="text-white font-medium">{getDeliveryText()}</p>
                  {data.isPublic && (
                    <span className="inline-block mt-2 px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs">
                      Public Letter
                    </span>
                  )}
                </div>

                {/* Message */}
                {data.message && (
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                      <MessageSquare className="w-4 h-4" />
                      Digital Message
                    </div>
                    <p className="text-white whitespace-pre-wrap text-sm leading-relaxed">
                      {data.message.length > 200 
                        ? data.message.substring(0, 200) + '...' 
                        : data.message}
                    </p>
                  </div>
                )}

                {/* Audio */}
                {data.hasAudio && (
                  <div className="flex items-center gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <Mic className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-300 text-sm">Voice message attached</span>
                  </div>
                )}
              </div>

              {/* Email Notice */}
              <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                <p className="text-green-300 text-sm">
                  ✉️ An email notification will be sent to <strong>{data.recipientEmail}</strong> when the letter is ready to be opened.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 flex gap-3 p-4 border-t border-white/10 bg-neutral-900/95 backdrop-blur">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 border-white/20"
                disabled={isLoading}
              >
                Edit Letter
              </Button>
              <Button
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 bg-white text-black hover:bg-gray-200"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full"
                    />
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Send Letter
                  </span>
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
