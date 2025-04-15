require('dotenv').config();
const knex = require('knex');

// Configuração do Knex para conexão com o PostgreSQL
const db = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'onicrazy',
    password: process.env.DB_PASSWORD || 'Bar13vida',
    database: process.env.DB_NAME || 'kurochan',
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: '../migrations'
  },
  seeds: {
    directory: '../seeds'
  },
  // Configuração para timestamp automático em PostgreSQL
  postProcessResponse: (result) => {
    // Converter campos date/datetime para objetos Date no JavaScript
    if (Array.isArray(result)) {
      return result.map(row => formatDates(row));
    } else {
      return formatDates(result);
    }
  }
});

// Função para formatar datas no objeto de resposta
function formatDates(row) {
  if (!row) return row;
  
  const dateFields = [
    'created_at', 'updated_at', 'data_criacao', 'data_atualizacao',
    'data_admissao', 'data_alocacao', 'data_pagamento', 'data_fatura',
    'data_vencimento', 'periodo_inicio', 'periodo_fim'
  ];
  
  Object.keys(row).forEach(key => {
    if (dateFields.includes(key) && row[key]) {
      if (row[key] instanceof Date) {
        // Já é um objeto Date, não faz nada
      } else if (typeof row[key] === 'string') {
        // Converte para Date se for uma string ISO
        row[key] = new Date(row[key]);
      }
    }
  });
  
  return row;
}

// Verificar conexão com o banco
db.raw('SELECT 1')
  .then(() => {
    console.log('Conexão com o banco de dados estabelecida com sucesso!');
  })
  .catch(err => {
    console.error('Erro ao conectar com o banco de dados:', err);
    process.exit(1);
  });

module.exports = db;