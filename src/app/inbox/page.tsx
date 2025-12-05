'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, Send, Mail, MailOpen, Clock, ArrowRight, User, LogOut, RefreshCw, Trash2, MoreVertical, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { WaxSeal } from '@/components/WaxSeal';
import { LetterListSkeleton, EmptyState } from '@/components/ui/feedback';
import { DeleteConfirmDialog } from '@/components/ui/dialog';
import { useDeleteLetter } from '@/hooks';
import { toast } from 'sonner';
import type { LetterListItem } from '@/types';

export default function InboxPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [letters, setLetters] = useState<LetterListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [letterToDelete, setLetterToDelete] = useState<LetterListItem | null>(null);
  const router = useRouter();

  const handleDeleteSuccess = useCallback(() => {
    if (letterToDelete) {
      setLetters(prev => prev.filter(l => l.id !== letterToDelete.id));
      setLetterToDelete(null);
    }
  }, [letterToDelete]);

  const { deleteLetter, loading: deleteLoading } = useDeleteLetter(handleDeleteSuccess);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  const fetchLetters = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const res = await fetch(`/api/letters?type=${activeTab}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch letters');
      }
      const data = await res.json();
      setLetters(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (session?.user) {
      fetchLetters();
    }
  }, [session, activeTab, fetchLetters]);

  const getLetterStatus = (letter: LetterListItem) => {
    const now = new Date();
    const unlockAt = new Date(letter.unlockAt);
    
    if (letter.status === 'opened') {
      return { label: 'Opened', color: 'text-green-400', icon: MailOpen };
    }
    if (now < unlockAt) {
      return { label: 'In Transit', color: 'text-yellow-400', icon: Clock };
    }
    return { label: 'Ready to Open', color: 'text-blue-400', icon: Mail };
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/">
              <h1 className="text-4xl font-serif font-bold tracking-tight">PISMA</h1>
            </Link>
            <p className="text-gray-500 mt-1">
              Welcome back, {session?.user?.name || 'Writer'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fetchLetters(true)}
              disabled={refreshing}
              className="text-gray-400 hover:text-white"
              aria-label="Refresh letters"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Link href="/profile">
              <Button 
                variant="ghost" 
                size="icon"
                className="text-gray-400 hover:text-white"
                aria-label="Profile"
              >
                <UserCircle className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/write">
              <Button className="gap-2 bg-white text-black hover:bg-gray-200">
                <Send className="w-4 h-4" /> Compose
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-gray-400 hover:text-white"
              aria-label="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('received')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
              activeTab === 'received'
                ? 'bg-white text-black'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <Inbox className="w-5 h-5" />
            Received
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
              activeTab === 'sent'
                ? 'bg-white text-black'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <Send className="w-5 h-5" />
            Sent
          </button>
        </div>

        {/* Letters List */}
        <div className="space-y-4">
          {loading ? (
            <LetterListSkeleton count={3} />
          ) : error ? (
            <div className="text-center py-12 space-y-4">
              <p className="text-red-400">{error}</p>
              <Button
                variant="outline"
                onClick={() => fetchLetters()}
                className="gap-2 border-white/20"
              >
                <RefreshCw className="w-4 h-4" /> Try Again
              </Button>
            </div>
          ) : letters.length === 0 ? (
            <EmptyState
              icon={activeTab === 'received' ? <Inbox className="w-10 h-10 text-gray-600" /> : <Send className="w-10 h-10 text-gray-600" />}
              title={activeTab === 'received' ? "No letters received yet" : "You haven't sent any letters yet"}
              description={activeTab === 'sent' ? "Write your first letter to someone special" : undefined}
              action={activeTab === 'sent' ? (
                <Link href="/write">
                  <Button variant="outline" className="gap-2 border-white/20 hover:bg-white/10">
                    Write your first letter <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : undefined}
            />
          ) : (
            <AnimatePresence>
              {letters.map((letter, index) => {
                const statusInfo = getLetterStatus(letter);
                const StatusIcon = statusInfo.icon;

                return (
                  <motion.div
                    key={letter.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/letter/${letter.id}`}>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group cursor-pointer">
                        <div className="flex items-center gap-4">
                          {/* Wax Seal */}
                          <WaxSeal
                            color={letter.sealColor}
                            design={letter.sealDesign as any}
                            initials={letter.sealInitials || undefined}
                            size="sm"
                          />

                          {/* Letter Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <User className="w-4 h-4 text-gray-500" />
                              <span className="font-medium truncate">
                                {activeTab === 'received'
                                  ? letter.senderName || 'Anonymous'
                                  : letter.recipientName || 'Unknown Recipient'}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className={`flex items-center gap-1 ${statusInfo.color}`}>
                                <StatusIcon className="w-4 h-4" />
                                {statusInfo.label}
                              </span>
                              <span>
                                {formatDistanceToNow(new Date(letter.createdAt), { addSuffix: true })}
                              </span>
                              {letter.templateType && (
                                <span className="capitalize">{letter.templateType.replace('-', ' ')}</span>
                              )}
                            </div>
                          </div>

                          {/* Arrow and Actions */}
                          <div className="flex items-center gap-2">
                            {activeTab === 'sent' && letter.status !== 'opened' && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setLetterToDelete(letter);
                                  setDeleteDialogOpen(true);
                                }}
                                className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                                aria-label="Delete letter"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                            <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-12">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold font-mono">
              {letters.filter(l => l.status === 'sealed').length}
            </div>
            <div className="text-sm text-gray-500">In Transit</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold font-mono">
              {letters.filter(l => l.status === 'delivered').length}
            </div>
            <div className="text-sm text-gray-500">Delivered</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold font-mono">
              {letters.filter(l => l.status === 'opened').length}
            </div>
            <div className="text-sm text-gray-500">Opened</div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName="this letter"
        onDelete={async () => {
          if (letterToDelete) {
            await deleteLetter(letterToDelete.id);
          }
        }}
        loading={deleteLoading}
      />
    </main>
  );
}
