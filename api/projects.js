import { verifyToken } from './lib/auth.js';
import redis from './lib/redis.js';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        // GET - Public, no auth needed
        if (req.method === 'GET') {
            const projects = await redis.get('projects') || [];
            // Filter out hidden projects for public access
            const publicProjects = projects.filter(p => !p.hidden);
            return res.status(200).json(publicProjects);
        }
        
        // All other methods require authentication
        const user = verifyToken(req);
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        // POST - Create new project
        if (req.method === 'POST') {
            const project = req.body;
            
            if (!project.title || !project.category) {
                return res.status(400).json({ error: 'Title and category are required' });
            }
            
            const projects = await redis.get('projects') || [];
            
            const newProject = {
                id: Date.now().toString(),
                ...project,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            projects.push(newProject);
            await redis.set('projects', projects);
            
            return res.status(201).json(newProject);
        }
        
        // PUT - Update project
        if (req.method === 'PUT') {
            const { id, ...updates } = req.body;
            
            if (!id) {
                return res.status(400).json({ error: 'Project ID is required' });
            }
            
            const projects = await redis.get('projects') || [];
            const index = projects.findIndex(p => p.id === id);
            
            if (index === -1) {
                return res.status(404).json({ error: 'Project not found' });
            }
            
            projects[index] = {
                ...projects[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            
            await redis.set('projects', projects);
            
            return res.status(200).json(projects[index]);
        }
        
        // DELETE - Delete project
        if (req.method === 'DELETE') {
            const { id } = req.body;
            
            if (!id) {
                return res.status(400).json({ error: 'Project ID is required' });
            }
            
            let projects = await redis.get('projects') || [];
            const initialLength = projects.length;
            projects = projects.filter(p => p.id !== id);
            
            if (projects.length === initialLength) {
                return res.status(404).json({ error: 'Project not found' });
            }
            
            await redis.set('projects', projects);
            
            return res.status(200).json({ success: true });
        }
        
        return res.status(405).json({ error: 'Method not allowed' });
        
    } catch (error) {
        console.error('Projects API error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
}
