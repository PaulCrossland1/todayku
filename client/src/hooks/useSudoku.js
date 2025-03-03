import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export default function useSudoku() {
  const [puzzleId, setPuzzleId] = useState(null);
  const [originalPuzzle, setOriginalPuzzle] = useState([]);
  const [currentPuzzle, setCurrentPuzzle] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState([]);
  const [difficulty, setDifficulty] = useState('medium');
  
  // Fetch today's puzzle
  const fetchPuzzle = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await axios.get('/api/puzzles/today');
      setPuzzleId(res.data.id);
      setOriginalPuzzle(res.data.puzzle);
      setCurrentPuzzle(JSON.parse(JSON.stringify(res.data.puzzle)));
      setDifficulty(res.data.difficulty);
      
      // Initialize notes grid
      initializeNotes(res.data.puzzle);
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching puzzle:', err);
      setError('Failed to load today\'s puzzle');
      setIsLoading(false);
    }
  }, []);
  
  // Initialize notes grid
  const initializeNotes = useCallback((puzzle) => {
    const newNotes = [];
    
    for (let row = 0; row < 9; row++) {
      newNotes[row] = [];
      for (let col = 0; col < 9; col++) {
        newNotes[row][col] = Array(9).fill(false);
      }
    }
    
    setNotes(newNotes);
  }, []);
  
  // Update a cell's value
  const updateCell = useCallback((row, col, value) => {
    if (originalPuzzle[row][col] !== 0) {
      // Cannot modify original cells
      return false;
    }
    
    const newPuzzle = [...currentPuzzle];
    newPuzzle[row][col] = value;
    setCurrentPuzzle(newPuzzle);
    
    // Check if puzzle is complete
    checkCompletion(newPuzzle);
    
    return true;
  }, [originalPuzzle, currentPuzzle]);
  
  // Toggle a note for a cell
  const toggleNote = useCallback((row, col, noteValue) => {
    if (originalPuzzle[row][col] !== 0 || currentPuzzle[row][col] !== 0) {
      // Cannot add notes to filled cells
      return false;
    }
    
    const newNotes = [...notes];
    // Toggle the note (note values are 1-9, but array is 0-indexed)
    newNotes[row][col][noteValue - 1] = !newNotes[row][col][noteValue - 1];
    setNotes(newNotes);
    
    return true;
  }, [originalPuzzle, currentPuzzle, notes]);
  
  // Check if the puzzle is complete
  const checkCompletion = useCallback((puzzle) => {
    // Check if all cells are filled
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (puzzle[row][col] === 0) {
          setIsComplete(false);
          return false;
        }
      }
    }
    
    // Additional validation could be done here
    // For simplicity, we're just checking if all cells are filled
    // In a real app, we'd validate rows, columns, and 3x3 boxes
    
    setIsComplete(true);
    return true;
  }, []);
  
  // Submit solution to the server
  const submitSolution = useCallback(async (completionTime) => {
    if (!isComplete) return { success: false, message: 'Puzzle is not complete' };
    
    try {
      const res = await axios.post('/api/puzzles/submit', {
        puzzleId,
        solution: currentPuzzle,
        completionTime
      });
      
      return { success: true, message: res.data.message };
    } catch (err) {
      console.error('Error submitting solution:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to submit solution' 
      };
    }
  }, [puzzleId, currentPuzzle, isComplete]);
  
  // Load puzzle on component mount
  useEffect(() => {
    fetchPuzzle();
  }, [fetchPuzzle]);
  
  return {
    puzzleId,
    originalPuzzle,
    currentPuzzle,
    difficulty,
    notes,
    isLoading,
    isComplete,
    error,
    updateCell,
    toggleNote,
    submitSolution
  };
}