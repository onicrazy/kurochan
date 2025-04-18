// Localização: kurochan-frontend/src/contexts/ThemeContext.jsx

import React, { createContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material';
import getTheme from '../assets/styles/themes';

// Criar contexto
const ThemeContext = createContext();

// Provedor do contexto
export const ThemeProvider = ({ children }) => {
  // Estado para o modo de tema (claro/escuro)
  const [mode, setMode] = useState(localStorage.getItem('themeMode') || 'light');
  
  // Função para alternar entre tema claro e escuro
  const toggleColorMode = () => {
    setMode(prevMode => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  };
  
  // Criar o tema com base no modo atual
  const theme = useMemo(() => createTheme(getTheme(mode)), [mode]);
  
  // Valor do contexto
  const value = {
    mode,
    toggleColorMode
  };
  
  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

// Hook personalizado para acessar o contexto
export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext deve ser usado dentro de um ThemeProvider');
  }
  return context;
};

export default ThemeContext;