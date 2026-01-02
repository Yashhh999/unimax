import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this';

// Verify JWT token from request
export function verifyToken(req) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    
    const token = authHeader.substring(7);
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (error) {
        return null;
    }
}

// Generate JWT token
export function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Middleware-style auth check
export function requireAuth(handler) {
    return async (req, res) => {
        const user = verifyToken(req);
        
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        req.user = user;
        return handler(req, res);
    };
}
