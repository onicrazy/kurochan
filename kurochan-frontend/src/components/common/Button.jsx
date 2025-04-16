import React from 'react';
import {
  Button as MuiButton,
  CircularProgress,
  Tooltip
} from '@mui/material';

/**
 * Componente de botão customizado
 * @param {Object} props - Propriedades do componente
 * @returns {JSX.Element} Componente Button
 */
const Button = ({
  children,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  startIcon = null,
  endIcon = null,
  onClick,
  tooltip = '',
  type = 'button',
  ...rest
}) => {
  // Componente base do botão
  const ButtonComponent = (
    <MuiButton
      variant={variant}
      color={color}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : startIcon}
      endIcon={endIcon}
      onClick={onClick}
      type={type}
      {...rest}
    >
      {children}
    </MuiButton>
  );
  
  // Se tiver tooltip, adicionar wrapper
  if (tooltip) {
    return (
      <Tooltip title={tooltip} arrow>
        {ButtonComponent}
      </Tooltip>
    );
  }
  
  return ButtonComponent;
};

export default Button;