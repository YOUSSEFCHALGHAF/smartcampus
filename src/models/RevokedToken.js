// Table "revoked_tokens" : liste noire des jetons invalidés à la déconnexion (CA3)
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RevokedToken = sequelize.define(
  'RevokedToken',
  {
    // jti = identifiant unique du jeton JWT
    jti: { type: DataTypes.STRING, primaryKey: true },
    // date d'expiration du jeton : après cette date, la ligne peut être supprimée
    expiresAt: { type: DataTypes.DATE, allowNull: false },
  },
  { tableName: 'revoked_tokens', updatedAt: false }
);

module.exports = RevokedToken;
