// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController'); // Import your user controller
const authMiddleware = require('../middleware/authMiddleware'); // Import auth middleware

// Signup route
router.post('/signup', authController.signup);

// Login route
router.post('/login', authController.login);

// User profile route (protected)
router.get('/user/profile', authMiddleware.authMiddleware, userController.getUserProfile);

module.exports = router; // Ensure this is exporting the router
