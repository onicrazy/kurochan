const express = require('express');
const router = express.Router();
const alocacaoController = require('../controllers/alocacaoController');
const { authMiddleware, isManagerOrAdmin } = require('../middlewares/authMiddleware');
const { body } = require('express-validator');

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

/**
 * @route GET /api/alocacoes
 * @desc Lista todas as alocações com filtros e paginação
 * @access Private
 */
router.get('/', alocacaoController.index);

/**
 * @route GET /api/alocacoes/:id
 * @desc Busca uma alocação pelo ID
 * @access Private
 */
router.get('/:id', alocacaoController.show);

/**
 * @route GET /api/alocacoes/calendario/:ano/:mes
 * @desc Busca alocações para visualização em calendário
 * @access Private
 */
router.get('/calendario/:ano/:mes', alocacaoController.getCalendar);

/**
 * @route POST /api/alocacoes
 * @desc Cria uma nova alocação
 * @access Private (Manager/Admin)
 */
router.post('/', 
  isManagerOrAdmin,
  [
    // Validação dos campos obrigatórios
    body('empresa_id').isInt().withMessage('ID da empresa deve ser um número inteiro'),
    body('funcionario_id').isInt().withMessage('ID do funcionário deve ser um número inteiro'),
    body('data_alocacao').isDate().withMessage('Data de alocação deve ser uma data válida'),
    body('tipo_periodo').isIn(['integral', 'meio']).withMessage('Tipo de período deve ser "integral" ou "meio"'),
    body('valor_pago_funcionario').isFloat({ min: 0 }).withMessage('Valor pago ao funcionário deve ser um número positivo'),
    body('valor_cobrado_empresa').isFloat({ min: 0 }).withMessage('Valor cobrado da empresa deve ser um número positivo')
  ],
  alocacaoController.store
);

/**
 * @route PUT /api/alocacoes/:id
 * @desc Atualiza uma alocação existente
 * @access Private (Manager/Admin)
 */
router.put('/:id', 
  isManagerOrAdmin,
  [
    // Validação dos campos (opcional para atualização)
    body('empresa_id').optional().isInt().withMessage('ID da empresa deve ser um número inteiro'),
    body('funcionario_id').optional().isInt().withMessage('ID do funcionário deve ser um número inteiro'),
    body('data_alocacao').optional().isDate().withMessage('Data de alocação deve ser uma data válida'),
    body('tipo_periodo').optional().isIn(['integral', 'meio']).withMessage('Tipo de período deve ser "integral" ou "meio"'),
    body('valor_pago_funcionario').optional().isFloat({ min: 0 }).withMessage('Valor pago ao funcionário deve ser um número positivo'),
    body('valor_cobrado_empresa').optional().isFloat({ min: 0 }).withMessage('Valor cobrado da empresa deve ser um número positivo'),
    body('status_pagamento_funcionario').optional().isIn(['pendente', 'pago']).withMessage('Status de pagamento do funcionário deve ser "pendente" ou "pago"'),
    body('status_pagamento_empresa').optional().isIn(['pendente', 'pago']).withMessage('Status de pagamento da empresa deve ser "pendente" ou "pago"')
  ],
  alocacaoController.update
);

/**
 * @route DELETE /api/alocacoes/:id
 * @desc Remove uma alocação
 * @access Private (Manager/Admin)
 */
router.delete('/:id', isManagerOrAdmin, alocacaoController.destroy);

/**
 * @route PATCH /api/alocacoes/:id/status-pagamento-funcionario
 * @desc Atualiza o status de pagamento do funcionário
 * @access Private (Manager/Admin)
 */
router.patch('/:id/status-pagamento-funcionario', 
  isManagerOrAdmin,
  [
    body('status').isIn(['pendente', 'pago']).withMessage('Status deve ser "pendente" ou "pago"')
  ],
  alocacaoController.updateStatusPagamentoFuncionario
);

/**
 * @route PATCH /api/alocacoes/:id/status-pagamento-empresa
 * @desc Atualiza o status de pagamento da empresa
 * @access Private (Manager/Admin)
 */
router.patch('/:id/status-pagamento-empresa', 
  isManagerOrAdmin,
  [
    body('status').isIn(['pendente', 'pago']).withMessage('Status deve ser "pendente" ou "pago"')
  ],
  alocacaoController.updateStatusPagamentoEmpresa
);

module.exports = router;