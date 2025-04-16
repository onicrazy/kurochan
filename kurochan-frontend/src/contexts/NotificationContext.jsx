import React, { createContext, useContext, useState } from 'react';
import { SnackbarProvider, useSnackbar } from 'notistack';

// Criar o contexto
const NotificationContext = createContext();

// Hook personalizado para usar o contexto
export const useNotification = () => useContext(NotificationContext);

// Componente interno que utiliza o hook useSnackbar
const NotificationController = ({ children }) => {
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
  
  // Função para fechar notificação
  const closeNotification = (key) => {
    closeSnackbar(key);
  };
  
  // Valor do contexto
  const contextValue = {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    closeNotification
  };
  
  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// Provedor principal que combina o SnackbarProvider com o nosso contexto
export const NotificationProvider = ({ children }) => {
  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <NotificationController>
        {children}
      </NotificationController>
    </SnackbarProvider>
  );
};

export default NotificationContext;