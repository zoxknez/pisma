'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Globe, Mail, MailOpen, Clock, ArrowRight, UserCircle, LogOut, RefreshCw, Send } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { WaxSeal } from '@/components/WaxSeal';
import { LetterListSkeleton, EmptyState } from '@/components/ui/feedback';
import { useI18n } from '@/lib/i18n';
import type { SealDesign } from '@/types';

interface PublicLetter {
  id: string;
  senderName: string;
  createdAt: string;
  unlockAt: string;
  status: string;
  sealColor: string;
  sealDesign: string;
  paperType: string;
  message: string | null;
  isLocked: boolean;
}

export default function CommunityPage() {
  const { t } = useI18n();
  const { data: session, status } = useSession();
  const [letters, setLetters] = useState<PublicLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchLetters = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const res = await fetch('/api/letters/public');
      if (!res.ok) {
        throw new Error(t.errors.networkError);
      }
      const data = await res.json();
      setLetters(data.letters);
    } catch (err) {
      const message = err instanceof Error ? err.message : t.errors.somethingWentWrong;
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    fetchLetters();
  }, [fetchLetters]);

  const getLetterStatus = (letter: PublicLetter) => {
    if (letter.isLocked) {
      return { label: t.inbox.status.inTransit, color: 'text-yellow-400', icon: Clock };
    }
    return { label: t.inbox.status.opened, color: 'text-green-400', icon: MailOpen };
  };

  return (
    <main className="min-h-screen bg-black text-white p-6">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/">
              <h1 className="text-4xl font-serif font-bold tracking-tight">{t.home.title}</h1>
            </Link>
            <p className="text-gray-500 mt-1">
              {t.nav.community}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fetchLetters(true)}
              disabled={refreshing}
              className="text-gray-400 hover:text-white"
              aria-label={t.commandPalette.refresh}
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            
            {session ? (
              <>
                <Link href="/inbox">
                  <Button variant="ghost" className="text-gray-400 hover:text-white gap-2">
                    <Mail className="w-5 h-5" />
                    <span className="hidden sm:inline">{t.nav.inbox}</span>
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-gray-400 hover:text-white"
                    aria-label={t.nav.profile}
                  >
                    <UserCircle className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/write">
                  <Button className="gap-2 bg-white text-black hover:bg-gray-200">
                    <Send className="w-4 h-4" /> {t.nav.write}
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-gray-400 hover:text-white"
                  aria-label={t.nav.logout}
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </>
            ) : (
              <Link href="/auth/login">
                <Button className="bg-white text-black hover:bg-gray-200">
                  {t.auth.loginButton}
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Letters Grid */}
        <div className="space-y-4">
          {loading ? (
            <LetterListSkeleton count={6} />
          ) : error ? (
            <div className="text-center py-12 space-y-4">
              <p className="text-red-400">{error}</p>
              <Button
                variant="outline"
                onClick={() => fetchLetters()}
                className="gap-2 border-white/20"
              >
                <RefreshCw className="w-4 h-4" /> {t.common.tryAgain}
              </Button>
            </div>
          ) : letters.length === 0 ? (
            <EmptyState
              icon={<Globe className="w-10 h-10 text-gray-600" />}
              title={t.inbox.empty}
              description={t.inbox.emptyDesc}
              action={
                <Button onClick={() => router.push('/write')} className="gap-2 bg-white text-black hover:bg-gray-200">
                  <Send className="w-4 h-4" /> {t.nav.write}
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {letters.map((letter) => {
                const status = getLetterStatus(letter);
                const StatusIcon = status.icon;

                return (
                  <motion.div
                    key={letter.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl p-4 transition-all cursor-pointer overflow-hidden"
                    onClick={() => !letter.isLocked && router.push(`/letter/${letter.id}`)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <WaxSeal 
                            color={letter.sealColor} 
                            design={letter.sealDesign as SealDesign} 
                            className="w-10 h-10" 
                          />
                          {letter.isLocked && (
                            <div className="absolute -bottom-1 -right-1 bg-black/80 rounded-full p-1 border border-white/10">
                              <Clock className="w-3 h-3 text-yellow-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{letter.senderName || 'Anonymous'}</h3>
                          <p className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(letter.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {letter.message && (
                      <p className="text-gray-400 text-sm line-clamp-3 mb-4 font-serif italic">
                        "{letter.message}"
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 mt-auto pt-4 border-t border-white/5">
                      <div className={`flex items-center gap-1.5 ${status.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span>{status.label}</span>
                      </div>
                      
                      {!letter.isLocked && (
                        <div className="flex items-center gap-1 text-white/40 group-hover:text-white transition-colors">
                          <span>{t.common.read}</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
