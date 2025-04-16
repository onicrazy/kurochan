import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import authService from '../services/auth';

// Criar o contexto
const AuthContext = createContext();

// Hook personalizado para usar o contexto
export const useAuth = () => useContext(AuthContext);

// Provedor do contexto
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  
  // Função para login
  const login = async (email, senha) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.login(email, senha);
      
      const { token, user } = response;
      
      // Armazenar token no localStorage
      localStorage.setItem('token', token);
      
      // Configurar token no cabeçalho das requisições
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Adicionar permissões ao usuário
      const permissions = mapPermissions(user.funcao);
      const userWithPermissions = { ...user, permissions };
      
      setToken(token);
      setCurrentUser(userWithPermissions);
      
      return { success: true, user: userWithPermissions };
      
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao fazer login');
      console.error('Erro ao fazer login:', err);
      return { success: false, error: err.response?.data?.message || 'Erro ao fazer login' };
    } finally {
      setLoading(false);
    }
  };
  
  // Função para logout
  const logout = () => {
    localStorage.removeItem('token');
    api.defaults.headers.common['Authorization'] = '';
    setToken(null);
    setCurrentUser(null);
    navigate('/login');
  };
  
  // Função para verificar o token e obter dados do usuário atual
  const checkAuth = async () => {
    if (!token) {
      setLoading(false);
      return false;
    }
    
    try {
      setLoading(true);
      
      // Configurar token no cabeçalho das requisições
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Buscar dados do usuário atual
      const response = await authService.me();
      
      // Adicionar permissões ao usuário
      const permissions = mapPermissions(response.user.funcao);
      const userWithPermissions = { ...response.user, permissions };
      
      setCurrentUser(userWithPermissions);
      
      return true;
    } catch (err) {
      console.error('Erro ao verificar autenticação:', err);
      
      // Se o token estiver inválido ou expirado, fazer logout
      if (err.response?.status === 401) {
        logout();
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Mapear permissões com base na função do usuário
  const mapPermissions = (funcao) => {
    // Permissões comuns a todos os usuários
    const basePermissions = {
      canViewDashboard: true,
      canViewCalendar: true
    };
    
    // Permissões específicas por função
    switch (funcao) {
      case 'administrador':
        return {
          ...basePermissions,
          canViewEmployees: true,
          canCreateEmployee: true,
          canEditEmployee: true,
          canDeleteEmployee: true,
          canViewCompanies: true,
          canCreateCompany: true,
          canEditCompany: true,
          canDeleteCompany: true,
          canViewAllocations: true,
          canCreateAllocation: true,
          canEditAllocation: true,
          canDeleteAllocation: true,
          canViewEmployeePayments: true,
          canViewCompanyInvoices: true,
          canCreatePayment: true,
          canEditPayment: true,
          canViewReports: true,
          canViewUsers: true,
          canCreateUser: true,
          canEditUser: true,
          canDeleteUser: true
        };
      case 'gerente':
        return {
          ...basePermissions,
          canViewEmployees: true,
          canCreateEmployee: true,
          canEditEmployee: true,
          canDeleteEmployee: true,
          canViewCompanies: true,
          canCreateCompany: true,
          canEditCompany: true,
          canDeleteCompany: true,
          canViewAllocations: true,
          canCreateAllocation: true,
          canEditAllocation: true,
          canDeleteAllocation: true,
          canViewEmployeePayments: true,
          canViewCompanyInvoices: true,
          canCreatePayment: true,
          canEditPayment: true,
          canViewReports: true
        };
      case 'operador':
        return {
          ...basePermissions,
          canViewEmployees: true,
          canViewCompanies: true,
          canViewAllocations: true,
          canViewEmployeePayments: true,
          canViewCompanyInvoices: true
        };
      default:
        return basePermissions;
    }
  };
  
  // Efeito para verificar a autenticação ao iniciar a aplicação
  useEffect(() => {
    checkAuth();
  }, []);
  
  // Valor do contexto
  const value = {
    currentUser,
    token,
    loading,
    error,
    login,
    logout,
    checkAuth
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;