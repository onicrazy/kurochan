const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const { AppError } = require('../middlewares/errorMiddleware');

/**
 * Controlador para gerenciar autenticação de usuários
 */
class AuthController {
  /**
   * Registra um novo usuário
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async register(req, res, next) {
    try {
      const { nome, email, senha, funcao, idioma_preferido } = req.body;
      
      // Verificar se o usuário já existe
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        throw new AppError(req.t('auth.error.emailAlreadyExists'), 409);
      }
      
      // Hash da senha
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(senha, saltRounds);
      
      // Criar novo usuário
      const newUser = await UserModel.create({
        nome,
        email,
        senha: hashedPassword,
        funcao: funcao || 'operador',
        idioma_preferido: idioma_preferido || 'pt-BR'
      });
      
      // Remover a senha do objeto de resposta
      delete newUser.senha;
      
      return res.status(201).json({
        message: req.t('auth.userCreatedSuccessfully'),
        user: newUser
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Autentica um usuário e retorna um token JWT
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async login(req, res, next) {
    try {
      const { email, senha } = req.body;
      
      // Buscar usuário
      const user = await UserModel.findByEmail(email);
      if (!user) {
        throw new AppError(req.t('auth.error.invalidCredentials'), 401);
      }
      
      // Verificar se o usuário está ativo
      if (!user.ativo) {
        throw new AppError(req.t('auth.error.accountDisabled'), 403);
      }
      
      // Verificar senha
      const isPasswordValid = await bcrypt.compare(senha, user.senha);
      if (!isPasswordValid) {
        throw new AppError(req.t('auth.error.invalidCredentials'), 401);
      }
      
      // Gerar token JWT
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.funcao,
          preferredLanguage: user.idioma_preferido
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION || '24h' }
      );
      
      // Remover a senha do objeto de resposta
      delete user.senha;
      
      return res.json({
        message: req.t('auth.loginSuccessful'),
        user,
        token
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Retorna as informações do usuário atual
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async me(req, res, next) {
    try {
      const userId = req.userId;
      
      // Buscar usuário
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new AppError(req.t('auth.error.userNotFound'), 404);
      }
      
      // Remover a senha do objeto de resposta
      delete user.senha;
      
      return res.json({
        user
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Atualiza a senha do usuário
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async changePassword(req, res, next) {
    try {
      const userId = req.userId;
      const { senhaAtual, novaSenha } = req.body;
      
      // Buscar usuário
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new AppError(req.t('auth.error.userNotFound'), 404);
      }
      
      // Verificar senha atual
      const isPasswordValid = await bcrypt.compare(senhaAtual, user.senha);
      if (!isPasswordValid) {
        throw new AppError(req.t('auth.error.incorrectPassword'), 401);
      }
      
      // Hash da nova senha
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(novaSenha, saltRounds);
      
      // Atualizar senha
      await UserModel.updatePassword(userId, hashedPassword);
      
      return res.json({
        message: req.t('auth.passwordChangedSuccessfully')
      });
      
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();