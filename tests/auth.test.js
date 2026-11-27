// SMARTC-7 [BF-CPT-02] : un test (au moins) par critère d'acceptation
const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const { sequelize, User } = require('../src/models');

const EMAIL = 'yasmine@univ.tn';
const MOT_DE_PASSE = 'Passw0rd!';

beforeAll(async () => {
  await sequelize.sync({ force: true });
  await User.create({
    nom: 'C',
    prenom: 'Yasmine',
    email: EMAIL,
    motDePasseHash: await bcrypt.hash(MOT_DE_PASSE, 4), // 4 tours : tests rapides
  });
});

afterAll(async () => {
  await sequelize.close();
});

function connexion(email, motDePasse) {
  return request(app).post('/api/auth/login').send({ email, motDePasse });
}

describe('CA1 - identifiants corrects', () => {
  test('renvoie un jeton JWT et la redirection vers l\'accueil', async () => {
    const res = await connexion(EMAIL, MOT_DE_PASSE);

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.redirect).toBe('/accueil.html');
    expect(res.body.user.email).toBe(EMAIL);
    // BNF-05 : le hash ne sort jamais
    expect(res.body.user.motDePasseHash).toBeUndefined();

    // Le jeton contient l'id, un jti et une date d'expiration
    const payload = jwt.decode(res.body.token);
    expect(payload.sub).toBeDefined();
    expect(payload.jti).toBeDefined();
    expect(payload.exp).toBeGreaterThan(payload.iat);
  });

  test('le jeton donne accès à une route protégée', async () => {
    const { body } = await connexion(EMAIL, MOT_DE_PASSE);
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(EMAIL);
  });
});

describe('CA2 - identifiants incorrects', () => {
  test('mot de passe faux et e-mail inconnu donnent le MÊME message générique', async () => {
    const mauvaisMdp = await connexion(EMAIL, 'mauvais');
    const emailInconnu = await connexion('inconnu@univ.tn', MOT_DE_PASSE);

    expect(mauvaisMdp.status).toBe(401);
    expect(emailInconnu.status).toBe(401);
    expect(mauvaisMdp.body).toEqual({ message: 'Identifiants invalides.' });
    expect(emailInconnu.body).toEqual(mauvaisMdp.body);
    expect(mauvaisMdp.body.token).toBeUndefined();
  });

  test('champs manquants : 400', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: EMAIL });
    expect(res.status).toBe(400);
  });
});

describe('CA3 - déconnexion', () => {
  test('le jeton est invalidé et la route protégée renvoie vers la connexion', async () => {
    const { body } = await connexion(EMAIL, MOT_DE_PASSE);
    const entete = `Bearer ${body.token}`;

    const deconnexion = await request(app).post('/api/auth/logout').set('Authorization', entete);
    expect(deconnexion.status).toBe(200);
    expect(deconnexion.body.redirect).toBe('/login.html');

    // Le même jeton ne marche plus
    const apres = await request(app).get('/api/auth/me').set('Authorization', entete);
    expect(apres.status).toBe(401);
    expect(apres.body.redirect).toBe('/login.html');
  });

  test('sans jeton ou avec un jeton falsifié : 401 + redirection', async () => {
    const sansJeton = await request(app).get('/api/auth/me');
    expect(sansJeton.status).toBe(401);
    expect(sansJeton.body.redirect).toBe('/login.html');

    const faux = jwt.sign({ sub: '1' }, 'mauvais_secret', { jwtid: 'x' });
    const falsifie = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${faux}`);
    expect(falsifie.status).toBe(401);
  });
});
