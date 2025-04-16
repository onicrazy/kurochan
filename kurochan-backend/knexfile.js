// knexfile.js
module.exports = {
  development: {
    client: 'postgresql', // Or 'mysql', 'sqlite3', etc.
    connection: {
      host: 'localhost',
      user: 'postgres',
      password: 'Bar13vida',
      database: 'kurochan',
    },
    migrations: {
      directory: './migrations', // Path to your migrations folder
    },
  },
  // You can add configurations for other environments (staging, production, etc.)
  // production: { ... }
};