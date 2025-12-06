'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Clock, Play, Pause, QrCode, AlertCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { WaxSeal } from '@/components/WaxSeal';
import { AgingEffect, useAgingDescription } from '@/components/AgingEffect';
import { ReactionPicker, ReactionDisplay } from '@/components/ReactionPicker';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { useCountdown } from '@/hooks';
import { useI18n } from '@/lib/i18n';
import type { LetterWithReactions, SealDesign } from '@/types';

interface LetterViewProps {
  letter: LetterWithReactions;
}

export default function LetterView({ letter }: LetterViewProps) {
  const { t, language } = useI18n();
  const { getDescription } = useAgingDescription();
  const { data: session } = useSession();
  const { timeLeft, isExpired, formatted } = useCountdown(letter.unlockAt);
  const [isOpened, setIsOpened] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [reactions, setReactions] = useState(letter.reactions || []);
  const [openError, setOpenError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const isLocked = !isExpired;

  const handleOpen = useCallback(async () => {
    if (isLocked) return;
    
    setIsOpened(true);
    setTimeout(() => setShowContent(true), 1500);
    
    try {
      const res = await fetch(`/api/letters/${letter.id}/open`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        if (data.code === 'FORBIDDEN') {
          setOpenError(t.letter.unauthorized);
          setIsOpened(false);
          setShowContent(false);
          toast.error(t.letter.unauthorized);
        }
      }
    } catch (error) {
      console.error('Failed to mark letter as opened:', error);
    }
  }, [letter.id, isLocked, t]);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    toast.success(t.letter.linkCopied);
  }, [t]);

  const toggleAudio = useCallback(() => {
    if (audioRef.current) {
      if (isPlayingAudio) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlayingAudio(!isPlayingAudio);
    }
  }, [isPlayingAudio]);

  const handleReaction = useCallback(async (emoji: string) => {
    if (!session?.user) {
      toast.error(t.letter.signInToReact);
      return;
    }

    try {
      const res = await fetch(`/api/letters/${letter.id}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      });

      if (res.ok) {
        setReactions(prev => [
          ...prev.filter(r => r.userName !== session.user?.name),
          { emoji, userName: session.user?.name || undefined }
        ]);
        toast.success(t.letter.reactionAdded);
      } else {
        const data = await res.json();
        toast.error(data.error || t.letter.reactionFailed);
      }
    } catch (error) {
      toast.error(t.letter.reactionFailed);
    }
  }, [letter.id, session, t]);

  // Type-safe seal design
  const sealDesign = letter.sealDesign as SealDesign;

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden relative perspective-1000">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black z-0" />

      {/* Audio element */}
      {letter.audioUrl && (
        <audio
          ref={audioRef}
          src={letter.audioUrl}
          onEnded={() => setIsPlayingAudio(false)}
          preload="metadata"
        />
      )}

      {/* Error Message */}
      {openError && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500/10 border border-red-500/30 rounded-xl px-6 py-3 flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400">{openError}</p>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {isLocked ? (
          <motion.div 
            key="locked"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            className="z-10 w-full max-w-md text-center space-y-8"
          >
            {/* Wax Seal with Radar Animation */}
            <div className="relative w-48 h-48 mx-auto">
              <div className="absolute inset-0 border border-white/10 rounded-full" />
              <div className="absolute inset-4 border border-white/5 rounded-full" />
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-transparent to-white/20"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <WaxSeal
                  color={letter.sealColor}
                  design={sealDesign}
                  initials={letter.sealInitials || undefined}
                  size="lg"
                />
              </div>
            </div>

            <div>
              <h1 className="text-4xl font-serif font-bold mb-2">{t.stats.inTransit}</h1>
              <p className="text-gray-500">
                {t.letter.mysteryAwaits}
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md">
              <div className="text-3xl font-mono font-bold tabular-nums mb-2">
                {formatted}
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                <span>{t.letter.unlocksIn}</span>
              </div>
            </div>

            <Button variant="outline" onClick={copyLink} className="gap-2">
              <Share2 className="w-4 h-4" /> {t.letter.share}
            </Button>
          </motion.div>
        ) : !showContent ? (
          <motion.div 
            key="envelope"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="z-10 flex flex-col items-center gap-8"
          >
            <div 
              className={`relative w-80 h-52 bg-[#e0c9a6] shadow-2xl cursor-pointer transition-transform duration-1000 preserve-3d ${isOpened ? 'rotate-x-180' : ''}`}
              onClick={handleOpen}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Envelope Flap */}
              <motion.div 
                className="absolute top-0 left-0 w-full h-0 border-l-[160px] border-r-[160px] border-t-[100px] border-l-transparent border-r-transparent border-t-[#d4b895] origin-top z-20"
                animate={isOpened ? { rotateX: 180, zIndex: 0 } : { rotateX: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
              
              {/* Envelope Body with Wax Seal */}
              <div className="absolute inset-0 bg-[#e0c9a6] z-10 flex items-center justify-center">
                {!isOpened && (
                  <WaxSeal
                    color={letter.sealColor}
                    design={sealDesign}
                    initials={letter.sealInitials || undefined}
                    size="md"
                  />
                )}
              </div>

              {/* Letter Inside */}
              <motion.div 
                className="absolute top-2 left-4 right-4 bottom-2 bg-white shadow-md z-0"
                animate={isOpened ? { y: -100 } : { y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              />
            </div>

            {!isOpened && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <p className="text-gray-400 font-serif italic mb-2">{t.letter.openLetter}</p>
                <p className="text-gray-500 text-sm">{t.letter.clickToReveal}</p>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="z-20 w-full max-w-2xl relative"
          >
            <AgingEffect
              createdAt={new Date(letter.createdAt)}
              openedAt={letter.openedAt ? new Date(letter.openedAt) : null}
              paperType={letter.paperType}
              agingEnabled={letter.agingEnabled}
            >
              <div className={`p-8 md:p-12 shadow-2xl rounded-sm min-h-[80vh] ${
                letter.paperType === 'dark' ? 'bg-neutral-900 text-white' : 
                letter.paperType === 'vintage' ? 'bg-[#efe5cd] text-gray-900' : 
                'bg-[#fdfbf7] text-gray-900'
              }`}>
                {/* Paper Texture Overlay */}
                <div className={`absolute inset-0 opacity-50 pointer-events-none mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] ${
                  letter.paperType === 'dark' ? 'invert opacity-10' : ''
                }`} />
                
                <div className="relative z-10 h-full flex flex-col">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-8 border-b border-current/20 pb-4">
                    <div>
                      {letter.senderName && (
                        <p className="font-serif text-sm mb-1">{t.letter.from}: <strong>{letter.senderName}</strong></p>
                      )}
                      {letter.recipientName && (
                        <p className="font-serif text-sm">{t.letter.to}: <strong>{letter.recipientName}</strong></p>
                      )}
                      <p className="font-serif text-xs opacity-60 mt-2">
                        {new Date(letter.createdAt).toLocaleDateString(language === 'sr' ? 'sr-RS' : 'en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <WaxSeal
                        color={letter.sealColor}
                        design={sealDesign}
                        initials={letter.sealInitials || undefined}
                        size="sm"
                      />
                      {letter.agingEnabled && (
                        <span className="text-xs opacity-50">
                          {getDescription(new Date(letter.createdAt))}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 flex flex-col items-center justify-center gap-8">
                    <img 
                      src={letter.imageUrl} 
                      alt="Handwritten Letter" 
                      className="max-w-full max-h-[50vh] object-contain shadow-sm transform rotate-1" 
                    />
                    
                    {letter.message && (
                      <div className="max-w-md text-center">
                        <p className={`font-serif text-lg italic leading-relaxed ${
                          letter.paperType === 'dark' ? 'text-gray-300' : 'text-gray-800'
                        }`}>
                          "{letter.message}"
                        </p>
                      </div>
                    )}

                    {/* Audio Player */}
                    {letter.audioUrl && (
                      <div className="flex items-center gap-4 bg-black/10 rounded-full px-6 py-3">
                        <Button
                          onClick={toggleAudio}
                          variant="ghost"
                          size="icon"
                          className="w-10 h-10 rounded-full"
                        >
                          {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                        </Button>
                        <span className="text-sm font-medium">{t.letter.voiceMessage}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className={`mt-8 pt-4 border-t ${letter.paperType === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <ReactionDisplay reactions={reactions} />
                      <p className="font-mono text-xs opacity-40 uppercase tracking-widest">
                        ID: {letter.id.substring(0, 8)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AgingEffect>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 mt-6">
              {session?.user && (
                <ReactionPicker
                  letterId={letter.id}
                  existingReaction={reactions.find(r => r.userName === session.user?.name)?.emoji}
                  onReact={handleReaction}
                />
              )}
              <Button variant="outline" onClick={copyLink} className="gap-2">
                <Share2 className="w-4 h-4" /> {t.letter.share}
              </Button>
              <Button variant="outline" onClick={() => setShowQRCode(!showQRCode)} className="gap-2">
                <QrCode className="w-4 h-4" /> {t.features.qrCode}
              </Button>
            </div>

            {/* QR Code Modal */}
            <AnimatePresence>
              {showQRCode && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="mt-6"
                >
                  <QRCodeGenerator letterId={letter.id} sealColor={letter.sealColor} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
