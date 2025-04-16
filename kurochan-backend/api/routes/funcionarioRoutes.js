const express = require('express');
const router = express.Router();
const funcionarioController = require('../controllers/funcionarioController');
const { authMiddleware, isManagerOrAdmin } = require('../middlewares/authMiddleware');
const { body } = require('express-validator');

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

/**
 * @route GET /api/funcionarios
 * @desc Lista todos os funcionários com filtros e paginação
 * @access Private
 */
router.get('/', funcionarioController.index);

/**
 * @route GET /api/funcionarios/:id
 * @desc Busca um funcionário pelo ID
 * @access Private
 */
router.get('/:id', funcionarioController.show);

/**
 * @route POST /api/funcionarios
 * @desc Cria um novo funcionário
 * @access Private (Manager/Admin)
 */
router.post('/', 
  isManagerOrAdmin,
  [
    // Validação dos campos obrigatórios
    body('nome').notEmpty().withMessage('Nome do funcionário é obrigatório'),
    body('cargo').notEmpty().withMessage('Cargo do funcionário é obrigatório'),
    body('valor_diaria').isFloat({ min: 0 }).withMessage('Valor da diária deve ser um número positivo')
  ],
  funcionarioController.store
);

/**
 * @route PUT /api/funcionarios/:id
 * @desc Atualiza um funcionário existente
 * @access Private (Manager/Admin)
 */
router.put('/:id', 
  isManagerOrAdmin,
  [
    // Validação dos campos (opcional para atualização)
    body('nome').optional().notEmpty().withMessage('Nome do funcionário não pode estar vazio'),
    body('cargo').optional().notEmpty().withMessage('Cargo do funcionário não pode estar vazio'),
    body('valor_diaria').optional().isFloat({ min: 0 }).withMessage('Valor da diária deve ser um número positivo')
  ],
  funcionarioController.update
);

/**
 * @route DELETE /api/funcionarios/:id
 * @desc Desativa um funcionário (soft delete)
 * @access Private (Manager/Admin)
 */
router.delete('/:id', isManagerOrAdmin, funcionarioController.destroy);

/**
 * @route GET /api/funcionarios/:id/alocacoes
 * @desc Busca o histórico de alocações do funcionário
 * @access Private
 */
router.get('/:id/alocacoes', funcionarioController.getAlocacoes);

/**
 * @route GET /api/funcionarios/:id/pagamentos
 * @desc Busca o histórico de pagamentos do funcionário
 * @access Private
 */
router.get('/:id/pagamentos', funcionarioController.getPagamentos);

module.exports = router;