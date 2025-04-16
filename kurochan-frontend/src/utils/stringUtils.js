/**
 * Utilitários para manipulação de strings
 */
const stringUtils = {
  /**
   * Trunca um texto se for muito longo
   * @param {string} text - Texto a ser truncado
   * @param {number} maxLength - Comprimento máximo
   * @returns {string} Texto truncado
   */
  truncate: (text, maxLength = 50) => {
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
  },
  
  /**
   * Formata um nome para exibição (Nome + Nome Japonês)
   * @param {string} nome - Nome em português
   * @param {string} nomeJapones - Nome em japonês
   * @returns {string} Nome formatado
   */
  formatName: (nome, nomeJapones) => {
    if (!nome) return '';
    
    return nomeJapones ? `${nome} / ${nomeJapones}` : nome;
  },
  
  /**
   * Capitaliza a primeira letra de cada palavra
   * @param {string} text - Texto a ser capitalizado
   * @returns {string} Texto capitalizado
   */
  capitalize: (text) => {
    if (!text) return '';
    
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  },
  
  /**
   * Remove acentos de um texto
   * @param {string} text - Texto com acentos
   * @returns {string} Texto sem acentos
   */
  removeAccents: (text) => {
    if (!text) return '';
    
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  },
  
  /**
   * Formata um texto para busca (remove acentos e converte para minúsculas)
   * @param {string} text - Texto a ser formatado
   * @returns {string} Texto formatado
   */
  formatForSearch: (text) => {
    if (!text) return '';
    
    return stringUtils.removeAccents(text).toLowerCase();
  },
  
  /**
   * Verifica se um texto contém outro texto (insensível a acentos e maiúsculas/minúsculas)
   * @param {string} text - Texto a ser verificado
   * @param {string} search - Texto a ser buscado
   * @returns {boolean} True se contém, false caso contrário
   */
  contains: (text, search) => {
    if (!text || !search) return false;
    
    const formattedText = stringUtils.formatForSearch(text);
    const formattedSearch = stringUtils.formatForSearch(search);
    
    return formattedText.includes(formattedSearch);
  }
};

export default stringUtils;