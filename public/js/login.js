// Page de connexion (CA1 + CA2)
const formulaire = document.getElementById('form-login');
const zoneErreur = document.getElementById('erreur');
const bouton = document.getElementById('btn-connexion');

// Déjà connecté ? On va directement à l'accueil
if (getToken()) window.location.replace('/accueil.html');

formulaire.addEventListener('submit', async (event) => {
  event.preventDefault();
  zoneErreur.textContent = '';
  bouton.disabled = true;

  try {
    const resultat = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: document.getElementById('email').value,
        motDePasse: document.getElementById('motDePasse').value,
      }),
    });
    setToken(resultat.token); // CA1 : on garde le jeton
    window.location.replace(resultat.redirect); // CA1 : direction l'accueil
  } catch (err) {
    zoneErreur.textContent = err.message; // CA2 : "Identifiants invalides."
    document.getElementById('motDePasse').value = '';
  } finally {
    bouton.disabled = false;
  }
});
