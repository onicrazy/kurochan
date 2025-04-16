const db = require('../../config/database');
const { AppError } = require('../middlewares/errorMiddleware');

/**
 * Modelo para interação com a tabela de usuários
 */
class UserModel {
  /**
   * Busca todos os usuários com filtragem e paginação
   * @param {Object} options - Opções de filtragem e paginação
   * @returns {Object} Objeto contendo usuários e total
   */
  async findAll({ page = 1, limit = 20, sortBy = 'nome', sortOrder = 'asc', filters = {} }) {
    try {
      // Construir consulta base
      let query = db('kurochan.usuarios')
        .select(
          'id',
          'nome',
          'email',
          'senha',
          'funcao',
          'ativo',
          'idioma_preferido',
          'data_criacao',
          'data_atualizacao'
        );
      
      // Aplicar filtros
      if (filters.nome) {
        query = query.whereRaw('LOWER(nome) LIKE ?', [`%${filters.nome.toLowerCase()}%`]);
      }
      
      if (filters.email) {
        query = query.whereRaw('LOWER(email) LIKE ?', [`%${filters.email.toLowerCase()}%`]);
      }
      
      if (filters.funcao) {
        query = query.where('funcao', filters.funcao);
      }
      
      if (filters.ativo !== undefined) {
        query = query.where('ativo', filters.ativo);
      }
      
      // Contar total de registros para paginação
      const countQuery = query.clone().count('* as total').first();
      
      // Aplicar ordenação e paginação à consulta principal
      query = query
        .orderBy(sortBy, sortOrder)
        .limit(limit)
        .offset((page - 1) * limit);
      
      // Executar consultas
      const [users, countResult] = await Promise.all([query, countQuery]);
      
      return {
        users,
        total: parseInt(countResult.total, 10)
      };
      
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  }
  
  /**
   * Busca um usuário pelo ID
   * @param {number} id - ID do usuário
   * @returns {Object|null} Usuário encontrado ou null
   */
  async findById(id) {
    try {
      const user = await db('kurochan.usuarios')
        .select(
          'id',
          'nome',
          'email',
          'senha',
          'funcao',
          'ativo',
          'idioma_preferido',
          'data_criacao',
          'data_atualizacao'
        )
        .where('id', id)
        .first();
      
      return user || null;
      
    } catch (error) {
      console.error(`Erro ao buscar usuário com ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Busca um usuário pelo email
   * @param {string} email - Email do usuário
   * @returns {Object|null} Usuário encontrado ou null
   */
  async findByEmail(email) {
    try {
      const user = await db('kurochan.usuarios')
        .select(
          'id',
          'nome',
          'email',
          'senha',
          'funcao',
          'ativo',
          'idioma_preferido',
          'data_criacao',
          'data_atualizacao'
        )
        .whereRaw('LOWER(email) = ?', [email.toLowerCase()])
        .first();
      
      return user || null;
      
    } catch (error) {
      console.error(`Erro ao buscar usuário com email ${email}:`, error);
      throw error;
    }
  }
  
  /**
   * Cria um novo usuário
   * @param {Object} data - Dados do usuário
   * @returns {Object} Usuário criado
   */
  async create(data) {
    try {
      const [id] = await db('kurochan.usuarios')
        .insert({
          nome: data.nome,
          email: data.email,
          senha: data.senha,
          funcao: data.funcao,
          ativo: data.ativo !== undefined ? data.ativo : true,
          idioma_preferido: data.idioma_preferido || 'pt-BR'
        })
        .returning('id');
      
      return this.findById(id);
      
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }
  
  /**
   * Atualiza um usuário existente
   * @param {number} id - ID do usuário
   * @param {Object} data - Dados a serem atualizados
   * @returns {Object} Usuário atualizado
   */
  async update(id, data) {
    try {
      // Filtrando apenas os campos que foram fornecidos
      const updateData = {};
      if (data.nome !== undefined) updateData.nome = data.nome;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.funcao !== undefined) updateData.funcao = data.funcao;
      if (data.ativo !== undefined) updateData.ativo = data.ativo;
      if (data.idioma_preferido !== undefined) updateData.idioma_preferido = data.idioma_preferido;
      
      // Adicionar data de atualização
      updateData.data_atualizacao = db.fn.now();
      
      // Atualizar apenas se houver campos para atualizar
      if (Object.keys(updateData).length > 0) {
        await db('kurochan.usuarios')
          .where('id', id)
          .update(updateData);
      }
      
      return this.findById(id);
      
    } catch (error) {
      console.error(`Erro ao atualizar usuário com ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Atualiza a senha de um usuário
   * @param {number} id - ID do usuário
   * @param {string} hashedPassword - Senha já com hash
   * @returns {boolean} True se atualizado com sucesso
   */
  async updatePassword(id, hashedPassword) {
    try {
      const result = await db('kurochan.usuarios')
        .where('id', id)
        .update({
          senha: hashedPassword,
          data_atualizacao: db.fn.now()
        });
      
      return result > 0;
      
    } catch (error) {
      console.error(`Erro ao atualizar senha do usuário com ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Registra o último login do usuário
   * @param {number} id - ID do usuário
   * @returns {boolean} True se atualizado com sucesso
   */
  async registerLogin(id) {
    try {
      const result = await db('kurochan.usuarios')
        .where('id', id)
        .update({
          ultimo_login: db.fn.now(),
          data_atualizacao: db.fn.now()
        });
      
      return result > 0;
      
    } catch (error) {
      console.error(`Erro ao registrar login do usuário com ID ${id}:`, error);
      throw error;
    }
  }
}

module.exports = new UserModel();