import api from './api';

/**
 * Serviço para gerenciar alocações de funcionários
 */
const alocacoesService = {
  /**
   * Busca lista de alocações com filtros
   * @param {Object} params - Parâmetros de filtro
   * @returns {Promise} Promise com os resultados
   */
  async listar(params = {}) {
    const response = await api.get('/alocacoes', { params });
    return response.data;
  },
  
  /**
   * Busca uma alocação específica
   * @param {number} id - ID da alocação
   * @returns {Promise} Promise com os dados da alocação
   */
  async obter(id) {
    const response = await api.get(`/alocacoes/${id}`);
    return response.data;
  },
  
  /**
   * Cria uma nova alocação
   * @param {Object} dados - Dados da alocação
   * @returns {Promise} Promise com os dados da alocação criada
   */
  async criar(dados) {
    const response = await api.post('/alocacoes', dados);
    return response.data;
  },
  
  /**
   * Atualiza uma alocação existente
   * @param {number} id - ID da alocação
   * @param {Object} dados - Novos dados da alocação
   * @returns {Promise} Promise com os dados da alocação atualizada
   */
  async atualizar(id, dados) {
    const response = await api.put(`/alocacoes/${id}`, dados);
    return response.data;
  },
  
  /**
   * Remove uma alocação
   * @param {number} id - ID da alocação
   * @returns {Promise} Promise com resultado da operação
   */
  async remover(id) {
    const response = await api.delete(`/alocacoes/${id}`);
    return response.data;
  },
  
  /**
   * Busca alocações para o calendário
   * @param {number} ano - Ano
   * @param {number} mes - Mês (1-12)
   * @returns {Promise} Promise com as alocações do mês
   */
  async calendario(ano, mes) {
    const response = await api.get(`/alocacoes/calendario/${ano}/${mes}`);
    return response.data;
  }
};

export default alocacoesService;