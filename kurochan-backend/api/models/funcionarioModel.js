const db = require('../../config/database');
const { AppError } = require('../middlewares/errorMiddleware');

/**
 * Modelo para interação com a tabela de funcionários
 */
class FuncionarioModel {
  /**
   * Busca todos os funcionários com filtragem e paginação
   * @param {Object} options - Opções de filtragem e paginação
   * @returns {Object} Objeto contendo funcionários e total
   */
  async findAll({ page = 1, limit = 20, sortBy = 'nome', sortOrder = 'asc', filters = {} }) {
    try {
      // Construir consulta base
      let query = db('kurochan.funcionarios')
        .select(
          'id',
          'nome',
          'nome_japones',
          'endereco',
          'telefone',
          'cargo',
          'valor_diaria',
          'valor_meio_periodo',
          'data_admissao',
          'documento',
          'ativo',
          'observacoes',
          'data_criacao',
          'data_atualizacao'
        );
      
      // Aplicar filtros
      if (filters.nome) {
        query = query.whereRaw('LOWER(nome) LIKE ?', [`%${filters.nome.toLowerCase()}%`]);
      }
      
      if (filters.cargo) {
        query = query.whereRaw('LOWER(cargo) = ?', [filters.cargo.toLowerCase()]);
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
      const [funcionarios, countResult] = await Promise.all([query, countQuery]);
      
      return {
        funcionarios,
        total: parseInt(countResult.total, 10)
      };
      
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
      throw error;
    }
  }
  
  /**
   * Busca um funcionário pelo ID
   * @param {number} id - ID do funcionário
   * @returns {Object|null} Funcionário encontrado ou null
   */
  async findById(id) {
    try {
      const funcionario = await db('kurochan.funcionarios')
        .select(
          'id',
          'nome',
          'nome_japones',
          'endereco',
          'telefone',
          'cargo',
          'valor_diaria',
          'valor_meio_periodo',
          'data_admissao',
          'documento',
          'ativo',
          'observacoes',
          'data_criacao',
          'data_atualizacao'
        )
        .where('id', id)
        .first();
      
      return funcionario || null;
      
    } catch (error) {
      console.error(`Erro ao buscar funcionário com ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Cria um novo funcionário
   * @param {Object} data - Dados do funcionário
   * @returns {Object} Funcionário criado
   */
  async create(data) {
    try {
      const [id] = await db('kurochan.funcionarios')
        .insert({
          nome: data.nome,
          nome_japones: data.nome_japones,
          endereco: data.endereco,
          telefone: data.telefone,
          cargo: data.cargo,
          valor_diaria: data.valor_diaria,
          valor_meio_periodo: data.valor_meio_periodo,
          data_admissao: data.data_admissao,
          documento: data.documento,
          ativo: data.ativo !== undefined ? data.ativo : true,
          observacoes: data.observacoes
        })
        .returning('id');
      
      return this.findById(id);
      
    } catch (error) {
      console.error('Erro ao criar funcionário:', error);
      throw error;
    }
  }
  
  /**
   * Atualiza um funcionário existente
   * @param {number} id - ID do funcionário
   * @param {Object} data - Dados a serem atualizados
   * @returns {Object} Funcionário atualizado
   */
  async update(id, data) {
    try {
      // Filtrando apenas os campos que foram fornecidos
      const updateData = {};
      if (data.nome !== undefined) updateData.nome = data.nome;
      if (data.nome_japones !== undefined) updateData.nome_japones = data.nome_japones;
      if (data.endereco !== undefined) updateData.endereco = data.endereco;
      if (data.telefone !== undefined) updateData.telefone = data.telefone;
      if (data.cargo !== undefined) updateData.cargo = data.cargo;
      if (data.valor_diaria !== undefined) updateData.valor_diaria = data.valor_diaria;
      if (data.valor_meio_periodo !== undefined) updateData.valor_meio_periodo = data.valor_meio_periodo;
      if (data.data_admissao !== undefined) updateData.data_admissao = data.data_admissao;
      if (data.documento !== undefined) updateData.documento = data.documento;
      if (data.ativo !== undefined) updateData.ativo = data.ativo;
      if (data.observacoes !== undefined) updateData.observacoes = data.observacoes;
      
      // Adicionar data de atualização
      updateData.data_atualizacao = db.fn.now();
      
      // Atualizar apenas se houver campos para atualizar
      if (Object.keys(updateData).length > 0) {
        await db('kurochan.funcionarios')
          .where('id', id)
          .update(updateData);
      }
      
      return this.findById(id);
      
    } catch (error) {
      console.error(`Erro ao atualizar funcionário com ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Busca as alocações de um funcionário
   * @param {number} id - ID do funcionário
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
          'a.valor_pago_funcionario',
          'a.valor_cobrado_empresa',
          'a.local_servico',
          'a.descricao_servico',
          'a.status_pagamento_funcionario',
          'e.id as empresa_id',
          'e.nome as empresa_nome',
          'e.nome_japones as empresa_nome_japones',
          'ts.id as tipo_servico_id',
          'ts.nome as tipo_servico_nome',
          'ts.nome_japones as tipo_servico_nome_japones'
        )
        .innerJoin('kurochan.empresas as e', 'a.empresa_id', 'e.id')
        .leftJoin('kurochan.tipos_servico as ts', 'a.tipo_servico_id', 'ts.id')
        .where('a.funcionario_id', id);
      
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
      console.error(`Erro ao buscar alocações do funcionário com ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Busca os pagamentos de um funcionário
   * @param {number} id - ID do funcionário
   * @param {Object} options - Opções de filtragem
   * @returns {Object} Objeto contendo pagamentos e total
   */
  async getPagamentos(id, { dataInicio, dataFim, page = 1, limit = 20 }) {
    try {
      let query = db('kurochan.pagamentos_funcionarios as pf')
        .select(
          'pf.id',
          'pf.data_pagamento',
          'pf.valor_total',
          'pf.periodo_inicio',
          'pf.periodo_fim',
          'pf.metodo_pagamento',
          'pf.numero_referencia',
          'pf.observacoes',
          db.raw('COUNT(pfd.alocacao_id) as total_alocacoes')
        )
        .leftJoin('kurochan.pagamento_funcionario_detalhes as pfd', 'pf.id', 'pfd.pagamento_id')
        .where('pf.funcionario_id', id)
        .groupBy('pf.id');
      
      // Aplicar filtros de data
      if (dataInicio) {
        query = query.where('pf.data_pagamento', '>=', dataInicio);
      }
      
      if (dataFim) {
        query = query.where('pf.data_pagamento', '<=', dataFim);
      }
      
      // Contar total de registros para paginação
      const countQuery = db('kurochan.pagamentos_funcionarios')
        .where('funcionario_id', id)
        .count('* as total')
        .first();
      
      // Aplicar filtros de data à consulta de contagem
      if (dataInicio) {
        countQuery.where('data_pagamento', '>=', dataInicio);
      }
      
      if (dataFim) {
        countQuery.where('data_pagamento', '<=', dataFim);
      }
      
      // Aplicar ordenação e paginação à consulta principal
      query = query
        .orderBy('pf.data_pagamento', 'desc')
        .limit(limit)
        .offset((page - 1) * limit);
      
      // Executar consultas
      const [pagamentos, countResult] = await Promise.all([query, countQuery]);
      
      // Para cada pagamento, buscar os detalhes das alocações
      for (const pagamento of pagamentos) {
        pagamento.alocacoes = await db('kurochan.pagamento_funcionario_detalhes as pfd')
          .select(
            'a.id',
            'a.data_alocacao',
            'pfd.valor',
            'e.nome as empresa_nome',
            'e.nome_japones as empresa_nome_japones'
          )
          .innerJoin('kurochan.alocacoes as a', 'pfd.alocacao_id', 'a.id')
          .innerJoin('kurochan.empresas as e', 'a.empresa_id', 'e.id')
          .where('pfd.pagamento_id', pagamento.id);
      }
      
      return {
        pagamentos,
        total: parseInt(countResult.total, 10)
      };
      
    } catch (error) {
      console.error(`Erro ao buscar pagamentos do funcionário com ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Verifica se um funcionário está alocado em uma determinada data
   * @param {number} id - ID do funcionário
   * @param {string} data - Data no formato 'YYYY-MM-DD'
   * @returns {boolean} True se já está alocado, False caso contrário
   */
  async isAlocadoNaData(id, data) {
    try {
      const result = await db('kurochan.alocacoes')
        .where({
          funcionario_id: id,
          data_alocacao: data
        })
        .first();
      
      return !!result;
      
    } catch (error) {
      console.error(`Erro ao verificar alocação do funcionário ${id} na data ${data}:`, error);
      throw error;
    }
  }
  
  /**
   * Calcula o total a pagar para o funcionário em um período
   * @param {number} id - ID do funcionário
   * @param {string} dataInicio - Data de início no formato 'YYYY-MM-DD'
   * @param {string} dataFim - Data de fim no formato 'YYYY-MM-DD'
   * @returns {Object} Objeto com total e detalhamento
   */
  async calcularPagamento(id, dataInicio, dataFim) {
    try {
      // Buscar alocações pendentes de pagamento no período
      const alocacoes = await db('kurochan.alocacoes')
        .select(
          'id',
          'data_alocacao',
          'tipo_periodo',
          'valor_pago_funcionario',
          'empresa_id'
        )
        .where({
          funcionario_id: id,
          status_pagamento_funcionario: 'pendente'
        })
        .whereBetween('data_alocacao', [dataInicio, dataFim])
        .orderBy('data_alocacao');
      
      // Calcular total a pagar
      const total = alocacoes.reduce((acc, alocacao) => acc + parseFloat(alocacao.valor_pago_funcionario), 0);
      
      // Buscar dados das empresas para as alocações
      if (alocacoes.length > 0) {
        const empresaIds = [...new Set(alocacoes.map(a => a.empresa_id))];
        const empresas = await db('kurochan.empresas')
          .select('id', 'nome', 'nome_japones')
          .whereIn('id', empresaIds);
        
        // Adicionar nome da empresa a cada alocação
        for (const alocacao of alocacoes) {
          const empresa = empresas.find(e => e.id === alocacao.empresa_id);
          alocacao.empresa_nome = empresa ? empresa.nome : 'Desconhecida';
          alocacao.empresa_nome_japones = empresa ? empresa.nome_japones : null;
        }
      }
      
      return {
        total,
        alocacoes
      };
      
    } catch (error) {
      console.error(`Erro ao calcular pagamento do funcionário ${id}:`, error);
      throw error;
    }
  }
}

module.exports = new FuncionarioModel();