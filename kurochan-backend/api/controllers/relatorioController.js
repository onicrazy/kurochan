const moment = require('moment');
const db = require('../../config/database');
const pdfService = require('../../services/pdfService');
const excelService = require('../../services/excelService');
const { AppError } = require('../middlewares/errorMiddleware');

/**
 * Controlador para geração de relatórios
 */
class RelatorioController {
  /**
   * Gera um resumo financeiro para o dashboard
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async resumoFinanceiro(req, res, next) {
    try {
      const mesAtual = moment().format('YYYY-MM');
      const mesAnterior = moment().subtract(1, 'month').format('YYYY-MM');
      
      // Receita do mês atual (valor cobrado de empresas)
      const receitaMesAtualQuery = db('kurochan.alocacoes')
        .sum('valor_cobrado_empresa as total')
        .whereRaw('TO_CHAR(data_alocacao, \'YYYY-MM\') = ?', [mesAtual])
        .first();
      
      // Receita do mês anterior
      const receitaMesAnteriorQuery = db('kurochan.alocacoes')
        .sum('valor_cobrado_empresa as total')
        .whereRaw('TO_CHAR(data_alocacao, \'YYYY-MM\') = ?', [mesAnterior])
        .first();
      
      // Despesa do mês atual (valor pago a funcionários)
      const despesaMesAtualQuery = db('kurochan.alocacoes')
        .sum('valor_pago_funcionario as total')
        .whereRaw('TO_CHAR(data_alocacao, \'YYYY-MM\') = ?', [mesAtual])
        .first();
      
      // Despesa do mês anterior
      const despesaMesAnteriorQuery = db('kurochan.alocacoes')
        .sum('valor_pago_funcionario as total')
        .whereRaw('TO_CHAR(data_alocacao, \'YYYY-MM\') = ?', [mesAnterior])
        .first();
      
      // Executar consultas em paralelo
      const [
        receitaMesAtual,
        receitaMesAnterior,
        despesaMesAtual,
        despesaMesAnterior
      ] = await Promise.all([
        receitaMesAtualQuery,
        receitaMesAnteriorQuery,
        despesaMesAtualQuery,
        despesaMesAnteriorQuery
      ]);
      
      // Calcular valores e variações
      const receita_mes = parseFloat(receitaMesAtual.total || 0);
      const receita_mes_anterior = parseFloat(receitaMesAnterior.total || 0);
      
      const despesa_mes = parseFloat(despesaMesAtual.total || 0);
      const despesa_mes_anterior = parseFloat(despesaMesAnteriorQuery.total || 0);
      
      const lucro_mes = receita_mes - despesa_mes;
      const lucro_mes_anterior = receita_mes_anterior - despesa_mes_anterior;
      
      // Calcular variações percentuais
      let variacao_receita = 0;
      if (receita_mes_anterior > 0) {
        variacao_receita = ((receita_mes - receita_mes_anterior) / receita_mes_anterior) * 100;
      }
      
      let variacao_despesa = 0;
      if (despesa_mes_anterior > 0) {
        variacao_despesa = ((despesa_mes - despesa_mes_anterior) / despesa_mes_anterior) * 100;
      }
      
      let variacao_lucro = 0;
      if (lucro_mes_anterior > 0) {
        variacao_lucro = ((lucro_mes - lucro_mes_anterior) / lucro_mes_anterior) * 100;
      }
      
      // Retornar resultado
      return res.json({
        data: {
          receita_mes,
          receita_mes_anterior,
          variacao_receita,
          despesa_mes,
          despesa_mes_anterior,
          variacao_despesa,
          lucro_mes,
          lucro_mes_anterior,
          variacao_lucro
        }
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Gera estatísticas mensais para o dashboard
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async estatisticasMensais(req, res, next) {
    try {
      const mesesAtras = 6; // Últimos 6 meses
      const meses = [];
      const receitas = [];
      const despesas = [];
      const lucros = [];
      
      // Gerar array com os últimos meses
      for (let i = mesesAtras - 1; i >= 0; i--) {
        const mes = moment().subtract(i, 'months');
        meses.push(mes.format('MMM/YYYY'));
        
        // Consulta de receita do mês
        const receitaMes = await db('kurochan.alocacoes')
          .sum('valor_cobrado_empresa as total')
          .whereRaw('TO_CHAR(data_alocacao, \'YYYY-MM\') = ?', [mes.format('YYYY-MM')])
          .first();
        
        // Consulta de despesa do mês
        const despesaMes = await db('kurochan.alocacoes')
          .sum('valor_pago_funcionario as total')
          .whereRaw('TO_CHAR(data_alocacao, \'YYYY-MM\') = ?', [mes.format('YYYY-MM')])
          .first();
        
        // Adicionar valores aos arrays
        const receitaValor = parseFloat(receitaMes.total || 0);
        const despesaValor = parseFloat(despesaMes.total || 0);
        
        receitas.push(receitaValor);
        despesas.push(despesaValor);
        lucros.push(receitaValor - despesaValor);
      }
      
      // Consulta de alocações por empresa
      const empresaQuery = db('kurochan.alocacoes as a')
        .select(
          'e.id',
          'e.nome',
          db.raw('COUNT(a.id) as total_alocacoes'),
          db.raw('SUM(a.valor_cobrado_empresa) as total_valor')
        )
        .join('kurochan.empresas as e', 'a.empresa_id', 'e.id')
        .whereRaw('TO_CHAR(a.data_alocacao, \'YYYY-MM\') = ?', [moment().format('YYYY-MM')])
        .groupBy('e.id', 'e.nome')
        .orderBy('total_alocacoes', 'desc')
        .limit(10);
      
      // Executar consulta
      const empresas = await empresaQuery;
      
      // Retornar resultado
      return res.json({
        data: {
          meses,
          receitas,
          despesas,
          lucros,
          empresas
        }
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Gera um relatório de alocações
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async relatorioAlocacoes(req, res, next) {
    try {
      const { 
        dataInicio, 
        dataFim, 
        funcionarioId, 
        empresaId,
        formato = 'json'
      } = req.query;
      
      // Validar datas
      if (!dataInicio || !dataFim) {
        throw new AppError(req.t('reports.error.invalidDates'), 400);
      }
      
      // Validar que a data final não é anterior à data inicial
      if (moment(dataFim).isBefore(moment(dataInicio))) {
        throw new AppError(req.t('reports.error.endDateBeforeStartDate'), 400);
      }
      
      // Construir consulta
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
        .orderBy('a.data_alocacao', 'asc');
      
      // Aplicar filtros adicionais se fornecidos
      if (funcionarioId) {
        query = query.where('a.funcionario_id', funcionarioId);
      }
      
      if (empresaId) {
        query = query.where('a.empresa_id', empresaId);
      }
      
      // Executar consulta
      const alocacoes = await query;
      
      // Buscar informações adicionais para o relatório
      let funcionarioNome = null;
      let empresaNome = null;
      
      if (funcionarioId) {
        const funcionario = await db('kurochan.funcionarios')
          .select('nome', 'nome_japones')
          .where('id', funcionarioId)
          .first();
        
        funcionarioNome = funcionario ? 
          (funcionario.nome_japones ? `${funcionario.nome} / ${funcionario.nome_japones}` : funcionario.nome) : 
          null;
      }
      
      if (empresaId) {
        const empresa = await db('kurochan.empresas')
          .select('nome', 'nome_japones')
          .where('id', empresaId)
          .first();
        
        empresaNome = empresa ? 
          (empresa.nome_japones ? `${empresa.nome} / ${empresa.nome_japones}` : empresa.nome) : 
          null;
      }
      
      // Preparar filtros para o título do relatório
      const filtros = {
        dataInicio,
        dataFim,
        funcionarioNome,
        empresaNome
      };
      
      // Gerar título do relatório
      let titulo = req.t('reports.allocationReport');
      
      if (funcionarioNome) {
        titulo += ` - ${funcionarioNome}`;
      }
      
      if (empresaNome) {
        titulo += ` - ${empresaNome}`;
      }
      
      // Opções do relatório
      const options = {
        language: req.language || 'pt-BR',
        titulo,
        filtros
      };
      
      // Retornar no formato solicitado
      if (formato === 'pdf') {
        // Gerar PDF
        const buffer = await pdfService.gerarRelatorioAlocacoes(alocacoes, options);
        
        // Enviar arquivo
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="relatorio_alocacoes_${moment().format('YYYYMMDD')}.pdf"`);
        
        return res.end(buffer);
        
      } else if (formato === 'excel') {
        // Gerar Excel
        const buffer = await excelService.gerarRelatorioAlocacoes(alocacoes, options);
        
        // Enviar arquivo
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="relatorio_alocacoes_${moment().format('YYYYMMDD')}.xlsx"`);
        
        return res.end(buffer);
        
      } else {
        // Retornar JSON
        return res.json({
          data: {
            alocacoes,
            filtros,
            total: alocacoes.length,
            valorTotalPagoFuncionarios: alocacoes.reduce((acc, a) => acc + parseFloat(a.valor_pago_funcionario), 0),
            valorTotalCobradoEmpresas: alocacoes.reduce((acc, a) => acc + parseFloat(a.valor_cobrado_empresa), 0)
          }
        });
      }
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Gera um relatório financeiro
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async relatorioFinanceiro(req, res, next) {
    try {
      const { 
        dataInicio, 
        dataFim, 
        formato = 'json'
      } = req.query;
      
      // Validar datas
      if (!dataInicio || !dataFim) {
        throw new AppError(req.t('reports.error.invalidDates'), 400);
      }
      
      // Validar que a data final não é anterior à data inicial
      if (moment(dataFim).isBefore(moment(dataInicio))) {
        throw new AppError(req.t('reports.error.endDateBeforeStartDate'), 400);
      }
      
      // Buscar dados de receitas (valor cobrado das empresas)
      const receitasQuery = db('kurochan.alocacoes as a')
        .select(
          'a.id',
          'a.data_alocacao as data',
          'e.nome as empresa',
          'f.nome as funcionario',
          'a.descricao_servico as descricao',
          'a.valor_cobrado_empresa as valor'
        )
        .join('kurochan.empresas as e', 'a.empresa_id', 'e.id')
        .join('kurochan.funcionarios as f', 'a.funcionario_id', 'f.id')
        .whereBetween('a.data_alocacao', [dataInicio, dataFim])
        .orderBy('a.data_alocacao', 'asc');
      
      // Buscar dados de despesas (valor pago aos funcionários)
      const despesasQuery = db('kurochan.alocacoes as a')
        .select(
          'a.id',
          'a.data_alocacao as data',
          'f.nome as funcionario',
          'e.nome as empresa',
          'a.descricao_servico as descricao',
          'a.valor_pago_funcionario as valor'
        )
        .join('kurochan.funcionarios as f', 'a.funcionario_id', 'f.id')
        .join('kurochan.empresas as e', 'a.empresa_id', 'e.id')
        .whereBetween('a.data_alocacao', [dataInicio, dataFim])
        .orderBy('a.data_alocacao', 'asc');
      
      // Executar consultas em paralelo
      const [receitas, despesas] = await Promise.all([receitasQuery, despesasQuery]);
      
      // Calcular totais
      const totalReceitas = receitas.reduce((acc, item) => acc + parseFloat(item.valor), 0);
      const totalDespesas = despesas.reduce((acc, item) => acc + parseFloat(item.valor), 0);
      const lucro = totalReceitas - totalDespesas;
      
      // Estruturar dados para o relatório
      const dados = {
        receita: totalReceitas,
        despesa: totalDespesas,
        lucro,
        receitas,
        despesas
      };
      
      // Opções do relatório
      const options = {
        language: req.language || 'pt-BR',
        periodo: {
          inicio: dataInicio,
          fim: dataFim
        }
      };
      
      // Retornar no formato solicitado
      if (formato === 'pdf') {
        // Gerar PDF
        const buffer = await pdfService.gerarRelatorioFinanceiro(dados, options);
        
        // Enviar arquivo
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="relatorio_financeiro_${moment().format('YYYYMMDD')}.pdf"`);
        
        return res.end(buffer);
        
      } else if (formato === 'excel') {
        // Gerar Excel
        const buffer = await excelService.gerarRelatorioFinanceiro(dados, options);
        
        // Enviar arquivo
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="relatorio_financeiro_${moment().format('YYYYMMDD')}.xlsx"`);
        
        return res.end(buffer);
        
      } else {
        // Retornar JSON
        return res.json({
          data: {
            periodo: {
              inicio: dataInicio,
              fim: dataFim
            },
            ...dados
          }
        });
      }
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Gera um relatório de produtividade de funcionários
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async relatorioProdutividadeFuncionarios(req, res, next) {
    try {
      const { 
        dataInicio, 
        dataFim, 
        formato = 'json'
      } = req.query;
      
      // Validar datas
      if (!dataInicio || !dataFim) {
        throw new AppError(req.t('reports.error.invalidDates'), 400);
      }
      
      // Validar que a data final não é anterior à data inicial
      if (moment(dataFim).isBefore(moment(dataInicio))) {
        throw new AppError(req.t('reports.error.endDateBeforeStartDate'), 400);
      }
      
      // Buscar dados de produtividade por funcionário
      const funcionariosQuery = db('kurochan.alocacoes as a')
        .select(
          'f.id',
          'f.nome',
          'f.nome_japones',
          'f.cargo',
          db.raw('COUNT(a.id) as total_alocacoes'),
          db.raw('SUM(a.valor_pago_funcionario) as total_recebido'),
          db.raw('SUM(a.valor_cobrado_empresa) as total_gerado'),
          db.raw('SUM(a.valor_cobrado_empresa - a.valor_pago_funcionario) as total_lucro')
        )
        .join('kurochan.funcionarios as f', 'a.funcionario_id', 'f.id')
        .whereBetween('a.data_alocacao', [dataInicio, dataFim])
        .groupBy('f.id', 'f.nome', 'f.nome_japones', 'f.cargo')
        .orderBy('total_alocacoes', 'desc');
      
      // Buscar alocações por dia para cada funcionário
      const alocacoesDiarias = db('kurochan.alocacoes as a')
        .select(
          'f.id as funcionario_id',
          'f.nome as funcionario_nome',
          'a.data_alocacao',
          db.raw('COUNT(a.id) as total_alocacoes'),
          db.raw('SUM(a.valor_pago_funcionario) as total_valor')
        )
        .join('kurochan.funcionarios as f', 'a.funcionario_id', 'f.id')
        .whereBetween('a.data_alocacao', [dataInicio, dataFim])
        .groupBy('f.id', 'f.nome', 'a.data_alocacao')
        .orderBy(['f.id', 'a.data_alocacao']);
      
      // Executar consultas em paralelo
      const [funcionarios, alocacoesPorDia] = await Promise.all([funcionariosQuery, alocacoesDiarias]);
      
      // Estruturar dados para o relatório
      const dados = {
        funcionarios,
        alocacoesPorDia,
        total: {
          funcionarios: funcionarios.length,
          alocacoes: funcionarios.reduce((acc, f) => acc + parseInt(f.total_alocacoes), 0),
          valorPago: funcionarios.reduce((acc, f) => acc + parseFloat(f.total_recebido), 0),
          valorGerado: funcionarios.reduce((acc, f) => acc + parseFloat(f.total_gerado), 0),
          lucro: funcionarios.reduce((acc, f) => acc + parseFloat(f.total_lucro), 0)
        }
      };
      
      // Opções do relatório
      const options = {
        language: req.language || 'pt-BR',
        periodo: {
          inicio: dataInicio,
          fim: dataFim
        },
        titulo: req.t('reports.employeeProductivityReport')
      };
      
      // Retornar dados no formato solicitado
      if (formato === 'json') {
        return res.json({
          data: {
            periodo: {
              inicio: dataInicio,
              fim: dataFim
            },
            ...dados
          }
        });
      } else {
        // Implementar geração de PDF/Excel conforme necessário
        throw new AppError(req.t('reports.error.formatNotImplemented'), 400);
      }
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Gera um recibo de pagamento para funcionário
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async gerarReciboPagamento(req, res, next) {
    try {
      const { id } = req.params;
      
      // Buscar dados do pagamento
      const pagamento = await db('kurochan.pagamentos_funcionarios')
        .where('id', id)
        .first();
      
      if (!pagamento) {
        throw new AppError(req.t('payments.error.notFound'), 404);
      }
      
      // Buscar funcionário
      const funcionario = await db('kurochan.funcionarios')
        .where('id', pagamento.funcionario_id)
        .first();
      
      if (!funcionario) {
        throw new AppError(req.t('employees.error.notFound'), 404);
      }
      
      // Buscar alocações relacionadas a este pagamento
      const alocacoes = await db('kurochan.pagamento_funcionario_detalhes as pfd')
        .select(
          'a.id',
          'a.data_alocacao',
          'a.tipo_periodo',
          'pfd.valor',
          'e.nome as empresa_nome',
          'e.nome_japones as empresa_nome_japones'
        )
        .join('kurochan.alocacoes as a', 'pfd.alocacao_id', 'a.id')
        .join('kurochan.empresas as e', 'a.empresa_id', 'e.id')
        .where('pfd.pagamento_id', id)
        .orderBy('a.data_alocacao');
      
      // Gerar PDF do recibo
      const buffer = await pdfService.gerarReciboPagamentoFuncionario(
        pagamento,
        funcionario,
        alocacoes,
        { language: req.language || 'pt-BR' }
      );
      
      // Enviar arquivo
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="recibo_pagamento_${id}.pdf"`);
      
      return res.end(buffer);
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Gera uma fatura para empresa
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função next do Express
   */
  async gerarFaturaEmpresa(req, res, next) {
    try {
      const { id } = req.params;
      
      // Buscar dados da fatura
      const fatura = await db('kurochan.faturas_empresas')
        .where('id', id)
        .first();
      
      if (!fatura) {
        throw new AppError(req.t('payments.error.notFound'), 404);
      }
      
      // Buscar empresa
      const empresa = await db('kurochan.empresas')
        .where('id', fatura.empresa_id)
        .first();
      
      if (!empresa) {
        throw new AppError(req.t('companies.error.notFound'), 404);
      }
      
      // Buscar alocações relacionadas a esta fatura
      const alocacoes = await db('kurochan.fatura_empresa_detalhes as fed')
        .select(
          'a.id',
          'a.data_alocacao',
          'fed.valor',
          'f.nome as funcionario_nome',
          'f.nome_japones as funcionario_nome_japones',
          'a.descricao_servico',
          'a.local_servico'
        )
        .join('kurochan.alocacoes as a', 'fed.alocacao_id', 'a.id')
        .join('kurochan.funcionarios as f', 'a.funcionario_id', 'f.id')
        .where('fed.fatura_id', id)
        .orderBy('a.data_alocacao');
      
      // Gerar PDF da fatura
      const buffer = await pdfService.gerarFaturaEmpresa(
        fatura,
        empresa,
        alocacoes,
        { language: req.language || 'pt-BR' }
      );
      
      // Enviar arquivo
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="fatura_${id}.pdf"`);
      
      return res.end(buffer);
      
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RelatorioController();