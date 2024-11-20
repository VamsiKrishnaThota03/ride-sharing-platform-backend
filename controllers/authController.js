const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const RideShare = require('../models/RideShare'); // Ensure you import your RideShare model
const jwtUtils = require('../utils/jwtUtils');

// Signup controller
exports.signup = async (req, res) => {
    const { name, email, mobile_number, password, role } = req.body;

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
        const user = await User.create({
            name,
            email,
            mobile_number, // Ensure this is saved in the DB
            password: hashedPassword,
            role
        });

        res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};

// Login controller
exports.login = async (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email); // Debugging

    try {
        // Find user by email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwtUtils.generateToken(user.id, user.email, user.role, user.mobile_number); // Include mobile_number in token

        // Check for companion role
        if (user.role === 'traveler_companion') {
            // Fetch ride share details based on the companion's mobile number
            console.log(user, user.mobile_number);
            const rideShareDetails = await RideShare.findAll({ where: { companionMobile: user.mobile_number } });

            if (!rideShareDetails.length) {
                return res.status(404).json({ message: 'No ride share details found for this companion.' });
            }

            // Send response with ride share details
            return res.status(200).json({
                message: 'Login successful',
                token,
                role: user.role,
                mobile_number: user.mobile_number, // Include mobile_number in response if needed
                rideShareDetails // Include ride share details in the response
            });
        }

        // For other roles (like traveler)
        return res.status(200).json({
            message: 'Login successful',
            token,
            role: user.role,
            mobile_number: user.mobile_number // Include mobile_number in response if needed
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};
