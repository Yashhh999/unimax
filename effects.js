/* ================================================
   UNIMAX STUDIOS - Seasonal Effects Engine
   ================================================ */

class SeasonalEffects {
    constructor() {
        this.currentSeason = 'default';
        this.effectsContainer = null;
        this.effectLayers = {};
        this.animationFrameId = null;
        this.particles = [];
        this.settings = this.loadSettings();
        
        this.init();
    }
    
    // Default settings structure
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
            projects: []
        };
    }
    
    loadSettings() {
        const saved = localStorage.getItem('unimaxSettings');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Merge with defaults to ensure all properties exist
                return { ...this.getDefaultSettings(), ...parsed };
            } catch (e) {
                console.warn('Failed to parse settings, using defaults');
            }
        }
        return this.getDefaultSettings();
    }
    
    saveSettings() {
        localStorage.setItem('unimaxSettings', JSON.stringify(this.settings));
    }
    
    init() {
        this.createEffectsContainer();
        this.createEffectLayers();
        
        // Determine season
        if (this.settings.autoSeason) {
            this.currentSeason = this.getSeasonFromDate();
        } else {
            this.currentSeason = this.settings.currentSeason;
        }
        
        this.applySeason(this.currentSeason);
    }
    
    createEffectsContainer() {
        this.effectsContainer = document.createElement('div');
        this.effectsContainer.className = 'seasonal-effects';
        this.effectsContainer.id = 'seasonalEffects';
        document.body.prepend(this.effectsContainer);
    }
    
    createEffectLayers() {
        const seasons = ['winter', 'summer', 'rainy', 'spring'];
        
        seasons.forEach(season => {
            const layer = document.createElement('div');
            layer.className = 'effect-layer';
            layer.id = `effect-${season}`;
            layer.dataset.season = season;
            layer.dataset.intensity = this.settings.intensity;
            this.effectsContainer.appendChild(layer);
            this.effectLayers[season] = layer;
        });
    }
    
    getSeasonFromDate() {
        const month = new Date().getMonth();
        // Northern hemisphere seasons
        if (month >= 2 && month <= 4) return 'spring';
        if (month >= 5 && month <= 7) return 'summer';
        if (month >= 8 && month <= 10) return 'rainy'; // Autumn as rainy
        return 'winter';
    }
    
    applySeason(season) {
        this.currentSeason = season;
        this.settings.currentSeason = season;
        
        // Remove all active effects
        Object.values(this.effectLayers).forEach(layer => {
            layer.classList.remove('active');
            layer.innerHTML = '';
        });
        
        // Clear existing particles
        this.clearParticles();
        
        // Apply theme colors
        this.applyTheme(season);
        
        // Set data attribute on body
        document.body.dataset.season = season;
        
        // Activate effect layer and generate particles
        if (season !== 'default' && this.effectLayers[season]) {
            this.effectLayers[season].classList.add('active');
            this.generateEffects(season);
        }
        
        this.saveSettings();
    }
    
    applyTheme(season) {
        const theme = this.settings.themes[season] || this.settings.themes.default;
        const root = document.documentElement;
        
        root.style.setProperty('--bg-primary', theme.bgPrimary);
        root.style.setProperty('--bg-secondary', theme.bgSecondary);
        root.style.setProperty('--bg-card', theme.bgCard);
        root.style.setProperty('--accent-primary', theme.accentPrimary);
        root.style.setProperty('--accent-secondary', theme.accentSecondary);
        root.style.setProperty('--text-secondary', theme.textSecondary);
        
        // Update gradient
        root.style.setProperty('--accent-gradient', 
            `linear-gradient(135deg, ${theme.accentPrimary} 0%, ${theme.accentSecondary} 100%)`);
        root.style.setProperty('--glow-primary', 
            this.hexToRgba(theme.accentPrimary, 0.4));
        root.style.setProperty('--glow-secondary', 
            this.hexToRgba(theme.accentSecondary, 0.3));
        
        // Update floating island active color based on theme
        root.style.setProperty('--island-active-bg', theme.accentPrimary);
        root.style.setProperty('--island-active-text', theme.bgPrimary);
    }
    
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    generateEffects(season) {
        const layer = this.effectLayers[season];
        if (!layer) return;
        
        switch (season) {
            case 'winter':
                this.generateSnowfall(layer);
                break;
            case 'summer':
                this.generateSunGlare(layer);
                break;
            case 'rainy':
                this.generateRain(layer);
                break;
            case 'spring':
                this.generateCherryBlossoms(layer);
                break;
        }
    }
    
    generateSnowfall(layer) {
        const particleCount = this.getParticleCount(100);
        
        // Create snow ground
        const ground = document.createElement('div');
        ground.className = 'snow-ground';
        layer.appendChild(ground);
        
        // Create snowflakes
        for (let i = 0; i < particleCount; i++) {
            const snowflake = document.createElement('div');
            snowflake.className = 'snowflake';
            snowflake.innerHTML = '❄';
            snowflake.style.left = Math.random() * 100 + '%';
            snowflake.style.fontSize = (Math.random() * 10 + 8) + 'px';
            snowflake.style.animationDuration = (Math.random() * 5 + 5) + 's';
            snowflake.style.animationDelay = Math.random() * 10 + 's';
            snowflake.style.opacity = Math.random() * 0.6 + 0.4;
            layer.appendChild(snowflake);
        }
    }
    
    generateSunGlare(layer) {
        // Create sun glares
        const positions = ['top-right', 'top-left', 'bottom-left'];
        positions.forEach(pos => {
            const glare = document.createElement('div');
            glare.className = `sun-glare ${pos}`;
            layer.appendChild(glare);
        });
        
        // Create lens flares
        for (let i = 0; i < 3; i++) {
            const flare = document.createElement('div');
            flare.className = 'lens-flare';
            layer.appendChild(flare);
        }
        
        // Create heat haze
        const haze = document.createElement('div');
        haze.className = 'heat-haze';
        layer.appendChild(haze);
    }
    
    generateRain(layer) {
        const particleCount = this.getParticleCount(80);
        
        // Create rain clouds at top corners
        for (let i = 0; i < 4; i++) {
            const cloud = document.createElement('div');
            cloud.className = 'rain-cloud';
            layer.appendChild(cloud);
        }
        
        // Create rain mist
        const mist = document.createElement('div');
        mist.className = 'rain-mist';
        layer.appendChild(mist);
        
        // Create lightning
        const lightning = document.createElement('div');
        lightning.className = 'lightning';
        layer.appendChild(lightning);
        
        // Create splash area
        const splash = document.createElement('div');
        splash.className = 'rain-splash';
        layer.appendChild(splash);
        
        // Create raindrops - slower animation
        for (let i = 0; i < particleCount; i++) {
            const drop = document.createElement('div');
            drop.className = 'raindrop';
            drop.style.left = Math.random() * 100 + '%';
            drop.style.animationDuration = (Math.random() * 1.5 + 1.5) + 's';
            drop.style.animationDelay = Math.random() * 3 + 's';
            drop.style.height = (Math.random() * 20 + 15) + 'px';
            layer.appendChild(drop);
        }
    }
    
    generateCherryBlossoms(layer) {
        const particleCount = this.getParticleCount(60);
        
        // Create spring glow
        const glow = document.createElement('div');
        glow.className = 'spring-glow';
        layer.appendChild(glow);
        
        // Create petals
        const variants = ['', 'variant-2', 'variant-3'];
        for (let i = 0; i < particleCount; i++) {
            const petal = document.createElement('div');
            const variant = variants[Math.floor(Math.random() * variants.length)];
            petal.className = `petal ${variant}`;
            petal.style.left = Math.random() * 100 + '%';
            petal.style.animationDuration = (Math.random() * 8 + 8) + 's';
            petal.style.animationDelay = Math.random() * 15 + 's';
            petal.style.opacity = Math.random() * 0.4 + 0.6;
            layer.appendChild(petal);
        }
    }
    
    getParticleCount(base) {
        const multipliers = {
            low: 0.3,
            medium: 0.6,
            high: 1
        };
        let count = Math.floor(base * (multipliers[this.settings.intensity] || 0.6));
        
        // Reduce particles on mobile for better performance
        if (window.innerWidth <= 768) {
            count = Math.floor(count * 0.5);
        } else if (window.innerWidth <= 480) {
            count = Math.floor(count * 0.3);
        }
        
        return count;
    }
    
    clearParticles() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.particles = [];
    }
    
    setIntensity(intensity) {
        this.settings.intensity = intensity;
        Object.values(this.effectLayers).forEach(layer => {
            layer.dataset.intensity = intensity;
        });
        
        // Regenerate effects with new intensity
        if (this.currentSeason !== 'default') {
            this.applySeason(this.currentSeason);
        }
        
        this.saveSettings();
    }
    
    updateTheme(season, themeData) {
        this.settings.themes[season] = { ...this.settings.themes[season], ...themeData };
        this.saveSettings();
        
        // If current season, reapply
        if (this.currentSeason === season) {
            this.applyTheme(season);
        }
    }
    
    setAutoSeason(enabled) {
        this.settings.autoSeason = enabled;
        if (enabled) {
            this.applySeason(this.getSeasonFromDate());
        }
        this.saveSettings();
    }
    
    // Project Management
    getProjects() {
        return this.settings.projects || [];
    }
    
    addProject(project) {
        project.id = Date.now().toString();
        project.createdAt = new Date().toISOString();
        this.settings.projects.push(project);
        this.saveSettings();
        return project;
    }
    
    updateProject(id, updates) {
        const index = this.settings.projects.findIndex(p => p.id === id);
        if (index !== -1) {
            this.settings.projects[index] = { ...this.settings.projects[index], ...updates };
            this.saveSettings();
            return this.settings.projects[index];
        }
        return null;
    }
    
    deleteProject(id) {
        this.settings.projects = this.settings.projects.filter(p => p.id !== id);
        this.saveSettings();
    }
    
    reorderProjects(orderedIds) {
        const projectMap = {};
        this.settings.projects.forEach(p => projectMap[p.id] = p);
        this.settings.projects = orderedIds.map(id => projectMap[id]).filter(Boolean);
        this.saveSettings();
    }
    
    // Ghost mode for projects
    toggleProjectVisibility(id) {
        const project = this.settings.projects.find(p => p.id === id);
        if (project) {
            project.hidden = !project.hidden;
            this.saveSettings();
            return project;
        }
        return null;
    }
}

// Initialize and expose globally
window.seasonalEffects = new SeasonalEffects();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SeasonalEffects;
}
