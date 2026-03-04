import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import ptBR from './pt-BR.js';
import en from './en.js';
import es from './es.js';
import fr from './fr.js';

export const LANGUAGES = {
  'pt-BR': { name: 'Português (Brasil)', flag: '🇧🇷', translations: ptBR },
  'en':    { name: 'English',            flag: '🇺🇸', translations: en },
  'es':    { name: 'Español',            flag: '🇪🇸', translations: es },
  'fr':    { name: 'Français',           flag: '🇫🇷', translations: fr },
};

const STORAGE_KEY = 'smartfinance_language';
const DEFAULT_LANG = 'pt-BR';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved && LANGUAGES[saved] ? saved : DEFAULT_LANG;
    } catch {
      return DEFAULT_LANG;
    }
  });

  const setLang = useCallback((newLang) => {
    if (!LANGUAGES[newLang]) return;
    setLangState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch { /* noop */ }
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * useTranslation() hook
 * Returns { t, lang, setLang }
 *
 * t(key) — returns translated string, falls back to pt-BR, then key
 * t(key, { count: 3 }) — replaces {count} placeholder
 */
export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useTranslation must be used inside LanguageProvider');

  const { lang, setLang } = ctx;
  const currentTranslations = LANGUAGES[lang]?.translations ?? ptBR;
  const fallback = ptBR;

  const t = useCallback((key, vars) => {
    let str = currentTranslations[key] ?? fallback[key] ?? key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, v);
      });
    }
    return str;
  }, [currentTranslations]);

  return { t, lang, setLang };
}
