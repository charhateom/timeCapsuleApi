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

  // Invalid Credentials for Login
  it('should reject login with invalid credentials', async () => {
  await request(app)
    .post('/auth/register')
    .send({ email: 'invalidtest@example.com', password: 'validPass123' });

  const res = await request(app)
    .post('/auth/login')
    .send({ email: 'invalidtest@example.com', password: 'wrongPassword' });

  expect(res.statusCode).toBe(401);
  expect(res.body).toHaveProperty('error');
});


// Duplicate Registration
it('should not allow duplicate registration', async () => {
  await request(app)
    .post('/auth/register')
    .send({ email: 'dupe@example.com', password: 'pass123' });

  const res = await request(app)
    .post('/auth/register')
    .send({ email: 'dupe@example.com', password: 'pass123' });

  expect(res.statusCode).toBe(400); // or appropriate code based on your validation
  expect(res.body).toHaveProperty('error');
});
// Missing Fields on Registration
it('should fail registration with missing fields', async () => {
  const res = await request(app)
    .post('/auth/register')
    .send({ email: '' }); // or omit `password`

  expect(res.statusCode).toBe(400);
  expect(res.body).toHaveProperty('error');
});
// Token Validation (Integration test with protected route)

it('should not allow access to protected route without token', async () => {
  const res = await request(app).get('/capsules');
  expect(res.statusCode).toBe(401);
});

it('should not allow access with invalid token', async () => {
  const res = await request(app)
    .get('/capsules')
    .set('Authorization', 'Bearer invalid.token.here');

  expect(res.statusCode).toBe(403);
});

});
