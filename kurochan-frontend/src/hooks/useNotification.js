import { useContext } from 'react';
import NotificationContext from '../contexts/NotificationContext';

/**
 * Hook para acessar o contexto de notificações
 * @returns {Object} Contexto de notificações
 */
const useNotification = () => {
  return useContext(NotificationContext);
};

export default useNotification;