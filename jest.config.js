
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./tests/setup.js'], // Setup MongoDB memory server
  testTimeout: 10000 // Optional: useful for slower DB tests
};