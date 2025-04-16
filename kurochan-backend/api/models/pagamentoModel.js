const db = require('../../config/database');
const { AppError } = require('../middlewares/errorMiddleware');

/**
 * Modelo para interação com as tabelas relacionadas a pagamentos
 */
class PagamentoModel {
  // ==================== PAGAMENTOS A FUNCIONÁRIOS ====================
  
  /**
   * Busca todos os pagamentos a funcionários com filtragem e paginação
   * @param {Object} options - Opções de filtragem e paginação
   * @returns {Object} Objeto contendo pagamentos e total
   */
  async findAllPagamentosFuncionarios({ page = 1, limit = 20, sortBy = 'data_pagamento', sortOrder = 'desc', filters = {} }) {
    try {
      // Construir consulta base
      let query = db('kurochan.pagamentos_funcionarios as pf')
        .select(
          'pf.id',
          'pf.funcionario_id',
          'pf.data_pagamento',
          'pf.valor_total',
          'pf.periodo_inicio',
          'pf.periodo_fim',
          'pf.metodo_pagamento',
          'pf.numero_referencia',
          'pf.observacoes',
          'pf.data_criacao',
          'pf.data_atualizacao',
          'f.nome as funcionario_nome',
          'f.nome_japones as funcionario_nome_japones',
          db.raw('COUNT(pfd.alocacao_id) as total_alocacoes')
        )
        .join('kurochan.funcionarios as f', 'pf.funcionario_id', 'f.id')
        .leftJoin('kurochan.pagamento_funcionario_detalhes as pfd', 'pf.id', 'pfd.pagamento_id')
        .groupBy(
          'pf.id',
          'pf.funcionario_id',
          'pf.data_pagamento',
          'pf.valor_total',
          'pf.periodo_inicio',
          'pf.periodo_fim',
          'pf.metodo_pagamento',
          'pf.numero_referencia',
          'pf.observacoes',
          'pf.data_criacao',
          'pf.data_atualizacao',
          'f.nome',
          'f.nome_japones'
        );
      
      // Aplicar filtros
      if (filters.funcionarioId) {
        query = query.where('pf.funcionario_id', filters.funcionarioId);
      }
      
      if (filters.dataInicio) {
        query = query.where('pf.data_pagamento', '>=', filters.dataInicio);
      }
      
      if (filters.dataFim) {
        query = query.where('pf.data_pagamento', '<=', filters.dataFim);
      }
      
      // Contar total de registros para paginação
      // Precisamos clonar a consulta e simplificá-la para contagem
      const countQuery = db('kurochan.pagamentos_funcionarios as pf')
        .countDistinct('pf.id as total');
      
      // Aplicar os mesmos filtros à consulta de contagem
      if (filters.funcionarioId) {
        countQuery.where('pf.funcionario_id', filters.funcionarioId);
      }
      
      if (filters.dataInicio) {
        countQuery.where('pf.data_pagamento', '>=', filters.dataInicio);
      }
      
      if (filters.dataFim) {
        countQuery.where('pf.data_pagamento', '<=', filters.dataFim);
      }
      
      // Aplicar ordenação e paginação à consulta principal
      query = query
        .orderBy(`pf.${sortBy}`, sortOrder)
        .limit(limit)
        .offset((page - 1) * limit);
      
      // Executar consultas
      const [pagamentos, countResult] = await Promise.all([query, countQuery.first()]);
      
      return {
        pagamentos,
        total: parseInt(countResult.total, 10)
      };
      
    } catch (error) {
      console.error('Erro ao buscar pagamentos a funcionários:', error);
      throw error;
    }
  }
  
  /**
   * Busca um pagamento a funcionário pelo ID
   * @param {number} id - ID do pagamento
   * @returns {Object|null} Pagamento encontrado ou null
   */
  async findPagamentoFuncionarioById(id) {
    try {
      // Buscar dados do pagamento
      const pagamento = await db('kurochan.pagamentos_funcionarios as pf')
        .select(
          'pf.id',
          'pf.funcionario_id',
          'pf.data_pagamento',
          'pf.valor_total',
          'pf.periodo_inicio',
          'pf.periodo_fim',
          'pf.metodo_pagamento',
          'pf.numero_referencia',
          'pf.observacoes',
          'pf.data_criacao',
          'pf.data_atualizacao',
          'f.nome as funcionario_nome',
          'f.nome_japones as funcionario_nome_japones',
          'f.cargo as funcionario_cargo'
        )
        .join('kurochan.funcionarios as f', 'pf.funcionario_id', 'f.id')
        .where('pf.id', id)
        .first();
      
      if (!pagamento) {
        return null;
      }
      
      // Buscar detalhes das alocações deste pagamento
      const alocacoes = await db('kurochan.pagamento_funcionario_detalhes as pfd')
        .select(
          'pfd.alocacao_id',
          'pfd.valor',
          'a.data_alocacao',
          'a.tipo_periodo',
          'e.id as empresa_id',
          'e.nome as empresa_nome',
          'e.nome_japones as empresa_nome_japones'
        )
        .join('kurochan.alocacoes as a', 'pfd.alocacao_id', 'a.id')
        .join('kurochan.empresas as e', 'a.empresa_id', 'e.id')
        .where('pfd.pagamento_id', id);
      
      // Adicionar alocações ao objeto de pagamento
      pagamento.alocacoes = alocacoes;
      
      return pagamento;
      
    } catch (error) {
      console.error(`Erro ao buscar pagamento a funcionário com ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Cria um novo pagamento a funcionário
   * @param {Object} data - Dados do pagamento
   * @returns {Object} Pagamento criado
   */
  async createPagamentoFuncionario(data) {
    try {
      // Iniciar transação
      return await db.transaction(async trx => {
        // Inserir o pagamento
        const [pagamentoId] = await trx('kurochan.pagamentos_funcionarios')
          .insert({
            funcionario_id: data.funcionario_id,
            data_pagamento: data.data_pagamento,
            valor_total: data.valor_total,
            periodo_inicio: data.periodo_inicio,
            periodo_fim: data.periodo_fim,
            metodo_pagamento: data.metodo_pagamento,
            numero_referencia: data.numero_referencia,
            observacoes: data.observacoes
          })
          .returning('id');
        
        // Inserir os detalhes (alocações)
        if (data.alocacoes && data.alocacoes.length > 0) {
          const detalhes = data.alocacoes.map(alocacao => ({
            pagamento_id: pagamentoId,
            alocacao_id: alocacao.alocacao_id,
            valor: alocacao.valor
          }));
          
          await trx('kurochan.pagamento_funcionario_detalhes').insert(detalhes);
          
          // Atualizar o status de pagamento nas alocações
          for (const alocacao of data.alocacoes) {
            await trx('kurochan.alocacoes')
              .where('id', alocacao.alocacao_id)
              .update({
                status_pagamento_funcionario: 'pago',
                data_atualizacao: trx.fn.now()
              });
          }
        }
        
        // Buscar o pagamento com detalhes
        return this.findPagamentoFuncionarioById(pagamentoId);
      });
      
    } catch (error) {
      console.error('Erro ao criar pagamento a funcionário:', error);
      throw error;
    }
  }
  
  // ==================== FATURAS PARA EMPRESAS ====================
  
  /**
   * Busca todas as faturas para empresas com filtragem e paginação
   * @param {Object} options - Opções de filtragem e paginação
   * @returns {Object} Objeto contendo faturas e total
   */
  async findAllFaturasEmpresas({ page = 1, limit = 20, sortBy = 'data_fatura', sortOrder = 'desc', filters = {} }) {
    try {
      // Construir consulta base
      let query = db('kurochan.faturas_empresas as fe')
        .select(
          'fe.id',
          'fe.empresa_id',
          'fe.data_fatura',
          'fe.data_vencimento',
          'fe.valor_total',
          'fe.periodo_inicio',
          'fe.periodo_fim',
          'fe.status_pagamento',
          'fe.metodo_pagamento',
          'fe.numero_referencia',
          'fe.observacoes',
          'fe.data_criacao',
          'fe.data_atualizacao',
          'e.nome as empresa_nome',
          'e.nome_japones as empresa_nome_japones',
          db.raw('COUNT(fed.alocacao_id) as total_alocacoes')
        )
        .join('kurochan.empresas as e', 'fe.empresa_id', 'e.id')
        .leftJoin('kurochan.fatura_empresa_detalhes as fed', 'fe.id', 'fed.fatura_id')
        .groupBy(
          'fe.id',
          'fe.empresa_id',
          'fe.data_fatura',
          'fe.data_vencimento',
          'fe.valor_total',
          'fe.periodo_inicio',
          'fe.periodo_fim',
          'fe.status_pagamento',
          'fe.metodo_pagamento',
          'fe.numero_referencia',
          'fe.observacoes',
          'fe.data_criacao',
          'fe.data_atualizacao',
          'e.nome',
          'e.nome_japones'
        );
      
      // Aplicar filtros
      if (filters.empresaId) {
        query = query.where('fe.empresa_id', filters.empresaId);
      }
      
      if (filters.dataInicio) {
        query = query.where('fe.data_fatura', '>=', filters.dataInicio);
      }
      
      if (filters.dataFim) {
        query = query.where('fe.data_fatura', '<=', filters.dataFim);
      }
      
      if (filters.status) {
        query = query.where('fe.status_pagamento', filters.status);
      }
      
      // Contar total de registros para paginação
      // Precisamos clonar a consulta e simplificá-la para contagem
      const countQuery = db('kurochan.faturas_empresas as fe')
        .countDistinct('fe.id as total');
      
      // Aplicar os mesmos filtros à consulta de contagem
      if (filters.empresaId) {
        countQuery.where('fe.empresa_id', filters.empresaId);
      }
      
      if (filters.dataInicio) {
        countQuery.where('fe.data_fatura', '>=', filters.dataInicio);
      }
      
      if (filters.dataFim) {
        countQuery.where('fe.data_fatura', '<=', filters.dataFim);
      }
      
      if (filters.status) {
        countQuery.where('fe.status_pagamento', filters.status);
      }
      
      // Aplicar ordenação e paginação à consulta principal
      query = query
        .orderBy(`fe.${sortBy}`, sortOrder)
        .limit(limit)
        .offset((page - 1) * limit);
      
      // Executar consultas
      const [faturas, countResult] = await Promise.all([query, countQuery.first()]);
      
      return {
        faturas,
        total: parseInt(countResult.total, 10)
      };
      
    } catch (error) {
      console.error('Erro ao buscar faturas para empresas:', error);
      throw error;
    }
  }
  
  /**
   * Busca uma fatura para empresa pelo ID
   * @param {number} id - ID da fatura
   * @returns {Object|null} Fatura encontrada ou null
   */
  async findFaturaEmpresaById(id) {
    try {
      // Buscar dados da fatura
      const fatura = await db('kurochan.faturas_empresas as fe')
        .select(
          'fe.id',
          'fe.empresa_id',
          'fe.data_fatura',
          'fe.data_vencimento',
          'fe.valor_total',
          'fe.periodo_inicio',
          'fe.periodo_fim',
          'fe.status_pagamento',
          'fe.metodo_pagamento',
          'fe.numero_referencia',
          'fe.observacoes',
          'fe.data_criacao',
          'fe.data_atualizacao',
          'e.nome as empresa_nome',
          'e.nome_japones as empresa_nome_japones',
          'e.endereco as empresa_endereco',
          'e.contato_nome as empresa_contato_nome',
          'e.contato_telefone as empresa_contato_telefone',
          'e.contato_email as empresa_contato_email'
        )
        .join('kurochan.empresas as e', 'fe.empresa_id', 'e.id')
        .where('fe.id', id)
        .first();
      
      if (!fatura) {
        return null;
      }
      
      // Buscar detalhes das alocações desta fatura
      const alocacoes = await db('kurochan.fatura_empresa_detalhes as fed')
        .select(
          'fed.alocacao_id',
          'fed.valor',
          'a.data_alocacao',
          'a.local_servico',
          'a.descricao_servico',
          'f.id as funcionario_id',
          'f.nome as funcionario_nome',
          'f.nome_japones as funcionario_nome_japones'
        )
        .join('kurochan.alocacoes as a', 'fed.alocacao_id', 'a.id')
        .join('kurochan.funcionarios as f', 'a.funcionario_id', 'f.id')
        .where('fed.fatura_id', id);
      
      // Adicionar alocações ao objeto de fatura
      fatura.alocacoes = alocacoes;
      
      return fatura;
      
    } catch (error) {
      console.error(`Erro ao buscar fatura para empresa com ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Cria uma nova fatura para empresa
   * @param {Object} data - Dados da fatura
   * @returns {Object} Fatura criada
   */
  async createFaturaEmpresa(data) {
    try {
      // Iniciar transação
      return await db.transaction(async trx => {
        // Inserir a fatura
        const [faturaId] = await trx('kurochan.faturas_empresas')
          .insert({
            empresa_id: data.empresa_id,
            data_fatura: data.data_fatura,
            data_vencimento: data.data_vencimento,
            valor_total: data.valor_total,
            periodo_inicio: data.periodo_inicio,
            periodo_fim: data.periodo_fim,
            status_pagamento: data.status_pagamento || 'pendente',
            metodo_pagamento: data.metodo_pagamento,
            numero_referencia: data.numero_referencia,
            observacoes: data.observacoes
          })
          .returning('id');
        
        // Inserir os detalhes (alocações)
        if (data.alocacoes && data.alocacoes.length > 0) {
          const detalhes = data.alocacoes.map(alocacao => ({
            fatura_id: faturaId,
            alocacao_id: alocacao.alocacao_id,
            valor: alocacao.valor
          }));
          
          await trx('kurochan.fatura_empresa_detalhes').insert(detalhes);
          
          // Atualizar o status de pagamento nas alocações
          for (const alocacao of data.alocacoes) {
            await trx('kurochan.alocacoes')
              .where('id', alocacao.alocacao_id)
              .update({
                status_pagamento_empresa: data.status_pagamento === 'pago' ? 'pago' : 'pendente',
                data_atualizacao: trx.fn.now()
              });
          }
        }
        
        // Buscar a fatura com detalhes
        return this.findFaturaEmpresaById(faturaId);
      });
      
    } catch (error) {
      console.error('Erro ao criar fatura para empresa:', error);
      throw error;
    }
  }
  
  /**
   * Atualiza o status de uma fatura
   * @param {number} id - ID da fatura
   * @param {Object} data - Dados a serem atualizados
   * @returns {Object} Fatura atualizada
   */
  async updateFaturaStatus(id, data) {
    try {
      // Iniciar transação
      return await db.transaction(async trx => {
        // Dados para atualização
        const updateData = {
          status_pagamento: data.status_pagamento,
          data_atualizacao: trx.fn.now()
        };
        
        if (data.metodo_pagamento) {
          updateData.metodo_pagamento = data.metodo_pagamento;
        }
        
        if (data.numero_referencia) {
          updateData.numero_referencia = data.numero_referencia;
        }
        
        // Atualizar a fatura
        await trx('kurochan.faturas_empresas')
          .where('id', id)
          .update(updateData);
        
        // Se o status for "pago", atualizar as alocações
        if (data.status_pagamento === 'pago') {
          // Obter IDs de alocações associadas à fatura
          const detalhes = await trx('kurochan.fatura_empresa_detalhes')
            .select('alocacao_id')
            .where('fatura_id', id);
          
          // Atualizar o status de pagamento nas alocações
          for (const detalhe of detalhes) {
            await trx('kurochan.alocacoes')
              .where('id', detalhe.alocacao_id)
              .update({
                status_pagamento_empresa: 'pago',
                data_atualizacao: trx.fn.now()
              });
          }
        }
        
        // Buscar a fatura atualizada com detalhes
        return this.findFaturaEmpresaById(id);
      });
      
    } catch (error) {
      console.error(`Erro ao atualizar status da fatura com ID ${id}:`, error);
      throw error;
    }
  }
}

module.exports = new PagamentoModel();