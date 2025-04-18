// Localização: kurochan-frontend/src/pages/users/UsersList.jsx

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
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import api from '../../services/api';
import formatters from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

const UsersList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { currentUser } = useAuth();
  
  // Estados para a tabela
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para filtros
  const [filter, setFilter] = useState({
    nome: '',
    email: '',
    funcao: '',
    ativo: 'true'
  });
  
  // Funções de tradução para funções de usuário
  const getUserRoleTranslation = (role) => {
    switch (role) {
      case 'administrador': return t('users.administrator');
      case 'gerente': return t('users.manager');
      case 'operador': return t('users.operator');
      default: return role;
    }
  };
  
  // Função para buscar usuários
  const fetchUsers = async () => {
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
      if (filter.email) params.email = filter.email;
      if (filter.funcao) params.funcao = filter.funcao;
      if (filter.ativo !== 'all') params.ativo = filter.ativo;
      
      // Fazer requisição
      const response = await api.get('/users', { params });
      
      setUsers(response.data.data);
      setTotal(response.data.pagination.total);
      
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
      setError(t('common.errorLoadingData'));
    } finally {
      setLoading(false);
    }
  };
  
  // Carregar usuários ao iniciar ou quando mudar página/filtros
  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage]);
  
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
    setPage(0);
    fetchUsers();
  };
  
  const handleClearFilter = () => {
    setFilter({
      nome: '',
      email: '',
      funcao: '',
      ativo: 'true'
    });
    setPage(0);
    fetchUsers();
  };
  
  const handleAddUser = () => {
    navigate('/users/novo');
  };
  
  const handleEditUser = (id) => {
    navigate(`/users/${id}/editar`);
  };
  
  const handleDeleteUser = async (id, nome) => {
    // Não permitir excluir o próprio usuário
    if (id === currentUser.id) {
      enqueueSnackbar(t('users.error.cannotDeleteYourself'), { variant: 'error' });
      return;
    }
    
    if (window.confirm(t('users.confirmDelete', { name: nome }))) {
      try {
        await api.delete(`/users/${id}`);
        enqueueSnackbar(t('users.success.deleted'), { variant: 'success' });
        fetchUsers();
      } catch (err) {
        console.error('Erro ao excluir usuário:', err);
        enqueueSnackbar(t('users.error.deleteFailed'), { variant: 'error' });
      }
    }
  };
  
  return (
    <Container maxWidth="xl">
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">{t('users.title')}</Typography>
          
          {currentUser?.permissions?.canCreateUser && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddUser}
            >
              {t('users.newUser')}
            </Button>
          )}
        </Box>
        
        {/* Filtros */}
        <Box display="flex" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
          <TextField
            name="nome"
            label={t('users.name')}
            value={filter.nome}
            onChange={handleFilterChange}
            variant="outlined"
            size="small"
            sx={{ flexGrow: 1, minWidth: '150px' }}
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
            name="email"
			label={t('users.email')}
            value={filter.email}
            onChange={handleFilterChange}
            variant="outlined"
            size="small"
            sx={{ flexGrow: 1, minWidth: '200px' }}
            InputProps={{
              endAdornment: filter.email ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setFilter(prev => ({ ...prev, email: '' }))}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null
            }}
          />
          
          <TextField
            select
            name="funcao"
            label={t('users.role')}
            value={filter.funcao}
            onChange={handleFilterChange}
            variant="outlined"
            size="small"
            sx={{ minWidth: '150px' }}
          >
            <MenuItem value="">{t('common.all')}</MenuItem>
            <MenuItem value="administrador">{t('users.administrator')}</MenuItem>
            <MenuItem value="gerente">{t('users.manager')}</MenuItem>
            <MenuItem value="operador">{t('users.operator')}</MenuItem>
          </TextField>
          
          <TextField
            select
            name="ativo"
            label={t('users.active')}
            value={filter.ativo}
            onChange={handleFilterChange}
            variant="outlined"
            size="small"
            sx={{ minWidth: '120px' }}
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
                <TableCell>{t('users.name')}</TableCell>
                <TableCell>{t('users.email')}</TableCell>
                <TableCell>{t('users.role')}</TableCell>
                <TableCell>{t('users.language')}</TableCell>
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
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="textSecondary">
                      {t('common.noResults')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.nome}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getUserRoleTranslation(user.funcao)}</TableCell>
                    <TableCell>
                      {user.idioma_preferido === 'ja' ? t('settings.japanese') : t('settings.portuguese')}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={user.ativo ? t('common.active') : t('common.inactive')}
                        color={user.ativo ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {currentUser?.permissions?.canEditUser && (
                        <Tooltip title={t('common.edit')}>
                          <IconButton
                            color="primary"
                            onClick={() => handleEditUser(user.id)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {currentUser?.permissions?.canDeleteUser && user.id !== currentUser.id && (
                        <Tooltip title={t('common.delete')}>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteUser(user.id, user.nome)}
                          >
                            <DeleteIcon />
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

export default UsersList;