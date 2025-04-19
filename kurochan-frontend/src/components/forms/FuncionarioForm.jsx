import React, { useState } from 'react';
import {
  Grid,
  TextField,
  Button,
  Box,
  FormControlLabel,
  Switch,
  InputAdornment,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { useTranslation } from 'react-i18next';

/**
 * Componente de formulário para criação e edição de funcionários
 * @param {Object} props - Propriedades do componente
 * @param {Object} props.funcionario - Dados do funcionário (para edição)
 * @param {Function} props.onSave - Função chamada ao salvar
 * @param {Function} props.onCancel - Função chamada ao cancelar
 * @param {boolean} props.loading - Indica se está carregando
 */
const FuncionarioForm = ({ funcionario, onSave, onCancel, loading = false }) => {
  const { t } = useTranslation();
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    nome: funcionario?.nome || '',
    nome_japones: funcionario?.nome_japones || '',
    endereco: funcionario?.endereco || '',
    telefone: funcionario?.telefone || '',
    cargo: funcionario?.cargo || '',
    valor_diaria: funcionario?.valor_diaria || '',
    valor_meio_periodo: funcionario?.valor_meio_periodo || '',
    data_admissao: funcionario?.data_admissao ? funcionario.data_admissao.split('T')[0] : '',
    documento: funcionario?.documento || '',
    ativo: funcionario ? funcionario.ativo : true,
    observacoes: funcionario?.observacoes || ''
  });
  
  // Estado para controle de erro no formulário
  const [errors, setErrors] = useState({});
  
  // Lista de cargos disponíveis
  const cargos = [
    { value: 'motorista', label: t('employees.driver') },
    { value: 'auxiliar', label: t('employees.assistant') },
    { value: 'operador', label: t('common.operator') },
    { value: 'supervisor', label: t('common.supervisor') }
  ];
  
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
  
  // Validação do formulário
  const validateForm = () => {
    const newErrors = {};
    
    // Validar campos obrigatórios
    if (!formData.nome) {
      newErrors.nome = t('validation.required');
    }
    
    if (!formData.cargo) {
      newErrors.cargo = t('validation.required');
    }
    
    if (!formData.valor_diaria) {
      newErrors.valor_diaria = t('validation.required');
    } else if (parseFloat(formData.valor_diaria) <= 0) {
      newErrors.valor_diaria = t('validation.mustBePositive');
    }
    
    if (formData.valor_meio_periodo && parseFloat(formData.valor_meio_periodo) <= 0) {
      newErrors.valor_meio_periodo = t('validation.mustBePositive');
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
    const dataToSubmit = {
      ...formData,
      valor_diaria: parseFloat(formData.valor_diaria),
      valor_meio_periodo: formData.valor_meio_periodo 
        ? parseFloat(formData.valor_meio_periodo) 
        : null
    };
    
    // Chamar função de salvamento
    await onSave(dataToSubmit);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={t('employees.name')}
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            error={!!errors.nome}
            helperText={errors.nome}
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
          <FormControl fullWidth error={!!errors.cargo}>
            <InputLabel>{t('employees.position')}</InputLabel>
            <Select
              name="cargo"
              value={formData.cargo}
              onChange={handleChange}
              label={t('employees.position')}
              required
              disabled={loading}
            >
              <MenuItem value="">{t('common.select')}</MenuItem>
              {cargos.map(cargo => (
                <MenuItem key={cargo.value} value={cargo.value}>
                  {cargo.label}
                </MenuItem>
              ))}
            </Select>
            {errors.cargo && (
              <FormHelperText>{errors.cargo}</FormHelperText>
            )}
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
            error={!!errors.valor_diaria}
            helperText={errors.valor_diaria}
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
            error={!!errors.valor_meio_periodo}
            helperText={errors.valor_meio_periodo}
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
        
        {funcionario && (
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
        )}
        
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

export default FuncionarioForm;