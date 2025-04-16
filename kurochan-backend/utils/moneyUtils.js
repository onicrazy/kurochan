/**
 * Utilitários para manipulação de valores monetários
 */
class MoneyUtils {
  /**
   * Formata um valor para moeda (Iene Japonês)
   * @param {number} value - Valor a ser formatado
   * @param {string} language - Idioma (ja ou pt-BR)
   * @returns {string} Valor formatado como moeda
   */
  formatCurrency(value, language = 'pt-BR') {
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
  }
  
  /**
   * Converte um valor string para número
   * @param {string|number} value - Valor a ser convertido
   * @returns {number} Valor convertido
   */
  parseValue(value) {
    if (typeof value === 'number') {
      return value;
    }
    
    if (typeof value === 'string') {
      // Remover símbolo de moeda e espaços
      const cleanValue = value.replace(/[^\d,-]/g, '').replace(',', '.');
      return parseFloat(cleanValue || 0);
    }
    
    return 0;
  }
  
  /**
   * Arredonda um valor para 2 casas decimais
   * @param {number} value - Valor a ser arredondado
   * @returns {number} Valor arredondado
   */
  roundToDecimal(value, decimals = 2) {
    return Math.round(value * (10 ** decimals)) / (10 ** decimals);
  }
  
  /**
   * Calcula a soma de um array de valores
   * @param {Array<number>} values - Array de valores
   * @returns {number} Soma dos valores
   */
  sum(values) {
    return values.reduce((acc, val) => acc + this.parseValue(val), 0);
  }
  
  /**
   * Calcula a porcentagem de um valor
   * @param {number} value - Valor base
   * @param {number} percentage - Porcentagem
   * @returns {number} Valor da porcentagem
   */
  calculatePercentage(value, percentage) {
    return (this.parseValue(value) * percentage) / 100;
  }
  
  /**
   * Calcula a diferença percentual entre dois valores
   * @param {number} oldValue - Valor antigo
   * @param {number} newValue - Valor novo
   * @returns {number} Diferença percentual
   */
  calculatePercentageDifference(oldValue, newValue) {
    const parsedOldValue = this.parseValue(oldValue);
    const parsedNewValue = this.parseValue(newValue);
    
    if (parsedOldValue === 0) {
      return parsedNewValue === 0 ? 0 : 100;
    }
    
    return ((parsedNewValue - parsedOldValue) / parsedOldValue) * 100;
  }
  
  /**
   * Formata um valor para exibição na interface (sem símbolo de moeda)
   * @param {number} value - Valor a ser formatado
   * @returns {string} Valor formatado
   */
  formatNumberDisplay(value) {
    if (typeof value !== 'number') {
      value = parseFloat(value || 0);
    }
    
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}

module.exports = new MoneyUtils();