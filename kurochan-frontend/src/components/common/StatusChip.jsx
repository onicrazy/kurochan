import React from 'react';
import { Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';

/**
 * Componente de chip de status reutilizável
 * @param {Object} props - Propriedades do componente
 * @param {string} props.status - Status a ser exibido
 * @param {string} props.type - Tipo de status (payment, activity, etc)
 * @param {Object} props.statusMap - Mapeamento de status para cores
 * @returns {JSX.Element} Componente StatusChip
 */
const StatusChip = ({
  status,
  type = 'payment',
  statusMap,
  ...props
}) => {
  const { t } = useTranslation();
  
  // Mapeamento padrão de status para pagamentos
  const defaultPaymentStatusMap = {
    pago: { color: 'success', label: t('payments.paid') },
    pendente: { color: 'warning', label: t('payments.pending') },
    parcial: { color: 'info', label: t('payments.partial') }
  };
  
  // Mapeamento padrão de status para ativo/inativo
  const defaultActiveStatusMap = {
    true: { color: 'success', label: t('common.active') },
    false: { color: 'default', label: t('common.inactive') }
  };
  
  // Selecionar mapeamento com base no tipo
  const selectedMap = statusMap || 
    (type === 'payment' ? defaultPaymentStatusMap : 
     type === 'active' ? defaultActiveStatusMap : {});
  
  // Obter configuração do status
  const statusConfig = selectedMap[status.toString()] || { color: 'default', label: status };
  
  return (
    <Chip
      label={statusConfig.label}
      color={statusConfig.color}
      size="small"
      {...props}
    />
  );
};

export default StatusChip;