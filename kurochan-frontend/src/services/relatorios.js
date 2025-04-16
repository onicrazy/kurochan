import api from './api';

/**
 * Serviço para gerenciar relatórios
 */
const relatoriosService = {
  /**
   * Busca resumo financeiro
   * @param {Object} params - Parâmetros de filtro (período)
   * @returns {Promise} Promise com os dados do resumo
   */
  async resumoFinanceiro(params = {}) {
    const response = await api.get('/relatorios/resumo-financeiro', { params });
    return response.data;
  },
  
  /**
   * Busca estatísticas mensais
   * @param {Object} params - Parâmetros de filtro (ano, mês)
   * @returns {Promise} Promise com os dados estatísticos
   */
  async estatisticasMensais(params = {}) {
    const response = await api.get('/relatorios/estatisticas-mensais', { params });
    return response.data;
  },
  
  /**
   * Gera relatório de funcionários
   * @param {Object} params - Parâmetros de filtro
   * @returns {Promise} Promise com os dados do relatório
   */
  async relatorioFuncionarios(params = {}) {
    const response = await api.get('/relatorios/funcionarios', { params });
    return response.data;
  },
  
  /**
   * Gera relatório de empresas
   * @param {Object} params - Parâmetros de filtro
   * @returns {Promise} Promise com os dados do relatório
   */
  async relatorioEmpresas(params = {}) {
    const response = await api.get('/relatorios/empresas', { params });
    return response.data;
  },
  
  /**
   * Gera relatório de alocações
   * @param {Object} params - Parâmetros de filtro
   * @returns {Promise} Promise com os dados do relatório
   */
  async relatorioAlocacoes(params = {}) {
    const response = await api.get('/relatorios/alocacoes', { params });
    return response.data;
  },
  
  /**
   * Gera relatório financeiro
   * @param {Object} params - Parâmetros de filtro
   * @returns {Promise} Promise com os dados do relatório
   */
  async relatorioFinanceiro(params = {}) {
    const response = await api.get('/relatorios/financeiro', { params });
    return response.data;
  },
  
  /**
   * Exporta relatório em PDF
   * @param {string} tipo - Tipo de relatório
   * @param {Object} params - Parâmetros de filtro
   * @returns {Promise} Promise com a URL do PDF
   */
  async exportarPDF(tipo, params = {}) {
    const response = await api.get(`/relatorios/${tipo}/pdf`, {
      params,
      responseType: 'blob'
    });
    return response.data;
  },
  
  /**
   * Exporta relatório em Excel
   * @param {string} tipo - Tipo de relatório
   * @param {Object} params - Parâmetros de filtro
   * @returns {Promise} Promise com a URL do Excel
   */
  async exportarExcel(tipo, params = {}) {
    const response = await api.get(`/relatorios/${tipo}/excel`, {
      params,
      responseType: 'blob'
    });
    return response.data;
  }
};

export default relatoriosService;