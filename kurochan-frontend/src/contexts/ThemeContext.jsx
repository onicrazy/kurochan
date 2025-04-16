import { createContext, useContext } from 'react';

// Criar o contexto do tema
export const ThemeContext = createContext({
  mode: 'light',
  toggleColorMode: () => {},
});

// Hook personalizado para acessar o contexto do tema
export const useThemeContext = () => useContext(ThemeContext);