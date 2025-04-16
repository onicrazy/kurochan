import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MonetizationOn as MonetizationOnIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Event as EventIcon,
  LocationOn as LocationOnIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';

import api from '../../services/api';
import formatters from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';
import AlocacaoForm from '../../components/forms/AlocacaoForm';

/**
 * Componente para visualizar detalhes de uma alocação
 */
const AlocacaoDetails = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const { currentUser } = useAuth();
  
  // Estados para controle de dados e UI
  const [alocacao, setAlocacao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para modal de edição
  const [openEditModal, setOpenEditModal] = useState(false);
  const [empresas, setEmpresas] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [savingAlocacao, setSavingAlocacao] = useState(false);
  const [loadingRelated, setLoadingRelated] = useState(false);
  
  // Estados para modal de confirmação de exclusão
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deletingAlocacao, setDeletingAlocacao] = useState(false);
  
  // Carregar dados da alocação
  useEffect(() => {
    const fetchAlocacao = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get(`/alocacoes/${id}`);
        setAlocacao(response.data.data);
        
      } catch (err) {
        console.error('Erro ao carregar alocação:', err);
        setError(t('allocations.error.notFound'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchAlocacao();
  }, [id, t]);
  
  // Função para buscar dados relacionados
  const fetchRelatedData = async () => {
    try {
      setLoadingRelated(true);
      
      // Buscar empresas
      const empresasResponse = await api.get('/empresas', {
        params: {
          limit: 100,
          ativa: true
        }
      });
      
      // Buscar funcionários
      const funcionariosResponse = await api.get('/funcionarios', {
        params: {
          limit: 100,
          ativo: true
        }
      });
      
      setEmpresas(empresasResponse.data.data);
      setFuncionarios(funcionariosResponse.data.data);
      
    } catch (err) {
      console.error('Erro ao carregar dados relacionados:', err);
      enqueueSnackbar(t('common.errorLoadingRelatedData'), { variant: 'error' });
    } finally {
      setLoadingRelated(false);
    }
  };
  
  // Manipulador para abrir modal de edição
  const handleOpenEditModal = () => {
    fetchRelatedData();
    setOpenEditModal(true);
  };
  
  // Manipulador para fechar o modal de edição
  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSavingAlocacao(false);
  };
  
  // Manipulador para salvar alocação
  const handleSaveAlocacao = async (formData) => {
    try {
      setSavingAlocacao(true);
      
      await api.put(`/alocacoes/${id}`, formData);
      
      // Atualizar dados da alocação
      const response = await api.get(`/alocacoes/${id}`);
      setAlocacao(response.data.data);
      
      enqueueSnackbar(t('allocations.success.updated'), { variant: 'success' });
      handleCloseEditModal();
      
    } catch (err) {
      console.error('Erro ao atualizar alocação:', err);
      enqueueSnackbar(t('allocations.error.saveFailed'), { variant: 'error' });
    } finally {
      setSavingAlocacao(false);
    }
  };
  
  // Manipulador para abrir modal de confirmação de exclusão
  const handleOpenDeleteModal = () => {
    setOpenDeleteModal(true);
  };
  
  // Manipulador para fechar modal de confirmação de exclusão
  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setDeletingAlocacao(false);
  };
  
  // Manipulador para excluir alocação
  const handleDeleteAlocacao = async () => {
    try {
      setDeletingAlocacao(true);
      
      await api.delete(`/alocacoes/${id}`);
      
      enqueueSnackbar(t('allocations.success.deleted'), { variant: 'success' });
      
      // Redirecionar para lista de alocações
      navigate('/alocacoes');
      
    } catch (err) {
      console.error('Erro ao excluir alocação:', err);
      enqueueSnackbar(t('allocations.error.deleteFailed'), { variant: 'error' });
      setDeletingAlocacao(false);
    }
  };
  
  // Manipulador para navegar para a empresa
  const handleViewEmpresa = () => {
    navigate(`/empresas/${alocacao.empresa_id}`);
  };
  
  // Manipulador para navegar para o funcionário
  const handleViewFuncionario = () => {
    navigate(`/funcionarios/${alocacao.funcionario_id}`);
  };
  
  // Manipulador para voltar à lista
  const handleBack = () => {
    navigate('/alocacoes');
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
  
  if (error || !alocacao) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ my: 2 }}>
          {error || t('allocations.error.notFound')}
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
            {t('allocations.details')}
          </Typography>
          
          <Box>
            {currentUser?.permissions?.canEditAllocation && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<EditIcon />}
                onClick={handleOpenEditModal}
                sx={{ mr: 1 }}
              >
                {t('common.edit')}
              </Button>
            )}
            
            {currentUser?.permissions?.canDeleteAllocation && (
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleOpenDeleteModal}
                sx={{ mr: 1 }}
              >
                {t('common.delete')}
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
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6">
            {formatters.date(alocacao.data_alocacao, i18n.language)}
            {alocacao.tipo_periodo === 'meio' && ` (${t('allocations.halfDay')})`}
          </Typography>
          
          <Typography variant="subtitle1" color="textSecondary">
            {t('allocations.allocation')} #{alocacao.id}
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
              <Box display="flex" alignItems="center" mb={2}>
                <BusinessIcon color="primary" sx={{ mr: 2 }} />
                <Typography variant="subtitle1">
                  {t('allocations.company')}
                </Typography>
              </Box>
              
              <Typography variant="body1" gutterBottom>
                <Button variant="text" onClick={handleViewEmpresa}>
                  {alocacao.empresa_nome}
                </Button>
              </Typography>
              
              <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2">
                  {t('allocations.companyCharge')}
                </Typography>
                <Typography variant="h6" color="primary">
                  {formatters.currency(alocacao.valor_cobrado_empresa, i18n.language)}
                </Typography>
              </Box>
              
              <Box mt={1} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2">
                  {t('allocations.status')}
                </Typography>
                <Chip
                  icon={alocacao.status_pagamento_empresa === 'pago' ? <CheckCircleIcon /> : <WarningIcon />}
                  label={formatters.paymentStatus(alocacao.status_pagamento_empresa, i18n.language)}
                  color={alocacao.status_pagamento_empresa === 'pago' ? 'success' : 'warning'}
                />
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
              <Box display="flex" alignItems="center" mb={2}>
                <PersonIcon color="primary" sx={{ mr: 2 }} />
                <Typography variant="subtitle1">
                  {t('allocations.employee')}
                </Typography>
              </Box>
              
              <Typography variant="body1" gutterBottom>
                <Button variant="text" onClick={handleViewFuncionario}>
                  {alocacao.funcionario_nome}
                </Button>
              </Typography>
              
              <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2">
                  {t('allocations.employeePayment')}
                </Typography>
                <Typography variant="h6" color="primary">
                  {formatters.currency(alocacao.valor_pago_funcionario, i18n.language)}
                </Typography>
              </Box>
              
              <Box mt={1} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2">
                  {t('allocations.status')}
                </Typography>
                <Chip
                  icon={alocacao.status_pagamento_funcionario === 'pago' ? <CheckCircleIcon /> : <WarningIcon />}
                  label={formatters.paymentStatus(alocacao.status_pagamento_funcionario, i18n.language)}
                  color={alocacao.status_pagamento_funcionario === 'pago' ? 'success' : 'warning'}
                />
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <DescriptionIcon color="primary" sx={{ mr: 2 }} />
                <Typography variant="subtitle1">
                  {t('allocations.details')}
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                {alocacao.local_servico && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">
                      {t('allocations.serviceLocation')}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {alocacao.local_servico}
                    </Typography>
                  </Grid>
                )}
                
                {alocacao.descricao_servico && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">
                      {t('allocations.serviceDescription')}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {alocacao.descricao_servico}
                    </Typography>
                  </Grid>
                )}
                
                {alocacao.observacoes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">
                      {t('common.observations')}
                    </Typography>
                    <Typography variant="body1">
                      {alocacao.observacoes}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Modal de Edição */}
      <Dialog
        open={openEditModal}
        onClose={() => !savingAlocacao && handleCloseEditModal()}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {t('allocations.editAllocation')}
        </DialogTitle>
        
        <DialogContent>
          {loadingRelated ? (
            <Box display="flex" justifyContent="center" my={3}>
              <CircularProgress />
            </Box>
          ) : (
            <AlocacaoForm 
              alocacao={alocacao}
              empresas={empresas}
              funcionarios={funcionarios}
              onSave={handleSaveAlocacao}
              onCancel={handleCloseEditModal}
              loading={savingAlocacao}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Modal de Confirmação de Exclusão */}
      <Dialog
        open={openDeleteModal}
        onClose={() => !deletingAlocacao && handleCloseDeleteModal()}
      >
	   <DialogTitle>
          {t('allocations.confirmDelete')}
        </DialogTitle>
        
        <DialogContent>
          <Typography>
            {t('allocations.deleteConfirmMessage', {
              data: formatters.date(alocacao.data_alocacao, i18n.language),
              funcionario: alocacao.funcionario_nome,
              empresa: alocacao.empresa_nome
            })}
          </Typography>
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={handleCloseDeleteModal}
            disabled={deletingAlocacao}
          >
            {t('common.cancel')}
          </Button>
          
          <Button 
            color="error"
            onClick={handleDeleteAlocacao}
            disabled={deletingAlocacao}
            startIcon={deletingAlocacao ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AlocacaoDetails;