import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  InputAdornment,
  CircularProgress,
  Alert,
  FormControlLabel,
  Switch
} from '@mui/material';
import { 
  Save as SaveIcon, 
  ArrowBack as ArrowBackIcon 
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { useSnackbar } from 'notistack';

/**
 * Componente para editar uma empresa existente
 */
const EmpresaEdit = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  
  // Estado para formulário
  const [formData, setFormData] = useState({
    nome: '',
    nome_japones: '',
    endereco: '',
    contato_nome: '',
    contato_telefone: '',
    contato_email: '',
    valor_padrao_servico: '',
    ativa: true,
    observacoes: ''
  });
  
  // Estados para controle da UI
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  
  // Carregar dados da empresa
  useEffect(() => {
    const fetchEmpresa = async () => {
      try {
        setLoadingData(true);
        setError(null);
        
        const response = await api.get(`/empresas/${id}`);
        setFormData(response.data.data);
        
      } catch (err) {
        console.error('Erro ao carregar empresa:', err);
        setError(t('companies.error.notFound'));
      } finally {
        setLoadingData(false);
      }
    };
    
    fetchEmpresa();
  }, [id, t]);
  
  // Manipulador de alteração nos campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Manipulador para campos de checkbox
  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  // Validação do formulário
  const validateForm = () => {
    const errors = {};
    
    if (!formData.nome) errors.nome = t('validation.required');
    if (!formData.valor_padrao_servico) errors.valor_padrao_servico = t('validation.required');
    else if (parseFloat(formData.valor_padrao_servico) <= 0) errors.valor_padrao_servico = t('validation.mustBePositive');
    
    return errors;
  };
  
  // Manipulador de submissão do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar formulário
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setError(Object.values(errors)[0]);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Formatar dados
      const dataToSubmit = {
        ...formData,
        valor_padrao_servico: parseFloat(formData.valor_padrao_servico)
      };
      
      // Enviar dados para API
      await api.put(`/empresas/${id}`, dataToSubmit);
      
      // Mostrar mensagem de sucesso
      enqueueSnackbar(t('companies.success.updated'), { variant: 'success' });
      
      // Redirecionar para a visualização
      navigate(`/empresas/${id}`);
      
    } catch (err) {
      console.error('Erro ao atualizar empresa:', err);
      setError(err.response?.data?.message || t('common.errorSavingData'));
    } finally {
      setLoading(false);
    }
  };
  
  if (loadingData) {
    return (
      <Container maxWidth="md">
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">{t('companies.editCompany')}</Typography>
          
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/empresas/${id}`)}
          >
            {t('common.back')}
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('companies.name')}
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('companies.japaneseName')}
                name="nome_japones"
                value={formData.nome_japones}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('companies.address')}
                name="endereco"
                value={formData.endereco}
                onChange={handleChange}
                multiline
                rows={2}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('companies.contactName')}
                name="contato_nome"
                value={formData.contato_nome}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('companies.contactPhone')}
                name="contato_telefone"
                value={formData.contato_telefone}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('companies.contactEmail')}
                name="contato_email"
                value={formData.contato_email}
                onChange={handleChange}
                type="email"
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('companies.defaultServiceRate')}
                name="valor_padrao_servico"
                type="number"
                value={formData.valor_padrao_servico}
                onChange={handleChange}
                required
                disabled={loading}
                InputProps={{
                  startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.ativa}
                    onChange={handleSwitchChange}
                    name="ativa"
                    color="primary"
                    disabled={loading}
                  />
                }
                label={t('companies.active')}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('common.observations')}
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                multiline
                rows={3}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end">
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => navigate(`/empresas/${id}`)}
                  disabled={loading}
                  sx={{ mr: 1 }}
                >
                  {t('common.cancel')}
                </Button>
                
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                  disabled={loading}
                >
                  {t('common.save')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default EmpresaEdit;