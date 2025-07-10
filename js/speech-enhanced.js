// Enhanced Text-to-speech functionality prioritizing Microsoft Elvira
class EnhancedSpanishSpeech {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voices = [];
        this.selectedVoice = null;
        this.isSupported = 'speechSynthesis' in window;
        this.voiceLoadAttempts = 0;
        this.maxVoiceLoadAttempts = 5;
        
        // Voice priority list (in order of preference)
        this.voicePriority = [
            // Microsoft Elvira variations
            'Microsoft Elvira - Spanish (Spain)',
            'Microsoft Elvira',
            'Elvira',
            'Microsoft Elvira - Spanish',
            
            // Other high-quality Microsoft Spanish voices
            'Microsoft Alvaro - Spanish (Mexico)',
            'Microsoft Alvaro',
            'Alvaro',
            'Microsoft Pablo - Spanish (Spain)',
            'Microsoft Pablo',
            'Pablo',
            
            // Google voices
            'Google español',
            'Google español (España)',
            'Google español (Mexico)',
            
            // Other quality voices
            'Paulina',
            'Monica',
            'Esperanza',
            'Jorge'
        ];
        
        // Initialize voices
        this.initializeVoices();
    }
    
    initializeVoices() {
        // Try to load voices immediately
        this.loadVoices();
        
        // Set up voice change listener for browsers that load voices asynchronously
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => {
                this.loadVoices();
            };
        }
        
        // Fallback: keep trying to load voices for browsers that need time
        this.retryVoiceLoading();
    }
    
    retryVoiceLoading() {
        const checkVoices = () => {
            if (this.voiceLoadAttempts < this.maxVoiceLoadAttempts && !this.selectedVoice) {
                this.voiceLoadAttempts++;
                this.loadVoices();
                
                if (!this.selectedVoice) {
                    setTimeout(checkVoices, 500);
                }
            }
        };
        
        setTimeout(checkVoices, 100);
    }
    
    loadVoices() {
        this.voices = this.synth.getVoices();
        
        if (this.voices.length === 0) {
            console.log('No voices loaded yet, will retry...');
            return;
        }
        
        console.log('Available voices:', this.voices.map(v => `${v.name} (${v.lang})`));
        
        // Find the best Spanish voice based on priority
        this.selectedVoice = this.selectBestSpanishVoice();
        
        if (this.selectedVoice) {
            console.log('✅ Selected voice:', this.selectedVoice.name, '(' + this.selectedVoice.lang + ')');
            
            // Check if it's Elvira specifically
            if (this.selectedVoice.name.toLowerCase().includes('Elvira')) {
                console.log('🎉 Microsoft Elvira detected! Excellent choice for Spanish learning.');
            }
        } else {
            console.warn('⚠️ No suitable Spanish voice found');
        }
    }
    
    selectBestSpanishVoice() {
        // First, try to find voices from our priority list
        for (const preferredName of this.voicePriority) {
            const voice = this.voices.find(v => 
                v.name.toLowerCase().includes(preferredName.toLowerCase()) &&
                (v.lang.startsWith('es') || v.lang.includes('spanish'))
            );
            if (voice) {
                return voice;
            }
        }
        
        // If no priority voice found, find any good Spanish voice
        // Prefer female voices for kids (research shows they're easier to understand)
        const femaleSpanishVoice = this.voices.find(voice => 
            voice.lang.startsWith('es') && 
            (voice.name.toLowerCase().includes('female') || 
             voice.name.toLowerCase().includes('Elvira') ||
             voice.name.toLowerCase().includes('Alvaro') ||
             voice.name.toLowerCase().includes('monica') ||
             voice.name.toLowerCase().includes('esperanza'))
        );
        
        if (femaleSpanishVoice) {
            return femaleSpanishVoice;
        }
        
        // Fallback to any Spanish voice
        const anySpanishVoice = this.voices.find(voice => 
            voice.lang.startsWith('es') || voice.lang.includes('spanish')
        );
        
        return anySpanishVoice;
    }
    
    speak(text) {
        if (!this.isSupported) {
            console.warn('Speech synthesis not supported');
            return Promise.resolve();
        }
        
        return new Promise((resolve, reject) => {
            // Cancel any ongoing speech
            this.synth.cancel();
            
            // If no voice is selected yet, try to load voices again
            if (!this.selectedVoice) {
                this.loadVoices();
                if (!this.selectedVoice) {
                    console.warn('No Spanish voice available');
                    resolve();
                    return;
                }
            }
            
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Configure utterance for optimal Spanish learning
            utterance.text = text;
            utterance.voice = this.selectedVoice;
            utterance.lang = this.selectedVoice.lang || 'es-ES';
            utterance.rate = 1;
            utterance.pitch = 1;
            utterance.volume = 1;

            // Handle events
            utterance.onend = () => {
                console.log('Speech finished:', text);
                resolve();
            };
            
            utterance.onerror = (event) => {
                console.error('Speech error:', event.error);
                reject(event.error);
            };
            
            utterance.onstart = () => {
                console.log('🔊 Speaking:', text, 'with', this.selectedVoice.name);
            };
            
            // Speak the text
            try {
                this.synth.speak(utterance);
            } catch (error) {
                console.error('Error starting speech:', error);
                reject(error);
            }
        });
    }
    
    
    stop() {
        if (this.isSupported) {
            this.synth.cancel();
        }
    }
    
    isPlaying() {
        return this.isSupported && this.synth.speaking;
    }
    
    getSelectedVoice() {
        return this.selectedVoice;
    }
    
    getAvailableSpanishVoices() {
        return this.voices.filter(voice => 
            voice.lang.startsWith('es') || voice.lang.includes('spanish')
        );
    }
    
    // Method to test voice quality
    async testVoice(testText = 'Hola, me llamo Elvira') {
        if (!this.selectedVoice) {
            console.log('No voice selected yet');
            return;
        }
        
        console.log('Testing voice:', this.selectedVoice.name);
        await this.speak(testText);
    }
    
    // Method to switch to a different voice if available
    switchVoice(voiceName) {
        const newVoice = this.voices.find(v => 
            v.name.toLowerCase().includes(voiceName.toLowerCase()) &&
            (v.lang.startsWith('es') || v.lang.includes('spanish'))
        );
        
        if (newVoice) {
            this.selectedVoice = newVoice;
            console.log('Switched to voice:', newVoice.name);
            return true;
        } else {
            console.warn('Voice not found:', voiceName);
            return false;
        }
    }
    
    // Method to set voice by exact name
    setVoice(voiceName) {
        if (!voiceName) {
            // If empty, revert to auto-selection
            this.selectedVoice = this.selectBestSpanishVoice();
            return this.selectedVoice !== null;
        }
        
        const voice = this.voices.find(v => v.name === voiceName);
        if (voice && (voice.lang.startsWith('es') || voice.lang.includes('spanish'))) {
            this.selectedVoice = voice;
            console.log('✅ Voice set to:', voice.name);
            return true;
        } else {
            console.warn('⚠️ Voice not found or not Spanish:', voiceName);
            return false;
        }
    }
    
    // Get available Spanish voices with formatted names
    getFormattedSpanishVoices() {
        const spanishVoices = this.getAvailableSpanishVoices();
        return spanishVoices.map(voice => {
            let displayName = voice.name;
            let isRecommended = false;
            
            // Mark recommended voices
            if (voice.name.toLowerCase().includes('Elvira')) {
                displayName = `🎉 ${voice.name} (מומלץ!)`;
                isRecommended = true;
            } else if (voice.name.toLowerCase().includes('Alvaro')) {
                displayName = `👍 ${voice.name}`;
                isRecommended = true;
            } else if (voice.name.toLowerCase().includes('microsoft')) {
                displayName = `👌 ${voice.name}`;
            } else {
                displayName = `🔊 ${voice.name}`;
            }
            
            return {
                value: voice.name,
                display: displayName,
                isRecommended: isRecommended,
                voice: voice
            };
        });
    }
}

// Create global enhanced speech instance
window.spanishSpeech = new EnhancedSpanishSpeech();

// For debugging - add voice info to console
setTimeout(() => {
    if (window.spanishSpeech.getSelectedVoice()) {
        console.log('🎯 Final selected voice:', window.spanishSpeech.getSelectedVoice().name);
        console.log('📝 Available Spanish voices:', 
            window.spanishSpeech.getAvailableSpanishVoices().map(v => v.name)
        );
    }
}, 2000);
