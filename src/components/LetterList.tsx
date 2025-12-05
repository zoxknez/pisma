'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, MailOpen, Clock, Heart, Sparkles, Filter,
  Calendar, User, ChevronDown, Search, Archive,
  SortAsc, SortDesc, Grid, List
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Letter type
interface Letter {
  id: string;
  senderName?: string;
  recipientName?: string;
  recipientEmail?: string;
  message?: string;
  imageUrl?: string;
  unlockAt: string;
  openedAt?: string;
  createdAt: string;
  status: 'sealed' | 'delivered' | 'opened';
  sealColor?: string;
  sealDesign?: string;
  templateType?: string;
  reactions?: { emoji: string; userName?: string }[];
}

// Filter options
type FilterType = 'all' | 'unread' | 'read' | 'pending';
type SortType = 'newest' | 'oldest' | 'unlock';
type ViewType = 'grid' | 'list';

interface LetterListProps {
  letters: Letter[];
  type: 'inbox' | 'sent';
  onLetterClick: (id: string) => void;
  onArchive?: (id: string) => void;
}

export function LetterList({ letters, type, onLetterClick, onArchive }: LetterListProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('newest');
  const [view, setView] = useState<ViewType>('list');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort letters
  const filteredLetters = useMemo(() => {
    let result = [...letters];

    // Apply search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(letter => 
        letter.senderName?.toLowerCase().includes(searchLower) ||
        letter.recipientName?.toLowerCase().includes(searchLower) ||
        letter.recipientEmail?.toLowerCase().includes(searchLower) ||
        letter.message?.toLowerCase().includes(searchLower)
      );
    }

    // Apply filter
    const now = new Date();
    switch (filter) {
      case 'unread':
        result = result.filter(l => !l.openedAt && new Date(l.unlockAt) <= now);
        break;
      case 'read':
        result = result.filter(l => l.openedAt);
        break;
      case 'pending':
        result = result.filter(l => new Date(l.unlockAt) > now);
        break;
    }

    // Apply sort
    result.sort((a, b) => {
      switch (sort) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'unlock':
          return new Date(a.unlockAt).getTime() - new Date(b.unlockAt).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [letters, filter, sort, search]);

  const filterOptions: { value: FilterType; label: string; count: number }[] = useMemo(() => {
    const now = new Date();
    return [
      { value: 'all', label: 'Sva', count: letters.length },
      { value: 'unread', label: 'Nepročitana', count: letters.filter(l => !l.openedAt && new Date(l.unlockAt) <= now).length },
      { value: 'read', label: 'Pročitana', count: letters.filter(l => l.openedAt).length },
      { value: 'pending', label: 'Na čekanju', count: letters.filter(l => new Date(l.unlockAt) > now).length },
    ];
  }, [letters]);

  return (
    <div className="space-y-4">
      {/* Search and filters bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Pretraži pisma..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>

        {/* Filter toggle */}
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2 border-white/10 hover:bg-white/5"
        >
          <Filter className="w-4 h-4" />
          Filteri
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </Button>

        {/* View toggle */}
        <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded-md transition-colors ${view === 'list' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('grid')}
            className={`p-2 rounded-md transition-colors ${view === 'grid' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-4">
              {/* Filter tabs */}
              <div>
                <label className="text-xs text-white/60 uppercase tracking-wider mb-2 block">Status</label>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFilter(option.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                        filter === option.value
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-white/5 text-white/60 hover:text-white border border-transparent'
                      }`}
                    >
                      {option.label}
                      <span className="text-xs opacity-60">({option.count})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort options */}
              <div>
                <label className="text-xs text-white/60 uppercase tracking-wider mb-2 block">Sortiraj po</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSort('newest')}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                      sort === 'newest'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-white/5 text-white/60 hover:text-white border border-transparent'
                    }`}
                  >
                    <SortDesc className="w-3 h-3" /> Najnovije
                  </button>
                  <button
                    onClick={() => setSort('oldest')}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                      sort === 'oldest'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-white/5 text-white/60 hover:text-white border border-transparent'
                    }`}
                  >
                    <SortAsc className="w-3 h-3" /> Najstarije
                  </button>
                  <button
                    onClick={() => setSort('unlock')}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                      sort === 'unlock'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-white/5 text-white/60 hover:text-white border border-transparent'
                    }`}
                  >
                    <Clock className="w-3 h-3" /> Vreme otključavanja
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Letters list */}
      {filteredLetters.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Mail className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/40">
            {search ? 'Nema rezultata pretrage' : 'Nema pisama u ovoj kategoriji'}
          </p>
        </motion.div>
      ) : view === 'list' ? (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredLetters.map((letter, index) => (
              <LetterListItem
                key={letter.id}
                letter={letter}
                type={type}
                index={index}
                onClick={() => onLetterClick(letter.id)}
                onArchive={onArchive ? () => onArchive(letter.id) : undefined}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredLetters.map((letter, index) => (
              <LetterGridItem
                key={letter.id}
                letter={letter}
                type={type}
                index={index}
                onClick={() => onLetterClick(letter.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// List view item
interface LetterItemProps {
  letter: Letter;
  type: 'inbox' | 'sent';
  index: number;
  onClick: () => void;
  onArchive?: () => void;
}

function LetterListItem({ letter, type, index, onClick, onArchive }: LetterItemProps) {
  const now = new Date();
  const unlockDate = new Date(letter.unlockAt);
  const isLocked = unlockDate > now;
  const isUnread = !letter.openedAt && !isLocked;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={`group relative bg-white/5 hover:bg-white/10 rounded-xl p-4 border transition-all cursor-pointer ${
        isUnread ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/10'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isLocked 
            ? 'bg-blue-500/20' 
            : isUnread 
            ? 'bg-amber-500/20' 
            : 'bg-white/10'
        }`}>
          {isLocked ? (
            <Clock className="w-5 h-5 text-blue-400" />
          ) : isUnread ? (
            <Mail className="w-5 h-5 text-amber-400" />
          ) : (
            <MailOpen className="w-5 h-5 text-white/60" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-medium truncate ${isUnread ? 'text-white' : 'text-white/80'}`}>
              {type === 'inbox' 
                ? letter.senderName || 'Nepoznati pošiljalac'
                : letter.recipientName || letter.recipientEmail || 'Nepoznati primalac'
              }
            </h3>
            {isUnread && (
              <span className="w-2 h-2 bg-amber-400 rounded-full flex-shrink-0" />
            )}
          </div>
          <p className="text-sm text-white/50 truncate">
            {letter.message?.slice(0, 60) || 'Bez poruke'}
            {letter.message && letter.message.length > 60 ? '...' : ''}
          </p>
        </div>

        {/* Meta */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-xs text-white/40">
            {formatDate(letter.createdAt)}
          </span>
          {isLocked && (
            <span className="text-xs text-blue-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTimeUntil(unlockDate)}
            </span>
          )}
          {letter.reactions && letter.reactions.length > 0 && (
            <div className="flex -space-x-1">
              {letter.reactions.slice(0, 3).map((reaction, i) => (
                <span key={i} className="text-sm">{reaction.emoji}</span>
              ))}
            </div>
          )}
        </div>

        {/* Wax seal indicator */}
        {letter.sealColor && (
          <div 
            className="absolute top-2 right-2 w-3 h-3 rounded-full opacity-60"
            style={{ backgroundColor: letter.sealColor }}
          />
        )}
      </div>

      {/* Archive button on hover */}
      {onArchive && (
        <button
          onClick={(e) => { e.stopPropagation(); onArchive(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/10 rounded-lg"
        >
          <Archive className="w-4 h-4 text-white/40" />
        </button>
      )}
    </motion.div>
  );
}

// Grid view item
function LetterGridItem({ letter, type, index, onClick }: Omit<LetterItemProps, 'onArchive'>) {
  const now = new Date();
  const unlockDate = new Date(letter.unlockAt);
  const isLocked = unlockDate > now;
  const isUnread = !letter.openedAt && !isLocked;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={`group relative bg-white/5 hover:bg-white/10 rounded-2xl p-5 border transition-all cursor-pointer overflow-hidden ${
        isUnread ? 'border-amber-500/30' : 'border-white/10'
      }`}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500" />
      </div>

      {/* Wax seal */}
      {letter.sealColor && (
        <motion.div 
          className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-30"
          style={{ backgroundColor: letter.sealColor }}
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      )}

      <div className="relative">
        {/* Status badge */}
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs mb-3 ${
          isLocked 
            ? 'bg-blue-500/20 text-blue-400' 
            : isUnread 
            ? 'bg-amber-500/20 text-amber-400' 
            : 'bg-white/10 text-white/60'
        }`}>
          {isLocked ? (
            <>
              <Clock className="w-3 h-3" />
              Na čekanju
            </>
          ) : isUnread ? (
            <>
              <Sparkles className="w-3 h-3" />
              Novo
            </>
          ) : (
            <>
              <MailOpen className="w-3 h-3" />
              Otvoreno
            </>
          )}
        </div>

        {/* Sender/recipient */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-white text-sm">
              {type === 'inbox' 
                ? letter.senderName || 'Nepoznato'
                : letter.recipientName || letter.recipientEmail?.split('@')[0] || 'Nepoznato'
              }
            </h3>
          </div>
        </div>

        {/* Message preview */}
        <p className="text-sm text-white/50 line-clamp-2 mb-3 min-h-[2.5rem]">
          {letter.message || 'Bez poruke'}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-white/40">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(letter.createdAt)}
          </div>
          {letter.reactions && letter.reactions.length > 0 && (
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3 text-pink-400" />
              {letter.reactions.length}
            </div>
          )}
        </div>

        {/* Lock timer */}
        {isLocked && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/40">Otključava se za</span>
              <span className="text-blue-400 font-medium">{formatTimeUntil(unlockDate)}</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Helper functions
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Danas';
  if (days === 1) return 'Juče';
  if (days < 7) return `Pre ${days} dana`;
  
  return date.toLocaleDateString('sr-Latn', { day: 'numeric', month: 'short' });
}

function formatTimeUntil(date: Date): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default LetterList;
