// Test Mode functionality for Spanish learning app
class TestMode {
    constructor(app) {
        this.app = app;
        this.isActive = false;
        this.currentModule = null;
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.totalQuestions = 0;
        
        // Test mode UI elements
        this.testModeOverlay = null;
        this.testModeScreen = null;
        this.progressIndicator = null;
        this.questionContainer = null;
        this.microphoneButton = null;
        this.statusText = null;
        this.celebrationContainer = null;
        
        // Celebration types
        this.celebrationTypes = [
            'balloons', 'confetti', 'sparkles', 'emojiBurst', 'screenPulse'
        ];
        
        // Spanish celebration phrases
        this.celebrationPhrases = {
            balloons: '¡Muy bien!',
            confetti: '¡Excelente!',
            sparkles: '¡Perfecto!',
            emojiBurst: '¡Bravo!',
            screenPulse: '¡Fantástico!'
        };
        
        // Initialize test mode
        this.initializeTestMode();
    }
    
    initializeTestMode() {
        this.createTestModeUI();
        this.setupSpeechRecognition();
        this.preloadCelebrationSounds();
    }
    
    createTestModeUI() {
        // Create test mode overlay
        this.testModeOverlay = document.createElement('div');
        this.testModeOverlay.id = 'test-mode-overlay';
        this.testModeOverlay.className = 'test-mode-overlay';
        this.testModeOverlay.style.display = 'none';
        
        this.testModeOverlay.innerHTML = `
            <div class="test-mode-screen">
                <div class="test-header">
                    <button id="exit-test-btn" class="exit-test-btn">✕ יציאה</button>
                    <div class="test-progress">
                        <span id="progress-text">שאלה 1 מתוך 10</span>
                        <div class="progress-bar">
                            <div id="progress-fill" class="progress-fill"></div>
                        </div>
                    </div>
                </div>
                
                <div class="test-question-container">
                    <div class="test-instruction">
                        <h3>אמור את המילה בספרדית</h3>
                        <p>לחץ על המיקרופון ואמור את המילה</p>
                    </div>
                    
                    <div class="test-item">
                        <div id="test-emoji" class="test-emoji">🤔</div>
                        <div id="test-hebrew" class="test-hebrew">טוען...</div>
                    </div>
                    
                    <div class="test-controls">
                        <div class="control-buttons">
                            <button id="speaker-help-btn" class="speaker-help-btn">
                                <span class="speaker-icon">🔊</span>
                                <span class="speaker-text">שמע עזרה</span>
                            </button>
                            <button id="microphone-btn" class="microphone-btn">
                                <span class="mic-icon">🎤</span>
                                <span class="mic-text">לחץ כדי לדבר</span>
                            </button>
                        </div>
                        <div id="listening-indicator" class="listening-indicator">
                            <div class="listening-animation"></div>
                            <span>מקשיב...</span>
                        </div>
                    </div>
                    
                    <div id="test-status" class="test-status">
                        <span>התחל בלחיצה על המיקרופון</span>
                    </div>
                </div>
                
                <div class="test-results" id="test-results" style="display: none;">
                    <div class="results-content">
                        <h2>🎉 כל הכבוד!</h2>
                        <div class="final-score">
                            <span id="final-score-text">השגת 8 מתוך 10</span>
                            <div class="score-percentage" id="score-percentage">80%</div>
                        </div>
                        <div class="results-actions">
                            <button id="try-again-btn" class="try-again-btn">נסה שוב</button>
                            <button id="back-to-module-btn" class="back-to-module-btn">חזור למודול</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div id="celebration-container" class="celebration-container"></div>
        `;
        
        // Add to DOM
        document.body.appendChild(this.testModeOverlay);
        
        // Get references to elements
        this.testModeScreen = this.testModeOverlay.querySelector('.test-mode-screen');
        this.progressIndicator = this.testModeOverlay.querySelector('#progress-text');
        this.progressFill = this.testModeOverlay.querySelector('#progress-fill');
        this.questionContainer = this.testModeOverlay.querySelector('.test-question-container');
        this.microphoneButton = this.testModeOverlay.querySelector('#microphone-btn');
        this.speakerHelpButton = this.testModeOverlay.querySelector('#speaker-help-btn');
        this.listeningIndicator = this.testModeOverlay.querySelector('#listening-indicator');
        this.statusText = this.testModeOverlay.querySelector('#test-status span');
        this.celebrationContainer = this.testModeOverlay.querySelector('#celebration-container');
        this.testResults = this.testModeOverlay.querySelector('#test-results');
        
        // Setup event listeners
        this.setupTestModeEvents();
    }
    
    setupTestModeEvents() {
        // Exit test button
        this.testModeOverlay.querySelector('#exit-test-btn').addEventListener('click', () => {
            this.exitTestMode();
        });
        
        // Microphone button
        this.microphoneButton.addEventListener('click', () => {
            this.startListening();
        });
        
        // Speaker help button
        this.speakerHelpButton.addEventListener('click', () => {
            this.speakCurrentWord();
        });
        
        // Try again button
        this.testModeOverlay.querySelector('#try-again-btn').addEventListener('click', () => {
            this.restartTest();
        });
        
        // Back to module button
        this.testModeOverlay.querySelector('#back-to-module-btn').addEventListener('click', () => {
            this.exitTestMode();
        });
        
        // Escape key to exit
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isActive) {
                this.exitTestMode();
            }
        });
    }
    
    setupSpeechRecognition() {
        if (!window.spanishSpeechRecognition) {
            console.warn('Speech recognition not available');
            return;
        }
        
        // Setup speech recognition callbacks
        window.spanishSpeechRecognition.onStart = () => {
            this.showListeningState();
        };
        
        window.spanishSpeechRecognition.onResult = (transcript, confidence) => {
            this.processSpeechResult(transcript, confidence);
        };
        
        window.spanishSpeechRecognition.onError = (error) => {
            this.handleSpeechError(error);
        };
        
        window.spanishSpeechRecognition.onEnd = () => {
            this.hideListeningState();
        };
    }
    
    preloadCelebrationSounds() {
        // Preload celebration sound effects
        this.celebrationSounds = {
            balloons: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAkUXrTp66hVFApGn+DyvmUIJXzE7+CVQA8NYqrg56BWGAlDltvw'), 
            confetti: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAkUXrTp66hVFApGn+DyvmUIJXzE7+CVQA8NYqrg56BWGAlDltvw'),
            sparkles: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAkUXrTp66hVFApGn+DyvmUIJXzE7+CVQA8NYqrg56BWGAlDltvw'),
            emojiBurst: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAkUXrTp66hVFApGn+DyvmUIJXzE7+CVQA8NYqrg56BWGAlDltvw'),
            screenPulse: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAkUXrTp66hVFApGn+DyvmUIJXzE7+CVQA8NYqrg56BWGAlDltvw')
        };
    }
    
    startTest(module) {
        if (!module || !module.items || module.items.length === 0) {
            console.error('Invalid module for test mode');
            return;
        }
        
        this.currentModule = module;
        this.isActive = true;
        this.score = 0;
        this.currentQuestionIndex = 0;
        
        // Prepare questions (randomize order)
        this.questions = [...module.items].sort(() => Math.random() - 0.5);
        this.totalQuestions = Math.min(this.questions.length, 10); // Max 10 questions
        this.questions = this.questions.slice(0, this.totalQuestions);
        
        // Show test mode
        this.testModeOverlay.style.display = 'flex';
        this.testResults.style.display = 'none';
        this.questionContainer.style.display = 'block';
        
        // Start first question
        this.showQuestion();
        
        console.log('🎯 Test mode started for module:', module.title);
    }
    
    showQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            this.showResults();
            return;
        }
        
        const question = this.questions[this.currentQuestionIndex];
        const questionNumber = this.currentQuestionIndex + 1;
        
        // Update progress
        this.progressIndicator.textContent = `שאלה ${questionNumber} מתוך ${this.totalQuestions}`;
        this.progressFill.style.width = `${(questionNumber / this.totalQuestions) * 100}%`;
        
        // Update question display
        this.testModeOverlay.querySelector('#test-emoji').textContent = question.emoji;
        this.testModeOverlay.querySelector('#test-hebrew').textContent = question.hebrew;
        
        // Reset UI state
        this.statusText.textContent = 'התחל בלחיצה על המיקרופון';
        this.microphoneButton.disabled = false;
        this.microphoneButton.classList.remove('listening');
        this.listeningIndicator.style.display = 'none';
        
        console.log('📋 Question:', questionNumber, '-', question.hebrew, '(' + question.spanish + ')');
    }
    
    startListening() {
        if (!window.spanishSpeechRecognition || !window.spanishSpeechRecognition.isRecognitionSupported()) {
            this.statusText.textContent = 'זיהוי קול לא נתמך בדפדפן זה';
            return;
        }
        
        const success = window.spanishSpeechRecognition.startListening();
        if (!success) {
            this.statusText.textContent = 'שגיאה בהפעלת זיהוי הקול';
        }
    }
    
    showListeningState() {
        this.microphoneButton.classList.add('listening');
        this.listeningIndicator.style.display = 'flex';
        this.statusText.textContent = 'מקשיב... אמור את המילה בספרדית';
        this.microphoneButton.disabled = true;
    }
    
    hideListeningState() {
        this.microphoneButton.classList.remove('listening');
        this.listeningIndicator.style.display = 'none';
        this.microphoneButton.disabled = false;
    }
    
    async speakCurrentWord() {
        if (!window.spanishSpeech || this.currentQuestionIndex >= this.questions.length) {
            console.warn('Speech not available or no current question');
            return;
        }
        
        const currentQuestion = this.questions[this.currentQuestionIndex];
        
        // Disable the button temporarily to prevent spam clicking
        this.speakerHelpButton.disabled = true;
        this.speakerHelpButton.classList.add('speaking');
        
        // Update status to show help is being provided
        const originalStatus = this.statusText.textContent;
        this.statusText.textContent = '🔊 שומע איך אומרים: ' + currentQuestion.spanish;
        
        try {
            // Speak the Spanish word
            await window.spanishSpeech.speak(currentQuestion.spanish);
            console.log('🔊 Help: Spoke word', currentQuestion.spanish);
        } catch (error) {
            console.error('Error speaking word:', error);
        } finally {
            // Re-enable the button and restore UI state
            setTimeout(() => {
                this.speakerHelpButton.disabled = false;
                this.speakerHelpButton.classList.remove('speaking');
                this.statusText.textContent = originalStatus;
            }, 500);
        }
    }
    
    processSpeechResult(transcript, confidence) {
        const currentQuestion = this.questions[this.currentQuestionIndex];
        const correctAnswer = currentQuestion.spanish.toLowerCase();
        const userAnswer = transcript.toLowerCase();
        
        console.log('🔍 Comparing:', userAnswer, 'vs', correctAnswer);
        
        // Check if answer is correct (with some tolerance for pronunciation)
        const isCorrect = this.isAnswerCorrect(userAnswer, correctAnswer);
        
        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleIncorrectAnswer(currentQuestion);
        }
    }
    
    isAnswerCorrect(userAnswer, correctAnswer) {
        // Exact match
        if (userAnswer === correctAnswer) {
            return true;
        }
        
        // Remove accents and check again
        const normalizeText = (text) => {
            return text.normalize('NFD')
                      .replace(/[\u0300-\u036f]/g, '')
                      .toLowerCase();
        };
        
        const normalizedUser = normalizeText(userAnswer);
        const normalizedCorrect = normalizeText(correctAnswer);
        
        if (normalizedUser === normalizedCorrect) {
            return true;
        }
        
        // Check for partial matches (at least 70% similarity)
        const similarity = this.calculateSimilarity(normalizedUser, normalizedCorrect);
        return similarity >= 0.7;
    }
    
    calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) {
            return 1.0;
        }
        
        const editDistance = this.levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }
    
    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }
    
    async handleCorrectAnswer() {
        this.score++;
        this.statusText.textContent = '🎉 נכון! כל הכבוד!';
        
        // Show random celebration
        await this.showRandomCelebration();
        
        // Move to next question after celebration
        setTimeout(() => {
            this.currentQuestionIndex++;
            this.showQuestion();
        }, 3000);
    }
    
    async handleIncorrectAnswer(question) {
        this.statusText.textContent = '❌ לא נכון. התשובה הנכונה היא: ' + question.spanish;
        
        // Play correct pronunciation
        if (window.spanishSpeech) {
            setTimeout(async () => {
                await window.spanishSpeech.speak(question.spanish);
            }, 1000);
        }
        
        // Move to next question
        setTimeout(() => {
            this.currentQuestionIndex++;
            this.showQuestion();
        }, 3000);
    }
    
    async showRandomCelebration() {
        const celebrationType = this.celebrationTypes[Math.floor(Math.random() * this.celebrationTypes.length)];
        const phrase = this.celebrationPhrases[celebrationType];
        
        console.log('🎉 Showing celebration:', celebrationType);
        
        // Play celebration sound
        if (this.celebrationSounds[celebrationType]) {
            this.celebrationSounds[celebrationType].play().catch(e => console.log('Audio play failed:', e));
        }
        
        // Show visual celebration
        await this.showVisualCelebration(celebrationType);
        
        // Play Spanish phrase
        if (window.spanishSpeech) {
            setTimeout(async () => {
                await window.spanishSpeech.speak(phrase);
            }, 500);
        }
    }
    
    async showVisualCelebration(type) {
        this.celebrationContainer.innerHTML = '';
        
        switch (type) {
            case 'balloons':
                this.showBalloonsAnimation();
                break;
            case 'confetti':
                this.showConfettiAnimation();
                break;
            case 'sparkles':
                this.showSparklesAnimation();
                break;
            case 'emojiBurst':
                this.showEmojiBurstAnimation();
                break;
            case 'screenPulse':
                this.showScreenPulseAnimation();
                break;
        }
    }
    
    showBalloonsAnimation() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f39c12', '#e74c3c'];
        
        for (let i = 0; i < 5; i++) {
            const balloon = document.createElement('div');
            balloon.className = 'balloon';
            balloon.style.cssText = `
                position: absolute;
                width: 40px;
                height: 50px;
                background: ${colors[i]};
                border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
                bottom: -60px;
                left: ${Math.random() * 100}%;
                animation: floatUp 3s ease-out forwards;
                z-index: 1000;
            `;
            
            this.celebrationContainer.appendChild(balloon);
            
            // Remove after animation
            setTimeout(() => balloon.remove(), 3000);
        }
    }
    
    showConfettiAnimation() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f39c12', '#e74c3c', '#9b59b6'];
        
        for (let i = 0; i < 20; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.cssText = `
                position: absolute;
                width: 8px;
                height: 8px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                top: -10px;
                left: ${Math.random() * 100}%;
                animation: confettiFall 2.5s ease-out forwards;
                z-index: 1000;
            `;
            
            this.celebrationContainer.appendChild(confetti);
            
            // Remove after animation
            setTimeout(() => confetti.remove(), 2500);
        }
    }
    
    showSparklesAnimation() {
        const currentEmoji = this.testModeOverlay.querySelector('#test-emoji');
        const rect = currentEmoji.getBoundingClientRect();
        const containerRect = this.celebrationContainer.getBoundingClientRect();
        
        for (let i = 0; i < 8; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.textContent = '✨';
            sparkle.style.cssText = `
                position: absolute;
                font-size: 20px;
                left: ${rect.left - containerRect.left + Math.random() * 100}px;
                top: ${rect.top - containerRect.top + Math.random() * 100}px;
                animation: sparkleOut 2s ease-out forwards;
                z-index: 1000;
            `;
            
            this.celebrationContainer.appendChild(sparkle);
            
            // Remove after animation
            setTimeout(() => sparkle.remove(), 2000);
        }
    }
    
    showEmojiBurstAnimation() {
        const emojis = ['🎉', '🌟', '👏', '🎊', '🔥', '💫'];
        
        for (let i = 0; i < 6; i++) {
            const emoji = document.createElement('div');
            emoji.className = 'emoji-burst';
            emoji.textContent = emojis[i];
            emoji.style.cssText = `
                position: absolute;
                font-size: 30px;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                animation: emojiBurst 2.5s ease-out forwards;
                animation-delay: ${i * 0.1}s;
                z-index: 1000;
            `;
            
            this.celebrationContainer.appendChild(emoji);
            
            // Remove after animation
            setTimeout(() => emoji.remove(), 2500);
        }
    }
    
    showScreenPulseAnimation() {
        this.testModeScreen.style.animation = 'screenPulse 2s ease-out';
        
        setTimeout(() => {
            this.testModeScreen.style.animation = '';
        }, 2000);
    }
    
    showResults() {
        this.questionContainer.style.display = 'none';
        this.testResults.style.display = 'flex';
        
        const percentage = Math.round((this.score / this.totalQuestions) * 100);
        
        this.testResults.querySelector('#final-score-text').textContent = 
            `השגת ${this.score} מתוך ${this.totalQuestions}`;
        this.testResults.querySelector('#score-percentage').textContent = `${percentage}%`;
        
        // Play final celebration if score is good
        if (percentage >= 70) {
            setTimeout(() => {
                this.showRandomCelebration();
            }, 1000);
        }
        
        console.log('📊 Test completed. Score:', this.score, '/', this.totalQuestions, '(' + percentage + '%)');
    }
    
    restartTest() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.questions = [...this.currentModule.items].sort(() => Math.random() - 0.5);
        this.questions = this.questions.slice(0, this.totalQuestions);
        
        this.testResults.style.display = 'none';
        this.questionContainer.style.display = 'block';
        this.showQuestion();
    }
    
    exitTestMode() {
        this.isActive = false;
        this.testModeOverlay.style.display = 'none';
        
        // Stop any ongoing speech recognition
        if (window.spanishSpeechRecognition) {
            window.spanishSpeechRecognition.stopListening();
        }
        
        // Stop any playing audio
        if (window.spanishSpeech) {
            window.spanishSpeech.stop();
        }
        
        console.log('🚪 Test mode exited');
    }
    
    handleSpeechError(error) {
        console.error('Speech recognition error:', error);
        
        let errorMessage = 'שגיאה בזיהוי הקול';
        
        switch (error) {
            case 'no-speech':
                errorMessage = 'לא נשמע קול. נסה שוב';
                break;
            case 'audio-capture':
                errorMessage = 'בעיה במיקרופון. בדוק הגדרות';
                break;
            case 'not-allowed':
                errorMessage = 'גישה למיקרופון נדחתה';
                break;
            case 'network':
                errorMessage = 'בעיית רשת. נסה שוב';
                break;
        }
        
        this.statusText.textContent = errorMessage;
        this.hideListeningState();
    }
}

// Export for use in main app
window.TestMode = TestMode;
