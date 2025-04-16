const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const environment = require('../config/environment');
const { translate } = require('../config/i18n');
const { logger } = require('../api/middlewares/logMiddleware');

/**
 * Serviço para envio de emails
 */
class EmailService {
  constructor() {
    // Criação do transporter do Nodemailer
    this.transporter = nodemailer.createTransport({
      host: environment.email.host,
      port: environment.email.port,
      secure: environment.email.secure,
      auth: {
        user: environment.email.auth.user,
        pass: environment.email.auth.pass
      }
    });
    
    // Verificar conexão com o servidor de email em ambiente de desenvolvimento
    if (environment.NODE_ENV === 'development') {
      this.transporter.verify((error) => {
        if (error) {
          logger.warn('Erro ao conectar ao servidor de email:', error);
        } else {
          logger.info('Servidor de email está pronto para enviar mensagens');
        }
      });
    }
  }
  
  /**
   * Lê e compila um template de email
   * @param {string} templateName - Nome do template
   * @param {Object} data - Dados para preencher o template
   * @param {string} language - Idioma (ja ou pt-BR)
   * @returns {string} Template compilado
   */
  async compileTemplate(templateName, data, language = 'pt-BR') {
    try {
      // Caminho para a pasta de templates e localização do template específico
      const templatePath = path.join(__dirname, '../email-templates', language, `${templateName}.html`);
      
      // Verificar se o template existe para o idioma especificado
      if (!fs.existsSync(templatePath)) {
        // Fallback para o idioma padrão se o template não existir no idioma específico
        const defaultLanguage = 'pt-BR';
        const defaultTemplatePath = path.join(__dirname, '../email-templates', defaultLanguage, `${templateName}.html`);
        
        // Se nem o template padrão existir, lançar erro
        if (!fs.existsSync(defaultTemplatePath)) {
          throw new Error(`Template de email "${templateName}" não encontrado`);
        }
        
        // Ler o template padrão
        const templateContent = fs.readFileSync(defaultTemplatePath, 'utf8');
        
        // Compilar o template com Handlebars
        const template = handlebars.compile(templateContent);
        return template(data);
      }
      
      // Ler o template no idioma especificado
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      
      // Compilar o template com Handlebars
      const template = handlebars.compile(templateContent);
      return template(data);
      
    } catch (error) {
      logger.error('Erro ao compilar template de email:', error);
      throw error;
    }
  }
  
  /**
   * Envia um email
   * @param {Object} options - Opções de envio
   * @returns {Promise} Promessa com resultado do envio
   */
  async sendEmail(options) {
    try {
      const { to, subject, html, text, attachments, language = 'pt-BR' } = options;
      
      // Configurar opções de email
      const mailOptions = {
        from: options.from || environment.email.from,
        to,
        subject,
        html,
        text,
        attachments
      };
      
      // Enviar email
      const info = await this.transporter.sendMail(mailOptions);
      
      logger.info(`Email enviado para ${to}`, { messageId: info.messageId });
      return info;
      
    } catch (error) {
      logger.error('Erro ao enviar email:', error);
      throw error;
    }
  }
  
  /**
   * Envia um email usando um template
   * @param {Object} options - Opções de envio
   * @returns {Promise} Promessa com resultado do envio
   */
  async sendTemplateEmail(options) {
    try {
      const { to, templateName, data, attachments, language = 'pt-BR' } = options;
      
      // Compilar o template
      const html = await this.compileTemplate(templateName, data, language);
      
      // Enviar email
      return this.sendEmail({
        to,
        subject: options.subject || translate(`email.${templateName}.subject`, {}, language),
        html,
        attachments,
        language
      });
      
    } catch (error) {
      logger.error('Erro ao enviar email com template:', error);
      throw error;
    }
  }
  
  /**
   * Envia uma notificação de pagamento para um funcionário
   * @param {Object} funcionario - Dados do funcionário
   * @param {Object} pagamento - Dados do pagamento
   * @param {string} idioma - Idioma da notificação
   * @param {Buffer} pdfRecibo - PDF do recibo (opcional)
   * @returns {Promise} Promessa com resultado do envio
   */
  async enviarNotificacaoPagamento(funcionario, pagamento, idioma = 'pt-BR', pdfRecibo = null) {
    // Verificar se há email do funcionário
    if (!funcionario.email) {
      logger.warn('Funcionário não possui email cadastrado', { funcionarioId: funcionario.id });
      return null;
    }
    
    // Verificar se o serviço de email está configurado
    if (!environment.email.auth.user || !environment.email.auth.pass) {
      logger.warn('Serviço de email não configurado');
      return null;
    }
    
    // Preparar dados para o template
    const data = {
      nome: funcionario.nome,
      data: new Date(pagamento.data_pagamento).toLocaleDateString(idioma === 'ja' ? 'ja-JP' : 'pt-BR'),
      valor: new Intl.NumberFormat(idioma === 'ja' ? 'ja-JP' : 'pt-BR', {
        style: 'currency',
        currency: 'JPY'
      }).format(pagamento.valor_total),
      periodo: {
        inicio: new Date(pagamento.periodo_inicio).toLocaleDateString(idioma === 'ja' ? 'ja-JP' : 'pt-BR'),
        fim: new Date(pagamento.periodo_fim).toLocaleDateString(idioma === 'ja' ? 'ja-JP' : 'pt-BR')
      }
    };
    
    // Preparar anexos
    const attachments = [];
    if (pdfRecibo) {
      attachments.push({
        filename: `recibo-pagamento-${pagamento.id}.pdf`,
        content: pdfRecibo,
        contentType: 'application/pdf'
      });
    }
    
    // Enviar email com template
    return this.sendTemplateEmail({
      to: funcionario.email,
      templateName: 'pagamento-funcionario',
      data,
      attachments,
      language: idioma
    });
  }
  
  /**
   * Envia uma fatura para uma empresa
   * @param {Object} empresa - Dados da empresa
   * @param {Object} fatura - Dados da fatura
   * @param {string} idioma - Idioma da fatura
   * @param {Buffer} pdfFatura - PDF da fatura (opcional)
   * @returns {Promise} Promessa com resultado do envio
   */
  async enviarFaturaEmpresa(empresa, fatura, idioma = 'pt-BR', pdfFatura = null) {
    // Verificar se há email da empresa
    if (!empresa.contato_email) {
      logger.warn('Empresa não possui email cadastrado', { empresaId: empresa.id });
      return null;
    }
    
    // Verificar se o serviço de email está configurado
    if (!environment.email.auth.user || !environment.email.auth.pass) {
      logger.warn('Serviço de email não configurado');
      return null;
    }
    
    // Preparar dados para o template
    const data = {
      nome: empresa.nome,
      contato: empresa.contato_nome,
      numero_fatura: fatura.id,
      data: new Date(fatura.data_fatura).toLocaleDateString(idioma === 'ja' ? 'ja-JP' : 'pt-BR'),
      vencimento: new Date(fatura.data_vencimento).toLocaleDateString(idioma === 'ja' ? 'ja-JP' : 'pt-BR'),
      valor: new Intl.NumberFormat(idioma === 'ja' ? 'ja-JP' : 'pt-BR', {
        style: 'currency',
        currency: 'JPY'
      }).format(fatura.valor_total),
      periodo: {
        inicio: new Date(fatura.periodo_inicio).toLocaleDateString(idioma === 'ja' ? 'ja-JP' : 'pt-BR'),
        fim: new Date(fatura.periodo_fim).toLocaleDateString(idioma === 'ja' ? 'ja-JP' : 'pt-BR')
      }
    };
    
    // Preparar anexos
    const attachments = [];
    if (pdfFatura) {
      attachments.push({
        filename: `fatura-${fatura.id}.pdf`,
        content: pdfFatura,
        contentType: 'application/pdf'
      });
    }
    
    // Enviar email com template
    return this.sendTemplateEmail({
      to: empresa.contato_email,
      templateName: 'fatura-empresa',
      data,
      attachments,
      language: idioma
    });
  }
}

module.exports = new EmailService();