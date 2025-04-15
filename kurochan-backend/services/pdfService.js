const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const i18next = require('i18next');

/**
 * Serviço para geração de documentos PDF
 */
class PDFService {
  /**
   * Configura um novo documento PDF
   * @param {Object} options - Opções do documento
   * @returns {PDFDocument} Documento PDF configurado
   */
  createDocument(options = {}) {
    const {
      size = 'A4',
      margins = { top: 50, bottom: 50, left: 50, right: 50 },
      info = {}
    } = options;
    
    // Criar documento PDF
    const doc = new PDFDocument({
      size,
      margins,
      info: {
        Title: info.title || 'Relatório Kurochan',
        Author: info.author || 'Sistema Kurochan',
        Subject: info.subject || 'Relatório',
        Keywords: info.keywords || 'kurochan, relatório',
        CreationDate: new Date(),
        ...info
      }
    });
    
    return doc;
  }
  
  /**
   * Adiciona o cabeçalho padrão ao documento
   * @param {PDFDocument} doc - Documento PDF
   * @param {Object} options - Opções do cabeçalho
   */
  addHeader(doc, options = {}) {
    const {
      title,
      subtitle,
      logoPath,
      language = 'pt-BR'
    } = options;
    
    // Definir idioma para formatação de datas
    moment.locale(language === 'ja' ? 'ja' : 'pt-br');
    
    // Adicionar logo se existir
    if (logoPath && fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 45, { width: 50 });
      doc.moveDown();
    }
    
    // Adicionar título
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text(title || 'Relatório Kurochan', { align: 'center' });
    
    // Adicionar subtítulo se fornecido
    if (subtitle) {
      doc.fontSize(14)
         .font('Helvetica')
         .text(subtitle, { align: 'center' });
    }
    
    // Adicionar data atual
    doc.fontSize(10)
       .font('Helvetica')
       .text(moment().format('L LT'), { align: 'right' });
    
    // Adicionar linha separadora
    doc.moveDown()
       .strokeColor('#aaaaaa')
       .lineWidth(1)
       .moveTo(50, doc.y)
       .lineTo(doc.page.width - 50, doc.y)
       .stroke();
    
    doc.moveDown();
  }
  
  /**
   * Adiciona o rodapé padrão ao documento
   * @param {PDFDocument} doc - Documento PDF
   * @param {Object} options - Opções do rodapé
   */
  addFooter(doc, options = {}) {
    const {
      pageNumber,
      totalPages,
      language = 'pt-BR'
    } = options;
    
    const y = doc.page.height - 50;
    
    // Adicionar linha separadora
    doc.strokeColor('#aaaaaa')
       .lineWidth(1)
       .moveTo(50, y)
       .lineTo(doc.page.width - 50, y)
       .stroke();
    
    // Adicionar número da página
    const pageText = language === 'ja' 
      ? `ページ ${pageNumber} / ${totalPages}`
      : `Página ${pageNumber} de ${totalPages}`;
    
    doc.fontSize(8)
       .font('Helvetica')
       .text(
         pageText,
         50,
         y + 10,
         { align: 'center', width: doc.page.width - 100 }
       );
    
    // Adicionar texto de rodapé
    const footerText = language === 'ja'
      ? '© Kurochan システム'
      : '© Sistema Kurochan';
    
    doc.fontSize(8)
       .text(
         footerText,
         50,
         y + 20,
         { align: 'center', width: doc.page.width - 100 }
       );
  }
  
  /**
   * Gera um recibo de pagamento para funcionário
   * @param {Object} pagamento - Dados do pagamento
   * @param {Object} funcionario - Dados do funcionário
   * @param {Array} alocacoes - Lista de alocações incluídas no pagamento
   * @param {Object} options - Opções adicionais
   * @returns {Buffer} Buffer contendo o PDF gerado
   */
  async gerarReciboPagamentoFuncionario(pagamento, funcionario, alocacoes, options = {}) {
    const { language = 'pt-BR' } = options;
    const t = key => i18next.t(key, { lng: language });
    
    // Configurar documento
    const doc = this.createDocument({
      info: {
        Title: t('pdf.receipt.title'),
        Subject: t('pdf.receipt.subject')
      }
    });
    
    // Buffer para armazenar o PDF
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    
    // Adicionar cabeçalho
    this.addHeader(doc, {
      title: t('pdf.receipt.title'),
      subtitle: t('pdf.receipt.subtitle'),
      language
    });
    
    // Informações do funcionário
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text(t('pdf.receipt.employeeInfo'), { underline: true });
    
    doc.fontSize(10)
       .font('Helvetica')
       .text(`${t('pdf.receipt.name')}: ${funcionario.nome}`)
       .text(`${t('pdf.receipt.position')}: ${funcionario.cargo}`)
       .text(`${t('pdf.receipt.document')}: ${funcionario.documento || '-'}`)
       .moveDown();
    
    // Informações do pagamento
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text(t('pdf.receipt.paymentInfo'), { underline: true });
    
    doc.fontSize(10)
       .font('Helvetica')
       .text(`${t('pdf.receipt.paymentDate')}: ${moment(pagamento.data_pagamento).format('L')}`)
       .text(`${t('pdf.receipt.periodStart')}: ${moment(pagamento.periodo_inicio).format('L')}`)
       .text(`${t('pdf.receipt.periodEnd')}: ${moment(pagamento.periodo_fim).format('L')}`)
       .text(`${t('pdf.receipt.paymentMethod')}: ${pagamento.metodo_pagamento || '-'}`)
       .text(`${t('pdf.receipt.referenceNumber')}: ${pagamento.numero_referencia || '-'}`)
       .moveDown();
    
    // Tabela de alocações
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text(t('pdf.receipt.allocations'), { underline: true });
    
    // Cabeçalho da tabela
    const tableTop = doc.y + 10;
    const tableColumnWidth = (doc.page.width - 100) / 4;
    
    doc.fontSize(10)
       .font('Helvetica-Bold');
    
    doc.text(t('pdf.receipt.date'), 50, tableTop);
    doc.text(t('pdf.receipt.company'), 50 + tableColumnWidth, tableTop);
    doc.text(t('pdf.receipt.periodType'), 50 + tableColumnWidth * 2, tableTop);
    doc.text(t('pdf.receipt.amount'), 50 + tableColumnWidth * 3, tableTop, { width: tableColumnWidth, align: 'right' });
    
    // Linha separadora do cabeçalho
    doc.moveDown(0.5);
    const separatorY = doc.y;
    doc.strokeColor('#aaaaaa')
       .lineWidth(1)
       .moveTo(50, separatorY)
       .lineTo(doc.page.width - 50, separatorY)
       .stroke();
    
    // Conteúdo da tabela
    doc.font('Helvetica');
    let totalY = separatorY + 15;
    
    alocacoes.forEach((alocacao, index) => {
      // Verificar se é necessário adicionar uma nova página
      if (totalY > doc.page.height - 150) {
        doc.addPage();
        totalY = 50;
      }
      
      // Alternar cores de fundo para facilitar a leitura
      if (index % 2 === 0) {
        doc.rect(50, totalY - 5, doc.page.width - 100, 20).fill('#f5f5f5');
      }
      
      doc.fillColor('#000000');
      
      const dataFormatada = moment(alocacao.data_alocacao).format('L');
      const tipoPeriodo = alocacao.tipo_periodo === 'integral' 
        ? t('pdf.receipt.fullPeriod') 
        : t('pdf.receipt.halfPeriod');
      const valorFormatado = language === 'ja'
        ? `¥${alocacao.valor.toLocaleString('ja-JP')}`
        : `¥ ${alocacao.valor.toLocaleString('pt-BR')}`;
      
      doc.text(dataFormatada, 50, totalY);
      doc.text(alocacao.empresa_nome, 50 + tableColumnWidth, totalY);
      doc.text(tipoPeriodo, 50 + tableColumnWidth * 2, totalY);
      doc.text(valorFormatado, 50 + tableColumnWidth * 3, totalY, { width: tableColumnWidth, align: 'right' });
      
      totalY += 20;
    });
    
    // Linha separadora final
    doc.strokeColor('#aaaaaa')
       .lineWidth(1)
       .moveTo(50, totalY)
       .lineTo(doc.page.width - 50, totalY)
       .stroke();
    
    // Total
    totalY += 15;
    doc.font('Helvetica-Bold')
       .text(t('pdf.receipt.total'), 50 + tableColumnWidth * 2, totalY);
    
    const totalFormatado = language === 'ja'
      ? `¥${pagamento.valor_total.toLocaleString('ja-JP')}`
      : `¥ ${pagamento.valor_total.toLocaleString('pt-BR')}`;
    
    doc.text(totalFormatado, 50 + tableColumnWidth * 3, totalY, { width: tableColumnWidth, align: 'right' });
    
    // Observações
    if (pagamento.observacoes) {
      doc.moveDown(2)
         .fontSize(12)
         .font('Helvetica-Bold')
         .text(t('pdf.receipt.observations'), { underline: true });
      
      doc.fontSize(10)
         .font('Helvetica')
         .text(pagamento.observacoes);
    }
    
    // Assinaturas
    doc.moveDown(2);
    const assinaturaY = doc.y + 30;
    const assinaturaWidth = (doc.page.width - 150) / 2;
    
    // Linha para assinatura do funcionário
    doc.strokeColor('#000000')
       .moveTo(75, assinaturaY)
       .lineTo(75 + assinaturaWidth, assinaturaY)
       .stroke();
    
    // Linha para assinatura da empresa
    doc.moveTo(75 + assinaturaWidth + 50, assinaturaY)
       .lineTo(75 + assinaturaWidth * 2 + 50, assinaturaY)
       .stroke();
    
    // Texto das assinaturas
    doc.fontSize(8)
       .text(t('pdf.receipt.employeeSignature'), 75, assinaturaY + 5, { width: assinaturaWidth, align: 'center' })
       .text(t('pdf.receipt.companySignature'), 75 + assinaturaWidth + 50, assinaturaY + 5, { width: assinaturaWidth, align: 'center' });
    
    // Adicionar rodapé com número de página
    this.addFooter(doc, {
      pageNumber: 1,
      totalPages: 1,
      language
    });
    
    // Finalizar documento
    doc.end();
    
    // Converter chunks em Buffer
    return new Promise((resolve) => {
      doc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(buffer);
      });
    });
  }
  
  /**
   * Gera uma fatura para empresa
   * @param {Object} fatura - Dados da fatura
   * @param {Object} empresa - Dados da empresa
   * @param {Array} alocacoes - Lista de alocações incluídas na fatura
   * @param {Object} options - Opções adicionais
   * @returns {Buffer} Buffer contendo o PDF gerado
   */
  async gerarFaturaEmpresa(fatura, empresa, alocacoes, options = {}) {
    const { language = 'pt-BR' } = options;
    const t = key => i18next.t(key, { lng: language });
    
    // Configurar documento
    const doc = this.createDocument({
      info: {
        Title: t('pdf.invoice.title'),
        Subject: t('pdf.invoice.subject')
      }
    });
    
    // Buffer para armazenar o PDF
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    
    // Adicionar cabeçalho
    this.addHeader(doc, {
      title: t('pdf.invoice.title'),
      subtitle: t('pdf.invoice.subtitle'),
      language
    });
    
    // Número da fatura
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text(`${t('pdf.invoice.invoiceNumber')}: ${fatura.id}`, { align: 'right' })
       .moveDown();
    
    // Informações da empresa
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text(t('pdf.invoice.companyInfo'), { underline: true });
    
    doc.fontSize(10)
       .font('Helvetica')
       .text(`${t('pdf.invoice.name')}: ${empresa.nome}${empresa.nome_japones ? ` / ${empresa.nome_japones}` : ''}`)
       .text(`${t('pdf.invoice.address')}: ${empresa.endereco || '-'}`)
       .text(`${t('pdf.invoice.contact')}: ${empresa.contato_nome || '-'}`)
       .text(`${t('pdf.invoice.phone')}: ${empresa.contato_telefone || '-'}`)
       .text(`${t('pdf.invoice.email')}: ${empresa.contato_email || '-'}`)
       .moveDown();
    
    // Informações da fatura
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text(t('pdf.invoice.invoiceInfo'), { underline: true });
    
    doc.fontSize(10)
       .font('Helvetica')
       .text(`${t('pdf.invoice.invoiceDate')}: ${moment(fatura.data_fatura).format('L')}`)
       .text(`${t('pdf.invoice.dueDate')}: ${moment(fatura.data_vencimento).format('L')}`)
       .text(`${t('pdf.invoice.periodStart')}: ${moment(fatura.periodo_inicio).format('L')}`)
       .text(`${t('pdf.invoice.periodEnd')}: ${moment(fatura.periodo_fim).format('L')}`)
       .moveDown();
    
    // Tabela de alocações
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text(t('pdf.invoice.services'), { underline: true });
    
    // Cabeçalho da tabela
    const tableTop = doc.y + 10;
    const tableColumnWidth = (doc.page.width - 100) / 5;
    
    doc.fontSize(10)
       .font('Helvetica-Bold');
    
    doc.text(t('pdf.invoice.date'), 50, tableTop);
    doc.text(t('pdf.invoice.employee'), 50 + tableColumnWidth, tableTop);
    doc.text(t('pdf.invoice.service'), 50 + tableColumnWidth * 2, tableTop);
    doc.text(t('pdf.invoice.location'), 50 + tableColumnWidth * 3, tableTop);
    doc.text(t('pdf.invoice.amount'), 50 + tableColumnWidth * 4, tableTop, { width: tableColumnWidth, align: 'right' });
    
    // Linha separadora do cabeçalho
    doc.moveDown(0.5);
    const separatorY = doc.y;
    doc.strokeColor('#aaaaaa')
       .lineWidth(1)
       .moveTo(50, separatorY)
       .lineTo(doc.page.width - 50, separatorY)
       .stroke();
    
    // Conteúdo da tabela
    doc.font('Helvetica');
    let totalY = separatorY + 15;
    let currentPage = 1;
    
    alocacoes.forEach((alocacao, index) => {
      // Verificar se é necessário adicionar uma nova página
      if (totalY > doc.page.height - 150) {
        this.addFooter(doc, {
          pageNumber: currentPage,
          totalPages: Math.ceil(alocacoes.length / 25) + 1, // Estimativa de páginas
          language
        });
        
        doc.addPage();
        currentPage++;
        
        // Readicionar cabeçalho da tabela na nova página
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text(t('pdf.invoice.services'), { underline: true });
        
        const newTableTop = doc.y + 10;
        doc.fontSize(10);
        
        doc.text(t('pdf.invoice.date'), 50, newTableTop);
        doc.text(t('pdf.invoice.employee'), 50 + tableColumnWidth, newTableTop);
        doc.text(t('pdf.invoice.service'), 50 + tableColumnWidth * 2, newTableTop);
        doc.text(t('pdf.invoice.location'), 50 + tableColumnWidth * 3, newTableTop);
        doc.text(t('pdf.invoice.amount'), 50 + tableColumnWidth * 4, newTableTop, { width: tableColumnWidth, align: 'right' });
        
        // Linha separadora do cabeçalho
        doc.moveDown(0.5);
        const newSeparatorY = doc.y;
        doc.strokeColor('#aaaaaa')
           .lineWidth(1)
           .moveTo(50, newSeparatorY)
           .lineTo(doc.page.width - 50, newSeparatorY)
           .stroke();
        
        totalY = newSeparatorY + 15;
      }
      
      // Alternar cores de fundo para facilitar a leitura
      if (index % 2 === 0) {
        doc.rect(50, totalY - 5, doc.page.width - 100, 20).fill('#f5f5f5');
      }
      
      doc.fillColor('#000000');
      
      const dataFormatada = moment(alocacao.data_alocacao).format('L');
      const valorFormatado = language === 'ja'
        ? `¥${alocacao.valor.toLocaleString('ja-JP')}`
        : `¥ ${alocacao.valor.toLocaleString('pt-BR')}`;
      
      doc.text(dataFormatada, 50, totalY);
      doc.text(alocacao.funcionario_nome, 50 + tableColumnWidth, totalY);
      doc.text(alocacao.descricao_servico || '-', 50 + tableColumnWidth * 2, totalY);
      doc.text(alocacao.local_servico || '-', 50 + tableColumnWidth * 3, totalY);
      doc.text(valorFormatado, 50 + tableColumnWidth * 4, totalY, { width: tableColumnWidth, align: 'right' });
      
      totalY += 20;
    });
    
    // Linha separadora final
    doc.strokeColor('#aaaaaa')
       .lineWidth(1)
       .moveTo(50, totalY)
       .lineTo(doc.page.width - 50, totalY)
       .stroke();
    
    // Total
    totalY += 15;
    doc.font('Helvetica-Bold')
       .text(t('pdf.invoice.subtotal'), 50 + tableColumnWidth * 3, totalY);
    
    const subtotalFormatado = language === 'ja'
      ? `¥${fatura.valor_total.toLocaleString('ja-JP')}`
      : `¥ ${fatura.valor_total.toLocaleString('pt-BR')}`;
    
    doc.text(subtotalFormatado, 50 + tableColumnWidth * 4, totalY, { width: tableColumnWidth, align: 'right' });
    
    totalY += 20;
    doc.font('Helvetica-Bold')
       .fontSize(12)
       .text(t('pdf.invoice.total'), 50 + tableColumnWidth * 3, totalY);
    
    const totalFormatado = language === 'ja'
      ? `¥${fatura.valor_total.toLocaleString('ja-JP')}`
      : `¥ ${fatura.valor_total.toLocaleString('pt-BR')}`;
    
    doc.text(totalFormatado, 50 + tableColumnWidth * 4, totalY, { width: tableColumnWidth, align: 'right' });
    
    // Observações
    if (fatura.observacoes) {
      doc.moveDown(2)
         .fontSize(12)
         .font('Helvetica-Bold')
         .text(t('pdf.invoice.observations'), { underline: true });
      
      doc.fontSize(10)
         .font('Helvetica')
         .text(fatura.observacoes);
    }
    
    // Informações de pagamento
    doc.moveDown(2)
       .fontSize(12)
       .font('Helvetica-Bold')
       .text(t('pdf.invoice.paymentInstructions'), { underline: true });
    
    doc.fontSize(10)
       .font('Helvetica')
       .text(t('pdf.invoice.paymentMessage'))
       .moveDown();
    
    // Adicionar rodapé com número de página
    this.addFooter(doc, {
      pageNumber: currentPage,
      totalPages: currentPage,
      language
    });
    
    // Finalizar documento
    doc.end();
    
    // Converter chunks em Buffer
    return new Promise((resolve) => {
      doc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(buffer);
      });
    });
  }
  
  /**
   * Salva um buffer PDF em arquivo
   * @param {Buffer} buffer - Buffer do PDF
   * @param {string} filename - Nome do arquivo (opcional)
   * @param {string} directory - Diretório para salvar (opcional)
   * @returns {string} Caminho do arquivo salvo
   */
  savePDFToFile(buffer, filename = null, directory = null) {
    const fileName = filename || `${uuidv4()}.pdf`;
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

module.exports = new PDFService();