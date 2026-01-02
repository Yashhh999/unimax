import { verifyToken } from './lib/auth.js';
import redis from './lib/redis.js';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        // GET - Public settings (themes, backgrounds, fonts)
        if (req.method === 'GET') {
            const settings = {
                themes: await redis.get('settings:themes') || getDefaultThemes(),
                backgrounds: await redis.get('settings:backgrounds') || {},
                fonts: await redis.get('settings:fonts') || getDefaultFonts(),
                season: await redis.get('settings:season') || 'default'
            };
            return res.status(200).json(settings);
        }
        
        // POST - Update settings (admin only)
        if (req.method === 'POST') {
            const user = verifyToken(req);
            if (!user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            
            const { type, data } = req.body;
            
            if (!type || !data) {
                return res.status(400).json({ error: 'Type and data are required' });
            }
            
            const validTypes = ['themes', 'backgrounds', 'fonts', 'season'];
            if (!validTypes.includes(type)) {
                return res.status(400).json({ error: 'Invalid settings type' });
            }
            
            await redis.set(`settings:${type}`, data);
            
            return res.status(200).json({ success: true });
        }
        
        return res.status(405).json({ error: 'Method not allowed' });
        
    } catch (error) {
        console.error('Settings API error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
}

function getDefaultThemes() {
    return {
        default: {
            bgPrimary: '#0a0a0b',
            bgSecondary: '#111113',
            bgCard: '#161618',
            accentPrimary: '#8b5cf6',
            accentSecondary: '#06b6d4',
            textSecondary: 'rgba(255, 255, 255, 0.6)'
        },
        winter: {
            bgPrimary: '#0a1628',
            bgSecondary: '#0f1f35',
            bgCard: '#152842',
            accentPrimary: '#60a5fa',
            accentSecondary: '#38bdf8',
            textSecondary: 'rgba(200, 220, 255, 0.6)'
        },
        summer: {
            bgPrimary: '#1a0f00',
            bgSecondary: '#2d1800',
            bgCard: '#3d2200',
            accentPrimary: '#f59e0b',
            accentSecondary: '#fbbf24',
            textSecondary: 'rgba(255, 220, 180, 0.6)'
        },
        rainy: {
            bgPrimary: '#0a0d12',
            bgSecondary: '#0f1419',
            bgCard: '#151c25',
            accentPrimary: '#64748b',
            accentSecondary: '#475569',
            textSecondary: 'rgba(180, 190, 200, 0.6)'
        },
        spring: {
            bgPrimary: '#0f0a14',
            bgSecondary: '#1a1020',
            bgCard: '#251530',
            accentPrimary: '#f472b6',
            accentSecondary: '#fb7185',
            textSecondary: 'rgba(255, 200, 220, 0.6)'
        }
    };
}

function getDefaultFonts() {
    return {
        heading: 'Syne',
        body: 'Space Grotesk'
    };
}
