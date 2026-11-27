# SMARTC-7 [BF-CPT-02] Se connecter et se déconnecter : étape suivante

**Où en est-on ?** Le code du ticket est écrit (API + pages + tests).
**Cette étape :** vérifier, livrer et clôturer le ticket dans les règles Agile :
tests → Git → Pull Request → revue → fusion → Jira « Terminé ».

Durée estimée : 1 h 30 à 2 h.

---

## Étape 1 : Passer le ticket « En cours » dans Jira

1. Ouvrir le **SMARTC board** → onglet **Backlog** (ou **Sprints actifs**).
2. Cliquer sur **SMARTC-7**, puis sur le bouton de statut **À faire** → choisir **En cours**.
3. Vérifier que le ticket est bien assigné à **YC**.
4. (Optionnel) Ajouter un commentaire : « Développement terminé, passage en revue. »

> Pourquoi ? Le tableau doit refléter la réalité : l'équipe et le Scrum Master voient qui travaille sur quoi pendant le Daily.

---

## Étape 2 : Installer et vérifier le projet en local

```bash
cd smartcampus-sprint1
npm install
cp .env.example .env          # Windows : copy .env.example .env
```

Ouvrir `.env` et remplacer `JWT_SECRET` par une longue chaîne aléatoire. Pour en générer une :

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Puis :

```bash
npm run seed    # crée yasmine@, amine@ et rania@univ.tn (mot de passe Passw0rd!)
npm start       # http://localhost:3000
```

---

## Étape 3 : Lancer les tests automatiques

```bash
npm test
```

Résultat attendu :

```
Test Suites: 3 passed, 3 total
Tests:       17 passed, 17 total
```

| Fichier | Contenu | Nb |
|---|---|---|
| `tests/auth.test.js` | Un test par critère d'acceptation (CA1, CA2, CA3) | 6 |
| `tests/auth.securite.test.js` | Cas limites de sécurité (jeton expiré, 2e déconnexion, compte supprimé, ...) | 10 |
| `tests/auth.ratelimit.test.js` | BNF-05 : la 11e tentative est bloquée (429) | 1 |

Puis la couverture de code :

```bash
npm run test:coverage
```

Résultat attendu : environ **96 % des lignes** couvertes. Le seuil minimal est fixé à **80 %** dans `package.json` : en dessous, la commande échoue.
Le rapport détaillé s'ouvre dans le navigateur : `coverage/lcov-report/index.html` (capture d'écran utile pour le rapport).

---

## Étape 4 : Tester à la main (navigateur + Postman)

### 4.a Dans le navigateur (http://localhost:3000)

| # | Action | Résultat attendu | CA |
|---|---|---|---|
| 1 | `yasmine@univ.tn` + `mauvais` | « Identifiants invalides. » | CA2 |
| 2 | `inconnu@univ.tn` + `Passw0rd!` | **Le même** message « Identifiants invalides. » | CA2 |
| 3 | `yasmine@univ.tn` + `Passw0rd!` | Arrivée sur l'accueil « Bienvenue, Yasmine ! » | CA1 |
| 4 | F12 → Application → Session Storage | La clé `smartcampus_token` contient le JWT | CA1 |
| 5 | Cliquer « Se déconnecter » | Retour à la page de connexion | CA3 |
| 6 | Bouton « Précédent » du navigateur | L'accueil ne s'affiche pas, retour connexion | CA3 |
| 7 | Taper http://localhost:3000/accueil.html | Retour connexion | CA3 |

Astuce : coller le jeton de l'étape 4 dans https://jwt.io pour montrer son contenu (`sub`, `jti`, `exp`). Le mot de passe n'y figure pas.

### 4.b Avec Postman

1. Postman → **Import** → choisir `docs/SMARTC-7/SMARTC-7.postman_collection.json`.
2. Relancer `npm run seed` (sinon la limite de 10 tentatives peut être atteinte : redémarrer aussi le serveur).
3. Clic droit sur la collection → **Run collection** → **Run**.
4. Résultat attendu : les 6 requêtes et tous leurs tests sont **verts**. Le jeton est copié automatiquement entre les requêtes.

---

## Étape 5 : Mettre le code sur Git (branche du ticket)

Une branche par ticket, **avec la clé Jira dans le nom** : Jira relie alors automatiquement la branche, les commits et la Pull Request au ticket SMARTC-7.

### 5.a Première fois seulement (si le dépôt d'équipe n'existe pas encore)

Un membre de l'équipe crée le dépôt `smartcampus` sur GitHub (vide, sans README), puis :

```bash
git init
git branch -M main
git add .gitignore package.json package-lock.json .env.example README.md
git commit -m "Initialisation du projet SmartCampus"
git remote add origin https://github.com/<equipe>/smartcampus.git
git push -u origin main
```

Sinon, récupérer le dépôt existant : `git clone https://github.com/<equipe>/smartcampus.git` puis y copier les fichiers de ce zip.

### 5.b Créer la branche et commiter par petites étapes

```bash
git checkout main
git pull
git checkout -b feature/SMARTC-7-connexion
```

**Avant chaque commit, vérifier qu'aucun secret ne part :**

```bash
git status    # .env, database.sqlite, node_modules et coverage ne doivent PAS apparaître
```

Des commits courts et lisibles, chacun commençant par `SMARTC-7` :

```bash
git add src/config src/models src/utils
git commit -m "SMARTC-7 Modèles User et RevokedToken (mot de passe haché)"

git add src/services src/middlewares src/controllers src/routes src/app.js src/server.js
git commit -m "SMARTC-7 API login/logout/me avec JWT, liste noire et limite de tentatives"

git add public
git commit -m "SMARTC-7 Pages de connexion et d'accueil protégée"

git add tests package.json
git commit -m "SMARTC-7 Tests des critères CA1, CA2, CA3 et cas de sécurité"

git add scripts docs .github README.md .gitignore
git commit -m "SMARTC-7 Données de démo, collection Postman, CI et documentation"

git push -u origin feature/SMARTC-7-connexion
```

> **Smart commits Jira (optionnel)** : si l'application « GitHub for Jira » est installée, un message comme
> `SMARTC-7 #comment Tests OK #time 2h` ajoute un commentaire et du temps passé sur le ticket.

---

## Étape 6 : Ouvrir la Pull Request

1. Sur GitHub, cliquer **Compare & pull request** (ou *Pull requests → New*).
2. Base : `main` (ou `develop` si l'équipe l'utilise), compare : `feature/SMARTC-7-connexion`.
3. Titre : `SMARTC-7 [BF-CPT-02] Se connecter et se déconnecter`.
4. La description est **pré-remplie** par `.github/pull_request_template.md`. Compléter :
   - Ce qui a été fait (3 endpoints, 2 pages, 17 tests).
   - Comment tester (étapes 2 à 4 de ce guide).
5. **Reviewers** : choisir un coéquipier, par exemple **AB** (il travaille sur SMARTC-6 Inscription et utilise le même modèle `User`).
6. Attendre que le contrôle **Tests** (GitHub Actions, fichier `.github/workflows/tests.yml`) passe au **vert** ✅.

### Points à faire vérifier par le relecteur

- [ ] Le message d'erreur est **identique** pour e-mail inconnu et mot de passe faux (`authService.js`).
- [ ] Le hash du mot de passe n'apparaît **jamais** dans une réponse (`User.prototype.toJSON`).
- [ ] `JWT_SECRET` vient de `.env`, jamais écrit dans le code.
- [ ] Les routes protégées utilisent le middleware `authentifier`.
- [ ] Après `logout`, le jeton est bien refusé (test CA3).

---

## Étape 7 : Corriger les remarques puis fusionner

1. Pour chaque remarque : corriger, puis
   ```bash
   git add <fichiers>
   git commit -m "SMARTC-7 Correction suite à la revue : <résumé>"
   git push
   ```
   La PR se met à jour automatiquement et les tests relancent.
2. Quand la PR est **approuvée** et les tests verts : **Merge pull request** → **Delete branch**.
3. En local :
   ```bash
   git checkout main
   git pull
   git branch -d feature/SMARTC-7-connexion
   ```

---

## Étape 8 : Clôturer le ticket dans Jira

Vérifier la **Definition of Done**, point par point :

- [ ] CA1, CA2 et CA3 couverts par des tests qui passent (17/17)
- [ ] Couverture ≥ 80 % (`npm run test:coverage`)
- [ ] Contrôle GitHub Actions vert
- [ ] Code relu et approuvé par un coéquipier
- [ ] Aucun secret dans le dépôt
- [ ] Démo fonctionnelle en local (étape 4)

Puis dans Jira :

1. Ouvrir **SMARTC-7** : la section **Développement** affiche la branche, les commits et la PR fusionnée.
2. Ajouter un commentaire, par exemple :
   > Terminé. PR #X fusionnée. 17 tests OK, couverture 96 %. Démo : `npm run seed` puis `npm start`.
3. Passer le statut à **Terminé**.

Le burndown du Sprint 1 baisse alors de **3 points**.

---

## Étape 9 : Préparer la démo de la Sprint Review (29 nov.)

Scénario de 3 minutes :

1. `npm test` : 17 tests verts (preuve automatique).
2. Navigateur : mauvais mot de passe → message générique (**CA2**).
3. Bon mot de passe → accueil (**CA1**), montrer le jeton dans jwt.io.
4. « Se déconnecter » → retour connexion, « Précédent » ne rouvre pas l'accueil (**CA3**).
5. Postman : « Run collection » tout vert, la requête 6 montre que l'ancien jeton est refusé.
6. Sécurité (**BNF-05**) : mots de passe hachés, jeton de 2 h, 11e tentative bloquée.

---

## Étape 10 : Transmettre aux coéquipiers (intégration)

| Coéquipier | Ticket | Ce qu'il doit réutiliser |
|---|---|---|
| **AB** | SMARTC-6 Inscription | Le modèle `User` et `bcrypt.hash` pour le mot de passe |
| **YR** | SMARTC-12 Profil | Le middleware `authentifier` : `req.user` donne l'utilisateur connecté |
| **BW** | SMARTC-13 Notifications | Le middleware `authentifier` sur ses routes |
| Tous | Toutes les routes protégées | `router.get('/...', authentifier, controleur)` |

Côté pages HTML : inclure `/js/api.js` et appeler `api('/api/...')`. Le jeton est ajouté automatiquement et un 401 renvoie vers la connexion.

---

**Ticket suivant :** SMARTC-10 [BF-MOB-03] Réserver une place sur un trajet (5 points), qui s'appuie sur cette authentification.
