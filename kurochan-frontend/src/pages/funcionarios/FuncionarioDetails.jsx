import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
  Tab,
  Tabs
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  LocationOn as LocationOnIcon,
  MonetizationOn as MonetizationOnIcon,
  Assignment as AssignmentIcon,
  EventNote as EventNoteIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import moment from 'moment';

import api from '../../services/api';
import formatters from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';


// Componente para exibir conteúdo das abas
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          {children}
        </Box>
      )}
    </div>
  );
}

/**
 * Componente para visualizar detalhes de um funcionário
 */
const FuncionarioDetails = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const { currentUser } = useAuth();
  
  // Estados para controle de dados e UI
  const [funcionario, setFuncionario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Estados para dados relacionados
  const [alocacoes, setAlocacoes] = useState([]);
  const [pagamentos, setPagamentos] = useState([]);
  const [loadingAlocacoes, setLoadingAlocacoes] = useState(false);
  const [loadingPagamentos, setLoadingPagamentos] = useState(false);
  
  // Carregar dados do funcionário
  useEffect(() => {
    const fetchFuncionario = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get(`/funcionarios/${id}`);
        setFuncionario(response.data.data);
        
      } catch (err) {
        console.error('Erro ao carregar funcionário:', err);
        setError(t('employees.error.notFound'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchFuncionario();
  }, [id, t]);
  
  // Carregar dados relacionados quando a aba mudar
  useEffect(() => {
    if (tabValue === 1) {
      fetchAlocacoes();
    } else if (tabValue === 2) {
      fetchPagamentos();
    }
  }, [tabValue]);
  
  // Função para buscar alocações
  const fetchAlocacoes = async () => {
    try {
      setLoadingAlocacoes(true);
      
      const response = await api.get(`/alocacoes`, {
        params: {
          funcionario_id: id,
          limit: 10,
          sortBy: 'data_alocacao',
          sortOrder: 'desc'
        }
      });
      
      setAlocacoes(response.data.data);
      
    } catch (err) {
      console.error('Erro ao carregar alocações:', err);
      enqueueSnackbar(t('allocations.error.loadFailed'), { variant: 'error' });
    } finally {
      setLoadingAlocacoes(false);
    }
  };
  
  // Função para buscar pagamentos
  const fetchPagamentos = async () => {
    try {
      setLoadingPagamentos(true);
      
      const response = await api.get(`/pagamentos/funcionarios`, {
        params: {
          funcionario_id: id,
          limit: 10,
          sortBy: 'data_pagamento',
          sortOrder: 'desc'
        }
      });
      
      setPagamentos(response.data.data);
      
    } catch (err) {
      console.error('Erro ao carregar pagamentos:', err);
      enqueueSnackbar(t('payments.error.loadFailed'), { variant: 'error' });
    } finally {
      setLoadingPagamentos(false);
    }
  };
  
  // Manipulador para mudança de abas
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Manipulador para editar funcionário
  const handleEdit = () => {
    navigate(`/funcionarios/${id}/editar`);
  };
  
  // Manipulador para visualizar todas as alocações
  const handleViewAllAllocations = () => {
    navigate(`/alocacoes?funcionario_id=${id}`);
  };
  
  // Manipulador para voltar à lista
  const handleBack = () => {
    navigate('/funcionarios');
  };
  
  // Manipulador para visualizar detalhe da alocação
  const handleViewAllocation = (alocacaoId) => {
    navigate(`/alocacoes/${alocacaoId}`);
  };
  
  // Manipulador para visualizar detalhe do pagamento
  const handleViewPayment = (pagamentoId) => {
    navigate(`/pagamentos/funcionarios/${pagamentoId}`);
  };
  
  // Formatar string para exibição caso exista
  const formatIfExists = (value) => {
    return value ? value : '-';
  };
  
  if (loading) {
    return (
      <Container maxWidth="md">
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (error || !funcionario) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ my: 2 }}>
          {error || t('employees.error.notFound')}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          {t('common.back')}
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">
            {formatters.name(funcionario.nome, funcionario.nome_japones)}
          </Typography>
          
          <Box>
            {currentUser?.permissions?.canEditEmployee && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<EditIcon />}
                onClick={handleEdit}
                sx={{ mr: 1 }}
              >
                {t('common.edit')}
              </Button>
            )}
            
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
            >
              {t('common.back')}
            </Button>
          </Box>
        </Box>
        
        <Box display="flex" alignItems="center" mb={2}>
          <Chip
            label={funcionario.cargo}
            color="primary"
            sx={{ mr: 1 }}
          />
          <Chip
            label={funcionario.ativo ? t('common.active') : t('common.inactive')}
            color={funcionario.ativo ? 'success' : 'default'}
          />
        </Box>
        
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="employee details tabs"
        >
          <Tab 
            icon={<PersonIcon />} 
            label={t('employees.details')} 
            id="details-tab"
            aria-controls="details-tabpanel"
          />
          <Tab 
            icon={<AssignmentIcon />} 
            label={t('allocations.title')} 
            id="allocations-tab"
            aria-controls="allocations-tabpanel"
          />
          <Tab 
            icon={<MonetizationOnIcon />} 
            label={t('payments.title')} 
            id="payments-tab"
            aria-controls="payments-tabpanel"
          />
        </Tabs>
        
        {/* Tab de Detalhes */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" mb={2}>
                <PersonIcon color="primary" sx={{ mr: 2 }} />
                <Typography variant="subtitle1">
                  {t('employees.name')}
                </Typography>
              </Box>
              <Typography variant="body1" mb={3}>
                {formatters.name(funcionario.nome, funcionario.nome_japones)}
              </Typography>
              
              <Box display="flex" alignItems="center" mb={2}>
                <LocationOnIcon color="primary" sx={{ mr: 2 }} />
                <Typography variant="subtitle1">
                  {t('employees.address')}
                </Typography>
              </Box>
              <Typography variant="body1" mb={3}>
                {formatIfExists(funcionario.endereco)}
              </Typography>
              
              <Box display="flex" alignItems="center" mb={2}>
                <PhoneIcon color="primary" sx={{ mr: 2 }} />
                <Typography variant="subtitle1">
                  {t('employees.phone')}
                </Typography>
              </Box>
              <Typography variant="body1" mb={3}>
                {formatIfExists(funcionario.telefone)}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" mb={2}>
                <WorkIcon color="primary" sx={{ mr: 2 }} />
                <Typography variant="subtitle1">
                  {t('employees.position')}
                </Typography>
              </Box>
              <Typography variant="body1" mb={3}>
                {funcionario.cargo}
              </Typography>
              
              <Box display="flex" alignItems="center" mb={2}>
                <MonetizationOnIcon color="primary" sx={{ mr: 2 }} />
                <Typography variant="subtitle1">
                  {t('employees.dailyRate')}
                </Typography>
              </Box>
              <Typography variant="body1" mb={3}>
                {formatters.currency(funcionario.valor_diaria, i18n.language)}
              </Typography>
              
              <Box display="flex" alignItems="center" mb={2}>
                <MonetizationOnIcon color="primary" sx={{ mr: 2 }} />
                <Typography variant="subtitle1">
                  {t('employees.halfDayRate')}
                </Typography>
              </Box>
              <Typography variant="body1" mb={3}>
                {funcionario.valor_meio_periodo 
                  ? formatters.currency(funcionario.valor_meio_periodo, i18n.language)
                  : '-'}
              </Typography>
              
              <Box display="flex" alignItems="center" mb={2}>
                <EventNoteIcon color="primary" sx={{ mr: 2 }} />
                <Typography variant="subtitle1">
                  {t('employees.hireDate')}
                </Typography>
              </Box>
              <Typography variant="body1" mb={3}>
                {funcionario.data_admissao 
                  ? formatters.date(funcionario.data_admissao, i18n.language)
                  : '-'}
              </Typography>
              
              <Box display="flex" alignItems="center" mb={2}>
                <DescriptionIcon color="primary" sx={{ mr: 2 }} />
                <Typography variant="subtitle1">
                  {t('employees.document')}
                </Typography>
              </Box>
              <Typography variant="body1" mb={3}>
                {formatIfExists(funcionario.documento)}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" mb={1}>
                {t('common.observations')}
              </Typography>
              <Typography variant="body1">
                {formatIfExists(funcionario.observacoes)}
              </Typography>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Tab de Alocações */}
        <TabPanel value={tabValue} index={1}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              {t('allocations.recent')}
            </Typography>
            
            <Button
              variant="outlined"
              onClick={handleViewAllAllocations}
            >
              {t('common.viewAll')}
            </Button>
          </Box>
          
          {loadingAlocacoes ? (
            <Box display="flex" justifyContent="center" my={3}>
              <CircularProgress />
            </Box>
          ) : alocacoes.length === 0 ? (
            <Alert severity="info">
              {t('allocations.noRecords')}
            </Alert>
          ) : (
            <List>
              {alocacoes.map(alocacao => (
                <ListItem 
                  key={alocacao.id}
                  divider
                  button
                  onClick={() => handleViewAllocation(alocacao.id)}
                >
                  <ListItemText
                    primary={`${formatters.date(alocacao.data_alocacao, i18n.language)} - ${alocacao.empresa_nome}`}
                    secondary={`${t('allocations.value')}: ${formatters.currency(alocacao.valor_pago_funcionario, i18n.language)}`}
                  />
                  <Chip
                    label={formatters.paymentStatus(alocacao.status_pagamento_funcionario, i18n.language)}
                    color={alocacao.status_pagamento_funcionario === 'pago' ? 'success' : 'warning'}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          )}
        </TabPanel>
        
        {/* Tab de Pagamentos */}
        <TabPanel value={tabValue} index={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              {t('payments.recent')}
            </Typography>
            
            <Button
              variant="outlined"
              onClick={() => navigate(`/pagamentos/funcionarios?funcionario_id=${id}`)}
            >
              {t('common.viewAll')}
            </Button>
          </Box>
          
          {loadingPagamentos ? (
            <Box display="flex" justifyContent="center" my={3}>
              <CircularProgress />
            </Box>
          ) : pagamentos.length === 0 ? (
            <Alert severity="info">
              {t('payments.noRecords')}
            </Alert>
          ) : (
            <List>
              {pagamentos.map(pagamento => (
                <ListItem 
                  key={pagamento.id}
                  divider
                  button
                  onClick={() => handleViewPayment(pagamento.id)}
                >
                  <ListItemText
                    primary={`${formatters.date(pagamento.data_pagamento, i18n.language)}`}
                    secondary={`${t('payments.period')}: ${formatters.date(pagamento.periodo_inicio, i18n.language)} - ${formatters.date(pagamento.periodo_fim, i18n.language)}`}
                  />
                  <Typography variant="body1" sx={{ fontWeight: 'bold', mr: 2 }}>
                    {formatters.currency(pagamento.valor_total, i18n.language)}
                  </Typography>
                </ListItem>
              ))}
            </List>
          )}
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default FuncionarioDetails;