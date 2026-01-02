/* ================================================
   UNIMAX STUDIOS - Interactive JavaScript
   ================================================ */

// Category definitions
const CATEGORIES = [
    { id: 'REELS', label: 'Reels', icon: '🎬' },
    { id: 'DOCUMENTARY', label: 'Documentary', icon: '🎥' },
    { id: 'GRAPHICS', label: 'Graphics Design', icon: '🎨' },
    { id: 'POSTERS', label: 'Posters', icon: '🖼️' }
];

const ITEMS_PER_CATEGORY = 3;

// Default projects for fallback (distributed across categories)
const defaultProjects = [
    {
        id: 'default-1',
        title: 'Behind the Lens',
        category: 'DOCUMENTARY',
        description: 'Award-winning short documentary',
        resolution: '4K',
        fps: '24fps',
        year: 2024,
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4'
    },
    {
        id: 'default-2',
        title: 'Product Launch',
        category: 'REELS',
        description: 'Social media campaign reel',
        resolution: '1080p',
        fps: '30fps',
        year: 2024,
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-ink-swirling-in-water-134-large.mp4'
    },
    {
        id: 'default-3',
        title: 'Brand Identity',
        category: 'GRAPHICS',
        description: 'Complete visual identity package',
        resolution: '4K',
        fps: '60fps',
        year: 2024,
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-purple-and-golden-lights-1234-large.mp4'
    },
    {
        id: 'default-4',
        title: 'Event Highlights',
        category: 'REELS',
        description: 'Corporate event coverage',
        resolution: '4K',
        fps: '60fps',
        year: 2024,
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-going-down-a-curved-highway-down-702-large.mp4'
    },
    {
        id: 'default-5',
        title: 'Nature Series',
        category: 'DOCUMENTARY',
        description: 'Wildlife exploration episode',
        resolution: '4K',
        fps: '24fps',
        year: 2024,
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-night-sky-with-stars-at-a-calm-lake-21464-large.mp4'
    },
    {
        id: 'default-6',
        title: 'Album Art',
        category: 'POSTERS',
        description: 'Music album cover design',
        resolution: '4K',
        fps: '60fps',
        year: 2024,
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4'
    },
    {
        id: 'default-7',
        title: 'Logo Animation',
        category: 'GRAPHICS',
        description: 'Animated brand reveal',
        resolution: '4K',
        fps: '60fps',
        year: 2024,
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-flowing-colorful-fluid-4007-large.mp4'
    },
    {
        id: 'default-8',
        title: 'Movie Poster',
        category: 'POSTERS',
        description: 'Film promotional artwork',
        resolution: '4K',
        fps: '60fps',
        year: 2024,
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-11-large.mp4'
    }
];

// Category labels mapping
const categoryLabels = {
    'REELS': 'REELS',
    'DOCUMENTARY': 'DOCUMENTARY',
    'GRAPHICS': 'GRAPHICS DESIGN',
    'POSTERS': 'POSTERS'
};

document.addEventListener('DOMContentLoaded', () => {
    // Hide loader
    hideLoader();
    
    // Load fonts from settings
    loadFonts();
    
    // Initialize all modules
    loadProjectsByCategory();
    initCategoryNavbar();
    initCategoryIndicator();
    initCategoryModal();
    initVideoModal();
    initCustomCursor();
    initPageNavigation();
    initScrollAnimations();
    initStatsCounter();
    initMagneticElements();
    initFloatingName();
    initFooterGlow();
});

/* ================================================
   LOADER
   ================================================ */
function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        // Wait for logo and bar to fully appear, then hold for ~2.5s before fading
        setTimeout(() => {
            loader.classList.add('hidden');
            document.body.classList.add('loaded');
            setTimeout(() => {
                loader.style.display = 'none';
            }, 2000);
        }, 3000);
    }
}

/* ================================================
   FONT LOADING
   ================================================ */
function loadFonts() {
    try {
        const settings = JSON.parse(localStorage.getItem('unimaxSettings') || '{}');
        if (settings.fonts) {
            const fontLink = document.getElementById('dynamicFonts');
            if (fontLink && settings.fonts.primaryUrl && settings.fonts.displayUrl) {
                fontLink.href = `https://fonts.googleapis.com/css2?family=${settings.fonts.primaryUrl}&family=${settings.fonts.displayUrl}&display=swap`;
            }
            
            // Apply fonts to CSS variables
            if (settings.fonts.primary) {
                document.documentElement.style.setProperty('--font-primary', settings.fonts.primary);
            }
            if (settings.fonts.display) {
                document.documentElement.style.setProperty('--font-display', settings.fonts.display);
            }
        }
    } catch (e) {
        console.warn('Could not load font settings');
    }
}

/* ================================================
   FLOATING ISLAND NAVBAR
   ================================================ */
function initCategoryNavbar() {
    const island = document.getElementById('floatingIsland');
    const islandLinks = island?.querySelectorAll('.island-link');
    const floatingName = document.querySelector('.floating-name');
    
    if (!island) return;
    
    // Show island after scrolling past logo, hide floating name
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        
        if (scrollY > 150) {
            island.classList.add('visible');
            floatingName?.classList.add('hidden');
        } else {
            island.classList.remove('visible');
            floatingName?.classList.remove('hidden');
        }
    }, { passive: true });
    
    // Smooth scroll to category
    islandLinks?.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = link.dataset.category;
            const section = document.getElementById(category);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
    
    // Update active link on scroll
    const categoryObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const category = entry.target.dataset.category;
                updateActiveNav(category);
            }
        });
    }, { threshold: 0.3, rootMargin: '-100px 0px -50% 0px' });
    
    document.querySelectorAll('.category-section').forEach(section => {
        categoryObserver.observe(section);
    });
}

function updateActiveNav(category) {
    // Update floating island
    document.querySelectorAll('.island-link').forEach(link => {
        link.classList.toggle('active', link.dataset.category === category);
    });
    
    // Update side indicator category dots
    document.querySelectorAll('.indicator-dot.cat-dot').forEach(dot => {
        dot.classList.toggle('active', dot.dataset.category === category);
    });
}

/* ================================================
   UNIFIED SIDE INDICATOR
   ================================================ */
function initCategoryIndicator() {
    const indicator = document.getElementById('sideIndicator');
    if (!indicator) return;
    
    // Only show on desktop
    if (window.innerWidth < 768) {
        indicator.style.display = 'none';
        return;
    }
    
    // Show after scrolling
    window.addEventListener('scroll', () => {
        if (window.scrollY > 150) {
            indicator.classList.add('visible');
        } else {
            indicator.classList.remove('visible');
        }
    }, { passive: true });
    
    // Click handlers for category dots
    indicator.querySelectorAll('.indicator-dot.cat-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            const category = dot.dataset.category;
            const section = document.getElementById(category);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
    
    // Click handlers for main page dots
    indicator.querySelectorAll('.indicator-dot.main-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            const page = dot.dataset.page;
            const section = document.getElementById(`page${page}`);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

/* ================================================
   DYNAMIC PROJECTS LOADING BY CATEGORY
   ================================================ */
async function loadProjectsByCategory() {
    // Try to fetch from API first, fallback to localStorage
    let projects = [];
    let backgrounds = {};
    let settings = {};
    
    try {
        // Try API first
        const response = await fetch('/api/projects');
        if (response.ok) {
            projects = await response.json();
        }
        
        const settingsResponse = await fetch('/api/settings');
        if (settingsResponse.ok) {
            settings = await settingsResponse.json();
            backgrounds = settings.backgrounds || {};
        }
    } catch (e) {
        console.warn('API not available, falling back to localStorage');
    }
    
    // Fallback to localStorage if API didn't return projects
    if (projects.length === 0) {
        try {
            const localSettings = JSON.parse(localStorage.getItem('unimaxSettings') || '{}');
            projects = (localSettings.projects || []).filter(p => !p.hidden);
            backgrounds = localSettings.backgrounds || {};
        } catch (e) {
            console.warn('Could not load projects from storage');
        }
    }
    
    // Use default projects if none found
    if (projects.length === 0) {
        projects = defaultProjects;
    }
    
    // Group projects by category
    const projectsByCategory = {};
    CATEGORIES.forEach(cat => {
        projectsByCategory[cat.id] = projects.filter(p => p.category === cat.id);
    });
    
    // Render each category
    CATEGORIES.forEach(cat => {
        const categoryProjects = projectsByCategory[cat.id] || [];
        const section = document.getElementById(cat.id);
        const grid = section?.querySelector('.category-grid');
        const countEl = section?.querySelector('.category-count');
        const seeMoreBtn = section?.querySelector('.see-more-btn');
        
        if (!section || !grid) return;
        
        // Apply background image if set
        if (backgrounds[cat.id]) {
            section.style.backgroundImage = `linear-gradient(rgba(10,10,11,0.85), rgba(10,10,11,0.95)), url(${backgrounds[cat.id]})`;
            section.style.backgroundSize = 'cover';
            section.style.backgroundPosition = 'center';
            section.style.borderRadius = '20px';
            section.style.padding = '40px';
            section.style.marginBottom = '20px';
        } else {
            section.style.backgroundImage = '';
            section.style.padding = '';
            section.style.marginBottom = '';
        }
        
        // Update count
        if (countEl) {
            countEl.textContent = `${categoryProjects.length} project${categoryProjects.length !== 1 ? 's' : ''}`;
        }
        
        // Hide empty categories
        if (categoryProjects.length === 0) {
            section.classList.add('empty');
            return;
        }
        
        section.classList.remove('empty');
        
        // Clear grid
        grid.innerHTML = '';
        
        // Show only first 3 items
        const visibleProjects = categoryProjects.slice(0, ITEMS_PER_CATEGORY);
        const hasMore = categoryProjects.length > ITEMS_PER_CATEGORY;
        
        // Render visible projects
        visibleProjects.forEach((project, index) => {
            const card = createProjectCard(project, index + 1);
            grid.appendChild(card);
        });
        
        // Show/hide see more button
        if (seeMoreBtn) {
            seeMoreBtn.style.display = hasMore ? 'flex' : 'none';
            
            // Handle see more click - open modal
            seeMoreBtn.onclick = () => {
                openCategoryModal(cat.id, cat.label, cat.icon, categoryProjects);
            };
        }
    });
    
    // Initialize card interactions
    setTimeout(() => {
        initProjectCards();
        initTextScramble();
    }, 100);
}

// Keep old function for backwards compatibility
function loadProjects() {
    loadProjectsByCategory();
}

/* ================================================
   CATEGORY MODAL (See More)
   ================================================ */
function initCategoryModal() {
    const modal = document.getElementById('categoryModal');
    const closeBtn = document.getElementById('closeModal');
    const backdrop = modal?.querySelector('.modal-backdrop');
    
    if (!modal) return;
    
    // Close handlers
    closeBtn?.addEventListener('click', closeCategoryModal);
    backdrop?.addEventListener('click', closeCategoryModal);
    
    // Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeCategoryModal();
        }
    });
}

function openCategoryModal(categoryId, categoryLabel, categoryIcon, projects) {
    const modal = document.getElementById('categoryModal');
    const modalIcon = document.getElementById('modalIcon');
    const modalTitle = document.getElementById('modalTitle');
    const modalCount = document.getElementById('modalCount');
    const modalGrid = document.getElementById('modalGrid');
    
    if (!modal) return;
    
    // Set header info
    modalIcon.textContent = categoryIcon;
    modalTitle.textContent = categoryLabel;
    modalCount.textContent = `${projects.length} project${projects.length !== 1 ? 's' : ''}`;
    
    // Clear and populate grid
    modalGrid.innerHTML = '';
    projects.forEach((project, index) => {
        const card = createProjectCard(project, index + 1);
        modalGrid.appendChild(card);
    });
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Initialize card interactions
    setTimeout(() => {
        initModalCards();
    }, 100);
}

function closeCategoryModal() {
    const modal = document.getElementById('categoryModal');
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Pause any playing videos
    modal.querySelectorAll('video').forEach(v => {
        v.pause();
        v.currentTime = 0;
    });
}

function initModalCards() {
    const modalGrid = document.getElementById('modalGrid');
    if (!modalGrid) return;
    
    modalGrid.querySelectorAll('.project-card').forEach(card => {
        const video = card.querySelector('video');
        const playIcon = card.querySelector('.play-icon');
        const playBtn = card.querySelector('.play-btn');
        
        // Hover effects
        card.addEventListener('mouseenter', () => {
            video?.play().catch(() => {});
        });
        
        card.addEventListener('mouseleave', () => {
            if (video) {
                video.pause();
                video.currentTime = 0;
            }
        });
        
        // Play button click - opens video modal
        playBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            const videoUrl = card.dataset.videoUrl;
            const title = card.dataset.title;
            const desc = card.dataset.description;
            if (videoUrl) {
                openVideoModal(videoUrl, title, desc);
            }
        });
        
        // Play icon click - also opens video modal
        playIcon?.addEventListener('click', (e) => {
            e.stopPropagation();
            const videoUrl = card.dataset.videoUrl;
            const title = card.dataset.title;
            const desc = card.dataset.description;
            if (videoUrl) {
                openVideoModal(videoUrl, title, desc);
            }
        });
    });
}

/* ================================================
   VIDEO PLAYER MODAL
   ================================================ */
function initVideoModal() {
    const modal = document.getElementById('videoModal');
    const closeBtn = document.getElementById('closeVideoModal');
    const backdrop = modal?.querySelector('.video-modal-backdrop');
    
    if (!modal) return;
    
    // Close handlers
    closeBtn?.addEventListener('click', closeVideoModal);
    backdrop?.addEventListener('click', closeVideoModal);
    
    // Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeVideoModal();
        }
    });
}

function openVideoModal(videoUrl, title, description) {
    const modal = document.getElementById('videoModal');
    const video = document.getElementById('modalVideo');
    const titleEl = document.getElementById('videoModalTitle');
    const descEl = document.getElementById('videoModalDesc');
    
    if (!modal || !video) return;
    
    // Set video source
    video.src = videoUrl;
    titleEl.textContent = title;
    descEl.textContent = description;
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Play video
    video.play().catch(() => {});
}

function closeVideoModal() {
    const modal = document.getElementById('videoModal');
    const video = document.getElementById('modalVideo');
    
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Stop video
    if (video) {
        video.pause();
        video.src = '';
    }
}

function createProjectCard(project, number) {
    const article = document.createElement('article');
    article.className = 'project-card';
    article.dataset.category = project.category;
    article.dataset.videoUrl = project.videoUrl || '';
    article.dataset.title = project.title || '';
    article.dataset.description = project.description || '';
    
    const categoryLabel = categoryLabels[project.category] || project.category;
    const numStr = String(number).padStart(2, '0');
    const hasVideo = project.videoUrl && project.videoUrl.trim() !== '';
    
    article.innerHTML = `
        <div class="card-glow"></div>
        <div class="card-inner">
            <div class="video-container">
                ${hasVideo ? `
                <video 
                    src="${project.videoUrl}" 
                    muted 
                    loop 
                    playsinline 
                    preload="metadata"
                    loading="lazy"
                ></video>
                ` : `<div class="video-placeholder"></div>`}
                <div class="video-overlay"></div>
                ${hasVideo ? `
                <button class="play-btn" title="Play Video">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M8 5.14v14.72a1 1 0 001.5.86l11.25-7.36a1 1 0 000-1.72L9.5 4.28a1 1 0 00-1.5.86z" fill="currentColor"/>
                    </svg>
                </button>
                ` : ''}
                <div class="play-icon">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M8 5.14v14.72a1 1 0 001.5.86l11.25-7.36a1 1 0 000-1.72L9.5 4.28a1 1 0 00-1.5.86z" fill="currentColor"/>
                    </svg>
                </div>
            </div>
            <div class="card-content">
                <span class="card-category">${categoryLabel}</span>
                <h3 class="card-title">${project.title}</h3>
                <p class="card-desc">${project.description || ''}</p>
                <div class="card-meta">
                    <span class="meta-item">${project.resolution || '4K'}</span>
                    <span class="meta-item">${project.fps || '60fps'}</span>
                    <span class="meta-item">${project.year || new Date().getFullYear()}</span>
                </div>
            </div>
            <div class="card-number">${numStr}</div>
        </div>
    `;
    
    return article;
}

/* ================================================
   TEXT SCRAMBLE EFFECT
   ================================================ */
function initTextScramble() {
    const chars = '!<>-_\\/[]{}—=+*^?#________';
    
    document.querySelectorAll('.card-title').forEach(title => {
        const originalText = title.textContent;
        let interval = null;
        
        title.addEventListener('mouseenter', () => {
            let iteration = 0;
            clearInterval(interval);
            
            interval = setInterval(() => {
                title.textContent = originalText
                    .split('')
                    .map((char, index) => {
                        if (index < iteration) {
                            return originalText[index];
                        }
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join('');
                
                if (iteration >= originalText.length) {
                    clearInterval(interval);
                }
                
                iteration += 1/2;
            }, 30);
        });
        
        title.addEventListener('mouseleave', () => {
            clearInterval(interval);
            title.textContent = originalText;
        });
    });
}

/* ================================================
   CUSTOM CURSOR
   ================================================ */
function initCustomCursor() {
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');
    
    if (!cursor || !follower) return;
    
    // Check if touch device
    if ('ontouchstart' in window) {
        cursor.style.display = 'none';
        follower.style.display = 'none';
        return;
    }
    
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let followerX = 0, followerY = 0;
    let rafId = null;
    
    // Mouse move handler - throttled
    let ticking = false;
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }, { passive: true });
    
    // Smooth cursor animation
    function animateCursor() {
        // Cursor follows immediately
        cursorX += (mouseX - cursorX) * 0.25;
        cursorY += (mouseY - cursorY) * 0.25;
        cursor.style.transform = `translate(${cursorX - 6}px, ${cursorY - 6}px)`;
        
        // Follower follows with delay
        followerX += (mouseX - followerX) * 0.12;
        followerY += (mouseY - followerY) * 0.12;
        follower.style.transform = `translate(${followerX - 20}px, ${followerY - 20}px)`;
        
        rafId = requestAnimationFrame(animateCursor);
    }
    animateCursor();
    
    // Interactive elements hover
    const hoverElements = document.querySelectorAll('a, button, .indicator, .name-char');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
            follower.classList.add('hover');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
            follower.classList.remove('hover');
        });
    });
    
    // Project cards special cursor
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            cursor.classList.add('card-hover');
            follower.classList.add('card-hover');
        });
        card.addEventListener('mouseleave', () => {
            cursor.classList.remove('card-hover');
            follower.classList.remove('card-hover');
        });
    });
}

/* ================================================
   PAGE NAVIGATION
   ================================================ */
function initPageNavigation() {
    const backToTop = document.getElementById('backToTop');
    
    // Track which page section is visible
    const pageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const pageId = entry.target.id;
                const pageNum = pageId === 'page1' ? '1' : '2';
                
                // Update main page dots
                document.querySelectorAll('.indicator-dot.main-dot').forEach(dot => {
                    dot.classList.toggle('active', dot.dataset.page === pageNum);
                });
            }
        });
    }, { threshold: 0.3 });
    
    document.querySelectorAll('.page').forEach(page => {
        pageObserver.observe(page);
    });
    
    // Back to top button
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            document.getElementById('page1')?.scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    // Touch support for mobile - smooth scroll to next/prev section
    let touchStartY = 0;
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
        // Touch navigation removed - allow natural scrolling
    }, { passive: true });
}

/* ================================================
   PROJECT CARDS
   ================================================ */
function initProjectCards() {
    const cards = document.querySelectorAll('.project-card');
    
    cards.forEach(card => {
        const video = card.querySelector('video');
        const glow = card.querySelector('.card-glow');
        const cardInner = card.querySelector('.card-inner');
        const playBtn = card.querySelector('.play-btn');
        
        let bounds;
        let isHovering = false;
        
        // Play button click - open video modal
        if (playBtn) {
            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const videoUrl = card.dataset.videoUrl;
                const title = card.dataset.title;
                const description = card.dataset.description;
                if (videoUrl) {
                    openVideoModal(videoUrl, title, description);
                }
            });
        }
        
        // Play video on hover
        card.addEventListener('mouseenter', (e) => {
            isHovering = true;
            bounds = card.getBoundingClientRect();
            if (video) {
                video.play().catch(() => {});
            }
            card.style.transition = 'transform 0.15s ease-out';
        });
        
        card.addEventListener('mouseleave', () => {
            isHovering = false;
            if (video) {
                video.pause();
                video.currentTime = 0;
            }
            // Smooth return
            card.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            if (cardInner) {
                cardInner.style.transform = 'translateX(0) translateY(0)';
            }
        });
        
        // Push-back tilt effect - card pushes away from cursor
        card.addEventListener('mousemove', (e) => {
            if (!isHovering) return;
            
            const mouseX = e.clientX - bounds.left;
            const mouseY = e.clientY - bounds.top;
            
            const centerX = bounds.width / 2;
            const centerY = bounds.height / 2;
            
            // Calculate rotation - push AWAY from cursor
            const rotateX = ((mouseY - centerY) / centerY) * -12;
            const rotateY = ((mouseX - centerX) / centerX) * 12;
            
            // Subtle translate for depth
            const translateX = ((mouseX - centerX) / centerX) * -5;
            const translateY = ((mouseY - centerY) / centerY) * -5;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            
            if (cardInner) {
                cardInner.style.transition = 'transform 0.1s ease-out';
                cardInner.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`;
            }
            
            // Move glow with cursor
            if (glow) {
                const glowX = (mouseX / bounds.width) * 100;
                const glowY = (mouseY / bounds.height) * 100;
                glow.style.background = `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(139, 92, 246, 0.5) 0%, rgba(6, 182, 212, 0.25) 40%, transparent 70%)`;
                glow.style.opacity = '0.8';
            }
        });
    });
}

/* ================================================
   SCROLL ANIMATIONS
   ================================================ */
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });
}

/* ================================================
   STATS COUNTER
   ================================================ */
function initStatsCounter() {
    const stats = document.querySelectorAll('.stat-number');
    let hasAnimated = false;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated) {
                hasAnimated = true;
                animateStats();
            }
        });
    }, { threshold: 0.5 });
    
    stats.forEach(stat => observer.observe(stat));
    
    function animateStats() {
        stats.forEach(stat => {
            const target = parseInt(stat.dataset.count);
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    stat.textContent = target;
                    clearInterval(timer);
                } else {
                    stat.textContent = Math.floor(current);
                }
            }, 16);
        });
    }
}

/* ================================================
   MAGNETIC ELEMENTS
   ================================================ */
function initMagneticElements() {
    const magneticEls = document.querySelectorAll('.magnetic');
    
    magneticEls.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'translate(0, 0)';
        });
    });
}

/* ================================================
   FLOATING NAME ANIMATION
   ================================================ */
function initFloatingName() {
    const chars = document.querySelectorAll('.name-char');
    
    chars.forEach((char, index) => {
        // Subtle floating animation
        const randomDelay = Math.random() * 2;
        const randomDuration = 3 + Math.random() * 2;
        
        char.style.animation = `
            charReveal 0.6s ${0.1 + index * 0.05}s var(--transition-smooth) forwards,
            float ${randomDuration}s ${randomDelay}s ease-in-out infinite
        `;
    });
    
    // Add float keyframes dynamically
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
        }
    `;
    document.head.appendChild(style);
}

/* ================================================
   PARALLAX EFFECT (BONUS)
   ================================================ */
function initParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        
        parallaxElements.forEach(el => {
            const speed = parseFloat(el.dataset.parallax) || 0.5;
            el.style.transform = `translateY(${scrollY * speed}px)`;
        });
    });
}

/* ================================================
   LOADING ANIMATION
   ================================================ */
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    
    // Minimum display time for loader
    setTimeout(() => {
        if (loader) {
            loader.classList.add('hidden');
        }
        document.body.classList.add('loaded');
        
        // Trigger initial animations
        setTimeout(() => {
            document.querySelectorAll('.project-card').forEach((card, index) => {
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 100);
            });
        }, 200);
    }, 800);
});

/* ================================================
   SMOOTH SCROLL POLYFILL
   ================================================ */
if (!('scrollBehavior' in document.documentElement.style)) {
    const smoothScroll = (target) => {
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = 1000;
        let start = null;
        
        function animation(currentTime) {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const run = ease(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }
        
        function ease(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }
        
        requestAnimationFrame(animation);
    };
}

/* ================================================
   FOOTER GLOW EFFECT
   ================================================ */
function initFooterGlow() {
    const footer = document.querySelector('.contact-footer');
    const glow = document.querySelector('.footer-glow');
    
    if (!footer || !glow) return;
    
    let ticking = false;
    
    footer.addEventListener('mousemove', (e) => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const rect = footer.getBoundingClientRect();
                const x = e.clientX - rect.left;
                glow.style.left = x + 'px';
                ticking = false;
            });
            ticking = true;
        }
    });
    
    footer.addEventListener('mouseleave', () => {
        glow.style.left = '50%';
    });
}

/* ================================================
   PRELOAD VIDEOS
   ================================================ */
document.querySelectorAll('.project-card video').forEach(video => {
    video.preload = 'metadata';
});

/* ================================================
   EASTER EGG: KONAMI CODE
   ================================================ */
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
        document.body.style.animation = 'rainbow 2s linear infinite';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 5000);
    }
});

// Add rainbow keyframes
const rainbowStyle = document.createElement('style');
rainbowStyle.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
`;
document.head.appendChild(rainbowStyle);
