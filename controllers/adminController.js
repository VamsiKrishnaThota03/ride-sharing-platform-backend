// controllers/adminController.js
const User = require('../models/User'); // Make sure to import your User model
const Feedback = require('../models/Feedback'); // Adjust this path to your Feedback model

// Other methods...

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// controllers/feedbackController.js

exports.getAllFeedbacks = async (req, res) => {
    try {
        const feedbacks = await Feedback.findAll(); // Fetch all feedback
        res.status(200).json(feedbacks); // Return feedbacks as JSON
    } catch (error) {
        console.error('Error fetching feedbacks:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
