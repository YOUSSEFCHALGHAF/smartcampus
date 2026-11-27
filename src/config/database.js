// Connexion à la base de données SQLite avec Sequelize
require('dotenv').config({ quiet: true });
const { Sequelize } = require('sequelize');

const enTest = process.env.NODE_ENV === 'test';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  // En test : base en mémoire (vide et rapide). Sinon : fichier database.sqlite
  storage: enTest ? ':memory:' : process.env.DB_STORAGE || 'database.sqlite',
  logging: false,
});

module.exports = sequelize;
