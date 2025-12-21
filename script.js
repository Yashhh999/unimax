/* ================================================
   UNIMAX STUDIOS - Interactive JavaScript
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    initCustomCursor();
    initPageNavigation();
    initProjectCards();
    initScrollAnimations();
    initStatsCounter();
    initMagneticElements();
    initFloatingName();
    initFooterGlow();
    initTextScramble();
});

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
    
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let followerX = 0, followerY = 0;
    let rafId = null;
    
    // Mouse move handler
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }, { passive: true });
    
    // Smooth cursor animation
    function animateCursor() {
        // Cursor follows immediately
        cursorX += (mouseX - cursorX) * 0.25;
        cursorY += (mouseY - cursorY) * 0.25;
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        
        // Follower follows with delay
        followerX += (mouseX - followerX) * 0.12;
        followerY += (mouseY - followerY) * 0.12;
        follower.style.left = followerX + 'px';
        follower.style.top = followerY + 'px';
        
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
    const pages = document.querySelectorAll('.page');
    const indicators = document.querySelectorAll('.indicator');
    const backToTop = document.getElementById('backToTop');
    let currentPage = 1;
    let isScrolling = false;
    
    // Update active page
    function setActivePage(pageNum) {
        if (pageNum < 1 || pageNum > pages.length || pageNum === currentPage) return;
        
        currentPage = pageNum;
        
        pages.forEach((page, index) => {
            if (index + 1 === pageNum) {
                page.classList.add('active');
            } else {
                page.classList.remove('active');
            }
        });
        
        indicators.forEach((ind, index) => {
            if (index + 1 === pageNum) {
                ind.classList.add('active');
            } else {
                ind.classList.remove('active');
            }
        });
        
        // Scroll to page
        const targetPage = document.getElementById(`page${pageNum}`);
        if (targetPage) {
            targetPage.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    // Indicator click
    indicators.forEach(ind => {
        ind.addEventListener('click', () => {
            const pageNum = parseInt(ind.dataset.page);
            setActivePage(pageNum);
        });
    });
    
    // Wheel navigation
    window.addEventListener('wheel', (e) => {
        if (isScrolling) return;
        
        const delta = e.deltaY;
        
        if (delta > 50 && currentPage < pages.length) {
            isScrolling = true;
            setActivePage(currentPage + 1);
            setTimeout(() => isScrolling = false, 1000);
        } else if (delta < -50 && currentPage > 1) {
            isScrolling = true;
            setActivePage(currentPage - 1);
            setTimeout(() => isScrolling = false, 1000);
        }
    }, { passive: true });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
            e.preventDefault();
            setActivePage(currentPage + 1);
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            e.preventDefault();
            setActivePage(currentPage - 1);
        }
    });
    
    // Back to top button
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            setActivePage(1);
        });
    }
    
    // Touch support
    let touchStartY = 0;
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
        const touchEndY = e.changedTouches[0].clientY;
        const diff = touchStartY - touchEndY;
        
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                setActivePage(currentPage + 1);
            } else {
                setActivePage(currentPage - 1);
            }
        }
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
        
        let bounds;
        let isHovering = false;
        
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
