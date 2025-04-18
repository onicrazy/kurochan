// Localização: kurochan-frontend/src/pages/funcionarios/FuncionarioEdit.jsx

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
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  FormControlLabel,
  Switch
} from '@mui/material';
import { 
  Save as SaveIcon, 
  ArrowBack as ArrowBackIcon 
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import api from '../../services/api';

const FuncionarioEdit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    nome: '',
    nome_japones: '',
    endereco: '',
    telefone: '',
    cargo: '',
    valor_diaria: '',
    valor_meio_periodo: '',
    data_admissao: '',
    documento: '',
    ativo: true,
    observacoes: ''
  });
  
  // Estados para controle da UI
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  
  // Lista de cargos disponíveis
  const cargos = [
    { value: 'motorista', label: t('employees.driver') },
    { value: 'auxiliar', label: t('employees.assistant') },
    { value: 'operador', label: t('common.operator') },
    { value: 'supervisor', label: t('common.supervisor') }
  ];
  
  // Carregar dados do funcionário
  useEffect(() => {
    const fetchFuncionario = async () => {
      try {
        setLoadingData(true);
        setError(null);
        
        const response = await api.get(`/funcionarios/${id}`);
        
        // Formatar a data_admissao para o formato esperado pelo campo date (YYYY-MM-DD)
        const funcionario = response.data.data;
        if (funcionario.data_admissao) {
          funcionario.data_admissao = funcionario.data_admissao.split('T')[0]; // Pegar apenas a parte da data
        }
        
        setFormData(funcionario);
        
      } catch (err) {
        console.error('Erro ao carregar funcionário:', err);
        setError(t('employees.error.notFound'));
      } finally {
        setLoadingData(false);
      }
    };
    
    fetchFuncionario();
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
    if (!formData.cargo) errors.cargo = t('validation.required');
    if (!formData.valor_diaria) errors.valor_diaria = t('validation.required');
    else if (parseFloat(formData.valor_diaria) <= 0) errors.valor_diaria = t('validation.mustBePositive');
    
    if (formData.valor_meio_periodo && parseFloat(formData.valor_meio_periodo) <= 0) {
      errors.valor_meio_periodo = t('validation.mustBePositive');
    }
    
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
        valor_diaria: parseFloat(formData.valor_diaria),
        valor_meio_periodo: formData.valor_meio_periodo 
          ? parseFloat(formData.valor_meio_periodo) 
          : null
      };
      
      // Enviar dados para API
      await api.put(`/funcionarios/${id}`, dataToSubmit);
      
      // Mostrar mensagem de sucesso
      enqueueSnackbar(t('employees.success.updated'), { variant: 'success' });
      
      // Redirecionar para a visualização
      navigate(`/funcionarios/${id}`);
      
    } catch (err) {
      console.error('Erro ao atualizar funcionário:', err);
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
          <Typography variant="h5">{t('employees.editEmployee')}</Typography>
          
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/funcionarios/${id}`)}
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
                label={t('employees.name')}
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
                label={t('employees.japaneseName')}
                name="nome_japones"
                value={formData.nome_japones}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('employees.address')}
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
                label={t('employees.phone')}
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>{t('employees.position')}</InputLabel>
                <Select
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleChange}
                  label={t('employees.position')}
                  required
                  disabled={loading}
                >
                  {cargos.map(cargo => (
                    <MenuItem key={cargo.value} value={cargo.value}>
                      {cargo.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('employees.dailyRate')}
                name="valor_diaria"
                type="number"
                value={formData.valor_diaria}
                onChange={handleChange}
                required
                disabled={loading}
                InputProps={{
                  startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('employees.halfDayRate')}
                name="valor_meio_periodo"
                type="number"
                value={formData.valor_meio_periodo}
                onChange={handleChange}
                disabled={loading}
                InputProps={{
                  startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('employees.hireDate')}
                name="data_admissao"
                type="date"
                value={formData.data_admissao}
                onChange={handleChange}
                disabled={loading}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('employees.document')}
                name="documento"
                value={formData.documento}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.ativo}
                    onChange={handleSwitchChange}
                    name="ativo"
                    color="primary"
                    disabled={loading}
                  />
                }
                label={t('employees.active')}
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
                  onClick={() => navigate(`/funcionarios/${id}`)}
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

export default FuncionarioEdit;