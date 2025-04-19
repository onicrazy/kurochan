import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Link,
  Grid,
  Alert,
  Container,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';

const Login = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { login, currentUser } = useAuth();
  
  // Redirecionar para dashboard se já estiver autenticado
  if (currentUser) {
    navigate('/dashboard');
  }
  
  // Estados do formulário
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Estados de controle
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Função para alternar visibilidade da senha
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Função para alterar o idioma
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };
  
  // Função para realizar o login
  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validação simples
    if (!email.trim() || !senha.trim()) {
      setError(t('validation.required'));
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const result = await login(email, senha);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      setError(t('auth.error.invalidCredentials'));
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
              {t('auth.loginToSystem')}
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleLogin} noValidate>
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
              disabled={loading}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label={t('auth.password')}
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={togglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  value="remember"
                  color="primary"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
              }
              label={t('auth.rememberMe')}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={24} /> : null}
            >
              {t('auth.login')}
            </Button>
            
            <Grid container>
              <Grid item xs>
                <Link component={RouterLink} to="/esqueci-senha" variant="body2">
                  {t('auth.forgotPassword')}
                </Link>
              </Grid>
            </Grid>
          </Box>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
              size="small"
              onClick={() => changeLanguage('pt-BR')}
              sx={{
                fontWeight: i18n.language === 'pt-BR' ? 'bold' : 'normal',
                textDecoration: i18n.language === 'pt-BR' ? 'underline' : 'none',
                mr: 1
              }}
            >
              Português
            </Button>
            <Button
              size="small"
              onClick={() => changeLanguage('ja')}
              sx={{
                fontWeight: i18n.language === 'ja' ? 'bold' : 'normal',
                textDecoration: i18n.language === 'ja' ? 'underline' : 'none',
                ml: 1
              }}
            >
              日本語
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;