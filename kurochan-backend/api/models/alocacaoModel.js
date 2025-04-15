const db = require('../../config/database');
const { AppError } = require('../middlewares/errorMiddleware');

/**
 * Modelo para interação com a tabela de alocações
 */
class AlocacaoModel {
  /**
   * Busca todas as alocações com filtragem e paginação
   * @param {Object} options - Opções de filtragem e paginação
   * @returns {Object} Objeto contendo alocações e total
   */
  async findAll({ page = 1, limit = 20, sortBy = 'data_alocacao', sortOrder = 'desc', filters = {} }) {
    try {
      // Construir consulta base
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
          'a.status_pagamento_empresa',
          'a.observacoes',
          'f.id as funcionario_id',
          'f.nome as funcionario_nome',
          'f.nome_japones as funcionario_nome_japones',
          'e.id as empresa_id',
          'e.nome as empresa_nome',
          'e.nome_japones as empresa_nome_japones',
          'ts.id as tipo_servico_id',
          'ts.nome as tipo_servico_nome',
          'ts.nome_japones as tipo_servico_nome_japones'
        )
        .join('kurochan.funcionarios as f', 'a.funcionario_id', 'f.id')
        .join('kurochan.empresas as e', 'a.empresa_id', 'e.id')
        .leftJoin('kurochan.tipos_servico as ts', 'a.tipo_servico_id', 'ts.id');
      
      // Aplicar filtros
      if (filters.dataInicio) {
        query = query.where('a.data_alocacao', '>=', filters.dataInicio);
      }
      
      if (filters.dataFim) {
        query = query.where('a.data_alocacao', '<=', filters.dataFim);
      }
      
      if (filters.empresaId) {
        query = query.where('a.empresa_id', filters.empresaId);
      }
      
      if (filters.funcionarioId) {
        query = query.where('a.funcionario_id', filters.funcionarioId);
      }
      
      if (filters.tipoServicoId) {
        query = query.where('a.tipo_servico_id', filters.tipoServicoId);
      }
      
      if (filters.statusPagamentoFuncionario) {
        query = query.where('a.status_pagamento_funcionario', filters.statusPagamentoFuncionario);
      }
      
      if (filters.statusPagamentoEmpresa) {
        query = query.where('a.status_pagamento_empresa', filters.statusPagamentoEmpresa);
      }
      
      // Contar total de registros para paginação
      const countQuery = query.clone().count('* as total').first();
      
      // Aplicar ordenação e paginação à consulta principal
      query = query
        .orderBy(`a.${sortBy}`, sortOrder)
        .limit(limit)
        .offset((page - 1) * limit);
      
      // Executar consultas
      const [alocacoes, countResult] = await Promise.all([query, countQuery]);
      
      return {
        alocacoes,
        total: parseInt(countResult.total, 10)
      };
      
    } catch (error) {
      console.error('Erro ao buscar alocações:', error);
      throw error;
    }
  }
  
  /**
   * Busca uma alocação pelo ID
   * @param {number} id - ID da alocação
   * @returns {Object|null} Alocação encontrada ou null
   */
  async findById(id) {
    try {
      const alocacao = await db('kurochan.alocacoes as a')
        .select(
          'a.id',
          'a.data_alocacao',
          'a.tipo_periodo',
          'a.valor_pago_funcionario',
          'a.valor_cobrado_empresa',
          'a.local_servico',
          'a.descricao_servico',
          'a.status_pagamento_funcionario',
          'a.status_pagamento_empresa',
          'a.observacoes',
          'a.data_criacao',
          'a.data_atualizacao',
          'f.id as funcionario_id',
          'f.nome as funcionario_nome',
          'f.nome_japones as funcionario_nome_japones',
          'e.id as empresa_id',
          'e.nome as empresa_nome',
          'e.nome_japones as empresa_nome_japones',
          'ts.id as tipo_servico_id',
          'ts.nome as tipo_servico_nome',
          'ts.nome_japones as tipo_servico_nome_japones'
        )
        .join('kurochan.funcionarios as f', 'a.funcionario_id', 'f.id')
        .join('kurochan.empresas as e', 'a.empresa_id', 'e.id')
        .leftJoin('kurochan.tipos_servico as ts', 'a.tipo_servico_id', 'ts.id')
        .where('a.id', id)
        .first();
      
      return alocacao || null;
      
    } catch (error) {
      console.error(`Erro ao buscar alocação com ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Busca alocações de um funcionário em uma data específica
   * @param {number} funcionarioId - ID do funcionário
   * @param {string} data - Data no formato 'YYYY-MM-DD'
   * @param {number} excluirId - ID da alocação a ser excluída da verificação (opcional)
   * @returns {Object|null} Alocação encontrada ou null
   */
  async findByFuncionarioData(funcionarioId, data, excluirId = null) {
    try {
      let query = db('kurochan.alocacoes')
        .where({
          funcionario_id: funcionarioId,
          data_alocacao: data
        });
      
      if (excluirId) {
        query = query.whereNot('id', excluirId);
      }
      
      const alocacao = await query.first();
      
      return alocacao || null;
      
    } catch (error) {
      console.error(`Erro ao buscar alocação para funcionário ${funcionarioId} na data ${data}:`, error);
      throw error;
    }
  }
  
  /**
   * Cria uma nova alocação
   * @param {Object} data - Dados da alocação
   * @returns {Object} Alocação criada
   */
  async create(data) {
    try {
      const [id] = await db('kurochan.alocacoes')
        .insert({
          empresa_id: data.empresa_id,
          funcionario_id: data.funcionario_id,
          data_alocacao: data.data_alocacao,
          tipo_periodo: data.tipo_periodo || 'integral',
          valor_pago_funcionario: data.valor_pago_funcionario,
          valor_cobrado_empresa: data.valor_cobrado_empresa,
          tipo_servico_id: data.tipo_servico_id || null,
          local_servico: data.local_servico,
          descricao_servico: data.descricao_servico,
          status_pagamento_funcionario: data.status_pagamento_funcionario || 'pendente',
          status_pagamento_empresa: data.status_pagamento_empresa || 'pendente',
          observacoes: data.observacoes
        })
        .returning('id');
      
      return this.findById(id);
      
    } catch (error) {
      console.error('Erro ao criar alocação:', error);
      throw error;
    }
  }
  
  /**
   * Atualiza uma alocação existente
   * @param {number} id - ID da alocação
   * @param {Object} data - Dados a serem atualizados
   * @returns {Object} Alocação atualizada
   */
  async update(id, data) {
    try {
      // Filtrando apenas os campos que foram fornecidos
      const updateData = {};
      if (data.empresa_id !== undefined) updateData.empresa_id = data.empresa_id;
      if (data.funcionario_id !== undefined) updateData.funcionario_id = data.funcionario_id;
      if (data.data_alocacao !== undefined) updateData.data_alocacao = data.data_alocacao;
      if (data.tipo_periodo !== undefined) updateData.tipo_periodo = data.tipo_periodo;
      if (data.valor_pago_funcionario !== undefined) updateData.valor_pago_funcionario = data.valor_pago_funcionario;
      if (data.valor_cobrado_empresa !== undefined) updateData.valor_cobrado_empresa = data.valor_cobrado_empresa;
      if (data.tipo_servico_id !== undefined) updateData.tipo_servico_id = data.tipo_servico_id;
      if (data.local_servico !== undefined) updateData.local_servico = data.local_servico;
      if (data.descricao_servico !== undefined) updateData.descricao_servico = data.descricao_servico;
      if (data.status_pagamento_funcionario !== undefined) updateData.status_pagamento_funcionario = data.status_pagamento_funcionario;
      if (data.status_pagamento_empresa !== undefined) updateData.status_pagamento_empresa = data.status_pagamento_empresa;
      if (data.observacoes !== undefined) updateData.observacoes = data.observacoes;
      
      // Adicionar data de atualização
      updateData.data_atualizacao = db.fn.now();
      
      // Atualizar apenas se houver campos para atualizar
      if (Object.keys(updateData).length > 0) {
        await db('kurochan.alocacoes')
          .where('id', id)
          .update(updateData);
      }
      
      return this.findById(id);
      
    } catch (error) {
      console.error(`Erro ao atualizar alocação com ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Remove uma alocação
   * @param {number} id - ID da alocação
   * @returns {boolean} True se removido com sucesso
   */
  async delete(id) {
    try {
      const result = await db('kurochan.alocacoes')
        .where('id', id)
        .delete();
      
      return result > 0;
      
    } catch (error) {
      console.error(`Erro ao excluir alocação com ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Verifica se uma alocação está associada a um pagamento
   * @param {number} id - ID da alocação
   * @returns {boolean} True se está associada a um pagamento
   */
  async isAssociatedWithPayment(id) {
    try {
      // Verificar se a alocação está associada a um pagamento de funcionário
      const pagamentoFuncionario = await db('kurochan.pagamento_funcionario_detalhes')
        .where('alocacao_id', id)
        .first();
      
      if (pagamentoFuncionario) {
        return true;
      }
      
      // Verificar se a alocação está associada a uma fatura de empresa
      const faturaEmpresa = await db('kurochan.fatura_empresa_detalhes')
        .where('alocacao_id', id)
        .first();
      
      return !!faturaEmpresa;
      
    } catch (error) {
      console.error(`Erro ao verificar associação da alocação ${id} com pagamentos:`, error);
      throw error;
    }
  }
  
  /**
   * Atualiza o status de pagamento do funcionário
   * @param {number} id - ID da alocação
   * @param {string} status - Novo status ('pendente' ou 'pago')
   * @returns {Object} Alocação atualizada
   */
  async updateStatusPagamentoFuncionario(id, status) {
    try {
      await db('kurochan.alocacoes')
        .where('id', id)
        .update({
          status_pagamento_funcionario: status,
          data_atualizacao: db.fn.now()
        });
      
      return this.findById(id);
      
    } catch (error) {
      console.error(`Erro ao atualizar status de pagamento do funcionário para alocação ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Atualiza o status de pagamento da empresa
   * @param {number} id - ID da alocação
   * @param {string} status - Novo status ('pendente' ou 'pago')
   * @returns {Object} Alocação atualizada
   */
  async updateStatusPagamentoEmpresa(id, status) {
    try {
      await db('kurochan.alocacoes')
        .where('id', id)
        .update({
          status_pagamento_empresa: status,
          data_atualizacao: db.fn.now()
        });
      
      return this.findById(id);
      
    } catch (error) {
      console.error(`Erro ao atualizar status de pagamento da empresa para alocação ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Busca dados para visualização em calendário
   * @param {number} ano - Ano do calendário
   * @param {number} mes - Mês do calendário (1-12)
   * @returns {Array} Alocações formatadas para o calendário
   */
  async getCalendarData(ano, mes) {
    try {
      // Determinar o primeiro e último dia do mês
      const dataInicio = `${ano}-${mes.toString().padStart(2, '0')}-01`;
      const ultimoDia = new Date(ano, mes, 0).getDate(); // O mês em JS é base 0, mas estamos recebendo 1-12
      const dataFim = `${ano}-${mes.toString().padStart(2, '0')}-${ultimoDia}`;
      
      // Buscar alocações do mês
      const alocacoes = await db('kurochan.alocacoes as a')
        .select(
          'a.id',
          'a.data_alocacao',
          'a.tipo_periodo',
          'a.valor_pago_funcionario',
          'a.valor_cobrado_empresa',
          'a.local_servico',
          'a.descricao_servico',
          'a.status_pagamento_funcionario',
          'a.status_pagamento_empresa',
          'f.id as funcionario_id',
          'f.nome as funcionario_nome',
          'f.nome_japones as funcionario_nome_japones',
          'e.id as empresa_id',
          'e.nome as empresa_nome',
          'e.nome_japones as empresa_nome_japones'
        )
        .join('kurochan.funcionarios as f', 'a.funcionario_id', 'f.id')
        .join('kurochan.empresas as e', 'a.empresa_id', 'e.id')
        .whereBetween('a.data_alocacao', [dataInicio, dataFim])
        .orderBy('a.data_alocacao');
      
      // Adicionar informações de cor para cada empresa (para visualização no calendário)
      const empresas = await db('kurochan.empresas')
        .select('id', 'nome')
        .whereIn('id', [...new Set(alocacoes.map(a => a.empresa_id))]);
      
      // Gerar cores aleatórias para empresas (ou poderia ser uma cor fixa por empresa no banco)
      const coresEmpresas = {};
      const cores = [
        '#4285F4', '#EA4335', '#FBBC05', '#34A853', // Google colors
        '#0078D7', '#FF5722', '#9C27B0', '#673AB7', // Material colors
        '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
        '#009688', '#4CAF50', '#8BC34A', '#CDDC39'
      ];
      
      empresas.forEach((empresa, index) => {
        coresEmpresas[empresa.id] = cores[index % cores.length];
      });
      
      // Adicionar cores às alocações
      alocacoes.forEach(alocacao => {
        alocacao.empresa_cor = coresEmpresas[alocacao.empresa_id];
      });
      
      return alocacoes;
      
    } catch (error) {
      console.error(`Erro ao buscar dados do calendário para ${mes}/${ano}:`, error);
      throw error;
    }
  }
  
  /**
   * Busca alocações pendentes de pagamento agrupadas por funcionário
   * @returns {Array} Alocações pendentes agrupadas por funcionário
   */
  async getPendentesAgrupadas() {
    try {
      // Primeiro, buscar funcionários com alocações pendentes
      const funcionariosComPendentes = await db('kurochan.alocacoes as a')
        .select(
          'f.id',
          'f.nome',
          'f.nome_japones',
          db.raw('COUNT(a.id) as total_pendentes'),
          db.raw('SUM(a.valor_pago_funcionario) as total_valor')
        )
        .join('kurochan.funcionarios as f', 'a.funcionario_id', 'f.id')
        .where('a.status_pagamento_funcionario', 'pendente')
        .groupBy('f.id', 'f.nome', 'f.nome_japones')
        .orderBy('f.nome');
      
      // Para cada funcionário, buscar detalhes das alocações pendentes
      const resultado = [];
      
      for (const funcionario of funcionariosComPendentes) {
        // Buscar alocações pendentes deste funcionário
        const alocacoes = await db('kurochan.alocacoes as a')
          .select(
            'a.id',
            'a.data_alocacao',
            'a.tipo_periodo',
            'a.valor_pago_funcionario',
            'e.id as empresa_id',
            'e.nome as empresa_nome'
          )
          .join('kurochan.empresas as e', 'a.empresa_id', 'e.id')
          .where({
            'a.funcionario_id': funcionario.id,
            'a.status_pagamento_funcionario': 'pendente'
          })
          .orderBy('a.data_alocacao');
        
        resultado.push({
          funcionario: {
            id: funcionario.id,
            nome: funcionario.nome,
            nome_japones: funcionario.nome_japones
          },
          total_pendentes: parseInt(funcionario.total_pendentes),
          total_valor: parseFloat(funcionario.total_valor),
          alocacoes
        });
      }
      
      return resultado;
      
    } catch (error) {
      console.error('Erro ao buscar alocações pendentes agrupadas:', error);
      throw error;
    }
  }
}

module.exports = new AlocacaoModel();