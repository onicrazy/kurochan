import api from './api';

/**
 * Serviço para gerenciar pagamentos
 */
const pagamentosService = {
  /**
   * Busca lista de pagamentos de funcionários
   * @param {Object} params - Parâmetros de filtro
   * @returns {Promise} Promise com os resultados
   */
  async listarPagamentosFuncionarios(params = {}) {
    const response = await api.get('/pagamentos/funcionarios', { params });
    return response.data;
  },
  
  /**
   * Busca um pagamento de funcionário específico
   * @param {number} id - ID do pagamento
   * @returns {Promise} Promise com os dados do pagamento
   */
  async obterPagamentoFuncionario(id) {
    const response = await api.get(`/pagamentos/funcionarios/${id}`);
    return response.data;
  },
  
  /**
   * Cria um novo pagamento de funcionário
   * @param {Object} dados - Dados do pagamento
   * @returns {Promise} Promise com os dados do pagamento criado
   */
  async criarPagamentoFuncionario(dados) {
    const response = await api.post('/pagamentos/funcionarios', dados);
    return response.data;
  },
  
  /**
   * Gera PDF de comprovante de pagamento
   * @param {number} id - ID do pagamento
   * @returns {Promise} Promise com a URL do PDF
   */
  async gerarComprovantePagamento(id) {
    const response = await api.get(`/pagamentos/funcionarios/${id}/comprovante`, {
      responseType: 'blob'
    });
    return response.data;
  },
  
  /**
   * Busca lista de faturas de empresas
   * @param {Object} params - Parâmetros de filtro
   * @returns {Promise} Promise com os resultados
   */
  async listarFaturasEmpresas(params = {}) {
    const response = await api.get('/pagamentos/empresas', { params });
    return response.data;
  },
  
  /**
   * Busca uma fatura de empresa específica
   * @param {number} id - ID da fatura
   * @returns {Promise} Promise com os dados da fatura
   */
  async obterFaturaEmpresa(id) {
    const response = await api.get(`/pagamentos/empresas/${id}`);
    return response.data;
  },
  
  /**
   * Cria uma nova fatura de empresa
   * @param {Object} dados - Dados da fatura
   * @returns {Promise} Promise com os dados da fatura criada
   */
  async criarFaturaEmpresa(dados) {
    const response = await api.post('/pagamentos/empresas', dados);
    return response.data;
  },
  
  /**
   * Atualiza o status de pagamento de uma fatura
   * @param {number} id - ID da fatura
   * @param {Object} dados - Dados de atualização
   * @returns {Promise} Promise com os dados da fatura atualizada
   */
  async atualizarStatusFatura(id, dados) {
    const response = await api.put(`/pagamentos/empresas/${id}/status`, dados);
    return response.data;
  },
  
  /**
   * Gera PDF de fatura
   * @param {number} id - ID da fatura
   * @returns {Promise} Promise com a URL do PDF
   */
  async gerarPDFFatura(id) {
    const response = await api.get(`/pagamentos/empresas/${id}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

export default pagamentosService;