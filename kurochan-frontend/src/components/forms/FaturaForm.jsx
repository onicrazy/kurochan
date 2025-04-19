import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
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
  Divider
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

/**
 * Componente de formulário para criação de faturas para empresas
 * @param {Object} props - Propriedades do componente
 * @param {Array} props.empresas - Lista de empresas
 * @param {Function} props.onSave - Função chamada ao salvar
 * @param {Function} props.onCancel - Função chamada ao cancelar
 * @param {boolean} props.loading - Indica se está carregando
 */
const FaturaForm = ({ empresas, onSave, onCancel, loading = false }) => {
  const { t, i18n } = useTranslation();
  
  // Estados para controle de carregamento
  const [loadingAlocacoes, setLoadingAlocacoes] = useState(false);
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    empresa_id: '',
    data_fatura: moment().format('YYYY-MM-DD'),
    data_vencimento: moment().add(30, 'days').format('YYYY-MM-DD'),
    periodo_inicio: moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
    periodo_fim: moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD'),
    status_pagamento: 'pendente',
    metodo_pagamento: '',
    numero_referencia: '',
    observacoes: ''
  });
  
  // Estados para controle de erro no formulário
  const [errors, setErrors] = useState({});
  
  // Estado para alocações da empresa
  const [alocacoes, setAlocacoes] = useState([]);
  const [alocacoesSelecionadas, setAlocacoesSelecionadas] = useState([]);
  const [valorTotal, setValorTotal] = useState(0);
  
  // Efeito para carregar alocações quando a empresa ou período mudar
  useEffect(() => {
    if (formData.empresa_id && formData.periodo_inicio && formData.periodo_fim) {
      fetchAlocacoesEmpresa();
    }
  }, [formData.empresa_id, formData.periodo_inicio, formData.periodo_fim]);
  
  // Efeito para calcular o valor total quando as alocações selecionadas mudarem
  useEffect(() => {
    const total = alocacoesSelecionadas.reduce((sum, alocacao) => sum + alocacao.valor_cobrado_empresa, 0);
    setValorTotal(total);
  }, [alocacoesSelecionadas]);
  
  // Função para buscar alocações de uma empresa em um período
  const fetchAlocacoesEmpresa = async () => {
    try {
      setLoadingAlocacoes(true);
      
      // Simulação - em um ambiente real, isso seria uma chamada à API
      // const response = await api.get('/alocacoes', {
      //   params: {
      //     empresa_id: formData.empresa_id,
      //     data_inicio: formData.periodo_inicio,
      //     data_fim: formData.periodo_fim,
      //     status_pagamento_empresa: 'pendente'
      //   }
      // });
      
      // Dados de exemplo - remover em produção
      const exampleAlocacoes = [
        {
          id: 1,
          data_alocacao: '2023-01-05',
          funcionario_nome: 'Funcionário A',
          tipo_periodo: 'integral',
          valor_cobrado_empresa: 20000,
          status_pagamento_empresa: 'pendente'
        },
        {
          id: 2,
          data_alocacao: '2023-01-10',
          funcionario_nome: 'Funcionário B',
          tipo_periodo: 'integral',
          valor_cobrado_empresa: 20000,
          status_pagamento_empresa: 'pendente'
        },
        {
          id: 3,
          data_alocacao: '2023-01-15',
          funcionario_nome: 'Funcionário C',
          tipo_periodo: 'meio',
          valor_cobrado_empresa: 10000,
          status_pagamento_empresa: 'pendente'
        }
      ];
      
      setAlocacoes(exampleAlocacoes);
      
      // Selecionar todas as alocações por padrão
      setAlocacoesSelecionadas(exampleAlocacoes);
      
    } catch (err) {
      console.error('Erro ao buscar alocações da empresa:', err);
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
    if (!formData.empresa_id) {
      newErrors.empresa_id = t('validation.required');
    }
    
    if (!formData.data_fatura) {
      newErrors.data_fatura = t('validation.required');
    }
    
    if (!formData.data_vencimento) {
      newErrors.data_vencimento = t('validation.required');
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
      valor: alocacao.valor_cobrado_empresa
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
          <FormControl fullWidth error={!!errors.empresa_id}>
            <InputLabel>{t('allocations.company')}</InputLabel>
            <Select
              name="empresa_id"
              value={formData.empresa_id}
              onChange={handleChange}
              label={t('allocations.company')}
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
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={t('payments.invoiceDate')}
            name="data_fatura"
            type="date"
            value={formData.data_fatura}
            onChange={handleChange}
            error={!!errors.data_fatura}
            helperText={errors.data_fatura}
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
            label={t('payments.dueDate')}
            name="data_vencimento"
            type="date"
            value={formData.data_vencimento}
            onChange={handleChange}
            error={!!errors.data_vencimento}
            helperText={errors.data_vencimento}
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
                        primary={`${moment(alocacao.data_alocacao).format('L')} - ${alocacao.funcionario_nome}`}
                        secondary={alocacao.tipo_periodo === 'integral' ? t('allocations.fullDay') : t('allocations.halfDay')}
                      />
                      <Typography variant="body1">
                        {formatCurrency(alocacao.valor_cobrado_empresa)}
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
              {t('menu.total')}: {formatCurrency(valorTotal)}
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

export default FaturaForm;