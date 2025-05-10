
const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Capsule = require('../models/Capsule');
const jwt = require('jsonwebtoken');

describe('Capsule API', () => {
  let token, userId, unlockCode, capsuleId;

  beforeEach(async () => {
    await User.deleteMany({});
    await Capsule.deleteMany({});

    const user = await User.create({ email: 'test@example.com', password: 'password' });
    userId = user._id;
    token = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1h' });

    const capsule = await Capsule.create({
      user: userId,
      message: 'Initial message',
      unlock_at: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day in future
      unlock_code: 'abcd1234'
    });

    capsuleId = capsule._id;
    unlockCode = capsule.unlock_code;
  });

  // ✅ Test: Get capsule - invalid code
  it('should reject access to capsule with wrong unlock code', async () => {
    const res = await request(app)
      .get(`/capsules/${capsuleId}?code=wrongcode`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error', 'Invalid or missing unlock code');
  });

  //  Test: Get capsule - before unlock_at
  it('should return locked error before unlock date', async () => {
    const res = await request(app)
      .get(`/capsules/${capsuleId}?code=${unlockCode}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('error', 'Capsule is still locked');
  });

  // Test: Update capsule - valid code
  it('should update capsule if not unlocked', async () => {
    const res = await request(app)
      .put(`/capsules/${capsuleId}?code=${unlockCode}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'Updated message' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Capsule updated');
  });

  // Test: Delete capsule - valid code
  it('should delete capsule if still locked', async () => {
    const res = await request(app)
      .delete(`/capsules/${capsuleId}?code=${unlockCode}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Capsule deleted successfully');
  });

  // Test: List capsules with pagination
  it('should list capsules with pagination', async () => {
    const res = await request(app)
      .get('/capsules?page=1&limit=10')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('capsules');
    expect(Array.isArray(res.body.capsules)).toBe(true);
    expect(res.body.capsules.length).toBeGreaterThanOrEqual(1);
  });

  // Test: Access capsule after expiry (mock time)
  it('should return 410 if capsule is expired', async () => {
    // Set unlock_at to 31 days ago
    const expiredCapsule = await Capsule.create({
      user: userId,
      message: 'Old capsule',
      unlock_at: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000),
      unlock_code: 'expired123'
    });

    const res = await request(app)
      .get(`/capsules/${expiredCapsule._id}?code=expired123`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(410);
    expect(res.body).toHaveProperty('error', 'Capsule expired');
  });
  // Successful Capsule Retrieval After Unlock Time
  it('should return capsule data after unlock time with correct code', async () => {
  const unlockedCapsule = await Capsule.create({
    user: userId,
    message: 'Unlocked capsule',
    unlock_at: new Date(Date.now() - 60 * 1000), // 1 minute ago
    unlock_code: 'unlockme123'
  });

  const res = await request(app)
    .get(`/capsules/${unlockedCapsule._id}?code=unlockme123`)
    .set('Authorization', `Bearer ${token}`);

  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty('message', 'Unlocked capsule');
  });

//  Update with wrong unlock code
  it('should not allow update with wrong unlock code', async () => {
  const res = await request(app)
    .put(`/capsules/${capsuleId}?code=wrongcode`)
    .set('Authorization', `Bearer ${token}`)
    .send({ message: 'Hacked!' });

  expect(res.statusCode).toBe(401);
  expect(res.body).toHaveProperty('error');
});

it('should not allow delete with wrong unlock code', async () => {
  const res = await request(app)
    .delete(`/capsules/${capsuleId}?code=invalidcode`)
    .set('Authorization', `Bearer ${token}`);

  expect(res.statusCode).toBe(401);
  expect(res.body).toHaveProperty('error');
});


// Delete after unlock time (should be forbidden)

it('should not allow delete after unlock time', async () => {
  const unlockedCapsule = await Capsule.create({
    user: userId,
    message: 'Still here',
    unlock_at: new Date(Date.now() - 60 * 1000),
    unlock_code: 'cantdelete'
  });

  const res = await request(app)
    .delete(`/capsules/${unlockedCapsule._id}?code=cantdelete`)
    .set('Authorization', `Bearer ${token}`);

  expect(res.statusCode).toBe(403);
  expect(res.body).toHaveProperty('error', 'Cannot delete an unlocked capsule');
});




});
