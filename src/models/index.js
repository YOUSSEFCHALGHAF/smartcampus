// Point d'entrée unique des modèles (les relations entre tables seront ajoutées ici)
const sequelize = require('../config/database');
const User = require('./User');
const RevokedToken = require('./RevokedToken');

module.exports = { sequelize, User, RevokedToken };
