// Localização: kurochan-frontend/src/pages/auth/ForgotPassword.jsx

import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Link
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

const ForgotPassword = () => {
  const { t } = useTranslation();
  
  // Estados do formulário
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Manipulador de submissão do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError(t('validation.required'));
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      // Enviar solicitação de redefinição de senha
      await api.post('/auth/forgot-password', { email });
      
      // Mostrar mensagem de sucesso
      setSuccess(true);
      setEmail('');
      
    } catch (err) {
      console.error('Erro ao solicitar redefinição de senha:', err);
      setError(err.response?.data?.message || t('auth.error.resetPasswordFailed'));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2
          }}
        >
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Kurochan
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {t('auth.forgotPassword')}
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {t('auth.resetPasswordEmailSent')}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label={t('auth.email')}
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || success}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading || success}
              startIcon={loading ? <CircularProgress size={24} /> : null}
            >
              {t('auth.sendResetLink')}
            </Button>
            
            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/login" variant="body2">
                <ArrowBackIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                {t('auth.backToLogin')}
              </Link>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPassword;