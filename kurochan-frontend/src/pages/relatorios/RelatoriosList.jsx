// Localização: kurochan-frontend/src/pages/relatorios/RelatoriosList.jsx

import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  Group as GroupIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarTodayIcon,
  MonetizationOn as MonetizationOnIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Send as SendIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import api from '../../services/api';
import { useSnackbar } from 'notistack';

const RelatoriosList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  // Estados para filtros de data
  const [filtros, setFiltros] = useState({
    periodoInicio: moment().startOf('month').format('YYYY-MM-DD'),
    periodoFim: moment().endOf('month').format('YYYY-MM-DD'),
    tipo: 'mensal'
  });
  
  // Manipulador para alterar filtros
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    
    // Se o tipo do período mudar, ajustar as datas
    if (name === 'tipo') {
      let novoInicio, novoFim;
      
      switch (value) {
        case 'mensal':
          novoInicio = moment().startOf('month').format('YYYY-MM-DD');
          novoFim = moment().endOf('month').format('YYYY-MM-DD');
          break;
        case 'trimestral':
          novoInicio = moment().startOf('quarter').format('YYYY-MM-DD');
          novoFim = moment().endOf('quarter').format('YYYY-MM-DD');
          break;
        case 'anual':
          novoInicio = moment().startOf('year').format('YYYY-MM-DD');
          novoFim = moment().endOf('year').format('YYYY-MM-DD');
          break;
        case 'personalizado':
          // Manter as datas atuais
          novoInicio = filtros.periodoInicio;
          novoFim = filtros.periodoFim;
          break;
        default:
          novoInicio = filtros.periodoInicio;
          novoFim = filtros.periodoFim;
      }
      
      setFiltros({
        ...filtros,
        tipo: value,
        periodoInicio: novoInicio,
        periodoFim: novoFim
      });
    } else {
      setFiltros({
        ...filtros,
        [name]: value
      });
    }
  };
  
  // Função para gerar relatório em PDF
  const gerarRelatorioPDF = async (tipoRelatorio) => {
    try {
      const params = {
        dataInicio: filtros.periodoInicio,
        dataFim: filtros.periodoFim
      };
      
      const response = await api.get(`/relatorios/${tipoRelatorio}/pdf`, {
        params,
        responseType: 'blob'
      });
      
      // Criar URL do blob e abrir em nova janela
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      enqueueSnackbar(t('reports.success.generated'), { variant: 'success' });
      
    } catch (err) {
      console.error('Erro ao gerar relatório PDF:', err);
      enqueueSnackbar(t('reports.error.generateFailed'), { variant: 'error' });
    }
  };
  
  // Função para gerar relatório em Excel
  const gerarRelatorioExcel = async (tipoRelatorio) => {
    try {
      const params = {
        dataInicio: filtros.periodoInicio,
        dataFim: filtros.periodoFim
      };
      
      const response = await api.get(`/relatorios/${tipoRelatorio}/excel`, {
        params,
        responseType: 'blob'
      });
      
      // Criar URL do blob e iniciar download
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio_${tipoRelatorio}_${moment().format('YYYY-MM-DD')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      enqueueSnackbar(t('reports.success.generated'), { variant: 'success' });
      
    } catch (err) {
      console.error('Erro ao gerar relatório Excel:', err);
      enqueueSnackbar(t('reports.error.generateFailed'), { variant: 'error' });
    }
  };
  
  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          {t('reports.title')}
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>{t('reports.periodType')}</InputLabel>
                <Select
                  name="tipo"
                  value={filtros.tipo}
                  onChange={handleFiltroChange}
                  label={t('reports.periodType')}
                >
                  <MenuItem value="mensal">{t('reports.monthly')}</MenuItem>
                  <MenuItem value="trimestral">{t('reports.quarterly')}</MenuItem>
                  <MenuItem value="anual">{t('reports.yearly')}</MenuItem>
                  <MenuItem value="personalizado">{t('reports.custom')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label={t('reports.startDate')}
                type="date"
                name="periodoInicio"
                value={filtros.periodoInicio}
                onChange={handleFiltroChange}
                InputLabelProps={{ shrink: true }}
                disabled={filtros.tipo !== 'personalizado'}
              />
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label={t('reports.endDate')}
                type="date"
                name="periodoFim"
                value={filtros.periodoFim}
                onChange={handleFiltroChange}
                InputLabelProps={{ shrink: true }}
                disabled={filtros.tipo !== 'personalizado'}
              />
            </Grid>
          </Grid>
        </Box>
        
        <Divider sx={{ mb: 4 }} />
        
        <Grid container spacing={3}>
          {/* Relatório Financeiro */}
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <MonetizationOnIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                  <Typography variant="h6">
                    {t('reports.financialReport')}
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {t('reports.financialReportDescription')}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" startIcon={<PdfIcon />} onClick={() => gerarRelatorioPDF('financeiro')}>
                  PDF
                </Button>
                <Button size="small" startIcon={<ExcelIcon />} onClick={() => gerarRelatorioExcel('financeiro')}>
                  Excel
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          {/* Relatório de Funcionários */}
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <GroupIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                  <Typography variant="h6">
                    {t('reports.employeeReport')}
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {t('reports.employeeReportDescription')}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" startIcon={<PdfIcon />} onClick={() => gerarRelatorioPDF('funcionarios')}>
                  PDF
                </Button>
                <Button size="small" startIcon={<ExcelIcon />} onClick={() => gerarRelatorioExcel('funcionarios')}>
                  Excel
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          {/* Relatório de Empresas */}
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <BusinessIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                  <Typography variant="h6">
                    {t('reports.companyReport')}
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {t('reports.companyReportDescription')}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" startIcon={<PdfIcon />} onClick={() => gerarRelatorioPDF('empresas')}>
                  PDF
                </Button>
                <Button size="small" startIcon={<ExcelIcon />} onClick={() => gerarRelatorioExcel('empresas')}>
                  Excel
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          {/* Relatório de Alocações */}
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <CalendarTodayIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                  <Typography variant="h6">
                    {t('reports.allocationReport')}
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {t('reports.allocationReportDescription')}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" startIcon={<PdfIcon />} onClick={() => gerarRelatorioPDF('alocacoes')}>
                  PDF
                </Button>
                <Button size="small" startIcon={<ExcelIcon />} onClick={() => gerarRelatorioExcel('alocacoes')}>
                  Excel
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default RelatoriosList;