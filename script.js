document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const textDisplay = document.getElementById('text-display');
    const textInput = document.getElementById('text-input');
    const wpmEl = document.getElementById('wpm');
    const accuracyEl = document.getElementById('accuracy');
    const timerEl = document.getElementById('timer');
    const restartBtn = document.getElementById('restart-btn');
    
    const gameArea = document.getElementById('game-area');
    const resultsScreen = document.getElementById('results-screen');

    // --- Word Banks ---
    const LEFT_HAND_WORDS = ['we', 'are', 'sad', 'wet', 'great', 'rest', 'war', 'fear', 'free', 'fat', 'get', 'see', 'set', 'eat', 'tea', 'vet', 'cat', 'car', 'art', 'fast', 'rate', 'date', 'safe', 'gave', 'gear', 'tree', 'extra', 'waste', 'water', 'trade', 'treat', 'street', 'server', 'secret', 'revere', 'create', 'savage', 'decree'];
    const RIGHT_HAND_WORDS = ['you', 'in', 'my', 'up', 'on', 'no', 'oh', 'hi', 'oil', 'pin', 'joy', 'jump', 'pop', 'look', 'moon', 'monopoly', 'opinion', 'only', 'join', 'union', 'minimum', 'monk', 'pump', 'pull', 'pink'];
    const BOTH_HANDS_WORDS = ['terminal', 'velocity', 'dynamic', 'hacker', 'interface', 'keystroke', 'system', 'matrix', 'data', 'vector', 'proxy', 'exploit', 'firewall', 'protocol', 'network', 'binary', 'code', 'script', 'glitch', 'cyber', 'security', 'analyser', 'quantum', 'algorithm', 'syntax'];

    // --- State Variables ---
    let handMode = 'both';
    let challengeType = 'words'; // 'words' or 'time'
    let challengeLength = 50; // default to 50 words
    let textToType = '';
    let timer;
    let time = 0;
    let errors = 0;
    let totalTyped = 0;
    let gameStarted = false;
    let intervalId;

    // --- Core Functions ---
    function generateText() {
        let wordBank;
        switch (handMode) {
            case 'left': wordBank = LEFT_HAND_WORDS; break;
            case 'right': wordBank = RIGHT_HAND_WORDS; break;
            default: wordBank = BOTH_HANDS_WORDS; break;
        }
        
        // For time mode, generate more words than likely needed
        const numWords = challengeType === 'words' ? challengeLength : 200;
        const words = [];
        for (let i = 0; i < numWords; i++) {
            words.push(wordBank[Math.floor(Math.random() * wordBank.length)]);
        }
        textToType = words.join(' ');
    }

    function renderText() {
        textDisplay.innerHTML = '';
        textToType.split('').forEach(char => {
            const charSpan = document.createElement('span');
            charSpan.innerText = char;
            textDisplay.appendChild(charSpan);
        });
        textDisplay.children[0].classList.add('current');
    }

    function resetGame() {
        clearInterval(intervalId);
        gameStarted = false;
        time = 0;
        errors = 0;
        totalTyped = 0;
        
        updateTimerDisplay();
        wpmEl.innerText = '0';
        accuracyEl.innerText = '100%';
        textInput.value = '';
        
        gameArea.classList.remove('hidden');
        resultsScreen.classList.add('hidden');
        
        generateText();
        renderText();
        textInput.focus();
    }

    function updateTimerDisplay() {
        if (challengeType === 'time') {
            timerEl.innerText = challengeLength - time;
        } else {
            timerEl.innerText = time + 's';
        }
    }

    function updateStats() {
        time++;
        updateTimerDisplay();

        if (totalTyped > 0) {
            const minutes = time / 60;
            const wpm = Math.round(((totalTyped - errors) / 5) / minutes);
            wpmEl.innerText = wpm > 0 ? wpm : 0;
        }
        
        if (challengeType === 'time' && time >= challengeLength) {
            endGame();
        }
    }

    function endGame() {
        clearInterval(intervalId);
        gameStarted = false;
        
        const finalWPM = wpmEl.innerText;
        const finalAccuracy = Math.round(((totalTyped - errors) / totalTyped) * 100) || 100;

        document.getElementById('final-wpm').innerText = finalWPM;
        document.getElementById('final-accuracy').innerText = `${finalAccuracy}%`;
        document.getElementById('final-time').innerText = `${time}s`;
        document.getElementById('final-chars').innerText = `${totalTyped - errors}/${totalTyped}`;
        
        gameArea.classList.add('hidden');
        resultsScreen.classList.remove('hidden');
    }

    function handleInput() {
        if (!gameStarted) {
            gameStarted = true;
            intervalId = setInterval(updateStats, 1000);
        }

        const typedText = textInput.value;
        totalTyped = typedText.length;
        
        const allCharSpans = textDisplay.querySelectorAll('span');

        let currentErrors = 0;
        allCharSpans.forEach((span, index) => {
            const char = typedText[index];
            if (char == null) {
                span.classList.remove('correct', 'incorrect');
            } else if (char === span.innerText) {
                span.classList.add('correct');
                span.classList.remove('incorrect');
            } else {
                span.classList.add('incorrect');
                span.classList.remove('correct');
                currentErrors++;
            }
        });
        errors = currentErrors;
        
        // Update accuracy live
        const accuracy = totalTyped > 0 ? Math.round(((totalTyped - errors) / totalTyped) * 100) : 100;
        accuracyEl.innerText = `${accuracy}%`;

        // Update current character cursor
        document.querySelector('.current')?.classList.remove('current');
        if (typedText.length < allCharSpans.length) {
            allCharSpans[typedText.length].classList.add('current');
        }

        // Check for game completion in 'words' mode
        if (challengeType === 'words' && typedText.length === textToType.length) {
            endGame();
        }
    }

    // --- Settings UI Logic ---
    function setupSettingsListeners() {
        document.querySelectorAll('.mode-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                document.querySelector('.mode-btn.active').classList.remove('active');
                e.target.classList.add('active');
                handMode = e.target.dataset.mode;
                resetGame();
            });
        });

        document.querySelectorAll('.challenge-type-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                document.querySelector('.challenge-type-btn.active').classList.remove('active');
                e.target.classList.add('active');
                challengeType = e.target.dataset.type;
                
                // Toggle visibility of length options
                if (challengeType === 'words') {
                    document.getElementById('words-options').classList.remove('hidden');
                    document.getElementById('time-options').classList.add('hidden');
                    // Set default length for newly selected type
                    challengeLength = parseInt(document.querySelector('#words-options .active').dataset.length);
                } else {
                    document.getElementById('words-options').classList.add('hidden');
                    document.getElementById('time-options').classList.remove('hidden');
                    // Set default length for newly selected type
                    challengeLength = parseInt(document.querySelector('#time-options .active').dataset.length);
                }
                resetGame();
            });
        });

        document.querySelectorAll('.challenge-len-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                // Deactivate sibling buttons
                e.target.parentElement.querySelector('.active')?.classList.remove('active');
                e.target.classList.add('active');
                challengeLength = parseInt(e.target.dataset.length);
                resetGame();
            });
        });
    }

    // --- Event Listeners ---
    textInput.addEventListener('input', handleInput);
    restartBtn.addEventListener('click', resetGame);
    textDisplay.addEventListener('click', () => textInput.focus());

    // --- Particle Background (Same as before) ---
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    const particleCount = 70;

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = Math.random() * 1 - 0.5;
            this.speedY = Math.random() * 1 - 0.5;
            this.color = 'rgba(0, 255, 222, 0.5)';
        }
        update() {
            if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
            if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
            this.x += this.speedX;
            this.y += this.speedY;
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    function initParticles() {
        for (let i = 0; i < particleCount; i++) particles.push(new Particle());
    }
    function handleParticles() {
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
            for (let j = i; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 100) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(0, 255, 222, ${1 - distance / 100})`;
                    ctx.lineWidth = 0.2;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        handleParticles();
        requestAnimationFrame(animateParticles);
    }
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth; canvas.height = window.innerHeight;
        particles = []; initParticles();
    });

    // --- Initial Game Start ---
    setupSettingsListeners();
    // Select default challenge length button
    document.querySelector('#words-options .challenge-len-btn[data-length="50"]').classList.add('active');
    document.querySelector('#time-options .challenge-len-btn[data-length="60"]').classList.add('active');
    
    initParticles();
    animateParticles();
    resetGame();
});