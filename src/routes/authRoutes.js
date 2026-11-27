// Associe les URL /api/auth/... aux contrôleurs
const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const authentifier = require('../middlewares/auth');

const router = express.Router();

// BNF-05 : au maximum 10 tentatives de connexion par 15 minutes et par adresse IP
const limiteConnexion = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.LOGIN_MAX_TENTATIVES) || 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' },
});

router.post('/login', limiteConnexion, authController.login); // publique
router.post('/logout', authentifier, authController.logout); // protégée
router.get('/me', authentifier, authController.me); // protégée

module.exports = router;
