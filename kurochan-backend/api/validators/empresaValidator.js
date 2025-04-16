const Joi = require('joi');

/**
 * Validações para operações relacionadas a empresas
 */
class EmpresaValidator {
  /**
   * Validação para criação de empresa
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
        
      contato_nome: Joi.string().max(100).allow('', null)
        .messages({
          'string.base': i18n.t('validation.string'),
          'string.max': i18n.t('validation.maxLength', { count: 100 })
        }),
        
      contato_telefone: Joi.string().max(20).allow('', null)
        .messages({
          'string.base': i18n.t('validation.string'),
          'string.max': i18n.t('validation.maxLength', { count: 20 })
        }),
        
      contato_email: Joi.string().email().max(100).allow('', null)
        .messages({
          'string.base': i18n.t('validation.string'),
          'string.email': i18n.t('validation.invalidEmail'),
          'string.max': i18n.t('validation.maxLength', { count: 100 })
        }),
        
      valor_padrao_servico: Joi.number().positive().required()
        .messages({
          'number.base': i18n.t('validation.number'),
          'number.positive': i18n.t('validation.positive'),
          'any.required': i18n.t('validation.required')
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
   * Validação para atualização de empresa
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
        
      contato_nome: Joi.string().max(100).allow('', null)
        .messages({
          'string.base': i18n.t('validation.string'),
          'string.max': i18n.t('validation.maxLength', { count: 100 })
        }),
        
      contato_telefone: Joi.string().max(20).allow('', null)
        .messages({
          'string.base': i18n.t('validation.string'),
          'string.max': i18n.t('validation.maxLength', { count: 20 })
        }),
        
      contato_email: Joi.string().email().max(100).allow('', null)
        .messages({
          'string.base': i18n.t('validation.string'),
          'string.email': i18n.t('validation.invalidEmail'),
          'string.max': i18n.t('validation.maxLength', { count: 100 })
        }),
        
      valor_padrao_servico: Joi.number().positive()
        .messages({
          'number.base': i18n.t('validation.number'),
          'number.positive': i18n.t('validation.positive')
        }),
        
      ativa: Joi.boolean()
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
   * Validação para filtros de busca de empresas
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
        
      sortBy: Joi.string().valid('nome', 'valor_padrao_servico')
        .messages({
          'string.base': i18n.t('validation.string'),
          'any.only': i18n.t('validation.validValues', { values: 'nome, valor_padrao_servico' })
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
        
      ativa: Joi.boolean()
        .messages({
          'boolean.base': i18n.t('validation.boolean')
        })
    });
    
    return schema.validate(data, { abortEarly: false });
  }
}

module.exports = new EmpresaValidator();