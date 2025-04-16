import { useContext } from 'react';
import AuthContext from '../contexts/AuthContext';

/**
 * Hook personalizado para acessar o contexto de autenticação
 * @returns {Object} Contexto de autenticação
 */
const useAuth = () => {
  return useContext(AuthContext);
};

export default useAuth;