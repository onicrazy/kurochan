const AlocacaoModel = require('../models/alocacaoModel');
const FuncionarioModel = require('../models/funcionarioModel');
const EmpresaModel = require('../models/empresaModel');
const TipoServicoModel = require('../models/tipoServicoModel');
const { AppError } = require('../middlewares/errorMiddleware');

/**
 * Controlador para gerenciar alocações de funcionários
 */
class AlocacaoController {
  /**
   * Lista todas as alocações
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async index(req, res, next) {
    try {
      // Parâmetros de filtragem e paginação
      const { 
        page = 1, 
        limit = 20, 
        sortBy = 'data_alocacao', 
        sortOrder = 'desc',
        dataInicio,
        dataFim,
        empresaId,
        funcionarioId,
        tipoServicoId,
        statusPagamentoFuncionario,
        statusPagamentoEmpresa
      } = req.query;
      
      // Filtros
      const filters = {};
      if (dataInicio) filters.dataInicio = dataInicio;
      if (dataFim) filters.dataFim = dataFim;
      if (empresaId) filters.empresaId = parseInt(empresaId, 10);
      if (funcionarioId) filters.funcionarioId = parseInt(funcionarioId, 10);
      if (tipoServicoId) filters.tipoServicoId = parseInt(tipoServicoId, 10);
      if (statusPagamentoFuncionario) filters.statusPagamentoFuncionario = statusPagamentoFuncionario;
      if (statusPagamentoEmpresa) filters.statusPagamentoEmpresa = statusPagamentoEmpresa;
      
      // Buscar alocações com paginação
      const { alocacoes, total } = await AlocacaoModel.findAll({
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sortBy,
        sortOrder,
        filters
      });
      
      return res.json({
        data: alocacoes,
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
   * Busca uma alocação pelo ID
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async show(req, res, next) {
    try {
      const { id } = req.params;
      
      // Buscar alocação
      const alocacao = await AlocacaoModel.findById(id);
      if (!alocacao) {
        throw new AppError(req.t('alocacoes.error.notFound'), 404);
      }
      
      return res.json({ data: alocacao });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Cria uma nova alocação
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async store(req, res, next) {
    try {
      const {
        empresa_id,
        funcionario_id,
        data_alocacao,
        tipo_periodo,
        valor_pago_funcionario,
        valor_cobrado_empresa,
        tipo_servico_id,
        local_servico,
        descricao_servico,
        observacoes
      } = req.body;
      
      // Verificar se a empresa existe
      const empresa = await EmpresaModel.findById(empresa_id);
      if (!empresa) {
        throw new AppError(req.t('alocacoes.error.empresaNotFound'), 404);
      }
      
      // Verificar se a empresa está ativa
      if (!empresa.ativa) {
        throw new AppError(req.t('alocacoes.error.empresaInactive'), 400);
      }
      
      // Verificar se o funcionário existe
      const funcionario = await FuncionarioModel.findById(funcionario_id);
      if (!funcionario) {
        throw new AppError(req.t('alocacoes.error.funcionarioNotFound'), 404);
      }
      
      // Verificar se o funcionário está ativo
      if (!funcionario.ativo) {
        throw new AppError(req.t('alocacoes.error.funcionarioInactive'), 400);
      }
      
      // Verificar se o tipo de serviço existe
      if (tipo_servico_id) {
        const tipoServico = await TipoServicoModel.findById(tipo_servico_id);
        if (!tipoServico) {
          throw new AppError(req.t('alocacoes.error.tipoServicoNotFound'), 404);
        }
        
        // Verificar se o tipo de serviço está ativo
        if (!tipoServico.ativo) {
          throw new AppError(req.t('alocacoes.error.tipoServicoInactive'), 400);
        }
      }
      
      // Validar valor pago ao funcionário
      if (!valor_pago_funcionario || valor_pago_funcionario <= 0) {
        throw new AppError(req.t('alocacoes.error.invalidValorPagoFuncionario'), 400);
      }
      
      // Validar valor cobrado da empresa
      if (!valor_cobrado_empresa || valor_cobrado_empresa <= 0) {
        throw new AppError(req.t('alocacoes.error.invalidValorCobradoEmpresa'), 400);
      }
      
      // Verificar se já existe uma alocação para este funcionário nesta data
      const existingAlocacao = await AlocacaoModel.findByFuncionarioData(funcionario_id, data_alocacao);
      if (existingAlocacao) {
        throw new AppError(req.t('alocacoes.error.funcionarioAlreadyAllocated'), 409);
      }
      
      // Criar alocação
      const alocacao = await AlocacaoModel.create({
        empresa_id,
        funcionario_id,
        data_alocacao,
        tipo_periodo: tipo_periodo || 'integral',
        valor_pago_funcionario,
        valor_cobrado_empresa,
        tipo_servico_id,
        local_servico,
        descricao_servico,
        status_pagamento_funcionario: 'pendente',
        status_pagamento_empresa: 'pendente',
        observacoes
      });
      
      return res.status(201).json({
        message: req.t('alocacoes.createdSuccessfully'),
        data: alocacao
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Atualiza uma alocação
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const {
        empresa_id,
        funcionario_id,
        data_alocacao,
        tipo_periodo,
        valor_pago_funcionario,
        valor_cobrado_empresa,
        tipo_servico_id,
        local_servico,
        descricao_servico,
        status_pagamento_funcionario,
        status_pagamento_empresa,
        observacoes
      } = req.body;
      
      // Verificar se a alocação existe
      const existingAlocacao = await AlocacaoModel.findById(id);
      if (!existingAlocacao) {
        throw new AppError(req.t('alocacoes.error.notFound'), 404);
      }
      
      // Se estiver alterando a empresa, verificar se a nova empresa existe e está ativa
      if (empresa_id && empresa_id !== existingAlocacao.empresa_id) {
        const empresa = await EmpresaModel.findById(empresa_id);
        if (!empresa) {
          throw new AppError(req.t('alocacoes.error.empresaNotFound'), 404);
        }
        
        if (!empresa.ativa) {
          throw new AppError(req.t('alocacoes.error.empresaInactive'), 400);
        }
      }
      
      // Se estiver alterando o funcionário, verificar se o novo funcionário existe e está ativo
      if (funcionario_id && funcionario_id !== existingAlocacao.funcionario_id) {
        const funcionario = await FuncionarioModel.findById(funcionario_id);
        if (!funcionario) {
          throw new AppError(req.t('alocacoes.error.funcionarioNotFound'), 404);
        }
        
        if (!funcionario.ativo) {
          throw new AppError(req.t('alocacoes.error.funcionarioInactive'), 400);
        }
      }
      
      // Se estiver alterando o tipo de serviço, verificar se o novo tipo existe e está ativo
      if (tipo_servico_id && tipo_servico_id !== existingAlocacao.tipo_servico_id) {
        const tipoServico = await TipoServicoModel.findById(tipo_servico_id);
        if (!tipoServico) {
          throw new AppError(req.t('alocacoes.error.tipoServicoNotFound'), 404);
        }
        
        if (!tipoServico.ativo) {
          throw new AppError(req.t('alocacoes.error.tipoServicoInactive'), 400);
        }
      }
      
      // Se estiver alterando o funcionário ou a data, verificar se não há conflito
      if ((funcionario_id && funcionario_id !== existingAlocacao.funcionario_id) || 
          (data_alocacao && data_alocacao !== existingAlocacao.data_alocacao)) {
        const targetFuncionarioId = funcionario_id || existingAlocacao.funcionario_id;
        const targetData = data_alocacao || existingAlocacao.data_alocacao;
        
        const conflictingAlocacao = await AlocacaoModel.findByFuncionarioData(
          targetFuncionarioId, 
          targetData,
          id // Excluir a própria alocação da verificação
        );
        
        if (conflictingAlocacao) {
          throw new AppError(req.t('alocacoes.error.funcionarioAlreadyAllocated'), 409);
        }
      }
      
      // Atualizar alocação
      const alocacao = await AlocacaoModel.update(id, {
        empresa_id,
        funcionario_id,
        data_alocacao,
        tipo_periodo,
        valor_pago_funcionario,
        valor_cobrado_empresa,
        tipo_servico_id,
        local_servico,
        descricao_servico,
        status_pagamento_funcionario,
        status_pagamento_empresa,
        observacoes
      });
      
      return res.json({
        message: req.t('alocacoes.updatedSuccessfully'),
        data: alocacao
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Remove uma alocação
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async destroy(req, res, next) {
    try {
      const { id } = req.params;
      
      // Verificar se a alocação existe
      const existingAlocacao = await AlocacaoModel.findById(id);
      if (!existingAlocacao) {
        throw new AppError(req.t('alocacoes.error.notFound'), 404);
      }
      
      // Verificar se a alocação já está associada a um pagamento
      const isAssociatedWithPayment = await AlocacaoModel.isAssociatedWithPayment(id);
      if (isAssociatedWithPayment) {
        throw new AppError(req.t('alocacoes.error.associatedWithPayment'), 400);
      }
      
      // Remover alocação
      await AlocacaoModel.delete(id);
      
      return res.json({
        message: req.t('alocacoes.deletedSuccessfully')
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Busca alocações por período para visualização em calendário
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async getCalendar(req, res, next) {
    try {
      const { ano, mes } = req.params;
      
      // Validar ano e mês
      const parsedAno = parseInt(ano, 10);
      const parsedMes = parseInt(mes, 10);
      
      if (isNaN(parsedAno) || parsedAno < 2000 || parsedAno > 2100) {
        throw new AppError(req.t('alocacoes.error.invalidYear'), 400);
      }
      
      if (isNaN(parsedMes) || parsedMes < 1 || parsedMes > 12) {
        throw new AppError(req.t('alocacoes.error.invalidMonth'), 400);
      }
      
      // Buscar alocações do mês para o calendário
      const alocacoes = await AlocacaoModel.getCalendarData(parsedAno, parsedMes);
      
      return res.json({
        data: alocacoes,
        meta: {
          ano: parsedAno,
          mes: parsedMes
        }
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Atualiza o status de pagamento do funcionário para uma alocação
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async updateStatusPagamentoFuncionario(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      // Verificar se a alocação existe
      const existingAlocacao = await AlocacaoModel.findById(id);
      if (!existingAlocacao) {
        throw new AppError(req.t('alocacoes.error.notFound'), 404);
      }
      
      // Validar status
      const statusesValidos = ['pendente', 'pago'];
      if (!statusesValidos.includes(status)) {
        throw new AppError(req.t('alocacoes.error.invalidStatus'), 400);
      }
      
      // Atualizar status de pagamento
      await AlocacaoModel.updateStatusPagamentoFuncionario(id, status);
      
      return res.json({
        message: req.t('alocacoes.statusUpdatedSuccessfully')
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Atualiza o status de pagamento da empresa para uma alocação
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async updateStatusPagamentoEmpresa(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      // Verificar se a alocação existe
      const existingAlocacao = await AlocacaoModel.findById(id);
      if (!existingAlocacao) {
        throw new AppError(req.t('alocacoes.error.notFound'), 404);
      }
      
      // Validar status
      const statusesValidos = ['pendente', 'pago'];
      if (!statusesValidos.includes(status)) {
        throw new AppError(req.t('alocacoes.error.invalidStatus'), 400);
      }
      
      // Atualizar status de pagamento
      await AlocacaoModel.updateStatusPagamentoEmpresa(id, status);
      
      return res.json({
        message: req.t('alocacoes.statusUpdatedSuccessfully')
      });
      
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AlocacaoController();