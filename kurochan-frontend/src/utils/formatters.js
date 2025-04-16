import moment from 'moment';

/**
 * Utilitários para formatação de dados
 */
const formatters = {
  /**
   * Formata um valor para moeda (Iene Japonês)
   * @param {number} value - Valor a ser formatado
   * @param {string} language - Idioma (ja ou pt-BR)
   * @returns {string} Valor formatado como moeda
   */
  currency: (value, language = 'pt-BR') => {
    if (typeof value !== 'number') {
      value = parseFloat(value || 0);
    }
    
    // Formatar de acordo com o idioma
    if (language === 'ja') {
      // No Japão, o iene não usa casas decimais
      return `¥${Math.round(value).toLocaleString('ja-JP')}`;
    } else {
      // Para outros idiomas, mantém o símbolo do iene mas usa o formato local
      return `¥ ${Math.round(value).toLocaleString('pt-BR')}`;
    }
  },
  
  /**
   * Formata uma data para exibição
   * @param {string|Date} date - Data a ser formatada
   * @param {string} language - Idioma (ja ou pt-BR)
   * @returns {string} Data formatada
   */
  date: (date, language = 'pt-BR') => {
    if (!date) return '';
    
    return language === 'ja'
      ? moment(date).format('YYYY/MM/DD')
      : moment(date).format('DD/MM/YYYY');
  },
  
  /**
   * Formata uma data e hora para exibição
   * @param {string|Date} dateTime - Data e hora a ser formatada
   * @param {string} language - Idioma (ja ou pt-BR)
   * @returns {string} Data e hora formatada
   */
  dateTime: (dateTime, language = 'pt-BR') => {
    if (!dateTime) return '';
    
    return language === 'ja'
      ? moment(dateTime).format('YYYY/MM/DD HH:mm')
      : moment(dateTime).format('DD/MM/YYYY HH:mm');
  },
  
  /**
   * Formata um nome para exibição (Nome + Nome Japonês)
   * @param {string} nome - Nome em português
   * @param {string} nomeJapones - Nome em japonês
   * @returns {string} Nome formatado
   */
  name: (nome, nomeJapones) => {
    if (!nome) return '';
    
    return nomeJapones ? `${nome} / ${nomeJapones}` : nome;
  },
  
  /**
   * Formata o status de pagamento
   * @param {string} status - Status (pendente, pago, parcial)
   * @param {string} language - Idioma (ja ou pt-BR)
   * @returns {string} Status formatado
   */
  paymentStatus: (status, language = 'pt-BR') => {
    if (!status) return '';
    
    const translations = {
      'pt-BR': {
        pendente: 'Pendente',
        pago: 'Pago',
        parcial: 'Parcial'
      },
      'ja': {
        pendente: '未払い',
        pago: '支払済み',
        parcial: '一部支払い'
      }
    };
    
    return translations[language][status] || status;
  },
  
  /**
   * Trunca um texto se for muito longo
   * @param {string} text - Texto a ser truncado
   * @param {number} maxLength - Comprimento máximo
   * @returns {string} Texto truncado
   */
  truncateText: (text, maxLength = 50) => {
    if (!text || text.length <= maxLength) return text;
    
    return `${text.substring(0, maxLength)}...`;
  },
  
  /**
   * Obtém as iniciais de um nome
   * @param {string} name - Nome completo
   * @returns {string} Iniciais do nome
   */
  getInitials: (name) => {
    if (!name) return '';
    
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
};

export default formatters;