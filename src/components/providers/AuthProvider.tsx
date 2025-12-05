'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { ToastProvider } from '@/components/Notifications';
import { KeyboardShortcutsProvider } from '@/components/KeyboardShortcuts';
import { I18nProvider } from '@/lib/i18n';

export default function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <I18nProvider>
        <ToastProvider>
          <KeyboardShortcutsProvider>
            {children}
          </KeyboardShortcutsProvider>
        </ToastProvider>
      </I18nProvider>
    </SessionProvider>
  );
}
