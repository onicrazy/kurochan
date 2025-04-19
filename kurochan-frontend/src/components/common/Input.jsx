import React, { useState } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  FormHelperText,
  FormControl,
  InputLabel,
  OutlinedInput,
  Box
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Help as HelpIcon
} from '@mui/icons-material';

/**
 * Componente de input customizado
 * @param {Object} props - Propriedades do componente
 * @returns {JSX.Element} Componente Input
 */
const Input = ({
  name,
  label,
  value,
  onChange,
  type = 'text',
  fullWidth = true,
  required = false,
  error = false,
  helperText = '',
  tooltip = '',
  startAdornment = null,
  endAdornment = null,
  disabled = false,
  multiline = false,
  rows = 1,
  placeholder = '',
  variant = 'outlined',
  size = 'medium',
  ...rest
}) => {
  // Estado para controlar a visibilidade da senha
  const [showPassword, setShowPassword] = useState(false);
  
  // Manipulador para alternar a visibilidade da senha
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Se for um input de senha, adicionar botão para mostrar/ocultar
  if (type === 'password') {
    endAdornment = (
      <InputAdornment position="end">
        <IconButton
          aria-label="toggle password visibility"
          onClick={handleTogglePasswordVisibility}
          edge="end"
        >
          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
        </IconButton>
      </InputAdornment>
    );
    
    // Atualizar o tipo com base no estado de visibilidade
    type = showPassword ? 'text' : 'password';
  }
  
  // Se tiver tooltip, adicionar ícone de ajuda
  if (tooltip) {
    if (!endAdornment) {
      endAdornment = (
        <InputAdornment position="end">
          <Tooltip title={tooltip} arrow>
            <IconButton edge="end">
              <HelpIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </InputAdornment>
      );
    } else {
      // Se já existir um endAdornment, adicionar o tooltip antes dele
      const existingEndAdornment = endAdornment;
      endAdornment = (
        <>
          <InputAdornment position="end">
            <Tooltip title={tooltip} arrow>
              <IconButton edge="end">
                <HelpIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </InputAdornment>
          {existingEndAdornment}
        </>
      );
    }
  }
  
  // Para variante padrão, usar TextField
  if (variant === 'standard' || variant === 'filled') {
    return (
      <TextField
        name={name}
        label={label}
        value={value}
        onChange={onChange}
        type={type}
        fullWidth={fullWidth}
        required={required}
        error={error}
        helperText={helperText}
        disabled={disabled}
        multiline={multiline}
        rows={rows}
        placeholder={placeholder}
        variant={variant}
        size={size}
        InputProps={{
          startAdornment: startAdornment ? (
            <InputAdornment position="start">{startAdornment}</InputAdornment>
          ) : null,
          endAdornment
        }}
        {...rest}
      />
    );
  }
  
  // Para variante outlined com adornments, usar FormControl e OutlinedInput
  return (
    <FormControl 
      fullWidth={fullWidth} 
      variant="outlined" 
      required={required}
      error={error}
      size={size}
      disabled={disabled}
    >
      <InputLabel htmlFor={`input-${name}`}>{label}</InputLabel>
      <OutlinedInput
        id={`input-${name}`}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        multiline={multiline}
        rows={rows}
        startAdornment={startAdornment ? (
          <InputAdornment position="start">{startAdornment}</InputAdornment>
        ) : null}
        endAdornment={endAdornment}
        label={label}
        {...rest}
      />
      {helperText && (
        <FormHelperText error={error}>{helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

export default Input;