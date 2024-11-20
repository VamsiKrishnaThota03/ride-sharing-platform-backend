const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/adminMiddleware');

const adminController = require('../controllers/adminController');
const feedbackController = require('../controllers/feedbackController');

// Ensure this route is properly defined
router.get('/users', authMiddleware(['admin']), adminController.getAllUsers);
router.get('/feedbacks', authMiddleware(['admin']), adminController.getAllFeedbacks);

module.exports = router;
