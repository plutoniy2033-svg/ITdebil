import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Language } from '../types';

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (ru: string, en: string, vi?: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('ru');

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
