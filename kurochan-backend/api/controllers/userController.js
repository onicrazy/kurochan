const bcrypt = require('bcrypt');
const UserModel = require('../models/userModel');
const { AppError } = require('../middlewares/errorMiddleware');
const { isAdmin } = require('../middlewares/authMiddleware');

/**
 * Controlador para gerenciar usuários do sistema
 */
class UserController {
  /**
   * Lista todos os usuários
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async index(req, res, next) {
    try {
      // Verificar se o usuário tem permissão de administrador
      if (req.userRole !== 'administrador') {
        throw new AppError(req.t('auth.error.adminRightsRequired'), 403);
      }
      
      // Parâmetros de filtragem e paginação
      const { 
        page = 1, 
        limit = 20, 
        sortBy = 'nome', 
        sortOrder = 'asc',
        nome,
        email,
        funcao,
        ativo
      } = req.query;
      
      // Filtros
      const filters = {};
      if (nome) filters.nome = nome;
      if (email) filters.email = email;
      if (funcao) filters.funcao = funcao;
      if (ativo !== undefined) filters.ativo = ativo === 'true';
      
      // Buscar usuários com paginação
      const { users, total } = await UserModel.findAll({
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sortBy,
        sortOrder,
        filters
      });
      
      // Remover senhas dos objetos de resposta
      const usersWithoutPassword = users.map(user => {
        const userObj = { ...user };
        delete userObj.senha;
        return userObj;
      });
      
      return res.json({
        data: usersWithoutPassword,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          totalPages: Math.ceil(total / parseInt(limit, 10))
        }
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Busca um usuário pelo ID
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async show(req, res, next) {
    try {
      const { id } = req.params;
      
      // Verificar se o usuário está buscando a si mesmo ou tem permissão de administrador
      if (req.userId !== parseInt(id, 10) && req.userRole !== 'administrador') {
        throw new AppError(req.t('auth.error.adminRightsRequired'), 403);
      }
      
      // Buscar usuário
      const user = await UserModel.findById(id);
      if (!user) {
        throw new AppError(req.t('users.error.notFound'), 404);
      }
      
      // Remover senha do objeto de resposta
      delete user.senha;
      
      return res.json({ data: user });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Cria um novo usuário
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async store(req, res, next) {
    try {
      // Verificar se o usuário tem permissão de administrador
      if (req.userRole !== 'administrador') {
        throw new AppError(req.t('auth.error.adminRightsRequired'), 403);
      }
      
      const {
        nome,
        email,
        senha,
        funcao,
        idioma_preferido
      } = req.body;
      
      // Verificar se o email já está em uso
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        throw new AppError(req.t('users.error.emailAlreadyExists'), 409);
      }
      
      // Validar função
      const validRoles = ['administrador', 'gerente', 'operador'];
      if (!validRoles.includes(funcao)) {
        throw new AppError(req.t('users.error.invalidRole'), 400);
      }
      
      // Hash da senha
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(senha, saltRounds);
      
      // Criar usuário
      const user = await UserModel.create({
        nome,
        email,
        senha: hashedPassword,
        funcao,
        idioma_preferido: idioma_preferido || 'pt-BR',
        ativo: true
      });
      
      // Remover senha do objeto de resposta
      delete user.senha;
      
      return res.status(201).json({
        message: req.t('users.success.created'),
        data: user
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Atualiza um usuário
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      
      // Verificar se o usuário está atualizando a si mesmo ou tem permissão de administrador
      if (req.userId !== parseInt(id, 10) && req.userRole !== 'administrador') {
        throw new AppError(req.t('auth.error.adminRightsRequired'), 403);
      }
      
      const {
        nome,
        email,
        funcao,
        idioma_preferido,
        ativo
      } = req.body;
      
      // Verificar se o usuário existe
      const existingUser = await UserModel.findById(id);
      if (!existingUser) {
        throw new AppError(req.t('users.error.notFound'), 404);
      }
      
      // Se o email está sendo alterado, verificar se já está em uso
      if (email && email !== existingUser.email) {
        const emailExists = await UserModel.findByEmail(email);
        if (emailExists) {
          throw new AppError(req.t('users.error.emailAlreadyExists'), 409);
        }
      }
      
      // Validar função
      if (funcao) {
        const validRoles = ['administrador', 'gerente', 'operador'];
        if (!validRoles.includes(funcao)) {
          throw new AppError(req.t('users.error.invalidRole'), 400);
        }
      }
      
      // Verificações adicionais para usuários não administradores
      if (req.userRole !== 'administrador') {
        // Usuários não administradores não podem alterar seu próprio papel
        if (funcao && funcao !== existingUser.funcao) {
          throw new AppError(req.t('users.error.cannotEditSelf'), 403);
        }
        
        // Usuários não administradores não podem se desativar
        if (ativo !== undefined && !ativo) {
          throw new AppError(req.t('users.error.cannotDeactivateSelf'), 403);
        }
      }
      
      // Impedir desativação do próprio usuário administrador
      if (req.userId === parseInt(id, 10) && req.userRole === 'administrador' && ativo !== undefined && !ativo) {
        throw new AppError(req.t('users.error.cannotDeactivateSelf'), 403);
      }
      
      // Atualizar usuário
      const user = await UserModel.update(id, {
        nome,
        email,
        funcao,
        idioma_preferido,
        ativo
      });
      
      // Remover senha do objeto de resposta
      delete user.senha;
      
      return res.json({
        message: req.t('users.success.updated'),
        data: user
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Redefine a senha de um usuário
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async resetPassword(req, res, next) {
    try {
      const { id } = req.params;
      const { novaSenha } = req.body;
      
      // Apenas administradores podem redefinir senhas de outros usuários
      if (req.userId !== parseInt(id, 10) && req.userRole !== 'administrador') {
        throw new AppError(req.t('auth.error.adminRightsRequired'), 403);
      }
      
      // Verificar se o usuário existe
      const existingUser = await UserModel.findById(id);
      if (!existingUser) {
        throw new AppError(req.t('users.error.notFound'), 404);
      }
      
      // Hash da nova senha
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(novaSenha, saltRounds);
      
      // Atualizar senha
      await UserModel.updatePassword(id, hashedPassword);
      
      return res.json({
        message: req.t('users.success.passwordReset')
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Atualiza configurações do perfil do usuário
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async updateProfile(req, res, next) {
    try {
      const userId = req.userId;
      const { nome, idioma_preferido } = req.body;
      
      // Verificar se o usuário existe
      const existingUser = await UserModel.findById(userId);
      if (!existingUser) {
        throw new AppError(req.t('users.error.notFound'), 404);
      }
      
      // Atualizar perfil
      const user = await UserModel.update(userId, {
        nome,
        idioma_preferido
      });
      
      // Remover senha do objeto de resposta
      delete user.senha;
      
      return res.json({
        message: req.t('settings.success.settingsUpdated'),
        data: user
      });
      
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();