import React, { createContext, useContext } from 'react';
import { useSnackbar } from 'notistack';

// Criar o contexto
const NotificationContext = createContext();

// Hook personalizado para usar o contexto
export const useNotification = () => useContext(NotificationContext);

// Provedor do contexto
export const NotificationProvider = ({ children }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  
  // Função para mostrar notificação de sucesso
  const showSuccess = (message) => {
    enqueueSnackbar(message, { 
      variant: 'success',
      autoHideDuration: 3000
    });
  };
  
  // Função para mostrar notificação de erro
  const showError = (message) => {
    enqueueSnackbar(message, { 
      variant: 'error',
      autoHideDuration: 5000
    });
  };
  
  // Função para mostrar notificação de informação
  const showInfo = (message) => {
    enqueueSnackbar(message, { 
      variant: 'info',
      autoHideDuration: 3000
    });
  };
  
  // Função para mostrar notificação de aviso
  const showWarning = (message) => {
    enqueueSnackbar(message, { 
      variant: 'warning',
      autoHideDuration: 4000
    });
  };
  
  // Valor do contexto
  const value = {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    closeSnackbar
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;