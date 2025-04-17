import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * Componente de cabeçalho de página reutilizável
 * @param {Object} props - Propriedades do componente
 * @param {string} props.title - Título da página
 * @param {string} props.subtitle - Subtítulo da página
 * @param {Function} props.onBack - Função para voltar (opcional)
 * @param {string} props.backTo - Rota para voltar (opcional)
 * @param {React.ReactNode} props.actions - Botões de ação
 * @returns {JSX.Element} Componente PageHeader
 */
const PageHeader = ({
  title,
  subtitle,
  onBack,
  backTo,
  actions
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Manipulador para voltar
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };
  
  return (
    <Box 
      display="flex" 
      justifyContent="space-between" 
      alignItems="center" 
      mb={3}
      flexWrap={{ xs: 'wrap', sm: 'nowrap' }}
    >
      <Box>
        <Box display="flex" alignItems="center" mb={1}>
          {(onBack || backTo) && (
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              sx={{ mr: 2 }}
            >
              {t('common.back')}
            </Button>
          )}
          
          <Typography variant="h5" component="h1">
            {title}
          </Typography>
        </Box>
        
        {subtitle && (
          <Typography variant="subtitle1" color="textSecondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      
      {actions && (
        <Box 
          mt={{ xs: 2, sm: 0 }}
          width={{ xs: '100%', sm: 'auto' }}
          display="flex"
          justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}
          gap={1}
        >
          {actions}
        </Box>
      )}
    </Box>
  );
};

export default PageHeader;