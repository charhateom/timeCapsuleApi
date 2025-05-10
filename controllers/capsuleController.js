// const Capsule = require('../models/Capsule');
// const crypto = require('crypto');

// // Helper to generate unlock code
// const generateUnlockCode = () => crypto.randomBytes(4).toString('hex');

// // POST /capsules
// exports.createCapsule = async (req, res) => {
//   try {
//     const { message, unlock_at } = req.body;
//     const unlock_code = generateUnlockCode();
//     const capsule = await Capsule.create({
//       user: req.userId,
//       message,
//       unlock_at,
//       unlock_code
//     });

//     res.status(201).json({
//       id: capsule._id,
//       unlock_code
//     });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };


// // GET /capsules/:id?code=UNLOCK_CODE
// exports.getCapsule = async (req, res) => {
//   try {
//     const capsule = await Capsule.findOne({ _id: req.params.id, user: req.userId });
//     if (!capsule) return res.status(404).json({ error: 'Capsule not found' });

//     const now = new Date();
//     const code = req.query.code;

//     if (!code || code !== capsule.unlock_code) {
//       return res.status(401).json({ error: 'Invalid or missing unlock code' });
//     }

//     const unlockAt = new Date(capsule.unlock_at);
//     const expireAt = new Date(unlockAt);
//     expireAt.setDate(unlockAt.getDate() + 30);

//     if (now < unlockAt) {
//       return res.status(403).json({ error: 'Capsule is still locked' });
//     }

//     if (now > expireAt) {
//       capsule.isExpired = true;
//       await capsule.save();
//       return res.status(410).json({ error: 'Capsule expired' });
//     }

//     res.json({
//       id: capsule._id,
//       message: capsule.message,
//       unlock_at: capsule.unlock_at
//     });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };
// exports.listCapsules = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;
//     const now = new Date();

//     const capsules = await Capsule.find({ user: req.userId })
//       .sort({ unlock_at: 1 })
//       .skip(skip)
//       .limit(limit);

//     const result = capsules.map(capsule => {
//       const unlockAt = new Date(capsule.unlock_at);
//       const expired = capsule.isExpired || now > new Date(unlockAt.getTime() + 30 * 24 * 60 * 60 * 1000);

//       const isUnlocked = now >= unlockAt && !expired;

//       return {
//         id: capsule._id,
//         unlock_at: capsule.unlock_at,
//         isExpired: expired,
//         ...(isUnlocked ? { message: capsule.message } : {})
//       };
//     });

//     res.json({
//       page,
//       limit,
//       capsules: result
//     });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };
// exports.updateCapsule = async (req, res) => {
//   try {
//     const capsule = await Capsule.findOne({ _id: req.params.id, user: req.userId });
//     if (!capsule) return res.status(404).json({ error: 'Capsule not found' });

//     const now = new Date();
//     const code = req.query.code;

//     if (!code || code !== capsule.unlock_code) {
//       return res.status(401).json({ error: 'Invalid or missing unlock code' });
//     }

//     if (now >= new Date(capsule.unlock_at)) {
//       return res.status(403).json({ error: 'Capsule is already unlocked and cannot be updated' });
//     }

//     capsule.message = req.body.message || capsule.message;
//     capsule.unlock_at = req.body.unlock_at || capsule.unlock_at;

//     await capsule.save();
//     res.json({ message: 'Capsule updated' });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };
// exports.deleteCapsule = async (req, res) => {
//   try {
//     const capsule = await Capsule.findOne({ _id: req.params.id, user: req.userId });
//     if (!capsule) return res.status(404).json({ error: 'Capsule not found' });

//     const now = new Date();
//     const code = req.query.code;

//     if (!code || code !== capsule.unlock_code) {
//       return res.status(401).json({ error: 'Invalid or missing unlock code' });
//     }

//     if (now >= new Date(capsule.unlock_at)) {
//       return res.status(403).json({ error: 'Cannot delete an unlocked capsule' });
//     }

//     await capsule.deleteOne();
//     res.json({ message: 'Capsule deleted successfully' });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };
const Capsule = require('../models/Capsule');
const crypto = require('crypto');

// Helper to generate unlock code
const generateUnlockCode = () => crypto.randomBytes(4).toString('hex');

// POST /capsules
exports.createCapsule = async (req, res) => {
  try {
    const { message, unlock_at } = req.body;
    const unlock_code = generateUnlockCode();

    const capsule = await Capsule.create({
      user: req.userId,
      message,
      unlock_at,
      unlock_code
    });

    res.status(201).json({
      id: capsule._id,
      unlock_code,
      message: capsule.message,
      unlock_at: capsule.unlock_at
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET /capsules/:id?code=UNLOCK_CODE
exports.getCapsule = async (req, res) => {
  try {
    const capsule = await Capsule.findOne({ _id: req.params.id, user: req.userId });
    if (!capsule) return res.status(404).json({ error: 'Capsule not found' });

    const now = new Date();
    const code = req.query.code;

    if (!code || code !== capsule.unlock_code) {
      return res.status(401).json({ error: 'Invalid or missing unlock code' });
    }

    const unlockAt = new Date(capsule.unlock_at);
    const expireAt = new Date(unlockAt);
    expireAt.setDate(unlockAt.getDate() + 30);

    if (now < unlockAt) {
      return res.status(403).json({ error: 'Capsule is still locked' });
    }

    if (now > expireAt) {
      capsule.isExpired = true;
      await capsule.save();
      return res.status(410).json({ error: 'Capsule expired' });
    }

    res.json({
      id: capsule._id,
      message: capsule.message,
      unlock_at: capsule.unlock_at
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET /capsules
exports.listCapsules = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const now = new Date();

    const capsules = await Capsule.find({ user: req.userId })
      .sort({ unlock_at: 1 })
      .skip(skip)
      .limit(limit);

    const result = capsules.map(capsule => {
      const unlockAt = new Date(capsule.unlock_at);
      const expired = capsule.isExpired || now > new Date(unlockAt.getTime() + 30 * 24 * 60 * 60 * 1000);
      const isUnlocked = now >= unlockAt && !expired;

      return {
        id: capsule._id,
        unlock_at: capsule.unlock_at,
        isExpired: expired,
        ...(isUnlocked ? { message: capsule.message } : {})
      };
    });

    res.json({
      page,
      limit,
      capsules: result
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUT /capsules/:id?code=UNLOCK_CODE
exports.updateCapsule = async (req, res) => {
  try {
    const capsule = await Capsule.findOne({ _id: req.params.id, user: req.userId });
    if (!capsule) return res.status(404).json({ error: 'Capsule not found' });

    const now = new Date();
    const code = req.query.code;

    if (!code || code !== capsule.unlock_code) {
      return res.status(401).json({ error: 'Invalid or missing unlock code' });
    }

    if (now >= new Date(capsule.unlock_at)) {
      return res.status(403).json({ error: 'Capsule is already unlocked and cannot be updated' });
    }

    capsule.message = req.body.message || capsule.message;
    capsule.unlock_at = req.body.unlock_at || capsule.unlock_at;

    await capsule.save();
    res.json({ message: 'Capsule updated' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /capsules/:id?code=UNLOCK_CODE
exports.deleteCapsule = async (req, res) => {
  try {
    const capsule = await Capsule.findOne({ _id: req.params.id, user: req.userId });
    if (!capsule) return res.status(404).json({ error: 'Capsule not found' });

    const now = new Date();
    const code = req.query.code;

    if (!code || code !== capsule.unlock_code) {
      return res.status(401).json({ error: 'Invalid or missing unlock code' });
    }

    if (now >= new Date(capsule.unlock_at)) {
      return res.status(403).json({ error: 'Cannot delete an unlocked capsule' });
    }

    await capsule.deleteOne();
    res.json({ message: 'Capsule deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
