import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Paper, 
  Grid, 
  Typography, 
  Box,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Tooltip,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from 'notistack';
import AlocacaoForm from './AlocacaoForm';

/**
 * Componente de calendário para visualização e gerenciamento de alocações de funcionários
 */
const CalendarioAlocacoes = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t, i18n } = useTranslation();
  const { currentUser } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  
  // Estado para controle do mês e ano atual
  const [currentDate, setCurrentDate] = useState(moment());
  
  // Estado para armazenar os dados de alocações
  const [alocacoes, setAlocacoes] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  
  // Estados para controle de carregamento e erros
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Estados para controle de modais
  const [openAlocacaoModal, setOpenAlocacaoModal] = useState(false);
  const [selectedAlocacao, setSelectedAlocacao] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deletingAlocacao, setDeletingAlocacao] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Gera uma matriz de semanas para o mês atual
  const generateCalendar = useCallback(() => {
    const startOfMonth = moment(currentDate).startOf('month');
    const endOfMonth = moment(currentDate).endOf('month');
    
    // Ajustar para começar na semana anterior se o mês não começar no domingo
    const startDate = moment(startOfMonth).startOf('week');
    // Ajustar para terminar na semana seguinte se o mês não terminar no sábado
    const endDate = moment(endOfMonth).endOf('week');
    
    const calendar = [];
    let week = [];
    
    // Iterar de startDate até endDate, preenchendo a matriz do calendário
    for (let day = moment(startDate); day.isSameOrBefore(endDate); day.add(1, 'day')) {
      week.push(moment(day));
      
      if (week.length === 7) {
        calendar.push([...week]);
        week = [];
      }
    }
    
    return calendar;
  }, [currentDate]);
  
  // Função para buscar as alocações do mês atual
  const fetchAlocacoes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const ano = currentDate.year();
      const mes = currentDate.month() + 1; // Mês em JS é base 0
      
      const response = await api.get(`/alocacoes/calendario/${ano}/${mes}`);
      setAlocacoes(response.data.data);
      
    } catch (err) {
      console.error('Erro ao buscar alocações:', err);
      setError(t('calendar.error.fetchFailed'));
      enqueueSnackbar(t('calendar.error.fetchFailed'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [currentDate, t, enqueueSnackbar]);
  
  // Função para buscar empresas e funcionários (para o formulário de alocação)
  const fetchEmpresas = useCallback(async () => {
    try {
      const response = await api.get('/empresas');
      setEmpresas(response.data.data);
    } catch (err) {
      console.error('Erro ao buscar empresas:', err);
      enqueueSnackbar(t('calendar.error.fetchCompaniesFailed'), { variant: 'error' });
    }
  }, [t, enqueueSnackbar]);
  
  const fetchFuncionarios = useCallback(async () => {
    try {
      const response = await api.get('/funcionarios');
      setFuncionarios(response.data.data);
    } catch (err) {
      console.error('Erro ao buscar funcionários:', err);
      enqueueSnackbar(t('calendar.error.fetchEmployeesFailed'), { variant: 'error' });
    }
  }, [t, enqueueSnackbar]);
  
  // Efeito para carregar dados quando o mês mudar
  useEffect(() => {
    fetchAlocacoes();
  }, [fetchAlocacoes]);
  
  // Efeito para carregar dados de empresas e funcionários ao montar o componente
  useEffect(() => {
    fetchEmpresas();
    fetchFuncionarios();
  }, [fetchEmpresas, fetchFuncionarios]);
  
  // Função para navegar para o mês anterior
  const goToPreviousMonth = () => {
    setCurrentDate(moment(currentDate).subtract(1, 'month'));
  };
  
  // Função para navegar para o próximo mês
  const goToNextMonth = () => {
    setCurrentDate(moment(currentDate).add(1, 'month'));
  };
  
  // Função para obter as alocações de um dia específico
  const getAlocacoesForDay = (day) => {
    return alocacoes.filter(alocacao => 
      moment(alocacao.data_alocacao).isSame(day, 'day')
    );
  };
  
  // Função para abrir o modal de criação de alocação
  const handleOpenCreateModal = (day) => {
    setSelectedDate(day);
    setSelectedAlocacao(null);
    setOpenAlocacaoModal(true);
  };
  
  // Função para abrir o modal de edição de alocação
  const handleOpenEditModal = (alocacao) => {
    setSelectedAlocacao(alocacao);
    setSelectedDate(moment(alocacao.data_alocacao));
    setOpenAlocacaoModal(true);
  };
  
  // Função para fechar o modal de alocação
  const handleCloseAlocacaoModal = () => {
    setOpenAlocacaoModal(false);
    setSelectedAlocacao(null);
    setSelectedDate(null);
  };
  
  // Função para abrir o modal de confirmação de exclusão
  const handleOpenDeleteModal = (alocacao) => {a
    setDeletingAlocacao(alocacao);
    setOpenDeleteModal(true);
  };
  
  // Função para fechar o modal de confirmação de exclusão
  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setDeletingAlocacao(null);
    setDeleteLoading(false);
  };
  
  // Função para excluir uma alocação
  const handleDeleteAlocacao = async () => {
    if (!deletingAlocacao) return;
    
    try {
      setDeleteLoading(true);
      
      await api.delete(`/alocacoes/${deletingAlocacao.id}`);
      
      enqueueSnackbar(t('calendar.success.allocationDeleted'), { variant: 'success' });
      
      // Fechar o modal e recarregar as alocações
      handleCloseDeleteModal();
      fetchAlocacoes();
      
    } catch (err) {
      console.error('Erro ao excluir alocação:', err);
      enqueueSnackbar(t('calendar.error.deleteFailed'), { variant: 'error' });
      setDeleteLoading(false);
    }
  };
  
  // Função para salvar uma alocação (criação ou edição)
  const handleSaveAlocacao = async (formData) => {
    try {
      if (selectedAlocacao) {
        // Edição
        await api.put(`/alocacoes/${selectedAlocacao.id}`, formData);
        enqueueSnackbar(t('calendar.success.allocationUpdated'), { variant: 'success' });
      } else {
        // Criação
        await api.post('/alocacoes', formData);
        enqueueSnackbar(t('calendar.success.allocationCreated'), { variant: 'success' });
      }
      
      // Fechar o modal e recarregar as alocações
      handleCloseAlocacaoModal();
      fetchAlocacoes();
      
    } catch (err) {
      console.error('Erro ao salvar alocação:', err);
      enqueueSnackbar(t('calendar.error.saveFailed'), { variant: 'error' });
    }
  };
  
  // Renderiza o cabeçalho do calendário (dias da semana)
  const renderCalendarHeader = () => {
    const weekdays = moment.weekdaysShort();
    
    return (
      <Grid container>
        {weekdays.map((day, index) => (
          <Grid item xs key={index} sx={{ textAlign: 'center', padding: 1, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {day}
            </Typography>
          </Grid>
        ))}
      </Grid>
    );
  };
  
  // Renderiza uma célula do calendário
  const renderCalendarCell = (day) => {
    const isToday = day.isSame(moment(), 'day');
    const isCurrentMonth = day.isSame(currentDate, 'month');
    const dayAlocacoes = getAlocacoesForDay(day);
    
    return (
      <Paper 
        elevation={isToday ? 3 : 0} 
        sx={{
          height: '100%',
          minHeight: isMobile ? 80 : 120,
          p: 1,
          backgroundColor: isToday ? 'rgba(144, 202, 249, 0.2)' : 'transparent',
          opacity: isCurrentMonth ? 1 : 0.5,
          display: 'flex',
          flexDirection: 'column',
          border: 1,
          borderColor: 'divider',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
          <Typography 
            variant="body2" 
            fontWeight={isToday ? 'bold' : 'normal'}
            color={isToday ? 'primary' : 'textPrimary'}
          >
            {day.date()}
          </Typography>
          
          {isCurrentMonth && (
            <Tooltip title={t('calendar.addAllocation')}>
              <IconButton 
                size="small" 
                color="primary" 
                onClick={() => handleOpenCreateModal(day)}
                disabled={!currentUser.permissions?.canCreateAllocation}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {dayAlocacoes.map(alocacao => (
            <Box 
              key={alocacao.id} 
              sx={{
                mb: 0.5,
                backgroundColor: alocacao.empresa_cor || theme.palette.primary.main,
                color: 'white',
                borderRadius: 1,
                p: 0.5,
                fontSize: '0.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer'
              }}
              onClick={() => handleOpenEditModal(alocacao)}
            >
              <Typography variant="caption" noWrap title={alocacao.funcionario_nome}>
                {alocacao.funcionario_nome}
              </Typography>
              
              {!isMobile && (
                <Box>
                  <Tooltip title={t('common.edit')}>
                    <IconButton 
                      size="small" 
                      sx={{ color: 'white', p: 0.3 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditModal(alocacao);
                      }}
                      disabled={!currentUser.permissions?.canEditAllocation}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title={t('common.delete')}>
                    <IconButton 
                      size="small" 
                      sx={{ color: 'white', p: 0.3 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDeleteModal(alocacao);
                      }}
                      disabled={!currentUser.permissions?.canDeleteAllocation}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </Paper>
    );
  };
  
  // Renderiza o corpo do calendário
  const renderCalendarBody = () => {
    const calendar = generateCalendar();
    
    return (
      <Grid container>
        {calendar.map((week, weekIndex) => (
          <Grid container key={`week-${weekIndex}`}>
            {week.map((day, dayIndex) => (
              <Grid item xs key={`day-${weekIndex}-${dayIndex}`}>
                {renderCalendarCell(day)}
              </Grid>
            ))}
          </Grid>
        ))}
      </Grid>
    );
  };
  
  return (
    <Container maxWidth="xl">
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">{t('calendar.title')}</Typography>
          
          <Box>
            <Button 
              variant="outlined" 
              startIcon={<AssignmentIcon />}
              sx={{ mr: 1 }}
              onClick={() => {}}
            >
              {t('calendar.generateReport')}
            </Button>
          </Box>
        </Box>
        
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <IconButton onClick={goToPreviousMonth}>
            <ChevronLeftIcon />
          </IconButton>
          
          <Typography variant="h6">
            {currentDate.format('MMMM YYYY')}
          </Typography>
          
          <IconButton onClick={goToNextMonth}>
            <ChevronRightIcon />
          </IconButton>
        </Box>
        
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="400px">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="400px">
            <Typography color="error">{error}</Typography>
          </Box>
        ) : (
          <>
            {renderCalendarHeader()}
            {renderCalendarBody()}
          </>
        )}
      </Paper>
      
      {/* Modal de criação/edição de alocação */}
      <Dialog 
        open={openAlocacaoModal} 
        onClose={handleCloseAlocacaoModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedAlocacao ? t('calendar.editAllocation') : t('calendar.newAllocation')}
        </DialogTitle>
        
        <DialogContent>
          <AlocacaoForm 
            alocacao={selectedAlocacao}
            data={selectedDate?.format('YYYY-MM-DD')}
            empresas={empresas}
            funcionarios={funcionarios}
            onSave={handleSaveAlocacao}
            onCancel={handleCloseAlocacaoModal}
          />
        </DialogContent>
      </Dialog>
      
      {/* Modal de confirmação de exclusão */}
      <Dialog 
        open={openDeleteModal} 
        onClose={handleCloseDeleteModal}
      >
        <DialogTitle>{t('calendar.confirmDelete')}</DialogTitle>
        
        <DialogContent>
          <Typography>
            {t('calendar.deleteConfirmMessage', { 
              funcionario: deletingAlocacao?.funcionario_nome,
              data: deletingAlocacao ? moment(deletingAlocacao.data_alocacao).format('L') : ''
            })}
          </Typography>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDeleteModal} disabled={deleteLoading}>
            {t('common.cancel')}
          </Button>
          
          <Button 
            onClick={handleDeleteAlocacao} 
            color="error"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={20} /> : null}
          >
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CalendarioAlocacoes;