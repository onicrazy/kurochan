import { useState, useEffect } from 'react';

/**
 * Hook para persistir estado no localStorage
 * @param {string} key - Chave para armazenamento
 * @param {any} initialValue - Valor inicial
 * @returns {Array} Estado e função para atualizar
 */
function useLocalStorage(key, initialValue) {
  // Função para obter o valor inicial do localStorage ou usar o initialValue
  const getStoredValue = () => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Erro ao recuperar do localStorage:', error);
      return initialValue;
    }
  };

  // Estado com o valor do localStorage
  const [storedValue, setStoredValue] = useState(getStoredValue);

  // Função para atualizar o estado e o localStorage
  const setValue = (value) => {
    try {
      // Suporta função como valor (similar ao useState)
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Atualizar estado
      setStoredValue(valueToStore);
      
      // Atualizar localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
  };

  // Atualizar o localStorage se a chave mudar
  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(storedValue));
  }, [key, storedValue]);

  return [storedValue, setValue];
}

export default useLocalStorage;