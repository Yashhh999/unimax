/* ================================================
   UNIMAX STUDIOS - Admin Panel JavaScript
   Serverless API Version
   ================================================ */

// API Base URL
const API_BASE = '/api';

// ================================================
// API CLIENT
// ================================================
const API = {
    token: localStorage.getItem('unimax_token'),
    
    getHeaders(includeAuth = true) {
        const headers = { 'Content-Type': 'application/json' };
        if (includeAuth && this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    },
    
    setToken(token) {
        this.token = token;
        localStorage.setItem('unimax_token', token);
    },
    
    clearToken() {
        this.token = null;
        localStorage.removeItem('unimax_token');
    },
    
    async request(endpoint, options = {}) {
        try {
            const res = await fetch(`${API_BASE}${endpoint}`, {
                ...options,
                headers: this.getHeaders(options.auth !== false)
            });
            
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || 'Request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    // Auth
    async login(password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            auth: false,
            body: JSON.stringify({ password })
        });
        this.setToken(data.token);
        return data;
    },
    
    async verifyToken() {
        if (!this.token) return false;
        try {
            const data = await this.request('/auth/verify');
            return data.valid === true;
        } catch {
            return false;
        }
    },
    
    async changePassword(currentPassword, newPassword) {
        return this.request('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify({ currentPassword, newPassword })
        });
    },
    
    logout() {
        this.clearToken();
    },
    
    // Projects
    async getProjects(includeHidden = false) {
        const endpoint = includeHidden ? '/projects/all' : '/projects';
        return this.request(endpoint, { auth: includeHidden });
    },
    
    async createProject(project) {
        return this.request('/projects', {
            method: 'POST',
            body: JSON.stringify(project)
        });
    },
    
    async updateProject(id, updates) {
        return this.request('/projects', {
            method: 'PUT',
            body: JSON.stringify({ id, ...updates })
        });
    },
    
    async deleteProject(id) {
        return this.request('/projects', {
            method: 'DELETE',
            body: JSON.stringify({ id })
        });
    },
    
    // Settings
    async getSettings() {
        return this.request('/settings', { auth: false });
    },
    
    async updateSettings(type, data) {
        return this.request('/settings', {
            method: 'POST',
            body: JSON.stringify({ type, data })
        });
    }
};

// ================================================
// SETTINGS MANAGER (API-based)
// ================================================
class SettingsManager {
    constructor() {
        this.settings = this.getDefaultSettings();
        this.loaded = false;
    }
    
    getDefaultSettings() {
        return {
            currentSeason: 'default',
            autoSeason: true,
            intensity: 'medium',
            themes: {
                default: {
                    bgPrimary: '#0a0a0b',
                    bgSecondary: '#111113',
                    bgCard: '#161618',
                    accentPrimary: '#8b5cf6',
                    accentSecondary: '#06b6d4',
                    textSecondary: '#888888'
                },
                winter: {
                    bgPrimary: '#0a0d12',
                    bgSecondary: '#0f1318',
                    bgCard: '#141a22',
                    accentPrimary: '#60a5fa',
                    accentSecondary: '#38bdf8',
                    textSecondary: '#94a3b8'
                },
                summer: {
                    bgPrimary: '#0f0a06',
                    bgSecondary: '#1a1208',
                    bgCard: '#221a0c',
                    accentPrimary: '#f59e0b',
                    accentSecondary: '#fb923c',
                    textSecondary: '#a8a29e'
                },
                rainy: {
                    bgPrimary: '#070a0d',
                    bgSecondary: '#0c1015',
                    bgCard: '#111620',
                    accentPrimary: '#6366f1',
                    accentSecondary: '#818cf8',
                    textSecondary: '#9ca3af'
                },
                spring: {
                    bgPrimary: '#0a0b08',
                    bgSecondary: '#12140e',
                    bgCard: '#1a1d14',
                    accentPrimary: '#f472b6',
                    accentSecondary: '#a3e635',
                    textSecondary: '#a1a1aa'
                }
            },
            backgrounds: {
                REELS: '',
                DOCUMENTARY: '',
                GRAPHICS: '',
                POSTERS: ''
            },
            fonts: {
                heading: 'Syne',
                body: 'Space Grotesk'
            },
            projects: []
        };
    }
    
    async load() {
        try {
            const apiSettings = await API.getSettings();
            this.settings = { 
                ...this.getDefaultSettings(), 
                ...apiSettings,
                themes: { ...this.getDefaultSettings().themes, ...apiSettings.themes },
                backgrounds: { ...this.getDefaultSettings().backgrounds, ...apiSettings.backgrounds }
            };
            
            // Load projects separately
            try {
                this.settings.projects = await API.getProjects(true);
            } catch (e) {
                console.warn('Could not load projects, using empty array');
                this.settings.projects = [];
            }
            
            this.loaded = true;
        } catch (error) {
            console.warn('Could not load settings from API, using defaults');
            this.settings = this.getDefaultSettings();
        }
        return this.settings;
    }
    
    get(key) {
        return this.settings[key];
    }
    
    async set(key, value) {
        this.settings[key] = value;
        
        // Map to API endpoints
        if (key === 'themes') {
            await API.updateSettings('themes', value);
        } else if (key === 'backgrounds') {
            await API.updateSettings('backgrounds', value);
        } else if (key === 'fonts') {
            await API.updateSettings('fonts', value);
        } else if (key === 'currentSeason') {
            await API.updateSettings('season', value);
        }
    }
    
    // Sync method for getting values
    getSync(key) {
        return this.settings[key];
    }
}

// Initialize settings manager
const settings = new SettingsManager();

// ================================================
// AUTHENTICATION
// ================================================
async function initAuth() {
    const loginOverlay = document.getElementById('loginOverlay');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const loginLockout = document.getElementById('loginLockout');
    const lockoutTimer = document.getElementById('lockoutTimer');
    const attemptsLeft = document.getElementById('attemptsLeft');
    const loginBtn = document.getElementById('loginBtn');
    const passwordInput = document.getElementById('adminPassword');
    
    // Check if already authenticated with valid token
    const isValid = await API.verifyToken();
    
    if (isValid) {
        loginOverlay.classList.add('hidden');
        await initDashboard();
        return;
    }
    
    // Clear invalid token
    API.clearToken();
    
    // Handle form submit
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const password = passwordInput.value;
        if (!password) return;
        
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<span class="loading-spinner"></span>';
        
        try {
            await API.login(password);
            loginOverlay.classList.add('hidden');
            passwordInput.value = '';
            showToast('Welcome back!', 'success');
            await initDashboard();
        } catch (error) {
            loginError.classList.add('show');
            
            // Handle rate limiting
            if (error.message.includes('Too many')) {
                loginLockout.classList.add('show');
                loginError.classList.remove('show');
                startLockoutTimer();
            } else if (error.message.includes('attemptsRemaining')) {
                const match = error.message.match(/(\d+)/);
                if (match) {
                    attemptsLeft.textContent = match[1];
                }
            }
            
            passwordInput.value = '';
            passwordInput.focus();
        } finally {
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<span>Login</span><span class="login-arrow">→</span>';
        }
    });
}

function startLockoutTimer() {
    const lockoutTimer = document.getElementById('lockoutTimer');
    let seconds = 15 * 60; // 15 minutes
    
    const interval = setInterval(() => {
        seconds--;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        lockoutTimer.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        
        if (seconds <= 0) {
            clearInterval(interval);
            document.getElementById('loginLockout').classList.remove('show');
            document.getElementById('loginBtn').disabled = false;
            document.getElementById('adminPassword').disabled = false;
        }
    }, 1000);
}

// ================================================
// MOBILE MENU
// ================================================
function initMobileMenu() {
    const toggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (!toggle || !sidebar) return;
    
    toggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay?.classList.toggle('active');
    });
    
    overlay?.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
    });
    
    // Close on nav item click (mobile)
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth < 1024) {
                sidebar.classList.remove('open');
                overlay?.classList.remove('active');
            }
        });
    });
}

// ================================================
// NAVIGATION
// ================================================
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.admin-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.dataset.section;
            
            // Update nav active state
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Show target section
            sections.forEach(section => {
                section.classList.toggle('active', section.id === target);
            });
            
            // Update header
            const sectionNames = {
                'dashboard': 'Dashboard',
                'projects': 'Projects',
                'themes': 'Themes',
                'backgrounds': 'Backgrounds',
                'fonts': 'Typography',
                'settings': 'Settings'
            };
            
            const header = document.querySelector('.section-header h2');
            if (header) {
                header.textContent = sectionNames[target] || 'Admin Panel';
            }
        });
    });
    
    // Logout button
    const logoutBtns = document.querySelectorAll('.logout-btn, #logoutBtn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            API.logout();
            window.location.reload();
        });
    });
}

// ================================================
// DASHBOARD
// ================================================
async function initDashboard() {
    // Load settings from API
    await settings.load();
    
    updateDashboardStats();
    initSeasons();
    initProjects();
    initThemes();
    initBackgrounds();
    initFonts();
    initSettingsPanel();
}

function updateDashboardStats() {
    const projects = settings.get('projects') || [];
    const categories = ['REELS', 'DOCUMENTARY', 'GRAPHICS', 'POSTERS'];
    
    // Total projects
    const totalEl = document.getElementById('totalProjects');
    if (totalEl) totalEl.textContent = projects.length;
    
    // Active projects
    const activeEl = document.getElementById('activeProjects');
    if (activeEl) activeEl.textContent = projects.filter(p => !p.hidden).length;
    
    // Categories
    const catEl = document.getElementById('totalCategories');
    if (catEl) catEl.textContent = categories.length;
    
    // Views (placeholder)
    const viewsEl = document.getElementById('totalViews');
    if (viewsEl) viewsEl.textContent = '1.2K';
}

// ================================================
// SEASONS
// ================================================
function initSeasons() {
    const seasonCards = document.querySelectorAll('.season-card');
    const currentSeason = settings.get('currentSeason') || 'default';
    
    // Set active season
    seasonCards.forEach(card => {
        const season = card.dataset.season;
        card.classList.toggle('active', season === currentSeason);
        
        card.addEventListener('click', async () => {
            seasonCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            try {
                await settings.set('currentSeason', season);
                showToast(`Season changed to ${season}`, 'success');
            } catch (error) {
                showToast('Failed to save season', 'error');
            }
        });
    });
}

// ================================================
// PROJECTS
// ================================================
let editingProjectId = null;

function initProjects() {
    renderProjectList();
    
    // Add project button
    const addBtn = document.getElementById('addProjectBtn');
    addBtn?.addEventListener('click', () => {
        editingProjectId = null;
        resetProjectForm();
        document.getElementById('projectModal').classList.add('active');
        document.getElementById('projectModalTitle').textContent = 'Add New Project';
    });
    
    // Cancel button
    document.getElementById('cancelProjectBtn')?.addEventListener('click', closeProjectModal);
    
    // Close modal on overlay click
    document.getElementById('projectModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'projectModal') closeProjectModal();
    });
    
    // Form submit
    document.getElementById('projectForm')?.addEventListener('submit', handleProjectSubmit);
}

function renderProjectList() {
    const container = document.getElementById('projectsList');
    const projects = settings.get('projects') || [];
    
    if (!container) return;
    
    if (projects.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📁</div>
                <h3>No projects yet</h3>
                <p>Add your first project to get started</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = projects.map(project => `
        <div class="project-item" data-id="${project.id}">
            <div class="project-thumb">
                ${project.thumbnail 
                    ? `<img src="${project.thumbnail}" alt="${project.title}">`
                    : '<div class="thumb-placeholder">🎬</div>'}
            </div>
            <div class="project-info">
                <h4>${project.title}</h4>
                <span class="project-category">${project.category}</span>
                ${project.hidden ? '<span class="project-hidden">Hidden</span>' : ''}
            </div>
            <div class="project-actions">
                <button class="action-btn edit-btn" title="Edit">✏️</button>
                <button class="action-btn toggle-btn" title="${project.hidden ? 'Show' : 'Hide'}">
                    ${project.hidden ? '👁️' : '👁️‍🗨️'}
                </button>
                <button class="action-btn delete-btn" title="Delete">🗑️</button>
            </div>
        </div>
    `).join('');
    
    // Add event listeners
    container.querySelectorAll('.project-item').forEach(item => {
        const id = item.dataset.id;
        
        item.querySelector('.edit-btn').addEventListener('click', () => editProject(id));
        item.querySelector('.toggle-btn').addEventListener('click', () => toggleProject(id));
        item.querySelector('.delete-btn').addEventListener('click', () => deleteProject(id));
    });
}

function resetProjectForm() {
    const form = document.getElementById('projectForm');
    form.reset();
    document.getElementById('projectId').value = '';
}

function closeProjectModal() {
    document.getElementById('projectModal').classList.remove('active');
    resetProjectForm();
}

async function handleProjectSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    const projectData = {
        title: document.getElementById('projectTitle').value,
        category: document.getElementById('projectCategory').value,
        description: document.getElementById('projectDescription').value,
        resolution: document.getElementById('projectResolution').value,
        fps: document.getElementById('projectFps').value,
        year: parseInt(document.getElementById('projectYear').value) || new Date().getFullYear(),
        videoUrl: document.getElementById('projectVideoUrl').value,
        thumbnail: document.getElementById('projectThumbnail').value,
        hidden: false
    };
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
    
    try {
        if (editingProjectId) {
            // Update existing
            await API.updateProject(editingProjectId, projectData);
            showToast('Project updated successfully', 'success');
        } else {
            // Create new
            await API.createProject(projectData);
            showToast('Project created successfully', 'success');
        }
        
        // Reload projects
        settings.settings.projects = await API.getProjects(true);
        renderProjectList();
        updateDashboardStats();
        closeProjectModal();
        
    } catch (error) {
        showToast(error.message || 'Failed to save project', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = editingProjectId ? 'Update Project' : 'Add Project';
    }
}

function editProject(id) {
    const projects = settings.get('projects') || [];
    const project = projects.find(p => p.id === id);
    
    if (!project) return;
    
    editingProjectId = id;
    
    document.getElementById('projectId').value = id;
    document.getElementById('projectTitle').value = project.title || '';
    document.getElementById('projectCategory').value = project.category || 'REELS';
    document.getElementById('projectDescription').value = project.description || '';
    document.getElementById('projectResolution').value = project.resolution || '1080p';
    document.getElementById('projectFps').value = project.fps || '30fps';
    document.getElementById('projectYear').value = project.year || new Date().getFullYear();
    document.getElementById('projectVideoUrl').value = project.videoUrl || '';
    document.getElementById('projectThumbnail').value = project.thumbnail || '';
    
    document.getElementById('projectModalTitle').textContent = 'Edit Project';
    document.getElementById('projectModal').classList.add('active');
}

async function toggleProject(id) {
    const projects = settings.get('projects') || [];
    const project = projects.find(p => p.id === id);
    
    if (!project) return;
    
    try {
        await API.updateProject(id, { hidden: !project.hidden });
        settings.settings.projects = await API.getProjects(true);
        renderProjectList();
        showToast(`Project ${project.hidden ? 'shown' : 'hidden'}`, 'success');
    } catch (error) {
        showToast('Failed to update project', 'error');
    }
}

async function deleteProject(id) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
        await API.deleteProject(id);
        settings.settings.projects = await API.getProjects(true);
        renderProjectList();
        updateDashboardStats();
        showToast('Project deleted', 'success');
    } catch (error) {
        showToast('Failed to delete project', 'error');
    }
}

// ================================================
// THEMES
// ================================================
function initThemes() {
    const seasonTabs = document.querySelectorAll('.theme-tab');
    const colorInputs = document.querySelectorAll('.color-input');
    
    // Load current season colors
    loadThemeColors('default');
    
    // Tab switching
    seasonTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            seasonTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            loadThemeColors(tab.dataset.season);
        });
    });
    
    // Color input changes
    colorInputs.forEach(input => {
        input.addEventListener('change', debounce(saveThemeColors, 500));
    });
    
    // Reset button
    document.getElementById('resetTheme')?.addEventListener('click', resetCurrentTheme);
}

function loadThemeColors(season) {
    const themes = settings.get('themes') || {};
    const theme = themes[season] || settings.getDefaultSettings().themes[season];
    
    if (!theme) return;
    
    document.getElementById('bgPrimary').value = theme.bgPrimary;
    document.getElementById('bgSecondary').value = theme.bgSecondary;
    document.getElementById('bgCard').value = theme.bgCard;
    document.getElementById('accentPrimary').value = theme.accentPrimary;
    document.getElementById('accentSecondary').value = theme.accentSecondary;
    document.getElementById('textSecondary').value = theme.textSecondary;
}

async function saveThemeColors() {
    const activeSeason = document.querySelector('.theme-tab.active')?.dataset.season || 'default';
    const themes = settings.get('themes') || {};
    
    themes[activeSeason] = {
        bgPrimary: document.getElementById('bgPrimary').value,
        bgSecondary: document.getElementById('bgSecondary').value,
        bgCard: document.getElementById('bgCard').value,
        accentPrimary: document.getElementById('accentPrimary').value,
        accentSecondary: document.getElementById('accentSecondary').value,
        textSecondary: document.getElementById('textSecondary').value
    };
    
    try {
        await settings.set('themes', themes);
        showToast('Theme saved', 'success');
    } catch (error) {
        showToast('Failed to save theme', 'error');
    }
}

async function resetCurrentTheme() {
    const activeSeason = document.querySelector('.theme-tab.active')?.dataset.season || 'default';
    const defaults = settings.getDefaultSettings().themes[activeSeason];
    
    const themes = settings.get('themes') || {};
    themes[activeSeason] = defaults;
    
    try {
        await settings.set('themes', themes);
        loadThemeColors(activeSeason);
        showToast('Theme reset to defaults', 'success');
    } catch (error) {
        showToast('Failed to reset theme', 'error');
    }
}

// ================================================
// BACKGROUNDS
// ================================================
function initBackgrounds() {
    const categories = ['REELS', 'DOCUMENTARY', 'GRAPHICS', 'POSTERS'];
    const container = document.getElementById('backgroundsList');
    
    if (!container) return;
    
    const backgrounds = settings.get('backgrounds') || {};
    
    container.innerHTML = categories.map(cat => `
        <div class="bg-item">
            <label>${cat}</label>
            <div class="bg-input-group">
                <input type="text" 
                    id="bg_${cat}" 
                    value="${backgrounds[cat] || ''}" 
                    placeholder="Image URL or leave empty for default">
                <button class="bg-save-btn" data-category="${cat}">Save</button>
            </div>
            ${backgrounds[cat] ? `<img src="${backgrounds[cat]}" class="bg-preview" alt="${cat} background">` : ''}
        </div>
    `).join('');
    
    // Save buttons
    container.querySelectorAll('.bg-save-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const cat = btn.dataset.category;
            const input = document.getElementById(`bg_${cat}`);
            const backgrounds = settings.get('backgrounds') || {};
            
            backgrounds[cat] = input.value;
            
            try {
                await settings.set('backgrounds', backgrounds);
                initBackgrounds(); // Re-render
                showToast(`${cat} background saved`, 'success');
            } catch (error) {
                showToast('Failed to save background', 'error');
            }
        });
    });
}

// ================================================
// FONTS
// ================================================
function initFonts() {
    const fonts = settings.get('fonts') || { heading: 'Syne', body: 'Space Grotesk' };
    
    const headingSelect = document.getElementById('headingFont');
    const bodySelect = document.getElementById('bodyFont');
    
    if (headingSelect) headingSelect.value = fonts.heading;
    if (bodySelect) bodySelect.value = fonts.body;
    
    document.getElementById('saveFonts')?.addEventListener('click', async () => {
        const newFonts = {
            heading: headingSelect?.value || 'Syne',
            body: bodySelect?.value || 'Space Grotesk'
        };
        
        try {
            await settings.set('fonts', newFonts);
            showToast('Fonts saved', 'success');
        } catch (error) {
            showToast('Failed to save fonts', 'error');
        }
    });
}

// ================================================
// SETTINGS PANEL
// ================================================
function initSettingsPanel() {
    // Change password form
    document.getElementById('changePasswordForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (newPassword !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }
        
        if (newPassword.length < 8) {
            showToast('Password must be at least 8 characters', 'error');
            return;
        }
        
        try {
            await API.changePassword(currentPassword, newPassword);
            showToast('Password changed successfully', 'success');
            e.target.reset();
        } catch (error) {
            showToast(error.message || 'Failed to change password', 'error');
        }
    });
    
    // Export data
    document.getElementById('exportData')?.addEventListener('click', () => {
        const data = {
            projects: settings.get('projects'),
            themes: settings.get('themes'),
            backgrounds: settings.get('backgrounds'),
            fonts: settings.get('fonts'),
            exportedAt: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `unimax-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        showToast('Data exported', 'success');
    });
    
    // Import data
    document.getElementById('importData')?.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const text = await file.text();
                const data = JSON.parse(text);
                
                // Import each type
                if (data.themes) await settings.set('themes', data.themes);
                if (data.backgrounds) await settings.set('backgrounds', data.backgrounds);
                if (data.fonts) await settings.set('fonts', data.fonts);
                
                // Import projects one by one
                if (data.projects) {
                    for (const project of data.projects) {
                        try {
                            await API.createProject(project);
                        } catch (e) {
                            console.warn('Could not import project:', project.title);
                        }
                    }
                }
                
                await settings.load();
                renderProjectList();
                updateDashboardStats();
                showToast('Data imported successfully', 'success');
                
            } catch (error) {
                showToast('Failed to import data', 'error');
            }
        };
        
        input.click();
    });
}

// ================================================
// UTILITIES
// ================================================
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
        <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ================================================
// INITIALIZE
// ================================================
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initMobileMenu();
    initNavigation();
});
