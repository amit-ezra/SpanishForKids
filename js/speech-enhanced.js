// Enhanced Text-to-speech functionality prioritizing Microsoft Elvira
class EnhancedSpanishSpeech {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voices = [];
        this.selectedVoice = null;
        this.isSupported = 'speechSynthesis' in window;
        this.voiceLoadAttempts = 0;
        this.maxVoiceLoadAttempts = 10; // Increased for mobile
        this.isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.isAndroid = /Android/i.test(navigator.userAgent);
        
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
        // Add a short delay to give browsers more time to load voices
        if (this.voices.length === 0) {
            console.log('No voices loaded yet, will retry...');
            return new Promise(resolve => setTimeout(resolve, 1000))
                .then(() => this.voices = this.synth.getVoices());
        }
        
        if (this.voices.length === 0) {
            console.log('No voices found');
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
        
        if (anySpanishVoice) {
            return anySpanishVoice;
        }
        
        // Android/Mobile fallback: use any voice and set Spanish language
        if (this.isMobile && this.voices.length > 0) {
            console.log('🔄 Mobile fallback: Using default voice with Spanish language');
            return this.voices[0]; // Use first available voice
        }
        
        return null;
    }
    
    speak(text) {
        if (!this.isSupported) {
            console.warn('Speech synthesis not supported');
            return Promise.resolve();
        }
        
        return new Promise((resolve, reject) => {
            // Cancel any ongoing speech
            this.synth.cancel();
            
            // Mobile workaround: Small delay to ensure cancel works
            if (this.isMobile) {
                setTimeout(() => this.performSpeak(text, resolve, reject), 100);
            } else {
                this.performSpeak(text, resolve, reject);
            }
        });
    }
    
    performSpeak(text, resolve, reject) {
        // If no voice is selected yet, try to load voices again
        if (!this.selectedVoice) {
            this.loadVoices();
            if (!this.selectedVoice) {
                console.warn('No voice available for speech');
                resolve();
                return;
            }
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Configure utterance for optimal Spanish learning
        utterance.text = text;
        utterance.voice = this.selectedVoice;
        
        // Force Spanish language even if voice isn't Spanish (mobile fallback)
        if (this.isMobile && !this.selectedVoice.lang.startsWith('es')) {
            utterance.lang = 'es-ES';
            console.log('🔄 Mobile: Forcing Spanish language on non-Spanish voice');
        } else {
            utterance.lang = this.selectedVoice.lang || 'es-ES';
        }
        
        utterance.rate = 1; // Slightly slower for learning
        utterance.pitch = 1;
        utterance.volume = 1;

        // Handle events
        utterance.onend = () => {
            console.log('Speech finished:', text);
            resolve();
        };
        
        utterance.onerror = (event) => {
            console.error('Speech error:', event.error);
            // Don't reject on mobile - just resolve to prevent app breaking
            if (this.isMobile) {
                console.log('🔄 Mobile: Ignoring speech error, continuing...');
                resolve();
            } else {
                reject(event.error);
            }
        };
        
        utterance.onstart = () => {
            console.log('🔊 Speaking:', text, 'with', this.selectedVoice.name);
        };
        
        // Speak the text
        try {
            this.synth.speak(utterance);
            
            // Mobile timeout fallback
            if (this.isMobile) {
                setTimeout(() => {
                    if (this.synth.speaking) {
                        console.log('🔄 Mobile: Speech timeout, resolving...');
                        resolve();
                    }
                }, 5000);
            }
        } catch (error) {
            console.error('Error starting speech:', error);
            if (this.isMobile) {
                console.log('🔄 Mobile: Fallback to silent mode');
                resolve();
            } else {
                reject(error);
            }
        }
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

// Speech Recognition for Test Mode
class SpanishSpeechRecognition {
    constructor() {
        this.recognition = null;
        this.isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
        this.isListening = false;
        this.onResult = null;
        this.onError = null;
        this.onStart = null;
        this.onEnd = null;
        
        if (this.isSupported) {
            this.initializeRecognition();
        }
    }
    
    initializeRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        // Configure for Spanish language
        this.recognition.lang = 'es-ES';
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 3;
        
        // Event handlers
        this.recognition.onstart = () => {
            this.isListening = true;
            console.log('🎤 Speech recognition started');
            if (this.onStart) this.onStart();
        };
        
        this.recognition.onresult = (event) => {
            const results = Array.from(event.results);
            const transcript = results[0][0].transcript.toLowerCase().trim();
            const confidence = results[0][0].confidence;
            
            console.log('🔍 Speech recognition result:', transcript, 'confidence:', confidence);
            
            if (this.onResult) {
                this.onResult(transcript, confidence);
            }
        };
        
        this.recognition.onerror = (event) => {
            console.error('❌ Speech recognition error:', event.error);
            this.isListening = false;
            
            if (this.onError) {
                this.onError(event.error);
            }
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            console.log('🎤 Speech recognition ended');
            if (this.onEnd) this.onEnd();
        };
    }
    
    startListening() {
        if (!this.isSupported) {
            console.warn('Speech recognition not supported');
            return false;
        }
        
        if (this.isListening) {
            console.log('Already listening');
            return false;
        }
        
        try {
            this.recognition.start();
            return true;
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            return false;
        }
    }
    
    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }
    
    isCurrentlyListening() {
        return this.isListening;
    }
    
    isRecognitionSupported() {
        return this.isSupported;
    }
}

// Create global enhanced speech instance
window.spanishSpeech = new EnhancedSpanishSpeech();
window.spanishSpeechRecognition = new SpanishSpeechRecognition();

// For debugging - add voice info to console
setTimeout(() => {
    if (window.spanishSpeech.getSelectedVoice()) {
        console.log('🎯 Final selected voice:', window.spanishSpeech.getSelectedVoice().name);
        console.log('📝 Available Spanish voices:', 
            window.spanishSpeech.getAvailableSpanishVoices().map(v => v.name)
        );
    }
    
    if (window.spanishSpeechRecognition.isRecognitionSupported()) {
        console.log('🎤 Speech recognition supported');
    } else {
        console.warn('⚠️ Speech recognition not supported');
    }
}, 2000);
