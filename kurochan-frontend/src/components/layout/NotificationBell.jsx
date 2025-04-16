import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsNone as NotificationsNoneIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

/**
 * Componente para exibir notificações
 */
const NotificationBell = () => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Carregar notificações
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        
        // Simular busca de notificações
        // Em um ambiente real, isso seria uma chamada à API
        // const response = await api.get('/notificacoes');
        
        // Dados de exemplo
        const exampleNotifications = [
          {
            id: 1,
            type: 'payment_employee',
            message: t('payments.newEmployeePayment'),
            description: `3 ${t('employees.title')} ${t('payments.pending').toLowerCase()}`,
            read: false,
            createdAt: new Date()
          },
          {
            id: 2,
            type: 'payment_company',
            message: t('payments.newCompanyInvoice'),
            description: `2 ${t('companies.title')} ${t('payments.pending').toLowerCase()}`,
            read: false,
            createdAt: new Date()
          }
        ];
        
        setNotifications(exampleNotifications);
      } catch (error) {
        console.error('Erro ao buscar notificações:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, [t]);
  
  // Manipulador para abrir o menu
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Manipulador para fechar o menu
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  // Manipulador para marcar notificação como lida
  const handleMarkAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };
  
  // Manipulador para marcar todas como lidas
  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    
    handleClose();
  };
  
  // Total de notificações não lidas
  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  return (
    <>
      <Tooltip title={t('settings.notifications')}>
        <IconButton
          color="inherit"
          onClick={handleClick}
          size="large"
        >
          <Badge badgeContent={unreadCount} color="error">
            {unreadCount > 0 ? <NotificationsIcon /> : <NotificationsNoneIcon />}
          </Badge>
        </IconButton>
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          elevation: 2,
          sx: { width: 320 }
        }}
      >
        {notifications.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="textSecondary">
              {t('common.noResults')}
            </Typography>
          </MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleMarkAsRead(notification.id)}
              sx={{ 
                backgroundColor: notification.read ? 'inherit' : 'rgba(0, 0, 0, 0.04)'
              }}
            >
              <Box sx={{ width: '100%' }}>
                <Typography variant="subtitle2">
                  {notification.message}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {notification.description}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
        
        {notifications.length > 0 && (
          <>
            <Divider />
            <MenuItem onClick={handleMarkAllAsRead}>
              <Typography variant="body2" color="primary" align="center" sx={{ width: '100%' }}>
                {t('common.seeAll')}
              </Typography>
            </MenuItem>
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;