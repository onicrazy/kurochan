const Joi = require('joi');

/**
 * Validações para operações relacionadas a alocações
 */
class AlocacaoValidator {
  /**
   * Validação para criação de alocação
   * @param {Object} data - Dados a serem validados
   * @param {Object} i18n - Objeto de internacionalização
   * @returns {Object} Resultado da validação
   */
  validateCreate(data, i18n) {
    const schema = Joi.object({
      empresa_id: Joi.number().integer().positive().required()
        .messages({
          'number.base': i18n.t('validation.number'),
          'number.integer': i18n.t('validation.integer'),
          'number.positive': i18n.t('validation.positive'),
          'any.required': i18n.t('validation.required')
        }),
        
      funcionario_id: Joi.number().integer().positive().required()
        .messages({
          'number.base': i18n.t('validation.number'),
          'number.integer': i18n.t('validation.integer'),
          'number.positive': i18n.t('validation.positive'),
          'any.required': i18n.t('validation.required')
        }),
        
      data_alocacao: Joi.date().iso().required()
        .messages({
          'date.base': i18n.t('validation.date'),
          'date.format': i18n.t('validation.dateFormat'),
          'any.required': i18n.t('validation.required')
        }),
        
      tipo_periodo: Joi.string().valid('integral', 'meio').default('integral')
        .messages({
          'string.base': i18n.t('validation.string'),
          'any.only': i18n.t('validation.validValues', { values: 'integral, meio' })
        }),
        
      valor_pago_funcionario: Joi.number().positive().required()
        .messages({
          'number.base': i18n.t('validation.number'),
          'number.positive': i18n.t('validation.positive'),
          'any.required': i18n.t('validation.required')
        }),
        
      valor_cobrado_empresa: Joi.number().positive().required()
        .messages({
          'number.base': i18n.t('validation.number'),
          'number.positive': i18n.t('validation.positive'),
          'any.required': i18n.t('validation.required')
        }),
        
      tipo_servico_id: Joi.number().integer().positive().allow(null)
        .messages({
          'number.base': i18n.t('validation.number'),
          'number.integer': i18n.t('validation.integer'),
          'number.positive': i18n.t('validation.positive')
        }),
        
      local_servico: Joi.string().max(255).allow('', null)
        .messages({
          'string.base': i18n.t('validation.string'),
          'string.max': i18n.t('validation.maxLength', { count: 255 })
        }),
        
      descricao_servico: Joi.string().max(255).allow('', null)
        .messages({
          'string.base': i18n.t('validation.string'),
          'string.max': i18n.t('validation.maxLength', { count: 255 })
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
   * Validação para atualização de alocação
   * @param {Object} data - Dados a serem validados
   * @param {Object} i18n - Objeto de internacionalização
   * @returns {Object} Resultado da validação
   */
  validateUpdate(data, i18n) {
    const schema = Joi.object({
      empresa_id: Joi.number().integer().positive()
        .messages({
          'number.base': i18n.t('validation.number'),
          'number.integer': i18n.t('validation.integer'),
          'number.positive': i18n.t('validation.positive')
        }),
        
      funcionario_id: Joi.number().integer().positive()
        .messages({
          'number.base': i18n.t('validation.number'),
          'number.integer': i18n.t('validation.integer'),
          'number.positive': i18n.t('validation.positive')
        }),
        
      data_alocacao: Joi.date().iso()
        .messages({
          'date.base': i18n.t('validation.date'),
          'date.format': i18n.t('validation.dateFormat')
        }),
        
      tipo_periodo: Joi.string().valid('integral', 'meio')
        .messages({
          'string.base': i18n.t('validation.string'),
          'any.only': i18n.t('validation.validValues', { values: 'integral, meio' })
        }),
        
      valor_pago_funcionario: Joi.number().positive()
        .messages({
          'number.base': i18n.t('validation.number'),
          'number.positive': i18n.t('validation.positive')
        }),
        
      valor_cobrado_empresa: Joi.number().positive()
        .messages({
          'number.base': i18n.t('validation.number'),
          'number.positive': i18n.t('validation.positive')
        }),
        
      tipo_servico_id: Joi.number().integer().positive().allow(null)
        .messages({
          'number.base': i18n.t('validation.number'),
          'number.integer': i18n.t('validation.integer'),
          'number.positive': i18n.t('validation.positive')
        }),
        
      local_servico: Joi.string().max(255).allow('', null)
        .messages({
          'string.base': i18n.t('validation.string'),
          'string.max': i18n.t('validation.maxLength', { count: 255 })
        }),
        
      descricao_servico: Joi.string().max(255).allow('', null)
        .messages({
          'string.base': i18n.t('validation.string'),
          'string.max': i18n.t('validation.maxLength', { count: 255 })
        }),
        
      status_pagamento_funcionario: Joi.string().valid('pendente', 'pago')
        .messages({
          'string.base': i18n.t('validation.string'),
          'any.only': i18n.t('validation.validValues', { values: 'pendente, pago' })
        }),
        
      status_pagamento_empresa: Joi.string().valid('pendente', 'pago')
        .messages({
          'string.base': i18n.t('validation.string'),
          'any.only': i18n.t('validation.validValues', { values: 'pendente, pago' })
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
   * Validação para filtros de busca de alocações
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
        
      sortBy: Joi.string().valid('data_alocacao', 'valor_pago_funcionario', 'valor_cobrado_empresa')
        .messages({
          'string.base': i18n.t('validation.string'),
          'any.only': i18n.t('validation.validValues', { values: 'data_alocacao, valor_pago_funcionario, valor_cobrado_empresa' })
        }),
        
      sortOrder: Joi.string().valid('asc', 'desc')
        .messages({
          'string.base': i18n.t('validation.string'),
          'any.only': i18n.t('validation.validValues', { values: 'asc, desc' })
        }),
        
      dataInicio: Joi.date().iso()
        .messages({
          'date.base': i18n.t('validation.date'),
          'date.format': i18n.t('validation.dateFormat')
        }),
        
      dataFim: Joi.date().iso()
        .messages({
          'date.base': i18n.t('validation.date'),
          'date.format': i18n.t('validation.dateFormat')
        }),
        
      empresaId: Joi.number().integer().positive()
        .messages({
          'number.base': i18n.t('validation.number'),
          'number.integer': i18n.t('validation.integer'),
          'number.positive': i18n.t('validation.positive')
        }),
        
      funcionarioId: Joi.number().integer().positive()
        .messages({
          'number.base': i18n.t('validation.number'),
          'number.integer': i18n.t('validation.integer'),
          'number.positive': i18n.t('validation.positive')
        }),
        
      tipoServicoId: Joi.number().integer().positive()
        .messages({
          'number.base': i18n.t('validation.number'),
          'number.integer': i18n.t('validation.integer'),
          'number.positive': i18n.t('validation.positive')
        }),
        
      statusPagamentoFuncionario: Joi.string().valid('pendente', 'pago')
        .messages({
          'string.base': i18n.t('validation.string'),
          'any.only': i18n.t('validation.validValues', { values: 'pendente, pago' })
        }),
        
      statusPagamentoEmpresa: Joi.string().valid('pendente', 'pago')
        .messages({
          'string.base': i18n.t('validation.string'),
          'any.only': i18n.t('validation.validValues', { values: 'pendente, pago' })
        })
    });
    
    return schema.validate(data, { abortEarly: false });
  }
}

module.exports = new AlocacaoValidator();