// Localização: kurochan-frontend/src/pages/calendario/components/DayCell.jsx

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { useAuth } from '../../../hooks/useAuth';
import formatters from '../../../utils/formatters';

/**
 * Componente para célula do calendário
 */
const DayCell = ({ day, alocacoes = [], onAdd, onEdit, onDelete, onView }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Verificar se é hoje
  const isToday = day.isSame(moment(), 'day');
  
  // Verificar se é dia do mês atual
  const isCurrentMonth = day.isSame(moment(), 'month');
  
  // Verificar se é fim de semana
  const isWeekend = day.day() === 0 || day.day() === 6;
  
  // Manipulador para adicionar alocação
  const handleAdd = (e) => {
    e.stopPropagation();
    if (onAdd && currentUser?.permissions?.canCreateAllocation) {
      onAdd(day);
    }
  };
  
  // Manipulador para editar alocação
  const handleEdit = (alocacao, e) => {
    e.stopPropagation();
    if (onEdit && currentUser?.permissions?.canEditAllocation) {
      onEdit(alocacao);
    }
  };
  
  // Manipulador para excluir alocação
  const handleDelete = (alocacao, e) => {
    e.stopPropagation();
    if (onDelete && currentUser?.permissions?.canDeleteAllocation) {
      onDelete(alocacao);
    }
  };
  
  // Manipulador para visualizar alocação
  const handleView = (alocacao, e) => {
    e.stopPropagation();
    if (onView) {
      onView(alocacao);
    }
  };
  
  return (
    <Paper
      elevation={isToday ? 3 : 0}
      sx={{
        height: '100%',
        minHeight: isMobile ? 80 : 120,
        p: 1,
        backgroundColor: isToday 
          ? 'rgba(25, 118, 210, 0.08)'
          : isWeekend 
            ? 'rgba(0, 0, 0, 0.02)'
            : 'background.paper',
        opacity: isCurrentMonth ? 1 : 0.5,
        border: '1px solid',
        borderColor: 'divider',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Cabeçalho do dia */}
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
              onClick={handleAdd}
              disabled={!currentUser?.permissions?.canCreateAllocation}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      
      {/* Lista de alocações */}
      <Box sx={{ overflowY: 'auto', maxHeight: isMobile ? '70%' : '80%' }}>
        {alocacoes.map((alocacao) => (
          <Box 
            key={alocacao.id} 
            sx={{
              mb: 0.5,
              p: 0.5,
              borderRadius: 1,
              backgroundColor: alocacao.empresa_cor || theme.palette.primary.main,
              color: 'white',
              fontSize: '0.75rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer'
            }}
            onClick={(e) => handleView(alocacao, e)}
          >
            <Typography variant="caption" noWrap sx={{ flex: 1 }}>
              {alocacao.funcionario_nome}
            </Typography>
            
            {!isMobile && (
              <Box>
                <IconButton 
                  size="small" 
                  sx={{ color: 'white', p: 0.2 }}
                  onClick={(e) => handleEdit(alocacao, e)}
                  disabled={!currentUser?.permissions?.canEditAllocation}
                >
                  <EditIcon fontSize="inherit" />
                </IconButton>
                
                <IconButton 
                  size="small" 
                  sx={{ color: 'white', p: 0.2 }}
                  onClick={(e) => handleDelete(alocacao, e)}
                  disabled={!currentUser?.permissions?.canDeleteAllocation}
                >
                  <DeleteIcon fontSize="inherit" />
                </IconButton>
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default DayCell;