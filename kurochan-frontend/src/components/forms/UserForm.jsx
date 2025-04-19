import React, { useState } from 'react';
import {
  Grid,
  TextField,
  Button,
  Box,
  FormControlLabel,
  Switch,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

/**
 * Componente de formulário para criação e edição de usuários
 * @param {Object} props - Propriedades do componente
 * @param {Object} props.user - Dados do usuário (para edição)
 * @param {boolean} props.isCurrentUser - Indica se é o usuário atual
 * @param {Function} props.onSave - Função chamada ao salvar
 * @param {Function} props.onCancel - Função chamada ao cancelar
 * @param {boolean} props.loading - Indica se está carregando
 */
const UserForm = ({ user, isCurrentUser = false, onSave, onCancel, loading = false }) => {
  const { t } = useTranslation();
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    nome: user?.nome || '',
    email: user?.email || '',
    senha: '',
    confirmarSenha: '',
    funcao: user?.funcao || 'operador',
    idioma_preferido: user?.idioma_preferido || 'pt-BR',
    ativo: user ? user.ativo : true
  });
  
  // Estados para visibilidade das senhas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Estado para controle de erro no formulário
  const [errors, setErrors] = useState({});
  
  // Manipulador de alteração nos campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar mensagem de erro para o campo alterado
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  // Manipulador para campos de checkbox
  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  // Manipulador para alternar visibilidade da senha
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Manipulador para alternar visibilidade da confirmação de senha
  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  // Validação do formulário
  const validateForm = () => {
    const newErrors = {};
    
    // Validar campos obrigatórios
    if (!formData.nome) {
      newErrors.nome = t('validation.required');
    }
    
    if (!user) {
      // Validações apenas para criação
      if (!formData.email) {
        newErrors.email = t('validation.required');
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = t('validation.invalidEmail');
      }
      
      if (!formData.senha) {
        newErrors.senha = t('validation.required');
      } else if (formData.senha.length < 6) {
        newErrors.senha = t('validation.passwordTooShort');
      }
      
      if (!formData.confirmarSenha) {
        newErrors.confirmarSenha = t('validation.required');
      } else if (formData.senha !== formData.confirmarSenha) {
        newErrors.confirmarSenha = t('validation.passwordMismatch');
      }
    }
    
    if (!formData.funcao) {
      newErrors.funcao = t('validation.required');
    }
    
    // Se for o usuário atual, não pode desativar a si mesmo
    if (isCurrentUser && !formData.ativo) {
      newErrors.ativo = t('users.cannotDeactivateSelf');
    }
    
    setErrors(newErrors);
    
    // Retorna true se não houver erros
    return Object.keys(newErrors).length === 0;
  };
  
  // Manipulador para submissão do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar formulário
    if (!validateForm()) {
      return;
    }
    
    // Formatar dados antes de enviar
    const dataToSubmit = { ...formData };
    
    // Se for edição, remover campos de senha se vazios
    if (user) {
      if (!dataToSubmit.senha) {
        delete dataToSubmit.senha;
        delete dataToSubmit.confirmarSenha;
      }
    }
    
    // Remover campo de confirmação de senha
    delete dataToSubmit.confirmarSenha;
    
    // Chamar função de salvamento
    await onSave(dataToSubmit);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label={t('users.name')}
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            error={!!errors.nome}
            helperText={errors.nome}
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
            error={!!errors.email}
            helperText={errors.email}
            required
            disabled={loading || user}
          />
          {user && (
            <FormHelperText>
              {t('users.emailCannotBeChanged')}
            </FormHelperText>
          )}
        </Grid>
        
        {(!user || (user && formData.senha)) && (
          <>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('users.password')}
                name="senha"
                type={showPassword ? 'text' : 'password'}
                value={formData.senha}
                onChange={handleChange}
                error={!!errors.senha}
                helperText={errors.senha}
                required={!user}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePasswordVisibility}
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
                error={!!errors.confirmarSenha}
                helperText={errors.confirmarSenha}
                required={!user}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={handleToggleConfirmPasswordVisibility}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          </>
        )}
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required error={!!errors.funcao}>
            <InputLabel>{t('users.role')}</InputLabel>
            <Select
              name="funcao"
              value={formData.funcao}
              onChange={handleChange}
              label={t('users.role')}
              disabled={loading || (isCurrentUser && user?.funcao !== 'administrador')}
            >
              <MenuItem value="administrador">{t('users.administrator')}</MenuItem>
              <MenuItem value="gerente">{t('users.manager')}</MenuItem>
              <MenuItem value="operador">{t('users.operator')}</MenuItem>
            </Select>
            <FormHelperText>
              {isCurrentUser && user?.funcao !== 'administrador' 
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
        
        {user && (
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.ativo}
                  onChange={handleSwitchChange}
                  name="ativo"
                  color="primary"
                  disabled={loading || isCurrentUser}
                />
              }
              label={t('users.active')}
            />
            {isCurrentUser && (
              <FormHelperText error={!!errors.ativo}>
                {errors.ativo || t('users.cannotDeactivateSelf')}
              </FormHelperText>
            )}
          </Grid>
        )}
        
        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end" mt={1}>
            <Button
              type="button"
              variant="outlined"
              onClick={onCancel}
              disabled={loading}
              sx={{ mr: 1 }}
            >
              {t('common.cancel')}
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {t('common.save')}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default UserForm;