import React from 'react';
import {
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useThemeContext } from '../../contexts/ThemeContext';

/**
 * Componente para alternar entre tema claro e escuro
 */
const ThemeSwitcher = () => {
  const { t } = useTranslation();
  const { mode, toggleColorMode } = useThemeContext();
  
  return (
    <Tooltip title={mode === 'dark' ? t('settings.light') : t('settings.dark')}>
      <IconButton
        color="inherit"
        onClick={toggleColorMode}
        size="large"
      >
        {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeSwitcher;