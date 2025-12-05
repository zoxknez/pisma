'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, Package, Clock, CheckCircle, Mail, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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

const statusConfig = {
  sealed: {
    icon: Package,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    label: 'Sealed & In Transit',
    description: 'Your letter is safely sealed and waiting to be opened.',
  },
  delivered: {
    icon: Mail,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    label: 'Delivered',
    description: 'Your letter has been delivered and is ready to be opened.',
  },
  opened: {
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    label: 'Opened',
    description: 'This letter has been opened and read.',
  },
};

export default function TrackPage() {
  const [id, setId] = useState('');
  const [letter, setLetter] = useState<LetterStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const router = useRouter();

  const handleTrack = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedId = id.trim();
    
    if (!trimmedId) {
      setError('Please enter a tracking ID');
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
          setError('Letter not found. Please check the tracking ID.');
        } else if (response.status === 403) {
          setError('You do not have permission to view this letter.');
        } else {
          setError('Something went wrong. Please try again.');
        }
        return;
      }

      const data = await response.json();
      setLetter(data.data);
    } catch {
      setError('Failed to track letter. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [id]);

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

  const getTimeUntilUnlock = (unlockAt: string) => {
    const now = new Date();
    const unlock = new Date(unlockAt);
    const diff = unlock.getTime() - now.getTime();

    if (diff <= 0) return 'Ready to open';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  const StatusIcon = letter ? statusConfig[letter.status].icon : Package;

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
        <Link 
          href="/"
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Link>
      </nav>

      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="z-10 w-full max-w-lg space-y-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4 tracking-tight">Track Letter</h1>
          <p className="text-gray-500 text-lg">Enter your tracking ID to check the status of your letter.</p>
        </motion.div>

        <motion.form 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          onSubmit={handleTrack} 
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
          <div className="relative flex items-center bg-black rounded-xl border border-white/10 p-2">
            <Search className="w-6 h-6 text-gray-500 ml-3 flex-shrink-0" />
            <input
              type="text"
              value={id}
              onChange={(e) => {
                setId(e.target.value);
                setError(null);
              }}
              placeholder="Enter tracking ID..."
              className="flex-1 bg-transparent border-none text-white placeholder:text-gray-600 focus:ring-0 px-4 py-3 outline-none font-mono min-w-0"
              aria-label="Tracking ID"
              disabled={loading}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="rounded-lg w-10 h-10 bg-white text-black hover:bg-gray-200 flex-shrink-0"
              disabled={loading}
              aria-label="Track letter"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </Button>
          </div>
        </motion.form>

        {/* Error Message */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-center gap-2 text-red-400 bg-red-500/10 rounded-lg p-4"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Letter Status Card */}
        <AnimatePresence mode="wait">
          {letter && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
            >
              {/* Status Header */}
              <div className={`p-6 ${statusConfig[letter.status].bgColor}`}>
                <div className="flex items-center justify-center gap-3">
                  <StatusIcon className={`w-8 h-8 ${statusConfig[letter.status].color}`} />
                  <div className="text-left">
                    <h2 className="text-xl font-semibold text-white">
                      {statusConfig[letter.status].label}
                    </h2>
                    <p className="text-sm text-white/60">
                      {statusConfig[letter.status].description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="p-6 space-y-4">
                {/* Sender/Recipient */}
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-1">From</p>
                    <p className="text-white font-medium">{letter.senderName || 'Anonymous'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-1">To</p>
                    <p className="text-white font-medium">{letter.recipientName || 'Anonymous'}</p>
                  </div>
                </div>

                <hr className="border-white/10" />

                {/* Timeline */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                      <Package className="w-5 h-5 text-white/60" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-sm text-white">Sent</p>
                      <p className="text-xs text-white/50">{formatDate(letter.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white/60" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-sm text-white">Unlock Date</p>
                      <p className="text-xs text-white/50">{formatDate(letter.unlockAt)}</p>
                    </div>
                    <span className="text-xs text-amber-500 font-medium">
                      {getTimeUntilUnlock(letter.unlockAt)}
                    </span>
                  </div>

                  {letter.openedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-sm text-white">Opened</p>
                        <p className="text-xs text-white/50">{formatDate(letter.openedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>

                <hr className="border-white/10" />

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => router.push(`/letter/${letter.id}`)}
                    className="flex-1"
                    variant="default"
                  >
                    View Letter
                  </Button>
                  <Button
                    onClick={() => {
                      setLetter(null);
                      setId('');
                      setSearched(false);
                    }}
                    variant="outline"
                  >
                    New Search
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state after search */}
        {searched && !letter && !error && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-500 text-center py-8"
          >
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No results found</p>
          </motion.div>
        )}
      </div>
    </main>
  );
}
