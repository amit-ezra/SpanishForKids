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
        this.currentVoiceElement = document.getElementById('current-voice');
        this.testVoiceButton = document.getElementById('test-voice-btn');
        this.voiceSelector = document.getElementById('voice-selector');
        this.testModeButton = document.getElementById('test-mode-btn');
        
        // Initialize test mode
        this.testMode = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.showMainMenu();
        this.initializeVoiceSystem();
        this.initializeTestMode();
    }
    
    initializeTestMode() {
        // Initialize test mode when TestMode class is available
        if (window.TestMode) {
            this.testMode = new window.TestMode(this);
            console.log('✅ Test mode initialized');
        } else {
            console.warn('⚠️ TestMode class not available');
        }
    }
    
    initializeVoiceSystem() {
        // Initialize voice system and update UI
        if (window.spanishSpeech) {
            // Update voice info periodically until a voice is selected
            const checkVoiceStatus = () => {
                const selectedVoice = window.spanishSpeech.getSelectedVoice();
                if (selectedVoice) {
                    this.updateVoiceInfo(selectedVoice);
                    this.populateVoiceDropdown();
                    this.enableVoiceTesting();
                } else {
                    this.currentVoiceElement.textContent = 'טוען קולות...';
                    this.testVoiceButton.disabled = true;
                    setTimeout(checkVoiceStatus, 500);
                }
            };
            
            // Start checking after a brief delay
            setTimeout(checkVoiceStatus, 100);
        } else {
            this.currentVoiceElement.textContent = 'קול לא זמין';
            this.testVoiceButton.disabled = true;
        }
    }
    
    updateVoiceInfo(voice) {
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (voice.name.toLowerCase().includes('Elvira')) {
            this.currentVoiceElement.textContent = '🎉 Microsoft Elvira (מומלץ!)';
        } else if (voice.name.toLowerCase().includes('Alvaro')) {
            this.currentVoiceElement.textContent = '👍 Microsoft Alvaro';
        } else if (voice.name.toLowerCase().includes('microsoft')) {
            this.currentVoiceElement.textContent = `👌 ${voice.name}`;
        } else if (isMobile && !voice.lang.startsWith('es')) {
            this.currentVoiceElement.textContent = `📱 ${voice.name} (מתאים לנייד)`;
        } else {
            this.currentVoiceElement.textContent = `🔊 ${voice.name}`;
        }
    }
    
    enableVoiceTesting() {
        this.testVoiceButton.disabled = false;
        this.testVoiceButton.addEventListener('click', () => {
            this.testCurrentVoice();
        });
    }
    
    populateVoiceDropdown() {
        if (!window.spanishSpeech || !this.voiceSelector) return;
        
        const formattedVoices = window.spanishSpeech.getFormattedSpanishVoices();
        const selectedVoice = window.spanishSpeech.getSelectedVoice();
        
        // Clear existing options
        this.voiceSelector.innerHTML = '';
        
        if (formattedVoices.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'לא נמצאו קולות ספרדיים';
            this.voiceSelector.appendChild(option);
            this.voiceSelector.disabled = true;
            return;
        }
        
        // Add auto-select option
        const autoOption = document.createElement('option');
        autoOption.value = '';
        autoOption.textContent = 'בחירה אוטומטית (מומלץ)';
        this.voiceSelector.appendChild(autoOption);
        
        // Add all available voices
        formattedVoices.forEach(voiceInfo => {
            const option = document.createElement('option');
            option.value = voiceInfo.value;
            option.textContent = voiceInfo.display;
            
            if (voiceInfo.isRecommended) {
                option.setAttribute('data-recommended', 'true');
            }
            
            this.voiceSelector.appendChild(option);
        });
        
        // Set current selection
        if (selectedVoice) {
            this.voiceSelector.value = selectedVoice.name;
        }
        
        // Enable dropdown and add event listener
        this.voiceSelector.disabled = false;
        this.voiceSelector.addEventListener('change', (e) => {
            this.onVoiceChange(e.target.value);
        });
        
        console.log('✅ Voice dropdown populated with', formattedVoices.length, 'voices');
    }
    
    async onVoiceChange(voiceName) {
        if (!window.spanishSpeech) return;
        
        try {
            // Set the new voice
            const success = window.spanishSpeech.setVoice(voiceName);
            
            if (success) {
                // Update the voice info display
                const newVoice = window.spanishSpeech.getSelectedVoice();
                this.updateVoiceInfo(newVoice);
                
                // Optional: Test the new voice
                await this.testCurrentVoice();
                
                console.log('✅ Voice changed to:', voiceName || 'Auto-select');
            } else {
                console.warn('⚠️ Failed to change voice to:', voiceName);
            }
        } catch (error) {
            console.error('❌ Error changing voice:', error);
        }
    }
    
    async testCurrentVoice() {
        if (!window.spanishSpeech) return;
        
        try {
            this.testVoiceButton.disabled = true;
            this.testVoiceButton.textContent = '🔊 מנגן...';
            
            // Test with a friendly Spanish phrase
            await window.spanishSpeech.speak('¡Hola! Soy tu profesora de español');
            
        } catch (error) {
            console.error('Error testing voice:', error);
        } finally {
            this.testVoiceButton.disabled = false;
            this.testVoiceButton.textContent = '🔊 בדוק קול';
        }
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
        
        // Test mode button
        if (this.testModeButton) {
            this.testModeButton.addEventListener('click', () => {
                this.startTestMode();
            });
        }
        
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
    
    // Test mode methods
    startTestMode() {
        if (!this.testMode) {
            console.warn('Test mode not initialized');
            return;
        }
        
        if (!this.currentModule) {
            console.warn('No module selected for test');
            return;
        }
        
        // Check if speech recognition is supported
        if (!window.spanishSpeechRecognition || !window.spanishSpeechRecognition.isRecognitionSupported()) {
            alert('זיהוי קול לא נתמך בדפדפן זה. המבחן זמין רק בדפדפנים תומכים כמו Chrome.');
            return;
        }
        
        console.log('🎯 Starting test mode for module:', this.currentModule.title);
        this.testMode.startTest(this.currentModule);
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
