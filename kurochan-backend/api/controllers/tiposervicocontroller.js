const TipoServicoModel = require('../models/tipoServicoModel');
const { AppError } = require('../middlewares/errorMiddleware');

/**
 * Controlador para gerenciar tipos de serviço
 */
class TipoServicoController {
  /**
   * Lista todos os tipos de serviço
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
        ativo
      } = req.query;
      
      // Filtros
      const filters = {};
      if (nome) filters.nome = nome;
      if (ativo !== undefined) filters.ativo = ativo === 'true';
      
      // Buscar tipos de serviço com paginação
      const { tiposServico, total } = await TipoServicoModel.findAll({
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sortBy,
        sortOrder,
        filters
      });
      
      return res.json({
        data: tiposServico,
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
   * Busca um tipo de serviço pelo ID
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async show(req, res, next) {
    try {
      const { id } = req.params;
      
      // Buscar tipo de serviço
      const tipoServico = await TipoServicoModel.findById(id);
      if (!tipoServico) {
        throw new AppError(req.t('servicetype.error.notFound'), 404);
      }
      
      return res.json({ data: tipoServico });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Cria um novo tipo de serviço
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async store(req, res, next) {
    try {
      const {
        nome,
        nome_japones,
        descricao
      } = req.body;
      
      // Verificar campos obrigatórios
      if (!nome) {
        throw new AppError(req.t('validation.required'), 400);
      }
      
      // Criar tipo de serviço
      const tipoServico = await TipoServicoModel.create({
        nome,
        nome_japones,
        descricao,
        ativo: true
      });
      
      return res.status(201).json({
        message: req.t('servicetype.success.created'),
        data: tipoServico
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Atualiza um tipo de serviço
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
        descricao,
        ativo
      } = req.body;
      
      // Verificar se o tipo de serviço existe
      const existingTipoServico = await TipoServicoModel.findById(id);
      if (!existingTipoServico) {
        throw new AppError(req.t('servicetype.error.notFound'), 404);
      }
      
      // Atualizar tipo de serviço
      const tipoServico = await TipoServicoModel.update(id, {
        nome,
        nome_japones,
        descricao,
        ativo
      });
      
      return res.json({
        message: req.t('servicetype.success.updated'),
        data: tipoServico
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Remove um tipo de serviço (soft delete - marca como inativo)
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async destroy(req, res, next) {
    try {
      const { id } = req.params;
      
      // Verificar se o tipo de serviço existe
      const existingTipoServico = await TipoServicoModel.findById(id);
      if (!existingTipoServico) {
        throw new AppError(req.t('servicetype.error.notFound'), 404);
      }
      
      // Verificar se o tipo de serviço já está inativo
      if (!existingTipoServico.ativo) {
        throw new AppError(req.t('servicetype.error.alreadyInactive'), 400);
      }
      
      // Verificar se o tipo de serviço está sendo utilizado
      const isBeingUsed = await TipoServicoModel.isBeingUsed(id);
      if (isBeingUsed) {
        throw new AppError(req.t('servicetype.error.beingUsed'), 400);
      }
      
      // Marcar tipo de serviço como inativo (soft delete)
      await TipoServicoModel.delete(id);
      
      return res.json({
        message: req.t('servicetype.success.deleted')
      });
      
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TipoServicoController();