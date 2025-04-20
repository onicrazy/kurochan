const bcrypt = require('bcrypt');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex.raw('TRUNCATE TABLE kurochan.usuarios RESTART IDENTITY CASCADE;');

  const hashedPassword = await bcrypt.hash('admin123', 10); // Hash the password

  await knex.withSchema('kurochan').table('usuarios').insert([
    {
    nome: 'Admin',
    email: 'admin',
    senha: await bcrypt.hash('admin0130', 10),
    funcao: 'admin', // Mudando de 'role' para 'funcao'
    ativo: true,
    idioma_preferido: 'pt-BR'
    }
  ]);
};