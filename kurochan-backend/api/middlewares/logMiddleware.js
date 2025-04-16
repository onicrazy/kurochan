// api/middlewares/logMiddleware.js
const winston = require('winston');
const fs = require('fs');
const path = require('path');

// Configuração do logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'kurochan-api' },
  transports: [
    // Log para console em todos os ambientes
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          info => `${info.timestamp} ${info.level}: ${info.message} ${info.stack || ''}`
        )
      )
    })
  ]
});

// Verifica se o diretório de logs existe, caso contrário, cria
const logDir = process.env.LOG_DIR || 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Adiciona log em arquivo em ambiente de produção
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.File({ 
    filename: path.join(logDir, 'error.log'), 
    level: 'error' 
  }));
  logger.add(new winston.transports.File({ 
    filename: path.join(logDir, 'combined.log') 
  }));
}

/**
 * Middleware para registrar logs de requisições
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 * @param {Function} next - Função next do Express
 */
const logRequestMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Registrar informações da requisição
  const requestInfo = {
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  };
  
  logger.info(`Request started: ${req.method} ${req.originalUrl}`, requestInfo);
  
  // Capturar o final da requisição para registrar resposta
  res.on('finish', () => {
    const duration = Date.now() - start;
    const responseInfo = {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ...requestInfo
    };
    
    // Registrar nível de log apropriado de acordo com o status da resposta
    if (res.statusCode >= 500) {
      logger.error(`Request completed: ${res.statusCode} ${duration}ms`, responseInfo);
    } else if (res.statusCode >= 400) {
      logger.warn(`Request completed: ${res.statusCode} ${duration}ms`, responseInfo);
    } else {
      logger.info(`Request completed: ${res.statusCode} ${duration}ms`, responseInfo);
    }
  });
  
  next();
};

// Exporta o middleware de log e o logger para uso em outros módulos
module.exports = {
  logRequestMiddleware,
  logger
};