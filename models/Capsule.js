const mongoose = require('mongoose');

const capsuleSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  unlock_at: { type: Date, required: true },
  unlock_code: { type: String, required: true },
  isExpired: { type: Boolean, default: false },
}, {
  timestamps: true
});

module.exports = mongoose.model('Capsule', capsuleSchema);
