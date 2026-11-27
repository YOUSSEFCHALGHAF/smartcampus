// Transforme toutes les erreurs en réponses JSON propres
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Corps JSON mal formé envoyé par le client
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Corps de requête JSON invalide.' });
  }

  const status = err.status || 500;

  if (status === 500) {
    console.error(err); // détail visible seulement côté serveur
    return res.status(500).json({ message: 'Erreur interne du serveur.' });
  }

  res.status(status).json({ message: err.message, ...(err.extra || {}) });
}

module.exports = errorHandler;
