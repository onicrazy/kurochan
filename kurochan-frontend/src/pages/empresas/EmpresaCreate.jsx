import React, { useState } from 'react';
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
  Alert
} from '@mui/material';
import { 
  Save as SaveIcon, 
  ArrowBack as ArrowBackIcon 
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useSnackbar } from 'notistack';

/**
 * Componente para criar uma nova empresa
 */
const EmpresaCreate = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
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
    observacoes: ''
  });
  
  // Estados para controle da UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Manipulador de alteração nos campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      await api.post('/empresas', dataToSubmit);
      
      // Mostrar mensagem de sucesso
      enqueueSnackbar(t('companies.success.created'), { variant: 'success' });
      
      // Redirecionar para a lista
      navigate('/empresas');
      
    } catch (err) {
      console.error('Erro ao criar empresa:', err);
      setError(err.response?.data?.message || t('common.errorSavingData'));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">{t('companies.newCompany')}</Typography>
          
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/empresas')}
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
                  onClick={() => navigate('/empresas')}
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

export default EmpresaCreate;