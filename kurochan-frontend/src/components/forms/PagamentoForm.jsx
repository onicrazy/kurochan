import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  Button,
  Box,
  InputAdornment,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Divider,
  Alert
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

/**
 * Componente de formulário para criação de pagamentos a funcionários
 * @param {Object} props - Propriedades do componente
 * @param {Array} props.funcionarios - Lista de funcionários
 * @param {Function} props.onSave - Função chamada ao salvar
 * @param {Function} props.onCancel - Função chamada ao cancelar
 * @param {boolean} props.loading - Indica se está carregando
 */
const PagamentoForm = ({ funcionarios, onSave, onCancel, loading = false }) => {
  const { t, i18n } = useTranslation();
  
  // Estados para controle de carregamento
  const [loadingAlocacoes, setLoadingAlocacoes] = useState(false);
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    funcionario_id: '',
    data_pagamento: moment().format('YYYY-MM-DD'),
    periodo_inicio: moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
    periodo_fim: moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD'),
    metodo_pagamento: '',
    numero_referencia: '',
    observacoes: ''
  });
  
  // Estados para controle de erro no formulário
  const [errors, setErrors] = useState({});
  
  // Estado para alocações do funcionário
  const [alocacoes, setAlocacoes] = useState([]);
  const [alocacoesSelecionadas, setAlocacoesSelecionadas] = useState([]);
  const [valorTotal, setValorTotal] = useState(0);
  
  // Efeito para carregar alocações quando o funcionário ou período mudar
  useEffect(() => {
    if (formData.funcionario_id && formData.periodo_inicio && formData.periodo_fim) {
      fetchAlocacoesFuncionario();
    }
  }, [formData.funcionario_id, formData.periodo_inicio, formData.periodo_fim]);
  
  // Efeito para calcular o valor total quando as alocações selecionadas mudarem
  useEffect(() => {
    const total = alocacoesSelecionadas.reduce((sum, alocacao) => sum + alocacao.valor_pago_funcionario, 0);
    setValorTotal(total);
  }, [alocacoesSelecionadas]);
  
  // Função para buscar alocações de um funcionário em um período
  const fetchAlocacoesFuncionario = async () => {
    try {
      setLoadingAlocacoes(true);
      
      // Simulação - em um ambiente real, isso seria uma chamada à API
      // const response = await api.get('/alocacoes', {
      //   params: {
      //     funcionario_id: formData.funcionario_id,
      //     data_inicio: formData.periodo_inicio,
      //     data_fim: formData.periodo_fim,
      //     status_pagamento_funcionario: 'pendente'
      //   }
      // });
      
      // Dados de exemplo - remover em produção
      const exampleAlocacoes = [
        {
          id: 1,
          data_alocacao: '2023-01-05',
          empresa_nome: 'Empresa A',
          tipo_periodo: 'integral',
          valor_pago_funcionario: 15000,
          status_pagamento_funcionario: 'pendente'
        },
        {
          id: 2,
          data_alocacao: '2023-01-10',
          empresa_nome: 'Empresa B',
          tipo_periodo: 'integral',
          valor_pago_funcionario: 15000,
          status_pagamento_funcionario: 'pendente'
        },
        {
          id: 3,
          data_alocacao: '2023-01-15',
          empresa_nome: 'Empresa C',
          tipo_periodo: 'meio',
          valor_pago_funcionario: 7500,
          status_pagamento_funcionario: 'pendente'
        }
      ];
      
      setAlocacoes(exampleAlocacoes);
      
      // Selecionar todas as alocações por padrão
      setAlocacoesSelecionadas(exampleAlocacoes);
      
    } catch (err) {
      console.error('Erro ao buscar alocações do funcionário:', err);
    } finally {
      setLoadingAlocacoes(false);
    }
  };
  
  // Manipulador de alteração nos campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar mensagem de erro para o campo alterado
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  // Manipulador para seleção de alocações
  const handleToggleAlocacao = (alocacao) => {
    const isSelected = alocacoesSelecionadas.some(item => item.id === alocacao.id);
    
    if (isSelected) {
      // Remover da seleção
      setAlocacoesSelecionadas(prev => prev.filter(item => item.id !== alocacao.id));
    } else {
      // Adicionar à seleção
      setAlocacoesSelecionadas(prev => [...prev, alocacao]);
    }
  };
  
  // Manipulador para selecionar todas as alocações
  const handleSelectAll = () => {
    if (alocacoesSelecionadas.length === alocacoes.length) {
      // Desmarcar todas
      setAlocacoesSelecionadas([]);
    } else {
      // Marcar todas
      setAlocacoesSelecionadas([...alocacoes]);
    }
  };
  
  // Validação do formulário
  const validateForm = () => {
    const newErrors = {};
    
    // Validar campos obrigatórios
    if (!formData.funcionario_id) {
      newErrors.funcionario_id = t('validation.required');
    }
    
    if (!formData.data_pagamento) {
      newErrors.data_pagamento = t('validation.required');
    }
    
    if (!formData.periodo_inicio) {
      newErrors.periodo_inicio = t('validation.required');
    }
    
    if (!formData.periodo_fim) {
      newErrors.periodo_fim = t('validation.required');
    }
    
    if (alocacoesSelecionadas.length === 0) {
      newErrors.alocacoes = t('validation.atLeastOneRequired');
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
    
    // Preparar detalhes das alocações
    const detalhes = alocacoesSelecionadas.map(alocacao => ({
      alocacao_id: alocacao.id,
      valor: alocacao.valor_pago_funcionario
    }));
    
    // Formatar dados antes de enviar
    const dataToSubmit = {
      ...formData,
      valor_total: valorTotal,
      detalhes
    };
    
    // Chamar função de salvamento
    await onSave(dataToSubmit);
  };
  
  // Formatar valor em moeda
  const formatCurrency = (value) => {
    if (typeof value !== 'number') {
      value = parseFloat(value || 0);
    }
    
    return i18n.language === 'ja'
      ? `¥${Math.round(value).toLocaleString('ja-JP')}`
      : `¥ ${Math.round(value).toLocaleString('pt-BR')}`;
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={!!errors.funcionario_id}>
            <InputLabel>{t('allocations.employee')}</InputLabel>
            <Select
              name="funcionario_id"
              value={formData.funcionario_id}
              onChange={handleChange}
              label={t('allocations.employee')}
              required
              disabled={loading}
            >
              <MenuItem value="">{t('common.select')}</MenuItem>
              {funcionarios.map(funcionario => (
                <MenuItem key={funcionario.id} value={funcionario.id}>
                  {funcionario.nome}
                  {funcionario.nome_japones && ` / ${funcionario.nome_japones}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={t('payments.paymentDate')}
            name="data_pagamento"
            type="date"
            value={formData.data_pagamento}
            onChange={handleChange}
            error={!!errors.data_pagamento}
            helperText={errors.data_pagamento}
            required
            disabled={loading}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={t('allocations.startDate')}
            name="periodo_inicio"
            type="date"
            value={formData.periodo_inicio}
            onChange={handleChange}
            error={!!errors.periodo_inicio}
            helperText={errors.periodo_inicio}
            required
            disabled={loading}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={t('allocations.endDate')}
            name="periodo_fim"
            type="date"
            value={formData.periodo_fim}
            onChange={handleChange}
            error={!!errors.periodo_fim}
            helperText={errors.periodo_fim}
            required
            disabled={loading}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={t('payments.paymentMethod')}
            name="metodo_pagamento"
            value={formData.metodo_pagamento}
            onChange={handleChange}
            disabled={loading}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={t('payments.reference')}
            name="numero_referencia"
            value={formData.numero_referencia}
            onChange={handleChange}
            disabled={loading}
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
            rows={2}
            disabled={loading}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            {t('allocations.title')}
          </Typography>
          
          {loadingAlocacoes ? (
            <Box display="flex" justifyContent="center" my={2}>
              <CircularProgress />
            </Box>
          ) : alocacoes.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              {t('allocations.noRecords')}
            </Alert>
          ) : (
            <Paper variant="outlined" sx={{ mb: 2 }}>
              <List dense>
                <ListItem>
                  <Checkbox
                    edge="start"
                    checked={alocacoesSelecionadas.length === alocacoes.length}
                    indeterminate={alocacoesSelecionadas.length > 0 && alocacoesSelecionadas.length < alocacoes.length}
                    onChange={handleSelectAll}
                    disabled={loading}
                  />
                  <ListItemText 
                    primary={<Typography fontWeight="bold">{t('common.selectAll')}</Typography>}
                  />
                  <Typography variant="subtitle1" fontWeight="bold">
                    {t('allocations.value')}
                  </Typography>
                </ListItem>
                
                <Divider />
                
                {alocacoes.map((alocacao) => (
                  <React.Fragment key={alocacao.id}>
                    <ListItem>
                      <Checkbox
                        edge="start"
                        checked={alocacoesSelecionadas.some(item => item.id === alocacao.id)}
                        onChange={() => handleToggleAlocacao(alocacao)}
                        disabled={loading}
                      />
                      <ListItemText
                        primary={`${moment(alocacao.data_alocacao).format('L')} - ${alocacao.empresa_nome}`}
                        secondary={alocacao.tipo_periodo === 'integral' ? t('allocations.fullDay') : t('allocations.halfDay')}
                      />
                      <Typography variant="body1">
                        {formatCurrency(alocacao.valor_pago_funcionario)}
                      </Typography>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
              
              {errors.alocacoes && (
                <Alert severity="error" sx={{ m: 2 }}>
                  {errors.alocacoes}
                </Alert>
              )}
            </Paper>
          )}
          
          <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2}>
            <Typography variant="h6">
              {t('payments.total')}: {formatCurrency(valorTotal)}
            </Typography>
          </Box>
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
              disabled={loading || alocacoesSelecionadas.length === 0}
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

export default PagamentoForm;