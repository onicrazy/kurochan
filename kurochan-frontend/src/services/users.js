import api from './api';

/**
 * Serviço para gerenciar usuários
 */
const usersService = {
  /**
   * Busca lista de usuários
   * @param {Object} params - Parâmetros de filtro
   * @returns {Promise} Promise com os resultados
   */
  async listar(params = {}) {
    const response = await api.get('/users', { params });
    return response.data;
  },
  
  /**
   * Busca um usuário específico
   * @param {number} id - ID do usuário
   * @returns {Promise} Promise com os dados do usuário
   */
  async obter(id) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  
  /**
   * Cria um novo usuário
   * @param {Object} dados - Dados do usuário
   * @returns {Promise} Promise com os dados do usuário criado
   */
  async criar(dados) {
    const response = await api.post('/users', dados);
    return response.data;
  },
  
  /**
   * Atualiza um usuário existente
   * @param {number} id - ID do usuário
   * @param {Object} dados - Novos dados do usuário
   * @returns {Promise} Promise com os dados do usuário atualizado
   */
  async atualizar(id, dados) {
    const response = await api.put(`/users/${id}`, dados);
    return response.data;
  },
  
  /**
   * Atualiza perfil do usuário atual
   * @param {Object} dados - Novos dados do perfil
   * @returns {Promise} Promise com os dados do perfil atualizado
   */
  async atualizarPerfil(dados) {
    const response = await api.put('/users/profile', dados);
    return response.data;
  },
  
  /**
   * Remove um usuário
   * @param {number} id - ID do usuário
   * @returns {Promise} Promise com resultado da operação
   */
  async remover(id) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};

export default usersService;