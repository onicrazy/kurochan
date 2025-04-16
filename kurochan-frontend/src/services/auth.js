import api from './api';

/**
 * Serviço para gerenciar a autenticação do usuário
 */
const authService = {
  /**
   * Realiza o login do usuário
   * @param {string} email - Email do usuário
   * @param {string} senha - Senha do usuário
   * @returns {Object} Dados do usuário e token
   */
  async login(email, senha) {
    const response = await api.post('/auth/login', { email, senha });
    return response.data;
  },
  
  /**
   * Registra um novo usuário
   * @param {Object} userData - Dados do usuário
   * @returns {Object} Dados do usuário criado
   */
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  /**
   * Busca informações do usuário atual
   * @returns {Object} Dados do usuário
   */
  async me() {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  /**
   * Altera a senha do usuário
   * @param {string} senhaAtual - Senha atual
   * @param {string} novaSenha - Nova senha
   * @returns {Object} Mensagem de sucesso
   */
  async changePassword(senhaAtual, novaSenha) {
    const response = await api.post('/auth/change-password', { senhaAtual, novaSenha });
    return response.data;
  }
};

export default authService;