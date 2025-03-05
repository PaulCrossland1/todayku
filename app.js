// Todayku - Daily Sudoku Game
// Main Application Logic

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const timerElement = document.getElementById('timer');
    const sudokuGrid = document.getElementById('sudoku-grid');
    const numberPad = document.getElementById('number-pad');
    const welcomeModal = document.getElementById('welcome-modal');
    const successModal = document.getElementById('success-modal');
    const howToPlayModal = document.getElementById('how-to-play-modal');
    const welcomeDateElement = document.getElementById('welcome-date');
    const successDateElement = document.getElementById('success-date');
    const gameDateElement = document.getElementById('game-date');
    const completionTimeElement = document.getElementById('completion-time');
    const performanceEmojiElement = document.getElementById('performance-emoji');
    const shareResultElement = document.getElementById('share-result');
    const shareButton = document.getElementById('share-button');
    const shareNotification = document.getElementById('share-notification');
    
    // Game State
    let gameActive = false;
    let timerInterval = null;
    let startTime = null;
    let elapsedTime = 0;
    let selectedCell = null;
    let noteMode = false;
    let dailyPuzzle = null;
    let dailySolution = null;
    let playerBoard = [];
    let originalBoard = [];
    
    // Today's game number (days since game started - Jan 1, 2023)
    const gameStartDate = new Date(2023, 0, 1); // Jan 1, 2023
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const gameNumber = Math.floor((today - gameStartDate) / (1000 * 60 * 60 * 24)) + 1;
    
    // Format and display today's date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = today.toLocaleDateString(undefined, options);
    
    if (welcomeDateElement) welcomeDateElement.textContent = formattedDate;
    if (successDateElement) successDateElement.textContent = formattedDate;
    if (gameDateElement) gameDateElement.textContent = `Puzzle #${gameNumber} · ${formattedDate}`;
    
    // Initialize game on load
    init();
    
    function init() {
        // Show welcome modal when the page loads
        showModal(welcomeModal);
        
        // Generate today's puzzle using the existing sudoku.js
        generateDailyPuzzle();
        
        // Set up event listeners
        document.getElementById('start-game').addEventListener('click', startGame);
        document.getElementById('how-to-play').addEventListener('click', () => showModal(howToPlayModal));
        document.getElementById('close-how-to-play').addEventListener('click', () => hideModal(howToPlayModal));
        document.getElementById('close-success').addEventListener('click', () => hideModal(successModal));
        shareButton.addEventListener('click', shareResult);
        
        // Number pad event listeners
        const numberKeys = document.querySelectorAll('.number-key');
        numberKeys.forEach(key => {
            key.addEventListener('click', () => {
                if (!gameActive) return;
                const value = key.getAttribute('data-value');
                
                if (value === 'delete') {
                    clearSelectedCell();
                } else if (value === 'note') {
                    toggleNoteMode();
                    key.classList.toggle('active');
                } else if (value === 'clear') {
                    resetBoard();
                } else if (selectedCell) {
                    if (noteMode) {
                        toggleNote(selectedCell, value);
                    } else {
                        enterNumber(selectedCell, value);
                    }
                }
            });
        });
        
        // Keyboard event listeners
        document.addEventListener('keydown', handleKeyDown);
    }
    
    function generateDailyPuzzle() {
        // We need a consistent puzzle for all users on a given day
        // Use the game number to seed a pseudo-random number generator
        const seed = gameNumber;
        
        // Temporarily override Math.random for deterministic puzzle generation
        const originalRandom = Math.random;
        let seedValue = seed;
        
        // Simple seeded random function
        Math.random = function() {
            // Simple LCG (Linear Congruential Generator)
            seedValue = (seedValue * 9301 + 49297) % 233280;
            return seedValue / 233280;
        };
        
        // Generate a new "easy" sudoku puzzle using the seeded random
        dailyPuzzle = sudoku.generate("easy");
        
        // Store the solution for verification
        dailySolution = sudoku.solve(dailyPuzzle);
        
        // Convert puzzle string to 2D array
        originalBoard = sudoku.board_string_to_grid(dailyPuzzle);
        
        // Restore original Math.random
        Math.random = originalRandom;
    }
    
    function startGame() {
        hideModal(welcomeModal);
        
        // Initialize the player's board with the original puzzle
        playerBoard = originalBoard.map(row => [...row]);
        
        // Create the grid UI
        createSudokuGrid();
        
        // Start the timer
        startTimer();
        
        // Set game as active
        gameActive = true;
    }
    
    function createSudokuGrid() {
        sudokuGrid.innerHTML = '';
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell';
                cell.setAttribute('data-row', row);
                cell.setAttribute('data-col', col);
                
                const value = originalBoard[row][col];
                
                if (value !== '.') {
                    cell.textContent = value;
                    cell.classList.add('prefilled');
                } else {
                    // Create note container (hidden initially)
                    const notesContainer = document.createElement('div');
                    notesContainer.className = 'notes-container';
                    
                    for (let i = 1; i <= 9; i++) {
                        const note = document.createElement('div');
                        note.className = 'note';
                        note.setAttribute('data-note', i);
                        notesContainer.appendChild(note);
                    }
                    
                    cell.appendChild(notesContainer);
                    
                    // Add click event to empty cells
                    cell.addEventListener('click', () => selectCell(cell));
                }
                
                sudokuGrid.appendChild(cell);
            }
        }
    }
    
    function selectCell(cell) {
        if (!gameActive) return;
        
        // Remove highlighting from previously selected cell
        if (selectedCell) {
            selectedCell.classList.remove('selected');
            
            // Remove related highlights
            const relatedCells = document.querySelectorAll('.related');
            relatedCells.forEach(cell => cell.classList.remove('related'));
        }
        
        // Highlight new selected cell
        selectedCell = cell;
        selectedCell.classList.add('selected');
        
        // Highlight related cells (same row, column, and box)
        const row = parseInt(cell.getAttribute('data-row'));
        const col = parseInt(cell.getAttribute('data-col'));
        
        // Calculate box indices
        const boxStartRow = Math.floor(row / 3) * 3;
        const boxStartCol = Math.floor(col / 3) * 3;
        
        // Highlight related cells
        const cells = document.querySelectorAll('.sudoku-cell');
        cells.forEach(c => {
            const cRow = parseInt(c.getAttribute('data-row'));
            const cCol = parseInt(c.getAttribute('data-col'));
            
            const sameBox = (Math.floor(cRow / 3) === Math.floor(row / 3)) && 
                           (Math.floor(cCol / 3) === Math.floor(col / 3));
            
            if ((cRow === row || cCol === col || sameBox) && c !== selectedCell) {
                c.classList.add('related');
            }
        });
    }
    
    function enterNumber(cell, number) {
        if (cell.classList.contains('prefilled')) return;
        
        const row = parseInt(cell.getAttribute('data-row'));
        const col = parseInt(cell.getAttribute('data-col'));
        
        // Update the player board
        playerBoard[row][col] = number;
        
        // Update the UI
        // Remove any notes
        cell.innerHTML = '';
        cell.textContent = number;
        
        // Check if this move creates any errors
        checkErrors();
        
        // Check if the puzzle is complete
        if (isPuzzleComplete()) {
            stopTimer();
            showCompletionModal();
        }
    }
    
    function toggleNote(cell, number) {
        if (cell.classList.contains('prefilled')) return;
        
        // Ensure cell is in notes mode
        if (!cell.querySelector('.notes-container')) {
            cell.textContent = '';
            const notesContainer = document.createElement('div');
            notesContainer.className = 'notes-container';
            
            for (let i = 1; i <= 9; i++) {
                const note = document.createElement('div');
                note.className = 'note';
                note.setAttribute('data-note', i);
                notesContainer.appendChild(note);
            }
            
            cell.appendChild(notesContainer);
        }
        
        const noteElem = cell.querySelector(`.note[data-note="${number}"]`);
        
        if (noteElem.textContent === number) {
            noteElem.textContent = '';
        } else {
            noteElem.textContent = number;
        }
    }
    
    function clearSelectedCell() {
        if (!selectedCell || selectedCell.classList.contains('prefilled')) return;
        
        const row = parseInt(selectedCell.getAttribute('data-row'));
        const col = parseInt(selectedCell.getAttribute('data-col'));
        
        // Clear the player board
        playerBoard[row][col] = '.';
        
        // Clear the UI
        selectedCell.textContent = '';
        
        // Recreate the notes container
        const notesContainer = document.createElement('div');
        notesContainer.className = 'notes-container';
        
        for (let i = 1; i <= 9; i++) {
            const note = document.createElement('div');
            note.className = 'note';
            note.setAttribute('data-note', i);
            notesContainer.appendChild(note);
        }
        
        selectedCell.appendChild(notesContainer);
        
        // Remove any error class
        selectedCell.classList.remove('error');
    }
    
    function toggleNoteMode() {
        noteMode = !noteMode;
    }
    
    function resetBoard() {
        // Reset to original puzzle state
        playerBoard = originalBoard.map(row => [...row]);
        
        // Recreate the grid UI
        createSudokuGrid();
        
        // Reset selection
        selectedCell = null;
    }
    
    function checkErrors() {
        const cells = document.querySelectorAll('.sudoku-cell:not(.prefilled)');
        
        cells.forEach(cell => {
            const row = parseInt(cell.getAttribute('data-row'));
            const col = parseInt(cell.getAttribute('data-col'));
            
            if (playerBoard[row][col] === '.' || cell.textContent === '') return;
            
            // Check if value conflicts with any prefilled cells
            if (playerBoard[row][col] !== dailySolution[row * 9 + col]) {
                cell.classList.add('error');
            } else {
                cell.classList.remove('error');
            }
        });
    }
    
    function isPuzzleComplete() {
        const cells = document.querySelectorAll('.sudoku-cell');
        let complete = true;
        
        // Check if all cells are filled
        cells.forEach(cell => {
            const row = parseInt(cell.getAttribute('data-row'));
            const col = parseInt(cell.getAttribute('data-col'));
            
            if (playerBoard[row][col] === '.' || 
                playerBoard[row][col] !== dailySolution[row * 9 + col]) {
                complete = false;
            }
        });
        
        return complete;
    }
    
    function startTimer() {
        startTime = new Date();
        
        timerInterval = setInterval(() => {
            updateTimer();
        }, 1000);
        
        // Also track tab visibility to pause timer when user switches tabs
        document.addEventListener('visibilitychange', handleVisibilityChange);
    }
    
    function updateTimer() {
        const now = new Date();
        elapsedTime = now - startTime;
        
        // Format the time
        const formattedTime = formatTime(elapsedTime);
        timerElement.textContent = formattedTime;
    }
    
    function stopTimer() {
        clearInterval(timerInterval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
    
    function handleVisibilityChange() {
        if (document.hidden) {
            // Pause the timer
            clearInterval(timerInterval);
            
            // Store the elapsed time
            const now = new Date();
            elapsedTime = now - startTime;
        } else {
            // Resume the timer
            startTime = new Date() - elapsedTime;
            timerInterval = setInterval(updateTimer, 1000);
        }
    }
    
    function formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    function handleKeyDown(e) {
        if (!gameActive || !selectedCell) return;
        
        if (e.key >= '1' && e.key <= '9') {
            if (noteMode) {
                toggleNote(selectedCell, e.key);
            } else {
                enterNumber(selectedCell, e.key);
            }
        } else if (e.key === 'Backspace' || e.key === 'Delete') {
            clearSelectedCell();
        } else if (e.key === 'n' || e.key === 'N') {
            // Toggle note mode
            toggleNoteMode();
            document.querySelector('.note-key').classList.toggle('active');
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || 
                  e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            navigateWithArrows(e.key);
        }
    }
    
    function navigateWithArrows(key) {
        if (!selectedCell) return;
        
        const row = parseInt(selectedCell.getAttribute('data-row'));
        const col = parseInt(selectedCell.getAttribute('data-col'));
        let newRow = row;
        let newCol = col;
        
        switch (key) {
            case 'ArrowUp':
                newRow = Math.max(0, row - 1);
                break;
            case 'ArrowDown':
                newRow = Math.min(8, row + 1);
                break;
            case 'ArrowLeft':
                newCol = Math.max(0, col - 1);
                break;
            case 'ArrowRight':
                newCol = Math.min(8, col + 1);
                break;
        }
        
        const newCell = document.querySelector(`.sudoku-cell[data-row="${newRow}"][data-col="${newCol}"]`);
        if (newCell) {
            selectCell(newCell);
        }
    }
    
    function showCompletionModal() {
        // Format completion time
        const formattedTime = formatTime(elapsedTime);
        completionTimeElement.textContent = formattedTime;
        
        // Set performance emoji based on time
        setPerformanceEmoji(elapsedTime);
        
        // Generate share text
        const shareText = `Todayku #${gameNumber}\nI completed today's sudoku in ${formattedTime}. Can you beat it?\nhttps://todayku.com`;
        shareResultElement.textContent = shareText;
        
        // Show the success modal with confetti
        showModal(successModal);
        showConfetti();
    }
    
    function setPerformanceEmoji(time) {
        // Set performance emoji based on completion time
        const seconds = Math.floor(time / 1000);
        
        let emoji = '';
        if (seconds < 120) { // Under 2 minutes
            emoji = '🏆 Amazing! 🏆';
        } else if (seconds < 240) { // Under 4 minutes
            emoji = '🎯 Great job! 🎯';
        } else if (seconds < 360) { // Under 6 minutes
            emoji = '😊 Well done! 😊';
        } else if (seconds < 480) { // Under 8 minutes
            emoji = '👍 Good work! 👍';
        } else {
            emoji = '✅ Completed! ✅';
        }
        
        performanceEmojiElement.textContent = emoji;
    }
    
    function shareResult() {
        const shareText = shareResultElement.textContent;
        
        // Copy to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
            // Show notification
            shareNotification.classList.add('show');
            
            // Hide notification after 3 seconds
            setTimeout(() => {
                shareNotification.classList.remove('show');
            }, 3000);
        });
    }
    
    function showModal(modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
    
    function hideModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }
    
    function showConfetti() {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
        
        const randomInRange = (min, max) => Math.random() * (max - min) + min;
        
        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();
            
            if (timeLeft <= 0) {
                return clearInterval(interval);
            }
            
            const particleCount = 50 * (timeLeft / duration);
            
            // Since particles fall down, start a bit higher than random
            confetti(Object.assign({}, defaults, { 
                particleCount, 
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } 
            }));
            confetti(Object.assign({}, defaults, { 
                particleCount, 
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } 
            }));
        }, 250);
    }
});

// Nothing needed here - we're using a simpler approach in the generateDailyPuzzle function