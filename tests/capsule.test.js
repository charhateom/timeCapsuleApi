const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

describe('Capsule API', () => {
  let token;

  beforeEach(async () => {
    const user = await User.create({ email: 'cap@example.com', password: 'pass123' });
    token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1h' });
  });

  it('should create a capsule', async () => {
    const res = await request(app)
      .post('/capsules')
      .set('Authorization', `Bearer ${token}`)
      .send({
        message: 'Hello test!',
        unlock_at: '2030-01-01T00:00:00Z'
      });

    console.log('Response body:', res.body);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'Hello test!');
    // expect(res.body).toHaveProperty('unlock_at', '2030-01-01T00:00:00Z');
    expect(new Date(res.body.unlock_at).toISOString()).toBe('2030-01-01T00:00:00.000Z');

  });

});
