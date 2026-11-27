# SmartCampus & Green Mobility : Sprint 1

Ticket : **SMARTC-7 [BF-CPT-02] Se connecter et se déconnecter** (EPIC-0, 3 points, YC)

> En tant qu'utilisateur inscrit, je veux me connecter et me déconnecter de façon sécurisée afin de protéger mes données et mes réservations.

Node.js + Express, Sequelize + SQLite, JWT, bcrypt, Jest + Supertest.

## Démarrage rapide

```bash
npm install
cp .env.example .env      # Windows : copy .env.example .env  (puis changer JWT_SECRET)
npm run seed              # comptes de démo, mot de passe : Passw0rd!
npm start                 # http://localhost:3000
```

Comptes : `yasmine@univ.tn`, `amine@univ.tn`, `rania@univ.tn`.

## Commandes

| Commande | Rôle |
|---|---|
| `npm start` | Lance le serveur |
| `npm run dev` | Lance le serveur et le redémarre à chaque modification |
| `npm run seed` | Recrée la base avec les comptes de démo |
| `npm test` | Lance les 17 tests |
| `npm run test:coverage` | Tests + rapport de couverture (`coverage/lcov-report/index.html`) |

## API

| Méthode | URL | Protégée | Rôle |
|---|---|---|---|
| POST | `/api/auth/login` | non | Connexion, renvoie le JWT (CA1, CA2) |
| POST | `/api/auth/logout` | oui | Déconnexion, invalide le JWT (CA3) |
| GET | `/api/auth/me` | oui | Utilisateur connecté |

## Documentation du ticket

- [Guide de l'étape suivante : tests, Git, Pull Request, Jira, démo](docs/SMARTC-7/GUIDE-ETAPE-SUIVANTE.md)
- [Plan de test et traçabilité des critères](docs/SMARTC-7/PLAN-DE-TEST.md)
- Collection Postman : `docs/SMARTC-7/SMARTC-7.postman_collection.json`
