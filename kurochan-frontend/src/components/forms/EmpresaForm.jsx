import React, { useState } from 'react';
import {
  Grid,
  TextField,
  Button,
  Box,
  FormControlLabel,
  Switch,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { useTranslation } from 'react-i18next';

/**
 * Componente de formulário para criação e edição de empresas
 * @param {Object} props - Propriedades do componente
 * @param {Object} props.empresa - Dados da empresa (para edição)
 * @param {Function} props.onSave - Função chamada ao salvar
 * @param {Function} props.onCancel - Função chamada ao cancelar
 * @param {boolean} props.loading - Indica se está carregando
 */
const EmpresaForm = ({ empresa, onSave, onCancel, loading = false }) => {
  const { t } = useTranslation();
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    nome: empresa?.nome || '',
    nome_japones: empresa?.nome_japones || '',
    endereco: empresa?.endereco || '',
    contato_nome: empresa?.contato_nome || '',
    contato_telefone: empresa?.contato_telefone || '',
    contato_email: empresa?.contato_email || '',
    valor_padrao_servico: empresa?.valor_padrao_servico || '',
    ativa: empresa ? empresa.ativa : true,
    observacoes: empresa?.observacoes || ''
  });
  
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
  
  // Validação do formulário
  const validateForm = () => {
    const newErrors = {};
    
    // Validar campos obrigatórios
    if (!formData.nome) {
      newErrors.nome = t('validation.required');
    }
    
    if (!formData.valor_padrao_servico) {
      newErrors.valor_padrao_servico = t('validation.required');
    } else if (parseFloat(formData.valor_padrao_servico) <= 0) {
      newErrors.valor_padrao_servico = t('validation.mustBePositive');
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
      valor_padrao_servico: parseFloat(formData.valor_padrao_servico)
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
            label={t('companies.name')}
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
            type="email"
            value={formData.contato_email}
            onChange={handleChange}
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
            error={!!errors.valor_padrao_servico}
            helperText={errors.valor_padrao_servico}
            required
            disabled={loading}
            InputProps={{
              startAdornment: <InputAdornment position="start">¥</InputAdornment>,
            }}
          />
        </Grid>
        
        {empresa && (
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

export default EmpresaForm;