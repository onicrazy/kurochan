const Joi = require('joi');

/**
 * Validações para operações relacionadas a funcionários
 */
class FuncionarioValidator {
  /**
   * Validação para criação de funcionário
   * @param {Object} data - Dados a serem validados
   * @param {Object} i18n - Objeto de internacionalização
   * @returns {Object} Resultado da validação
   */
  validateCreate(data, i18n) {
    const schema = Joi.object({
      nome: Joi.string().min(2).max(100).required()
        .messages({
          'string.base': i18n.t('validation.string'),
          'string.min': i18n.t('validation.minLength', { count: 2 }),
          'string.max': i18n.t('validation.maxLength', { count: 100 }),
          'any.required': i18n.t('validation.required')
        }),
        
      nome_japones: Joi.string().max(100).allow('', null)
        .messages({
          'string.base': i18n.t('validation.string'),
          'string.max': i18n.t('validation.maxLength', { count: 100 })
        }),
        
      endereco: Joi.string().max(255).allow('', null)
        .messages({
          'string.base': i18n.t('validation.string'),
          'string.max': i18n.t('validation.maxLength', { count: 255 })
        }),
        
      telefone: Joi.string().max(20).allow('', null)
        .messages({
          'string.base': i18n.t('validation.string'),
          'string.max': i18n.t('validation.maxLength', { count: 20 })
        }),
        
      cargo: Joi.string().min(2).max(30).required()
        .messages({
          'string.base': i18n.t('validation.string'),
          'string.min': i18n.t('validation.minLength', { count: 2 }),
          'string.max': i18n.t('validation.maxLength', { count: 30 }),
          'any.required': i18n.t('validation.required')
        }),
        
      valor_diaria: Joi.number().positive().required()
        .messages({
          'number.base': i18n.t('validation.number'),
          'number.positive': i18n.t('validation.positive'),
          'any.required': i18n.t('validation.required')
        }),
        
      valor_meio_periodo: Joi.number().positive().allow(null)
        .messages({
          'number.base': i18n.t('validation.number'),
          'number.positive': i18n.t('validation.positive')
        }),
        
      data_admissao: Joi.date().iso().allow(null)
        .messages({
          'date.base': i18n.t('validation.date'),
          'date.format': i18n.t('validation.dateFormat')
        }),
        
      documento: Joi.string().max(30).allow('', null)
        .messages({
          'string.base': i18n.t('validation.string'),
          'string.max': i18n.t('validation.maxLength', { count: 30 })
        }),
        
      observacoes: Joi.string().max(1000).allow('', null)
        .messages({
          'string.base': i18n.t('validation.string'),
          'string.max': i18n.t('validation.maxLength', { count: 1000 })
        })
    });
    
    return schema.validate(data, { abortEarly: false });
  }
  
  /**
   * Validação para atualização de funcionário
   * @param {Object} data - Dados a serem validados
   * @param {Object} i18n - Objeto de internacionalização
   * @returns {Object} Resultado da validação
   */
  validateUpdate(data, i18n) {
    const schema = Joi.object({
      nome: Joi.string().min(2).max(100)
        .messages({
          'string.base': i18n.t('validation.string'),
          'string.min': i18n.t('validation.minLength', { count: 2 }),
          'string.max': i18n.t('validation.maxLength', { count: 100 })
        }),
        
      nome_japones: Joi.string().max(100).allow('', null)
        .messages({
          'string.base': i18n.t('validation.string'),
          'string.max': i18n.t('validation.maxLength', { count: 100 })
        }),
        
      endereco: Joi.string().max(255).allow('', null)
        .messages({
          'string.base': i18n.t('validation.string'),
          'string.max': i18n.t('validation.maxLength', { count: 255 })
        }),
        
      telefone: Joi.string().max(20).allow('', null)
        .messages({
          'string.base': i18n.t('validation.string'),
          'string.max': i18n.t('validation.maxLength', { count: 20 })
        }),
        
      cargo: Joi.string().min(2).max(30)
        .messages({
          'string.base': i18n.t('validation.string'),
          'string.min': i18n.t('validation.minLength', { count: 2 }),
          'string.max': i18n.t('validation.maxLength', { count: 30 })
        }),
        
      valor_diaria: Joi.number().positive()
        .messages({
          'number.base': i18n.t('validation.number'),
          'number.positive': i18n.t('validation.positive')
        }),
        
      valor_meio_periodo: Joi.number().positive().allow(null)
        .messages({
          'number.base': i18n.t('validation.number'),
          'number.positive': i18n.t('validation.positive')
        }),
        
      data_admissao: Joi.date().iso().allow(null)
        .messages({
          'date.base': i18n.t('validation.date'),
          'date.format': i18n.t('validation.dateFormat')
        }),
        
      documento: Joi.string().max(30).allow('', null)
        .messages({
          'string.base': i18n.t('validation.string'),
          'string.max': i18n.t('validation.maxLength', { count: 30 })
        }),
        
      ativo: Joi.boolean()
        .messages({
          'boolean.base': i18n.t('validation.boolean')
        }),
        
      observacoes: Joi.string().max(1000).allow('', null)
        .messages({
          'string.base': i18n.t('validation.string'),
          'string.max': i18n.t('validation.maxLength', { count: 1000 })
        })
    });
    
    return schema.validate(data, { abortEarly: false });
  }
  
  /**
   * Validação para filtros de busca de funcionários
   * @param {Object} data - Dados a serem validados
   * @param {Object} i18n - Objeto de internacionalização
   * @returns {Object} Resultado da validação
   */
  validateFilters(data, i18n) {
    const schema = Joi.object({
      page: Joi.number().integer().min(1)
        .messages({
          'number.base': i18n.t('validation.number'),
          'number.integer': i18n.t('validation.integer'),
          'number.min': i18n.t('validation.min', { count: 1 })
        }),
        
      limit: Joi.number().integer().min(1).max(100)
        .messages({
          'number.base': i18n.t('validation.number'),
          'number.integer': i18n.t('validation.integer'),
          'number.min': i18n.t('validation.min', { count: 1 }),
          'number.max': i18n.t('validation.max', { count: 100 })
        }),
        
      sortBy: Joi.string().valid('nome', 'cargo', 'valor_diaria', 'data_admissao')
        .messages({
          'string.base': i18n.t('validation.string'),
          'any.only': i18n.t('validation.validValues', { values: 'nome, cargo, valor_diaria, data_admissao' })
        }),
        
      sortOrder: Joi.string().valid('asc', 'desc')
        .messages({
          'string.base': i18n.t('validation.string'),
          'any.only': i18n.t('validation.validValues', { values: 'asc, desc' })
        }),
        
      nome: Joi.string()
        .messages({
          'string.base': i18n.t('validation.string')
        }),
        
      cargo: Joi.string()
        .messages({
          'string.base': i18n.t('validation.string')
        }),
        
      ativo: Joi.boolean()
        .messages({
          'boolean.base': i18n.t('validation.boolean')
        })
    });
    
    return schema.validate(data, { abortEarly: false });
  }
}

module.exports = new FuncionarioValidator();