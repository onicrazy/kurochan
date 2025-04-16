const moment = require('moment');

/**
 * Utilitários para manipulação de datas
 */
class DateUtils {
  /**
   * Verifica se uma data é válida
   * @param {string} date - Data no formato 'YYYY-MM-DD'
   * @returns {boolean} True se a data for válida
   */
  isValidDate(date) {
    return moment(date, 'YYYY-MM-DD', true).isValid();
  }
  
  /**
   * Formata uma data para o formato 'YYYY-MM-DD'
   * @param {Date|string} date - Data a ser formatada
   * @returns {string} Data formatada
   */
  formatDate(date) {
    return moment(date).format('YYYY-MM-DD');
  }
  
  /**
   * Formata uma data para exibição de acordo com o idioma
   * @param {Date|string} date - Data a ser formatada
   * @param {string} language - Idioma (ja ou pt-BR)
   * @returns {string} Data formatada para exibição
   */
  formatDisplay(date, language = 'pt-BR') {
    moment.locale(language === 'ja' ? 'ja' : 'pt-br');
    return moment(date).format('L');
  }
  
  /**
   * Retorna o primeiro dia do mês
   * @param {number} year - Ano
   * @param {number} month - Mês (1-12)
   * @returns {string} Primeiro dia do mês no formato 'YYYY-MM-DD'
   */
  getFirstDayOfMonth(year, month) {
    return moment({ year, month: month - 1, day: 1 }).format('YYYY-MM-DD');
  }
  
  /**
   * Retorna o último dia do mês
   * @param {number} year - Ano
   * @param {number} month - Mês (1-12)
   * @returns {string} Último dia do mês no formato 'YYYY-MM-DD'
   */
  getLastDayOfMonth(year, month) {
    return moment({ year, month: month - 1 }).endOf('month').format('YYYY-MM-DD');
  }
  
  /**
   * Calcula a diferença em dias entre duas datas
   * @param {string} startDate - Data inicial no formato 'YYYY-MM-DD'
   * @param {string} endDate - Data final no formato 'YYYY-MM-DD'
   * @returns {number} Número de dias entre as datas
   */
  daysBetween(startDate, endDate) {
    const start = moment(startDate);
    const end = moment(endDate);
    return end.diff(start, 'days');
  }
  
  /**
   * Verifica se uma data está entre duas outras datas (inclusive)
   * @param {string} date - Data a verificar
   * @param {string} start - Data inicial
   * @param {string} end - Data final
   * @returns {boolean} True se a data estiver no intervalo
   */
  isDateBetween(date, start, end) {
    const checkDate = moment(date);
    const startDate = moment(start);
    const endDate = moment(end);
    
    return checkDate.isSameOrAfter(startDate) && checkDate.isSameOrBefore(endDate);
  }
  
  /**
   * Adiciona dias a uma data
   * @param {string} date - Data inicial
   * @param {number} days - Número de dias a adicionar
   * @returns {string} Nova data
   */
  addDays(date, days) {
    return moment(date).add(days, 'days').format('YYYY-MM-DD');
  }
  
  /**
   * Retorna a data atual no formato 'YYYY-MM-DD'
   * @returns {string} Data atual
   */
  getCurrentDate() {
    return moment().format('YYYY-MM-DD');
  }
  
  /**
   * Retorna uma matriz com os dias do mês organizados por semana
   * @param {number} year - Ano
   * @param {number} month - Mês (1-12)
   * @returns {Array} Matriz de datas organizadas por semana
   */
  getCalendarMatrix(year, month) {
    const firstDay = moment({ year, month: month - 1, day: 1 });
    const lastDay = moment({ year, month: month - 1 }).endOf('month');
    
    // Ajustar para começar na semana anterior se o mês não começar no domingo
    const startDate = moment(firstDay).startOf('week');
    // Ajustar para terminar na semana seguinte se o mês não terminar no sábado
    const endDate = moment(lastDay).endOf('week');
    
    const calendar = [];
    let week = [];
    
    // Iterar de startDate até endDate, preenchendo a matriz do calendário
    for (let day = moment(startDate); day.isSameOrBefore(endDate); day.add(1, 'day')) {
      week.push(moment(day).format('YYYY-MM-DD'));
      
      if (week.length === 7) {
        calendar.push([...week]);
        week = [];
      }
    }
    
    return calendar;
  }
}

module.exports = new DateUtils();