import React, { useState, useEffect } from 'react';
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
  CircularProgress
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import moment from 'moment';

import api from '../../services/api';
import CalendarioAlocacoes from './components/CalendarioAlocacoes';
import AlocacaoForm from '../../components/forms/AlocacaoForm';

const Calendario = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  // Estado para o mês atual
  const [currentDate, setCurrentDate] = useState(moment());
  
  // Estados para modal de alocação
  const [openModal, setOpenModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Estados para dados relacionados
  const [empresas, setEmpresas] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  
  // Carregar dados relacionados quando o componente é montado
  useEffect(() => {
    fetchRelatedData();
  }, []);
  
  // Função para buscar empresas e funcionários
  const fetchRelatedData = async () => {
    try {
      setLoadingData(true);
      
      // Buscar empresas ativas
      const empresasResponse = await api.get('/empresas', {
        params: { ativa: true }
      });
      
      // Buscar funcionários ativos
      const funcionariosResponse = await api.get('/funcionarios', {
        params: { ativo: true }
      });
      
      setEmpresas(empresasResponse.data.data);
      setFuncionarios(funcionariosResponse.data.data);
      
    } catch (err) {
      console.error('Erro ao carregar dados relacionados:', err);
      enqueueSnackbar(t('calendar.error.fetchRelatedData'), { variant: 'error' });
    } finally {
      setLoadingData(false);
    }
  };
  
  // Navegar para o mês anterior
  const goToPreviousMonth = () => {
    setCurrentDate(prev => moment(prev).subtract(1, 'month'));
  };
  
  // Navegar para o próximo mês
  const goToNextMonth = () => {
    setCurrentDate(prev => moment(prev).add(1, 'month'));
  };
  
  // Abrir modal para criar nova alocação
  const handleAddAlocacao = (date) => {
    setSelectedDate(date || moment());
    setOpenModal(true);
  };
  
  // Fechar modal de alocação
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedDate(null);
  };
  
  // Salvar nova alocação
  const handleSaveAlocacao = async (formData) => {
    try {
      setLoading(true);
      
      await api.post('/alocacoes', formData);
      
      enqueueSnackbar(t('calendar.success.allocationCreated'), { variant: 'success' });
      handleCloseModal();
      
    } catch (err) {
      console.error('Erro ao criar alocação:', err);
      enqueueSnackbar(t('calendar.error.saveFailed'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="xl">
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">{t('calendar.title')}</Typography>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleAddAlocacao()}
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
          
          <Button
            variant="outlined"
            startIcon={<AssignmentIcon />}
            onClick={() => window.location.href = `/relatorios?mes=${currentDate.month() + 1}&ano=${currentDate.year()}`}
          >
            {t('calendar.generateReport')}
          </Button>
        </Box>
        
        {/* Componente de Calendário */}
        <CalendarioAlocacoes 
          currentDate={currentDate}
          onAddAlocacao={handleAddAlocacao}
        />
      </Paper>
      
      {/* Modal para adicionar alocação */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t('calendar.newAllocation')}</DialogTitle>
        <DialogContent>
          {loadingData ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress />
            </Box>
          ) : (
            <AlocacaoForm
              data={selectedDate ? selectedDate.format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')}
              empresas={empresas}
              funcionarios={funcionarios}
              onSave={handleSaveAlocacao}
              onCancel={handleCloseModal}
              loading={loading}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Calendario;