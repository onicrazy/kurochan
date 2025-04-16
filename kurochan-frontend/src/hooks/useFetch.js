import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * Hook para fazer requisições à API
 * @param {string} url - URL da requisição
 * @param {Object} options - Opções da requisição
 * @returns {Object} Estado e funções para controlar a requisição
 */
function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shouldRefetch, setShouldRefetch] = useState(0);

  // Função para refazer a requisição
  const refetch = useCallback(() => {
    setShouldRefetch(prev => prev + 1);
  }, []);

  // Função para fazer a requisição
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(url, options);
      setData(response.data);
    } catch (err) {
      console.error('Erro na requisição:', err);
      setError(err.response?.data?.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  // Fazer a requisição quando o componente for montado ou quando refetch for chamado
  useEffect(() => {
    fetchData();
  }, [fetchData, shouldRefetch]);

  return { data, loading, error, refetch };
}

export default useFetch;