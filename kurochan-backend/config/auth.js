const jwt = require('jsonwebtoken');
const environment = require('./environment');

/**
 * Configurações de autenticação
 */
module.exports = {
  /**
   * Gera um token JWT
   * @param {Object} payload - Dados a serem incluídos no token
   * @returns {string} Token JWT
   */
  generateToken(payload) {
    return jwt.sign(
      payload,
      environment.jwt.secret,
      { expiresIn: environment.jwt.expiresIn }
    );
  },
  
  /**
   * Verifica um token JWT
   * @param {string} token - Token JWT
   * @returns {Object} Payload do token
   */
  verifyToken(token) {
    return jwt.verify(token, environment.jwt.secret);
  },
  
  /**
   * Configurações para bcrypt
   */
  bcrypt: {
    saltRounds: 10
  },
  
  /**
   * Funções de usuário
   */
  roles: {
    ADMIN: 'administrador',
    MANAGER: 'gerente',
    OPERATOR: 'operador'
  },
  
  /**
   * Permissões por função
   */
  permissions: {
    administrador: [
      'user:create',
      'user:read',
      'user:update',
      'user:delete',
      'empresa:create',
      'empresa:read',
      'empresa:update',
      'empresa:delete',
      'funcionario:create',
      'funcionario:read',
      'funcionario:update',
      'funcionario:delete',
      'alocacao:create',
      'alocacao:read',
      'alocacao:update',
      'alocacao:delete',
      'pagamento:create',
      'pagamento:read',
      'pagamento:update',
      'pagamento:delete',
      'relatorio:read',
      'tipoServico:create',
      'tipoServico:read',
      'tipoServico:update',
      'tipoServico:delete'
    ],
    gerente: [
      'user:read',
      'empresa:create',
      'empresa:read',
      'empresa:update',
      'empresa:delete',
      'funcionario:create',
      'funcionario:read',
      'funcionario:update',
      'funcionario:delete',
      'alocacao:create',
      'alocacao:read',
      'alocacao:update',
      'alocacao:delete',
      'pagamento:create',
      'pagamento:read',
      'pagamento:update',
      'pagamento:delete',
      'relatorio:read',
      'tipoServico:read',
      'tipoServico:create',
      'tipoServico:update'
    ],
    operador: [
      'empresa:read',
      'funcionario:read',
      'alocacao:read',
      'pagamento:read',
      'relatorio:read',
      'tipoServico:read'
    ]
  },
  
  /**
   * Verifica se um usuário tem permissão
   * @param {string} role - Função do usuário
   * @param {string} permission - Permissão a verificar
   * @returns {boolean} True se tem permissão
   */
  hasPermission(role, permission) {
    if (!role || !permission) return false;
    
    // Se for administrador, tem todas as permissões
    if (role === this.roles.ADMIN) return true;
    
    // Verificar na lista de permissões
    return this.permissions[role]?.includes(permission) || false;
  }
};