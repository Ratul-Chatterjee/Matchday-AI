import { useState, useCallback } from 'react';
import translations, { type TranslationKey } from './translations';
import { localStorageUtils } from '../utils/localStorage';

export function useTranslation() {
  const [lang, setLangState] = useState(() => localStorageUtils.getLanguage());

  const setLang = useCallback((code: string) => {
    setLangState(code);
    localStorageUtils.setLanguage(code);
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    const langTranslations = translations[lang as keyof typeof translations];
    if (langTranslations && key in langTranslations) {
      return langTranslations[key];
    }
    return translations.en[key] || key;
  }, [lang]);

  return { lang, setLang, t };
}
