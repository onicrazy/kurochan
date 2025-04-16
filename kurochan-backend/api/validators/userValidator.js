const Joi = require('joi');

/**
 * Validações para operações relacionadas a usuários
 */
class UserValidator {
  /**
   * Validação para criação de usuário
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
        
      email: Joi.string().email().max(100).required()
        .messages({
          'string.base': i18n.t('validation.string'),
          'string.email': i18n.t('validation.invalidEmail'),
          'string.max': i18n.t('validation.maxLength', { count: 100 }),
          'any.required': i18n.t('validation.required')
        }),
        
      senha: Joi.string().min(6).max(100).required()
        .messages({
          'string.base': i18n.t('validation.string'),
          'string.min': i18n.t('validation.minLength', { count: 6 }),
          'string.max': i18n.t('validation.maxLength', { count: 100 }),
          'any.required': i18n.t('validation.required')
        }),
        
      funcao: Joi.string().valid('administrador', 'gerente', 'operador').default('operador')
        .messages({
          'string.base': i18n.t('validation.string'),
          'any.only': i18n.t('validation.validValues', { values: 'administrador, gerente, operador' })
        }),
        
      idioma_preferido: Joi.string().valid('pt-BR', 'ja').default('pt-BR')
        .messages({
          'string.base': i18n.t('validation.string'),
          'any.only': i18n.t('validation.validValues', { values: 'pt-BR, ja' })
        })
    });
    
    return schema.validate(data, { abortEarly: false });
  }
  
  /**
   * Validação para atualização de usuário
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
        
      email: Joi.string().email().max(100)
        .messages({
          'string.base': i18n.t('validation.string'),
          'string.email': i18n.t('validation.invalidEmail'),
          'string.max': i18n.t('validation.maxLength', { count: 100 })
        }),
        
      funcao: Joi.string().valid('administrador', 'gerente', 'operador')
        .messages({
          'string.base': i18n.t('validation.string'),
          'any.only': i18n.t('validation.validValues', { values: 'administrador, gerente, operador' })
        }),
        
      idioma_preferido: Joi.string().valid('pt-BR', 'ja')
        .messages({
          'string.base': i18n.t('validation.string'),
          'any.only': i18n.t('validation.validValues', { values: 'pt-BR, ja' })
        }),
        
      ativo: Joi.boolean()
        .messages({
          'boolean.base': i18n.t('validation.boolean')
        })
    });
    
    return schema.validate(data, { abortEarly: false });
  }
  
  /**
   * Validação para alteração de senha
   * @param {Object} data - Dados a serem validados
   * @param {Object} i18n - Objeto de internacionalização
   * @returns {Object} Resultado da validação
   */
  validateChangePassword(data, i18n) {
    const schema = Joi.object({
      senhaAtual: Joi.string().required()
        .messages({
          'string.base': i18n.t('validation.string'),
          'any.required': i18n.t('validation.required')
        }),
        
      novaSenha: Joi.string().min(6).max(100).required()
        .messages({
          'string.base': i18n.t('validation.string'),
          'string.min': i18n.t('validation.minLength', { count: 6 }),
          'string.max': i18n.t('validation.maxLength', { count: 100 }),
          'any.required': i18n.t('validation.required')
        })
    });
    
    return schema.validate(data, { abortEarly: false });
  }
  
  /**
   * Validação para redefinição de senha
   * @param {Object} data - Dados a serem validados
   * @param {Object} i18n - Objeto de internacionalização
   * @returns {Object} Resultado da validação
   */
  validateResetPassword(data, i18n) {
    const schema = Joi.object({
      novaSenha: Joi.string().min(6).max(100).required()
        .messages({
          'string.base': i18n.t('validation.string'),
          'string.min': i18n.t('validation.minLength', { count: 6 }),
          'string.max': i18n.t('validation.maxLength', { count: 100 }),
          'any.required': i18n.t('validation.required')
        })
    });
    
    return schema.validate(data, { abortEarly: false });
  }
  
  /**
   * Validação para login
   * @param {Object} data - Dados a serem validados
   * @param {Object} i18n - Objeto de internacionalização
   * @returns {Object} Resultado da validação
   */
  validateLogin(data, i18n) {
    const schema = Joi.object({
      email: Joi.string().email().required()
        .messages({
          'string.base': i18n.t('validation.string'),
          'string.email': i18n.t('validation.invalidEmail'),
          'any.required': i18n.t('validation.required')
        }),
        
      senha: Joi.string().required()
        .messages({
          'string.base': i18n.t('validation.string'),
          'any.required': i18n.t('validation.required')
        })
    });
    
    return schema.validate(data, { abortEarly: false });
  }
  
  /**
   * Validação para filtros de busca de usuários
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
        
      sortBy: Joi.string().valid('nome', 'email', 'funcao')
        .messages({
          'string.base': i18n.t('validation.string'),
          'any.only': i18n.t('validation.validValues', { values: 'nome, email, funcao' })
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
        
      email: Joi.string()
        .messages({
          'string.base': i18n.t('validation.string')
        }),
        
      funcao: Joi.string().valid('administrador', 'gerente', 'operador')
        .messages({
          'string.base': i18n.t('validation.string'),
          'any.only': i18n.t('validation.validValues', { values: 'administrador, gerente, operador' })
        }),
        
      ativo: Joi.boolean()
        .messages({
          'boolean.base': i18n.t('validation.boolean')
        })
    });
    
    return schema.validate(data, { abortEarly: false });
  }
}

module.exports = new UserValidator();