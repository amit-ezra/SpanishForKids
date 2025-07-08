// Text-to-speech functionality for Spanish pronunciation
class SpanishSpeech {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voices = [];
        this.spanishVoice = null;
        this.isSupported = 'speechSynthesis' in window;
        
        // Initialize voices when they're loaded
        this.loadVoices();
        
        // Handle voice loading for different browsers
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => this.loadVoices();
        }
    }
    
    loadVoices() {
        this.voices = this.synth.getVoices();
        
        // Find Spanish voice (prefer female voice for kids)
        this.spanishVoice = this.voices.find(voice => 
            voice.lang.startsWith('es') && voice.name.toLowerCase().includes('female')
        ) || this.voices.find(voice => 
            voice.lang.startsWith('es')
        ) || this.voices.find(voice => 
            voice.lang.includes('es')
        );
        
        console.log('Available voices:', this.voices.map(v => `${v.name} (${v.lang})`));
        console.log('Selected Spanish voice:', this.spanishVoice);
    }
    
    speak(text) {
        if (!this.isSupported) {
            console.warn('Speech synthesis not supported');
            return Promise.resolve();
        }
        
        return new Promise((resolve, reject) => {
            // Cancel any ongoing speech
            this.synth.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Configure utterance
            utterance.text = text;
            utterance.lang = 'es-ES';
            utterance.rate = 0.8; // Slower for kids to understand
            utterance.pitch = 1.1; // Slightly higher pitch for friendliness
            utterance.volume = 0.9;
            
            // Use Spanish voice if available
            if (this.spanishVoice) {
                utterance.voice = this.spanishVoice;
            }
            
            // Handle events
            utterance.onend = () => {
                console.log('Speech finished');
                resolve();
            };
            
            utterance.onerror = (event) => {
                console.error('Speech error:', event.error);
                reject(event.error);
            };
            
            utterance.onstart = () => {
                console.log('Speech started for:', text);
            };
            
            // Speak the text
            this.synth.speak(utterance);
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
}

// Create global speech instance
window.spanishSpeech = new SpanishSpeech();
