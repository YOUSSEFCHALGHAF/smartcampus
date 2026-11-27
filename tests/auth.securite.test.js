// SMARTC-7 [BF-CPT-02] : tests de sécurité complémentaires (règle BNF-05)
// Ils vérifient les cas "limites" que la revue de code va regarder.
const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const { sequelize, User, RevokedToken } = require('../src/models');

const EMAIL = 'amine@univ.tn';
const MOT_DE_PASSE = 'Passw0rd!';
let amine;

beforeAll(async () => {
  await sequelize.sync({ force: true });
  amine = await User.create({
    nom: 'B',
    prenom: 'Amine',
    email: EMAIL,
    motDePasseHash: await bcrypt.hash(MOT_DE_PASSE, 4),
  });
});

afterAll(() => sequelize.close());

function connexion(email, motDePasse) {
  return request(app).post('/api/auth/login').send({ email, motDePasse });
}

describe('Connexion (CA1 / CA2) : cas limites', () => {
  test("l'e-mail est accepté avec majuscules et espaces", async () => {
    const res = await connexion('  AMINE@Univ.TN ', MOT_DE_PASSE);
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('un JSON mal formé renvoie 400 (et pas une erreur 500)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email": "amine@univ.tn",');
    expect(res.status).toBe(400);
  });

  test('la page "/" redirige vers la page de connexion', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/login.html');
  });
});

describe('Jeton (CA3 / BNF-05) : cas limites', () => {
  test('un jeton expiré est refusé avec redirection vers la connexion', async () => {
    const expire = jwt.sign(
      { sub: String(amine.id), exp: Math.floor(Date.now() / 1000) - 60 },
      process.env.JWT_SECRET,
      { jwtid: 'jeton-expire' }
    );
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${expire}`);
    expect(res.status).toBe(401);
    expect(res.body.redirect).toBe('/login.html');
  });

  test('un en-tête qui n\'est pas "Bearer" est refusé', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Basic abc');
    expect(res.status).toBe(401);
  });

  test("le jeton d'un compte supprimé est refusé", async () => {
    const fantome = await User.create({
      nom: 'X',
      prenom: 'Fantome',
      email: 'fantome@univ.tn',
      motDePasseHash: await bcrypt.hash(MOT_DE_PASSE, 4),
    });
    const { body } = await connexion('fantome@univ.tn', MOT_DE_PASSE);
    await fantome.destroy();

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${body.token}`);
    expect(res.status).toBe(401);
  });
});

describe('Déconnexion (CA3) : cas limites', () => {
  test('se déconnecter sans jeton renvoie 401', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(401);
  });

  test('une 2e déconnexion avec le même jeton est refusée (jeton déjà révoqué)', async () => {
    const { body } = await connexion(EMAIL, MOT_DE_PASSE);
    const entete = `Bearer ${body.token}`;

    expect((await request(app).post('/api/auth/logout').set('Authorization', entete)).status).toBe(200);
    expect((await request(app).post('/api/auth/logout').set('Authorization', entete)).status).toBe(401);
  });

  test("se déconnecter n'invalide QUE le jeton utilisé (les autres sessions restent actives)", async () => {
    const pc = (await connexion(EMAIL, MOT_DE_PASSE)).body.token;
    const telephone = (await connexion(EMAIL, MOT_DE_PASSE)).body.token;

    await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${pc}`);

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${telephone}`);
    expect(res.status).toBe(200);
  });

  test('les jetons révoqués déjà expirés sont supprimés de la liste noire', async () => {
    await RevokedToken.create({ jti: 'vieux-jeton', expiresAt: new Date(Date.now() - 1000) });

    const { body } = await connexion(EMAIL, MOT_DE_PASSE);
    await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${body.token}`);

    expect(await RevokedToken.findByPk('vieux-jeton')).toBeNull();
  });
});
