import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { Translate as TranslateIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

/**
 * Componente para seleção de idioma
 */
const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Manipulador para abrir o menu
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Manipulador para fechar o menu
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  // Manipulador para alterar o idioma
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    handleClose();
  };
  
  // Configuração dos idiomas disponíveis
  const languages = [
    { code: 'pt-BR', name: 'Português', nativeName: 'Português' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' }
  ];
  
  return (
    <>
      <Tooltip title={t('settings.language')}>
        <IconButton
          color="inherit"
          aria-label="change language"
          onClick={handleClick}
          size="large"
        >
          <TranslateIcon />
        </IconButton>
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          elevation: 2
        }}
      >
        {languages.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            selected={i18n.language === lang.code}
          >
            <ListItemText>
              {lang.nativeName}
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSwitcher;