const mongoose = require('mongoose');
const app = require('./app');
const PORT = process.env.PORT || 5000;
require('dotenv').config();
require('./cron/expireCapsules');

// Connect only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB');
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch(err => console.error('DB connection error:', err));
}

module.exports = app;
