/**
 * Utilitários para validação de formulários
 */
const validators = {
  /**
   * Valida se um campo é obrigatório
   * @param {any} value - Valor a ser validado
   * @returns {boolean} True se o campo é válido
   */
  required: (value) => {
    if (value === null || value === undefined) return false;
    
    if (typeof value === 'string') {
      return value.trim() !== '';
    }
    
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    
    return true;
  },
  
  /**
   * Valida se um email é válido
   * @param {string} email - Email a ser validado
   * @returns {boolean} True se o email é válido
   */
  email: (email) => {
    if (!email) return false;
    
    // Regex para validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  /**
   * Valida se uma senha tem comprimento mínimo
   * @param {string} password - Senha a ser validada
   * @param {number} minLength - Comprimento mínimo
   * @returns {boolean} True se a senha é válida
   */
  minLength: (password, minLength = 6) => {
    if (!password) return false;
    return password.length >= minLength;
  },
  
  /**
   * Valida se duas senhas correspondem
   * @param {string} password - Senha principal
   * @param {string} confirmPassword - Confirmação de senha
   * @returns {boolean} True se as senhas correspondem
   */
  passwordMatch: (password, confirmPassword) => {
    return password === confirmPassword;
  },
  
  /**
   * Valida se um valor é positivo
   * @param {number} value - Valor a ser validado
   * @returns {boolean} True se o valor é positivo
   */
  positive: (value) => {
    if (value === null || value === undefined) return false;
    
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
  },
  
  /**
   * Valida se um valor é um número
   * @param {any} value - Valor a ser validado
   * @returns {boolean} True se o valor é um número
   */
  isNumber: (value) => {
    if (value === null || value === undefined) return false;
    
    const num = parseFloat(value);
    return !isNaN(num);
  },
  
  /**
   * Valida se uma data é válida
   * @param {string} date - Data a ser validada no formato 'YYYY-MM-DD'
   * @returns {boolean} True se a data é válida
   */
  isValidDate: (date) => {
    if (!date) return false;
    
    // Verifica se a data está no formato correto
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;
    
    // Verifica se a data é válida
    const dateObj = new Date(date);
    return !isNaN(dateObj.getTime());
  },
  
  /**
   * Valida se uma data é posterior a outra
   * @param {string} date - Data a ser validada
   * @param {string} comparisonDate - Data de comparação
   * @returns {boolean} True se date é posterior a comparisonDate
   */
  isAfter: (date, comparisonDate) => {
    if (!date || !comparisonDate) return false;
    
    const d1 = new Date(date);
    const d2 = new Date(comparisonDate);
    
    return d1 > d2;
  },
  
  /**
   * Valida um formulário completo e retorna erros
   * @param {Object} formData - Dados do formulário
   * @param {Object} rules - Regras de validação
   * @param {Object} messages - Mensagens de erro personalizadas
   * @returns {Object} Objeto com erros encontrados
   */
  validateForm: (formData, rules, messages = {}) => {
    const errors = {};
    
    // Iterar sobre as regras
    Object.entries(rules).forEach(([field, fieldRules]) => {
      // Verificar se o campo existe no formData
      if (formData[field] === undefined) {
        return;
      }
      
      // Aplicar as regras de validação
      Object.entries(fieldRules).forEach(([rule, ruleValue]) => {
        let isValid = true;
        
        // Executar a validação com base na regra
        switch (rule) {
          case 'required':
            if (ruleValue) {
              isValid = validators.required(formData[field]);
            }
            break;
            
          case 'email':
            if (ruleValue && formData[field]) {
              isValid = validators.email(formData[field]);
            }
            break;
            
          case 'minLength':
            if (formData[field]) {
              isValid = validators.minLength(formData[field], ruleValue);
            }
            break;
            
          case 'match':
            if (formData[field]) {
              isValid = validators.passwordMatch(formData[field], formData[ruleValue]);
            }
            break;
            
          case 'positive':
            if (ruleValue && formData[field] !== '') {
              isValid = validators.positive(formData[field]);
            }
            break;
            
          case 'isNumber':
            if (ruleValue && formData[field] !== '') {
              isValid = validators.isNumber(formData[field]);
            }
            break;
            
          case 'isValidDate':
            if (ruleValue && formData[field]) {
              isValid = validators.isValidDate(formData[field]);
            }
            break;
            
          case 'isAfter':
            if (formData[field] && formData[ruleValue]) {
              isValid = validators.isAfter(formData[field], formData[ruleValue]);
            }
            break;
            
          default:
            // Se a regra não for reconhecida, consideramos válido
            isValid = true;
        }
        
        // Se não for válido e ainda não tem erro para este campo
        if (!isValid && !errors[field]) {
          // Usar mensagem personalizada ou mensagem padrão
          errors[field] = messages[`${field}.${rule}`] || 
                          messages[rule] || 
                          `Field ${field} failed validation for ${rule}`;
        }
      });
    });
    
    return errors;
  }
};

export default validators;