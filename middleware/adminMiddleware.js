const jwt = require('jsonwebtoken');

exports.authMiddleware = (roles = []) => {
    return (req, res, next) => {
        const token = req.headers['authorization']?.split(' ')[1];

        if (!token) {
            return res.status(403).json({ message: 'No token provided.' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;

            // Debugging log
            console.log('Decoded user:', req.user); // Check the role here

            if (roles.length && !roles.includes(req.user.role)) {
                return res.status(403).json({ message: 'Access denied: insufficient permissions.' });
            }

            next();
        } catch (error) {
            console.error('Token verification error:', error);
            return res.status(401).json({ message: 'Unauthorized: Invalid token.' });
        }
    };
};