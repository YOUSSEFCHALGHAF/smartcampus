// SMARTC-7 [BF-CPT-02] : logique métier de connexion / déconnexion
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User, RevokedToken } = require('../models');
const HttpError = require('../utils/HttpError');

// CA2 : un seul message, que l'e-mail ou le mot de passe soit faux
const MESSAGE_GENERIQUE = 'Identifiants invalides.';

// Hash "factice" utilisé quand l'e-mail n'existe pas :
// bcrypt.compare prend alors le même temps, donc un attaquant ne peut pas
// deviner quels comptes existent en mesurant le temps de réponse.
const HASH_FACTICE = bcrypt.hashSync('mot-de-passe-factice', 10);

function secret() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET manquant dans le fichier .env');
  }
  return process.env.JWT_SECRET;
}

/**
 * CA1 + CA2 : vérifie les identifiants et renvoie un jeton JWT
 */
async function login(email, motDePasse) {
  if (!email || !motDePasse) {
    throw new HttpError(400, 'E-mail et mot de passe obligatoires.');
  }

  const user = await User.findOne({
    where: { email: String(email).trim().toLowerCase() },
  });

  // On compare TOUJOURS (même si l'utilisateur n'existe pas)
  const hash = user ? user.motDePasseHash : HASH_FACTICE;
  const motDePasseOk = await bcrypt.compare(String(motDePasse), hash);

  if (!user || !motDePasseOk) {
    throw new HttpError(401, MESSAGE_GENERIQUE);
  }

  // CA1 : création du jeton de session
  const token = jwt.sign(
    { sub: String(user.id), role: user.role },
    secret(),
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '2h', // BNF-05 : durée limitée
      jwtid: crypto.randomUUID(), // jti unique, utilisé pour la déconnexion
    }
  );

  return { token, user: user.toJSON(), redirect: '/accueil.html' };
}

/**
 * Vérifie un jeton : signature, expiration et liste noire.
 * Renvoie le contenu (payload) du jeton, ou lève une erreur 401.
 */
async function verifierToken(token) {
  let payload;
  try {
    payload = jwt.verify(token, secret());
  } catch {
    throw new HttpError(401, 'Session expirée ou invalide.', { redirect: '/login.html' });
  }

  const revoque = await RevokedToken.findByPk(payload.jti);
  if (revoque) {
    throw new HttpError(401, 'Session expirée ou invalide.', { redirect: '/login.html' });
  }
  return payload;
}

/**
 * CA3 : invalide le jeton en l'ajoutant à la liste noire
 */
async function logout(payload) {
  await RevokedToken.findOrCreate({
    where: { jti: payload.jti },
    defaults: { expiresAt: new Date(payload.exp * 1000) },
  });

  // Ménage : les jetons déjà expirés n'ont plus besoin d'être dans la liste
  await RevokedToken.destroy({ where: { expiresAt: { [Op.lt]: new Date() } } });

  return { message: 'Vous êtes déconnecté.', redirect: '/login.html' };
}

module.exports = { login, logout, verifierToken, MESSAGE_GENERIQUE };
