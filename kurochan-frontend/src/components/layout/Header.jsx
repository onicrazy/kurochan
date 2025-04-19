import React, { useState } from 'react';
import { ListItemIcon } from '@mui/material';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  Badge,
  Divider,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Translate as TranslateIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeContext } from '../../contexts/ThemeContext';

const Header = ({ toggleDrawer }) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const { currentUser, logout } = useAuth();
  const { mode, toggleColorMode } = useThemeContext();
  
  // Estados para os menus
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [langAnchorEl, setLangAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  
  // Funções para abrir/fechar menus
  const handleProfileMenuOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };
  
  const handleLangMenuOpen = (event) => {
    setLangAnchorEl(event.currentTarget);
  };
  
  const handleLangMenuClose = () => {
    setLangAnchorEl(null);
  };
  
  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };
  
  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };
  
  // Função para alterar o idioma
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    handleLangMenuClose();
  };
  
  // Função de logout
  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
  };
  
  // Iniciais do nome do usuário para o avatar
  const getUserInitials = () => {
    if (!currentUser || !currentUser.nome) return '?';
    
    const names = currentUser.nome.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };
  
  return (
    <AppBar position="fixed" elevation={1}>
      <Toolbar>
        {/* Menu Drawer Button */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={toggleDrawer}
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        {/* Title */}
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Kurochan
        </Typography>
        
        {/* Language Selector */}
        <Tooltip title={t('settings.language')}>
          <IconButton
            color="inherit"
            onClick={handleLangMenuOpen}
            size="large"
          >
            <TranslateIcon />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={langAnchorEl}
          open={Boolean(langAnchorEl)}
          onClose={handleLangMenuClose}
          PaperProps={{
            elevation: 2,
          }}
        >
          <MenuItem onClick={() => changeLanguage('pt-BR')} selected={i18n.language === 'pt-BR'}>
            {t('settings.portuguese')}
          </MenuItem>
          <MenuItem onClick={() => changeLanguage('ja')} selected={i18n.language === 'ja'}>
            {t('settings.japanese')}
          </MenuItem>
        </Menu>
        
        {/* Theme Toggle */}
        <Tooltip title={mode === 'dark' ? t('settings.light') : t('settings.dark')}>
          <IconButton
            color="inherit"
            onClick={toggleColorMode}
            size="large"
          >
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>
        
        {/* Notifications */}
        <Tooltip title={t('settings.notifications')}>
          <IconButton
            color="inherit"
            onClick={handleNotificationMenuOpen}
            size="large"
          >
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={notificationAnchorEl}
          open={Boolean(notificationAnchorEl)}
          onClose={handleNotificationMenuClose}
          PaperProps={{
            elevation: 2,
            sx: { width: 320 }
          }}
        >
          <MenuItem>
            <Box sx={{ width: '100%' }}>
              <Typography variant="subtitle2">
                {t('payments.newEmployeePayment')}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                3 {t('employees.title')} {t('payments.pending').toLowerCase()}
              </Typography>
            </Box>
          </MenuItem>
          <Divider />
          <MenuItem>
            <Box sx={{ width: '100%' }}>
              <Typography variant="subtitle2">
                {t('payments.newCompanyInvoice')}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                2 {t('companies.title')} {t('payments.pending').toLowerCase()}
              </Typography>
            </Box>
          </MenuItem>
          <Divider />
          <MenuItem>
            <Typography variant="body2" color="primary" align="center" sx={{ width: '100%' }}>
              {t('common.seeAll')}
            </Typography>
          </MenuItem>
        </Menu>
        
        {/* User Profile */}
        <Tooltip title={currentUser?.nome || t('auth.login')}>
          <IconButton
            color="inherit"
            onClick={handleProfileMenuOpen}
            size="large"
            sx={{ ml: 1 }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              {getUserInitials()}
            </Avatar>
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={profileAnchorEl}
          open={Boolean(profileAnchorEl)}
          onClose={handleProfileMenuClose}
          PaperProps={{
            elevation: 2,
          }}
        >
          <MenuItem onClick={handleProfileMenuClose}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="inherit">{t('settings.profile')}</Typography>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="inherit">{t('auth.logout')}</Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;