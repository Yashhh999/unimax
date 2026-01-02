import bcrypt from 'bcryptjs';
import { generateToken } from '../lib/auth.js';
import redis from '../lib/redis.js';

// Rate limiting: Track failed attempts
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60; // 15 minutes in seconds

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { password } = req.body;
        const clientIP = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
        const rateLimitKey = `ratelimit:login:${clientIP}`;
        
        // Check rate limit
        const attempts = await redis.get(rateLimitKey) || 0;
        
        if (attempts >= MAX_ATTEMPTS) {
            const ttl = await redis.ttl(rateLimitKey);
            return res.status(429).json({ 
                error: 'Too many failed attempts. Try again later.',
                retryAfter: ttl
            });
        }
        
        // Get stored admin password hash from Redis or environment
        let storedHash = await redis.get('admin:password_hash');
        
        // If no password set yet, use environment variable
        if (!storedHash) {
            const envPassword = process.env.ADMIN_PASSWORD;
            if (!envPassword) {
                return res.status(500).json({ error: 'Admin password not configured' });
            }
            // Hash and store the password from env
            storedHash = await bcrypt.hash(envPassword, 12);
            await redis.set('admin:password_hash', storedHash);
        }
        
        // Verify password
        const isValid = await bcrypt.compare(password, storedHash);
        
        if (!isValid) {
            // Increment failed attempts
            await redis.setex(rateLimitKey, LOCKOUT_TIME, attempts + 1);
            
            return res.status(401).json({ 
                error: 'Invalid password',
                attemptsRemaining: MAX_ATTEMPTS - attempts - 1
            });
        }
        
        // Clear rate limit on success
        await redis.del(rateLimitKey);
        
        // Generate token
        const token = generateToken({ 
            role: 'admin',
            iat: Date.now()
        });
        
        // Log successful login
        await redis.lpush('admin:login_log', JSON.stringify({
            ip: clientIP,
            timestamp: new Date().toISOString(),
            userAgent: req.headers['user-agent']
        }));
        await redis.ltrim('admin:login_log', 0, 99); // Keep last 100 logins
        
        return res.status(200).json({ 
            success: true,
            token,
            expiresIn: '7d'
        });
        
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
}
