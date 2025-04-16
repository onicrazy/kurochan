import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Badge,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  EventNote as EventNoteIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import formatters from '../../../utils/formatters';

const DayCell = ({ day, alocacoes, onAdd, onEdit, onDelete, onView }) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Verificar se é um dia do mês atual
  const isCurrentMonth = day.isCurrentMonth;
  
  // Verificar se é hoje
  const isToday = day.isToday;
  
  // Obter o número do dia
  const dayNumber = day.dayOfMonth;
  
  // Verificar se é fim de semana
  const isWeekend = day.date.day() === 0 || day.date.day() === 6;
  
  // Manipulador para adicionar alocação
  const handleAdd = (e) => {
    e.stopPropagation();
    if (onAdd) onAdd(day.date);
  };
  
  // Manipulador para visualizar alocação
  const handleView = (alocacao, e) => {
    e.stopPropagation();
    if (onView) onView(alocacao);
  };
  
  // Manipulador para editar alocação
  const handleEdit = (alocacao, e) => {
    e.stopPropagation();
    if (onEdit) onEdit(alocacao);
  };
  
  // Manipulador para excluir alocação
  const handleDelete = (alocacao, e) => {
    e.stopPropagation();
    if (onDelete) onDelete(alocacao);
  };
  
  return (
    <Paper
      elevation={isToday ? 3 : 0}
      sx={{
        height: '100%',
        minHeight: isMobile ? 70 : 120,
        p: 1,
        opacity: isCurrentMonth ? 1 : 0.4,
        backgroundColor: isToday 
          ? 'rgba(25, 118, 210, 0.08)'
          : isWeekend
            ? 'rgba(0, 0, 0, 0.02)'
            : 'background.paper',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: 2
        }
      }}
      onClick={() => {
        if (isCurrentMonth && currentUser?.permissions?.canCreateAllocation) {
          if (onAdd) onAdd(day.date);
        }
      }}
    >
      {/* Cabeçalho da célula */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center"
        sx={{
          borderBottom: alocacoes.length > 0 ? '1px solid' : 'none',
          borderColor: 'divider',
          pb: alocacoes.length > 0 ? 0.5 : 0
        }}
      >
        <Typography 
          variant="body2" 
          fontWeight={isToday ? 'bold' : 'normal'}
          color={isToday ? 'primary.main' : 'text.primary'}
        >
          {dayNumber}
        </Typography>
        
        {isCurrentMonth && currentUser?.permissions?.canCreateAllocation && (
          <Tooltip title={t('calendar.addAllocation')}>
            <IconButton 
              size="small" 
              color="primary"
              onClick={handleAdd}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      
      {/* Conteúdo da célula (alocações) */}
      <Box 
        sx={{ 
          mt: 0.5, 
          maxHeight: isMobile ? 'calc(100% - 30px)' : 'calc(100% - 40px)',
          overflowY: 'auto'
        }}
      >
        {alocacoes.map((alocacao) => (
          <Box 
            key={alocacao.id}
            sx={{
              mb: 0.5,
              p: 0.5,
              borderRadius: 1,
              backgroundColor: alocacao.empresa_cor || 'primary.main',
              color: '#fff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.75rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            <Typography
              variant="caption"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1
              }}
              onClick={(e) => handleView(alocacao, e)}
            >
              {alocacao.funcionario_nome}
            </Typography>
            
            {!isMobile && (
              <Box display="flex">
                {currentUser?.permissions?.canEditAllocation && (
                  <IconButton 
                    size="small" 
                    sx={{ color: '#fff', p: 0.2, mx: 0.1 }}
                    onClick={(e) => handleEdit(alocacao, e)}
                  >
                    <EditIcon fontSize="inherit" />
                  </IconButton>
                )}
                
                {currentUser?.permissions?.canDeleteAllocation && (
                  <IconButton 
                    size="small" 
                    sx={{ color: '#fff', p: 0.2, mx: 0.1 }}
                    onClick={(e) => handleDelete(alocacao, e)}
                  >
                    <DeleteIcon fontSize="inherit" />
                  </IconButton>
                )}
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default DayCell;