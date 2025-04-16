import moment from 'moment';

/**
 * Utilitários para manipulação de datas
 */
const dateUtils = {
  /**
   * Verifica se uma data é válida
   * @param {string} date - Data a ser verificada
   * @returns {boolean} Se a data é válida
   */
  isValidDate: (date) => {
    return moment(date).isValid();
  },
  
  /**
   * Formata uma data para o formato 'YYYY-MM-DD'
   * @param {Date|string} date - Data a ser formatada
   * @returns {string} Data formatada
   */
  formatDate: (date) => {
    return moment(date).format('YYYY-MM-DD');
  },
  
  /**
   * Formata uma data para exibição de acordo com o idioma
   * @param {Date|string} date - Data a ser formatada
   * @param {string} language - Idioma (ja ou pt-BR)
   * @returns {string} Data formatada para exibição
   */
  formatDisplay: (date, language = 'pt-BR') => {
    moment.locale(language === 'ja' ? 'ja' : 'pt-br');
    return moment(date).format('L');
  },
  
  /**
   * Retorna o primeiro dia do mês
   * @param {number} year - Ano
   * @param {number} month - Mês (1-12)
   * @returns {Date} Primeiro dia do mês
   */
  getFirstDayOfMonth: (year, month) => {
    return moment({ year, month: month - 1, day: 1 }).toDate();
  },
  
  /**
   * Retorna o último dia do mês
   * @param {number} year - Ano
   * @param {number} month - Mês (1-12)
   * @returns {Date} Último dia do mês
   */
  getLastDayOfMonth: (year, month) => {
    return moment({ year, month: month - 1 }).endOf('month').toDate();
  },
  
  /**
   * Calcula a diferença em dias entre duas datas
   * @param {string} startDate - Data inicial no formato 'YYYY-MM-DD'
   * @param {string} endDate - Data final no formato 'YYYY-MM-DD'
   * @returns {number} Número de dias entre as datas
   */
  daysBetween: (startDate, endDate) => {
    const start = moment(startDate);
    const end = moment(endDate);
    return end.diff(start, 'days');
  },
  
  /**
   * Verifica se uma data está entre duas outras datas (inclusive)
   * @param {string} date - Data a verificar
   * @param {string} start - Data inicial
   * @param {string} end - Data final
   * @returns {boolean} True se a data estiver no intervalo
   */
  isDateBetween: (date, start, end) => {
    const checkDate = moment(date);
    const startDate = moment(start);
    const endDate = moment(end);
    
    return checkDate.isSameOrAfter(startDate) && checkDate.isSameOrBefore(endDate);
  },
  
  /**
   * Adiciona dias a uma data
   * @param {string} date - Data inicial
   * @param {number} days - Número de dias a adicionar
   * @returns {string} Nova data
   */
  addDays: (date, days) => {
    return moment(date).add(days, 'days').format('YYYY-MM-DD');
  },
  
  /**
   * Retorna a data atual no formato 'YYYY-MM-DD'
   * @returns {string} Data atual
   */
  getCurrentDate: () => {
    return moment().format('YYYY-MM-DD');
  },
  
  /**
   * Gera um array com os dias do mês
   * @param {number} year - Ano
   * @param {number} month - Mês (1-12)
   * @returns {Array} Array de objetos de data
   */
  getMonthDays: (year, month) => {
    const startDate = moment({ year, month: month - 1, day: 1 });
    const endDate = moment(startDate).endOf('month');
    const days = [];
    
    const currentDay = moment(startDate);
    while (currentDay.isSameOrBefore(endDate)) {
      days.push({
        date: moment(currentDay),
        day: currentDay.date(),
        isWeekend: [0, 6].includes(currentDay.day()),
        isToday: moment().isSame(currentDay, 'day')
      });
      currentDay.add(1, 'day');
    }
    
    return days;
  },
  
  /**
   * Gera um array com os nomes dos meses
   * @param {string} language - Idioma (ja ou pt-BR)
   * @returns {Array} Array com os nomes dos meses
   */
  getMonthNames: (language = 'pt-BR') => {
    moment.locale(language === 'ja' ? 'ja' : 'pt-br');
    return moment.months();
  }
};

export default dateUtils;