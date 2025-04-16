error: {
            main: '#dc3545',
          },
        },
      }),
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
                            
                            {/* Rotas de Pagamentos */}
                            <Route path="/pagamentos/*" element={<PagamentosList />} />
                            
                            {/* Rotas de Relatórios */}
                            <Route path="/relatorios/*" element={<RelatoriosList />} />
                            
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