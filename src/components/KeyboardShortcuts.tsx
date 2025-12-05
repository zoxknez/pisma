'use client';

import { useEffect, useCallback, useState, createContext, useContext, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, Search, Mail, Send, Inbox, Settings, Home, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Shortcut types
interface Shortcut {
  key: string;
  modifiers?: ('ctrl' | 'shift' | 'alt' | 'meta')[];
  description: string;
  action: () => void;
  category: 'navigation' | 'actions' | 'general';
}

interface KeyboardShortcutsContextType {
  registerShortcut: (id: string, shortcut: Shortcut) => void;
  unregisterShortcut: (id: string) => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  isCommandPaletteOpen: boolean;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | undefined>(undefined);

// Command Palette Component
function CommandPalette({ 
  isOpen, 
  onClose, 
  shortcuts 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  shortcuts: Map<string, Shortcut>;
}) {
  const [search, setSearch] = useState('');
  const router = useRouter();

  // Filter shortcuts based on search
  const filteredShortcuts = Array.from(shortcuts.values()).filter(shortcut =>
    shortcut.description.toLowerCase().includes(search.toLowerCase())
  );

  // Group by category
  const groupedShortcuts = filteredShortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  // Quick actions
  const quickActions = [
    { icon: <Home className="w-4 h-4" />, label: 'Početna', action: () => router.push('/'), shortcut: 'G H' },
    { icon: <Send className="w-4 h-4" />, label: 'Napiši pismo', action: () => router.push('/write'), shortcut: 'G W' },
    { icon: <Inbox className="w-4 h-4" />, label: 'Inbox', action: () => router.push('/inbox'), shortcut: 'G I' },
    { icon: <Search className="w-4 h-4" />, label: 'Prati pošiljku', action: () => router.push('/track'), shortcut: 'G T' },
    { icon: <Settings className="w-4 h-4" />, label: 'Podešavanja', action: () => router.push('/profile'), shortcut: 'G S' },
  ];

  const filteredQuickActions = quickActions.filter(action =>
    action.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (action: () => void) => {
    action();
    onClose();
    setSearch('');
  };

  // Reset search when closing
  useEffect(() => {
    if (!isOpen) setSearch('');
  }, [isOpen]);

  const categoryLabels: Record<string, string> = {
    navigation: 'Navigacija',
    actions: 'Akcije',
    general: 'Opšte',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Command Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 z-50 w-full max-w-xl"
          >
            <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 p-4 border-b border-white/10">
                <Command className="w-5 h-5 text-amber-400" />
                <input
                  type="text"
                  placeholder="Pretraži komande..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                  className="flex-1 bg-transparent text-white placeholder:text-white/40 outline-none text-lg"
                />
                <kbd className="px-2 py-1 text-xs bg-white/10 rounded text-white/60">ESC</kbd>
              </div>

              {/* Results */}
              <div className="max-h-[400px] overflow-y-auto p-2">
                {/* Quick Actions */}
                {filteredQuickActions.length > 0 && (
                  <div className="mb-4">
                    <div className="px-3 py-2 text-xs text-white/40 uppercase tracking-wider">
                      Brze akcije
                    </div>
                    {filteredQuickActions.map((action) => (
                      <button
                        key={action.label}
                        onClick={() => handleSelect(action.action)}
                        className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-white/10 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-white/5 text-white/60 group-hover:text-amber-400 transition-colors">
                            {action.icon}
                          </div>
                          <span className="text-white">{action.label}</span>
                        </div>
                        <kbd className="px-2 py-1 text-xs bg-white/5 rounded text-white/40">
                          {action.shortcut}
                        </kbd>
                      </button>
                    ))}
                  </div>
                )}

                {/* Grouped Shortcuts */}
                {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                  <div key={category} className="mb-4">
                    <div className="px-3 py-2 text-xs text-white/40 uppercase tracking-wider">
                      {categoryLabels[category] || category}
                    </div>
                    {categoryShortcuts.map((shortcut, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelect(shortcut.action)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <span className="text-white/80">{shortcut.description}</span>
                        <div className="flex items-center gap-1">
                          {shortcut.modifiers?.map((mod) => (
                            <kbd key={mod} className="px-2 py-0.5 text-xs bg-white/5 rounded text-white/40 capitalize">
                              {mod}
                            </kbd>
                          ))}
                          <kbd className="px-2 py-0.5 text-xs bg-white/5 rounded text-white/40 uppercase">
                            {shortcut.key}
                          </kbd>
                        </div>
                      </button>
                    ))}
                  </div>
                ))}

                {filteredQuickActions.length === 0 && filteredShortcuts.length === 0 && (
                  <div className="py-8 text-center text-white/40">
                    <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Nema rezultata za "{search}"</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white/5 rounded">↑</kbd>
                    <kbd className="px-1.5 py-0.5 bg-white/5 rounded">↓</kbd>
                    navigacija
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white/5 rounded">Enter</kbd>
                    izaberi
                  </span>
                </div>
                <span>Pisma Command Palette</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Provider Component
export function KeyboardShortcutsProvider({ children }: { children: ReactNode }) {
  const [shortcuts, setShortcuts] = useState<Map<string, Shortcut>>(new Map());
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const router = useRouter();

  const registerShortcut = useCallback((id: string, shortcut: Shortcut) => {
    setShortcuts(prev => new Map(prev).set(id, shortcut));
  }, []);

  const unregisterShortcut = useCallback((id: string) => {
    setShortcuts(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const openCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen(true);
  }, []);

  const closeCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen(false);
  }, []);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Command Palette: Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
        return;
      }

      // Close Command Palette: Escape
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
        return;
      }

      // Don't process other shortcuts if command palette is open
      if (isCommandPaletteOpen) return;

      // G-key navigation (like Gmail)
      if (pendingKey === 'g') {
        setPendingKey(null);
        switch (e.key.toLowerCase()) {
          case 'h':
            e.preventDefault();
            router.push('/');
            return;
          case 'w':
            e.preventDefault();
            router.push('/write');
            return;
          case 'i':
            e.preventDefault();
            router.push('/inbox');
            return;
          case 't':
            e.preventDefault();
            router.push('/track');
            return;
          case 's':
            e.preventDefault();
            router.push('/profile');
            return;
        }
      }

      // Start G-key sequence
      if (e.key.toLowerCase() === 'g' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setPendingKey('g');
        // Clear pending key after timeout
        setTimeout(() => setPendingKey(null), 1000);
        return;
      }

      // Check registered shortcuts
      for (const shortcut of shortcuts.values()) {
        const modifiersMatch = (
          (!shortcut.modifiers || shortcut.modifiers.length === 0) ||
          shortcut.modifiers.every(mod => {
            if (mod === 'ctrl') return e.ctrlKey;
            if (mod === 'shift') return e.shiftKey;
            if (mod === 'alt') return e.altKey;
            if (mod === 'meta') return e.metaKey;
            return false;
          })
        );

        if (modifiersMatch && e.key.toLowerCase() === shortcut.key.toLowerCase()) {
          e.preventDefault();
          shortcut.action();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, isCommandPaletteOpen, pendingKey, router]);

  // Register default shortcuts
  useEffect(() => {
    registerShortcut('open-command-palette', {
      key: 'k',
      modifiers: ['ctrl'],
      description: 'Otvori Command Palette',
      action: openCommandPalette,
      category: 'general',
    });

    registerShortcut('compose-letter', {
      key: 'n',
      description: 'Novo pismo',
      action: () => router.push('/write'),
      category: 'actions',
    });

    registerShortcut('refresh', {
      key: 'r',
      description: 'Osveži stranicu',
      action: () => window.location.reload(),
      category: 'general',
    });

    return () => {
      unregisterShortcut('open-command-palette');
      unregisterShortcut('compose-letter');
      unregisterShortcut('refresh');
    };
  }, [registerShortcut, unregisterShortcut, openCommandPalette, router]);

  const value: KeyboardShortcutsContextType = {
    registerShortcut,
    unregisterShortcut,
    openCommandPalette,
    closeCommandPalette,
    isCommandPaletteOpen,
  };

  return (
    <KeyboardShortcutsContext.Provider value={value}>
      {children}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={closeCommandPalette}
        shortcuts={shortcuts}
      />
      
      {/* Pending key indicator */}
      <AnimatePresence>
        {pendingKey && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-gray-900/90 backdrop-blur-sm rounded-lg border border-white/10 text-white text-sm"
          >
            <span className="text-amber-400 font-medium">{pendingKey.toUpperCase()}</span>
            <span className="text-white/60"> - čekam sledeći taster...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </KeyboardShortcutsContext.Provider>
  );
}

// Hook to use keyboard shortcuts
export function useKeyboardShortcuts() {
  const context = useContext(KeyboardShortcutsContext);
  if (context === undefined) {
    throw new Error('useKeyboardShortcuts must be used within a KeyboardShortcutsProvider');
  }
  return context;
}

// Hook to register a shortcut
export function useShortcut(
  id: string,
  shortcut: Omit<Shortcut, 'action'> & { action: () => void },
  deps: unknown[] = []
) {
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts();

  useEffect(() => {
    registerShortcut(id, shortcut);
    return () => unregisterShortcut(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, ...deps]);
}

export default KeyboardShortcutsProvider;
