import React from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  CircularProgress,
  useTheme 
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon, 
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon
} from '@mui/icons-material';

/**
 * Componente para exibir um cartão de status no dashboard
 * @param {Object} props - Propriedades do componente
 * @param {string} props.title - Título do cartão
 * @param {string|number} props.value - Valor principal a ser exibido
 * @param {number} props.percentage - Porcentagem de variação
 * @param {React.ReactNode} props.icon - Ícone a ser exibido
 * @param {string} props.color - Cor do cartão (primary, success, error, warning, info)
 * @param {boolean} props.loading - Indica se está carregando
 * @param {string} props.formatter - Função para formatar o valor
 */
const StatusCard = ({ 
  title, 
  value, 
  percentage = 0, 
  icon, 
  color = 'primary',
  loading = false,
  formatter = (val) => val
}) => {
  const theme = useTheme();
  
  // Determinar a cor do cartão
  const getColor = () => {
    switch (color) {
      case 'success': return theme.palette.success.main;
      case 'error': return theme.palette.error.main;
      case 'warning': return theme.palette.warning.main;
      case 'info': return theme.palette.info.main;
      default: return theme.palette.primary.main;
    }
  };
  
  // Determinar o ícone de tendência
  const getTrendIcon = () => {
    if (percentage > 0) {
      return <TrendingUpIcon fontSize="small" color="success" />;
    } else if (percentage < 0) {
      return <TrendingDownIcon fontSize="small" color="error" />;
    } else {
      return <TrendingFlatIcon fontSize="small" color="action" />;
    }
  };
  
  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2, 
        display: 'flex', 
        flexDirection: 'column',
        borderLeft: `4px solid ${getColor()}`,
        height: '100%'
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="subtitle2" color="textSecondary">
          {title}
        </Typography>
        {icon}
      </Box>
      
      {loading ? (
        <Box display="flex" justifyContent="center" py={1}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <>
          <Typography variant="h5" component="div" fontWeight="bold">
            {formatter(value)}
          </Typography>
          
          <Box display="flex" alignItems="center" mt={1}>
            {getTrendIcon()}
            <Typography variant="body2" ml={0.5}>
              {Math.abs(percentage).toFixed(1)}%
            </Typography>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default StatusCard;