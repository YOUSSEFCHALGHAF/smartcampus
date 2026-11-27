// BNF-05 : limite de 10 tentatives de connexion par 15 minutes
const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');

beforeAll(() => sequelize.sync({ force: true }));
afterAll(() => sequelize.close());

test('la 11e tentative est bloquée (429)', async () => {
  for (let i = 0; i < 10; i++) {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'x@univ.tn', motDePasse: 'faux' });
    expect(res.status).toBe(401);
  }
  const bloquee = await request(app)
    .post('/api/auth/login')
    .send({ email: 'x@univ.tn', motDePasse: 'faux' });
  expect(bloquee.status).toBe(429);
});
