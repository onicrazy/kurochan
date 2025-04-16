const express = require('express');
const router = express.Router();
const pagamentoController = require('../controllers/pagamentoController');
const { authMiddleware, isManagerOrAdmin } = require('../middlewares/authMiddleware');
const { body } = require('express-validator');

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

// ==================== ROTAS DE PAGAMENTOS A FUNCIONÁRIOS ====================

/**
 * @route GET /api/pagamentos/funcionarios
 * @desc Lista todos os pagamentos a funcionários
 * @access Private
 */
router.get('/funcionarios', pagamentoController.listarPagamentosFuncionarios);

/**
 * @route GET /api/pagamentos/funcionarios/:id
 * @desc Busca um pagamento a funcionário pelo ID
 * @access Private
 */
router.get('/funcionarios/:id', pagamentoController.buscarPagamentoFuncionario);

/**
 * @route POST /api/pagamentos/funcionarios
 * @desc Cria um novo pagamento a funcionário
 * @access Private (Manager/Admin)
 */
router.post('/funcionarios', 
  isManagerOrAdmin,
  [
    // Validação dos campos obrigatórios
    body('funcionario_id').isInt().withMessage('ID do funcionário deve ser um número inteiro'),
    body('data_pagamento').isDate().withMessage('Data de pagamento deve ser uma data válida'),
    body('periodo_inicio').isDate().withMessage('Data de início do período deve ser uma data válida'),
    body('periodo_fim').isDate().withMessage('Data de fim do período deve ser uma data válida'),
    body('alocacoes_ids').isArray().withMessage('Lista de alocações é obrigatória')
  ],
  pagamentoController.criarPagamentoFuncionario
);

/**
 * @route GET /api/pagamentos/funcionarios/calcular/:funcionarioId
 * @desc Calcula o total a ser pago a um funcionário em um período
 * @access Private (Manager/Admin)
 */
router.get('/funcionarios/calcular/:funcionarioId', 
  isManagerOrAdmin,
  pagamentoController.calcularPagamentoFuncionario
);

// ==================== ROTAS DE FATURAS PARA EMPRESAS ====================

/**
 * @route GET /api/pagamentos/empresas
 * @desc Lista todas as faturas para empresas
 * @access Private
 */
router.get('/empresas', pagamentoController.listarFaturasEmpresas);

/**
 * @route GET /api/pagamentos/empresas/:id
 * @desc Busca uma fatura para empresa pelo ID
 * @access Private
 */
router.get('/empresas/:id', pagamentoController.buscarFaturaEmpresa);

/**
 * @route POST /api/pagamentos/empresas
 * @desc Cria uma nova fatura para empresa
 * @access Private (Manager/Admin)
 */
router.post('/empresas', 
  isManagerOrAdmin,
  [
    // Validação dos campos obrigatórios
    body('empresa_id').isInt().withMessage('ID da empresa deve ser um número inteiro'),
    body('data_fatura').isDate().withMessage('Data da fatura deve ser uma data válida'),
    body('data_vencimento').isDate().withMessage('Data de vencimento deve ser uma data válida'),
    body('periodo_inicio').isDate().withMessage('Data de início do período deve ser uma data válida'),
    body('periodo_fim').isDate().withMessage('Data de fim do período deve ser uma data válida'),
    body('alocacoes_ids').isArray().withMessage('Lista de alocações é obrigatória')
  ],
  pagamentoController.criarFaturaEmpresa
);

/**
 * @route PATCH /api/pagamentos/empresas/:id/status
 * @desc Atualiza o status de pagamento de uma fatura
 * @access Private (Manager/Admin)
 */
router.patch('/empresas/:id/status', 
  isManagerOrAdmin,
  [
    body('status_pagamento').isIn(['pendente', 'pago', 'parcial']).withMessage('Status de pagamento inválido')
  ],
  pagamentoController.atualizarStatusFatura
);

/**
 * @route GET /api/pagamentos/empresas/calcular/:empresaId
 * @desc Calcula o total a ser faturado para uma empresa em um período
 * @access Private (Manager/Admin)
 */
router.get('/empresas/calcular/:empresaId', 
  isManagerOrAdmin,
  pagamentoController.calcularFaturaEmpresa
);

module.exports = router;