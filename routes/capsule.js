const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const capsuleController = require('../controllers/capsuleController');

router.use(auth);
router.post('/', capsuleController.createCapsule);
router.get('/:id', capsuleController.getCapsule);
router.get('/', capsuleController.listCapsules);
router.put('/:id', capsuleController.updateCapsule);
router.delete('/:id', capsuleController.deleteCapsule);

module.exports = router;
