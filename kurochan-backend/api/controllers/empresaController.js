const EmpresaModel = require('../models/empresaModel');
const { AppError } = require('../middlewares/errorMiddleware');

/**
 * Controlador para gerenciar empresas
 */
class EmpresaController {
  /**
   * Lista todas as empresas
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
        ativa
      } = req.query;
      
      // Filtros
      const filters = {};
      if (nome) filters.nome = nome;
      if (ativa !== undefined) filters.ativa = ativa === 'true';
      
      // Buscar empresas com paginação
      const { empresas, total } = await EmpresaModel.findAll({
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sortBy,
        sortOrder,
        filters
      });
      
      return res.json({
        data: empresas,
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
   * Busca uma empresa pelo ID
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async show(req, res, next) {
    try {
      const { id } = req.params;
      
      // Buscar empresa
      const empresa = await EmpresaModel.findById(id);
      if (!empresa) {
        throw new AppError(req.t('companies.error.notFound'), 404);
      }
      
      return res.json({ data: empresa });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Cria uma nova empresa
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
        contato_nome,
        contato_telefone,
        contato_email,
        valor_padrao_servico,
        observacoes
      } = req.body;
      
      // Validar dados específicos se necessário
      if (valor_padrao_servico <= 0) {
        throw new AppError(req.t('companies.error.invalidRate'), 400);
      }
      
      // Criar empresa
      const empresa = await EmpresaModel.create({
        nome,
        nome_japones,
        endereco,
        contato_nome,
        contato_telefone,
        contato_email,
        valor_padrao_servico,
        observacoes,
        ativa: true
      });
      
      return res.status(201).json({
        message: req.t('companies.success.created'),
        data: empresa
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Atualiza uma empresa
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
        contato_nome,
        contato_telefone,
        contato_email,
        valor_padrao_servico,
        observacoes,
        ativa
      } = req.body;
      
      // Verificar se a empresa existe
      const existingEmpresa = await EmpresaModel.findById(id);
      if (!existingEmpresa) {
        throw new AppError(req.t('companies.error.notFound'), 404);
      }
      
      // Validar dados específicos se necessário
      if (valor_padrao_servico && valor_padrao_servico <= 0) {
        throw new AppError(req.t('companies.error.invalidRate'), 400);
      }
      
      // Atualizar empresa
      const empresa = await EmpresaModel.update(id, {
        nome,
        nome_japones,
        endereco,
        contato_nome,
        contato_telefone,
        contato_email,
        valor_padrao_servico,
        observacoes,
        ativa
      });
      
      return res.json({
        message: req.t('companies.success.updated'),
        data: empresa
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Remove uma empresa (soft delete - marca como inativa)
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async destroy(req, res, next) {
    try {
      const { id } = req.params;
      
      // Verificar se a empresa existe
      const existingEmpresa = await EmpresaModel.findById(id);
      if (!existingEmpresa) {
        throw new AppError(req.t('companies.error.notFound'), 404);
      }
      
      // Verificar se a empresa já está inativa
      if (!existingEmpresa.ativa) {
        throw new AppError(req.t('companies.error.alreadyInactive'), 400);
      }
      
      // Marcar empresa como inativa (soft delete)
      await EmpresaModel.update(id, { ativa: false });
      
      return res.json({
        message: req.t('companies.success.deleted')
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Busca o histórico de alocações da empresa
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
      
      // Verificar se a empresa existe
      const existingEmpresa = await EmpresaModel.findById(id);
      if (!existingEmpresa) {
        throw new AppError(req.t('companies.error.notFound'), 404);
      }
      
      // Buscar alocações da empresa
      const { alocacoes, total } = await EmpresaModel.getAlocacoes(id, {
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
   * Busca o histórico de faturas da empresa
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async getFaturas(req, res, next) {
    try {
      const { id } = req.params;
      const { 
        dataInicio, 
        dataFim, 
        status,
        page = 1, 
        limit = 20 
      } = req.query;
      
      // Verificar se a empresa existe
      const existingEmpresa = await EmpresaModel.findById(id);
      if (!existingEmpresa) {
        throw new AppError(req.t('companies.error.notFound'), 404);
      }
      
      // Buscar faturas da empresa
      const { faturas, total } = await EmpresaModel.getFaturas(id, {
        dataInicio,
        dataFim,
        status,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
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
   * Calcula o total a ser faturado para a empresa em um período
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async calcularFatura(req, res, next) {
    try {
      const { id } = req.params;
      const { dataInicio, dataFim } = req.query;
      
      // Verificar se a empresa existe
      const existingEmpresa = await EmpresaModel.findById(id);
      if (!existingEmpresa) {
        throw new AppError(req.t('companies.error.notFound'), 404);
      }
      
      // Validar datas
      if (!dataInicio || !dataFim) {
        throw new AppError(req.t('payments.error.invalidDates'), 400);
      }
      
      // Calcular fatura
      const result = await EmpresaModel.calcularFatura(id, dataInicio, dataFim);
      
      return res.json({
        data: result
      });
      
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EmpresaController();