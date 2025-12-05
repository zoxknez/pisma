'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { ToastProvider } from '@/components/Notifications';
import { KeyboardShortcutsProvider } from '@/components/KeyboardShortcuts';

export default function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <KeyboardShortcutsProvider>
          {children}
        </KeyboardShortcutsProvider>
      </ToastProvider>
    </SessionProvider>
  );
}
