// Main TypeScript file for TDA45 website
class WebsiteManager {
    constructor() {
        this.hamburger = document.querySelector('.hamburger');
        this.navMenu = document.querySelector('.nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.init();
    }
    init() {
        this.setupMobileMenu();
        this.setupSmoothScrolling();
        this.setupScrollAnimations();
        this.setupActiveNavigation();
    }
    setupMobileMenu() {
        if (this.hamburger && this.navMenu) {
            this.hamburger.addEventListener('click', () => {
                this.navMenu?.classList.toggle('active');
                this.hamburger?.classList.toggle('active');
            });
        }
    }
    setupSmoothScrolling() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                if (targetId && targetId !== '#') {
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });
    }
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);
        // Observe elements with fade-in class
        document.querySelectorAll('.fade-in').forEach(element => {
            observer.observe(element);
        });
        // Add fade-in class to project cards and sections
        document.querySelectorAll('.project-card, .section').forEach(element => {
            element.classList.add('fade-in');
            observer.observe(element);
        });
    }
    setupActiveNavigation() {
        const sections = document.querySelectorAll('section[id]');
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '-80px 0px -50% 0px'
        };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const targetId = `#${entry.target.id}`;
                    this.navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === targetId) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, observerOptions);
        sections.forEach(section => {
            observer.observe(section);
        });
    }
}
// Initialize the website when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WebsiteManager();
});
// Add typing animation for hero title
class TypeWriter {
    constructor(element, text) {
        this.index = 0;
        this.isDeleting = false;
        this.typeSpeed = 100;
        this.element = element;
        this.text = text;
        this.type();
    }
    type() {
        const currentText = this.isDeleting
            ? this.text.substring(0, this.index - 1)
            : this.text.substring(0, this.index + 1);
        this.element.textContent = currentText;
        if (!this.isDeleting && this.index === this.text.length) {
            this.isDeleting = true;
            this.typeSpeed = 50;
        }
        else if (this.isDeleting && this.index === 0) {
            this.isDeleting = false;
            this.typeSpeed = 100;
        }
        this.index += this.isDeleting ? -1 : 1;
        setTimeout(() => this.type(), this.typeSpeed);
    }
}
// Initialize typewriter effect
document.addEventListener('DOMContentLoaded', () => {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        new TypeWriter(heroTitle, 'Hoş Geldiniz');
    }
});
export {};
//# sourceMappingURL=main.js.map