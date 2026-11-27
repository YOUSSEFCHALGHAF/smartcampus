# Plan de test : SMARTC-7 [BF-CPT-02] Se connecter et se déconnecter

Cocher la colonne « Résultat » pendant les tests manuels et joindre ce fichier au ticket Jira.

## Traçabilité : critères d'acceptation → tests

| Critère | Test automatique (fichier › test) | Test manuel | Résultat |
|---|---|---|---|
| **CA1** Identifiants corrects → JWT + accueil | `auth.test.js` › renvoie un jeton JWT et la redirection vers l'accueil | Navigateur n°3, Postman n°3 | ☐ |
| | `auth.test.js` › le jeton donne accès à une route protégée | Postman n°4 | ☐ |
| | `auth.securite.test.js` › l'e-mail est accepté avec majuscules et espaces | | ☐ |
| **CA2** Mot de passe incorrect → message générique | `auth.test.js` › mot de passe faux et e-mail inconnu donnent le MÊME message générique | Navigateur n°1 et n°2, Postman n°1 et n°2 | ☐ |
| | `auth.test.js` › champs manquants : 400 | | ☐ |
| **CA3** Déconnexion → jeton invalidé + retour connexion | `auth.test.js` › le jeton est invalidé et la route protégée renvoie vers la connexion | Navigateur n°5 à n°7, Postman n°5 et n°6 | ☐ |
| | `auth.test.js` › sans jeton ou avec un jeton falsifié : 401 + redirection | | ☐ |
| | `auth.securite.test.js` › une 2e déconnexion avec le même jeton est refusée | | ☐ |
| | `auth.securite.test.js` › se déconnecter n'invalide QUE le jeton utilisé | | ☐ |
| | `auth.securite.test.js` › les jetons révoqués déjà expirés sont supprimés | | ☐ |
| **BNF-05** Sécurité | `auth.ratelimit.test.js` › la 11e tentative est bloquée (429) | 11 essais ratés dans le navigateur | ☐ |
| | `auth.securite.test.js` › un jeton expiré est refusé | | ☐ |
| | `auth.securite.test.js` › le jeton d'un compte supprimé est refusé | | ☐ |
| | `auth.test.js` › le hash n'est jamais renvoyé (`motDePasseHash` absent) | Postman n°3 | ☐ |

## Résultats

| Commande | Attendu | Obtenu |
|---|---|---|
| `npm test` | 17 tests réussis | |
| `npm run test:coverage` | ≥ 80 % des lignes (≈ 96 %) | |
| Postman « Run collection » | 6 requêtes, tous les tests verts | |
| GitHub Actions « Tests » | ✅ | |

Testé par : ______________   Date : ____ / ____ / 2026
