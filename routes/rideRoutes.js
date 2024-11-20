// routes/rideRoutes.js
const express = require('express');
const router = express.Router();
const rideController = require('../controllers/rideController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Protected routes
router.post('/share', authMiddleware, rideController.saveRideShare);
router.get('/shared', authMiddleware, rideController.getUserRideShares);
// router.post('/expire', authMiddleware, rideController.expireRideShare);

router.get('/companion/details', authMiddleware, rideController.getCompanionRideDetails);

module.exports = router;
