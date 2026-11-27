// Erreur "métier" qui transporte un code HTTP (400, 401, 403, 409...)
class HttpError extends Error {
  constructor(status, message, extra = {}) {
    super(message);
    this.status = status;
    this.extra = extra; // champs ajoutés à la réponse JSON (ex : { redirect: '/login.html' })
  }
}

module.exports = HttpError;
