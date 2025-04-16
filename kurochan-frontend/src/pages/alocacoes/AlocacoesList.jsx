import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Tooltip,
  MenuItem,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import moment from 'moment';

import api from '../../services/api';
import formatters from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';
import AlocacaoForm from '../../components/forms/AlocacaoForm';

const AlocacoesList = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  
  // Estados para a tabela
  const [alocacoes, setAlocacoes] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para filtros
  const [filter, setFilter] = useState({
    funcionario_id: '',
    empresa_id: '',
    data_inicio: '',
    data_fim: '',
    status_pagamento_funcionario: 'all',
    status_pagamento_empresa: 'all'
  });
  
  // Estados para dados relacionados
  const [empresas, setEmpresas] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  
  // Estados para modal de alocação
  const [openModal, setOpenModal] = useState(false);
  const [selectedAlocacao, setSelectedAlocacao] = useState(null);
  const [savingAlocacao, setSavingAlocacao] = useState(false);
  
  // Buscar filtros da URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    const newFilter = { ...filter };
    
    if (params.has('funcionario_id')) {
      newFilter.funcionario_id = params.get('funcionario_id');
    }
    
    if (params.has('empresa_id')) {
      newFilter.empresa_id = params.get('empresa_id');
    }
    
    setFilter(newFilter);
  }, [location.search]);
  
  // Função para buscar dados relacionados
  const fetchRelatedData = async () => {
    try {
      setLoadingRelated(true);
      
      // Buscar empresas
      const empresasResponse = await api.get('/empresas', {
        params: {
          limit: 100,
          ativa: true
        }
      });
      
      // Buscar funcionários
      const funcionariosResponse = await api.get('/funcionarios', {
        params: {
          limit: 100,
          ativo: true
        }
      });
	  
	  
	 setEmpresas(empresasResponse.data.data);
      setFuncionarios(funcionariosResponse.data.data);
      
    } catch (err) {
      console.error('Erro ao carregar dados relacionados:', err);
      enqueueSnackbar(t('common.errorLoadingRelatedData'), { variant: 'error' });
    } finally {
      setLoadingRelated(false);
    }
  };
  
  // Função para buscar alocações
  const fetchAlocacoes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Preparar parâmetros da requisição
      const params = {
        page: page + 1, // API usa base 1 para páginas
        limit: rowsPerPage,
        sortBy: 'data_alocacao',
        sortOrder: 'desc'
      };
      
      // Adicionar filtros se existirem
      if (filter.funcionario_id) params.funcionario_id = filter.funcionario_id;
      if (filter.empresa_id) params.empresa_id = filter.empresa_id;
      if (filter.data_inicio) params.data_inicio = filter.data_inicio;
      if (filter.data_fim) params.data_fim = filter.data_fim;
      if (filter.status_pagamento_funcionario !== 'all') params.status_pagamento_funcionario = filter.status_pagamento_funcionario;
      if (filter.status_pagamento_empresa !== 'all') params.status_pagamento_empresa = filter.status_pagamento_empresa;
      
      // Fazer requisição
      const response = await api.get('/alocacoes', { params });
      
      setAlocacoes(response.data.data);
      setTotal(response.data.pagination.total);
      
    } catch (err) {
      console.error('Erro ao buscar alocações:', err);
      setError(t('common.errorLoadingData'));
    } finally {
      setLoading(false);
    }
  };
  
  // Buscar dados relacionados quando o componente for montado
  useEffect(() => {
    fetchRelatedData();
  }, []);
  
  // Buscar alocações quando mudar página, tamanho da página ou idioma
  useEffect(() => {
    fetchAlocacoes();
  }, [page, rowsPerPage, i18n.language]);
  
  // Manipuladores de eventos
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };
  
  const handleApplyFilter = () => {
    setPage(0); // Reset para primeira página
    fetchAlocacoes();
  };
  
  const handleClearFilter = () => {
    setFilter({
      funcionario_id: '',
      empresa_id: '',
      data_inicio: '',
      data_fim: '',
      status_pagamento_funcionario: 'all',
      status_pagamento_empresa: 'all'
    });
    setPage(0);
    fetchAlocacoes();
  };
  
  // Manipulador para abrir modal de criação
  const handleOpenCreateModal = () => {
    setSelectedAlocacao(null);
    setOpenModal(true);
  };
  
  // Manipulador para abrir modal de edição
  const handleOpenEditModal = (alocacao) => {
    setSelectedAlocacao(alocacao);
    setOpenModal(true);
  };
  
  // Manipulador para fechar o modal
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedAlocacao(null);
    setSavingAlocacao(false);
  };
  
  // Manipulador para salvar alocação
  const handleSaveAlocacao = async (formData) => {
    try {
      setSavingAlocacao(true);
      
      if (selectedAlocacao) {
        // Edição
        await api.put(`/alocacoes/${selectedAlocacao.id}`, formData);
        enqueueSnackbar(t('allocations.success.updated'), { variant: 'success' });
      } else {
        // Criação
        await api.post('/alocacoes', formData);
        enqueueSnackbar(t('allocations.success.created'), { variant: 'success' });
      }
      
      // Fechar modal e recarregar dados
      handleCloseModal();
      fetchAlocacoes();
      
    } catch (err) {
      console.error('Erro ao salvar alocação:', err);
      enqueueSnackbar(t('allocations.error.saveFailed'), { variant: 'error' });
    } finally {
      setSavingAlocacao(false);
    }
  };
  
  // Manipulador para visualizar alocação
  const handleViewAlocacao = (id) => {
    navigate(`/alocacoes/${id}`);
  };
  
  // Funcão para renderizar o status da alocação
  const renderStatus = (status, type) => {
    let color = 'default';
    
    if (status === 'pago') {
      color = 'success';
    } else if (status === 'pendente') {
      color = 'warning';
    } else if (status === 'parcial') {
      color = 'info';
    }
    
    return (
      <Chip
        label={formatters.paymentStatus(status, i18n.language)}
        color={color}
        size="small"
      />
    );
  };
  
  // Função para obter o nome de uma empresa pelo ID
  const getEmpresaNome = (id) => {
    const empresa = empresas.find(emp => emp.id === parseInt(id));
    return empresa ? empresa.nome : '';
  };
  
  // Função para obter o nome de um funcionário pelo ID
  const getFuncionarioNome = (id) => {
    const funcionario = funcionarios.find(func => func.id === parseInt(id));
    return funcionario ? funcionario.nome : '';
  };
  
  return (
    <Container maxWidth="xl">
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">{t('allocations.title')}</Typography>
          
          {currentUser?.permissions?.canCreateAllocation && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateModal}
            >
              {t('allocations.newAllocation')}
            </Button>
          )}
        </Box>
        
        {/* Filtros */}
        <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
          <Box display="flex" alignItems="center" mb={2}>
            <FilterListIcon sx={{ mr: 1 }} />
            <Typography variant="subtitle1">{t('common.filters')}</Typography>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label={t('allocations.employee')}
                name="funcionario_id"
                value={filter.funcionario_id}
                onChange={handleFilterChange}
                size="small"
              >
                <MenuItem value="">{t('common.all')}</MenuItem>
                {funcionarios.map((func) => (
                  <MenuItem key={func.id} value={func.id}>
                    {formatters.name(func.nome, func.nome_japones)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label={t('allocations.company')}
                name="empresa_id"
                value={filter.empresa_id}
                onChange={handleFilterChange}
                size="small"
              >
                <MenuItem value="">{t('common.all')}</MenuItem>
                {empresas.map((emp) => (
                  <MenuItem key={emp.id} value={emp.id}>
                    {formatters.name(emp.nome, emp.nome_japones)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label={t('allocations.startDate')}
                name="data_inicio"
                type="date"
                value={filter.data_inicio}
                onChange={handleFilterChange}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label={t('allocations.endDate')}
                name="data_fim"
                type="date"
                value={filter.data_fim}
                onChange={handleFilterChange}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} md={1}>
              <TextField
                select
                fullWidth
                label={t('allocations.employeePayment')}
                name="status_pagamento_funcionario"
                value={filter.status_pagamento_funcionario}
                onChange={handleFilterChange}
                size="small"
              >
                <MenuItem value="all">{t('common.all')}</MenuItem>
                <MenuItem value="pendente">{t('payments.pending')}</MenuItem>
                <MenuItem value="pago">{t('payments.paid')}</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12} md={1}>
              <TextField
                select
                fullWidth
                label={t('allocations.companyPayment')}
                name="status_pagamento_empresa"
                value={filter.status_pagamento_empresa}
                onChange={handleFilterChange}
                size="small"
              >
                <MenuItem value="all">{t('common.all')}</MenuItem>
                <MenuItem value="pendente">{t('payments.pending')}</MenuItem>
                <MenuItem value="pago">{t('payments.paid')}</MenuItem>
              </TextField>
            </Grid>
          </Grid>
          
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClearFilter}
              sx={{ mr: 1 }}
            >
              {t('common.clear')}
            </Button>
            
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleApplyFilter}
            >
              {t('common.filter')}
            </Button>
          </Box>
        </Paper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {/* Tabela */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('allocations.date')}</TableCell>
                <TableCell>{t('allocations.employee')}</TableCell>
                <TableCell>{t('allocations.company')}</TableCell>
                <TableCell align="right">{t('allocations.employeePayment')}</TableCell>
                <TableCell align="right">{t('allocations.companyCharge')}</TableCell>
                <TableCell align="center">{t('allocations.employeePaymentStatus')}</TableCell>
                <TableCell align="center">{t('allocations.companyPaymentStatus')}</TableCell>
                <TableCell align="center">{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress size={24} sx={{ my: 2 }} />
                  </TableCell>
                </TableRow>
              ) : alocacoes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="textSecondary">
                      {t('common.noResults')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                alocacoes.map((alocacao) => (
                  <TableRow key={alocacao.id}>
                    <TableCell>
                      {formatters.date(alocacao.data_alocacao, i18n.language)}
                    </TableCell>
                    <TableCell>{alocacao.funcionario_nome}</TableCell>
                    <TableCell>{alocacao.empresa_nome}</TableCell>
                    <TableCell align="right">
                      {formatters.currency(alocacao.valor_pago_funcionario, i18n.language)}
                    </TableCell>
                    <TableCell align="right">
                      {formatters.currency(alocacao.valor_cobrado_empresa, i18n.language)}
                    </TableCell>
                    <TableCell align="center">
                      {renderStatus(alocacao.status_pagamento_funcionario)}
                    </TableCell>
                    <TableCell align="center">
                      {renderStatus(alocacao.status_pagamento_empresa)}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={t('common.view')}>
                        <IconButton
                          color="info"
                          onClick={() => handleViewAlocacao(alocacao.id)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      
                      {currentUser?.permissions?.canEditAllocation && (
                        <Tooltip title={t('common.edit')}>
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenEditModal(alocacao)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage={t('common.rowsPerPage')}
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} ${t('common.of')} ${count}`
          }
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>
      
      {/* Modal de Alocação */}
      {openModal && (
        <Dialog
          open={openModal}
          onClose={() => !savingAlocacao && handleCloseModal()}
          maxWidth="md"
          fullWidth
        >
          <Box p={2}>
            <Typography variant="h6" mb={2}>
              {selectedAlocacao ? t('allocations.editAllocation') : t('allocations.newAllocation')}
            </Typography>
            
            <AlocacaoForm 
              alocacao={selectedAlocacao}
              empresas={empresas}
              funcionarios={funcionarios}
              onSave={handleSaveAlocacao}
              onCancel={handleCloseModal}
              loading={savingAlocacao}
            />
          </Box>
        </Dialog>
      )}
    </Container>
  );
};

export default AlocacoesList; 