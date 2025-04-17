import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress
} from '@mui/material';
import { useTranslation } from 'react-i18next';

/**
 * Componente de diálogo de confirmação reutilizável
 * @param {Object} props - Propriedades do componente
 * @param {boolean} props.open - Indica se o diálogo está aberto
 * @param {Function} props.onClose - Função para fechar o diálogo
 * @param {string} props.title - Título do diálogo
 * @param {string} props.message - Mensagem do diálogo
 * @param {string} props.confirmButtonText - Texto do botão de confirmação
 * @param {string} props.cancelButtonText - Texto do botão de cancelamento
 * @param {Function} props.onConfirm - Função para confirmar ação
 * @param {boolean} props.loading - Indica se está carregando
 * @param {string} props.confirmButtonColor - Cor do botão de confirmação
 * @returns {JSX.Element} Componente ConfirmDialog
 */
const ConfirmDialog = ({
  open,
  onClose,
  title,
  message,
  confirmButtonText,
  cancelButtonText,
  onConfirm,
  loading = false,
  confirmButtonColor = 'primary'
}) => {
  const { t } = useTranslation();
  
  // Manipulador para confirmar
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <DialogTitle id="confirm-dialog-title">
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          disabled={loading}
        >
          {cancelButtonText || t('common.cancel')}
        </Button>
        <Button
          onClick={handleConfirm}
          color={confirmButtonColor}
          variant="contained"
          autoFocus
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {confirmButtonText || t('common.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;