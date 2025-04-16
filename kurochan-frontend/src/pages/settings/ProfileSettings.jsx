import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Tab,
  Tabs,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Person as PersonIcon,
  Save as SaveIcon,
  VpnKey as VpnKeyIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

// Componente para exibir o conteúdo da tab
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
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ProfileSettings = () => {
  const { t, i18n } = useTranslation();
  const { currentUser, checkAuth } = useAuth();
  
  // Estados para as tabs
  const [tabValue, setTabValue] = useState(0);
  
  // Estados para o formulário de perfil
  const [profileData, setProfileData] = useState({
    nome: '',
    email: '',
    idioma_preferido: i18n.language
  });
  
  // Estados para o formulário de senha
  const [passwordData, setPasswordData] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });
  
  // Estados para visibilidade das senhas
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Estados para controle da UI
  const [loading, setLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  // Carregar dados do usuário
  useEffect(() => {
    if (currentUser) {
      setProfileData({
        nome: currentUser.nome || '',
        email: currentUser.email || '',
        idioma_preferido: currentUser.idioma_preferido || i18n.language
      });
    }
  }, [currentUser, i18n.language]);
  
  // Manipuladores de eventos
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError(null);
    setProfileSuccess(false);
    setPasswordSuccess(false);
  };
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    
    // Se o idioma for alterado, atualizar imediatamente
    if (name === 'idioma_preferido') {
      i18n.changeLanguage(value);
    }
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };
  
  // Salvar perfil
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      setProfileSuccess(false);
      
      // Enviar dados para a API
      await api.put('/users/profile', {
        nome: profileData.nome,
        idioma_preferido: profileData.idioma_preferido
      });
      
      // Atualizar dados do usuário na aplicação
      await checkAuth();
      
      setProfileSuccess(true);
      
    } catch (err) {
      console.error('Erro ao salvar perfil:', err);
      setError(t('settings.error.updateFailed'));
    } finally {
      setLoading(false);
    }
  };
  
  // Alterar senha
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Validar confirmação de senha
    if (passwordData.novaSenha !== passwordData.confirmarSenha) {
      setError(t('validation.passwordMismatch'));
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setPasswordSuccess(false);
      
      // Enviar dados para a API
      await api.post('/auth/change-password', {
        senhaAtual: passwordData.senhaAtual,
        novaSenha: passwordData.novaSenha
      });
      
      // Limpar campos de senha
      setPasswordData({
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: ''
      });
      
      setPasswordSuccess(true);
      
    } catch (err) {
      console.error('Erro ao alterar senha:', err);
      
      if (err.response?.status === 401) {
        setError(t('auth.error.incorrectPassword'));
      } else {
        setError(t('settings.error.updateFailed'));
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          {t('settings.title')}
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="settings tabs">
            <Tab 
              icon={<PersonIcon />} 
              label={t('settings.profile')} 
              id="profile-tab"
              aria-controls="profile-tabpanel"
            />
            <Tab 
              icon={<VpnKeyIcon />} 
              label={t('settings.security')} 
              id="security-tab"
              aria-controls="security-tabpanel"
            />
          </Tabs>
        </Box>
        
        {/* Tab de Perfil */}
        <TabPanel value={tabValue} index={0}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {profileSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {t('settings.success.settingsUpdated')}
            </Alert>
          )}
          
          <form onSubmit={handleSaveProfile}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('users.name')}
                  name="nome"
                  value={profileData.nome}
                  onChange={handleProfileChange}
                  required
                  disabled={loading}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('users.email')}
                  name="email"
                  value={profileData.email}
                  disabled={true} // Email não pode ser alterado
                  helperText={t('settings.cannotChangeEmail')}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>{t('settings.language')}</InputLabel>
                  <Select
                    name="idioma_preferido"
                    value={profileData.idioma_preferido}
                    onChange={handleProfileChange}
                    label={t('settings.language')}
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
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={loading ? <CircularProgress size={24} /> : <SaveIcon />}
                    disabled={loading}
                  >
                    {t('settings.saveChanges')}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </TabPanel>
        
        {/* Tab de Segurança */}
        <TabPanel value={tabValue} index={1}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {passwordSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {t('settings.success.passwordChanged')}
            </Alert>
          )}
          
          <form onSubmit={handleChangePassword}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {t('settings.changePassword')}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('auth.currentPassword')}
                  name="senhaAtual"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordData.senhaAtual}
                  onChange={handlePasswordChange}
                  required
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          edge="end"
                        >
                          {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('auth.newPassword')}
                  name="novaSenha"
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.novaSenha}
                  onChange={handlePasswordChange}
                  required
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge="end"
                        >
                          {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('auth.confirmPassword')}
                  name="confirmarSenha"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordData.confirmarSenha}
                  onChange={handlePasswordChange}
                  required
                  disabled={loading}
                  error={passwordData.novaSenha !== passwordData.confirmarSenha && passwordData.confirmarSenha !== ''}
                  helperText={passwordData.novaSenha !== passwordData.confirmarSenha && passwordData.confirmarSenha !== '' ? t('validation.passwordMismatch') : ''}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
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
              
              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end">
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={loading ? <CircularProgress size={24} /> : <SaveIcon />}
                    disabled={loading}
                  >
                    {t('settings.saveChanges')}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default ProfileSettings;