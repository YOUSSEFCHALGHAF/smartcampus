// Fonctions communes aux pages : jeton + appels à l'API
const CLE_JETON = 'smartcampus_token';

function getToken() {
  return sessionStorage.getItem(CLE_JETON);
}

function setToken(token) {
  sessionStorage.setItem(CLE_JETON, token);
}

function supprimerToken() {
  sessionStorage.removeItem(CLE_JETON);
}

function allerALaConnexion() {
  supprimerToken();
  window.location.replace('/login.html'); // replace : pas de retour arrière vers la page protégée
}

/**
 * Appelle l'API en ajoutant le jeton.
 * Si le serveur répond 401 avec "redirect", on renvoie vers la connexion (CA3).
 */
async function api(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const reponse = await fetch(url, { ...options, headers });
  const donnees = await reponse.json().catch(() => ({}));

  if (reponse.status === 401 && donnees.redirect) {
    allerALaConnexion();
    throw new Error(donnees.message);
  }
  if (!reponse.ok) {
    throw new Error(donnees.message || 'Erreur inattendue.');
  }
  return donnees;
}
