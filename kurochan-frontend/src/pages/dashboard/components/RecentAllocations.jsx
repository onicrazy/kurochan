import React from 'react';
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  Work as WorkIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import moment from 'moment';

const RecentAllocations = ({ alocacoes, loading }) => {
  const { t, i18n } = useTranslation();
  
  // Formatar valor monetário
  const formatCurrency = (value) => {
    if (typeof value !== 'number') {
      value = parseFloat(value || 0);
    }
    
    return i18n.language === 'ja'
      ? `¥${Math.round(value).toLocaleString('ja-JP')}`
      : `¥ ${Math.round(value).toLocaleString('pt-BR')}`;
  };
  
  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          {t('dashboard.todayAllocations')}
        </Typography>
      </Box>
      
      {loading ? (
        <Box display="flex" justifyContent="center" py={2} flexGrow={1}>
          <CircularProgress />
        </Box>
      ) : alocacoes.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={4} flexGrow={1}>
          <Typography variant="body1" color="textSecondary">
            {t('dashboard.noAllocationsToday')}
          </Typography>
        </Box>
      ) : (
        <>
          <List sx={{ flexGrow: 1 }}>
            {alocacoes.slice(0, 5).map(alocacao => (
              <React.Fragment key={alocacao.id}>
                <ListItem>
                  <ListItemIcon>
                    <WorkIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={alocacao.funcionario_nome}
                    secondary={alocacao.empresa_nome}
                  />
                  <Typography variant="body2">
                    {formatCurrency(alocacao.valor_cobrado_empresa)}
                  </Typography>
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
          
          <Box mt={2}>
            <Button 
              component={Link} 
              to="/calendario" 
              color="primary"
              endIcon={<ArrowForwardIcon />}
              fullWidth
            >
              {t('dashboard.viewCalendar')}
            </Button>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default RecentAllocations;