/**
 * Main Application Module
 * Common functionality for all pages
 */

const App = {
    /**
     * Initialize application
     */
    init() {
        this.loadConfiguration();
        this.setupAccessibility();
    },

    /**
     * Load dynamic configuration from server
     */
    async loadConfiguration() {
        try {
            const config = await DominoAPI.getConfiguration();
            
            if (config.success) {
                // Update UI with server configuration
                if (config.appTitle) {
                    document.getElementById('appTitle')?.textContent = config.appTitle;
                    document.title = config.appTitle;
                }
                
                if (config.companyName) {
                    document.getElementById('companyName')?.textContent = config.companyName;
                }
                
                if (config.supportEmail) {
                    const emailEl = document.getElementById('supportEmail');
                    if (emailEl) {
                        emailEl.textContent = config.supportEmail;
                        emailEl.href = `mailto:${config.supportEmail}`;
                    }
                }
                
                if (config.supportPhone) {
                    document.getElementById('supportPhone')?.textContent = config.supportPhone;
                }
                
                if (config.logoUrl) {
                    document.getElementById('appLogo')?.setAttribute('src', config.logoUrl);
                }
            }
        } catch (error) {
            console.log('Using default configuration');
        }
    },

    /**
     * Setup accessibility features
     */
    setupAccessibility() {
        // Add keyboard navigation for cards
        document.querySelectorAll('.card').forEach(card => {
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            
            card.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });
        });

        // Add focus outline for accessibility
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    },

    /**
     * Format date for display
     * @param {Date|string} date - Date to format
     * @returns {string} - Formatted date string
     */
    formatDate(date) {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} - Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Show toast notification
     * @param {string} message - Message to display
     * @param {string} type - Type: success, error, warning, info
     * @param {number} duration - Duration in ms
     */
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 16px 24px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
