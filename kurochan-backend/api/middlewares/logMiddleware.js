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
    userId: req.userId || 'unauthenticated',
    userAgent: req.get('User-Agent'),
    body: process.env.LOG_REQUEST_BODY === 'true' ? sanitizeBody(req.body) : undefined
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

/**
 * Remove dados sensíveis do corpo da requisição antes de registrar logs
 * @param {Object} body - Corpo da requisição
 * @returns {Object} Corpo da requisição sem dados sensíveis
 */
function sanitizeBody(body) {
  if (!body) return body;
  
  const sanitized = { ...body };
  
  // Lista de campos sensíveis a serem omitidos
  const sensitiveFields = ['senha', 'password', 'senhaAtual', 'novaSenha', 'token', 'apiKey'];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
}

// Exporta o middleware de log e o logger para uso em outros módulos
module.exports = {
  logRequestMiddleware,
  logger
};

const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Cria diretório de logs se não existir
const logDirectory = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

// Criar stream de escrita para o arquivo de log
const accessLogStream = fs.createWriteStream(
  path.join(logDirectory, 'access.log'),
  { flags: 'a' }
);

// Formato de log personalizado
const logFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';

// Middleware de log para desenvolvimento
const devLogMiddleware = morgan('dev');

// Middleware de log para produção
const prodLogMiddleware = morgan(logFormat, { stream: accessLogStream });

// Exportar middleware de acordo com o ambiente
module.exports = process.env.NODE_ENV === 'production' 
  ? prodLogMiddleware 
  : devLogMiddleware;