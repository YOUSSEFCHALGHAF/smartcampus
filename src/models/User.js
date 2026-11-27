// Table "users" : les comptes des utilisateurs
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define(
  'User',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nom: { type: DataTypes.STRING, allowNull: false },
    prenom: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
      // On stocke toujours l'e-mail en minuscules et sans espaces
      set(valeur) {
        this.setDataValue('email', String(valeur).trim().toLowerCase());
      },
    },
    // On ne stocke JAMAIS le mot de passe en clair, seulement son hash bcrypt
    motDePasseHash: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM('ETUDIANT', 'ENSEIGNANT', 'PERSONNEL', 'ADMIN'),
      allowNull: false,
      defaultValue: 'ETUDIANT',
    },
  },
  { tableName: 'users' }
);

// BNF-05 : le hash ne doit jamais sortir dans une réponse JSON
User.prototype.toJSON = function () {
  const valeurs = { ...this.get() };
  delete valeurs.motDePasseHash;
  return valeurs;
};

module.exports = User;
