const { ValidationError } = require('joi');

/**
 * Middleware para tratamento centralizado de erros
 * @param {Error} err - Objeto de erro
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 * @param {Function} next - Função next do Express
 */
const errorMiddleware = (err, req, res, next) => {
  console.error(`[ERROR] ${err.name}: ${err.message}`);
  
  // Verificar o tipo de erro e responder adequadamente
  
  // Erros de validação (Joi)
  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: req.t('error.validation'),
      message: err.message,
      details: err.details.map(detail => ({
        message: detail.message,
        path: detail.path,
        type: detail.type
      }))
    });
  }
  
  // Erros de banco de dados
  if (err.code && (err.code.startsWith('23') || err.code.startsWith('42'))) {
    // Códigos PostgreSQL que começam com 23 (violação de integridade) ou 42 (erro de sintaxe)
    
    if (err.code === '23505') { // Unique violation
      return res.status(409).json({
        error: req.t('error.uniqueViolation'),
        message: req.t('error.duplicateEntry'),
        details: err.detail
      });
    }
    
    if (err.code === '23503') { // Foreign key violation
      return res.status(409).json({
        error: req.t('error.foreignKeyViolation'),
        message: req.t('error.referencedRecordNotFound'),
        details: err.detail
      });
    }
    
    return res.status(400).json({
      error: req.t('error.databaseError'),
      message: req.t('error.invalidDataStructure'),
      details: process.env.NODE_ENV === 'development' ? err.detail : undefined
    });
  }
  
  // Erros HTTP personalizados
  if (err.statusCode && err.message) {
    return res.status(err.statusCode).json({
      error: err.name || req.t('error.applicationError'),
      message: err.message
    });
  }
  
  // Se o app está em desenvolvimento, enviamos detalhes do erro
  if (process.env.NODE_ENV === 'development') {
    return res.status(500).json({
      error: 'InternalServerError',
      message: err.message,
      stack: err.stack
    });
  }
  
  // Caso contrário, enviamos uma mensagem genérica
  return res.status(500).json({
    error: req.t('error.internalServerError'),
    message: req.t('error.somethingWentWrong')
  });
};

// Classe personalizada para erros de aplicação
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  errorMiddleware,
  AppError
};