// Main Application JavaScript
class ADULabApp {
    constructor() {
        this.init();
    }

    init() {
        // Initialize event listeners
        this.setupEventListeners();
        
        // Check for saved assessment
        this.checkSavedAssessment();
        
        // Setup smooth scrolling
        this.setupSmoothScrolling();
        
        // Register service worker for PWA
        this.registerServiceWorker();
    }

    setupEventListeners() {
        // Hero CTA buttons
        const startButtons = document.querySelectorAll('#start-hero-assessment, .btn-primary[href="#start-assessment"]');
        startButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.scrollToAssessment();
            });
        });
    }

    scrollToAssessment() {
        const assessmentSection = document.getElementById('start-assessment');
        if (assessmentSection) {
            assessmentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Focus on first input after scroll
            setTimeout(() => {
                const firstInput = assessmentSection.querySelector('input, select');
                if (firstInput) firstInput.focus();
            }, 1000);
        }
    }

    checkSavedAssessment() {
        // Check localStorage for incomplete assessment
        const savedData = localStorage.getItem('adu_assessment_draft');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                if (data.timestamp && Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
                    // Less than 24 hours old
                    this.showResumeBanner(data);
                }
            } catch (e) {
                console.error('Error parsing saved assessment:', e);
            }
        }
    }

    showResumeBanner(data) {
        const banner = document.createElement('div');
        banner.className = 'resume-banner';
        banner.innerHTML = `
            <div class="container">
                <p>You have an incomplete assessment from ${this.formatRelativeTime(data.timestamp)}.</p>
                <div class="resume-actions">
                    <button class="btn btn-primary btn-sm" onclick="app.resumeAssessment()">Resume</button>
                    <button class="btn btn-secondary btn-sm" onclick="app.dismissBanner(this)">Start Fresh</button>
                </div>
            </div>
        `;
        document.body.insertBefore(banner, document.body.firstChild);
    }

    formatRelativeTime(timestamp) {
        const diff = Date.now() - timestamp;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 1) return 'a few minutes ago';
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        return 'yesterday';
    }

    resumeAssessment() {
        this.scrollToAssessment();
        // Assessment.js will handle loading saved data
        if (window.assessmentManager) {
            window.assessmentManager.loadSavedData();
        }
        this.dismissBanner();
    }

    dismissBanner(button) {
        const banner = button ? button.closest('.resume-banner') : document.querySelector('.resume-banner');
        if (banner) {
            banner.style.animation = 'slideUp 0.3s ease-out';
            setTimeout(() => banner.remove(), 300);
        }
        // Clear saved data if starting fresh
        if (button) {
            localStorage.removeItem('adu_assessment_draft');
        }
    }

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js')
                    .then(registration => {
                        console.log('ServiceWorker registered:', registration);
                    })
                    .catch(err => {
                        console.log('ServiceWorker registration failed:', err);
                    });
            });
        }
    }

    // Utility method for API calls
    async apiCall(endpoint, data = {}, method = 'POST') {
        try {
            const response = await fetch(`/api/${endpoint}`, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: method !== 'GET' ? JSON.stringify(data) : undefined,
            });

            if (!response.ok) {
                throw new Error(`API call failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API call error:', error);
            throw error;
        }
    }

    // Show toast notifications
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="material-icons">${this.getToastIcon(type)}</span>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }

    getToastIcon(type) {
        const icons = {
            success: 'check_circle',
            error: 'error',
            warning: 'warning',
            info: 'info'
        };
        return icons[type] || icons.info;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ADULabApp();
});

// Add styles for resume banner and toasts
const style = document.createElement('style');
style.textContent = `
    .resume-banner {
        background: var(--primary);
        color: white;
        padding: 12px 0;
        text-align: center;
        animation: slideDown 0.3s ease-out;
        position: sticky;
        top: 0;
        z-index: 1100;
    }
    
    .resume-banner .container {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 24px;
        flex-wrap: wrap;
    }
    
    .resume-actions {
        display: flex;
        gap: 12px;
    }
    
    .btn-sm {
        padding: 6px 16px;
        font-size: 14px;
    }
    
    @keyframes slideDown {
        from { transform: translateY(-100%); }
        to { transform: translateY(0); }
    }
    
    @keyframes slideUp {
        from { transform: translateY(0); }
        to { transform: translateY(-100%); }
    }
    
    .toast {
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: var(--text-primary);
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 12px;
        transform: translateX(400px);
        transition: transform 0.3s ease-out;
        z-index: 2000;
        max-width: 400px;
    }
    
    .toast.show {
        transform: translateX(0);
    }
    
    .toast-success { background: var(--success); }
    .toast-error { background: var(--error); }
    .toast-warning { background: var(--warning); }
    
    @media (max-width: 768px) {
        .toast {
            right: 12px;
            left: 12px;
            max-width: none;
        }
    }
`;
document.head.appendChild(style);