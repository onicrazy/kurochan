import React, { useState, useEffect, useMemo } from 'react';
import { Box, Grid, Typography, Paper, Chip, Button, CircularProgress, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { api } from '../../../services/api';
import DayCell from './DayCell';

const CalendarioAlocacoes = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alocacoes, setAlocacoes] = useState([]);
  const [currentDate, setCurrentDate] = useState(moment());
  
  // Memorizar o primeiro e último dia do mês atual
  const { firstDay, lastDay, currentMonth, currentYear } = useMemo(() => {
    const firstDay = moment(currentDate).startOf('month');
    const lastDay = moment(currentDate).endOf('month');
    return {
      firstDay,
      lastDay,
      currentMonth: currentDate.format('MMMM'),
      currentYear: currentDate.format('YYYY')
    };
  }, [currentDate]);

  // Gerar array de semanas e dias para o calendário
  const calendarDays = useMemo(() => {
    // Iniciar com o primeiro dia da semana que contém o primeiro dia do mês
    const startDate = moment(firstDay).startOf('week');
    // Terminar no último dia da semana que contém o último dia do mês
    const endDate = moment(lastDay).endOf('week');
    
    const days = [];
    let week = [];
    
    for (let day = moment(startDate); day.isSameOrBefore(endDate); day.add(1, 'day')) {
      week.push({
        date: moment(day),
        isCurrentMonth: day.month() === currentDate.month(),
        isToday: day.isSame(moment(), 'day'),
        dayOfMonth: day.date()
      });
      
      if (week.length === 7) {
        days.push([...week]);
        week = [];
      }
    }
    
    return days;
  }, [firstDay, lastDay, currentDate]);

  // Mapeamento de alocações por data
  const alocacoesPorData = useMemo(() => {
    const map = {};
    
    alocacoes.forEach(alocacao => {
      const dataKey = moment(alocacao.data_alocacao).format('YYYY-MM-DD');
      if (!map[dataKey]) {
        map[dataKey] = [];
      }
      map[dataKey].push(alocacao);
    });
    
    return map;
  }, [alocacoes]);

  // Carregar alocações do mês atual
  useEffect(() => {
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
      } finally {
        setLoading(false);
      }
    };
    
    fetchAlocacoes();
  }, [currentDate, t]);

  // Navegar para o mês anterior
  const handlePreviousMonth = () => {
    setCurrentDate(moment(currentDate).subtract(1, 'month'));
  };

  // Navegar para o próximo mês
  const handleNextMonth = () => {
    setCurrentDate(moment(currentDate).add(1, 'month'));
  };

  // Navegar para o mês atual
  const handleCurrentMonth = () => {
    setCurrentDate(moment());
  };

  // Criar nova alocação
  const handleNovaAlocacao = () => {
    navigate('/alocacoes/nova');
  };

  // Gerar relatório do mês
  const handleGerarRelatorio = () => {
    const ano = currentDate.year();
    const mes = currentDate.month() + 1;
    navigate(`/relatorios/alocacoes?ano=${ano}&mes=${mes}`);
  };

  // Renderizar cabeçalho dos dias da semana
  const weekDays = useMemo(() => {
    return moment.weekdaysShort().map(day => (
      <Grid item xs key={day}>
        <Typography 
          variant="subtitle1" 
          align="center" 
          sx={{ 
            fontWeight: 'bold',
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            py: 1,
            borderRadius: '4px 4px 0 0'
          }}
        >
          {day}
        </Typography>
      </Grid>
    ));
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        {/* Controles de navegação e ações */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Button 
              variant="outlined" 
              onClick={handlePreviousMonth} 
              sx={{ mr: 1 }}
            >
              &lt;
            </Button>
            
            <Typography variant="h5" component="span" sx={{ mx: 2 }}>
              {currentMonth} {currentYear}
            </Typography>
            
            <Button 
              variant="outlined" 
              onClick={handleNextMonth} 
              sx={{ ml: 1 }}
            >
              &gt;
            </Button>
            
            <Button 
              variant="text" 
              onClick={handleCurrentMonth} 
              sx={{ ml: 2 }}
            >
              {t('common.today')}
            </Button>
          </Box>
          
          <Box>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleNovaAlocacao} 
              sx={{ mr: 2 }}
            >
              {t('calendar.addAllocation')}
            </Button>
            
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={handleGerarRelatorio}
            >
              {t('calendar.generateReport')}
            </Button>
          </Box>
        </Box>
        
        {/* Exibir erro se houver */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {/* Calendário */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={1}>
            {/* Cabeçalho dos dias da semana */}
            {weekDays}
            
            {/* Dias do calendário */}
            {calendarDays.map((week, weekIndex) => (
              week.map((day, dayIndex) => (
                <Grid item xs key={`${weekIndex}-${dayIndex}`}>
                  <DayCell 
                    day={day}
                    alocacoes={alocacoesPorData[day.date.format('YYYY-MM-DD')] || []}
                  />
                </Grid>
              ))
            ))}
          </Grid>
        )}
      </Paper>
      
      {/* Legenda */}
      <Paper elevation={2} sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          {t('common.legend')}:
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip label={t('allocation.paid')} color="success" />
          <Chip label={t('allocation.pending')} color="warning" />
          <Chip label={t('employees.driver')} sx={{ backgroundColor: '#4285F4', color: 'white' }} />
          <Chip label={t('employees.assistant')} sx={{ backgroundColor: '#34A853', color: 'white' }} />
        </Box>
      </Paper>
    </Box>
  );
};

export default CalendarioAlocacoes;