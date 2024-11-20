// controllers/feedbackController.js
const Feedback = require('../models/Feedback');

exports.submitFeedback = async (req, res) => {
    try {
        const { rideShareId, rating, comment } = req.body;
        const userId = req.user.id; // Assuming the user's ID is stored in the token

        if (!rideShareId || !rating) {
            return res.status(400).json({ message: 'RideShareId and rating are required.' });
        }

        // Create a new feedback entry
        const feedback = await Feedback.create({
            rideShareId,
            userId,
            rating,
            comment,
        });

        return res.status(201).json({ message: 'Feedback submitted successfully.', feedback });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        return res.status(500).json({ message: 'Error submitting feedback.' });
    }
};
