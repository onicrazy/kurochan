import React from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  CircularProgress,
  useTheme
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon, 
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  MonetizationOn as MonetizationOnIcon,
  ShowChart as ShowChartIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const FinancialSummary = ({ data, loading }) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  
  // Função para formatar moeda
  const formatCurrency = (value) => {
    if (typeof value !== 'number') {
      value = parseFloat(value || 0);
    }
    
    return i18n.language === 'ja'
      ? `¥${Math.round(value).toLocaleString('ja-JP')}`
      : `¥ ${Math.round(value).toLocaleString('pt-BR')}`;
  };
  
  // Função para renderizar o indicador de tendência
  const renderTrend = (value) => {
    if (!value && value !== 0) return null;
    
    if (value > 0) {
      return (
        <Box display="flex" alignItems="center">
          <TrendingUpIcon fontSize="small" color="success" />
          <Typography variant="body2" color="success.main" ml={0.5}>
            {Math.abs(value).toFixed(1)}% {t('common.increase')}
          </Typography>
        </Box>
      );
    } else if (value < 0) {
      return (
        <Box display="flex" alignItems="center">
          <TrendingDownIcon fontSize="small" color="error" />
          <Typography variant="body2" color="error.main" ml={0.5}>
            {Math.abs(value).toFixed(1)}% {t('common.decrease')}
          </Typography>
        </Box>
      );
    } else {
      return (
        <Box display="flex" alignItems="center">
          <TrendingFlatIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary" ml={0.5}>
            {t('common.noChange')}
          </Typography>
        </Box>
      );
    }
  };
  
  return (
    <Grid container spacing={3}>
      {/* Receita Mensal */}
      <Grid item xs={12} sm={6} md={4}>
        <Paper 
          elevation={2} 
          sx={{ 
            p: 2, 
            display: 'flex', 
            flexDirection: 'column',
            borderLeft: `4px solid ${theme.palette.primary.main}`,
            height: '100%'
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle2" color="textSecondary">
              {t('dashboard.monthlyRevenue')}
            </Typography>
            <MonetizationOnIcon color="primary" />
          </Box>
          
          {loading ? (
            <Box display="flex" justifyContent="center" py={1}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <>
              <Typography variant="h5" component="div" fontWeight="bold">
                {data?.receita_mes ? formatCurrency(data.receita_mes) : '¥ 0'}
              </Typography>
              
              {renderTrend(data?.variacao_receita)}
            </>
          )}
        </Paper>
      </Grid>
      
      {/* Despesa Mensal */}
      <Grid item xs={12} sm={6} md={4}>
        <Paper 
          elevation={2} 
          sx={{ 
            p: 2, 
            display: 'flex', 
            flexDirection: 'column',
            borderLeft: `4px solid ${theme.palette.error.main}`,
            height: '100%'
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle2" color="textSecondary">
              {t('dashboard.monthlyExpenses')}
            </Typography>
            <ShowChartIcon color="error" />
          </Box>
          
          {loading ? (
            <Box display="flex" justifyContent="center" py={1}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <>
              <Typography variant="h5" component="div" fontWeight="bold">
                {data?.despesa_mes ? formatCurrency(data.despesa_mes) : '¥ 0'}
              </Typography>
              
              {renderTrend(data?.variacao_despesa)}
            </>
          )}
        </Paper>
      </Grid>
      
      {/* Lucro Mensal */}
      <Grid item xs={12} sm={6} md={4}>
        <Paper 
          elevation={2} 
          sx={{ 
            p: 2, 
            display: 'flex', 
            flexDirection: 'column',
            borderLeft: `4px solid ${theme.palette.success.main}`,
            height: '100%'
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle2" color="textSecondary">
              {t('dashboard.monthlyProfit')}
            </Typography>
            <AccountBalanceIcon color="success" />
          </Box>
          
          {loading ? (
            <Box display="flex" justifyContent="center" py={1}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <>
              <Typography variant="h5" component="div" fontWeight="bold">
                {data?.lucro_mes ? formatCurrency(data.lucro_mes) : '¥ 0'}
              </Typography>
              
              {renderTrend(data?.variacao_lucro)}
            </>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default FinancialSummary;