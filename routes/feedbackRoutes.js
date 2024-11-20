// routes/feedbackRoutes.js
const express = require('express');
const feedbackController = require('../controllers/feedbackController');
const { authMiddleware } = require('../middleware/adminMiddleware');

const router = express.Router();

// Companion and Traveler submit feedback
router.post('/send', authMiddleware(['traveler', 'traveler_companion']), feedbackController.submitFeedback);

module.exports = router;
