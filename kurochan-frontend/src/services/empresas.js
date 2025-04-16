import api from './api';

/**
 * Serviço para gerenciar empresas
 */
const empresasService = {
  /**
   * Busca lista de empresas com filtros
   * @param {Object} params - Parâmetros de filtro
   * @returns {Promise} Promise com os resultados
   */
  async listar(params = {}) {
    const response = await api.get('/empresas', { params });
    return response.data;
  },
  
  /**
   * Busca uma empresa específica
   * @param {number} id - ID da empresa
   * @returns {Promise} Promise com os dados da empresa
   */
  async obter(id) {
    const response = await api.get(`/empresas/${id}`);
    return response.data;
  },
  
  /**
   * Cria uma nova empresa
   * @param {Object} dados - Dados da empresa
   * @returns {Promise} Promise com os dados da empresa criada
   */
  async criar(dados) {
    const response = await api.post('/empresas', dados);
    return response.data;
  },
  
  /**
   * Atualiza uma empresa existente
   * @param {number} id - ID da empresa
   * @param {Object} dados - Novos dados da empresa
   * @returns {Promise} Promise com os dados da empresa atualizada
   */
  async atualizar(id, dados) {
    const response = await api.put(`/empresas/${id}`, dados);
    return response.data;
  },
  
  /**
   * Remove uma empresa
   * @param {number} id - ID da empresa
   * @returns {Promise} Promise com resultado da operação
   */
  async remover(id) {
    const response = await api.delete(`/empresas/${id}`);
    return response.data;
  }
};

export default empresasService;