import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Language } from '../types';

const STORAGE_KEY = 'visarun-language';

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (ru: string, en: string, vi?: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function loadLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'ru' || stored === 'en' || stored === 'vi') return stored;
  } catch {
    /* ignore */
  }
  return 'ru';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(loadLanguage);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const setLang = useCallback((next: Language) => {
    setLangState(next);
  }, []);

  const t = useCallback(
    (ru: string, en: string, vi?: string) => {
      if (lang === 'ru') return ru;
      if (lang === 'vi') return vi ?? en;
      return en;
    },
    [lang],
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
