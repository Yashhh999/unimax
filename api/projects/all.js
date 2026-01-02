import { verifyToken } from '../lib/auth.js';
import redis from '../lib/redis.js';

// Get ALL projects including hidden (admin only)
export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    // Require authentication for all projects
    const user = verifyToken(req);
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
        const projects = await redis.get('projects') || [];
        return res.status(200).json(projects);
    } catch (error) {
        console.error('Get all projects error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
}
