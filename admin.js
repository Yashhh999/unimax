/* ================================================
   UNIMAX STUDIOS - Admin Panel JavaScript
   ================================================ */

// ================================================
// AUTHENTICATION & ANTI-BRUTE FORCE
// ================================================
const AuthManager = {
    // Get password from config file (falls back to default)
    get ADMIN_PASSWORD() {
        return (typeof UNIMAX_CONFIG !== 'undefined' && UNIMAX_CONFIG.ADMIN_PASSWORD) 
            ? UNIMAX_CONFIG.ADMIN_PASSWORD 
            : 'unimax2024';
    },
    
    get MAX_ATTEMPTS() {
        return (typeof UNIMAX_CONFIG !== 'undefined' && UNIMAX_CONFIG.MAX_LOGIN_ATTEMPTS) 
            ? UNIMAX_CONFIG.MAX_LOGIN_ATTEMPTS 
            : 5;
    },
    
    get LOCKOUT_DURATION() {
        const minutes = (typeof UNIMAX_CONFIG !== 'undefined' && UNIMAX_CONFIG.LOCKOUT_DURATION_MINUTES) 
            ? UNIMAX_CONFIG.LOCKOUT_DURATION_MINUTES 
            : 5;
        return minutes * 60 * 1000;
    },
    
    get SESSION_DURATION() {
        const minutes = (typeof UNIMAX_CONFIG !== 'undefined' && UNIMAX_CONFIG.SESSION_DURATION_MINUTES) 
            ? UNIMAX_CONFIG.SESSION_DURATION_MINUTES 
            : 30;
        return minutes * 60 * 1000;
    },
    
    getAuthData() {
        const data = localStorage.getItem('unimaxAdminAuth');
        return data ? JSON.parse(data) : {
            attempts: 0,
            lockoutUntil: null,
            sessionExpires: null
        };
    },
    
    saveAuthData(data) {
        localStorage.setItem('unimaxAdminAuth', JSON.stringify(data));
    },
    
    isLockedOut() {
        const data = this.getAuthData();
        if (data.lockoutUntil && Date.now() < data.lockoutUntil) {
            return true;
        }
        // Clear lockout if expired
        if (data.lockoutUntil && Date.now() >= data.lockoutUntil) {
            data.lockoutUntil = null;
            data.attempts = 0;
            this.saveAuthData(data);
        }
        return false;
    },
    
    getLockoutRemaining() {
        const data = this.getAuthData();
        if (data.lockoutUntil) {
            return Math.max(0, data.lockoutUntil - Date.now());
        }
        return 0;
    },
    
    isAuthenticated() {
        const data = this.getAuthData();
        return data.sessionExpires && Date.now() < data.sessionExpires;
    },
    
    authenticate(password) {
        if (this.isLockedOut()) {
            return { success: false, locked: true };
        }
        
        const data = this.getAuthData();
        
        // Simple password check - in production use proper hashing
        if (password === this.ADMIN_PASSWORD) {
            // Success - create session
            data.attempts = 0;
            data.lockoutUntil = null;
            data.sessionExpires = Date.now() + this.SESSION_DURATION;
            this.saveAuthData(data);
            return { success: true };
        }
        
        // Failed attempt
        data.attempts++;
        const remaining = this.MAX_ATTEMPTS - data.attempts;
        
        if (data.attempts >= this.MAX_ATTEMPTS) {
            data.lockoutUntil = Date.now() + this.LOCKOUT_DURATION;
            this.saveAuthData(data);
            return { success: false, locked: true, remaining: 0 };
        }
        
        this.saveAuthData(data);
        return { success: false, locked: false, remaining };
    },
    
    logout() {
        const data = this.getAuthData();
        data.sessionExpires = null;
        this.saveAuthData(data);
    },
    
    getRemainingAttempts() {
        const data = this.getAuthData();
        return Math.max(0, this.MAX_ATTEMPTS - data.attempts);
    }
};

// Initialize authentication
function initAuth() {
    const loginOverlay = document.getElementById('loginOverlay');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const loginLockout = document.getElementById('loginLockout');
    const lockoutTimer = document.getElementById('lockoutTimer');
    const attemptsLeft = document.getElementById('attemptsLeft');
    const loginBtn = document.getElementById('loginBtn');
    const passwordInput = document.getElementById('adminPassword');
    
    // Check if already authenticated
    if (AuthManager.isAuthenticated()) {
        loginOverlay.classList.add('hidden');
        return;
    }
    
    // Check if locked out
    if (AuthManager.isLockedOut()) {
        showLockout();
    } else {
        attemptsLeft.textContent = AuthManager.getRemainingAttempts();
    }
    
    // Update lockout timer
    let lockoutInterval;
    
    function showLockout() {
        loginError.classList.remove('show');
        loginLockout.classList.add('show');
        loginBtn.disabled = true;
        passwordInput.disabled = true;
        
        lockoutInterval = setInterval(() => {
            const remaining = AuthManager.getLockoutRemaining();
            if (remaining <= 0) {
                clearInterval(lockoutInterval);
                loginLockout.classList.remove('show');
                loginBtn.disabled = false;
                passwordInput.disabled = false;
                attemptsLeft.textContent = AuthManager.getRemainingAttempts();
            } else {
                const minutes = Math.floor(remaining / 60000);
                const seconds = Math.floor((remaining % 60000) / 1000);
                lockoutTimer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }
    
    // Handle form submit
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const password = passwordInput.value;
        if (!password) return;
        
        const result = AuthManager.authenticate(password);
        
        if (result.success) {
            loginOverlay.classList.add('hidden');
            passwordInput.value = '';
        } else if (result.locked) {
            showLockout();
        } else {
            loginError.classList.add('show');
            attemptsLeft.textContent = result.remaining;
            passwordInput.value = '';
            passwordInput.focus();
        }
    });
}

// ================================================
// MOBILE MENU
// ================================================
function initMobileMenu() {
    const toggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (!toggle || !sidebar) return;
    
    function openMenu() {
        toggle.classList.add('active');
        sidebar.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeMenu() {
        toggle.classList.remove('active');
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    toggle.addEventListener('click', () => {
        if (sidebar.classList.contains('open')) {
            closeMenu();
        } else {
            openMenu();
        }
    });
    
    overlay.addEventListener('click', closeMenu);
    
    // Close on nav item click (mobile)
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                closeMenu();
            }
        });
    });
    
    // Close on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('open')) {
            closeMenu();
        }
    });
}

// Settings Manager (same as effects.js)
class SettingsManager {
    constructor() {
        this.settings = this.loadSettings();
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
            projects: []
        };
    }
    
    loadSettings() {
        const saved = localStorage.getItem('unimaxSettings');
        if (saved) {
            try {
                return { ...this.getDefaultSettings(), ...JSON.parse(saved) };
            } catch (e) {
                console.warn('Failed to parse settings');
            }
        }
        return this.getDefaultSettings();
    }
    
    saveSettings() {
        localStorage.setItem('unimaxSettings', JSON.stringify(this.settings));
    }
    
    get(key) {
        return this.settings[key];
    }
    
    set(key, value) {
        this.settings[key] = value;
        this.saveSettings();
    }
}

// Initialize settings manager
const settings = new SettingsManager();

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initMobileMenu();
    initNavigation();
    initDashboard();
    initSeasons();
    initThemes();
    initBackgrounds();
    initFonts();
    initProjects();
});

/* ================================================
   NAVIGATION
   ================================================ */
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            switchSection(section);
        });
    });
}

function switchSection(sectionId) {
    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.section === sectionId);
    });
    
    // Update content
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.toggle('active', section.id === sectionId);
    });
    
    // Refresh data if needed
    if (sectionId === 'dashboard') initDashboard();
    if (sectionId === 'projects') renderProjects();
}

/* ================================================
   DASHBOARD
   ================================================ */
function initDashboard() {
    updateDashboardStats();
}

function updateDashboardStats() {
    const projects = settings.get('projects') || [];
    const currentSeason = settings.get('currentSeason') || 'default';
    
    // Update season display
    const seasonIcons = {
        default: '🌙',
        winter: '❄️',
        summer: '☀️',
        rainy: '🌧️',
        spring: '🌸'
    };
    
    document.getElementById('currentSeasonIcon').textContent = seasonIcons[currentSeason];
    document.getElementById('currentSeasonLabel').textContent = 
        currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1);
    
    // Update project counts
    document.getElementById('totalProjects').textContent = projects.length;
    document.getElementById('visibleProjects').textContent = 
        projects.filter(p => !p.hidden).length;
    document.getElementById('hiddenProjects').textContent = 
        projects.filter(p => p.hidden).length;
}

function previewSite() {
    window.open('index.html', '_blank');
}

/* ================================================
   SEASONS
   ================================================ */
function initSeasons() {
    const currentSeason = settings.get('currentSeason') || 'default';
    const autoSeason = settings.get('autoSeason');
    const intensity = settings.get('intensity') || 'medium';
    
    // Auto season toggle
    const autoToggle = document.getElementById('autoSeasonToggle');
    autoToggle.checked = autoSeason;
    autoToggle.addEventListener('change', (e) => {
        settings.set('autoSeason', e.target.checked);
        if (e.target.checked) {
            const detectedSeason = getSeasonFromDate();
            settings.set('currentSeason', detectedSeason);
            updateSeasonCards();
            updateDashboardStats();
        }
        showToast('Auto season ' + (e.target.checked ? 'enabled' : 'disabled'), 'success');
    });
    
    // Intensity buttons
    document.querySelectorAll('.intensity-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.intensity === intensity);
        btn.addEventListener('click', () => {
            document.querySelectorAll('.intensity-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            settings.set('intensity', btn.dataset.intensity);
            showToast(`Intensity set to ${btn.dataset.intensity}`, 'success');
        });
    });
    
    // Season cards
    document.querySelectorAll('.season-card').forEach(card => {
        card.addEventListener('click', () => {
            const season = card.dataset.season;
            settings.set('currentSeason', season);
            settings.set('autoSeason', false);
            document.getElementById('autoSeasonToggle').checked = false;
            updateSeasonCards();
            updateDashboardStats();
            showToast(`Season changed to ${season}`, 'success');
        });
    });
    
    updateSeasonCards();
}

function updateSeasonCards() {
    const currentSeason = settings.get('currentSeason');
    document.querySelectorAll('.season-card').forEach(card => {
        card.classList.toggle('active', card.dataset.season === currentSeason);
    });
}

function getSeasonFromDate() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'rainy';
    return 'winter';
}

/* ================================================
   THEMES
   ================================================ */
function initThemes() {
    const seasonSelect = document.getElementById('themeSeasonSelect');
    
    // Load initial theme
    loadThemeForSeason(seasonSelect.value);
    
    // Season select change
    seasonSelect.addEventListener('change', () => {
        loadThemeForSeason(seasonSelect.value);
    });
    
    // Color input sync
    const colorInputs = ['bgPrimary', 'bgSecondary', 'bgCard', 'accentPrimary', 'accentSecondary', 'textSecondary'];
    colorInputs.forEach(id => {
        const colorInput = document.getElementById(id);
        const textInput = document.getElementById(id + 'Text');
        
        colorInput.addEventListener('input', () => {
            textInput.value = colorInput.value;
            updateThemePreview();
        });
        
        textInput.addEventListener('input', () => {
            if (/^#[0-9A-Fa-f]{6}$/.test(textInput.value)) {
                colorInput.value = textInput.value;
                updateThemePreview();
            }
        });
    });
    
    // Save theme
    document.getElementById('saveTheme').addEventListener('click', saveCurrentTheme);
    
    // Reset theme
    document.getElementById('resetTheme').addEventListener('click', resetCurrentTheme);
    
    // Presets
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            applyPreset(btn.dataset.preset);
        });
    });
}

function loadThemeForSeason(season) {
    const themes = settings.get('themes');
    const theme = themes[season] || themes.default;
    
    document.getElementById('bgPrimary').value = theme.bgPrimary;
    document.getElementById('bgPrimaryText').value = theme.bgPrimary;
    document.getElementById('bgSecondary').value = theme.bgSecondary;
    document.getElementById('bgSecondaryText').value = theme.bgSecondary;
    document.getElementById('bgCard').value = theme.bgCard;
    document.getElementById('bgCardText').value = theme.bgCard;
    document.getElementById('accentPrimary').value = theme.accentPrimary;
    document.getElementById('accentPrimaryText').value = theme.accentPrimary;
    document.getElementById('accentSecondary').value = theme.accentSecondary;
    document.getElementById('accentSecondaryText').value = theme.accentSecondary;
    document.getElementById('textSecondary').value = theme.textSecondary;
    document.getElementById('textSecondaryText').value = theme.textSecondary;
    
    updateThemePreview();
}

function updateThemePreview() {
    const preview = document.getElementById('themePreviewCard');
    const bgCard = document.getElementById('bgCard').value;
    const accentPrimary = document.getElementById('accentPrimary').value;
    const textSecondary = document.getElementById('textSecondary').value;
    
    preview.style.background = bgCard;
    preview.querySelector('.preview-accent').style.background = accentPrimary;
    preview.querySelector('.preview-text').style.color = textSecondary;
}

function saveCurrentTheme() {
    const season = document.getElementById('themeSeasonSelect').value;
    const themes = settings.get('themes');
    
    themes[season] = {
        bgPrimary: document.getElementById('bgPrimary').value,
        bgSecondary: document.getElementById('bgSecondary').value,
        bgCard: document.getElementById('bgCard').value,
        accentPrimary: document.getElementById('accentPrimary').value,
        accentSecondary: document.getElementById('accentSecondary').value,
        textSecondary: document.getElementById('textSecondary').value
    };
    
    settings.set('themes', themes);
    showToast(`Theme saved for ${season}`, 'success');
}

function resetCurrentTheme() {
    const season = document.getElementById('themeSeasonSelect').value;
    const defaults = new SettingsManager().getDefaultSettings().themes[season];
    
    if (defaults) {
        const themes = settings.get('themes');
        themes[season] = defaults;
        settings.set('themes', themes);
        loadThemeForSeason(season);
        showToast('Theme reset to default', 'info');
    }
}

const presets = {
    cyberpunk: {
        bgPrimary: '#0d0015',
        bgSecondary: '#150020',
        bgCard: '#1a0030',
        accentPrimary: '#ff00ff',
        accentSecondary: '#00ffff',
        textSecondary: '#b388ff'
    },
    sunset: {
        bgPrimary: '#1a0a0a',
        bgSecondary: '#251010',
        bgCard: '#301515',
        accentPrimary: '#ff6b6b',
        accentSecondary: '#feca57',
        textSecondary: '#e0a0a0'
    },
    ocean: {
        bgPrimary: '#0a1015',
        bgSecondary: '#0f1520',
        bgCard: '#141a28',
        accentPrimary: '#0077b6',
        accentSecondary: '#00b4d8',
        textSecondary: '#90caf9'
    },
    forest: {
        bgPrimary: '#0a100a',
        bgSecondary: '#0f180f',
        bgCard: '#142014',
        accentPrimary: '#2d6a4f',
        accentSecondary: '#40916c',
        textSecondary: '#a5d6a7'
    },
    midnight: {
        bgPrimary: '#0a0a10',
        bgSecondary: '#101018',
        bgCard: '#181820',
        accentPrimary: '#4a4e69',
        accentSecondary: '#9a8c98',
        textSecondary: '#c9ada7'
    },
    neon: {
        bgPrimary: '#050505',
        bgSecondary: '#0a0a0a',
        bgCard: '#101010',
        accentPrimary: '#39ff14',
        accentSecondary: '#ff073a',
        textSecondary: '#cccccc'
    }
};

function applyPreset(presetName) {
    const preset = presets[presetName];
    if (!preset) return;
    
    document.getElementById('bgPrimary').value = preset.bgPrimary;
    document.getElementById('bgPrimaryText').value = preset.bgPrimary;
    document.getElementById('bgSecondary').value = preset.bgSecondary;
    document.getElementById('bgSecondaryText').value = preset.bgSecondary;
    document.getElementById('bgCard').value = preset.bgCard;
    document.getElementById('bgCardText').value = preset.bgCard;
    document.getElementById('accentPrimary').value = preset.accentPrimary;
    document.getElementById('accentPrimaryText').value = preset.accentPrimary;
    document.getElementById('accentSecondary').value = preset.accentSecondary;
    document.getElementById('accentSecondaryText').value = preset.accentSecondary;
    document.getElementById('textSecondary').value = preset.textSecondary;
    document.getElementById('textSecondaryText').value = preset.textSecondary;
    
    updateThemePreview();
    showToast(`Applied ${presetName} preset`, 'info');
}

/* ================================================
   BACKGROUND IMAGES
   ================================================ */
function initBackgrounds() {
    const bgInputs = {
        REELS: document.getElementById('bgReels'),
        DOCUMENTARY: document.getElementById('bgDocumentary'),
        GRAPHICS: document.getElementById('bgGraphics'),
        POSTERS: document.getElementById('bgPosters')
    };
    
    const bgPreviews = {
        REELS: document.getElementById('bgReelsPreview'),
        DOCUMENTARY: document.getElementById('bgDocumentaryPreview'),
        GRAPHICS: document.getElementById('bgGraphicsPreview'),
        POSTERS: document.getElementById('bgPostersPreview')
    };
    
    // Load saved backgrounds
    const savedBgs = settings.get('backgrounds') || {};
    
    Object.keys(bgInputs).forEach(key => {
        if (bgInputs[key] && savedBgs[key]) {
            bgInputs[key].value = savedBgs[key];
            updateBgPreview(key);
        }
        
        // Add input listener for live preview
        bgInputs[key]?.addEventListener('input', () => updateBgPreview(key));
    });
    
    function updateBgPreview(key) {
        const preview = bgPreviews[key];
        const url = bgInputs[key]?.value;
        if (preview) {
            if (url) {
                preview.style.backgroundImage = `url(${url})`;
                preview.textContent = '';
            } else {
                preview.style.backgroundImage = '';
                preview.textContent = '';
            }
        }
    }
    
    // Save button
    document.getElementById('saveBgImages')?.addEventListener('click', () => {
        const bgs = {};
        Object.keys(bgInputs).forEach(key => {
            bgs[key] = bgInputs[key]?.value || '';
        });
        settings.set('backgrounds', bgs);
        showToast('Background images saved!', 'success');
    });
    
    // Clear button
    document.getElementById('clearBgImages')?.addEventListener('click', () => {
        Object.keys(bgInputs).forEach(key => {
            if (bgInputs[key]) bgInputs[key].value = '';
            updateBgPreview(key);
        });
        settings.set('backgrounds', { REELS: '', DOCUMENTARY: '', GRAPHICS: '', POSTERS: '' });
        showToast('Background images cleared', 'info');
    });
}

/* ================================================
   FONT MANAGEMENT
   ================================================ */
function initFonts() {
    const primarySelect = document.getElementById('primaryFontSelect');
    const displaySelect = document.getElementById('displayFontSelect');
    const primaryPreview = document.getElementById('primaryFontPreview');
    const displayPreview = document.getElementById('displayFontPreview');
    
    if (!primarySelect || !displaySelect) return;
    
    // Load saved fonts
    const savedFonts = settings.get('fonts') || {};
    if (savedFonts.primaryName) {
        primarySelect.value = savedFonts.primaryName;
    }
    if (savedFonts.displayName) {
        displaySelect.value = savedFonts.displayName;
    }
    
    // Update previews
    updateFontPreview(primarySelect, primaryPreview);
    updateFontPreview(displaySelect, displayPreview);
    
    // Font select change handlers
    primarySelect.addEventListener('change', () => {
        updateFontPreview(primarySelect, primaryPreview);
    });
    
    displaySelect.addEventListener('change', () => {
        updateFontPreview(displaySelect, displayPreview);
    });
    
    // Save fonts
    document.getElementById('saveFonts')?.addEventListener('click', saveFonts);
    
    // Reset fonts
    document.getElementById('resetFonts')?.addEventListener('click', resetFonts);
}

function updateFontPreview(select, preview) {
    const fontName = select.value;
    preview.style.fontFamily = `'${fontName}', sans-serif`;
}

function saveFonts() {
    const primarySelect = document.getElementById('primaryFontSelect');
    const displaySelect = document.getElementById('displayFontSelect');
    
    const primaryOption = primarySelect.options[primarySelect.selectedIndex];
    const displayOption = displaySelect.options[displaySelect.selectedIndex];
    
    const fonts = {
        primaryName: primarySelect.value,
        displayName: displaySelect.value,
        primary: `'${primarySelect.value}', sans-serif`,
        display: `'${displaySelect.value}', sans-serif`,
        primaryUrl: primaryOption.dataset.url,
        displayUrl: displayOption.dataset.url
    };
    
    settings.set('fonts', fonts);
    showToast('Fonts saved! Refresh the main site to see changes.', 'success');
}

function resetFonts() {
    document.getElementById('primaryFontSelect').value = 'Space Grotesk';
    document.getElementById('displayFontSelect').value = 'Syne';
    
    updateFontPreview(
        document.getElementById('primaryFontSelect'),
        document.getElementById('primaryFontPreview')
    );
    updateFontPreview(
        document.getElementById('displayFontSelect'),
        document.getElementById('displayFontPreview')
    );
    
    // Clear saved fonts
    settings.set('fonts', null);
    showToast('Fonts reset to default', 'info');
}

/* ================================================
   PROJECTS
   ================================================ */
function initProjects() {
    // Add project button
    document.getElementById('addProjectBtn').addEventListener('click', openProjectModal);
    
    // Save project button
    document.getElementById('saveProjectBtn').addEventListener('click', saveProject);
    
    // Search
    document.getElementById('projectSearch').addEventListener('input', renderProjects);
    
    // Filter
    document.getElementById('projectFilter').addEventListener('change', renderProjects);
    
    // Initial render
    renderProjects();
}

function renderProjects() {
    const container = document.getElementById('projectsList');
    const emptyState = document.getElementById('emptyProjects');
    let projects = settings.get('projects') || [];
    
    // Apply search filter
    const searchTerm = document.getElementById('projectSearch').value.toLowerCase();
    if (searchTerm) {
        projects = projects.filter(p => 
            p.title.toLowerCase().includes(searchTerm) ||
            p.category.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply visibility filter
    const filter = document.getElementById('projectFilter').value;
    if (filter === 'visible') {
        projects = projects.filter(p => !p.hidden);
    } else if (filter === 'hidden') {
        projects = projects.filter(p => p.hidden);
    }
    
    // Clear container (except empty state)
    container.querySelectorAll('.project-item').forEach(el => el.remove());
    
    if (projects.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    projects.forEach((project, index) => {
        const item = createProjectItem(project, index);
        container.appendChild(item);
    });
    
    // Initialize drag and drop
    initDragAndDrop();
}

function createProjectItem(project, index) {
    const item = document.createElement('div');
    item.className = `project-item ${project.hidden ? 'hidden' : ''}`;
    item.dataset.id = project.id;
    item.draggable = true;
    
    const categoryLabels = {
        'MOTION': 'Motion Design',
        'VFX': 'Visual Effects',
        'EDIT': 'Cinematic Edit',
        '3D': '3D Animation',
        'MUSIC': 'Music Video',
        'PROMO': 'Brand Promo',
        'OTHER': 'Other'
    };
    
    item.innerHTML = `
        <div class="project-drag">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="5" r="1"></circle>
                <circle cx="9" cy="12" r="1"></circle>
                <circle cx="9" cy="19" r="1"></circle>
                <circle cx="15" cy="5" r="1"></circle>
                <circle cx="15" cy="12" r="1"></circle>
                <circle cx="15" cy="19" r="1"></circle>
            </svg>
        </div>
        <div class="project-thumb">
            ${project.thumbnail ? 
                `<img src="${project.thumbnail}" alt="${project.title}">` :
                project.videoUrl ? 
                `<video src="${project.videoUrl}" muted></video>` :
                ''
            }
        </div>
        <div class="project-info">
            <h4>${project.title}</h4>
            <p>${project.description || 'No description'}</p>
            <div class="project-meta">
                <span class="project-tag">${categoryLabels[project.category] || project.category}</span>
                <span class="project-tag">${project.resolution || '4K'}</span>
                <span class="project-tag">${project.fps || '60fps'}</span>
                <span class="project-tag">${project.year || '2024'}</span>
            </div>
        </div>
        <div class="project-actions">
            <button class="ghost-btn ${project.hidden ? 'active' : ''}" title="Toggle visibility" onclick="toggleProjectVisibility('${project.id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    ${project.hidden ? 
                        '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>' :
                        '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>'
                    }
                </svg>
            </button>
            <button title="Edit" onclick="editProject('${project.id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
            </button>
            <button class="delete-btn" title="Delete" onclick="deleteProject('${project.id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        </div>
    `;
    
    return item;
}

function openProjectModal(project = null) {
    const modal = document.getElementById('projectModal');
    const title = document.getElementById('modalTitle');
    
    if (project) {
        title.textContent = 'Edit Project';
        document.getElementById('projectId').value = project.id;
        document.getElementById('projectTitle').value = project.title || '';
        document.getElementById('projectCategory').value = project.category || '';
        document.getElementById('projectDesc').value = project.description || '';
        document.getElementById('projectResolution').value = project.resolution || '4K';
        document.getElementById('projectFps').value = project.fps || '60fps';
        document.getElementById('projectYear').value = project.year || new Date().getFullYear();
        document.getElementById('projectVideo').value = project.videoUrl || '';
        document.getElementById('projectThumbnail').value = project.thumbnail || '';
        document.getElementById('projectHidden').checked = project.hidden || false;
    } else {
        title.textContent = 'Add New Project';
        document.getElementById('projectId').value = '';
        document.getElementById('projectTitle').value = '';
        document.getElementById('projectCategory').value = '';
        document.getElementById('projectDesc').value = '';
        document.getElementById('projectResolution').value = '4K';
        document.getElementById('projectFps').value = '60fps';
        document.getElementById('projectYear').value = new Date().getFullYear();
        document.getElementById('projectVideo').value = '';
        document.getElementById('projectThumbnail').value = '';
        document.getElementById('projectHidden').checked = false;
    }
    
    modal.classList.add('active');
}

function closeProjectModal() {
    document.getElementById('projectModal').classList.remove('active');
}

function saveProject() {
    const id = document.getElementById('projectId').value;
    const title = document.getElementById('projectTitle').value.trim();
    const category = document.getElementById('projectCategory').value;
    
    if (!title) {
        showToast('Please enter a project title', 'error');
        return;
    }
    
    if (!category) {
        showToast('Please select a category', 'error');
        return;
    }
    
    const projectData = {
        title,
        category,
        description: document.getElementById('projectDesc').value.trim(),
        resolution: document.getElementById('projectResolution').value,
        fps: document.getElementById('projectFps').value,
        year: parseInt(document.getElementById('projectYear').value),
        videoUrl: document.getElementById('projectVideo').value.trim(),
        thumbnail: document.getElementById('projectThumbnail').value.trim(),
        hidden: document.getElementById('projectHidden').checked
    };
    
    const projects = settings.get('projects') || [];
    
    if (id) {
        // Update existing
        const index = projects.findIndex(p => p.id === id);
        if (index !== -1) {
            projects[index] = { ...projects[index], ...projectData };
            showToast('Project updated successfully', 'success');
        }
    } else {
        // Add new
        projectData.id = Date.now().toString();
        projectData.createdAt = new Date().toISOString();
        projects.push(projectData);
        showToast('Project added successfully', 'success');
    }
    
    settings.set('projects', projects);
    closeProjectModal();
    renderProjects();
    updateDashboardStats();
}

function editProject(id) {
    const projects = settings.get('projects') || [];
    const project = projects.find(p => p.id === id);
    if (project) {
        openProjectModal(project);
    }
}

function deleteProject(id) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    let projects = settings.get('projects') || [];
    projects = projects.filter(p => p.id !== id);
    settings.set('projects', projects);
    
    showToast('Project deleted', 'warning');
    renderProjects();
    updateDashboardStats();
}

function toggleProjectVisibility(id) {
    const projects = settings.get('projects') || [];
    const project = projects.find(p => p.id === id);
    
    if (project) {
        project.hidden = !project.hidden;
        settings.set('projects', projects);
        showToast(project.hidden ? 'Project hidden (ghost mode)' : 'Project visible', 'info');
        renderProjects();
        updateDashboardStats();
    }
}

/* ================================================
   DRAG AND DROP
   ================================================ */
function initDragAndDrop() {
    const items = document.querySelectorAll('.project-item');
    let draggedItem = null;
    
    items.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            draggedItem = item;
            item.style.opacity = '0.5';
        });
        
        item.addEventListener('dragend', () => {
            item.style.opacity = '1';
            draggedItem = null;
        });
        
        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (draggedItem && draggedItem !== item) {
                const rect = item.getBoundingClientRect();
                const midY = rect.top + rect.height / 2;
                
                if (e.clientY < midY) {
                    item.parentNode.insertBefore(draggedItem, item);
                } else {
                    item.parentNode.insertBefore(draggedItem, item.nextSibling);
                }
            }
        });
        
        item.addEventListener('drop', () => {
            saveProjectOrder();
        });
    });
}

function saveProjectOrder() {
    const items = document.querySelectorAll('.project-item');
    const orderedIds = Array.from(items).map(item => item.dataset.id);
    
    const projects = settings.get('projects') || [];
    const projectMap = {};
    projects.forEach(p => projectMap[p.id] = p);
    
    const reordered = orderedIds.map(id => projectMap[id]).filter(Boolean);
    settings.set('projects', reordered);
}

/* ================================================
   TOAST NOTIFICATIONS
   ================================================ */
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Close modal on overlay click
document.getElementById('projectModal').addEventListener('click', (e) => {
    if (e.target.id === 'projectModal') {
        closeProjectModal();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeProjectModal();
    }
});
