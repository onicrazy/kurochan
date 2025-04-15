require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const i18next = require('i18next');
const i18nextMiddleware = require('i18next-http-middleware');
const i18nextBackend = require('i18next-fs-backend');
const path = require('path');

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
    saveMissing: true,
    detection: {
      order: ['header', 'cookie', 'querystring'],
      lookupHeader: 'accept-language'
    }
  });

// Inicialização do app Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet()); // Segurança
app.use(cors()); // Habilitando CORS
app.use(compression()); // Compressão de resposta
app.use(express.json()); // Parsing de JSON
app.use(express.urlencoded({ extended: true })); // Parsing de URL-encoded
app.use(morgan('dev')); // Logging
app.use(i18nextMiddleware.handle(i18next)); // Internacionalização

// Middleware de erro personalizado
const errorMiddleware = require('./api/middlewares/errorMiddleware');

// Rotas
const authRoutes = require('./api/routes/authRoutes');
const userRoutes = require('./api/routes/userRoutes');
const funcionarioRoutes = require('./api/routes/funcionarioRoutes');
const empresaRoutes = require('./api/routes/empresaRoutes');
const alocacaoRoutes = require('./api/routes/alocacaoRoutes');
const pagamentoRoutes = require('./api/routes/pagamentoRoutes');
const relatorioRoutes = require('./api/routes/relatorioRoutes');

// Definição das rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/funcionarios', funcionarioRoutes);
app.use('/api/empresas', empresaRoutes);
app.use('/api/alocacoes', alocacaoRoutes);
app.use('/api/pagamentos', pagamentoRoutes);
app.use('/api/relatorios', relatorioRoutes);

// Rota de status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    message: req.t('api.status.online'),
    timestamp: new Date(),
    environment: process.env.NODE_ENV
  });
});

// Middleware de tratamento de erros
app.use(errorMiddleware);

// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Para testes
module.exports = app;