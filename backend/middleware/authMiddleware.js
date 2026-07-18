const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1]; // Bearer TOKEN
    if (!token) {
        return res.status(403).json({ error: 'Token missing' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'hackathon_secret', (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        req.userId = decoded.id; // Store user ID for next routes
        next();
    });
};

module.exports = verifyToken;
