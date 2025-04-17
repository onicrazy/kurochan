import React, { useState, useEffect } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

/**
 * Componente de layout principal da aplicação
 */
const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  
  // Fechar drawer quando mudar para mobile
  useEffect(() => {
    if (isMobile) {
      setDrawerOpen(false);
    } else {
      setDrawerOpen(true);
    }
  }, [isMobile]);
  
  // Alternar abertura do drawer
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header toggleDrawer={toggleDrawer} />
      
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <Sidebar 
          open={drawerOpen} 
          toggleDrawer={toggleDrawer} 
          isMobile={isMobile} 
        />
        
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            mt: 8,
            width: { sm: `calc(100% - ${drawerOpen && !isMobile ? 240 : 0}px)` },
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          <Outlet />
        </Box>
      </Box>
      
      <Footer />
    </Box>
  );
};

export default Layout;