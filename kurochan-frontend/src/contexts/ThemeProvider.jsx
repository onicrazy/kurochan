import React, { useState, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import ThemeContext from './ThemeContext';
import getTheme from '../assets/styles/themes';

/**
 * Provedor de tema para a aplicação
 * @param {Object} props - Propriedades do componente
 * @param {React.ReactNode} props.children - Componentes filhos
 * @returns {JSX.Element} Provedor de tema
 */
const ThemeProvider = ({ children }) => {
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
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;