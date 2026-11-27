// Protège les routes : il faut un jeton valide et non révoqué
const { User } = require('../models');
const authService = require('../services/authService');
const HttpError = require('../utils/HttpError');

async function authentifier(req, res, next) {
  try {
    // L'en-tête attendu : "Authorization: Bearer <jeton>"
    const [type, token] = (req.headers.authorization || '').split(' ');
    if (type !== 'Bearer' || !token) {
      throw new HttpError(401, 'Authentification requise.', { redirect: '/login.html' });
    }

    const payload = await authService.verifierToken(token);

    const user = await User.findByPk(payload.sub);
    if (!user) {
      throw new HttpError(401, 'Session expirée ou invalide.', { redirect: '/login.html' });
    }

    req.user = user; // l'utilisateur connecté, disponible dans les contrôleurs
    req.tokenPayload = payload; // utile pour la déconnexion (jti, exp)
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = authentifier;
