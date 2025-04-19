import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import moment from 'moment';
import 'moment/locale/pt-br';
import 'moment/locale/ja';

// Inicializar o i18next com os recursos de idiomas
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'pt-BR',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React já faz escape
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'language',
      caches: ['localStorage'],
    },
    
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json'
    },
    
    react: {
      useSuspense: false
    }
  });

// Configurar o Moment.js para usar o mesmo idioma do i18n
i18n.on('languageChanged', (lng) => {
  moment.locale(lng === 'ja' ? 'ja' : 'pt-br');
  
  // Armazenar o idioma selecionado no localStorage
  localStorage.setItem('language', lng);
});

export default i18n;