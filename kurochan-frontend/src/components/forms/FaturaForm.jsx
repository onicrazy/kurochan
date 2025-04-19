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