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
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import formatters from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

const FuncionariosList = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Estados para a tabela
  const [funcionarios, setFuncionarios] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para filtros
  const [filter, setFilter] = useState({
    nome: '',
    cargo: '',
    ativo: 'true'
  });
  
  // Função para buscar dados
  const fetchFuncionarios = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Preparar parâmetros da requisição
      const params = {
        page: page + 1, // API usa base 1 para páginas
        limit: rowsPerPage,
        sortBy: 'nome',
        sortOrder: 'asc'
      };
      
      // Adicionar filtros se existirem
      if (filter.nome) params.nome = filter.nome;
      if (filter.cargo) params.cargo = filter.cargo;
      if (filter.ativo !== 'all') params.ativo = filter.ativo;
      
      // Fazer requisição
      const response = await api.get('/funcionarios', { params });
      
      setFuncionarios(response.data.data);
      setTotal(response.data.pagination.total);
      
    } catch (err) {
      console.error('Erro ao buscar funcionários:', err);
      setError(t('common.errorLoadingData'));
    } finally {
      setLoading(false);
    }
  };
  
  // Buscar dados quando iniciar ou quando mudar página/filtros
  useEffect(() => {
    fetchFuncionarios();
  }, [page, rowsPerPage, i18n.language]);
  
  // Manipuladores de eventos
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };
  
  const handleApplyFilter = () => {
    setPage(0); // Reset para primeira página
    fetchFuncionarios();
  };
  
  const handleClearFilter = () => {
    setFilter({
      nome: '',
      cargo: '',
      ativo: 'true'
    });
    setPage(0);
  };
  
  const handleViewFuncionario = (id) => {
    navigate(`/funcionarios/${id}`);
  };
  
  const handleEditFuncionario = (id) => {
    navigate(`/funcionarios/${id}/editar`);
  };
  
  const handleAddFuncionario = () => {
    navigate('/funcionarios/novo');
  };
  
  return (
    <Container maxWidth="xl">
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">{t('employees.title')}</Typography>
          
          {currentUser?.permissions?.canCreateEmployee && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddFuncionario}
            >
              {t('employees.newEmployee')}
            </Button>
          )}
        </Box>
        
        {/* Filtros */}
        <Box display="flex" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
          <TextField
            name="nome"
            label={t('employees.name')}
            value={filter.nome}
            onChange={handleFilterChange}
            variant="outlined"
            size="small"
            sx={{ flexGrow: 1, minWidth: '200px' }}
            InputProps={{
              endAdornment: filter.nome ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setFilter(prev => ({ ...prev, nome: '' }))}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null
            }}
          />
          
          <TextField
            name="cargo"
            label={t('employees.position')}
            value={filter.cargo}
            onChange={handleFilterChange}
            variant="outlined"
            size="small"
            sx={{ width: '200px' }}
            InputProps={{
              endAdornment: filter.cargo ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setFilter(prev => ({ ...prev, cargo: '' }))}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null
            }}
          />
          
          <TextField
            name="ativo"
            label={t('employees.active')}
            select
            value={filter.ativo}
            onChange={handleFilterChange}
            variant="outlined"
            size="small"
            sx={{ width: '150px' }}
          >
            <MenuItem value="all">{t('common.all')}</MenuItem>
            <MenuItem value="true">{t('common.active')}</MenuItem>
            <MenuItem value="false">{t('common.inactive')}</MenuItem>
          </TextField>
          
          <Button
            variant="outlined"
            startIcon={<SearchIcon />}
            onClick={handleApplyFilter}
          >
            {t('common.filter')}
          </Button>
          
          <Button
            variant="text"
            startIcon={<ClearIcon />}
            onClick={handleClearFilter}
          >
            {t('common.clear')}
          </Button>
        </Box>
        
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
                <TableCell>{t('employees.name')}</TableCell>
                <TableCell>{t('employees.position')}</TableCell>
                <TableCell align="right">{t('employees.dailyRate')}</TableCell>
                <TableCell>{t('employees.phone')}</TableCell>
                <TableCell align="center">{t('common.status')}</TableCell>
                <TableCell align="center">{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress size={24} sx={{ my: 2 }} />
                  </TableCell>
                </TableRow>
              ) : funcionarios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="textSecondary">
                      {t('common.noResults')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                funcionarios.map((funcionario) => (
                  <TableRow key={funcionario.id}>
                    <TableCell>
                      {formatters.name(funcionario.nome, funcionario.nome_japones)}
                    </TableCell>
                    <TableCell>{funcionario.cargo}</TableCell>
                    <TableCell align="right">
                      {formatters.currency(funcionario.valor_diaria, i18n.language)}
                    </TableCell>
                    <TableCell>{funcionario.telefone}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={funcionario.ativo ? t('common.active') : t('common.inactive')}
                        color={funcionario.ativo ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={t('common.view')}>
                        <IconButton
                          color="info"
                          onClick={() => handleViewFuncionario(funcionario.id)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      
                      {currentUser?.permissions?.canEditEmployee && (
                        <Tooltip title={t('common.edit')}>
                          <IconButton
                            color="primary"
                            onClick={() => handleEditFuncionario(funcionario.id)}
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
    </Container>
  );
};

export default FuncionariosList;