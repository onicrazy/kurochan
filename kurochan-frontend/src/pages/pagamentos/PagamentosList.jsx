import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Tabs,
  Tab,
  Divider,
  Card,
  CardContent,
  CardActions,
  Grid,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  MonetizationOn as MonetizationOnIcon,
  Business as BusinessIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import moment from 'moment';

import api from '../../services/api';
import formatters from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

/**
 * Componente para exibir lista de pagamentos (funcionários e empresas)
 */
const PagamentosList = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  
  // Estado para controle das abas
  const [tabValue, setTabValue] = useState(0);
  
  // Estados para pagamentos de funcionários
  const [pagamentosFuncionarios, setPagamentosFuncionarios] = useState([]);
  const [loadingPagamentosFuncionarios, setLoadingPagamentosFuncionarios] = useState(false);
  const [errorPagamentosFuncionarios, setErrorPagamentosFuncionarios] = useState(null);
  
  // Estados para faturas de empresas
  const [faturasEmpresas, setFaturasEmpresas] = useState([]);
  const [loadingFaturasEmpresas, setLoadingFaturasEmpresas] = useState(false);
  const [errorFaturasEmpresas, setErrorFaturasEmpresas] = useState(null);
  
  // Determinar qual aba exibir com base na URL
  useEffect(() => {
    if (location.pathname.includes('/empresas')) {
      setTabValue(1);
    } else {
      setTabValue(0);
    }
  }, [location.pathname]);
  
  // Carregar pagamentos de funcionários
  useEffect(() => {
    if (tabValue === 0) {
      fetchPagamentosFuncionarios();
    }
  }, [tabValue]);
  
  // Carregar faturas de empresas
  useEffect(() => {
    if (tabValue === 1) {
      fetchFaturasEmpresas();
    }
  }, [tabValue]);
  
  // Função para buscar pagamentos de funcionários
  const fetchPagamentosFuncionarios = async () => {
    try {
      setLoadingPagamentosFuncionarios(true);
      setErrorPagamentosFuncionarios(null);
      
      const response = await api.get('/pagamentos/funcionarios', {
        params: {
          limit: 10,
          sortBy: 'data_pagamento',
          sortOrder: 'desc'
        }
      });
      
      setPagamentosFuncionarios(response.data.data);
      
    } catch (err) {
      console.error('Erro ao carregar pagamentos de funcionários:', err);
      setErrorPagamentosFuncionarios(t('payments.error.loadEmployeePaymentsFailed'));
    } finally {
      setLoadingPagamentosFuncionarios(false);
    }
  };
  
  // Função para buscar faturas de empresas
  const fetchFaturasEmpresas = async () => {
    try {
      setLoadingFaturasEmpresas(true);
      setErrorFaturasEmpresas(null);
      
      const response = await api.get('/pagamentos/empresas', {
        params: {
          limit: 10,
          sortBy: 'data_fatura',
          sortOrder: 'desc'
        }
      });
      
      setFaturasEmpresas(response.data.data);
      
    } catch (err) {
      console.error('Erro ao carregar faturas de empresas:', err);
      setErrorFaturasEmpresas(t('payments.error.loadCompanyInvoicesFailed'));
    } finally {
      setLoadingFaturasEmpresas(false);
    }
  };
  
  // Manipulador para mudança de aba
  const handleTabChange = (event, newValue) => {
    if (newValue === 0) {
      navigate('/pagamentos/funcionarios');
    } else {
      navigate('/pagamentos/empresas');
    }
    setTabValue(newValue);
  };
  
  // Manipulador para visualizar pagamento de funcionário
  const handleViewFuncionarioPagamento = (id) => {
    navigate(`/pagamentos/funcionarios/${id}`);
  };
  
  // Manipulador para visualizar fatura de empresa
  const handleViewEmpresaFatura = (id) => {
    navigate(`/pagamentos/empresas/${id}`);
  };
  
  // Manipulador para criar novo pagamento
  const handleCreateFuncionarioPagamento = () => {
    navigate('/pagamentos/funcionarios/novo');
  };
  
  // Manipulador para criar nova fatura
  const handleCreateEmpresaFatura = () => {
    navigate('/pagamentos/empresas/nova');
  };
  
  // Manipulador para visualizar todos os pagamentos
  const handleViewAllFuncionarioPagamentos = () => {
    navigate('/pagamentos/funcionarios/lista');
  };
  
  // Manipulador para visualizar todas as faturas
  const handleViewAllEmpresaFaturas = () => {
    navigate('/pagamentos/empresas/lista');
  };
  
  return (
    <Container maxWidth="xl">
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="payments tabs">
            <Tab 
              icon={<PersonIcon />} 
              label={t('payments.employeePayments')}
              id="employee-payments-tab"
              aria-controls="employee-payments-tabpanel"
            />
            <Tab 
              icon={<BusinessIcon />} 
              label={t('payments.companyInvoices')}
              id="company-invoices-tab"
              aria-controls="company-invoices-tabpanel"
            />
          </Tabs>
        </Box>
        
        {/* Pagamentos de Funcionários */}
        {tabValue === 0 && (
          <div role="tabpanel" id="employee-payments-tabpanel">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5">{t('payments.employeePayments')}</Typography>
              
              {currentUser?.permissions?.canCreatePayment && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateFuncionarioPagamento}
                >
                  {t('payments.newEmployeePayment')}
                </Button>
              )}
            </Box>
            
            {errorPagamentosFuncionarios && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorPagamentosFuncionarios}
              </Alert>
            )}
            
            {loadingPagamentosFuncionarios ? (
              <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
              </Box>
            ) : pagamentosFuncionarios.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                {t('payments.noEmployeePayments')}
              </Alert>
            ) : (
              <>
                <Grid container spacing={3}>
                  {pagamentosFuncionarios.map(pagamento => (
                    <Grid item xs={12} sm={6} md={4} key={pagamento.id}>
                      <Card>
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                            <div>
                              <Typography variant="h6" gutterBottom>
                                {pagamento.funcionario_nome}
                              </Typography>
                              <Typography variant="body2" color="textSecondary" gutterBottom>
                                {t('payments.paymentDate')}: {formatters.date(pagamento.data_pagamento, i18n.language)}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {t('payments.period')}: {formatters.date(pagamento.periodo_inicio, i18n.language)} - {formatters.date(pagamento.periodo_fim, i18n.language)}
                              </Typography>
                            </div>
                            <Typography variant="h5" color="primary">
                              {formatters.currency(pagamento.valor_total, i18n.language)}
                            </Typography>
                          </Box>
                        </CardContent>
                        <CardActions>
                          <Button 
                            size="small" 
                            endIcon={<ArrowForwardIcon />}
                            onClick={() => handleViewFuncionarioPagamento(pagamento.id)}
                          >
                            {t('common.view')}
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                
                <Box display="flex" justifyContent="center" mt={3}>
                  <Button
                    variant="outlined"
                    onClick={handleViewAllFuncionarioPagamentos}
                  >
                    {t('common.viewAll')}
                  </Button>
                </Box>
              </>
            )}
          </div>
        )}
        
        {/* Faturas de Empresas */}
        {tabValue === 1 && (
          <div role="tabpanel" id="company-invoices-tabpanel">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5">{t('payments.companyInvoices')}</Typography>
              
              {currentUser?.permissions?.canCreatePayment && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateEmpresaFatura}
                >
                  {t('payments.newCompanyInvoice')}
                </Button>
              )}
            </Box>
            
            {errorFaturasEmpresas && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorFaturasEmpresas}
              </Alert>
            )}
            
            {loadingFaturasEmpresas ? (
              <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
              </Box>
            ) : faturasEmpresas.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                {t('payments.noCompanyInvoices')}
              </Alert>
            ) : (
              <>
                <Grid container spacing={3}>
                  {faturasEmpresas.map(fatura => (
                    <Grid item xs={12} sm={6} md={4} key={fatura.id}>
                      <Card>
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                            <div>
                              <Typography variant="h6" gutterBottom>
                                {fatura.empresa_nome}
                              </Typography>
                              <Typography variant="body2" color="textSecondary" gutterBottom>
                                {t('payments.invoiceDate')}: {formatters.date(fatura.data_fatura, i18n.language)}
                              </Typography>
                              <Typography variant="body2" color="textSecondary" gutterBottom>
                                {t('payments.dueDate')}: {formatters.date(fatura.data_vencimento, i18n.language)}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {t('payments.period')}: {formatters.date(fatura.periodo_inicio, i18n.language)} - {formatters.date(fatura.periodo_fim, i18n.language)}
                              </Typography>
                            </div>
                            <Box textAlign="right">
                              <Typography variant="h5" color="primary">
                                {formatters.currency(fatura.valor_total, i18n.language)}
                              </Typography>
                              <Chip
                                label={formatters.paymentStatus(fatura.status_pagamento, i18n.language)}
                                color={
                                  fatura.status_pagamento === 'pago' 
                                    ? 'success' 
                                    : fatura.status_pagamento === 'parcial' 
                                      ? 'info' 
                                      : 'warning'
                                }
                                size="small"
                                sx={{ mt: 1 }}
                              />
                            </Box>
                          </Box>
                        </CardContent>
                        <CardActions>
                          <Button 
                            size="small" 
                            endIcon={<ArrowForwardIcon />}
                            onClick={() => handleViewEmpresaFatura(fatura.id)}
                          >
                            {t('common.view')}
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                
                <Box display="flex" justifyContent="center" mt={3}>
                  <Button
                    variant="outlined"
                    onClick={handleViewAllEmpresaFaturas}
                  >
                    {t('common.viewAll')}
                  </Button>
                </Box>
              </>
            )}
          </div>
        )}
      </Paper>
    </Container>
  );
};

export default PagamentosList;