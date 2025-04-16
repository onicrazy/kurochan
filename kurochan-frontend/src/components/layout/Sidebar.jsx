import React, { useState } from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Collapse,
  Divider,
  Box,
  Typography,
  useTheme,
  IconButton
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  CalendarMonth as CalendarIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  AssignmentInd as AssignmentIcon,
  Payment as PaymentIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ open, toggleDrawer, isMobile }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  
  // Estado para controlar os submenus expandidos
  const [openSubMenu, setOpenSubMenu] = useState({
    pagamentos: false,
    relatorios: false
  });
  
  // Função para alternar a abertura do submenu
  const handleSubMenuToggle = (menu) => {
    setOpenSubMenu(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };
  
  // Função para navegar para uma rota
  const handleNavigate = (route) => {
    navigate(route);
    if (isMobile) {
      toggleDrawer();
    }
  };
  
  // Verificar se uma rota está ativa
  const isActive = (route) => {
    return location.pathname === route || location.pathname.startsWith(`${route}/`);
  };
  
  // Lista de menus
  const menuItems = [
    {
      text: t('menu.dashboard'),
      icon: <DashboardIcon />,
      route: '/dashboard',
      permission: true
    },
    {
      text: t('menu.calendar'),
      icon: <CalendarIcon />,
      route: '/calendario',
      permission: true
    },
    {
      text: t('menu.employees'),
      icon: <PeopleIcon />,
      route: '/funcionarios',
      permission: currentUser?.permissions?.canViewEmployees
    },
    {
      text: t('menu.companies'),
      icon: <BusinessIcon />,
      route: '/empresas',
      permission: currentUser?.permissions?.canViewCompanies
    },
    {
      text: t('menu.allocations'),
      icon: <AssignmentIcon />,
      route: '/alocacoes',
      permission: currentUser?.permissions?.canViewAllocations
    }
  ];
  
  // Submenus
  const paymentSubmenu = [
    {
      text: t('payments.employeePayments'),
      route: '/pagamentos/funcionarios',
      permission: currentUser?.permissions?.canViewEmployeePayments
    },
    {
      text: t('payments.companyInvoices'),
      route: '/pagamentos/empresas',
      permission: currentUser?.permissions?.canViewCompanyInvoices
    }
  ];
  
  const reportSubmenu = [
    {
      text: t('reports.financialReport'),
      route: '/relatorios/financeiro',
      permission: currentUser?.permissions?.canViewFinancialReports
    },
    {
      text: t('reports.employeeReport'),
      route: '/relatorios/funcionarios',
      permission: currentUser?.permissions?.canViewEmployeeReports
    },
    {
      text: t('reports.companyReport'),
      route: '/relatorios/empresas',
      permission: currentUser?.permissions?.canViewCompanyReports
    },
    {
      text: t('reports.allocationReport'),
      route: '/relatorios/alocacoes',
      permission: currentUser?.permissions?.canViewAllocationReports
    }
  ];
  
  return (
    <Drawer
      variant={isMobile ? "temporary" : "persistent"}
      anchor="left"
      open={open}
      onClose={toggleDrawer}
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, justifyContent: 'space-between' }}>
        <Typography variant="h6" color="primary">Kurochan</Typography>
        {isMobile && (
          <IconButton onClick={toggleDrawer}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>
      
      <Divider />
      
      <List>
        {menuItems.map((item) => (
          item.permission && (
            <ListItem 
              button 
              key={item.text}
              onClick={() => handleNavigate(item.route)}
              selected={isActive(item.route)}
              sx={{ 
                pl: 2,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(0, 123, 255, 0.08)',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 123, 255, 0.12)',
                  },
                }
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          )
        ))}
        
        {/* Submenu de Pagamentos */}
        {(currentUser?.permissions?.canViewEmployeePayments || currentUser?.permissions?.canViewCompanyInvoices) && (
          <>
            <ListItem 
              button 
              onClick={() => handleSubMenuToggle('pagamentos')}
              selected={isActive('/pagamentos')}
            >
              <ListItemIcon><PaymentIcon /></ListItemIcon>
              <ListItemText primary={t('menu.payments')} />
              {openSubMenu.pagamentos ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItem>
            
            <Collapse in={openSubMenu.pagamentos} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {paymentSubmenu.map((item) => (
                  item.permission && (
                    <ListItem 
                      button 
                      key={item.text}
                      onClick={() => handleNavigate(item.route)}
                      selected={isActive(item.route)}
                      sx={{ pl: 4 }}
                    >
                      <ListItemText primary={item.text} />
                    </ListItem>
                  )
                ))}
              </List>
            </Collapse>
          </>
        )}
        
        {/* Submenu de Relatórios */}
        {(currentUser?.permissions?.canViewReports) && (
          <>
            <ListItem 
              button 
              onClick={() => handleSubMenuToggle('relatorios')}
              selected={isActive('/relatorios')}
            >
              <ListItemIcon><AssessmentIcon /></ListItemIcon>
              <ListItemText primary={t('menu.reports')} />
              {openSubMenu.relatorios ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItem>
            
            <Collapse in={openSubMenu.relatorios} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {reportSubmenu.map((item) => (
                  item.permission && (
                    <ListItem 
                      button 
                      key={item.text}
                      onClick={() => handleNavigate(item.route)}
                      selected={isActive(item.route)}
                      sx={{ pl: 4 }}
                    >
                      <ListItemText primary={item.text} />
                    </ListItem>
                  )
                ))}
              </List>
            </Collapse>
          </>
        )}
        
        {/* Configurações */}
        <ListItem 
          button 
          onClick={() => handleNavigate('/configuracoes')}
          selected={isActive('/configuracoes')}
        >
          <ListItemIcon><SettingsIcon /></ListItemIcon>
          <ListItemText primary={t('menu.settings')} />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;