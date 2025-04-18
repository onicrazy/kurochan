// Localização: kurochan-frontend/src/pages/users/UserEdit.jsx

import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  FormHelperText,
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
import { useAuth } from '../../hooks/useAuth';

const UserEdit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const { currentUser } = useAuth();
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    funcao: '',
    idioma_preferido: 'pt-BR',
    ativo: true
  });
  
  // Estados para controle da UI
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  
  // Carregar dados do usuário
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoadingData(true);
        setError(null);
        
        const response = await api.get(`/users/${id}`);
        setFormData(response.data.data);
        
      } catch (err) {
        console.error('Erro ao carregar usuário:', err);
        setError(t('users.error.notFound'));
      } finally {
        setLoadingData(false);
      }
    };
    
    fetchUser();
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
    if (!formData.funcao) errors.funcao = t('validation.required');
    
    // Se tentando desativar o próprio usuário
    if (id === currentUser.id && !formData.ativo) {
      errors.ativo = t('users.error.cannotDeactivateSelf');
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
      
      // Remover campo de email (não pode ser alterado)
      const { email, ...dataToSubmit } = formData;
      
      // Enviar dados para API
      await api.put(`/users/${id}`, dataToSubmit);
      
      // Mostrar mensagem de sucesso
      enqueueSnackbar(t('users.success.updated'), { variant: 'success' });
      
      // Redirecionar para a lista
      navigate('/users');
      
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
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
          <Typography variant="h5">{t('users.editUser')}</Typography>
          
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/users')}
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
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('users.name')}
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('users.email')}
                name="email"
                value={formData.email}
                disabled={true}
                helperText={t('users.emailCannotBeChanged')}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>{t('users.role')}</InputLabel>
                <Select
                  name="funcao"
                  value={formData.funcao}
                  onChange={handleChange}
                  label={t('users.role')}
                  disabled={loading || (currentUser.id === id && currentUser.funcao !== 'administrador')}
                >
                  <MenuItem value="administrador">{t('users.administrator')}</MenuItem>
                  <MenuItem value="gerente">{t('users.manager')}</MenuItem>
                  <MenuItem value="operador">{t('users.operator')}</MenuItem>
                </Select>
                <FormHelperText>
                  {currentUser.id === id && currentUser.funcao !== 'administrador' 
                    ? t('users.cannotChangeSelfRole')
                    : formData.funcao === 'administrador' 
                      ? t('users.administratorDescription')
                      : formData.funcao === 'gerente'
                        ? t('users.managerDescription')
                        : t('users.operatorDescription')
                  }
                </FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>{t('users.language')}</InputLabel>
                <Select
                  name="idioma_preferido"
                  value={formData.idioma_preferido}
                  onChange={handleChange}
                  label={t('users.language')}
                  disabled={loading}
                >
                  <MenuItem value="pt-BR">{t('settings.portuguese')}</MenuItem>
                  <MenuItem value="ja">{t('settings.japanese')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.ativo}
                    onChange={handleSwitchChange}
                    name="ativo"
                    color="primary"
                    disabled={loading || currentUser.id === id}
                  />
                }
                label={t('users.active')}
              />
              {currentUser.id === id && (
                <FormHelperText>
                  {t('users.cannotDeactivateSelf')}
                </FormHelperText>
              )}
            </Grid>
            
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end">
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => navigate('/users')}
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

export default UserEdit;