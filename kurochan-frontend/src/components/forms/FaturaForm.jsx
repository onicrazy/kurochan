// Formatar dados antes de enviar
    const dataToSubmit = {
      ...formData,
      valor_total: valorTotal,
      detalhes
    };
    
    // Chamar função de salvamento
    await onSave(dataToSubmit);
  };
  
  // Formatar valor em moeda
  const formatCurrency = (value) => {
    if (typeof value !== 'number') {
      value = parseFloat(value || 0);
    }
    
    return i18n.language === 'ja'
      ? `¥${Math.round(value).toLocaleString('ja-JP')}`
      : `¥ ${Math.round(value).toLocaleString('pt-BR')}`;
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={!!errors.empresa_id}>
            <InputLabel>{t('allocations.company')}</InputLabel>
            <Select
              name="empresa_id"
              value={formData.empresa_id}
              onChange={handleChange}
              label={t('allocations.company')}
              required
              disabled={loading}
            >
              <MenuItem value="">{t('common.select')}</MenuItem>
              {empresas.map(empresa => (
                <MenuItem key={empresa.id} value={empresa.id}>
                  {empresa.nome}
                  {empresa.nome_japones && ` / ${empresa.nome_japones}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={t('payments.invoiceDate')}
            name="data_fatura"
            type="date"
            value={formData.data_fatura}
            onChange={handleChange}
            error={!!errors.data_fatura}
            helperText={errors.data_fatura}
            required
            disabled={loading}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={t('payments.dueDate')}
            name="data_vencimento"
            type="date"
            value={formData.data_vencimento}
            onChange={handleChange}
            error={!!errors.data_vencimento}
            helperText={errors.data_vencimento}
            required
            disabled={loading}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>{t('payments.status')}</InputLabel>
            <Select
              name="status_pagamento"
              value={formData.status_pagamento}
              onChange={handleChange}
              label={t('payments.status')}
              disabled={loading}
            >
              <MenuItem value="pendente">{t('payments.pending')}</MenuItem>
              <MenuItem value="pago">{t('payments.paid')}</MenuItem>
              <MenuItem value="parcial">{t('payments.partial')}</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={t('allocations.startDate')}
            name="periodo_inicio"
            type="date"
            value={formData.periodo_inicio}
            onChange={handleChange}
            error={!!errors.periodo_inicio}
            helperText={errors.periodo_inicio}
            required
            disabled={loading}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={t('allocations.endDate')}
            name="periodo_fim"
            type="date"
            value={formData.periodo_fim}
            onChange={handleChange}
            error={!!errors.periodo_fim}
            helperText={errors.periodo_fim}
            required
            disabled={loading}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={t('payments.paymentMethod')}
            name="metodo_pagamento"
            value={formData.metodo_pagamento}
            onChange={handleChange}
            disabled={loading}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={t('payments.reference')}
            name="numero_referencia"
            value={formData.numero_referencia}
            onChange={handleChange}
            disabled={loading}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label={t('common.observations')}
            name="observacoes"
            value={formData.observacoes}
            onChange={handleChange}
            multiline
            rows={2}
            disabled={loading}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            {t('allocations.title')}
          </Typography>
          
          {loadingAlocacoes ? (
            <Box display="flex" justifyContent="center" my={2}>
              <CircularProgress />
            </Box>
          ) : alocacoes.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              {t('allocations.noRecords')}
            </Alert>
          ) : (
            <Paper variant="outlined" sx={{ mb: 2 }}>
              <List dense>
                <ListItem>
                  <Checkbox
                    edge="start"
                    checked={alocacoesSelecionadas.length === alocacoes.length}
                    indeterminate={alocacoesSelecionadas.length > 0 && alocacoesSelecionadas.length < alocacoes.length}
                    onChange={handleSelectAll}
                    disabled={loading}
                  />
                  <ListItemText 
                    primary={<Typography fontWeight="bold">{t('common.selectAll')}</Typography>}
                  />
                  <Typography variant="subtitle1" fontWeight="bold">
                    {t('allocations.value')}
                  </Typography>
                </ListItem>
                
                <Divider />
                
                {alocacoes.map((alocacao) => (
                  <React.Fragment key={alocacao.id}>
                    <ListItem>
                      <Checkbox
                        edge="start"
                        checked={alocacoesSelecionadas.some(item => item.id === alocacao.id)}
                        onChange={() => handleToggleAlocacao(alocacao)}
                        disabled={loading}
                      />
                      <ListItemText
                        primary={`${moment(alocacao.data_alocacao).format('L')} - ${alocacao.funcionario_nome}`}
                        secondary={alocacao.tipo_periodo === 'integral' ? t('allocations.fullDay') : t('allocations.halfDay')}
                      />
                      <Typography variant="body1">
                        {formatCurrency(alocacao.valor_cobrado_empresa)}
                      </Typography>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
              
              {errors.alocacoes && (
                <Alert severity="error" sx={{ m: 2 }}>
                  {errors.alocacoes}
                </Alert>
              )}
            </Paper>
          )}
          
          <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2}>
            <Typography variant="h6">
              {t('payments.total')}: {formatCurrency(valorTotal)}
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end" mt={1}>
            <Button
              type="button"
              variant="outlined"
              onClick={onCancel}
              disabled={loading}
              sx={{ mr: 1 }}
            >
              {t('common.cancel')}
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || alocacoesSelecionadas.length === 0}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {t('common.save')}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default FaturaForm;