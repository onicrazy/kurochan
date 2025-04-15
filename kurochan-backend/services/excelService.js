const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const i18next = require('i18next');

/**
 * Serviço para geração de arquivos Excel
 */
class ExcelService {
  /**
   * Cria um novo arquivo Excel
   * @param {Object} options - Opções do workbook
   * @returns {ExcelJS.Workbook} Workbook Excel
   */
  createWorkbook(options = {}) {
    const workbook = new ExcelJS.Workbook();
    
    // Configurar propriedades do workbook
    workbook.creator = options.creator || 'Sistema Kurochan';
    workbook.lastModifiedBy = options.lastModifiedBy || 'Sistema Kurochan';
    workbook.created = options.created || new Date();
    workbook.modified = options.modified || new Date();
    
    return workbook;
  }
  
  /**
   * Adiciona estilos comuns para cabeçalhos
   * @param {ExcelJS.Worksheet} worksheet - Planilha
   * @param {Array} headerRow - Linha de cabeçalho
   * @param {number} rowIndex - Índice da linha de cabeçalho
   */
  addHeaderStyle(worksheet, headerRow, rowIndex = 1) {
    // Estilo do cabeçalho
    const headerStyle = {
      font: {
        bold: true,
        color: { argb: 'FFFFFFFF' }
      },
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F81BD' }
      },
      alignment: {
        horizontal: 'center',
        vertical: 'middle'
      },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    };
    
    // Aplicar estilo a cada célula do cabeçalho
    for (let i = 1; i <= headerRow.length; i++) {
      const cell = worksheet.getCell(rowIndex, i);
      Object.assign(cell, headerStyle);
    }
  }
  
  /**
   * Formata a tabela com estilos alternados para linhas
   * @param {ExcelJS.Worksheet} worksheet - Planilha
   * @param {number} startRow - Linha inicial dos dados
   * @param {number} endRow - Linha final dos dados
   * @param {number} columnCount - Número de colunas
   */
  formatTable(worksheet, startRow, endRow, columnCount) {
    // Estilo para linhas pares
    const evenRowStyle = {
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF2F2F2' }
      }
    };
    
    // Bordas para todas as células
    const borderStyle = {
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    };
    
    // Aplicar estilos
    for (let row = startRow; row <= endRow; row++) {
      for (let col = 1; col <= columnCount; col++) {
        const cell = worksheet.getCell(row, col);
        
        // Aplicar bordas a todas as células
        Object.assign(cell, borderStyle);
        
        // Aplicar cor de fundo alternada
        if (row % 2 === 0) {
          Object.assign(cell, evenRowStyle);
        }
      }
    }
    
    // Ajustar largura das colunas
    for (let col = 1; col <= columnCount; col++) {
      worksheet.getColumn(col).width = 15;
    }
  }
  
  /**
   * Formata valores monetários
   * @param {ExcelJS.Cell} cell - Célula
   * @param {string} language - Idioma (ja ou pt-BR)
   */
  formatCurrencyCell(cell, language = 'pt-BR') {
    cell.numFmt = language === 'ja' ? '¥#,##0' : '¥ #,##0';
    cell.alignment = { horizontal: 'right' };
  }
  
  /**
   * Gera um relatório de alocações
   * @param {Array} alocacoes - Lista de alocações
   * @param {Object} options - Opções adicionais
   * @returns {Buffer} Buffer contendo o Excel gerado
   */
  async gerarRelatorioAlocacoes(alocacoes, options = {}) {
    const { language = 'pt-BR', titulo = '', filtros = {} } = options;
    const t = key => i18next.t(key, { lng: language });
    
    // Criar workbook
    const workbook = this.createWorkbook();
    
    // Adicionar planilha
    const worksheet = workbook.addWorksheet(t('reports.allocations'), {
      properties: { tabColor: { argb: 'FF4F81BD' } }
    });
    
    // Adicionar título
    worksheet.mergeCells('A1:I1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = titulo || t('reports.allocationReport');
    titleCell.font = {
      bold: true,
      size: 16
    };
    titleCell.alignment = {
      horizontal: 'center',
      vertical: 'middle'
    };
    
    // Adicionar filtros aplicados
    let currentRow = 2;
    if (Object.keys(filtros).length > 0) {
      worksheet.mergeCells(`A${currentRow}:I${currentRow}`);
      const filtrosCell = worksheet.getCell(`A${currentRow}`);
      
      let filtrosText = t('reports.appliedFilters') + ': ';
      
      if (filtros.dataInicio && filtros.dataFim) {
        filtrosText += `${t('reports.period')}: ${moment(filtros.dataInicio).format('L')} - ${moment(filtros.dataFim).format('L')}`;
      }
      
      if (filtros.funcionarioNome) {
        filtrosText += `, ${t('reports.employee')}: ${filtros.funcionarioNome}`;
      }
      
      if (filtros.empresaNome) {
        filtrosText += `, ${t('reports.company')}: ${filtros.empresaNome}`;
      }
      
      filtrosCell.value = filtrosText;
      filtrosCell.font = {
        italic: true,
        size: 10
      };
      
      currentRow++;
    }
    
    // Pular uma linha
    currentRow++;
    
    // Adicionar cabeçalhos
    const headers = [
      t('allocation.date'),
      t('allocation.employee'),
      t('allocation.company'),
      t('allocation.periodType'),
      t('allocation.employeePayment'),
      t('allocation.companyCharge'),
      t('allocation.serviceLocation'),
      t('allocation.employeePaymentStatus'),
      t('allocation.companyPaymentStatus')
    ];
    
    worksheet.getRow(currentRow).values = headers;
    this.addHeaderStyle(worksheet, headers, currentRow);
    
    // Adicionar dados
    const dataStartRow = currentRow + 1;
    
    alocacoes.forEach((alocacao, index) => {
      const rowIndex = dataStartRow + index;
      const row = worksheet.getRow(rowIndex);
      
      // Data
      row.getCell(1).value = moment(alocacao.data_alocacao).toDate();
      row.getCell(1).numFmt = language === 'ja' ? 'yyyy/mm/dd' : 'dd/mm/yyyy';
      
      // Funcionário
      row.getCell(2).value = alocacao.funcionario_nome;
      if (alocacao.funcionario_nome_japones) {
        row.getCell(2).value += ` / ${alocacao.funcionario_nome_japones}`;
      }
      
      // Empresa
      row.getCell(3).value = alocacao.empresa_nome;
      if (alocacao.empresa_nome_japones) {
        row.getCell(3).value += ` / ${alocacao.empresa_nome_japones}`;
      }
      
      // Tipo de período
      row.getCell(4).value = alocacao.tipo_periodo === 'integral' 
        ? t('allocation.fullDay') 
        : t('allocation.halfDay');
      
      // Valor pago ao funcionário
      row.getCell(5).value = parseFloat(alocacao.valor_pago_funcionario);
      this.formatCurrencyCell(row.getCell(5), language);
      
      // Valor cobrado da empresa
      row.getCell(6).value = parseFloat(alocacao.valor_cobrado_empresa);
      this.formatCurrencyCell(row.getCell(6), language);
      
      // Local do serviço
      row.getCell(7).value = alocacao.local_servico || '';
      
      // Status de pagamento do funcionário
      row.getCell(8).value = alocacao.status_pagamento_funcionario === 'pago' 
        ? t('allocation.paid') 
        : t('allocation.pending');
      
      // Status de pagamento da empresa
      row.getCell(9).value = alocacao.status_pagamento_empresa === 'pago' 
        ? t('allocation.paid') 
        : t('allocation.pending');
    });
    
    // Adicionar linha de totais
    const totalRow = dataStartRow + alocacoes.length;
    const totalRowIndex = totalRow + 1;
    
    worksheet.getCell(`A${totalRowIndex}`).value = t('common.total');
    worksheet.getCell(`A${totalRowIndex}`).font = { bold: true };
    
    // Mesclar células para rótulo "Total"
    worksheet.mergeCells(`A${totalRowIndex}:D${totalRowIndex}`);
    
    // Calcular e adicionar totais
    const totalPagoFuncionario = alocacoes.reduce((acc, alocacao) => 
      acc + parseFloat(alocacao.valor_pago_funcionario), 0);
    
    const totalCobradoEmpresa = alocacoes.reduce((acc, alocacao) => 
      acc + parseFloat(alocacao.valor_cobrado_empresa), 0);
    
    // Adicionar valores de totais
    worksheet.getCell(`E${totalRowIndex}`).value = totalPagoFuncionario;
    this.formatCurrencyCell(worksheet.getCell(`E${totalRowIndex}`), language);
    worksheet.getCell(`E${totalRowIndex}`).font = { bold: true };
    
    worksheet.getCell(`F${totalRowIndex}`).value = totalCobradoEmpresa;
    this.formatCurrencyCell(worksheet.getCell(`F${totalRowIndex}`), language);
    worksheet.getCell(`F${totalRowIndex}`).font = { bold: true };
    
    // Formatar tabela
    this.formatTable(worksheet, dataStartRow, totalRow, headers.length);
    
    // Congelar painéis (cabeçalho fixo)
    worksheet.views = [
      { state: 'frozen', xSplit: 0, ySplit: currentRow, activeCell: 'A1' }
    ];
    
    // Gerar buffer com o arquivo
    return await workbook.xlsx.writeBuffer();
  }
  
  /**
   * Gera um relatório financeiro
   * @param {Object} dados - Dados financeiros
   * @param {Object} options - Opções adicionais
   * @returns {Buffer} Buffer contendo o Excel gerado
   */
  async gerarRelatorioFinanceiro(dados, options = {}) {
    const { language = 'pt-BR', periodo = {} } = options;
    const t = key => i18next.t(key, { lng: language });
    
    // Criar workbook
    const workbook = this.createWorkbook();
    
    // Adicionar planilha de resumo
    const resumoSheet = workbook.addWorksheet(t('reports.summary'), {
      properties: { tabColor: { argb: 'FF4F81BD' } }
    });
    
    // Adicionar título
    resumoSheet.mergeCells('A1:D1');
    const titleCell = resumoSheet.getCell('A1');
    titleCell.value = t('reports.financialReport');
    titleCell.font = {
      bold: true,
      size: 16
    };
    titleCell.alignment = {
      horizontal: 'center',
      vertical: 'middle'
    };
    
    // Adicionar período do relatório
    if (periodo.inicio && periodo.fim) {
      resumoSheet.mergeCells('A2:D2');
      const periodoCell = resumoSheet.getCell('A2');
      periodoCell.value = `${t('reports.period')}: ${moment(periodo.inicio).format('L')} - ${moment(periodo.fim).format('L')}`;
      periodoCell.font = {
        italic: true,
        size: 10
      };
      periodoCell.alignment = {
        horizontal: 'center'
      };
    }
    
    // Adicionar resumo financeiro
    resumoSheet.getCell('A4').value = t('reports.monthlyRevenue');
    resumoSheet.getCell('B4').value = dados.receita || 0;
    this.formatCurrencyCell(resumoSheet.getCell('B4'), language);
    
    resumoSheet.getCell('A5').value = t('reports.monthlyExpenses');
    resumoSheet.getCell('B5').value = dados.despesa || 0;
    this.formatCurrencyCell(resumoSheet.getCell('B5'), language);
    
    resumoSheet.getCell('A6').value = t('reports.monthlyProfit');
    resumoSheet.getCell('B6').value = dados.lucro || 0;
    this.formatCurrencyCell(resumoSheet.getCell('B6'), language);
    
    // Estilizar células de resumo
    for (let row = 4; row <= 6; row++) {
      resumoSheet.getCell(`A${row}`).font = { bold: true };
      resumoSheet.getCell(`A${row}`).alignment = { horizontal: 'left' };
    }
    
    // Adicionar planilha de detalhes de receitas
    if (dados.receitas && dados.receitas.length > 0) {
      const receitasSheet = workbook.addWorksheet(t('reports.revenues'), {
        properties: { tabColor: { argb: 'FF92D050' } }
      });
      
      // Adicionar cabeçalhos
      const receitasHeaders = [
        t('allocation.date'),
        t('allocation.company'),
        t('allocation.employee'),
        t('allocation.serviceDescription'),
        t('common.amount')
      ];
      
      receitasSheet.getRow(1).values = receitasHeaders;
      this.addHeaderStyle(receitasSheet, receitasHeaders, 1);
      
      // Adicionar dados
      dados.receitas.forEach((receita, index) => {
        const rowIndex = 2 + index;
        const row = receitasSheet.getRow(rowIndex);
        
        row.getCell(1).value = moment(receita.data).toDate();
        row.getCell(1).numFmt = language === 'ja' ? 'yyyy/mm/dd' : 'dd/mm/yyyy';
        
        row.getCell(2).value = receita.empresa;
        row.getCell(3).value = receita.funcionario;
        row.getCell(4).value = receita.descricao || '';
        
        row.getCell(5).value = parseFloat(receita.valor);
        this.formatCurrencyCell(row.getCell(5), language);
      });
      
      // Adicionar linha de total
      const totalRowIndex = 2 + dados.receitas.length;
      receitasSheet.getCell(`A${totalRowIndex}`).value = t('common.total');
      receitasSheet.getCell(`A${totalRowIndex}`).font = { bold: true };
      
      // Mesclar células para rótulo "Total"
      receitasSheet.mergeCells(`A${totalRowIndex}:D${totalRowIndex}`);
      
      // Calcular e adicionar total
      const totalReceita = dados.receitas.reduce((acc, item) => acc + parseFloat(item.valor), 0);
      receitasSheet.getCell(`E${totalRowIndex}`).value = totalReceita;
      this.formatCurrencyCell(receitasSheet.getCell(`E${totalRowIndex}`), language);
      receitasSheet.getCell(`E${totalRowIndex}`).font = { bold: true };
      
      // Formatar tabela
      this.formatTable(receitasSheet, 2, totalRowIndex - 1, receitasHeaders.length);
      
      // Congelar painéis
      receitasSheet.views = [
        { state: 'frozen', xSplit: 0, ySplit: 1, activeCell: 'A2' }
      ];
    }
    
    // Adicionar planilha de detalhes de despesas
    if (dados.despesas && dados.despesas.length > 0) {
      const despesasSheet = workbook.addWorksheet(t('reports.expenses'), {
        properties: { tabColor: { argb: 'FFFF0000' } }
      });
      
      // Adicionar cabeçalhos
      const despesasHeaders = [
        t('allocation.date'),
        t('allocation.employee'),
        t('allocation.company'),
        t('allocation.serviceDescription'),
        t('common.amount')
      ];
      
      despesasSheet.getRow(1).values = despesasHeaders;
      this.addHeaderStyle(despesasSheet, despesasHeaders, 1);
      
      // Adicionar dados
      dados.despesas.forEach((despesa, index) => {
        const rowIndex = 2 + index;
        const row = despesasSheet.getRow(rowIndex);
        
        row.getCell(1).value = moment(despesa.data).toDate();
        row.getCell(1).numFmt = language === 'ja' ? 'yyyy/mm/dd' : 'dd/mm/yyyy';
        
        row.getCell(2).value = despesa.funcionario;
        row.getCell(3).value = despesa.empresa;
        row.getCell(4).value = despesa.descricao || '';
        
        row.getCell(5).value = parseFloat(despesa.valor);
        this.formatCurrencyCell(row.getCell(5), language);
      });
      
      // Adicionar linha de total
      const totalRowIndex = 2 + dados.despesas.length;
      despesasSheet.getCell(`A${totalRowIndex}`).value = t('common.total');
      despesasSheet.getCell(`A${totalRowIndex}`).font = { bold: true };
      
      // Mesclar células para rótulo "Total"
      despesasSheet.mergeCells(`A${totalRowIndex}:D${totalRowIndex}`);
      
      // Calcular e adicionar total
      const totalDespesa = dados.despesas.reduce((acc, item) => acc + parseFloat(item.valor), 0);
      despesasSheet.getCell(`E${totalRowIndex}`).value = totalDespesa;
      this.formatCurrencyCell(despesasSheet.getCell(`E${totalRowIndex}`), language);
      despesasSheet.getCell(`E${totalRowIndex}`).font = { bold: true };
      
      // Formatar tabela
      this.formatTable(despesasSheet, 2, totalRowIndex - 1, despesasHeaders.length);
      
      // Congelar painéis
      despesasSheet.views = [
        { state: 'frozen', xSplit: 0, ySplit: 1, activeCell: 'A2' }
      ];
    }
    
    // Gerar buffer com o arquivo
    return await workbook.xlsx.writeBuffer();
  }
  
  /**
   * Salva um buffer Excel em arquivo
   * @param {Buffer} buffer - Buffer do Excel
   * @param {string} filename - Nome do arquivo (opcional)
   * @param {string} directory - Diretório para salvar (opcional)
   * @returns {string} Caminho do arquivo salvo
   */
  saveExcelToFile(buffer, filename = null, directory = null) {
    const fileName = filename || `${uuidv4()}.xlsx`;
    const dirPath = directory || path.join(__dirname, '../temp');
    
    // Garantir que o diretório existe
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    const filePath = path.join(dirPath, fileName);
    fs.writeFileSync(filePath, buffer);
    
    return filePath;
  }
}

module.exports = new ExcelService();