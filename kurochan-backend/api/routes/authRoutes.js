const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { body } = require('express-validator');

/**
 * @route POST /api/auth/register
 * @desc Registra um novo usuário
 * @access Public
 */
router.post('/register', 
  [
    body('nome').notEmpty().withMessage('Nome é obrigatório'),
    body('email').isEmail().withMessage('Email inválido'),
    body('senha').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres')
  ],
  authController.register
);

/**
 * @route POST /api/auth/login
 * @desc Autentica um usuário e retorna um token JWT
 * @access Public
 */
router.post('/login', 
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('senha').notEmpty().withMessage('Senha é obrigatória')
  ],
  authController.login
);

/**
 * @route GET /api/auth/me
 * @desc Retorna as informações do usuário atual
 * @access Private
 */
router.get('/me', authMiddleware, authController.me);

/**
 * @route POST /api/auth/change-password
 * @desc Atualiza a senha do usuário
 * @access Private
 */
router.post('/change-password', 
  authMiddleware,
  [
    body('senhaAtual').notEmpty().withMessage('Senha atual é obrigatória'),
    body('novaSenha').isLength({ min: 6 }).withMessage('Nova senha deve ter pelo menos 6 caracteres')
  ],
  authController.changePassword
);

module.exports = router;