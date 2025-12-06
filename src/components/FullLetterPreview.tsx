'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Clock, User, Mail, Eye, EyeOff, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WaxSeal } from '@/components/WaxSeal';
import { useI18n } from '@/lib/i18n';
import type { SealDesign } from '@/types';

interface FullLetterPreviewProps {
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
    isAnonymous: boolean;
    letterStyle: string;
  };
}

export function FullLetterPreview({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isLoading,
  data 
}: FullLetterPreviewProps) {
  const { t, language } = useI18n();
  const [previewStage, setPreviewStage] = useState<'envelope' | 'opening' | 'letter'>('envelope');
  const [isAnimating, setIsAnimating] = useState(false);

  // Reset stage when modal opens
  useEffect(() => {
    if (isOpen) {
      setPreviewStage('envelope');
      setIsAnimating(false);
    }
  }, [isOpen]);

  const getDeliveryText = () => {
    if (data.deliveryType === 'scheduled' && data.scheduledDate) {
      return data.scheduledDate.toLocaleString();
    }
    if (data.duration < 24) {
      return `${data.duration} ${data.duration === 1 ? 'sat' : 'sati'}`;
    }
    const days = Math.floor(data.duration / 24);
    return `${days} ${days === 1 ? 'dan' : 'dana'}`;
  };

  const handleEnvelopeClick = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setPreviewStage('opening');
    setTimeout(() => {
      setPreviewStage('letter');
      setIsAnimating(false);
    }, 1500);
  };

  const paperStyles: Record<string, { bg: string; text: string; texture: string }> = {
    classic: { 
      bg: 'bg-[#fdfbf7]', 
      text: 'text-gray-900',
      texture: "bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"
    },
    vintage: { 
      bg: 'bg-[#efe5cd]', 
      text: 'text-gray-900',
      texture: "bg-[url('https://www.transparenttextures.com/patterns/old-map.png')]"
    },
    dark: { 
      bg: 'bg-neutral-900', 
      text: 'text-white',
      texture: "bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]"
    },
    parchment: { 
      bg: 'bg-[#d4c4a8]', 
      text: 'text-gray-900',
      texture: "bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')]"
    },
    elegant: { 
      bg: 'bg-gradient-to-br from-[#f8f6f0] to-[#e8e4d8]', 
      text: 'text-gray-900',
      texture: "bg-[url('https://www.transparenttextures.com/patterns/rice-paper-2.png')]"
    },
    midnight: { 
      bg: 'bg-gradient-to-br from-[#1a1a2e] to-[#16213e]', 
      text: 'text-blue-100',
      texture: ""
    },
    rose: { 
      bg: 'bg-gradient-to-br from-[#fff5f5] to-[#ffe4e6]', 
      text: 'text-rose-900',
      texture: ""
    },
    forest: { 
      bg: 'bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7]', 
      text: 'text-green-900',
      texture: ""
    },
  };

  const letterStyles: Record<string, { border: string; decoration: string }> = {
    minimal: { border: '', decoration: '' },
    elegant: { border: 'border-2 border-amber-200/50', decoration: 'before:absolute before:inset-4 before:border before:border-amber-300/30 before:pointer-events-none' },
    romantic: { border: 'border-2 border-rose-200/50', decoration: 'shadow-[0_0_40px_rgba(244,63,94,0.1)]' },
    royal: { border: 'border-4 border-double border-amber-400/40', decoration: '' },
    vintage: { border: 'border border-amber-800/20', decoration: 'shadow-[inset_0_0_100px_rgba(139,69,19,0.1)]' },
  };

  const currentPaper = paperStyles[data.paperType] || paperStyles.classic;
  const currentStyle = letterStyles[data.letterStyle] || letterStyles.minimal;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Info Panel - Left Side */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden lg:flex flex-col gap-4 p-6 w-72"
          >
            <h3 className="text-white/60 text-sm uppercase tracking-wider">Preview Details</h3>
            
            <div className="space-y-3">
              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                  <User className="w-3 h-3" />
                  {data.isAnonymous ? 'Anonymous until opened' : 'From'}
                </div>
                <p className="text-white text-sm font-medium">
                  {data.isAnonymous ? '🎭 ???' : (data.senderName || 'Anonymous')}
                </p>
              </div>

              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                  <Mail className="w-3 h-3" />
                  To
                </div>
                <p className="text-white text-sm font-medium">{data.recipientName || 'Dear friend'}</p>
                <p className="text-gray-500 text-xs">{data.recipientEmail}</p>
              </div>

              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                  <Clock className="w-3 h-3" />
                  Delivery
                </div>
                <p className="text-white text-sm font-medium">{getDeliveryText()}</p>
              </div>

              {data.hasAudio && (
                <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <p className="text-blue-300 text-xs">🎤 Voice message attached</p>
                </div>
              )}

              {data.isPublic && (
                <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <p className="text-purple-300 text-xs">🌐 Public letter</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Main Preview Area */}
          <div className="flex-1 flex items-center justify-center p-4 max-w-3xl">
            <AnimatePresence mode="wait">
              {previewStage === 'envelope' && (
                <motion.div
                  key="envelope"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                  className="text-center space-y-8"
                >
                  {/* Envelope */}
                  <div 
                    className="relative w-80 h-52 mx-auto cursor-pointer group"
                    onClick={handleEnvelopeClick}
                  >
                    {/* Envelope shadow */}
                    <div className="absolute inset-0 bg-black/20 rounded-sm translate-y-2 blur-xl" />
                    
                    {/* Envelope body */}
                    <div className="relative w-full h-full bg-gradient-to-br from-[#e8d5b7] to-[#d4b896] rounded-sm shadow-2xl overflow-hidden">
                      {/* Inner shadow */}
                      <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.1)]" />
                      
                      {/* Envelope flap */}
                      <div className="absolute top-0 left-0 w-full h-0 border-l-[160px] border-r-[160px] border-t-[90px] border-l-transparent border-r-transparent border-t-[#d4b895] transform origin-top transition-transform duration-500 group-hover:-rotate-x-12" />
                      
                      {/* Wax Seal */}
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <motion.div
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <WaxSeal
                            color={data.sealColor}
                            design={data.sealDesign as SealDesign}
                            initials={data.sealInitials || undefined}
                            size="lg"
                          />
                        </motion.div>
                      </div>
                    </div>

                    {/* Hover glow */}
                    <div className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_60px_rgba(255,200,100,0.3)]" />
                  </div>

                  <div className="space-y-2">
                    <p className="text-white/60 text-sm">
                      {data.isAnonymous ? '🎭 ???' : `From: ${data.senderName || 'Anonymous'}`}
                    </p>
                    <h2 className="text-white text-xl font-serif">
                      {language === 'sr' ? 'Klikni za otvaranje' : 'Click to open'}
                    </h2>
                    <p className="text-white/40 text-sm">
                      {language === 'sr' ? 'Pogledaj kako će primalac videti tvoje pismo' : 'See how recipient will view your letter'}
                    </p>
                  </div>
                </motion.div>
              )}

              {previewStage === 'opening' && (
                <motion.div
                  key="opening"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center space-y-4"
                >
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0], y: [0, -20, -40, -60] }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className="w-80 h-52 mx-auto"
                  >
                    <div className="relative w-full h-full bg-gradient-to-br from-[#e8d5b7] to-[#d4b896] rounded-sm shadow-2xl">
                      {/* Opening flap */}
                      <motion.div
                        animate={{ rotateX: 180 }}
                        transition={{ duration: 0.8 }}
                        className="absolute top-0 left-0 w-full border-l-[160px] border-r-[160px] border-t-[90px] border-l-transparent border-r-transparent border-t-[#d4b895] origin-top"
                        style={{ transformStyle: 'preserve-3d' }}
                      />
                      
                      {/* Letter rising */}
                      <motion.div
                        animate={{ y: [-40, -100, -150] }}
                        transition={{ duration: 1.2, delay: 0.3 }}
                        className="absolute left-4 right-4 top-4 bottom-4 bg-white rounded-sm shadow-lg"
                      />
                    </div>
                  </motion.div>

                  <motion.p
                    animate={{ opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 1.5 }}
                    className="text-white/60"
                  >
                    <Sparkles className="inline w-4 h-4 mr-2" />
                    {language === 'sr' ? 'Otvaranje...' : 'Opening...'}
                  </motion.p>
                </motion.div>
              )}

              {previewStage === 'letter' && (
                <motion.div
                  key="letter"
                  initial={{ opacity: 0, y: 100, rotateX: -30 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ duration: 0.8, type: 'spring' }}
                  className="w-full max-w-xl"
                >
                  {/* Letter Paper */}
                  <div className={`relative ${currentPaper.bg} ${currentPaper.text} ${currentStyle.border} ${currentStyle.decoration} rounded-sm shadow-2xl overflow-hidden`}>
                    {/* Paper texture */}
                    {currentPaper.texture && (
                      <div className={`absolute inset-0 opacity-30 pointer-events-none mix-blend-multiply ${currentPaper.texture}`} />
                    )}

                    <div className="relative z-10 p-8 md:p-10 min-h-[60vh]">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-6 pb-4 border-b border-current/20">
                        <div className="space-y-1">
                          <p className="font-serif text-sm opacity-70">
                            {language === 'sr' ? 'Od' : 'From'}: <strong>{data.senderName || 'Anonymous'}</strong>
                          </p>
                          {data.recipientName && (
                            <p className="font-serif text-sm opacity-70">
                              {language === 'sr' ? 'Za' : 'To'}: <strong>{data.recipientName}</strong>
                            </p>
                          )}
                          <p className="font-serif text-xs opacity-40 mt-2">
                            {new Date().toLocaleDateString(language === 'sr' ? 'sr-RS' : 'en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <WaxSeal
                          color={data.sealColor}
                          design={data.sealDesign as SealDesign}
                          initials={data.sealInitials || undefined}
                          size="sm"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex flex-col items-center gap-6">
                        {data.preview && (
                          <motion.img
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            src={data.preview}
                            alt="Letter"
                            className="max-w-full max-h-[35vh] object-contain shadow-lg rounded transform rotate-1"
                          />
                        )}

                        {data.message && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="max-w-md text-center"
                          >
                            <p className="font-serif text-lg italic leading-relaxed opacity-80">
                              "{data.message.length > 150 ? data.message.slice(0, 150) + '...' : data.message}"
                            </p>
                          </motion.div>
                        )}

                        {data.hasAudio && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="flex items-center gap-3 px-4 py-2 bg-black/5 rounded-full"
                          >
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                              <span className="text-white text-xs">▶</span>
                            </div>
                            <span className="text-sm opacity-60">Voice message</span>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Reset button */}
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setPreviewStage('envelope')}
                      className="text-white/40 hover:text-white/60 text-sm transition-colors"
                    >
                      ↺ {language === 'sr' ? 'Pogledaj ponovo' : 'View again'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Panel - Right Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="hidden lg:flex flex-col justify-center gap-4 p-6 w-72"
          >
            <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
              <p className="text-green-300 text-sm">
                ✉️ {language === 'sr' ? 'Email obaveštenje stiže na' : 'Email notification will be sent to'}{' '}
                <strong>{data.recipientEmail}</strong>
              </p>
            </div>

            <div className="space-y-3 mt-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full border-white/20 text-white hover:bg-white/10"
                disabled={isLoading}
              >
                {language === 'sr' ? 'Uredi pismo' : 'Edit Letter'}
              </Button>
              
              <Button
                onClick={onConfirm}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full"
                    />
                    {language === 'sr' ? 'Šaljem...' : 'Sending...'}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    {language === 'sr' ? 'Pošalji pismo' : 'Send Letter'}
                  </span>
                )}
              </Button>
            </div>
          </motion.div>

          {/* Mobile Action Buttons */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur border-t border-white/10 flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-white/20"
              disabled={isLoading}
            >
              {language === 'sr' ? 'Uredi' : 'Edit'}
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full"
                />
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  {language === 'sr' ? 'Pošalji' : 'Send'}
                </span>
              )}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
