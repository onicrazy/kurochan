const db = require('../../config/database');
const { AppError } = require('../middlewares/errorMiddleware');

/**
 * Modelo para interação com a tabela de tipos de serviço
 */
class TipoServicoModel {
  /**
   * Busca todos os tipos de serviço com filtragem e paginação
   * @param {Object} options - Opções de filtragem e paginação
   * @returns {Object} Objeto contendo tipos de serviço e total
   */
  async findAll({ page = 1, limit = 20, sortBy = 'nome', sortOrder = 'asc', filters = {} }) {
    try {
      // Construir consulta base
      let query = db('kurochan.tipos_servico')
        .select(
          'id',
          'nome',
          'nome_japones',
          'descricao',
          'ativo',
          'data_criacao',
          'data_atualizacao'
        );
      
      // Aplicar filtros
      if (filters.nome) {
        query = query.whereRaw('LOWER(nome) LIKE ?', [`%${filters.nome.toLowerCase()}%`]);
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
      const [tiposServico, countResult] = await Promise.all([query, countQuery]);
      
      return {
        tiposServico,
        total: parseInt(countResult.total, 10)
      };
      
    } catch (error) {
      console.error('Erro ao buscar tipos de serviço:', error);
      throw error;
    }
  }
  
  /**
   * Busca um tipo de serviço pelo ID
   * @param {number} id - ID do tipo de serviço
   * @returns {Object|null} Tipo de serviço encontrado ou null
   */
  async findById(id) {
    try {
      const tipoServico = await db('kurochan.tipos_servico')
        .select(
          'id',
          'nome',
          'nome_japones',
          'descricao',
          'ativo',
          'data_criacao',
          'data_atualizacao'
        )
        .where('id', id)
        .first();
      
      return tipoServico || null;
      
    } catch (error) {
      console.error(`Erro ao buscar tipo de serviço com ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Cria um novo tipo de serviço
   * @param {Object} data - Dados do tipo de serviço
   * @returns {Object} Tipo de serviço criado
   */
  async create(data) {
    try {
      const [id] = await db('kurochan.tipos_servico')
        .insert({
          nome: data.nome,
          nome_japones: data.nome_japones,
          descricao: data.descricao,
          ativo: data.ativo !== undefined ? data.ativo : true
        })
        .returning('id');
      
      return this.findById(id);
      
    } catch (error) {
      console.error('Erro ao criar tipo de serviço:', error);
      throw error;
    }
  }
  
  /**
   * Atualiza um tipo de serviço existente
   * @param {number} id - ID do tipo de serviço
   * @param {Object} data - Dados a serem atualizados
   * @returns {Object} Tipo de serviço atualizado
   */
  async update(id, data) {
    try {
      // Filtrando apenas os campos que foram fornecidos
      const updateData = {};
      if (data.nome !== undefined) updateData.nome = data.nome;
      if (data.nome_japones !== undefined) updateData.nome_japones = data.nome_japones;
      if (data.descricao !== undefined) updateData.descricao = data.descricao;
      if (data.ativo !== undefined) updateData.ativo = data.ativo;
      
      // Adicionar data de atualização
      updateData.data_atualizacao = db.fn.now();
      
      // Atualizar apenas se houver campos para atualizar
      if (Object.keys(updateData).length > 0) {
        await db('kurochan.tipos_servico')
          .where('id', id)
          .update(updateData);
      }
      
      return this.findById(id);
      
    } catch (error) {
      console.error(`Erro ao atualizar tipo de serviço com ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Exclui um tipo de serviço (soft delete - marca como inativo)
   * @param {number} id - ID do tipo de serviço
   * @returns {boolean} True se marcado como inativo com sucesso
   */
  async delete(id) {
    try {
      const result = await db('kurochan.tipos_servico')
        .where('id', id)
        .update({
          ativo: false,
          data_atualizacao: db.fn.now()
        });
      
      return result > 0;
      
    } catch (error) {
      console.error(`Erro ao excluir tipo de serviço com ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Verifica se um tipo de serviço está sendo utilizado em alocações
   * @param {number} id - ID do tipo de serviço
   * @returns {boolean} True se está sendo utilizado
   */
  async isBeingUsed(id) {
    try {
      const result = await db('kurochan.alocacoes')
        .where('tipo_servico_id', id)
        .first();
      
      return !!result;
      
    } catch (error) {
      console.error(`Erro ao verificar uso do tipo de serviço com ID ${id}:`, error);
      throw error;
    }
  }
}

module.exports = new TipoServicoModel();