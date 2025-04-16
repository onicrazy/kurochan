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
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon,
  MonetizationOn as MonetizationOnIcon,
  Assignment as AssignmentIcon,
  EventNote as EventNoteIcon
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
 * Componente para visualizar detalhes de uma empresa
 */
const EmpresaDetails = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const { currentUser } = useAuth();
  
  // Estados para controle de dados e UI
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Estados para dados relacionados
  const [alocacoes, setAlocacoes] = useState([]);
  const [loadingAlocacoes, setLoadingAlocacoes] = useState(false);
  
  // Carregar dados da empresa
  useEffect(() => {
    const fetchEmpresa = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get(`/empresas/${id}`);
        setEmpresa(response.data.data);
        
      } catch (err) {
        console.error('Erro ao carregar empresa:', err);
        setError(t('companies.error.notFound'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmpresa();
  }, [id, t]);
  
  // Carregar alocações da empresa quando a aba mudar
  useEffect(() => {
    if (tabValue === 1) {
      fetchAlocacoes();
    }
  }, [tabValue]);
  
  // Função para buscar alocações
  const fetchAlocacoes = async () => {
    try {
      setLoadingAlocacoes(true);
      
      const response = await api.get(`/alocacoes`, {
        params: {
          empresa_id: id,
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
  
  // Manipulador para mudança de abas
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Manipulador para editar empresa
  const handleEdit = () => {
    navigate(`/empresas/${id}/editar`);
  };
  
  // Manipulador para visualizar todas as alocações
  const handleViewAllAllocations = () => {
    navigate(`/alocacoes?empresa_id=${id}`);
  };
  
  // Manipulador para voltar à lista
  const handleBack = () => {
    navigate('/empresas');
  };
  
  // Manipulador para visualizar detalhe da alocação
  const handleViewAllocation = (alocacaoId) => {
    navigate(`/alocacoes/${alocacaoId}`);
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
  
  if (error || !empresa) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ my: 2 }}>
          {error || t('companies.error.notFound')}
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
            {formatters.name(empresa.nome, empresa.nome_japones)}
          </Typography>
          
          <Box>
            {currentUser?.permissions?.canEditCompany && (
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
        
        <Chip
          label={empresa.ativa ? t('common.active') : t('common.inactive')}
          color={empresa.ativa ? 'success' : 'default'}
          sx={{ mb: 2 }}
        />
        
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="company details tabs"
        >
          <Tab 
            icon={<BusinessIcon />} 
            label={t('companies.details')} 
            id="details-tab"
            aria-controls="details-tabpanel"
          />
          <Tab 
            icon={<AssignmentIcon />} 
            label={t('allocations.title')} 
            id="allocations-tab"
            aria-controls="allocations-tabpanel"
          />
        </Tabs>
        
        {/* Tab de Detalhes */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" mb={2}>
                <BusinessIcon color="primary" sx={{ mr: 2 }} />
                <Typography variant="subtitle1">
                  {t('companies.name')}
                </Typography>
              </Box>
              <Typography variant="body1" mb={3}>
                {formatters.name(empresa.nome, empresa.nome_japones)}
              </Typography>
              
              <Box display="flex" alignItems="center" mb={2}>
                <LocationOnIcon color="primary" sx={{ mr: 2 }} />
                <Typography variant="subtitle1">
                  {t('companies.address')}
                </Typography>
              </Box>
              <Typography variant="body1" mb={3}>
                {formatIfExists(empresa.endereco)}
              </Typography>
              
              <Box display="flex" alignItems="center" mb={2}>
                <MonetizationOnIcon color="primary" sx={{ mr: 2 }} />
                <Typography variant="subtitle1">
                  {t('companies.defaultServiceRate')}
                </Typography>
              </Box>
              <Typography variant="body1" mb={3}>
                {formatters.currency(empresa.valor_padrao_servico, i18n.language)}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" mb={2}>
                <EventNoteIcon color="primary" sx={{ mr: 2 }} />
                <Typography variant="subtitle1">
                  {t('common.createdAt')}
                </Typography>
              </Box>
              <Typography variant="body1" mb={3}>
                {formatters.date(empresa.data_criacao, i18n.language)}
              </Typography>
              
              <Box display="flex" alignItems="center" mb={2}>
                <PhoneIcon color="primary" sx={{ mr: 2 }} />
                <Typography variant="subtitle1">
                  {t('companies.contactPhone')}
                </Typography>
              </Box>
              <Typography variant="body1" mb={3}>
                {formatIfExists(empresa.contato_telefone)}
              </Typography>
              
              <Box display="flex" alignItems="center" mb={2}>
                <Email color="primary" sx={{ mr: 2 }} />
                <Typography variant="subtitle1">
                  {t('companies.contactEmail')}
                </Typography>
              </Box>
              <Typography variant="body1" mb={3}>
                {formatIfExists(empresa.contato_email)}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" mb={1}>
                {t('common.observations')}
              </Typography>
              <Typography variant="body1">
                {formatIfExists(empresa.observacoes)}
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
                    primary={`${formatters.date(alocacao.data_alocacao, i18n.language)} - ${alocacao.funcionario_nome}`}
                    secondary={`${t('allocations.value')}: ${formatters.currency(alocacao.valor_cobrado_empresa, i18n.language)}`}
                  />
                  <Chip
                    label={formatters.paymentStatus(alocacao.status_pagamento_empresa, i18n.language)}
                    color={alocacao.status_pagamento_empresa === 'pago' ? 'success' : 'warning'}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          )}
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default EmpresaDetails;