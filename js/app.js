// Main application logic for Spanish learning app
class SpanishApp {
    constructor() {
        this.currentModule = null;
        this.currentScreen = 'main-menu';
        
        // DOM elements
        this.mainMenuScreen = document.getElementById('main-menu');
        this.moduleScreen = document.getElementById('module-screen');
        this.moduleTitle = document.getElementById('module-title');
        this.itemsGrid = document.getElementById('items-grid');
        this.backButton = document.getElementById('back-btn');
        this.audioFeedback = document.getElementById('audio-feedback');
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.showMainMenu();
        
        // Wait for voices to load before enabling speech
        setTimeout(() => {
            if (window.spanishSpeech) {
                window.spanishSpeech.loadVoices();
            }
        }, 1000);
    }
    
    setupEventListeners() {
        // Module card clicks
        const moduleCards = document.querySelectorAll('.module-card');
        moduleCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const moduleId = card.getAttribute('data-module');
                this.openModule(moduleId);
            });
            
            // Add touch feedback
            card.addEventListener('touchstart', () => {
                card.style.transform = 'scale(0.95)';
            });
            
            card.addEventListener('touchend', () => {
                setTimeout(() => {
                    card.style.transform = '';
                }, 150);
            });
        });
        
        // Back button
        this.backButton.addEventListener('click', () => {
            this.showMainMenu();
        });
        
        // Prevent context menu on long press (mobile)
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        // Handle page visibility changes (pause audio when hidden)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && window.spanishSpeech) {
                window.spanishSpeech.stop();
            }
        });
    }
    
    showMainMenu() {
        this.currentScreen = 'main-menu';
        this.mainMenuScreen.classList.add('active');
        this.moduleScreen.classList.remove('active');
        
        // Stop any playing audio
        if (window.spanishSpeech) {
            window.spanishSpeech.stop();
        }
        
        // Update page title
        document.title = '¡Aprende Español! - Learn Spanish for Kids';
    }
    
    openModule(moduleId) {
        const module = window.vocabulary[moduleId];
        if (!module) {
            console.error('Module not found:', moduleId);
            return;
        }
        
        this.currentModule = module;
        this.currentScreen = 'module-screen';
        
        // Update UI
        this.moduleTitle.textContent = `${module.title} - ${module.hebrewTitle}`;
        this.mainMenuScreen.classList.remove('active');
        this.moduleScreen.classList.add('active');
        
        // Load module items
        this.loadModuleItems(module);
        
        // Update page title
        document.title = `${module.title} - ¡Aprende Español!`;
        
        // Scroll to top
        window.scrollTo(0, 0);
    }
    
    loadModuleItems(module) {
        // Clear existing items
        this.itemsGrid.innerHTML = '';
        
        // Create item cards
        module.items.forEach((item, index) => {
            const itemCard = this.createItemCard(item, index);
            this.itemsGrid.appendChild(itemCard);
        });
    }
    
    createItemCard(item, index) {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.setAttribute('data-spanish', item.spanish);
        card.setAttribute('data-index', index);
        
        card.innerHTML = `
            <div class="item-image">${item.emoji}</div>
            <h4>${item.spanish}</h4>
            <p>${item.hebrew}</p>
        `;
        
        // Add click event for pronunciation
        card.addEventListener('click', () => {
            this.pronounceWord(item, card);
        });
        
        // Add touch feedback
        card.addEventListener('touchstart', () => {
            card.style.transform = 'scale(0.95)';
        });
        
        card.addEventListener('touchend', () => {
            setTimeout(() => {
                if (!card.classList.contains('playing')) {
                    card.style.transform = '';
                }
            }, 150);
        });
        
        return card;
    }
    
    async pronounceWord(item, cardElement) {
        if (!window.spanishSpeech) {
            console.warn('Speech synthesis not available');
            return;
        }
        
        try {
            // Add visual feedback
            cardElement.classList.add('playing');
            this.showAudioFeedback();
            
            // Speak the Spanish word
            await window.spanishSpeech.speak(item.spanish);
            
        } catch (error) {
            console.error('Error pronouncing word:', error);
        } finally {
            // Remove visual feedback
            cardElement.classList.remove('playing');
            this.hideAudioFeedback();
            cardElement.style.transform = '';
        }
    }
    
    showAudioFeedback() {
        this.audioFeedback.classList.add('show');
    }
    
    hideAudioFeedback() {
        this.audioFeedback.classList.remove('show');
    }
    
    // Utility methods
    getCurrentModule() {
        return this.currentModule;
    }
    
    getCurrentScreen() {
        return this.currentScreen;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if all required elements exist
    const requiredElements = [
        'main-menu', 'module-screen', 'module-title', 
        'items-grid', 'back-btn', 'audio-feedback'
    ];
    
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    
    if (missingElements.length > 0) {
        console.error('Missing required elements:', missingElements);
        return;
    }
    
    // Check if vocabulary is loaded
    if (!window.vocabulary) {
        console.error('Vocabulary data not loaded');
        return;
    }
    
    // Initialize the app
    window.app = new SpanishApp();
    console.log('Spanish learning app initialized successfully!');
});

// Handle app installation (PWA)
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    deferredPrompt = e;
    console.log('App can be installed');
});

// Handle keyboard navigation for accessibility
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && window.app) {
        if (window.app.getCurrentScreen() === 'module-screen') {
            window.app.showMainMenu();
        }
    }
});

// Handle orientation change for mobile
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 100);
});
