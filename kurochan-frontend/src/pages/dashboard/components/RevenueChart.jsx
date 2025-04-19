import React, { useMemo } from 'react';
import {
  Paper,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const RevenueChart = ({ data, loading }) => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  
  // Configuração do gráfico
  const chartData = useMemo(() => {
    if (!data || !data.meses) {
      return {
        labels: [],
        datasets: []
      };
    }
    
    return {
      labels: data.meses || [],
      datasets: [
        {
          label: t('dashboard.revenue'),
          data: data.receitas || [],
          fill: false,
          backgroundColor: theme.palette.primary.main,
          borderColor: theme.palette.primary.main,
        },
        {
          label: t('dashboard.expenses'),
          data: data.despesas || [],
          fill: false,
          backgroundColor: theme.palette.error.main,
          borderColor: theme.palette.error.main,
        },
        {
          label: t('dashboard.profit'),
          data: data.lucros || [],
          fill: false,
          backgroundColor: theme.palette.success.main,
          borderColor: theme.palette.success.main,
        }
      ]
    };
  }, [data, theme, t]);
  
  // Opções do gráfico
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += i18n.language === 'ja'
                ? `¥${Math.round(context.parsed.y).toLocaleString('ja-JP')}`
                : `¥ ${Math.round(context.parsed.y).toLocaleString('pt-BR')}`;
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return i18n.language === 'ja'
              ? `¥${Math.round(value).toLocaleString('ja-JP')}`
              : `¥ ${Math.round(value).toLocaleString('pt-BR')}`;
          }
        }
      }
    }
  };
  
  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">{t('dashboard.monthlyFinancialChart')}</Typography>
      </Box>
      
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={300}>
          <CircularProgress />
        </Box>
      ) : data?.meses?.length > 0 ? (
        <Box height={300}>
          <Line 
            data={chartData} 
            options={chartOptions}
          />
        </Box>
      ) : (
        <Box display="flex" justifyContent="center" alignItems="center" height={300}>
          <Typography variant="body1" color="textSecondary">
            {t('dashboard.noDataAvailable')}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default RevenueChart;