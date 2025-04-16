import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Box,
  CircularProgress,
  Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';

/**
 * Componente de tabela de dados reutilizável
 * @param {Object} props - Propriedades do componente
 * @param {Array} props.columns - Definição das colunas
 * @param {Array} props.data - Dados a serem exibidos
 * @param {number} props.total - Total de registros (para paginação)
 * @param {number} props.page - Página atual
 * @param {number} props.rowsPerPage - Linhas por página
 * @param {Function} props.onPageChange - Função para mudança de página
 * @param {Function} props.onRowsPerPageChange - Função para mudança de linhas por página
 * @param {boolean} props.loading - Indica se está carregando
 * @param {string} props.emptyMessage - Mensagem quando não há dados
 * @param {Function} props.onRowClick - Função para clique na linha
 * @param {string} props.orderBy - Campo para ordenação
 * @param {string} props.order - Direção da ordenação (asc/desc)
 * @param {Function} props.onSort - Função para ordenar
 * @returns {JSX.Element} Componente DataTable
 */
const DataTable = ({
  columns,
  data,
  total,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  loading = false,
  emptyMessage,
  onRowClick,
  orderBy,
  order,
  onSort
}) => {
  const { t } = useTranslation();
  
  // Função para criar props de sort
  const createSortHandler = (property) => (event) => {
    if (onSort) {
      onSort(property);
    }
  };
  
  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ minWidth: column.minWidth || 100 }}
                  sortDirection={orderBy === column.id ? order : false}
                >
                  {column.sortable && onSort ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={createSortHandler(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <CircularProgress size={24} sx={{ my: 2 }} />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <Typography variant="body2" color="textSecondary">
                    {emptyMessage || t('common.noResults')}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => {
                return (
                  <TableRow
                    hover
                    key={row.