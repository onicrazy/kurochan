const db = require('../../config/database');
const { AppError } = require('../middlewares/errorMiddleware');

/**
 * Modelo para interação com a tabela de empresas
 */
class EmpresaModel {
  /**
   * Busca todas as empresas com filtragem e paginação
   * @param {Object} options - Opções de filtragem e paginação
   * @returns {Object} Objeto contendo empresas e total
   */
  async findAll({ page = 1, limit = 20, sortBy = 'nome', sortOrder = 'asc', filters = {} }) {
    try {
      // Construir consulta base
      let query = db('kurochan.empresas')
        .select(
          'id',
          'nome',
          'nome_japones',
          'endereco',
          'contato_nome',
          'contato_telefone',
          'contato_email',
          'valor_padrao_servico',
          'ativa',
          'observacoes',
          'data_criacao',
          'data_atualizacao'
        );
      
      // Aplicar filtros
      if (filters.nome) {
        query = query.whereRaw('LOWER(nome) LIKE ?', [`%${filters.nome.toLowerCase()}%`]);
      }
      
      if (filters.ativa !== undefined) {
        query = query.where('ativa', filters.ativa);
      }
      
      // Contar total de registros para paginação
      const countQuery = query.clone().count('* as total').first();
      
      // Aplicar ordenação e paginação à consulta principal
      query = query
        .orderBy(sortBy, sortOrder)
        .limit(limit)
        .offset((page - 1) * limit);
      
      // Executar consultas
      const [empresas, countResult] = await Promise.all([query, countQuery]);
      
      return {
        empresas,
        total: parseInt(countResult.total, 10)
      };
      
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
      throw error;
    }
  }
  
  /**
   * Busca uma empresa pelo ID
   * @param {number} id - ID da empresa
   * @returns {Object|null} Empresa encontrada ou null
   */
  async findById(id) {
    try {
      const empresa = await db('kurochan.empresas')
        .select(
          'id',
          'nome',
          'nome_japones',
          'endereco',
          'contato_nome',
          'contato_telefone',
          'contato_email',
          'valor_padrao_servico',
          'ativa',
          'observacoes',
          'data_criacao',
          'data_atualizacao'
        )
        .where('id', id)
        .first();
      
      return empresa || null;
      
    } catch (error) {
      console.error(`Erro ao buscar empresa com ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Cria uma nova empresa
   * @param {Object} data - Dados da empresa
   * @returns {Object} Empresa criada
   */
  async create(data) {
    try {
      const [id] = await db('kurochan.empresas')
        .insert({
          nome: data.nome,
          nome_japones: data.nome_japones,
          endereco: data.endereco,
          contato_nome: data.contato_nome,
          contato_telefone: data.contato_telefone,
          contato_email: data.contato_email,
          valor_padrao_servico: data.valor_padrao_servico,
          ativa: data.ativa !== undefined ? data.ativa : true,
          observacoes: data.observacoes
        })
        .returning('id');
      
      return this.findById(id);
      
    } catch (error) {
      console.error('Erro ao criar empresa:', error);
      throw error;
    }
  }
  
  /**
   * Atualiza uma empresa existente
   * @param {number} id - ID da empresa
   * @param {Object} data - Dados a serem atualizados
   * @returns {Object} Empresa atualizada
   */
  async update(id, data) {
    try {
      // Filtrando apenas os campos que foram fornecidos
      const updateData = {};
      if (data.nome !== undefined) updateData.nome = data.nome;
      if (data.nome_japones !== undefined) updateData.nome_japones = data.nome_japones;
      if (data.endereco !== undefined) updateData.endereco = data.endereco;
      if (data.contato_nome !== undefined) updateData.contato_nome = data.contato_nome;
      if (data.contato_telefone !== undefined) updateData.contato_telefone = data.contato_telefone;
      if (data.contato_email !== undefined) updateData.contato_email = data.contato_email;
      if (data.valor_padrao_servico !== undefined) updateData.valor_padrao_servico = data.valor_padrao_servico;
      if (data.ativa !== undefined) updateData.ativa = data.ativa;
      if (data.observacoes !== undefined) updateData.observacoes = data.observacoes;
      
      // Adicionar data de atualização
      updateData.data_atualizacao = db.fn.now();
      
      // Atualizar apenas se houver campos para atualizar
      if (Object.keys(updateData).length > 0) {
        await db('kurochan.empresas')
          .where('id', id)
          .update(updateData);
      }
      
      return this.findById(id);
      
    } catch (error) {
      console.error(`Erro ao atualizar empresa com ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Busca as alocações de uma empresa
   * @param {number} id - ID da empresa
   * @param {Object} options - Opções de filtragem
   * @returns {Object} Objeto contendo alocações e total
   */
  async getAlocacoes(id, { dataInicio, dataFim, page = 1, limit = 20 }) {
    try {
      let query = db('kurochan.alocacoes as a')
        .select(
          'a.id',
          'a.data_alocacao',
          'a.tipo_periodo',
          'a.valor_cobrado_empresa',
          'a.local_servico',
          'a.descricao_servico',
          'a.status_pagamento_empresa',
          'f.id as funcionario_id',
          'f.nome as funcionario_nome',
          'f.nome_japones as funcionario_nome_japones',
          'ts.id as tipo_servico_id',
          'ts.nome as tipo_servico_nome',
          'ts.nome_japones as tipo_servico_nome_japones'
        )
        .innerJoin('kurochan.funcionarios as f', 'a.funcionario_id', 'f.id')
        .leftJoin('kurochan.tipos_servico as ts', 'a.tipo_servico_id', 'ts.id')
        .where('a.empresa_id', id);
      
      // Aplicar filtros de data
      if (dataInicio) {
        query = query.where('a.data_alocacao', '>=', dataInicio);
      }
      
      if (dataFim) {
        query = query.where('a.data_alocacao', '<=', dataFim);
      }
      
      // Contar total de registros para paginação
      const countQuery = query.clone().count('* as total').first();
      
      // Aplicar ordenação e paginação à consulta principal
      query = query
        .orderBy('a.data_alocacao', 'desc')
        .limit(limit)
        .offset((page - 1) * limit);
      
      // Executar consultas
      const [alocacoes, countResult] = await Promise.all([query, countQuery]);
      
      return {
        alocacoes,
        total: parseInt(countResult.total, 10)
      };
      
    } catch (error) {
      console.error(`Erro ao buscar alocações da empresa com ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Busca as faturas de uma empresa
   * @param {number} id - ID da empresa
   * @param {Object} options - Opções de filtragem
   * @returns {Object} Objeto contendo faturas e total
   */
  async getFaturas(id, { dataInicio, dataFim, status, page = 1, limit = 20 }) {
    try {
      let query = db('kurochan.faturas_empresas as fe')
        .select(
          'fe.id',
          'fe.data_fatura',
          'fe.data_vencimento',
          'fe.valor_total',
          'fe.periodo_inicio',
          'fe.periodo_fim',
          'fe.status_pagamento',
          'fe.metodo_pagamento',
          'fe.numero_referencia',
          'fe.observacoes',
          db.raw('COUNT(fed.alocacao_id) as total_alocacoes')
        )
        .leftJoin('kurochan.fatura_empresa_detalhes as fed', 'fe.id', 'fed.fatura_id')
        .where('fe.empresa_id', id)
        .groupBy('fe.id');
      
      // Aplicar filtros
      if (dataInicio) {
        query = query.where('fe.data_fatura', '>=', dataInicio);
      }
      
      if (dataFim) {
        query = query.where('fe.data_fatura', '<=', dataFim);
      }
      
      if (status) {
        query = query.where('fe.status_pagamento', status);
      }
      
      // Contar total de registros para paginação
      const countQuery = db('kurochan.faturas_empresas')
        .where('empresa_id', id)
        .count('* as total')
        .first();
      
      // Aplicar filtros à consulta de contagem
      if (dataInicio) {
        countQuery.where('data_fatura', '>=', dataInicio);
      }
      
      if (dataFim) {
        countQuery.where('data_fatura', '<=', dataFim);
      }
      
      if (status) {
        countQuery.where('status_pagamento', status);
      }
      
      // Aplicar ordenação e paginação à consulta principal
      query = query
        .orderBy('fe.data_fatura', 'desc')
        .limit(limit)
        .offset((page - 1) * limit);
      
      // Executar consultas
      const [faturas, countResult] = await Promise.all([query, countQuery]);
      
      return {
        faturas,
        total: parseInt(countResult.total, 10)
      };
      
    } catch (error) {
      console.error(`Erro ao buscar faturas da empresa com ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Calcula o total a cobrar da empresa em um período
   * @param {number} id - ID da empresa
   * @param {string} dataInicio - Data de início no formato 'YYYY-MM-DD'
   * @param {string} dataFim - Data de fim no formato 'YYYY-MM-DD'
   * @returns {Object} Objeto com total e detalhamento
   */
  async calcularFatura(id, dataInicio, dataFim) {
    try {
      // Buscar alocações pendentes de pagamento no período
      const alocacoes = await db('kurochan.alocacoes')
        .select(
          'id',
          'data_alocacao',
          'tipo_periodo',
          'valor_cobrado_empresa',
          'funcionario_id',
          'local_servico',
          'descricao_servico'
        )
        .where({
          empresa_id: id,
          status_pagamento_empresa: 'pendente'
        })
        .whereBetween('data_alocacao', [dataInicio, dataFim])
        .orderBy('data_alocacao');
      
      // Calcular total a cobrar
      const total = alocacoes.reduce((acc, alocacao) => acc + parseFloat(alocacao.valor_cobrado_empresa), 0);
      
      // Buscar dados dos funcionários para as alocações
      if (alocacoes.length > 0) {
        const funcionarioIds = [...new Set(alocacoes.map(a => a.funcionario_id))];
        const funcionarios = await db('kurochan.funcionarios')
          .select('id', 'nome', 'nome_japones')
          .whereIn('id', funcionarioIds);
        
        // Adicionar nome do funcionário a cada alocação
        for (const alocacao of alocacoes) {
          const funcionario = funcionarios.find(f => f.id === alocacao.funcionario_id);
          alocacao.funcionario_nome = funcionario ? funcionario.nome : 'Desconhecido';
          alocacao.funcionario_nome_japones = funcionario ? funcionario.nome_japones : null;
        }
      }
      
      return {
        total,
        alocacoes
      };
      
    } catch (error) {
      console.error(`Erro ao calcular fatura da empresa ${id}:`, error);
      throw error;
    }
  }
}

module.exports = new EmpresaModel();