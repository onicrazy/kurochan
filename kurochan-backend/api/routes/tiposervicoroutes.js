const express = require('express');
const router = express.Router();
const tipoServicoController = require('../controllers/tipoServicoController');
const { authMiddleware, isManagerOrAdmin } = require('../middlewares/authMiddleware');
const { body } = require('express-validator');

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

/**
 * @route GET /api/tipos-servico
 * @desc Lista todos os tipos de serviço
 * @access Private
 */
router.get('/', tipoServicoController.index);

/**
 * @route GET /api/tipos-servico/:id
 * @desc Busca um tipo de serviço pelo ID
 * @access Private
 */
router.get('/:id', tipoServicoController.show);

/**
 * @route POST /api/tipos-servico
 * @desc Cria um novo tipo de serviço
 * @access Private (Manager/Admin)
 */
router.post('/', 
  isManagerOrAdmin,
  [
    // Validação dos campos obrigatórios
    body('nome').notEmpty().withMessage('Nome do tipo de serviço é obrigatório')
  ],
  tipoServicoController.store
);

/**
 * @route PUT /api/tipos-servico/:id
 * @desc Atualiza um tipo de serviço existente
 * @access Private (Manager/Admin)
 */
router.put('/:id', 
  isManagerOrAdmin,
  [
    // Validação dos campos (opcional para atualização)
    body('nome').optional().notEmpty().withMessage('Nome do tipo de serviço não pode estar vazio')
  ],
  tipoServicoController.update
);

/**
 * @route DELETE /api/tipos-servico/:id
 * @desc Desativa um tipo de serviço (soft delete)
 * @access Private (Manager/Admin)
 */
router.delete('/:id', isManagerOrAdmin, tipoServicoController.destroy);

module.exports = router;