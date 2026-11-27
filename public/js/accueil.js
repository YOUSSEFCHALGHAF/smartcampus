// Page d'accueil protégée (CA1 + CA3)
async function chargerAccueil() {
  if (!getToken()) return allerALaConnexion(); // pas de jeton : dehors

  try {
    // Le serveur vérifie le jeton (signature, expiration, liste noire)
    const { user } = await api('/api/auth/me');
    document.getElementById('bienvenue').textContent = `Bienvenue, ${user.prenom} !`;
    document.getElementById('email').textContent = user.email;
    document.body.hidden = false;
  } catch {
    // api() a déjà redirigé vers login.html si le jeton est invalide
  }
}

document.getElementById('btn-deconnexion').addEventListener('click', async () => {
  try {
    await api('/api/auth/logout', { method: 'POST' }); // CA3 : jeton invalidé côté serveur
  } finally {
    allerALaConnexion(); // CA3 : retour à la connexion
  }
});

// Si on revient sur la page avec le bouton "Précédent" après la déconnexion,
// le navigateur peut l'afficher depuis son cache : on revérifie.
window.addEventListener('pageshow', (event) => {
  if (event.persisted) chargerAccueil();
});

chargerAccueil();
