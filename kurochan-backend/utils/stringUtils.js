/**
 * Utilitários para manipulação de strings
 */
class StringUtils {
  /**
   * Capitaliza uma string (primeira letra maiúscula)
   * @param {string} str - String a ser capitalizada
   * @returns {string} String capitalizada
   */
  capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
  
  /**
   * Trunca uma string em um comprimento máximo, adicionando reticências ao final
   * @param {string} str - String a ser truncada
   * @param {number} maxLength - Comprimento máximo
   * @returns {string} String truncada
   */
  truncate(str, maxLength) {
    if (!str || str.length <= maxLength) return str;
    return str.slice(0, maxLength - 3) + '...';
  }
  
  /**
   * Remove espaços em branco do início e fim da string e caracteres especiais
   * @param {string} str - String a ser tratada
   * @returns {string} String tratada
   */
  cleanString(str) {
    if (!str) return '';
    return str.trim().replace(/[^\w\s\-À-ÿ]/g, '');
  }
  
  /**
   * Remove acentos de uma string
   * @param {string} str - String a ser tratada
   * @returns {string} String sem acentos
   */
  removeAccents(str) {
    if (!str) return '';
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  
  /**
   * Gera um slug a partir de uma string (para URLs)
   * @param {string} str - String a ser convertida
   * @returns {string} Slug
   */
  slugify(str) {
    if (!str) return '';
    
    // Remover acentos
    const withoutAccents = this.removeAccents(str);
    
    // Converter para minúsculas, substituir espaços por hífens e remover caracteres especiais
    return withoutAccents
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }
  
  /**
   * Gera um ID aleatório
   * @param {number} length - Comprimento do ID
   * @returns {string} ID aleatório
   */
  generateRandomId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }
  
  /**
   * Verifica se uma string contém outra (case insensitive)
   * @param {string} str - String a ser verificada
   * @param {string} search - String a ser procurada
   * @returns {boolean} True se contém a string
   */
  contains(str, search) {
    if (!str || !search) return false;
    return str.toLowerCase().includes(search.toLowerCase());
  }
  
  /**
   * Verifica se uma string é um email válido
   * @param {string} email - Email a ser verificado
   * @returns {boolean} True se for um email válido
   */
  isValidEmail(email) {
    if (!email) return false;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
  
  /**
   * Retorna a primeira letra de cada palavra
   * @param {string} str - String a ser processada
   * @returns {string} Iniciais
   */
  getInitials(str) {
    if (!str) return '';
    
    return str
      .split(' ')
      .filter(word => word.length > 0)
      .map(word => word[0].toUpperCase())
      .join('');
  }
  
  /**
   * Verifica se a string contém caracteres japoneses
   * @param {string} str - String a ser verificada
   * @returns {boolean} True se contém caracteres japoneses
   */
  containsJapanese(str) {
    if (!str) return false;
    
    // Verificar caracteres hiragana, katakana e kanji
    const japaneseRegex = /[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\uFF00-\uFFEF\u4E00-\u9FAF]/;
    return japaneseRegex.test(str);
  }
}

module.exports = new StringUtils();