import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import idTranslation from '@/locales/id.json';
import enTranslation from '@/locales/en.json';

export const defaultNS = 'translation';
export const resources = {
  id: {
    translation: idTranslation,
  },
  en: {
    translation: enTranslation,
  },
} as const;

i18n.use(initReactI18next).init({
  resources,
  lng: 'id', // Default language: Bahasa Indonesia
  fallbackLng: 'id',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
