import api from './api';

/**
 * Serviço para gerenciar funcionários
 */
const funcionariosService = {
  /**
   * Busca lista de funcionários com filtros
   * @param {Object} params - Parâmetros de filtro
   * @returns {Promise} Promise com os resultados
   */
  async listar(params = {}) {
    const response = await api.get('/funcionarios', { params });
    return response.data;
  },
  
  /**
   * Busca um funcionário específico
   * @param {number} id - ID do funcionário
   * @returns {Promise} Promise com os dados do funcionário
   */
  async obter(id) {
    const response = await api.get(`/funcionarios/${id}`);
    return response.data;
  },
  
  /**
   * Cria um novo funcionário
   * @param {Object} dados - Dados do funcionário
   * @returns {Promise} Promise com os dados do funcionário criado
   */
  async criar(dados) {
    const response = await api.post('/funcionarios', dados);
    return response.data;
  },
  
  /**
   * Atualiza um funcionário existente
   * @param {number} id - ID do funcionário
   * @param {Object} dados - Novos dados do funcionário
   * @returns {Promise} Promise com os dados do funcionário atualizado
   */
  async atualizar(id, dados) {
    const response = await api.put(`/funcionarios/${id}`, dados);
    return response.data;
  },
  
  /**
   * Remove um funcionário
   * @param {number} id - ID do funcionário
   * @returns {Promise} Promise com resultado da operação
   */
  async remover(id) {
    const response = await api.delete(`/funcionarios/${id}`);
    return response.data;
  }
};

export default funcionariosService;