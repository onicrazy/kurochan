/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.withSchema('kurochan').createTable('usuarios', function (table) {
    table.increments('id').primary();
    table.string('nome').notNullable();
    table.string('email').unique().notNullable();
    table.string('senha').notNullable();
    table.string('funcao');
    table.boolean('ativo').defaultTo(true);
    table.string('idioma_preferido');
    table.timestamp('data_criacao').defaultTo(knex.fn.now());
    table.timestamp('data_atualizacao').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.withSchema('kurochan').dropTable('usuarios');
};