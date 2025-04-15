import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  MenuItem,
  Button,
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment,
  Autocomplete,
  CircularProgress,
  Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

/**
 * Componente de formulário para criação e edição de alocações
 * @param {Object} props - Propriedades do componente
 * @param {Object} props.alocacao - Dados da alocação (para edição)
 * @param {string} props.data - Data da alocação (para criação)
 * @param {Array} props.empresas - Lista de empresas disponíveis
 * @param {Array} props.funcionarios - Lista de funcionários disponíveis
 * @param {Function} props.onSave - Função chamada ao salvar
 * @param {Function} props.onCancel - Função chamada ao cancelar
 */
const AlocacaoForm = ({ alocacao, data, empresas, funcionarios, onSave, onCancel }) => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    empresa_id: '',
    funcionario_id: '',
    data_alocacao: '',
    tipo_periodo: 'integral',
    valor_pago_funcionario: '',
    valor_cobrado_empresa: '',
    tipo_servico_id: '',
    local_servico: '',
    descricao_servico: '',
    observacoes: ''
  });
  
  // Estado para controle de erro no formulário
  const [errors, setErrors] = useState({});
  
  // Estado para controle de edição de valores
  const [editingValorFuncionario, setEditingValorFuncionario] = useState(false);
  const [editingValorEmpresa, setEditingValorEmpresa] = useState(false);
  
  // Carrega os dados iniciais do formulário
  useEffect(() => {
    if (alocacao) {
      // Edição - preencher com dados existentes
      setFormData({
        empresa_id: alocacao.empresa_id || '',
        funcionario_id: alocacao.funcionario_id || '',
        data_alocacao: moment(alocacao.data_alocacao).format('YYYY-MM-DD') || '',
        tipo_periodo: alocacao.tipo_periodo || 'integral',
        valor_pago_funcionario: alocacao.valor_pago_funcionario || '',
        valor_cobrado_empresa: alocacao.valor_cobrado_empresa || '',
        tipo_servico_id: alocacao.tipo_servico_id || '',
        local_servico: alocacao.local_servico || '',
        descricao_servico: alocacao.descricao_servico || '',
        observacoes: alocacao.observacoes || ''
      });
    } else if (data) {
      // Criação - preencher apenas a data
      setFormData(prev => ({
        ...prev,
        data_alocacao: moment(data).format('YYYY-MM-DD')
      }));
    }
  }, [alocacao, data]);
  
  // Manipulador de alteração nos campos do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Atualizar o estado do formulário
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar mensagem de erro para o campo alterado
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
    
    // Atualização de valores automáticos quando a empresa ou funcionário mudam
    if (name === 'empresa_id' && !editingValorEmpresa) {
      const empresa = empresas.find(e => e.id === parseInt(value, 10));
      if (empresa) {
        setFormData(prev => ({
          ...prev,
          valor_cobrado_empresa: empresa.valor_padrao_servico || ''
        }));
      }
    }
    
    if (name === 'funcionario_id' && !editingValorFuncionario) {
      const funcionario = funcionarios.find(f => f.id === parseInt(value, 10));
      if (funcionario) {
        // Ajustar valor conforme o tipo de período
        const valorDiaria = formData.tipo_periodo === 'integral' 
          ? funcionario.valor_diaria 
          : (funcionario.valor_meio_periodo || funcionario.valor_diaria / 2);
        
        setFormData(prev => ({
          ...prev,
          valor_pago_funcionario: valorDiaria || ''
        }));
      }
    }
    
    if (name === 'tipo_periodo' && !editingValorFuncionario && formData.funcionario_id) {
      const funcionario = funcionarios.find(f => f.id === parseInt(formData.funcionario_id, 10));
      if (funcionario) {
        // Ajustar valor conforme o tipo de período
        const valorDiaria = value === 'integral' 
          ? funcionario.valor_diaria 
          : (funcionario.valor_meio_periodo || funcionario.valor_diaria / 2);
        
        setFormData(prev => ({
          ...prev,
          valor_pago_funcionario: valorDiaria || ''
        }));
      }
    }
  };
  
  // Manipulador para alteração de valor com edição manual
  const handleValorChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'valor_pago_funcionario') {
      setEditingValorFuncionario(true);
    } else if (name === 'valor_cobrado_empresa') {
      setEditingValorEmpresa(true);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar mensagem de erro
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  // Validação do formulário
  const validateForm = () => {
    const newErrors = {};
    
    // Validar campos obrigatórios
    if (!formData.empresa_id) {
      newErrors.empresa_id = t('validation.required');
    }
    
    if (!formData.funcionario_id) {
      newErrors.funcionario_id = t('validation.required');
    }
    
    if (!formData.data_alocacao) {
      newErrors.data_alocacao = t('validation.required');
    }
    
    if (!formData.valor_pago_funcionario) {
      newErrors.valor_pago_funcionario = t('validation.required');
    } else if (parseFloat(formData.valor_pago_funcionario) <= 0) {
      newErrors.valor_pago_funcionario = t('validation.mustBePositive');
    }
    
    if (!formData.valor_cobrado_empresa) {
      newErrors.valor_cobrado_empresa = t('validation.required');
    } else if (parseFloat(formData.valor_cobrado_empresa) <= 0) {
      newErrors.valor_cobrado_empresa = t('validation.mustBePositive');
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
    
    try {
      setLoading(true);
      
      // Converter valores para números
      const formattedData = {
        ...formData,
        empresa_id: parseInt(formData.empresa_id, 10),
        funcionario_id: parseInt(formData.funcionario_id, 10),
        valor_pago_funcionario: parseFloat(formData.valor_pago_funcionario),
        valor_cobrado_empresa: parseFloat(formData.valor_cobrado_empresa),
        tipo_servico_id: formData.tipo_servico_id ? parseInt(formData.tipo_servico_id, 10) : null
      };
      
      // Chamar função de salvamento
      await onSave(formattedData);
      
    } catch (error) {
      console.error('Erro ao salvar alocação:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            label={t('allocation.company')}
            name="empresa_id"
            value={formData.empresa_id}
            onChange={handleChange}
            error={!!errors.empresa_id}
            helperText={errors.empresa_id}
            required
            disabled={loading}
          >
            <MenuItem value="">{t('common.select')}</MenuItem>
            {empresas.map(empresa => (
              <MenuItem key={empresa.id} value={empresa.id}>
                {empresa.nome}
                {empresa.nome_japones && ` / ${empresa.nome_japones}`}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            label={t('allocation.employee')}
            name="funcionario_id"
            value={formData.funcionario_id}
            onChange={handleChange}
            error={!!errors.funcionario_id}
            helperText={errors.funcionario_id}
            required
            disabled={loading}
          >
            <MenuItem value="">{t('common.select')}</MenuItem>
            {funcionarios.map(funcionario => (
              <MenuItem key={funcionario.id} value={funcionario.id}>
                {funcionario.nome}
                {funcionario.nome_japones && ` / ${funcionario.nome_japones}`}
                {` (${funcionario.cargo})`}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="date"
            label={t('allocation.date')}
            name="data_alocacao"
            value={formData.data_alocacao}
            onChange={handleChange}
            error={!!errors.data_alocacao}
            helperText={errors.data_alocacao}
            required
            disabled={loading}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl component="fieldset">
            <FormLabel component="legend">{t('allocation.periodType')}</FormLabel>
            <RadioGroup
              row
              name="tipo_periodo"
              value={formData.tipo_periodo}
              onChange={handleChange}
            >
              <FormControlLabel 
                value="integral" 
                control={<Radio />} 
                label={t('allocation.fullDay')} 
                disabled={loading}
              />
              <FormControlLabel 
                value="meio" 
                control={<Radio />} 
                label={t('allocation.halfDay')} 
                disabled={loading}
              />
            </RadioGroup>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label={t('allocation.employeePayment')}
            name="valor_pago_funcionario"
            value={formData.valor_pago_funcionario}
            onChange={handleValorChange}
            error={!!errors.valor_pago_funcionario}
            helperText={errors.valor_pago_funcionario}
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
            type="number"
            label={t('allocation.companyCharge')}
            name="valor_cobrado_empresa"
            value={formData.valor_cobrado_empresa}
            onChange={handleValorChange}
            error={!!errors.valor_cobrado_empresa}
            helperText={errors.valor_cobrado_empresa}
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
            label={t('allocation.serviceLocation')}
            name="local_servico"
            value={formData.local_servico}
            onChange={handleChange}
            disabled={loading}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={t('allocation.serviceDescription')}
            name="descricao_servico"
            value={formData.descricao_servico}
            onChange={handleChange}
            disabled={loading}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label={t('common.observations')}
            name="observacoes"
            value={formData.observacoes}
            onChange={handleChange}
            disabled={loading}
          />
        </Grid>
      </Grid>
      
      <Box display="flex" justifyContent="flex-end" mt={3}>
        <Button 
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
    </form>
  );
};

export default AlocacaoForm;