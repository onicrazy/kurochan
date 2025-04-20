// Carregar variáveis de ambiente
require('dotenv').config();

// Importar dependências
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const i18next = require('i18next');
const i18nextMiddleware = require('i18next-http-middleware');
const i18nextBackend = require('i18next-fs-backend');
const fs = require('fs');

// Inicialização do app Express
const app = express();
const PORT = process.env.PORT || 3000;

// Configuração i18n para internacionalização
i18next
  .use(i18nextBackend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    backend: {
      loadPath: path.join(__dirname, '/locales/{{lng}}/{{ns}}.json')
    },
    fallbackLng: 'pt-BR',
    preload: ['pt-BR', 'ja'],
    saveMissing: process.env.NODE_ENV === 'development',
    detection: {
      order: ['header', 'cookie', 'querystring'],
      lookupHeader: 'accept-language'
    }
  });

// Verifica se diretório temp existe, caso contrário, cria
const tempDir = process.env.TEMP_DIR || './temp';
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Middlewares
app.use(helmet()); // Segurança
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
})); // Habilita CORS
app.use(compression()); // Compressão de resposta
app.use(express.json()); // Parsing de JSON
app.use(express.urlencoded({ extended: true })); // Parsing de URL-encoded
app.use(morgan('dev')); // Logging básico
app.use(i18nextMiddleware.handle(i18next)); // Internacionalização

// Middleware de erro personalizado
const { errorMiddleware } = require('./api/middlewares/errorMiddleware');

// Rotas
const authRoutes = require('./api/routes/authRoutes');
const userRoutes = require('./api/routes/userRoutes');
const funcionarioRoutes = require('./api/routes/funcionarioRoutes');
const empresaRoutes = require('./api/routes/empresaRoutes');
const alocacaoRoutes = require('./api/routes/alocacaoRoutes');
const pagamentoRoutes = require('./api/routes/pagamentoRoutes');
const relatorioRoutes = require('./api/routes/relatorioRoutes');
const tipoServicoRoutes = require('./api/routes/tipoServicoRoutes');

// Definição das rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/funcionarios', funcionarioRoutes);
app.use('/api/empresas', empresaRoutes);
app.use('/api/alocacoes', alocacaoRoutes);
app.use('/api/pagamentos', pagamentoRoutes);
app.use('/api/relatorios', relatorioRoutes);
app.use('/api/tipos-servico', tipoServicoRoutes);

// Rota de status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    message: req.t('api.status.online'),
    timestamp: new Date(),
    environment: process.env.NODE_ENV,
    version: require('./package.json').version
  });
});

// MODIFICADO: Redirecionar para o frontend em desenvolvimento
// Este código deve estar antes do middleware de rota não encontrada
if (process.env.NODE_ENV === 'development') {
  console.log('Redirecionando requisições não-API para o frontend');
  
  // Para qualquer rota que não comece com /api, redirecionar para o frontend
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api/')) {
      // Redirecionar para o URL do frontend
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      return res.redirect(`${frontendUrl}${req.path}`);
    }
    next();
  });
}

// Rota não encontrada (só será acionada para rotas de API não encontradas agora)
app.use((req, res, next) => {
  res.status(404).json({
    error: 'NotFound',
    message: req.t('error.pageNotFound'),
    path: req.originalUrl
  });
});

// Middleware de tratamento de erros
app.use(errorMiddleware);

// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} em ambiente ${process.env.NODE_ENV || 'development'}`);
});

// Teste de conexão com banco de dados
const db = require('./config/database');
db.raw('SELECT 1+1 AS result')
  .then(() => {
    console.log('Conexão com o banco de dados estabelecida com sucesso!');
  })
  .catch(err => {
    console.error('Erro ao conectar com o banco de dados:', err);
  });

// Para testes
module.exports = app;