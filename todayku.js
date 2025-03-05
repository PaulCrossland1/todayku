document.addEventListener('DOMContentLoaded', function() {
    // Game variables
    let gameBoard = null;                    // The current game board
    let solution = null;                     // Solution to the current game
    let startTime = null;                    // Time when the game started
    let timerInterval = null;                // Interval for updating the timer
    let selectedCell = null;                 // Currently selected cell
    let isNoteMode = false;                  // Whether note mode is active
    let userInputs = {};                     // User inputs: { cellId: number }
    let cellNotes = {};                      // Cell notes: { cellId: [numbers] }
    let gameComplete = false;                // Whether the game is complete
    
    // DOM elements
    const gameContainer = document.querySelector('.game-container');
    const sudokuContainer = document.getElementById('sudoku-container');
    const timerElement = document.getElementById('timer');
    const keys = document.querySelectorAll('.key');
    const howToPlayButton = document.getElementById('how-to-play');
    const gameDateElement = document.getElementById('game-date');
    
    // Helper functions for date formatting and sharing
    function getFormattedDate() {
        const today = new Date();
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        return today.toLocaleDateString('en-US', options);
    }
    
    function getDayOfYear() {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now - start;
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }
    
    function formatTime(timeInSeconds) {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    function copyToClipboard(text) {
        // Create temporary element
        const tempElement = document.createElement('textarea');
        tempElement.value = text;
        tempElement.setAttribute('readonly', '');
        tempElement.style.position = 'absolute';
        tempElement.style.left = '-9999px';
        document.body.appendChild(tempElement);
        
        // Select and copy
        tempElement.select();
        document.execCommand('copy');
        
        // Clean up
        document.body.removeChild(tempElement);
    }
    
    function updateDateDisplay() {
        const formattedDate = getFormattedDate();
        if (gameDateElement) {
            gameDateElement.textContent = formattedDate;
        }
    }
    
    // Game initialization
    function initGame() {
        // Update date display
        updateDateDisplay();
        
        // Check if there's a saved game for today
        const savedGame = localStorage.getItem('todaykuDaily');
        if (savedGame) {
            const gameData = JSON.parse(savedGame);
            const savedDate = new Date(gameData.date);
            const today = new Date();
            
            // Check if the saved game is from today
            if (savedDate.toDateString() === today.toDateString()) {
                loadSavedGame(gameData);
                return;
            }
        }
        
        // Otherwise, create a new game
        createNewGame();
    }
    
    function createNewGame() {
        // Create a new game using the sudoku library
        // Use the day of the year as a seed to ensure everyone gets the same puzzle
        const seed = getDayOfYear();
        
        // Generate a new sudoku puzzle (always easy difficulty)
        gameBoard = sudoku.generate("easy");
        
        // Get the solution by solving the board
        solution = sudoku.solve(gameBoard);
        
        // Create the UI for the game
        createSudokuGrid(gameBoard);
        
        // Show the intro modal
        showIntroModal();
    }
    
    function loadSavedGame(gameData) {
        // Load game data
        gameBoard = gameData.board;
        solution = gameData.solution;
        userInputs = gameData.userInputs;
        cellNotes = gameData.cellNotes;
        startTime = gameData.elapsedTime ? Date.now() - (gameData.elapsedTime * 1000) : Date.now();
        gameComplete = gameData.complete || false;
        
        // Restore note mode if it was saved
        isNoteMode = gameData.isNoteMode || false;
        
        // Create the UI for the game
        createSudokuGrid(gameBoard);
        
        // Update the note button state if in note mode
        if (isNoteMode) {
            const noteButton = document.querySelector('.key[data-key="NOTE"]');
            if (noteButton) {
                noteButton.classList.add('active');
            }
        }
        
        // Start the timer if the game isn't complete
        if (!gameComplete) {
            startTimer();
        } else {
            // Just display the final time
            const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
            timerElement.textContent = formatTime(elapsedTime);
            
            // Show completion modal
            setTimeout(() => {
                showCompletionModal(elapsedTime);
            }, 500);
        }
    }
    
    function startTimer() {
        startTime = Date.now();
        
        timerInterval = setInterval(() => {
            const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
            timerElement.textContent = formatTime(elapsedTime);
        }, 1000);
    }
    
    function stopTimer() {
        clearInterval(timerInterval);
    }
    
    function saveGame() {
        // Calculate elapsed time
        const elapsedTime = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
        
        const gameData = {
            date: new Date().toISOString(),
            board: gameBoard,
            solution: solution,
            userInputs: userInputs,
            cellNotes: cellNotes,
            elapsedTime: elapsedTime,
            complete: gameComplete,
            isNoteMode: isNoteMode
        };
        
        localStorage.setItem('todaykuDaily', JSON.stringify(gameData));
    }
    
    // UI creation functions
    function createSudokuGrid(board) {
        // Clear existing content
        sudokuContainer.innerHTML = '';
        
        // Create a grid container
        const grid = document.createElement('div');
        grid.className = 'sudoku-grid';
        
        // Convert board string to a 2D array
        const boardArray = sudoku.board_string_to_grid(board);
        
        // Create cells
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cellValue = boardArray[row][col];
                const cell = document.createElement('div');
                const cellId = `cell-${row}-${col}`;
                
                cell.className = 'sudoku-cell';
                cell.id = cellId;
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.dataset.value = cellValue;
                
                // Mark cell as given or empty
                if (cellValue !== '.') {
                    cell.classList.add('given');
                    cell.textContent = cellValue;
                    // Add click event for given cells too
                    cell.addEventListener('click', handleCellClick);
                } else {
                    // Check if there's a user input for this cell
                    if (userInputs[cellId]) {
                        cell.textContent = userInputs[cellId];
                        cell.classList.add('user-input');
                    } else if (cellNotes[cellId] && cellNotes[cellId].length > 0) {
                        // Create notes container
                        createNotes(cell, cellNotes[cellId]);
                    }
                    
                    // Add click event for empty cells
                    cell.addEventListener('click', handleCellClick);
                }
                
                grid.appendChild(cell);
            }
        }
        
        sudokuContainer.appendChild(grid);
        
        // Ensure grid remains square by calculating dimensions based on available space
        const resizeGrid = () => {
            const containerWidth = sudokuContainer.clientWidth;
            const containerHeight = sudokuContainer.clientHeight;
            const size = Math.min(containerWidth, containerHeight, 350);
            
            grid.style.width = `${size}px`;
            grid.style.height = `${size}px`;
        };
        
        // Call immediately and add resize listener
        resizeGrid();
        window.addEventListener('resize', resizeGrid);
    }
    
    function createNotes(cell, notes) {
        // Clear existing notes
        const existingNotes = cell.querySelector('.sudoku-notes');
        if (existingNotes) {
            cell.removeChild(existingNotes);
        }
        
        // Create notes container
        const notesContainer = document.createElement('div');
        notesContainer.className = 'sudoku-notes';
        
        // Create a grid of possible values
        for (let i = 1; i <= 9; i++) {
            const noteElement = document.createElement('div');
            noteElement.className = 'note';
            
            if (notes.includes(i.toString())) {
                noteElement.textContent = i;
            }
            
            notesContainer.appendChild(noteElement);
        }
        
        cell.appendChild(notesContainer);
    }
    
    // Event handlers
    function handleCellClick(event) {
        if (gameComplete) return;
        
        // Deselect the previously selected cell
        if (selectedCell) {
            selectedCell.classList.remove('selected');
        }
        
        // Select the new cell
        const cell = event.target.closest('.sudoku-cell');
        cell.classList.add('selected');
        selectedCell = cell;
        
        // Highlight all cells with same value
        const value = cell.textContent;
        if (value && value !== '') {
            highlightMatchingCells(value);
        } else {
            clearHighlightedCells();
        }
    }
    
    function highlightMatchingCells(value) {
        // Clear previous highlights
        clearHighlightedCells();
        
        // Find all cells with the same value
        const cells = document.querySelectorAll('.sudoku-cell');
        cells.forEach(cell => {
            if (cell.textContent === value) {
                cell.classList.add('highlighted');
            }
        });
    }
    
    function clearHighlightedCells() {
        const highlightedCells = document.querySelectorAll('.sudoku-cell.highlighted');
        highlightedCells.forEach(cell => {
            cell.classList.remove('highlighted');
        });
    }
    
    function handleKeyInput(key) {
        if (gameComplete || !selectedCell) return;
        
        const cellId = selectedCell.id;
        const row = parseInt(selectedCell.dataset.row);
        const col = parseInt(selectedCell.dataset.col);
        
        // Handle number input
        if (/^[1-9]$/.test(key)) {
            if (isNoteMode) {
                // Notes mode
                if (!cellNotes[cellId]) {
                    cellNotes[cellId] = [];
                }
                
                const index = cellNotes[cellId].indexOf(key);
                if (index === -1) {
                    // Add note
                    cellNotes[cellId].push(key);
                } else {
                    // Remove note
                    cellNotes[cellId].splice(index, 1);
                }
                
                // Update notes display
                createNotes(selectedCell, cellNotes[cellId]);
                
                // Clear value if it was set
                if (userInputs[cellId]) {
                    delete userInputs[cellId];
                    selectedCell.textContent = '';
                    selectedCell.classList.remove('user-input');
                }
            } else {
                // Normal mode - enter value
                userInputs[cellId] = key;
                selectedCell.textContent = key;
                selectedCell.classList.add('user-input');
                
                // Clear any notes
                if (cellNotes[cellId]) {
                    delete cellNotes[cellId];
                    const notesContainer = selectedCell.querySelector('.sudoku-notes');
                    if (notesContainer) {
                        selectedCell.removeChild(notesContainer);
                    }
                }
                
                // Highlight matching cells
                highlightMatchingCells(key);
                
                // Check if the game is complete
                checkGameCompletion();
            }
        } else if (key === 'DELETE') {
            // Clear cell
            if (userInputs[cellId]) {
                delete userInputs[cellId];
                selectedCell.textContent = '';
                selectedCell.classList.remove('user-input');
            }
            
            // Clear notes
            if (cellNotes[cellId]) {
                delete cellNotes[cellId];
                const notesContainer = selectedCell.querySelector('.sudoku-notes');
                if (notesContainer) {
                    selectedCell.removeChild(notesContainer);
                }
            }
            
            clearHighlightedCells();
        } else if (key === 'CLEAR') {
            // Clear all user inputs and notes
            clearGame();
        } else if (key === 'NOTE') {
            // Toggle note mode
            isNoteMode = !isNoteMode;
            const noteButton = document.querySelector('.key[data-key="NOTE"]');
            
            if (isNoteMode) {
                noteButton.classList.add('active');
            } else {
                noteButton.classList.remove('active');
            }
        }
        
        // Save the game state
        saveGame();
    }
    
    function clearGame() {
        // Clear all user inputs and notes
        userInputs = {};
        cellNotes = {};
        
        // Refresh the grid
        createSudokuGrid(gameBoard);
        
        // Clear selection
        selectedCell = null;
        
        // Reset note mode
        isNoteMode = false;
        const noteButton = document.querySelector('.key[data-key="NOTE"]');
        if (noteButton) {
            noteButton.classList.remove('active');
        }

        // Save the cleared state
        saveGame();
    }
    
    function checkGameCompletion() {
        // Get all cells
        const cells = document.querySelectorAll('.sudoku-cell');
        
        // Check if all cells have values
        for (const cell of cells) {
            if (cell.textContent === '') {
                return false;
            }
        }
        
        // Check if the solution is correct
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cellId = `cell-${row}-${col}`;
                const cell = document.getElementById(cellId);
                
                // Skip given cells
                if (cell.classList.contains('given')) {
                    continue;
                }
                
                // Check user input against solution
                const cellValue = userInputs[cellId];
                const solutionValue = solution.charAt(row * 9 + col);
                
                if (cellValue !== solutionValue) {
                    return false;
                }
            }
        }
        
        // If we get here, the game is complete!
        gameComplete = true;
        stopTimer();
        
        // Show completion modal
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        setTimeout(() => {
            showCompletionModal(elapsedTime);
        }, 500);
        
        saveGame();
        return true;
    }
    
    // Modal functions
    function showIntroModal() {
        // Check if user has seen the tutorial before
        const hasSeenTutorial = localStorage.getItem('todaykuTutorialSeen') === 'true';
        if (hasSeenTutorial) {
            startTimer();
            return;
        }
        
        // Create modal container
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        
        const modalContainer = document.createElement('div');
        modalContainer.className = 'modal-container';
        
        // Modal header
        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';
        
        const modalTitle = document.createElement('h2');
        modalTitle.textContent = 'WELCOME TO TODAYKU';
        
        const closeButton = document.createElement('button');
        closeButton.className = 'modal-close';
        closeButton.textContent = '×';
        closeButton.onclick = closeModal;
        
        modalHeader.appendChild(modalTitle);
        modalHeader.appendChild(closeButton);
        
        // Modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        modalContent.innerHTML = `
            <p>Ready for today's sudoku challenge? Here's how to play:</p>
            <br>
            <div class="rule-section">
                <div class="rule-number">1</div>
                <div class="rule-text">
                    <p>Fill in the 9×9 grid so that each row, column, and 3×3 box contains all digits from 1 to 9.</p>
                </div>
            </div>
            
            <div class="rule-section">
                <div class="rule-number">2</div>
                <div class="rule-text">
                    <p>Tap a cell to select it, then use the number pad to enter a value.</p>
                </div>
            </div>
            
            <div class="rule-section">
                <div class="rule-number">3</div>
                <div class="rule-text">
                    <p>Use the NOTE button to toggle note-taking mode for adding multiple candidates to a cell.</p>
                </div>
            </div>
            
            <div class="rule-section">
                <div class="rule-number">4</div>
                <div class="rule-text">
                    <p>Try to solve the puzzle as quickly as possible! Your time will be recorded.</p>
                </div>
            </div>
            
            <div class="rule-section">
                <div class="rule-number">5</div>
                <div class="rule-text">
                    <p>A new puzzle is available every day. Come back tomorrow for a new challenge!</p>
                </div>
            </div>
        `;
        
        // Modal footer
        const modalFooter = document.createElement('div');
        modalFooter.className = 'modal-footer';
        
        const playButton = document.createElement('button');
        playButton.className = 'modal-play-button';
        playButton.textContent = 'LET\'S GO';
        playButton.onclick = () => {
            closeModal();
            startTimer();
            localStorage.setItem('todaykuTutorialSeen', 'true');
        };
        
        modalFooter.appendChild(playButton);
        
        // Assemble modal
        modalContainer.appendChild(modalHeader);
        modalContainer.appendChild(modalContent);
        modalContainer.appendChild(modalFooter);
        modalOverlay.appendChild(modalContainer);
        
        document.body.appendChild(modalOverlay);
        
        // Prevent scrolling when modal is open
        document.body.style.overflow = 'hidden';
    }
    
    function showHowToPlayModal() {
        // Create modal container
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        
        const modalContainer = document.createElement('div');
        modalContainer.className = 'modal-container';
        
        // Modal header
        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';
        
        const modalTitle = document.createElement('h2');
        modalTitle.textContent = 'HOW TO PLAY';
        
        const closeButton = document.createElement('button');
        closeButton.className = 'modal-close';
        closeButton.textContent = '×';
        closeButton.onclick = closeModal;
        
        modalHeader.appendChild(modalTitle);
        modalHeader.appendChild(closeButton);
        
        // Modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        modalContent.innerHTML = `
            <p>Sudoku is a logic-based number placement puzzle.</p>
            <br>
            <div class="rule-section">
                <div class="rule-number">1</div>
                <div class="rule-text">
                    <p>Fill in the 9×9 grid so that each row, column, and 3×3 box contains all digits from 1 to 9.</p>
                </div>
            </div>
            
            <div class="rule-section">
                <div class="rule-number">2</div>
                <div class="rule-text">
                    <p>Tap a cell to select it, then use the number pad to enter a value.</p>
                </div>
            </div>
            
            <div class="rule-section">
                <div class="rule-number">3</div>
                <div class="rule-text">
                    <p>Use special keys:</p>
                    <p>• DEL: Clear the selected cell</p>
                    <p>• CLR: Clear all your inputs</p>
                    <p>• NOTE: Toggle note-taking mode</p>
                </div>
            </div>
            
            <div class="rule-section">
                <div class="rule-number">4</div>
                <div class="rule-text">
                    <p>When you select a cell with a number, all cells with the same number will be highlighted to help you solve the puzzle.</p>
                </div>
            </div>
        `;
        
        // Modal footer
        const modalFooter = document.createElement('div');
        modalFooter.className = 'modal-footer';
        
        const closeModalButton = document.createElement('button');
        closeModalButton.className = 'modal-play-button';
        closeModalButton.textContent = 'CLOSE';
        closeModalButton.onclick = closeModal;
        
        modalFooter.appendChild(closeModalButton);
        
        // Assemble modal
        modalContainer.appendChild(modalHeader);
        modalContainer.appendChild(modalContent);
        modalContainer.appendChild(modalFooter);
        modalOverlay.appendChild(modalContainer);
        
        document.body.appendChild(modalOverlay);
        
        // Prevent scrolling when modal is open
        document.body.style.overflow = 'hidden';
    }
    
    function showCompletionModal(timeInSeconds) {
        // Create modal container
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        
        const modalContainer = document.createElement('div');
        modalContainer.className = 'modal-container';
        
        // Modal header
        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header completion-modal-header';
        
        const modalTitle = document.createElement('h2');
        modalTitle.textContent = 'Puzzle Complete!';
        modalTitle.className = 'success-title';
        
        const closeButton = document.createElement('button');
        closeButton.className = 'modal-close';
        closeButton.textContent = '×';
        closeButton.onclick = closeModal;
        
        modalHeader.appendChild(modalTitle);
        modalHeader.appendChild(closeButton);
        
        // Modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        // Game number (day of year)
        const gameNumber = getDayOfYear();
        
        // Performance rating based on time
        let performanceEmoji = '';
        if (timeInSeconds < 300) { // Under 5 minutes
            performanceEmoji = '🔥🔥🔥'; // Amazing
        } else if (timeInSeconds < 600) { // Under 10 minutes
            performanceEmoji = '🔥🔥'; // Great
        } else if (timeInSeconds < 900) { // Under 15 minutes
            performanceEmoji = '🔥'; // Good
        } else {
            performanceEmoji = '👍'; // Nice work
        }
        
        // Create text for share message
        const formattedTime = formatTime(timeInSeconds);
        const shareText = `Todayku #${gameNumber} - ${formattedTime} ${performanceEmoji}\nhttps://todayku.day`;
        
        // Configure message text
        const messageText = document.createElement('p');
        messageText.className = 'result-message';
        messageText.textContent = `Puzzle #${gameNumber} completed in ${formattedTime}`;
        
        // Performance graph
        const performanceGraph = document.createElement('div');
        performanceGraph.className = 'performance-graph';
        performanceGraph.textContent = performanceEmoji;
        
        // Create share button
        const shareButton = document.createElement('button');
        shareButton.textContent = 'SHARE RESULTS';
        shareButton.className = 'share-button';
        shareButton.onclick = function() {
            copyToClipboard(shareText);
            const originalText = this.textContent;
            this.textContent = 'COPIED!';
            setTimeout(() => {
                this.textContent = originalText;
            }, 2000);
        };
        
        // Add message and performance graph to content
        modalContent.appendChild(messageText);
        modalContent.appendChild(performanceGraph);
        modalContent.appendChild(shareButton);
        
        // Modal footer
        const modalFooter = document.createElement('div');
        modalFooter.className = 'modal-footer';
        
        const closeModalButton = document.createElement('button');
        closeModalButton.className = 'modal-play-button';
        closeModalButton.textContent = 'CLOSE';
        closeModalButton.onclick = closeModal;
        
        modalFooter.appendChild(closeModalButton);
        
        // Assemble modal
        modalContainer.appendChild(modalHeader);
        modalContainer.appendChild(modalContent);
        modalContainer.appendChild(modalFooter);
        modalOverlay.appendChild(modalContainer);
        
        document.body.appendChild(modalOverlay);
        
        // Prevent scrolling when modal is open
        document.body.style.overflow = 'hidden';
    }
    
    function closeModal() {
        const modalOverlay = document.querySelector('.modal-overlay');
        if (modalOverlay) {
            // Add closing animation
            modalOverlay.classList.add('closing');
            
            // Wait for animation to complete before removing
            setTimeout(() => {
                document.body.removeChild(modalOverlay);
                document.body.style.overflow = '';
            }, 300);
        }
    }
    
    // Event listeners
    keys.forEach(key => {
        // Use a single touchstart/click event handler
        key.addEventListener('mousedown', handleKeyboardEvent);
        key.addEventListener('touchstart', handleKeyboardEvent);
        
        // Prevent default touch behaviors
        key.addEventListener('touchend', function(e) {
            e.preventDefault();
        });
    });
    
    function handleKeyboardEvent(e) {
        e.preventDefault();
        
        const keyValue = this.getAttribute('data-key');
        
        // Add visual feedback, but handle NOTE button specially
        if (keyValue !== 'NOTE') {
            // For non-NOTE buttons, add temporary active class
            this.classList.add('active');
            setTimeout(() => {
                this.classList.remove('active');
            }, 150);
        } else {
            // For NOTE button, the active class will be toggled in handleKeyInput
            // We don't add or remove it here with a timeout
        }
        
        handleKeyInput(keyValue);
    }
    
    // Support physical keyboard for desktop
    document.addEventListener('keydown', function(event) {
        if (gameComplete) return;
        
        const key = event.key;
        
        if (/^[1-9]$/.test(key)) {
            handleKeyInput(key);
            
            // Add visual feedback to the corresponding key
            const keyElement = document.querySelector(`.key[data-key="${key}"]`);
            if (keyElement) {
                keyElement.classList.add('active');
                setTimeout(() => {
                    keyElement.classList.remove('active');
                }, 150);
            }
        } else if (key === 'Delete' || key === 'Backspace') {
            handleKeyInput('DELETE');
            
            // Add visual feedback
            const keyElement = document.querySelector(`.key[data-key="DELETE"]`);
            if (keyElement) {
                keyElement.classList.add('active');
                setTimeout(() => {
                    keyElement.classList.remove('active');
                }, 150);
            }
        } else if (key === 'Escape') {
            handleKeyInput('CLEAR');
            
            // Add visual feedback
            const keyElement = document.querySelector(`.key[data-key="CLEAR"]`);
            if (keyElement) {
                keyElement.classList.add('active');
                setTimeout(() => {
                    keyElement.classList.remove('active');
                }, 150);
            }
        } else if (key === 'n' || key === 'N') {
            handleKeyInput('NOTE');
            // Note: visual feedback for NOTE is handled inside handleKeyInput
        }
    });
    
    // Connect the "How to Play" button to the modal
    howToPlayButton.addEventListener('click', function(e) {
        e.preventDefault();
        showHowToPlayModal();
    });
    
    // Initialize the game
    initGame();
    
    // Save game state periodically
    setInterval(saveGame, 30000); // Every 30 seconds
});