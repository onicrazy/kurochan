import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

/**
 * Hook para acessar o contexto do tema
 * @returns {Object} Contexto do tema
 */
const useThemeContext = () => {
  return useContext(ThemeContext);
};

export default useThemeContext;