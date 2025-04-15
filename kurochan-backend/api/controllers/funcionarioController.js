const FuncionarioModel = require('../models/funcionarioModel');
const { AppError } = require('../middlewares/errorMiddleware');

/**
 * Controlador para gerenciar funcionários
 */
class FuncionarioController {
  /**
   * Lista todos os funcionários
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
        sortBy = 'nome', 
        sortOrder = 'asc',
        nome,
        cargo,
        ativo
      } = req.query;
      
      // Filtros
      const filters = {};
      if (nome) filters.nome = nome;
      if (cargo) filters.cargo = cargo;
      if (ativo !== undefined) filters.ativo = ativo === 'true';
      
      // Buscar funcionários com paginação
      const { funcionarios, total } = await FuncionarioModel.findAll({
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sortBy,
        sortOrder,
        filters
      });
      
      return res.json({
        data: funcionarios,
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
   * Busca um funcionário pelo ID
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async show(req, res, next) {
    try {
      const { id } = req.params;
      
      // Buscar funcionário
      const funcionario = await FuncionarioModel.findById(id);
      if (!funcionario) {
        throw new AppError(req.t('funcionarios.error.notFound'), 404);
      }
      
      return res.json({ data: funcionario });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Cria um novo funcionário
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async store(req, res, next) {
    try {
      const {
        nome,
        nome_japones,
        endereco,
        telefone,
        cargo,
        valor_diaria,
        valor_meio_periodo,
        data_admissao,
        documento,
        observacoes
      } = req.body;
      
      // Validar dados específicos se necessário
      if (valor_diaria <= 0) {
        throw new AppError(req.t('funcionarios.error.invalidDailyRate'), 400);
      }
      
      // Criar funcionário
      const funcionario = await FuncionarioModel.create({
        nome,
        nome_japones,
        endereco,
        telefone,
        cargo,
        valor_diaria,
        valor_meio_periodo,
        data_admissao,
        documento,
        observacoes,
        ativo: true
      });
      
      return res.status(201).json({
        message: req.t('funcionarios.createdSuccessfully'),
        data: funcionario
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Atualiza um funcionário
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const {
        nome,
        nome_japones,
        endereco,
        telefone,
        cargo,
        valor_diaria,
        valor_meio_periodo,
        data_admissao,
        documento,
        observacoes,
        ativo
      } = req.body;
      
      // Verificar se o funcionário existe
      const existingFuncionario = await FuncionarioModel.findById(id);
      if (!existingFuncionario) {
        throw new AppError(req.t('funcionarios.error.notFound'), 404);
      }
      
      // Validar dados específicos se necessário
      if (valor_diaria && valor_diaria <= 0) {
        throw new AppError(req.t('funcionarios.error.invalidDailyRate'), 400);
      }
      
      // Atualizar funcionário
      const funcionario = await FuncionarioModel.update(id, {
        nome,
        nome_japones,
        endereco,
        telefone,
        cargo,
        valor_diaria,
        valor_meio_periodo,
        data_admissao,
        documento,
        observacoes,
        ativo
      });
      
      return res.json({
        message: req.t('funcionarios.updatedSuccessfully'),
        data: funcionario
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Remove um funcionário (soft delete - marca como inativo)
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async destroy(req, res, next) {
    try {
      const { id } = req.params;
      
      // Verificar se o funcionário existe
      const existingFuncionario = await FuncionarioModel.findById(id);
      if (!existingFuncionario) {
        throw new AppError(req.t('funcionarios.error.notFound'), 404);
      }
      
      // Verificar se o funcionário já está inativo
      if (!existingFuncionario.ativo) {
        throw new AppError(req.t('funcionarios.error.alreadyInactive'), 400);
      }
      
      // Marcar funcionário como inativo (soft delete)
      await FuncionarioModel.update(id, { ativo: false });
      
      return res.json({
        message: req.t('funcionarios.deletedSuccessfully')
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Busca o histórico de alocações do funcionário
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async getAlocacoes(req, res, next) {
    try {
      const { id } = req.params;
      const { 
        dataInicio, 
        dataFim, 
        page = 1, 
        limit = 20 
      } = req.query;
      
      // Verificar se o funcionário existe
      const existingFuncionario = await FuncionarioModel.findById(id);
      if (!existingFuncionario) {
        throw new AppError(req.t('funcionarios.error.notFound'), 404);
      }
      
      // Buscar alocações do funcionário
      const { alocacoes, total } = await FuncionarioModel.getAlocacoes(id, {
        dataInicio,
        dataFim,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
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
   * Busca o histórico de pagamentos do funcionário
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async getPagamentos(req, res, next) {
    try {
      const { id } = req.params;
      const { 
        dataInicio, 
        dataFim, 
        page = 1, 
        limit = 20 
      } = req.query;
      
      // Verificar se o funcionário existe
      const existingFuncionario = await FuncionarioModel.findById(id);
      if (!existingFuncionario) {
        throw new AppError(req.t('funcionarios.error.notFound'), 404);
      }
      
      // Buscar pagamentos do funcionário
      const { pagamentos, total } = await FuncionarioModel.getPagamentos(id, {
        dataInicio,
        dataFim,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
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
}

module.exports = new FuncionarioController();