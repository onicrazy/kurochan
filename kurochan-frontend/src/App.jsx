// Localização: kurochan-frontend/src/App.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Box } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { ThemeContext } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';

// Layout e Componentes
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';

// Páginas
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import Dashboard from './pages/dashboard';
import CalendarioAlocacoes from './pages/calendario';
import FuncionariosList from './pages/funcionarios/FuncionariosList';
import FuncionarioCreate from './pages/funcionarios/FuncionarioCreate';
import FuncionarioDetails from './pages/funcionarios/FuncionarioDetails';
import FuncionarioEdit from './pages/funcionarios/FuncionarioEdit';
import EmpresasList from './pages/empresas/EmpresasList';
import EmpresaCreate from './pages/empresas/EmpresaCreate';
import EmpresaDetails from './pages/empresas/EmpresaDetails';
import EmpresaEdit from './pages/empresas/EmpresaEdit';
import AlocacoesList from './pages/alocacoes/AlocacoesList';
import AlocacaoDetails from './pages/alocacoes/AlocacaoDetails';
import PagamentosList from './pages/pagamentos/PagamentosList';
import ProfileSettings from './pages/settings/ProfileSettings';
import PrivateRoute from './components/common/PrivateRoute';

// Estilos e temas
import getTheme from './assets/styles/themes';

function App() {
  // Estado para controle do tema
  const [mode, setMode] = useState(localStorage.getItem('themeMode') || 'light');
  
  // Estado para controle da sidebar
  const [drawerOpen, setDrawerOpen] = useState(true);
  
  // Verificar se é dispositivo móvel
  const isMobile = useMemo(() => {
    return window.innerWidth < 768;
  }, []);
  
  // Efeito para fechar drawer em dispositivos móveis
  useEffect(() => {
    if (isMobile) {
      setDrawerOpen(false);
    }
  }, [isMobile]);
  
  // Alternar abertura do drawer
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  // Alternar tema claro/escuro
  const toggleColorMode = () => {
    setMode(prevMode => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  };
  
  // Criar tema com base no modo atual
  const theme = useMemo(
    () => createTheme(getTheme(mode)),
    [mode],
  );
  
  return (
    <ThemeContext.Provider value={{ mode, toggleColorMode }}>
      <ThemeProvider theme={theme}>
        <SnackbarProvider maxSnack={3}>
          <Router>
            <AuthProvider>
              <CssBaseline />
              <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Routes>
                  {/* Rotas públicas */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/esqueci-senha" element={<ForgotPassword />} />
                  
                  {/* Rotas privadas */}
                  <Route path="/" element={
                    <PrivateRoute>
                      <Box sx={{ display: 'flex', flexGrow: 1 }}>
                        <Header toggleDrawer={toggleDrawer} />
                        <Sidebar open={drawerOpen} toggleDrawer={toggleDrawer} isMobile={isMobile} />
                        <Box
                          component="main"
                          sx={{
                            flexGrow: 1,
                            p: 3,
                            mt: 8,
                            width: { sm: `calc(100% - ${drawerOpen && !isMobile ? 240 : 0}px)` }
                          }}
                        >
                          <Routes>
                            <Route path="/" element={<Navigate to="/dashboard" />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/calendario" element={<CalendarioAlocacoes />} />
                            
                            {/* Rotas de Funcionários */}
                            <Route path="/funcionarios" element={<FuncionariosList />} />
                            <Route path="/funcionarios/novo" element={<FuncionarioCreate />} />
                            <Route path="/funcionarios/:id" element={<FuncionarioDetails />} />
                            <Route path="/funcionarios/:id/editar" element={<FuncionarioEdit />} />
                            
                            {/* Rotas de Empresas */}
                            <Route path="/empresas" element={<EmpresasList />} />
                            <Route path="/empresas/nova" element={<EmpresaCreate />} />
                            <Route path="/empresas/:id" element={<EmpresaDetails />} />
                            <Route path="/empresas/:id/editar" element={<EmpresaEdit />} />
                            
                            {/* Rotas de Alocações */}
                            <Route path="/alocacoes" element={<AlocacoesList />} />
                            <Route path="/alocacoes/:id" element={<AlocacaoDetails />} />
                            
                            {/* Rotas de Pagamentos */}
                            <Route path="/pagamentos/*" element={<PagamentosList />} />
                            
                            {/* Configurações */}
                            <Route path="/configuracoes" element={<ProfileSettings />} />
                          </Routes>
                        </Box>
                      </Box>
                      <Footer />
                    </PrivateRoute>
                  } />
                </Routes>
              </Box>
            </AuthProvider>
          </Router>
        </SnackbarProvider>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export default App;