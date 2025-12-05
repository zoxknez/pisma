'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { LetterListItem, ApiError } from '@/types';

interface UseLettersOptions {
  type?: 'received' | 'sent';
  autoFetch?: boolean;
}

interface UseLettersReturn {
  letters: LetterListItem[];
  loading: boolean;
  error: string | null;
  fetchLetters: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useLetters(options: UseLettersOptions = {}): UseLettersReturn {
  const { type = 'received', autoFetch = true } = options;
  const [letters, setLetters] = useState<LetterListItem[]>([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchLetters = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/letters?type=${type}`);
      
      if (!res.ok) {
        const data: ApiError = await res.json();
        throw new Error(data.error || 'Failed to fetch letters');
      }

      const data = await res.json();
      setLetters(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [type]);

  return {
    letters,
    loading,
    error,
    fetchLetters,
    refetch: fetchLetters,
  };
}

// ============================================
// useLetterUpload Hook
// ============================================

interface UploadProgress {
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  progress: number;
  message: string;
}

interface UseLetterUploadReturn {
  upload: (formData: FormData, duration: number) => Promise<{ id: string } | null>;
  progress: UploadProgress;
  reset: () => void;
}

export function useLetterUpload(): UseLetterUploadReturn {
  const [progress, setProgress] = useState<UploadProgress>({
    status: 'idle',
    progress: 0,
    message: '',
  });

  const upload = useCallback(async (formData: FormData, duration: number) => {
    setProgress({ status: 'uploading', progress: 20, message: 'Uploading letter...' });

    try {
      const file = formData.get('file') as File;
      const filename = file?.name || 'letter.png';

      setProgress({ status: 'processing', progress: 50, message: 'Processing image...' });

      const res = await fetch(`/api/upload?filename=${encodeURIComponent(filename)}&duration=${duration}`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data: ApiError = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      setProgress({ status: 'success', progress: 100, message: 'Letter sealed!' });

      const data = await res.json();
      toast.success('Letter sealed successfully!');
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setProgress({ status: 'error', progress: 0, message });
      toast.error(message);
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setProgress({ status: 'idle', progress: 0, message: '' });
  }, []);

  return { upload, progress, reset };
}

// ============================================
// useReactions Hook
// ============================================

interface UseReactionsReturn {
  reactions: { emoji: string; userName?: string }[];
  addReaction: (emoji: string) => Promise<boolean>;
  removeReaction: () => Promise<boolean>;
  loading: boolean;
}

export function useReactions(letterId: string, initialReactions: { emoji: string; userName?: string }[] = []): UseReactionsReturn {
  const [reactions, setReactions] = useState(initialReactions);
  const [loading, setLoading] = useState(false);

  const addReaction = useCallback(async (emoji: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/letters/${letterId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      });

      if (!res.ok) {
        const data: ApiError = await res.json();
        throw new Error(data.error || 'Failed to add reaction');
      }

      // Optimistic update
      const newReaction = await res.json();
      setReactions(prev => {
        const filtered = prev.filter(r => r.userName !== newReaction.userName);
        return [...filtered, { emoji, userName: newReaction.userName }];
      });

      toast.success('Reaction added!');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add reaction';
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [letterId]);

  const removeReaction = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/letters/${letterId}/reactions`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to remove reaction');
      }

      toast.success('Reaction removed');
      return true;
    } catch (err) {
      toast.error('Failed to remove reaction');
      return false;
    } finally {
      setLoading(false);
    }
  }, [letterId]);

  return { reactions, addReaction, removeReaction, loading };
}

// ============================================
// useDeleteLetter Hook
// ============================================

interface UseDeleteLetterReturn {
  deleteLetter: (letterId: string) => Promise<boolean>;
  archiveLetter: (letterId: string) => Promise<boolean>;
  loading: boolean;
}

export function useDeleteLetter(onSuccess?: () => void): UseDeleteLetterReturn {
  const [loading, setLoading] = useState(false);

  const deleteLetter = useCallback(async (letterId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/letters/${letterId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data: ApiError = await res.json();
        throw new Error(data.error || 'Failed to delete letter');
      }

      toast.success('Letter deleted successfully');
      onSuccess?.();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete letter';
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  const archiveLetter = useCallback(async (letterId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/letters/${letterId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: true }),
      });

      if (!res.ok) {
        const data: ApiError = await res.json();
        throw new Error(data.error || 'Failed to archive letter');
      }

      toast.success('Letter archived');
      onSuccess?.();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to archive letter';
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  return { deleteLetter, archiveLetter, loading };
}

// ============================================
// useCountdown Hook
// ============================================

import { useEffect } from 'react';

export function useCountdown(targetDate: Date | string) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      return Math.max(0, target - now);
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const isExpired = timeLeft <= 0;

  const formatTime = (ms: number) => {
    if (ms <= 0) return '00:00:00';

    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    if (days > 0) {
      return `${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    timeLeft,
    isExpired,
    formatted: formatTime(timeLeft),
    days: Math.floor(timeLeft / (1000 * 60 * 60 * 24)),
    hours: Math.floor((timeLeft / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((timeLeft / (1000 * 60)) % 60),
    seconds: Math.floor((timeLeft / 1000) % 60),
  };
}

// ============================================
// useLocalStorage Hook
// ============================================

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
}

// ============================================
// useDebounce Hook
// ============================================

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// ============================================
// useMediaQuery Hook
// ============================================

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

// Convenience hooks for common breakpoints
export const useIsMobile = () => useMediaQuery('(max-width: 768px)');
export const useIsTablet = () => useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)');

