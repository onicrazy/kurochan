import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  MonetizationOn as MonetizationOnIcon,
  People as PeopleIcon,
  Work as WorkIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  MoreVert as MoreVertIcon,
  CalendarToday as CalendarTodayIcon,
  Assignment as AssignmentIcon,
  ArrowForward as ArrowForwardIcon,
  Today as TodayIcon,
  Check as CheckIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from 'notistack';
import moment from 'moment';
import { Line, Bar } from 'react-chartjs-2';
import api from '../services/api';

/**
 * Componente de Dashboard para exibir informações gerais do sistema
 */
const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t, i18n } = useTranslation();
  const { currentUser } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  
  // Estados para armazenar dados do dashboard
  const [resumoFinanceiro, setResumoFinanceiro] = useState(null);
  const [alocacoesHoje, setAlocacoesHoje] = useState([]);
  const [pagamentosPendentes, setPagamentosPendentes] = useState([]);
  const [recebimentosPendentes, setRecebimentosPendentes] = useState([]);
  const [estatisticasMensais, setEstatisticasMensais] = useState([]);
  
  // Estados para controle de carregamento
  const [loadingResumo, setLoadingResumo] = useState(false);
  const [loadingAlocacoes, setLoadingAlocacoes] = useState(false);
  const [loadingPagamentos, setLoadingPagamentos] = useState(false);
  const [loadingRecebimentos, setLoadingRecebimentos] = useState(false);
  const [loadingEstatisticas, setLoadingEstatisticas] = useState(false);
  
  // Efeito para carregar dados iniciais
  useEffect(() => {
    fetchResumoFinanceiro();
    fetchAlocacoesHoje();
    fetchPagamentosPendentes();
    fetchRecebimentosPendentes();
    fetchEstatisticasMensais();
  }, []);
  
  // Função para buscar resumo financeiro
  const fetchResumoFinanceiro = async () => {
    try {
      setLoadingResumo(true);
      const response = await api.get('/relatorios/resumo-financeiro');
      setResumoFinanceiro(response.data.data);
    } catch (error) {
      console.error('Erro ao buscar resumo financeiro:', error);
      enqueueSnackbar(t('dashboard.error.financialSummary'), { variant: 'error' });
    } finally {
      setLoadingResumo(false);
    }
  };
  
  // Função para buscar alocações de hoje
  const fetchAlocacoesHoje = async () => {
    try {
      setLoadingAlocacoes(true);
      const hoje = moment().format('YYYY-MM-DD');
      const response = await api.get(`/alocacoes?dataInicio=${hoje}&dataFim=${hoje}`);
      setAlocacoesHoje(response.data.data);
    } catch (error) {
      console.error('Erro ao buscar alocações de hoje:', error);
      enqueueSnackbar(t('dashboard.error.todayAllocations'), { variant: 'error' });
    } finally {
      setLoadingAlocacoes(false);
    }
  };
  
  // Função para buscar pagamentos pendentes
  const fetchPagamentosPendentes = async () => {
    try {
      setLoadingPagamentos(true);
      const response = await api.get('/alocacoes?statusPagamentoFuncionario=pendente&limit=5');
      setPagamentosPendentes(response.data.data);
    } catch (error) {
      console.error('Erro ao buscar pagamentos pendentes:', error);
      enqueueSnackbar(t('dashboard.error.pendingPayments'), { variant: 'error' });
    } finally {
      setLoadingPagamentos(false);
    }
  };
  
  // Função para buscar recebimentos pendentes
  const fetchRecebimentosPendentes = async () => {
    try {
      setLoadingRecebimentos(true);
      const response = await api.get('/alocacoes?statusPagamentoEmpresa=pendente&limit=5');
      setRecebimentosPendentes(response.data.data);
    } catch (error) {
      console.error('Erro ao buscar recebimentos pendentes:', error);
      enqueueSnackbar(t('dashboard.error.pendingReceivables'), { variant: 'error' });
    } finally {
      setLoadingRecebimentos(false);
    }
  };
  
  // Função para buscar estatísticas mensais
  const fetchEstatisticasMensais = async () => {
    try {
      setLoadingEstatisticas(true);
      const response = await api.get('/relatorios/estatisticas-mensais');
      setEstatisticasMensais(response.data.data);
    } catch (error) {
      console.error('Erro ao buscar estatísticas mensais:', error);
      enqueueSnackbar(t('dashboard.error.monthlyStatistics'), { variant: 'error' });
    } finally {
      setLoadingEstatisticas(false);
    }
  };
  
  // Formatar valor monetário (Iene Japonês)
  const formatCurrency = (value) => {
    return i18n.language === 'ja'
      ? `¥${value.toLocaleString('ja-JP')}`
      : `¥ ${value.toLocaleString('pt-BR')}`;
  };
  
  // Configuração do gráfico de faturamento mensal
  const faturamentoChartData = {
    labels: estatisticasMensais?.meses || [],
    datasets: [
      {
        label: t('dashboard.revenue'),
        data: estatisticasMensais?.receitas || [],
        fill: false,
        backgroundColor: theme.palette.primary.main,
        borderColor: theme.palette.primary.main,
      },
      {
        label: t('dashboard.expenses'),
        data: estatisticasMensais?.despesas || [],
        fill: false,
        backgroundColor: theme.palette.error.main,
        borderColor: theme.palette.error.main,
      },
      {
        label: t('dashboard.profit'),
        data: estatisticasMensais?.lucros || [],
        fill: false,
        backgroundColor: theme.palette.success.main,
        borderColor: theme.palette.success.main,
      }
    ]
  };
  
  // Configuração do gráfico de alocações por empresa
  const alocacoesEmpresaChartData = {
    labels: estatisticasMensais?.empresas?.map(e => e.nome) || [],
    datasets: [
      {
        label: t('dashboard.allocations'),
        data: estatisticasMensais?.empresas?.map(e => e.total_alocacoes) || [],
        backgroundColor: theme.palette.primary.light,
      }
    ]
  };
  
  return (
    <Container maxWidth="xl">
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('dashboard.welcome', { name: currentUser?.nome?.split(' ')[0] })}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          {moment().format('dddd, LL')}
        </Typography>
      </Box>
      
      {/* Cartões de resumo financeiro */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column',
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              height: '100%'
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle2" color="textSecondary">
                {t('dashboard.monthlyRevenue')}
              </Typography>
              <MonetizationOnIcon color="primary" />
            </Box>
            
            {loadingResumo ? (
              <Box display="flex" justifyContent="center" py={1}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <>
                <Typography variant="h5" component="div" fontWeight="bold">
                  {resumoFinanceiro?.receita_mes ? formatCurrency(resumoFinanceiro.receita_mes) : '¥ 0'}
                </Typography>
                
                <Box display="flex" alignItems="center" mt={1}>
                  {resumoFinanceiro?.variacao_receita > 0 ? (
                    <TrendingUpIcon fontSize="small" color="success" />
                  ) : (
                    <TrendingDownIcon fontSize="small" color="error" />
                  )}
                  <Typography variant="body2" ml={0.5}>
                    {resumoFinanceiro?.variacao_receita 
                      ? `${Math.abs(resumoFinanceiro.variacao_receita).toFixed(1)}% ${resumoFinanceiro.variacao_receita > 0 ? t('common.increase') : t('common.decrease')}`
                      : t('common.noChange')}
                  </Typography>
                </Box>
              </>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column',
              borderLeft: `4px solid ${theme.palette.error.main}`,
              height: '100%'
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle2" color="textSecondary">
                {t('dashboard.monthlyExpenses')}
              </Typography>
              <MonetizationOnIcon color="error" />
            </Box>
            
            {loadingResumo ? (
              <Box display="flex" justifyContent="center" py={1}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <>
                <Typography variant="h5" component="div" fontWeight="bold">
                  {resumoFinanceiro?.despesa_mes ? formatCurrency(resumoFinanceiro.despesa_mes) : '¥ 0'}
                </Typography>
                
                <Box display="flex" alignItems="center" mt={1}>
                  {resumoFinanceiro?.variacao_despesa > 0 ? (
                    <TrendingUpIcon fontSize="small" color="error" />
                  ) : (
                    <TrendingDownIcon fontSize="small" color="success" />
                  )}
                  <Typography variant="body2" ml={0.5}>
                    {resumoFinanceiro?.variacao_despesa 
                      ? `${Math.abs(resumoFinanceiro.variacao_despesa).toFixed(1)}% ${resumoFinanceiro.variacao_despesa > 0 ? t('common.increase') : t('common.decrease')}`
                      : t('common.noChange')}
                  </Typography>
                </Box>
              </>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column',
              borderLeft: `4px solid ${theme.palette.success.main}`,
              height: '100%'
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle2" color="textSecondary">
                {t('dashboard.monthlyProfit')}
              </Typography>
              <MonetizationOnIcon color="success" />
            </Box>
            
            {loadingResumo ? (
              <Box display="flex" justifyContent="center" py={1}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <>
                <Typography variant="h5" component="div" fontWeight="bold">
                  {resumoFinanceiro?.lucro_mes ? formatCurrency(resumoFinanceiro.lucro_mes) : '¥ 0'}
                </Typography>
                
                <Box display="flex" alignItems="center" mt={1}>
                  {resumoFinanceiro?.variacao_lucro > 0 ? (
                    <TrendingUpIcon fontSize="small" color="success" />
                  ) : (
                    <TrendingDownIcon fontSize="small" color="error" />
                  )}
                  <Typography variant="body2" ml={0.5}>
                    {resumoFinanceiro?.variacao_lucro 
                      ? `${Math.abs(resumoFinanceiro.variacao_lucro).toFixed(1)}% ${resumoFinanceiro.variacao_lucro > 0 ? t('common.increase') : t('common.decrease')}`
                      : t('common.noChange')}
                  </Typography>
                </Box>
              </>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column',
              borderLeft: `4px solid ${theme.palette.info.main}`,
              height: '100%'
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle2" color="textSecondary">
                {t('dashboard.todayAllocations')}
              </Typography>
              <PeopleIcon color="info" />
            </Box>
            
            {loadingAlocacoes ? (
              <Box display="flex" justifyContent="center" py={1}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <>
                <Typography variant="h5" component="div" fontWeight="bold">
                  {alocacoesHoje.length}
                </Typography>
                
                <Typography variant="body2" mt={1} color="textSecondary">
                  {t('dashboard.employeesWorking')}
                </Typography>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Gráficos */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">{t('dashboard.monthlyFinancialChart')}</Typography>
              <IconButton size="small">
                <MoreVertIcon />
              </IconButton>
            </Box>
            
            {loadingEstatisticas ? (
              <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                <CircularProgress />
              </Box>
            ) : estatisticasMensais?.meses?.length > 0 ? (
              <Box height={300}>
                <Line 
                  data={faturamentoChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'top' },
                      tooltip: { mode: 'index', intersect: false }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return `¥${value.toLocaleString()}`;
                          }
                        }
                      }
                    }
                  }}
                />
              </Box>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                <Typography variant="body1" color="textSecondary">
                  {t('dashboard.noDataAvailable')}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">{t('dashboard.allocationsPerCompany')}</Typography>
              <IconButton size="small">
                <MoreVertIcon />
              </IconButton>
            </Box>
            
            {loadingEstatisticas ? (
              <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                <CircularProgress />
              </Box>
            ) : estatisticasMensais?.empresas?.length > 0 ? (
              <Box height={300}>
                <Bar 
                  data={alocacoesEmpresaChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                    },
                    scales: {
                      y: { beginAtZero: true }
                    }
                  }}
                />
              </Box>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                <Typography variant="body1" color="textSecondary">
                  {t('dashboard.noDataAvailable')}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Cartões de atividades e ações pendentes */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" gutterBottom>
                  {t('dashboard.todayAllocations')}
                </Typography>
                <TodayIcon color="primary" />
              </Box>
              
              {loadingAlocacoes ? (
                <Box display="flex" justifyContent="center" py={2}>
                  <CircularProgress />
                </Box>
              ) : alocacoesHoje.length > 0 ? (
                <List>
                  {alocacoesHoje.slice(0, 5).map(alocacao => (
                    <ListItem 
                      key={alocacao.id}
                      divider
                      secondaryAction={
                        <Typography variant="body2">
                          {formatCurrency(alocacao.valor_cobrado_empresa)}
                        </Typography>
                      }
                    >
                      <ListItemIcon>
                        <WorkIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={alocacao.funcionario_nome}
                        secondary={alocacao.empresa_nome}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box display="flex" justifyContent="center" py={4}>
                  <Typography variant="body1" color="textSecondary">
                    {t('dashboard.noAllocationsToday')}
                  </Typography>
                </Box>
              )}
            </CardContent>
            
            <Divider />
            
            <CardActions>
              <Button 
                component={Link} 
                to="/calendario" 
                color="primary"
                endIcon={<ArrowForwardIcon />}
                sx={{ ml: 'auto' }}
              >
                {t('dashboard.viewCalendar')}
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" gutterBottom>
                  {t('dashboard.pendingPayments')}
                </Typography>
                <WarningIcon color="warning" />
              </Box>
              
              {loadingPagamentos ? (
                <Box display="flex" justifyContent="center" py={2}>
                  <CircularProgress />
                </Box>
              ) : pagamentosPendentes.length > 0 ? (
                <List>
                  {pagamentosPendentes.slice(0, 5).map(pagamento => (
                    <ListItem 
                      key={pagamento.id}
                      divider
                      secondaryAction={
                        <Typography variant="body2">
                          {formatCurrency(pagamento.valor_pago_funcionario)}
                        </Typography>
                      }
                    >
                      <ListItemIcon>
                        <CheckIcon color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary={pagamento.funcionario_nome}
                        secondary={moment(pagamento.data_alocacao).format('L')}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box display="flex" justifyContent="center" py={4}>
                  <Typography variant="body1" color="textSecondary">
                    {t('dashboard.noOutstandingPayments')}
                  </Typography>
                </Box>
              )}
            </CardContent>
            
            <Divider />
            
            <CardActions>
              <Button 
                component={Link} 
                to="/pagamentos" 
                color="primary"
                endIcon={<ArrowForwardIcon />}
                sx={{ ml: 'auto' }}
              >
                {t('dashboard.managePayments')}
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;