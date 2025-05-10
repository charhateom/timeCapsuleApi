const request = require('supertest');
const app = require('../app');

describe('Auth API', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message');
  });

  it('should login and return a token', async () => {
    await request(app)
      .post('/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});
