const jwt = require('jsonwebtoken');

exports.generateToken = (id, email, role, mobile_number) => {
    return jwt.sign(
        { id, email, role, mobile_number }, // Include mobile_number in the token
        process.env.JWT_SECRET, // Ensure this is your secret key
        { expiresIn: '1h' } // Token expiration time
    );
};
