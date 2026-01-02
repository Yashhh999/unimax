import bcrypt from 'bcryptjs';
import { verifyToken } from '../lib/auth.js';
import redis from '../lib/redis.js';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    // Verify authentication
    const user = verifyToken(req);
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new password required' });
        }
        
        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }
        
        // Verify current password
        const storedHash = await redis.get('admin:password_hash');
        const isValid = await bcrypt.compare(currentPassword, storedHash);
        
        if (!isValid) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }
        
        // Hash and store new password
        const newHash = await bcrypt.hash(newPassword, 12);
        await redis.set('admin:password_hash', newHash);
        
        return res.status(200).json({ success: true, message: 'Password changed successfully' });
        
    } catch (error) {
        console.error('Change password error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
}
