import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Layout
import Layout from './components/layout/Layout';

// Páginas de autenticação
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';

// Páginas principais
import Dashboard from './pages/dashboard';
import CalendarioAlocacoes from './pages/calendario/components/CalendarioAlocacoes';

// Páginas de funcionários
import FuncionariosList from './pages/funcionarios/FuncionariosList';
import FuncionarioCreate from './pages/funcionarios/FuncionarioCreate';
import FuncionarioDetails from './pages/funcionarios/FuncionarioDetails';
import FuncionarioEdit from './pages/funcionarios/FuncionarioEdit';

// Páginas de empresas
import EmpresasList from './pages/empresas/EmpresasList';
import EmpresaCreate from './pages/empresas/EmpresaCreate';
import EmpresaDetails from './pages/empresas/EmpresaDetails';
import EmpresaEdit from './pages/empresas/EmpresaEdit';

// Páginas de alocações
import AlocacoesList from './pages/alocacoes/AlocacoesList';
import AlocacaoDetails from './pages/alocacoes/AlocacaoDetails';

// Páginas de pagamentos
import PagamentosList from './pages/pagamentos/PagamentosList';

// Páginas de configurações
import ProfileSettings from './pages/settings/ProfileSettings';

// Componente de rota privada
import PrivateRoute from './components/common/PrivateRoute';

const AppRoutes = () => {
  const { currentUser } = useAuth();
  
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={
        currentUser ? <Navigate to="/" /> : <Login />
      } />
      <Route path="/esqueci-senha" element={<ForgotPassword />} />
      
      {/* Rotas privadas */}
      <Route path="/" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
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
      </Route>
      
      {/* Rota para página não encontrada */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;