const jwt = require('jsonwebtoken');

exports.authMiddleware = (req, res, next) => {
    const token = req.headers['authorization']; // Get the token from the headers
    console.log('Received Token:', token); // Log the received token

    if (!token) {
        return res.status(401).json({ message: 'Access Denied. No token provided.' });
    }

    try {
        // Use split to get the token part after "Bearer "
        const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
        req.user = decoded; // Attach the decoded token to the request object
        next();
    } catch (error) {
        console.error('Token verification error:', error); // Log verification error
        res.status(400).json({ message: 'Invalid token' });
    }
};
