// Crée des utilisateurs de démonstration (mot de passe : Passw0rd!)
require('dotenv').config({ quiet: true });
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('../src/models');

async function seed() {
  await sequelize.sync({ force: true }); // ATTENTION : vide la base
  const rounds = Number(process.env.BCRYPT_ROUNDS) || 10;
  const motDePasseHash = await bcrypt.hash('Passw0rd!', rounds);

  await User.bulkCreate([
    { nom: 'C', prenom: 'Yasmine', email: 'yasmine@univ.tn', motDePasseHash },
    { nom: 'B', prenom: 'Amine', email: 'amine@univ.tn', motDePasseHash },
    { nom: 'R', prenom: 'Rania', email: 'rania@univ.tn', motDePasseHash },
  ]);

  console.log('3 utilisateurs créés (mot de passe : Passw0rd!)');
  await sequelize.close();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
