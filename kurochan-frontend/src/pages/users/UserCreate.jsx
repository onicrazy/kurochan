// Localização: kurochan-frontend/src/pages/users/UserCreate.jsx

import React, { useState } from 'react';
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
  InputAdornment,
  IconButton
} from '@mui/material';
import { 
  Save as SaveIcon, 
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import api from '../../services/api';

const UserCreate = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    funcao: 'operador',
    idioma_preferido: 'pt-BR'
  });
  
  // Estados para controle da UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Manipulador de alteração nos campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Validação do formulário
  const validateForm = () => {
    const errors = {};
    
    if (!formData.nome) errors.nome = t('validation.required');
    if (!formData.email) errors.email = t('validation.required');
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = t('validation.invalidEmail');
    
    if (!formData.senha) errors.senha = t('validation.required');
    else if (formData.senha.length < 6) errors.senha = t('validation.passwordTooShort');
    
    if (!formData.confirmarSenha) errors.confirmarSenha = t('validation.required');
    else if (formData.senha !== formData.confirmarSenha) errors.confirmarSenha = t('validation.passwordMismatch');
    
    if (!formData.funcao) errors.funcao = t('validation.required');
    
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
      
      // Remover campo de confirmação de senha
      const { confirmarSenha, ...dataToSubmit } = formData;
      
      // Enviar dados para API
      await api.post('/users', dataToSubmit);
      
      // Mostrar mensagem de sucesso
      enqueueSnackbar(t('users.success.created'), { variant: 'success' });
      
      // Redirecionar para a lista
      navigate('/users');
      
    } catch (err) {
      console.error('Erro ao criar usuário:', err);
      
      if (err.response?.status === 400 && err.response?.data?.message?.includes('email')) {
        setError(t('users.error.emailAlreadyExists'));
      } else {
        setError(err.response?.data?.message || t('common.errorSavingData'));
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">{t('users.newUser')}</Typography>
          
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
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('users.password')}
                name="senha"
                type={showPassword ? 'text' : 'password'}
                value={formData.senha}
                onChange={handleChange}
                required
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('users.confirmPassword')}
                name="confirmarSenha"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmarSenha}
                onChange={handleChange}
                required
                disabled={loading}
                error={formData.senha !== formData.confirmarSenha && formData.confirmarSenha !== ''}
                helperText={
                  formData.senha !== formData.confirmarSenha && formData.confirmarSenha !== '' 
                    ? t('validation.passwordMismatch')
                    : ''
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
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
                  disabled={loading}
                >
                  <MenuItem value="administrador">{t('users.administrator')}</MenuItem>
                  <MenuItem value="gerente">{t('users.manager')}</MenuItem>
                  <MenuItem value="operador">{t('users.operator')}</MenuItem>
                </Select>
                <FormHelperText>
                  {formData.funcao === 'administrador' 
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

export default UserCreate;