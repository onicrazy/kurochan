import { useState, useEffect } from 'react';

/**
 * Hook para debounce de valores (atrasar atualizações)
 * @param {any} value - Valor inicial
 * @param {number} delay - Atraso em milissegundos
 * @returns {any} Valor com debounce
 */
function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Timer para atualizar o valor após o atraso
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpar timer se o valor mudar antes do tempo de debounce
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;