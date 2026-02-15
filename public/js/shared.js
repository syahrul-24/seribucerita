// Shared functionality for all pages
const shared = {
    // Component injection logic
    async init() {
        await this.loadComponents();
        this.initMobileMenu();
    },

    async loadComponents() {
        const components = [
            { id: 'navbar-placeholder', url: '/components/navbar.html' },
            { id: 'footer-placeholder', url: '/components/footer.html' }
        ];

        for (const comp of components) {
            const el = document.getElementById(comp.id);
            if (el) {
                try {
                    const response = await fetch(comp.url);
                    if (response.ok) {
                        el.innerHTML = await response.text();
                    }
                } catch (error) {
                    console.error(`Error loading component ${comp.id}:`, error);
                }
            }
        }
    },

    initMobileMenu() {
        // Use event delegation or wait for component injection
        document.addEventListener('click', (e) => {
            const burgerBtn = e.target.closest('#burger-btn');
            const mobileMenu = document.getElementById('mobile-menu');

            if (burgerBtn && mobileMenu) {
                mobileMenu.classList.toggle('hidden');
            } else if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                // Close menu if clicking outside
                if (!e.target.closest('#mobile-menu') && !e.target.closest('#burger-btn')) {
                    mobileMenu.classList.add('hidden');
                }
            }
        });
    },

    // Centralized Color Map for Article Categories
    colorMap: {
        primary: { bg: 'bg-primary/15', text: 'text-primary' },
        secondary: { bg: 'bg-secondary/15', text: 'text-secondary' },
        accent: { bg: 'bg-accent/15', text: 'text-accent' },
        peach: { bg: 'bg-peach/15', text: 'text-peach' },
        blush: { bg: 'bg-blush/15', text: 'text-blush' },
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => shared.init());

window.shared = shared;
