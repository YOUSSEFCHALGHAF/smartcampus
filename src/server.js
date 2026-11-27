// Démarre le serveur
require('dotenv').config({ quiet: true });
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3000;

async function demarrer() {
  await sequelize.sync(); // crée les tables si elles n'existent pas
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
  });
}

demarrer().catch((err) => {
  console.error('Impossible de démarrer le serveur :', err);
  process.exit(1);
});
