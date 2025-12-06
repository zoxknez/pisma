'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { translations, Language, TranslationKeys } from './translations';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
  toggleLanguage: () => void;
  isDetecting: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'pisma-language';
const LANGUAGE_DETECTED_KEY = 'pisma-language-detected';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('sr');
  const [isDetecting, setIsDetecting] = useState(true);

  // Load language from localStorage or detect from IP
  useEffect(() => {
    const detectLanguage = async () => {
      // Check if user has manually set language
      const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
      const wasDetected = localStorage.getItem(LANGUAGE_DETECTED_KEY);
      
      if (savedLanguage && (savedLanguage === 'sr' || savedLanguage === 'en')) {
        setLanguageState(savedLanguage);
        setIsDetecting(false);
        return;
      }

      // If not detected before, detect from IP
      if (!wasDetected) {
        try {
          const response = await fetch('/api/detect-language');
          if (response.ok) {
            const data = await response.json();
            const detectedLang = data.language as Language;
            setLanguageState(detectedLang);
            localStorage.setItem(LANGUAGE_STORAGE_KEY, detectedLang);
            localStorage.setItem(LANGUAGE_DETECTED_KEY, 'true');
          }
        } catch (error) {
          console.error('Language detection failed:', error);
          // Fallback to browser language
          const browserLang = navigator.language.split('-')[0];
          if (browserLang === 'en') {
            setLanguageState('en');
          }
        }
      }
      
      setIsDetecting(false);
    };

    detectLanguage();
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    // Update HTML lang attribute
    document.documentElement.lang = lang;
  }, []);

  const toggleLanguage = useCallback(() => {
    const newLang = language === 'sr' ? 'en' : 'sr';
    setLanguage(newLang);
  }, [language, setLanguage]);

  const t = translations[language] as TranslationKeys;

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, toggleLanguage, isDetecting }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// Language switcher component
export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { language, toggleLanguage } = useI18n();

  return (
    <button
      onClick={toggleLanguage}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors ${className}`}
      title={language === 'sr' ? 'Switch to English' : 'Prebaci na Srpski'}
    >
      <span className="text-lg">{language === 'sr' ? '🇷🇸' : '🇬🇧'}</span>
      <span className="text-sm text-white/80 uppercase font-medium">{language}</span>
    </button>
  );
}

export default I18nProvider;
