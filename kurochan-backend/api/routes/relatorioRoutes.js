const express = require('express');
const router = express.Router();
const relatorioController = require('../controllers/relatorioController');
const { authMiddleware, isManagerOrAdmin } = require('../middlewares/authMiddleware');

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

/**
 * @route GET /api/relatorios/resumo-financeiro
 * @desc Obtém um resumo financeiro para o dashboard
 * @access Private
 */
router.get('/resumo-financeiro', relatorioController.resumoFinanceiro);

/**
 * @route GET /api/relatorios/estatisticas-mensais
 * @desc Obtém estatísticas mensais para gráficos do dashboard
 * @access Private
 */
router.get('/estatisticas-mensais', relatorioController.estatisticasMensais);

/**
 * @route GET /api/relatorios/alocacoes
 * @desc Gera um relatório de alocações com filtros
 * @access Private (Manager/Admin)
 */
router.get('/alocacoes', isManagerOrAdmin, relatorioController.relatorioAlocacoes);

/**
 * @route GET /api/relatorios/financeiro
 * @desc Gera um relatório financeiro com receitas e despesas
 * @access Private (Manager/Admin)
 */
router.get('/financeiro', isManagerOrAdmin, relatorioController.relatorioFinanceiro);

/**
 * @route GET /api/relatorios/produtividade-funcionarios
 * @desc Gera um relatório de produtividade de funcionários
 * @access Private (Manager/Admin)
 */
router.get('/produtividade-funcionarios', isManagerOrAdmin, relatorioController.relatorioProdutividadeFuncionarios);

/**
 * @route GET /api/relatorios/recibo-pagamento/:id
 * @desc Gera um recibo de pagamento para funcionário
 * @access Private (Manager/Admin)
 */
router.get('/recibo-pagamento/:id', isManagerOrAdmin, relatorioController.gerarReciboPagamento);

/**
 * @route GET /api/relatorios/fatura-empresa/:id
 * @desc Gera uma fatura para empresa
 * @access Private (Manager/Admin)
 */
router.get('/fatura-empresa/:id', isManagerOrAdmin, relatorioController.gerarFaturaEmpresa);

module.exports = router;