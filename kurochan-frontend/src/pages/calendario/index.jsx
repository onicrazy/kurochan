import React, { useState, useEffect, useMemo } from 'react';
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
  CircularProgress,
  Alert
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { useSnackbar } from 'notistack';

import api from '../../services/api';
import DayCell from './components/DayCell';
import AlocacaoForm from '../../components/forms/AlocacaoForm';

const Calendario = () => {
  const { t, i18n } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  // Estado para controle do mês e ano atual
  const [currentDate, setCurrentDate] = useState(moment());
  
  // Estado para dados
  const [alocacoes, setAlocacoes] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  
  // Estados para carregamento e erro
  const [loadingAlocacoes, setLoadingAlocacoes] = useState(false);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [error, setError] = useState(null);
  
  // Estados para modais
  const [openAlocacaoModal, setOpenAlocacaoModal] = useState(false);
  const [selectedAlocacao, setSelectedAlocacao] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [savingAlocacao, setSavingAlocacao] = useState(false);
  
  // Gerar dias do calendário
  const calendarDays = useMemo(() => {
    // Primeiro dia do mês
    const firstDay = moment(currentDate).startOf('month');
    // Último dia do mês
    const lastDay = moment(currentDate).endOf('month');
    
    // Primeiro dia da semana (domingo)
    const startDate = moment(firstDay).startOf('week');
    // Último dia da semana (sábado)
    const endDate = moment(lastDay).endOf('week');
    
    const days = [];
    let week = [];
    
    // Gerar dias do calendário
    for (let day = moment(startDate); day.isSameOrBefore(endDate); day.add(1, 'day')) {
      week.push(moment(day));
      
      if (week.length === 7) {
        days.push([...week]);
        week = [];
      }
    }
    
    return days;
  }, [currentDate]);
  
  // Dias da semana
  const weekDays = useMemo(() => {
    return moment.weekdaysShort();
  }, []);
  
  // Buscar dados das alocações
  useEffect(() => {
    fetchAlocacoes();
  }, [currentDate]);
  
  // Função para buscar alocações
  const fetchAlocacoes = async () => {
    try {
      setLoadingAlocacoes(true);
      setError(null);
      
      const ano = currentDate.year();
      const mes = currentDate.month() + 1; // Mês no Moment.js começa em 0
      
      const response = await api.get(`/alocacoes/calendario/${ano}/${mes}`);
      setAlocacoes(response.data.data);
      
    } catch (err) {
      console.error('Erro ao buscar alocações:', err);
      setError(t('calendar.error.fetchFailed'));
    } finally {
      setLoadingAlocacoes(false);
    }
  };
  
  // Função para buscar empresas e funcionários
  const fetchRelatedData = async () => {
    try {
      setLoadingRelated(true);
      
      // Buscar empresas
      const empresasResponse = await api.get('/empresas', {
        params: { ativa: true }
      });
      
      // Buscar funcionários
      const funcionariosResponse = await api.get('/funcionarios', {
        params: { ativo: true }
      });
      
      setEmpresas(empresasResponse.data.data);
      setFuncionarios(funcionariosResponse.data.data);
      
    } catch (err) {
      console.error('Erro ao buscar dados relacionados:', err);
      enqueueSnackbar(
        err.response?.data?.message || t('calendar.error.fetchRelatedFailed'), 
        { variant: 'error' }
      );
    } finally {
      setLoadingRelated(false);
    }
  };
  
  // Obter alocações para um dia específico
  const getAlocacoesForDay = (day) => {
    return alocacoes.filter(alocacao => 
      moment(alocacao.data_alocacao).isSame(day, 'day')
    );
  };
  
  // Navegar para o mês anterior
  const goToPreviousMonth = () => {
    setCurrentDate(moment(currentDate).subtract(1, 'month'));
  };
  
  // Navegar para o próximo mês
  const goToNextMonth = () => {
    setCurrentDate(moment(currentDate).add(1, 'month'));
  };
  
  // Manipulador para adicionar alocação
  const handleAddAlocacao = (day) => {
    setSelectedDate(day);
    setSelectedAlocacao(null);
    fetchRelatedData();
    setOpenAlocacaoModal(true);
  };
  
  // Manipulador para editar alocação
  const handleEditAlocacao = (alocacao) => {
    setSelectedAlocacao(alocacao);
    setSelectedDate(null);
    fetchRelatedData();
    setOpenAlocacaoModal(true);
  };
  
  // Manipulador para fechar modal de alocação
  const handleCloseAlocacaoModal = () => {
    setOpenAlocacaoModal(false);
    setSavingAlocacao(false);
  };
  
  // Manipulador para salvar alocação
  const handleSaveAlocacao = async (formData) => {
    try {
      setSavingAlocacao(true);
      
      if (selectedAlocacao) {
        // Edição
        await api.put(`/alocacoes/${selectedAlocacao.id}`, formData);
        enqueueSnackbar(t('calendar.success.allocationUpdated'), { variant: 'success' });
      } else {
        // Criação
        await api.post('/alocacoes', formData);
        enqueueSnackbar(t('calendar.success.allocationCreated'), { variant: 'success' });
      }
      
      // Fechar modal e atualizar dados
      handleCloseAlocacaoModal();
      fetchAlocacoes();
      
    } catch (err) {
      console.error('Erro ao salvar alocação:', err);
      enqueueSnackbar(
        err.response?.data?.message || t('calendar.error.saveFailed'), 
        { variant: 'error' }
      );
    } finally {
      setSavingAlocacao(false);
    }
  };
  
  // Manipulador para excluir alocação
  const handleDeleteAlocacao = async (alocacao) => {
    if (confirm(t('calendar.deleteConfirmMessage', {
      funcionario: alocacao.funcionario_nome,
      data: moment(alocacao.data_alocacao).format('L')
    }))) {
      try {
        await api.delete(`/alocacoes/${alocacao.id}`);
        enqueueSnackbar(t('calendar.success.allocationDeleted'), { variant: 'success' });
        fetchAlocacoes();
      } catch (err) {
        console.error('Erro ao excluir alocação:', err);
        enqueueSnackbar(
          err.response?.data?.message || t('calendar.error.deleteFailed'), 
          { variant: 'error' }
        );
      }
    }
  };
  
  // Manipulador para visualizar alocação
  const handleViewAlocacao = (alocacao) => {
    // Navegar para a página de detalhes da alocação
    window.location.href = `/alocacoes/${alocacao.id}`;
  };
  
  return (
    <Container maxWidth="xl">
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">{t('calendar.title')}</Typography>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleAddAlocacao(moment())}
          >
            {t('calendar.addAllocation')}
          </Button>
        </Box>
        
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center">
            <IconButton onClick={goToPreviousMonth}>
              <ChevronLeftIcon />
            </IconButton>
            
            <Typography variant="h6" sx={{ mx: 2 }}>
              {currentDate.format('MMMM YYYY')}
            </Typography>
            
            <IconButton onClick={goToNextMonth}>
              <ChevronRightIcon />
            </IconButton>
          </Box>
          
          <Box>
            <Button
              variant="outlined"
              startIcon={<AssignmentIcon />}
              onClick={() => window.location.href = `/relatorios?mes=${currentDate.month() + 1}&ano=${currentDate.year()}`}
            >
              {t('calendar.generateReport')}
            </Button>
          </Box>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {loadingAlocacoes ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Cabeçalho com os dias da semana */}
            <Grid container sx={{ mb: 1 }}>
              {weekDays.map((day, index) => (
                <Grid item xs key={index} sx={{ textAlign: 'center' }}>
                  <Typography fontWeight="bold">
                    {day}
                  </Typography>
                </Grid>
              ))}
            </Grid>
            
            {/* Grade do calendário */}
            <Grid container spacing={1}>
              {calendarDays.map((week, weekIndex) => (
                week.map((day, dayIndex) => (
                  <Grid item xs key={`${weekIndex}-${dayIndex}`}>
                    <DayCell
                      day={day}
                      alocacoes={getAlocacoesForDay(day)}
                      onAdd={handleAddAlocacao}
                      onEdit={handleEditAlocacao}
                      onDelete={handleDeleteAlocacao}
                      onView={handleViewAlocacao}
                    />
                  </Grid>
                ))
              ))}
            </Grid>
          </>
        )}
      </Paper>
      
      {/* Modal de Alocação */}
      <Dialog
        open={openAlocacaoModal}
        onClose={!savingAlocacao ? handleCloseAlocacaoModal : undefined}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedAlocacao ? t('calendar.editAllocation') : t('calendar.newAllocation')}
        </DialogTitle>
        <DialogContent>
          {loadingRelated ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress />
            </Box>
          ) : (
            <AlocacaoForm
              alocacao={selectedAlocacao}
              data={selectedDate ? selectedDate.format('YYYY-MM-DD') : null}
              empresas={empresas}
              funcionarios={funcionarios}
              onSave={handleSaveAlocacao}
              onCancel={handleCloseAlocacaoModal}
              loading={savingAlocacao}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Calendario;