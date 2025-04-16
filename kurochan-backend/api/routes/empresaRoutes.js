const express = require('express');
const router = express.Router();
const empresaController = require('../controllers/empresaController');
const { authMiddleware, isManagerOrAdmin } = require('../middlewares/authMiddleware');
const { body } = require('express-validator');

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

/**
 * @route GET /api/empresas
 * @desc Lista todas as empresas com filtros e paginação
 * @access Private
 */
router.get('/', empresaController.index);

/**
 * @route GET /api/empresas/:id
 * @desc Busca uma empresa pelo ID
 * @access Private
 */
router.get('/:id', empresaController.show);

/**
 * @route POST /api/empresas
 * @desc Cria uma nova empresa
 * @access Private (Manager/Admin)
 */
router.post('/', 
  isManagerOrAdmin,
  [
    // Validação dos campos obrigatórios
    body('nome').notEmpty().withMessage('Nome da empresa é obrigatório'),
    body('valor_padrao_servico').isFloat({ min: 0 }).withMessage('Valor padrão do serviço deve ser um número positivo')
  ],
  empresaController.store
);

/**
 * @route PUT /api/empresas/:id
 * @desc Atualiza uma empresa existente
 * @access Private (Manager/Admin)
 */
router.put('/:id', 
  isManagerOrAdmin,
  [
    // Validação dos campos (opcional para atualização)
    body('nome').optional().notEmpty().withMessage('Nome da empresa não pode estar vazio'),
    body('valor_padrao_servico').optional().isFloat({ min: 0 }).withMessage('Valor padrão do serviço deve ser um número positivo')
  ],
  empresaController.update
);

/**
 * @route DELETE /api/empresas/:id
 * @desc Desativa uma empresa (soft delete)
 * @access Private (Manager/Admin)
 */
router.delete('/:id', isManagerOrAdmin, empresaController.destroy);

/**
 * @route GET /api/empresas/:id/alocacoes
 * @desc Busca o histórico de alocações da empresa
 * @access Private
 */
router.get('/:id/alocacoes', empresaController.getAlocacoes);

/**
 * @route GET /api/empresas/:id/faturas
 * @desc Busca o histórico de faturas da empresa
 * @access Private
 */
router.get('/:id/faturas', empresaController.getFaturas);

/**
 * @route GET /api/empresas/:id/calcular-fatura
 * @desc Calcula o total a ser faturado para a empresa em um período
 * @access Private (Manager/Admin)
 */
router.get('/:id/calcular-fatura', isManagerOrAdmin, empresaController.calcularFatura);

module.exports = router;