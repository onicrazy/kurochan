import React from 'react';
import { Button, CircularProgress } from '@mui/material';

/**
 * Componente de botão com indicador de carregamento
 * @param {Object} props - Propriedades do componente
 * @param {boolean} props.loading - Indica se está carregando
 * @param {React.ReactNode} props.children - Conteúdo do botão
 * @returns {JSX.Element} Componente LoadingButton
 */
const LoadingButton = ({
  loading = false,
  children,
  disabled,
  startIcon,
  ...props
}) => {
  return (
    <Button
      {...props}
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : startIcon}
    >
      {children}
    </Button>
  );
};

export default LoadingButton;