const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const { body } = require('express-validator');

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

/**
 * @route GET /api/users
 * @desc Lista todos os usuários (apenas para administradores)
 * @access Private (Admin)
 */
router.get('/', userController.index);

/**
 * @route GET /api/users/:id
 * @desc Busca um usuário pelo ID
 * @access Private (Admin ou o próprio usuário)
 */
router.get('/:id', userController.show);

/**
 * @route POST /api/users
 * @desc Cria um novo usuário (apenas para administradores)
 * @access Private (Admin)
 */
router.post('/', 
  isAdmin,
  [
    // Validação dos campos obrigatórios
    body('nome').notEmpty().withMessage('Nome do usuário é obrigatório'),
    body('email').isEmail().withMessage('Email inválido'),
    body('senha').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
    body('funcao').isIn(['administrador', 'gerente', 'operador']).withMessage('Função inválida')
  ],
  userController.store
);

/**
 * @route PUT /api/users/:id
 * @desc Atualiza um usuário existente
 * @access Private (Admin ou o próprio usuário)
 */
router.put('/:id', 
  [
    // Validação dos campos (opcional para atualização)
    body('nome').optional().notEmpty().withMessage('Nome do usuário não pode estar vazio'),
    body('email').optional().isEmail().withMessage('Email inválido'),
    body('funcao').optional().isIn(['administrador', 'gerente', 'operador']).withMessage('Função inválida'),
    body('idioma_preferido').optional().isIn(['pt-BR', 'ja']).withMessage('Idioma preferido inválido')
  ],
  userController.update
);

/**
 * @route POST /api/users/:id/reset-password
 * @desc Redefine a senha de um usuário
 * @access Private (Admin ou o próprio usuário)
 */
router.post('/:id/reset-password', 
  [
    body('novaSenha').isLength({ min: 6 }).withMessage('Nova senha deve ter pelo menos 6 caracteres')
  ],
  userController.resetPassword
);

/**
 * @route PUT /api/users/profile
 * @desc Atualiza o perfil do usuário atual
 * @access Private
 */
router.put('/profile', 
  [
    body('nome').optional().notEmpty().withMessage('Nome do usuário não pode estar vazio'),
    body('idioma_preferido').optional().isIn(['pt-BR', 'ja']).withMessage('Idioma preferido inválido')
  ],
  userController.updateProfile
);

module.exports = router;