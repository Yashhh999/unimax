/**
 * UNIMAX API Client
 * Handles all communication with the serverless backend
 */

const API_BASE = '/api';

class UnimaxAPI {
    constructor() {
        this.token = localStorage.getItem('unimax_token');
    }
    
    // Get auth headers
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (includeAuth && this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }
    
    // Set token after login
    setToken(token) {
        this.token = token;
        localStorage.setItem('unimax_token', token);
    }
    
    // Clear token on logout
    clearToken() {
        this.token = null;
        localStorage.removeItem('unimax_token');
    }
    
    // Check if logged in
    isAuthenticated() {
        return !!this.token;
    }
    
    // ===== AUTH =====
    
    async login(password) {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: this.getHeaders(false),
            body: JSON.stringify({ password })
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            throw new Error(data.error || 'Login failed');
        }
        
        this.setToken(data.token);
        return data;
    }
    
    async verifyToken() {
        if (!this.token) return false;
        
        try {
            const res = await fetch(`${API_BASE}/auth/verify`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            
            const data = await res.json();
            return data.valid === true;
        } catch {
            return false;
        }
    }
    
    async changePassword(currentPassword, newPassword) {
        const res = await fetch(`${API_BASE}/auth/change-password`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ currentPassword, newPassword })
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            throw new Error(data.error || 'Failed to change password');
        }
        
        return data;
    }
    
    logout() {
        this.clearToken();
    }
    
    // ===== PROJECTS =====
    
    async getProjects(includeHidden = false) {
        const endpoint = includeHidden ? `${API_BASE}/projects/all` : `${API_BASE}/projects`;
        const res = await fetch(endpoint, {
            method: 'GET',
            headers: this.getHeaders(includeHidden)
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            throw new Error(data.error || 'Failed to fetch projects');
        }
        
        return data;
    }
    
    async createProject(project) {
        const res = await fetch(`${API_BASE}/projects`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(project)
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            throw new Error(data.error || 'Failed to create project');
        }
        
        return data;
    }
    
    async updateProject(id, updates) {
        const res = await fetch(`${API_BASE}/projects`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify({ id, ...updates })
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            throw new Error(data.error || 'Failed to update project');
        }
        
        return data;
    }
    
    async deleteProject(id) {
        const res = await fetch(`${API_BASE}/projects`, {
            method: 'DELETE',
            headers: this.getHeaders(),
            body: JSON.stringify({ id })
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            throw new Error(data.error || 'Failed to delete project');
        }
        
        return data;
    }
    
    // ===== SETTINGS =====
    
    async getSettings() {
        const res = await fetch(`${API_BASE}/settings`, {
            method: 'GET',
            headers: this.getHeaders(false)
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            throw new Error(data.error || 'Failed to fetch settings');
        }
        
        return data;
    }
    
    async updateSettings(type, data) {
        const res = await fetch(`${API_BASE}/settings`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ type, data })
        });
        
        const result = await res.json();
        
        if (!res.ok) {
            throw new Error(result.error || 'Failed to update settings');
        }
        
        return result;
    }
    
    async updateTheme(season, theme) {
        const settings = await this.getSettings();
        const themes = settings.themes || {};
        themes[season] = theme;
        return this.updateSettings('themes', themes);
    }
    
    async updateBackground(page, url) {
        const settings = await this.getSettings();
        const backgrounds = settings.backgrounds || {};
        backgrounds[page] = url;
        return this.updateSettings('backgrounds', backgrounds);
    }
    
    async updateFonts(fonts) {
        return this.updateSettings('fonts', fonts);
    }
    
    async updateSeason(season) {
        return this.updateSettings('season', season);
    }
}

// Export singleton instance
const api = new UnimaxAPI();
export default api;

// Also make it available globally for non-module scripts
if (typeof window !== 'undefined') {
    window.UnimaxAPI = api;
}
