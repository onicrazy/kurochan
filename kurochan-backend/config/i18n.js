const i18next = require('i18next');
const i18nextMiddleware = require('i18next-http-middleware');
const i18nextBackend = require('i18next-fs-backend');
const path = require('path');
const environment = require('./environment');

/**
 * Configuração do i18next para internacionalização
 */
i18next
  .use(i18nextBackend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    backend: {
      loadPath: path.join(__dirname, '../locales/{{lng}}/{{ns}}.json')
    },
    fallbackLng: environment.defaultLanguage || 'pt-BR',
    preload: ['pt-BR', 'ja'],
    saveMissing: environment.NODE_ENV === 'development',
    detection: {
      order: ['header', 'querystring', 'cookie'],
      lookupHeader: 'accept-language',
      lookupQuerystring: 'lng',
      lookupCookie: 'i18next',
      caches: ['cookie']
    },
    // Opções adicionais
    debug: environment.NODE_ENV === 'development',
    defaultNS: 'translation',
    ns: 'translation',
    keySeparator: '.',
    nsSeparator: ':',
    interpolation: {
      escapeValue: false // Não é necessário para backend
    }
  });

/**
 * Middleware Express para i18n
 */
const i18nMiddleware = i18nextMiddleware.handle(i18next);

/**
 * Função de tradução standalone
 * @param {string} key - Chave de tradução
 * @param {Object} options - Opções adicionais
 * @param {string} [lng] - Idioma
 * @returns {string} Texto traduzido
 */
const translate = (key, options = {}, lng = environment.defaultLanguage) => {
  return i18next.t(key, { ...options, lng });
};

module.exports = {
  i18next,
  i18nMiddleware,
  translate
};