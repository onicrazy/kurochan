/**
 * Configurações de ambiente da aplicação
 */
require('dotenv').config();

module.exports = {
  // Ambiente da aplicação
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Porta do servidor
  PORT: parseInt(process.env.PORT || '3000', 10),
  
  // Configurações de banco de dados
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'onicrazy',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kurochan'
  },
  
  // Configurações de JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'sua_chave_secreta_aqui',
    expiresIn: process.env.JWT_EXPIRATION || '24h'
  },
  
  // Configurações de Email
  email: {
    host: process.env.EMAIL_HOST || 'smtp.example.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASSWORD || ''
    },
    from: process.env.EMAIL_FROM || 'kurochan@example.com'
  },
  
  // Configurações de CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001'
  },
  
  // Configurações de Log
  log: {
    level: process.env.LOG_LEVEL || 'info',
    logRequestBody: process.env.LOG_REQUEST_BODY === 'true'
  },
  
  // Diretório para arquivos temporários
  tempDir: process.env.TEMP_DIR || './temp',
  
  // Idioma padrão
  defaultLanguage: process.env.DEFAULT_LANGUAGE || 'pt-BR'
};