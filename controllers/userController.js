// controllers/userController.js
const User = require('../models/User');

exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id; // Get the user ID from the decoded token
        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password'] }, // Exclude the password field
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user); // Send back the user profile
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


exports.editProfile = async (req, res) => {
    try {
        const userId = req.user.id; // Get user ID from the authenticated request
        const { name, email, mobile_number } = req.body; // Get new profile data from request body

        // Validate incoming data (add additional validation as needed)
        if (!name || !email || !mobile_number) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Update user details
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.name = name;
        user.email = email;
        user.mobile_number = mobile_number;

        await user.save(); // Save the changes

        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};