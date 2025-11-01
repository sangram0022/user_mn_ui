// Locale management hook
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/appStore';

export function useLocale() {
  const { i18n } = useTranslation();
  const { locale, setLocale } = useAppStore();
  
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setLocale(lang);
  };
  
  return {
    locale,
    changeLanguage,
    t: i18n.t,
    availableLanguages: ['en', 'es', 'fr'],
  };
}
