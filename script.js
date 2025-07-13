// Timer State
let timer = {
    minutes: 25,
    seconds: 0,
    isRunning: false,
    isBreak: false,
    intervalId: null,
    sessionsCompleted: 0
};

// Default Settings
const DEFAULT_FOCUS_TIME = 25;
const DEFAULT_BREAK_TIME = 5;

// DOM Elements
const timerDisplay = document.getElementById('timer');
const sessionTypeDisplay = document.getElementById('session-type');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const focusTimeInput = document.getElementById('focus-time');
const breakTimeInput = document.getElementById('break-time');
const sessionCountDisplay = document.getElementById('session-count');
const soundToggle = document.getElementById('sound-toggle');

// Audio Setup
const audio = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
audio.loop = true;
audio.volume = 0.3;

// Initialize
function init() {
    loadSettings();
    updateDisplay();
    attachEventListeners();
}

// Load saved settings from LocalStorage
function loadSettings() {
    const savedSessions = localStorage.getItem('sessionsCompleted');
    if (savedSessions) {
        timer.sessionsCompleted = parseInt(savedSessions);
        sessionCountDisplay.textContent = timer.sessionsCompleted;
    }
    
    const savedFocusTime = localStorage.getItem('focusTime');
    if (savedFocusTime) {
        focusTimeInput.value = savedFocusTime;
        timer.minutes = parseInt(savedFocusTime);
    }
    
    const savedBreakTime = localStorage.getItem('breakTime');
    if (savedBreakTime) {
        breakTimeInput.value = savedBreakTime;
    }
}

// Attach Event Listeners
function attachEventListeners() {
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    
    focusTimeInput.addEventListener('change', (e) => {
        const value = parseInt(e.target.value);
        if (value > 0 && value <= 60) {
            localStorage.setItem('focusTime', value);
            if (!timer.isRunning && !timer.isBreak) {
                timer.minutes = value;
                timer.seconds = 0;
                updateDisplay();
            }
        }
    });
    
    breakTimeInput.addEventListener('change', (e) => {
        const value = parseInt(e.target.value);
        if (value > 0 && value <= 30) {
            localStorage.setItem('breakTime', value);
        }
    });
    
    soundToggle.addEventListener('change', (e) => {
        if (e.target.checked && timer.isRunning) {
            audio.play().catch(err => console.log('Audio play failed:', err));
        } else {
            audio.pause();
        }
    });
}

// Timer Functions
function startTimer() {
    if (!timer.isRunning) {
        timer.isRunning = true;
        startBtn.style.display = 'none';
        pauseBtn.style.display = 'inline-block';
        timerDisplay.classList.add('pulse');
        
        if (soundToggle.checked) {
            audio.play().catch(err => console.log('Audio play failed:', err));
        }
        
        timer.intervalId = setInterval(updateTimer, 1000);
    }
}

function pauseTimer() {
    timer.isRunning = false;
    clearInterval(timer.intervalId);
    pauseBtn.style.display = 'none';
    startBtn.style.display = 'inline-block';
    timerDisplay.classList.remove('pulse');
    audio.pause();
}

function resetTimer() {
    clearInterval(timer.intervalId);
    timer.isRunning = false;
    timer.isBreak = false;
    timer.minutes = parseInt(focusTimeInput.value);
    timer.seconds = 0;
    
    pauseBtn.style.display = 'none';
    startBtn.style.display = 'inline-block';
    timerDisplay.classList.remove('pulse');
    sessionTypeDisplay.textContent = 'focus time';
    
    audio.pause();
    audio.currentTime = 0;
    
    updateDisplay();
}

function updateTimer() {
    if (timer.seconds === 0) {
        if (timer.minutes === 0) {
            timerComplete();
            return;
        }
        timer.minutes--;
        timer.seconds = 59;
    } else {
        timer.seconds--;
    }
    
    updateDisplay();
}

function timerComplete() {
    clearInterval(timer.intervalId);
    timer.isRunning = false;
    
    // Play notification sound
    playNotification();
    
    if (!timer.isBreak) {
        // Focus session completed
        timer.sessionsCompleted++;
        localStorage.setItem('sessionsCompleted', timer.sessionsCompleted);
        sessionCountDisplay.textContent = timer.sessionsCompleted;
        
        // Start break
        timer.isBreak = true;
        timer.minutes = parseInt(breakTimeInput.value);
        timer.seconds = 0;
        sessionTypeDisplay.textContent = 'break time';
        
        // Auto-start break after 3 seconds
        setTimeout(() => {
            if (!timer.isRunning) {
                startTimer();
            }
        }, 3000);
    } else {
        // Break completed
        timer.isBreak = false;
        timer.minutes = parseInt(focusTimeInput.value);
        timer.seconds = 0;
        sessionTypeDisplay.textContent = 'focus time';
    }
    
    pauseBtn.style.display = 'none';
    startBtn.style.display = 'inline-block';
    timerDisplay.classList.remove('pulse');
    audio.pause();
    
    updateDisplay();
}

function updateDisplay() {
    const minutes = timer.minutes.toString().padStart(2, '0');
    const seconds = timer.seconds.toString().padStart(2, '0');
    timerDisplay.textContent = `${minutes}:${seconds}`;
    
    // Update page title
    document.title = `${minutes}:${seconds} - Lo-fi Study Timer`;
}

function playNotification() {
    // Create a simple notification sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);