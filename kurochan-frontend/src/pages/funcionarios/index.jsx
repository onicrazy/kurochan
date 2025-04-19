import React from 'react';
import { Navigate } from 'react-router-dom';

// Este arquivo serve como um ponto de entrada para o módulo de funcionários
// Redireciona para a lista de funcionários
const Funcionarios = () => {
  return <Navigate to="/funcionarios" replace />;
};

export default Funcionarios;