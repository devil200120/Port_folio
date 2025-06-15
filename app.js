// Advanced Portfolio JavaScript with Enhanced Particle System and Animations
class AdvancedPortfolio {
    constructor() {
        this.particles = [];
        this.mouse = { x: 0, y: 0 };
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.lastTime = 0;
        this.fps = 60;
        this.fpsInterval = 1000 / this.fps;
        
        this.init();
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupComponents();
            });
        } else {
            this.setupComponents();
        }
    }

    setupComponents() {
        this.setupCanvas();
        this.setupEventListeners();
        this.setupScrollAnimations();
        this.setupNavigation();
        this.startAnimations();
        
        if (!this.isReducedMotion) {
            this.createParticles();
            this.startParticleAnimation();
        }
        
        // Initialize other components
        this.monitorPerformance();
    }

    // Enhanced Particle System Setup
    setupCanvas() {
        this.canvas = document.getElementById('particleCanvas');
        if (!this.canvas) {
            console.error('Particle canvas not found');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        // Set initial canvas style
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.zIndex = '0';
        this.canvas.style.pointerEvents = 'none';
    }

    resizeCanvas() {
        if (!this.canvas) return;
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Recreate particles on resize
        if (this.particles.length > 0) {
            this.createParticles();
        }
    }

    createParticles() {
        const particleCount = window.innerWidth < 768 ? 80 : 150;
        this.particles = [];

        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 1.5,
                speedY: (Math.random() - 0.5) * 1.5,
                opacity: Math.random() * 0.6 + 0.2,
                color: this.getRandomColor(),
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 0.02 + 0.01,
                originalSize: 0
            });
            this.particles[i].originalSize = this.particles[i].size;
        }
    }

    getRandomColor() {
        const colors = [
            { r: 88, g: 135, b: 255 },   // Electric Blue
            { r: 81, g: 226, b: 245 },   // Electric Blue Light
            { r: 113, g: 90, b: 255 },   // Vibrant Purple
            { r: 166, g: 130, b: 255 },  // Vibrant Purple Light
            { r: 255, g: 71, b: 164 }    // Neon Pink
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    updateParticles() {
        if (!this.canvas || !this.particles) return;

        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.speedX;
            particle.y += particle.speedY;

            // Bounce off edges with buffer
            if (particle.x < -10 || particle.x > this.canvas.width + 10) {
                particle.speedX *= -1;
                particle.x = Math.max(-10, Math.min(this.canvas.width + 10, particle.x));
            }
            if (particle.y < -10 || particle.y > this.canvas.height + 10) {
                particle.speedY *= -1;
                particle.y = Math.max(-10, Math.min(this.canvas.height + 10, particle.y));
            }

            // Update pulse for size variation
            particle.pulse += particle.pulseSpeed;
            particle.size = particle.originalSize + Math.sin(particle.pulse) * 0.5;

            // Mouse interaction
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 120) {
                const force = (120 - distance) / 120;
                const angle = Math.atan2(dy, dx);
                particle.x -= Math.cos(angle) * force * 2;
                particle.y -= Math.sin(angle) * force * 2;
            }
        });
    }

    drawParticles() {
        if (!this.ctx || !this.canvas) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw connections first
        this.drawConnections();
        
        // Then draw particles
        this.particles.forEach(particle => {
            this.drawParticle(particle);
        });
    }

    drawConnections() {
        this.particles.forEach((particle, i) => {
            for (let j = i + 1; j < this.particles.length; j++) {
                const other = this.particles[j];
                const dx = particle.x - other.x;
                const dy = particle.y - other.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    const opacity = (100 - distance) / 100 * 0.3;
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(other.x, other.y);
                    this.ctx.stroke();
                }
            }
        });
    }

    drawParticle(particle) {
        const gradient = this.ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size * 2
        );
        
        const { r, g, b } = particle.color;
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${particle.opacity})`);
        gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${particle.opacity * 0.5})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
    }

    startParticleAnimation() {
        const animate = (currentTime) => {
            if (currentTime - this.lastTime >= this.fpsInterval) {
                this.updateParticles();
                this.drawParticles();
                this.lastTime = currentTime;
            }
            this.animationId = requestAnimationFrame(animate);
        };
        
        this.animationId = requestAnimationFrame(animate);
    }

    // Event Listeners
    setupEventListeners() {
        // Mouse movement tracking with throttling
        let mouseTimeout;
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            
            clearTimeout(mouseTimeout);
            mouseTimeout = setTimeout(() => {
                // Reset mouse position after inactivity
                this.mouse.x = -100;
                this.mouse.y = -100;
            }, 2000);
        });

        // Resize handling
        window.addEventListener('resize', this.throttle(() => {
            this.resizeCanvas();
        }, 250));

        // Scroll handling
        window.addEventListener('scroll', this.throttle(() => {
            this.updateNavigation();
            this.updateScrollIndicator();
        }, 16));

        // Setup interactive effects
        this.setup3DTiltEffects();
        this.setupButtonInteractions();
    }

    // Enhanced Navigation
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Hero buttons smooth scrolling
        const scrollButtons = document.querySelectorAll('a[href^="#"]');
        scrollButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const href = btn.getAttribute('href');
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const targetElement = document.querySelector(href);
                    
                    if (targetElement) {
                        const offsetTop = targetElement.offsetTop - 80;
                        window.scrollTo({
                            top: offsetTop,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }

    updateNavigation() {
        const sections = document.querySelectorAll('.section, .hero-section');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let currentSection = '';
        const scrollPos = window.scrollY + 150;
        
        sections.forEach(section => {
            const top = section.offsetTop;
            const bottom = top + section.offsetHeight;
            
            if (scrollPos >= top && scrollPos < bottom) {
                currentSection = section.id;
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    updateScrollIndicator() {
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (scrollIndicator) {
            const scrollY = window.scrollY;
            const opacity = Math.max(0, 1 - (scrollY / 300));
            scrollIndicator.style.opacity = opacity;
            scrollIndicator.style.transform = `translateX(-50%) translateY(${scrollY * 0.5}px)`;
        }
    }

    // Enhanced Scroll Animations
    setupScrollAnimations() {
        const observerOptions = {
            threshold: [0.1, 0.3, 0.5],
            rootMargin: '0px 0px -10% 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (entry.intersectionRatio > 0.1) {
                        entry.target.classList.add('visible');
                        
                        // Trigger specific animations based on element type
                        if (entry.target.classList.contains('skill-glass')) {
                            setTimeout(() => this.animateSkillBars(entry.target), 200);
                        }
                        
                        if (entry.target.classList.contains('education-glass')) {
                            this.animateTimeline(entry.target);
                        }
                        
                        if (entry.target.classList.contains('project-glass')) {
                            this.animateProjectCard(entry.target);
                        }
                    }
                }
            });
        }, observerOptions);

        // Observe all animatable elements
        const animateElements = document.querySelectorAll(`
            .glass-container,
            .skill-glass,
            .project-glass,
            .education-glass,
            .section-title,
            .section-divider
        `);

        animateElements.forEach((el, index) => {
            el.classList.add('animate-in');
            // Stagger the observation slightly
            setTimeout(() => {
                observer.observe(el);
            }, index * 50);
        });
    }

    // Animation Methods
    animateProjectCard(element) {
        if (this.isReducedMotion) return;
        
        element.style.transform = 'translateY(20px) scale(0.95)';
        element.style.opacity = '0';
        
        setTimeout(() => {
            element.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
            element.style.transform = 'translateY(0) scale(1)';
            element.style.opacity = '1';
        }, 100);
    }

    animateSkillBars(container) {
        const skillBars = container.querySelectorAll('.skill-bar');
        skillBars.forEach((bar, index) => {
            setTimeout(() => {
                const progress = bar.getAttribute('data-progress');
                bar.style.width = progress + '%';
                
                // Add glow effect during animation
                bar.style.boxShadow = `0 0 20px rgba(88, 135, 255, 0.8)`;
                setTimeout(() => {
                    bar.style.boxShadow = `0 0 10px rgba(88, 135, 255, 0.5)`;
                }, 500);
            }, index * 300);
        });
    }

    animateTimeline(element) {
        const marker = element.parentElement.querySelector('.timeline-marker');
        if (marker && !this.isReducedMotion) {
            marker.style.transform = 'scale(0.8)';
            marker.style.opacity = '0.5';
            
            setTimeout(() => {
                marker.style.transition = 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                marker.style.transform = 'scale(1.1)';
                marker.style.opacity = '1';
                
                setTimeout(() => {
                    marker.style.transform = 'scale(1)';
                }, 300);
            }, 200);
        }
    }

    // Enhanced 3D Tilt Effects
    setup3DTiltEffects() {
        const tiltElements = document.querySelectorAll('.project-glass, .skill-glass, .contact-method');
        
        tiltElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                if (!this.isReducedMotion) {
                    element.style.transformStyle = 'preserve-3d';
                }
            });
            
            element.addEventListener('mousemove', (e) => {
                if (this.isReducedMotion) return;
                
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 8;
                const rotateY = (centerX - x) / 8;
                
                element.style.transform = `
                    perspective(1000px) 
                    rotateX(${rotateX}deg) 
                    rotateY(${rotateY}deg) 
                    translateZ(5px) 
                    scale(1.02)
                `;
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)';
            });
        });
    }

    // Enhanced Button Interactions
    setupButtonInteractions() {
        const buttons = document.querySelectorAll('.btn-glass, .nav-link');
        
        buttons.forEach(button => {
            // Ripple effect
            button.addEventListener('click', (e) => {
                this.createRipple(e, button);
            });
            
            // Magnetic effect for non-reduced motion
            if (!this.isReducedMotion) {
                button.addEventListener('mousemove', (e) => {
                    this.magneticEffect(e, button);
                });
                
                button.addEventListener('mouseleave', () => {
                    button.style.transform = 'translate(0px, 0px)';
                });
            }
        });
    }

    createRipple(e, button) {
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.4);
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
            z-index: 10;
        `;
        
        const currentPosition = getComputedStyle(button).position;
        if (currentPosition === 'static') {
            button.style.position = 'relative';
        }
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.remove();
            }
        }, 600);
    }

    magneticEffect(e, button) {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        const intensity = 0.3;
        button.style.transform = `translate(${x * intensity}px, ${y * intensity}px)`;
    }

    // Text Animations
    startAnimations() {
        this.setupTypingAnimation();
        this.setupKineticTextAnimations();
        this.staggerHeroAnimations();
        this.setupScrollProgress();
    }

    setupTypingAnimation() {
        const typingElement = document.querySelector('.typing-animation');
        if (typingElement) {
            const text = 'Full Stack Developer';
            let index = 0;
            
            // Clear existing text
            typingElement.textContent = '';
            
            const typeWriter = () => {
                if (index < text.length) {
                    typingElement.textContent = text.slice(0, index + 1);
                    index++;
                    setTimeout(typeWriter, 100);
                } else {
                    setTimeout(() => {
                        typingElement.style.borderRight = '2px solid transparent';
                        setTimeout(() => {
                            typingElement.style.borderRight = '2px solid var(--electric-blue-light)';
                        }, 500);
                    }, 1000);
                }
            };
            
            setTimeout(typeWriter, 1500);
        }
    }

    setupKineticTextAnimations() {
        const kineticTexts = document.querySelectorAll('.kinetic-text');
        kineticTexts.forEach((text, index) => {
            text.style.opacity = '0';
            text.style.transform = 'translateY(50px)';
            
            setTimeout(() => {
                text.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
                text.style.opacity = '1';
                text.style.transform = 'translateY(0)';
            }, 800 + (index * 200));
        });
    }

    staggerHeroAnimations() {
        const heroElements = [
            { selector: '.hero-name', delay: 0 },
            { selector: '.hero-title', delay: 300 },
            { selector: '.hero-subtitle', delay: 600 },
            { selector: '.hero-buttons', delay: 900 }
        ];

        heroElements.forEach(({ selector, delay }) => {
            const element = document.querySelector(selector);
            if (element) {
                element.style.opacity = '0';
                element.style.transform = 'translateY(40px)';
                
                setTimeout(() => {
                    element.style.transition = 'all 1s cubic-bezier(0.16, 1, 0.3, 1)';
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }, delay + 200);
            }
        });
    }

    setupScrollProgress() {
        // Create progress bar
        const progressBar = document.createElement('div');
        progressBar.id = 'scroll-progress';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(90deg, #5887FF, #715AFF, #FF47A4);
            z-index: 9999;
            transition: width 0.1s ease-out;
            box-shadow: 0 0 10px rgba(88, 135, 255, 0.5);
        `;
        document.body.appendChild(progressBar);

        // Update progress on scroll
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = Math.min((scrollTop / docHeight) * 100, 100);
            
            progressBar.style.width = `${scrollPercent}%`;
        });
    }

    // Performance Monitoring
    monitorPerformance() {
        let frameCount = 0;
        let lastTime = performance.now();
        
        const checkFPS = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                
                // Reduce particle count if performance is poor
                if (fps < 45 && this.particles.length > 50) {
                    console.warn('Reducing particle count for better performance');
                    this.particles = this.particles.slice(0, Math.floor(this.particles.length * 0.8));
                }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            if (!this.isReducedMotion) {
                requestAnimationFrame(checkFPS);
            }
        };
        
        requestAnimationFrame(checkFPS);
    }

    // Utility Functions
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Cleanup
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Remove event listeners
        window.removeEventListener('resize', this.resizeCanvas);
        window.removeEventListener('scroll', this.updateNavigation);
        
        // Clear particles
        this.particles = [];
        
        // Clear canvas
        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add required CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }
        
        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);

    // Initialize portfolio with error handling
    try {
        const portfolio = new AdvancedPortfolio();
        
        // Add smooth page transition
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.5s ease-in-out';
        
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 100);
        
        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            portfolio.destroy();
        });
        
        console.log('🚀 Advanced Portfolio initialized successfully!');
        
    } catch (error) {
        console.error('Error initializing portfolio:', error);
    }
});

// Handle reduced motion preferences changes
const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
mediaQuery.addListener((e) => {
    if (e.matches) {
        document.body.classList.add('reduced-motion');
    } else {
        document.body.classList.remove('reduced-motion');
    }
});

// Set initial reduced motion class
if (mediaQuery.matches) {
    document.body.classList.add('reduced-motion');
}

// Handle visibility change to pause animations when tab is not visible
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations when tab is hidden
        document.body.style.animationPlayState = 'paused';
    } else {
        // Resume animations when tab is visible
        document.body.style.animationPlayState = 'running';
    }
});

// Add loading state
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    console.log('✨ Portfolio fully loaded and ready!');
});