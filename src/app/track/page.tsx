'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, Package, Clock, CheckCircle, Mail, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';

interface LetterStatus {
  id: string;
  status: 'sealed' | 'delivered' | 'opened';
  senderName: string | null;
  recipientName: string | null;
  createdAt: string;
  unlockAt: string;
  openedAt: string | null;
  paperType: string;
  sealDesign: string;
  sealColor: string;
}

export default function TrackPage() {
  const { t } = useI18n();
  const [id, setId] = useState('');
  const [letter, setLetter] = useState<LetterStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const router = useRouter();

  const statusConfig = {
    sealed: {
      icon: Package,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      label: t.inbox.status.inTransit,
      description: t.features.timeLockedDesc,
    },
    delivered: {
      icon: Mail,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      label: t.letter.delivered,
      description: t.inbox.status.ready,
    },
    opened: {
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      label: t.letter.opened,
      description: t.letter.openedAt,
    },
  };

  const handleTrack = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedId = id.trim();
    
    if (!trimmedId) {
      setError(t.track.placeholder);
      return;
    }

    setLoading(true);
    setError(null);
    setLetter(null);
    setSearched(true);

    try {
      const response = await fetch(`/api/letters/${trimmedId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError(t.track.notFound);
        } else if (response.status === 403) {
          setError(t.errors.unauthorized);
        } else {
          setError(t.errors.somethingWentWrong);
        }
        return;
      }

      const data = await response.json();
      setLetter(data.data);
    } catch {
      setError(t.errors.networkError);
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <main className="min-h-screen bg-black text-white p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto pt-20">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {t.common.back}
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-serif font-bold mb-4">{t.track.title}</h1>
          <p className="text-gray-400">{t.track.subtitle}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-2 mb-8 backdrop-blur-md"
        >
          <form onSubmit={handleTrack} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder={t.track.placeholder}
                className="w-full bg-transparent border-none text-white placeholder:text-gray-600 pl-12 pr-4 py-4 focus:outline-none focus:ring-0"
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading}
              className="h-auto px-8 bg-white text-black hover:bg-gray-200 rounded-xl"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t.track.trackButton}
            </Button>
          </form>
        </motion.div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}

          {letter && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md"
            >
              {/* Status Header */}
              <div className={`p-6 border-b border-white/10 ${statusConfig[letter.status].bgColor}`}>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full bg-black/20 ${statusConfig[letter.status].color}`}>
                    {(() => {
                      const Icon = statusConfig[letter.status].icon;
                      return <Icon className="w-6 h-6" />;
                    })()}
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg ${statusConfig[letter.status].color}`}>
                      {statusConfig[letter.status].label}
                    </h3>
                    <p className="text-sm text-white/60">
                      {statusConfig[letter.status].description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="p-6 space-y-8">
                <div className="relative pl-8 border-l-2 border-white/10 space-y-8">
                  {/* Created */}
                  <div className="relative">
                    <div className="absolute -left-[39px] p-1 bg-black rounded-full border-2 border-white/20">
                      <div className="w-3 h-3 bg-white/50 rounded-full" />
                    </div>
                    <p className="text-sm text-gray-400 mb-1">{t.track.created}</p>
                    <p className="font-medium">{formatDate(letter.createdAt)}</p>
                  </div>

                  {/* Unlock Time */}
                  <div className="relative">
                    <div className={`absolute -left-[39px] p-1 bg-black rounded-full border-2 ${
                      letter.status === 'sealed' ? 'border-amber-500 animate-pulse' : 'border-white/20'
                    }`}>
                      <div className={`w-3 h-3 rounded-full ${
                        letter.status === 'sealed' ? 'bg-amber-500' : 'bg-white/50'
                      }`} />
                    </div>
                    <p className="text-sm text-gray-400 mb-1">{t.inbox.unlockTime}</p>
                    <p className="font-medium">{formatDate(letter.unlockAt)}</p>
                  </div>

                  {/* Opened (if applicable) */}
                  {letter.openedAt && (
                    <div className="relative">
                      <div className="absolute -left-[39px] p-1 bg-black rounded-full border-2 border-green-500">
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                      </div>
                      <p className="text-sm text-gray-400 mb-1">{t.letter.openedAt}</p>
                      <p className="font-medium">{formatDate(letter.openedAt)}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
