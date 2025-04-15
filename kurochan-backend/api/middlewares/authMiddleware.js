const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar a autenticação do usuário via JWT
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 * @param {Function} next - Função next do Express
 */
const authMiddleware = (req, res, next) => {
  // Verifica se o header de autorização está presente
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({
      error: req.t('auth.error.noToken'),
      message: req.t('auth.error.authorizationRequired')
    });
  }

  // Formato do token: Bearer <token>
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2) {
    return res.status(401).json({
      error: req.t('auth.error.tokenFormatInvalid'),
      message: req.t('auth.error.tokenFormatInvalidMessage')
    });
  }

  const [scheme, token] = parts;

  // Verifica se o formato começa com Bearer
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({
      error: req.t('auth.error.tokenFormatInvalid'),
      message: req.t('auth.error.tokenMalformatted')
    });
  }

  // Verifica se o token é válido
  try {
    const secret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);
    
    // Adiciona as informações do usuário decodificadas à requisição
    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.userPreferredLanguage = decoded.preferredLanguage || 'pt-BR';

    return next();
  } catch (error) {
    // Tratamento de erros específicos de JWT
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: req.t('auth.error.tokenExpired'),
        message: req.t('auth.error.pleaseLoginAgain')
      });
    }

    return res.status(401).json({
      error: req.t('auth.error.tokenInvalid'),
      message: req.t('auth.error.invalidToken')
    });
  }
};

/**
 * Middleware para verificar se o usuário tem permissões de administrador
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 * @param {Function} next - Função next do Express
 */
const isAdmin = (req, res, next) => {
  if (req.userRole !== 'administrador') {
    return res.status(403).json({
      error: req.t('auth.error.accessDenied'),
      message: req.t('auth.error.adminRightsRequired')
    });
  }

  return next();
};

/**
 * Middleware para verificar se o usuário tem permissões de gerente ou administrador
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 * @param {Function} next - Função next do Express
 */
const isManagerOrAdmin = (req, res, next) => {
  if (req.userRole !== 'administrador' && req.userRole !== 'gerente') {
    return res.status(403).json({
      error: req.t('auth.error.accessDenied'),
      message: req.t('auth.error.managerOrAdminRightsRequired')
    });
  }

  return next();
};

module.exports = {
  authMiddleware,
  isAdmin,
  isManagerOrAdmin
};