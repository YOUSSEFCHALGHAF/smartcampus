// Reçoit les requêtes HTTP et appelle le service
const authService = require('../services/authService');

async function login(req, res, next) {
  try {
    const { email, motDePasse } = req.body || {};
    const resultat = await authService.login(email, motDePasse);
    res.status(200).json(resultat);
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    const resultat = await authService.logout(req.tokenPayload);
    res.status(200).json(resultat);
  } catch (err) {
    next(err);
  }
}

function me(req, res) {
  res.status(200).json({ user: req.user });
}

module.exports = { login, logout, me };
