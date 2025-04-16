/**
 * Utilitários para manipulação de valores monetários
 */
const moneyUtils = {
  /**
   * Formata um valor para exibição em Iene Japonês
   * @param {number} value - Valor a ser formatado
   * @param {string} language - Idioma (ja ou pt-BR)
   * @returns {string} Valor formatado como moeda
   */
  formatJPY: (value, language = 'pt-BR') => {
    if (value === null || value === undefined) return '';
    
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
   * Calcula a diferença entre dois valores
   * @param {number} value1 - Primeiro valor
   * @param {number} value2 - Segundo valor
   * @returns {number} Diferença entre os valores
   */
  difference: (value1, value2) => {
    return value1 - value2;
  },
  
  /**
   * Calcula a porcentagem de um valor em relação a outro
   * @param {number} value - Valor
   * @param {number} total - Total
   * @returns {number} Porcentagem
   */
  percentage: (value, total) => {
    if (total === 0) return 0;
    return (value / total) * 100;
  },
  
  /**
   * Calcula a variação percentual entre dois valores
   * @param {number} oldValue - Valor antigo
   * @param {number} newValue - Valor novo
   * @returns {number} Variação percentual
   */
  percentageChange: (oldValue, newValue) => {
    if (oldValue === 0) return newValue > 0 ? 100 : 0;
    return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
  },
  
  /**
   * Soma valores de um array de objetos
   * @param {Array} items - Array de objetos
   * @param {string} property - Nome da propriedade a ser somada
   * @returns {number} Soma dos valores
   */
  sum: (items, property) => {
    if (!items || !items.length) return 0;
    return items.reduce((acc, item) => acc + (parseFloat(item[property]) || 0), 0);
  },
  
  /**
   * Arredonda um valor para 2 casas decimais
   * @param {number} value - Valor a ser arredondado
   * @returns {number} Valor arredondado
   */
  roundToDecimal: (value, decimals = 2) => {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  },
  
  /**
   * Converte um valor em string para número
   * @param {string} value - Valor a ser convertido
   * @returns {number} Valor convertido
   */
  parseValue: (value) => {
    // Remover símbolo de moeda e espaços
    const sanitized = String(value).replace(/[^\d,.]/g, '');
    
    // Converter para notação americana (ponto como separador decimal)
    const normalized = sanitized.replace(',', '.');
    
    return parseFloat(normalized) || 0;
  }
};

export default moneyUtils;