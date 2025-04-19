import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Componente principal para o módulo de empresas
 * Redireciona para a lista de empresas
 */
const Empresas = () => {
  return <Navigate to="/empresas" replace />;
};

export default Empresas;