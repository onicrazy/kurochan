const PagamentoModel = require('../models/pagamentoModel');
const FuncionarioModel = require('../models/funcionarioModel');
const EmpresaModel = require('../models/empresaModel');
const AlocacaoModel = require('../models/alocacaoModel');
const { AppError } = require('../middlewares/errorMiddleware');
const moment = require('moment');

/**
 * Controlador para gerenciar pagamentos de funcionários e faturas para empresas
 */
class PagamentoController {
  // ==================== PAGAMENTOS A FUNCIONÁRIOS ====================
  
  /**
   * Lista todos os pagamentos a funcionários
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async listarPagamentosFuncionarios(req, res, next) {
    try {
      // Parâmetros de filtragem e paginação
      const { 
        page = 1, 
        limit = 20, 
        sortBy = 'data_pagamento', 
        sortOrder = 'desc',
        funcionarioId,
        dataInicio,
        dataFim
      } = req.query;
      
      // Filtros
      const filters = {};
      if (funcionarioId) filters.funcionarioId = parseInt(funcionarioId, 10);
      if (dataInicio) filters.dataInicio = dataInicio;
      if (dataFim) filters.dataFim = dataFim;
      
      // Buscar pagamentos com paginação
      const { pagamentos, total } = await PagamentoModel.findAllPagamentosFuncionarios({
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sortBy,
        sortOrder,
        filters
      });
      
      return res.json({
        data: pagamentos,
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
   * Busca um pagamento a funcionário pelo ID
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async buscarPagamentoFuncionario(req, res, next) {
    try {
      const { id } = req.params;
      
      // Buscar pagamento
      const pagamento = await PagamentoModel.findPagamentoFuncionarioById(id);
      if (!pagamento) {
        throw new AppError(req.t('payments.error.notFound'), 404);
      }
      
      return res.json({ data: pagamento });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Cria um novo pagamento a funcionário
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async criarPagamentoFuncionario(req, res, next) {
    try {
      const {
        funcionario_id,
        data_pagamento,
        periodo_inicio,
        periodo_fim,
        metodo_pagamento,
        numero_referencia,
        observacoes,
        alocacoes_ids
      } = req.body;
      
      // Verificar se o funcionário existe
      const funcionario = await FuncionarioModel.findById(funcionario_id);
      if (!funcionario) {
        throw new AppError(req.t('employees.error.notFound'), 404);
      }
      
      // Validar datas
      if (!periodo_inicio || !periodo_fim || !data_pagamento) {
        throw new AppError(req.t('payments.error.invalidDates'), 400);
      }
      
      if (moment(periodo_fim).isBefore(moment(periodo_inicio))) {
        throw new AppError(req.t('payments.error.endDateBeforeStartDate'), 400);
      }
      
      // Verificar se foram fornecidos IDs de alocações
      if (!alocacoes_ids || !Array.isArray(alocacoes_ids) || alocacoes_ids.length === 0) {
        throw new AppError(req.t('payments.error.noAllocationsSelected'), 400);
      }
      
      // Buscar alocações pelos IDs
      const alocacoesPromises = alocacoes_ids.map(id => AlocacaoModel.findById(id));
      const alocacoes = await Promise.all(alocacoesPromises);
      
      // Verificar se todas as alocações existem e pertencem ao funcionário
      for (let i = 0; i < alocacoes.length; i++) {
        const alocacao = alocacoes[i];
        
        if (!alocacao) {
          throw new AppError(req.t('allocation.error.notFound'), 404);
        }
        
        if (alocacao.funcionario_id !== funcionario_id) {
          throw new AppError(req.t('payments.error.allocationNotBelongToEmployee'), 400);
        }
        
        if (alocacao.status_pagamento_funcionario === 'pago') {
          throw new AppError(req.t('payments.error.allocationsAlreadyPaid'), 400);
        }
      }
      
      // Calcular valor total
      const valor_total = alocacoes.reduce((total, alocacao) => 
        total + parseFloat(alocacao.valor_pago_funcionario), 0);
      
      // Criar pagamento
      const pagamento = await PagamentoModel.createPagamentoFuncionario({
        funcionario_id,
        data_pagamento,
        valor_total,
        periodo_inicio,
        periodo_fim,
        metodo_pagamento,
        numero_referencia,
        observacoes,
        alocacoes: alocacoes.map(alocacao => ({
          alocacao_id: alocacao.id,
          valor: parseFloat(alocacao.valor_pago_funcionario)
        }))
      });
      
      return res.status(201).json({
        message: req.t('payments.success.employeePaymentCreated'),
        data: pagamento
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  // ==================== FATURAS PARA EMPRESAS ====================
  
  /**
   * Lista todas as faturas para empresas
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async listarFaturasEmpresas(req, res, next) {
    try {
      // Parâmetros de filtragem e paginação
      const { 
        page = 1, 
        limit = 20, 
        sortBy = 'data_fatura', 
        sortOrder = 'desc',
        empresaId,
        dataInicio,
        dataFim,
        status
      } = req.query;
      
      // Filtros
      const filters = {};
      if (empresaId) filters.empresaId = parseInt(empresaId, 10);
      if (dataInicio) filters.dataInicio = dataInicio;
      if (dataFim) filters.dataFim = dataFim;
      if (status) filters.status = status;
      
      // Buscar faturas com paginação
      const { faturas, total } = await PagamentoModel.findAllFaturasEmpresas({
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sortBy,
        sortOrder,
        filters
      });
      
      return res.json({
        data: faturas,
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
   * Busca uma fatura para empresa pelo ID
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async buscarFaturaEmpresa(req, res, next) {
    try {
      const { id } = req.params;
      
      // Buscar fatura
      const fatura = await PagamentoModel.findFaturaEmpresaById(id);
      if (!fatura) {
        throw new AppError(req.t('payments.error.notFound'), 404);
      }
      
      return res.json({ data: fatura });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Cria uma nova fatura para empresa
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async criarFaturaEmpresa(req, res, next) {
    try {
      const {
        empresa_id,
        data_fatura,
        data_vencimento,
        periodo_inicio,
        periodo_fim,
        observacoes,
        alocacoes_ids
      } = req.body;
      
      // Verificar se a empresa existe
      const empresa = await EmpresaModel.findById(empresa_id);
      if (!empresa) {
        throw new AppError(req.t('companies.error.notFound'), 404);
      }
      
      // Validar datas
      if (!periodo_inicio || !periodo_fim || !data_fatura || !data_vencimento) {
        throw new AppError(req.t('payments.error.invalidDates'), 400);
      }
      
      if (moment(periodo_fim).isBefore(moment(periodo_inicio))) {
        throw new AppError(req.t('payments.error.endDateBeforeStartDate'), 400);
      }
      
      if (moment(data_vencimento).isBefore(moment(data_fatura))) {
        throw new AppError(req.t('payments.error.dueDateBeforeInvoiceDate'), 400);
      }
      
      // Verificar se foram fornecidos IDs de alocações
      if (!alocacoes_ids || !Array.isArray(alocacoes_ids) || alocacoes_ids.length === 0) {
        throw new AppError(req.t('payments.error.noAllocationsSelected'), 400);
      }
      
      // Buscar alocações pelos IDs
      const alocacoesPromises = alocacoes_ids.map(id => AlocacaoModel.findById(id));
      const alocacoes = await Promise.all(alocacoesPromises);
      
      // Verificar se todas as alocações existem e pertencem à empresa
      for (let i = 0; i < alocacoes.length; i++) {
        const alocacao = alocacoes[i];
        
        if (!alocacao) {
          throw new AppError(req.t('allocation.error.notFound'), 404);
        }
        
        if (alocacao.empresa_id !== empresa_id) {
          throw new AppError(req.t('payments.error.allocationNotBelongToCompany'), 400);
        }
        
        if (alocacao.status_pagamento_empresa === 'pago') {
          throw new AppError(req.t('payments.error.allocationsAlreadyPaid'), 400);
        }
      }
      
      // Calcular valor total
      const valor_total = alocacoes.reduce((total, alocacao) => 
        total + parseFloat(alocacao.valor_cobrado_empresa), 0);
      
      // Criar fatura
      const fatura = await PagamentoModel.createFaturaEmpresa({
        empresa_id,
        data_fatura,
        data_vencimento,
        valor_total,
        periodo_inicio,
        periodo_fim,
        status_pagamento: 'pendente',
        observacoes,
        alocacoes: alocacoes.map(alocacao => ({
          alocacao_id: alocacao.id,
          valor: parseFloat(alocacao.valor_cobrado_empresa)
        }))
      });
      
      return res.status(201).json({
        message: req.t('payments.success.companyInvoiceCreated'),
        data: fatura
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Atualiza o status de pagamento de uma fatura
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async atualizarStatusFatura(req, res, next) {
    try {
      const { id } = req.params;
      const { status_pagamento, metodo_pagamento, numero_referencia } = req.body;
      
      // Verificar se a fatura existe
      const fatura = await PagamentoModel.findFaturaEmpresaById(id);
      if (!fatura) {
        throw new AppError(req.t('payments.error.notFound'), 404);
      }
      
      // Validar status
      const statusesValidos = ['pendente', 'pago', 'parcial'];
      if (!statusesValidos.includes(status_pagamento)) {
        throw new AppError(req.t('payments.error.invalidStatus'), 400);
      }
      
      // Atualizar status
      const faturaAtualizada = await PagamentoModel.updateFaturaStatus(id, {
        status_pagamento,
        metodo_pagamento,
        numero_referencia
      });
      
      return res.json({
        message: req.t('payments.success.statusUpdated'),
        data: faturaAtualizada
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  // ==================== MÉTODOS DE APOIO ====================
  
  /**
   * Calcula o total a ser pago para um funcionário em um período
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async calcularPagamentoFuncionario(req, res, next) {
    try {
      const { funcionarioId } = req.params;
      const { dataInicio, dataFim } = req.query;
      
      // Verificar se o funcionário existe
      const funcionario = await FuncionarioModel.findById(funcionarioId);
      if (!funcionario) {
        throw new AppError(req.t('employees.error.notFound'), 404);
      }
      
      // Validar datas
      if (!dataInicio || !dataFim) {
        throw new AppError(req.t('payments.error.invalidDates'), 400);
      }
      
      // Calcular pagamento
      const result = await FuncionarioModel.calcularPagamento(funcionarioId, dataInicio, dataFim);
      
      return res.json({
        data: result
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Calcula o total a ser faturado para uma empresa em um período
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async calcularFaturaEmpresa(req, res, next) {
    try {
      const { empresaId } = req.params;
      const { dataInicio, dataFim } = req.query;
      
      // Verificar se a empresa existe
      const empresa = await EmpresaModel.findById(empresaId);
      if (!empresa) {
        throw new AppError(req.t('companies.error.notFound'), 404);
      }
      
      // Validar datas
      if (!dataInicio || !dataFim) {
        throw new AppError(req.t('payments.error.invalidDates'), 400);
      }
      
      // Calcular fatura
      const result = await EmpresaModel.calcularFatura(empresaId, dataInicio, dataFim);
      
      return res.json({
        data: result
      });
      
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PagamentoController();