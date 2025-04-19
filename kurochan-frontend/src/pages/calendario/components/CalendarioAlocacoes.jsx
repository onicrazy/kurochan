import React, { useState, useEffect, useMemo } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  CircularProgress,
  Alert
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { useSnackbar } from 'notistack';

import api from '../../../services/api';
import DayCell from './DayCell';

const CalendarioAlocacoes = ({ currentDate, onAddAlocacao }) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  
  // Estados para dados e carregamento
  const [alocacoes, setAlocacoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Dias da semana
  const weekDays = useMemo(() => {
    return moment.weekdaysShort();
  }, []);
  
  // Gerar dias do calendário
  const calendarDays = useMemo(() => {
    const startOfMonth = moment(currentDate).startOf('month');
    const endOfMonth = moment(currentDate).endOf('month');
    
    // Ajustar para começar na semana anterior se o mês não começar no domingo
    const startDate = moment(startOfMonth).startOf('week');
    // Ajustar para terminar na semana seguinte se o mês não terminar no sábado
    const endDate = moment(endOfMonth).endOf('week');
    
    const days = [];
    let week = [];
    
    for (let day = moment(startDate); day.isSameOrBefore(endDate); day.add(1, 'day')) {
      week.push(moment(day));
      
      if (week.length === 7) {
        days.push([...week]);
        week = [];
      }
    }
    
    return days;
  }, [currentDate]);
  
  // Buscar alocações para o mês atual
  useEffect(() => {
    fetchAlocacoes();
  }, [currentDate]);
  
  // Função para buscar alocações
  const fetchAlocacoes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const ano = currentDate.year();
      const mes = currentDate.month() + 1; // Mês no Moment.js começa em 0
      
      const response = await api.get(`/alocacoes/calendario/${ano}/${mes}`);
      setAlocacoes(response.data.data);
      
    } catch (err) {
      console.error('Erro ao buscar alocações:', err);
      setError(t('calendar.error.fetchFailed'));
      enqueueSnackbar(t('calendar.error.fetchFailed'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  // Filtrar alocações para um dia específico
  const getAlocacoesForDay = (day) => {
    return alocacoes.filter(alocacao => 
      moment(alocacao.data_alocacao).isSame(day, 'day')
    );
  };
  
  // Manipulador para visualizar alocação
  const handleViewAlocacao = (alocacaoId) => {
    window.location.href = `/alocacoes/${alocacaoId}`;
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }
  
  return (
    <Box>
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
                isCurrentMonth={day.month() === currentDate.month()}
                alocacoes={getAlocacoesForDay(day)}
                onAdd={() => onAddAlocacao(day)}
                onView={handleViewAlocacao}
              />
            </Grid>
          ))
        ))}
      </Grid>
    </Box>
  );
};

export default CalendarioAlocacoes;