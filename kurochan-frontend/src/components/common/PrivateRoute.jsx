import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';

/**
 * Componente para proteger rotas privadas
 * @param {Object} props - Propriedades do componente
 * @param {React.ReactNode} props.children - Componentes filhos
 * @returns {JSX.Element} Rota protegida
 */
const PrivateRoute = ({ children }) => {
  const { currentUser, loading, checkAuth } = useAuth();
  const location = useLocation();
  const [verifying, setVerifying] = useState(true);
  
  // Verificar autenticação quando o componente for montado
  useEffect(() => {
    const verify = async () => {
      await checkAuth();
      setVerifying(false);
    };
    
    verify();
  }, [checkAuth]);
  
  // Exibir indicador de carregamento enquanto verifica
  if (loading || verifying) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  
  // Redirecionar para login se não estiver autenticado
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} />;
  }
  
  // Renderizar componentes filhos se estiver autenticado
  return children;
};

export default PrivateRoute;