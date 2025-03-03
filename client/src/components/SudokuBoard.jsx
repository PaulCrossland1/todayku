import React, { useState, useContext, useEffect, useCallback } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import '../styles/SudokuBoard.css';

const SudokuBoard = ({ 
  originalPuzzle, 
  currentPuzzle, 
  notes, 
  updateCell, 
  toggleNote, 
  isComplete,
  isGameActive,
  animateSuccess
}) => {
  const { theme } = useContext(ThemeContext);
  const [selectedCell, setSelectedCell] = useState(null);
  const [isNoteMode, setIsNoteMode] = useState(false);
  const [lastUpdatedCell, setLastUpdatedCell] = useState(null);
  const [highlightedDigit, setHighlightedDigit] = useState(null);
  const [showHints, setShowHints] = useState(false);
  
  // Handle keyboard input
  useEffect(() => {
    if (!isGameActive) return;
    
    const handleKeyDown = (e) => {
      if (!selectedCell) return;
      
      const { row, col } = selectedCell;
      
      // Handle number keys
      if (e.key >= '1' && e.key <= '9') {
        const num = parseInt(e.key);
        
        if (isNoteMode) {
          toggleNote(row, col, num);
        } else {
          if (updateCell(row, col, num)) {
            setLastUpdatedCell({ row, col });
          }
          setHighlightedDigit(num);
        }
        
        return;
      }
      
      // Handle backspace/delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (updateCell(row, col, 0)) {
          setLastUpdatedCell({ row, col });
        }
        setHighlightedDigit(null);
        return;
      }
      
      // Handle arrow keys for navigation
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        navigateWithArrows(e.key);
      }
      
      // Toggle note mode with 'n' key
      if (e.key.toLowerCase() === 'n') {
        setIsNoteMode(!isNoteMode);
      }
      
      // Toggle hints with 'h' key
      if (e.key.toLowerCase() === 'h') {
        setShowHints(!showHints);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, isNoteMode, updateCell, toggleNote, isGameActive, showHints]);
  
  // Clear last updated cell highlight after 1 second
  useEffect(() => {
    if (lastUpdatedCell) {
      const timer = setTimeout(() => {
        setLastUpdatedCell(null);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [lastUpdatedCell]);
  
  // Navigate with arrow keys
  const navigateWithArrows = (key) => {
    if (!selectedCell) return;
    
    const { row, col } = selectedCell;
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
      default:
        break;
    }
    
    setSelectedCell({ row: newRow, col: newCol });
  };
  
  // Handle cell click
  const handleCellClick = (row, col) => {
    // Don't allow selection if game is not active
    if (!isGameActive) return;
    
    // If clicking the same cell, toggle note mode
    if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
      if (originalPuzzle[row][col] === 0 && currentPuzzle[row][col] === 0) {
        setIsNoteMode(!isNoteMode);
      }
    } else {
      setSelectedCell({ row, col });
    }
    
    // Set highlighted digit based on the cell value
    if (currentPuzzle[row][col] !== 0) {
      setHighlightedDigit(currentPuzzle[row][col]);
    } else {
      setHighlightedDigit(null);
    }
  };
  
  // Handle right click for notes
  const handleCellRightClick = (e, row, col) => {
    e.preventDefault();
    
    // Don't allow notes if game is not active
    if (!isGameActive) return;
    
    setSelectedCell({ row, col });
    setIsNoteMode(true);
  };
  
  // Check if a given cell has any conflicts
  const hasConflict = (row, col, value) => {
    if (value === 0) return false;
    
    // Skip original cells (they can't have conflicts)
    if (originalPuzzle[row][col] !== 0) return false;
    
    // Check row for conflicts
    for (let c = 0; c < 9; c++) {
      if (c !== col && currentPuzzle[row][c] === value) {
        return true;
      }
    }
    
    // Check column for conflicts
    for (let r = 0; r < 9; r++) {
      if (r !== row && currentPuzzle[r][col] === value) {
        return true;
      }
    }
    
    // Check 3x3 box for conflicts
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if ((r !== row || c !== col) && currentPuzzle[r][c] === value) {
          return true;
        }
      }
    }
    
    return false;
  };
  
  // Render a single sudoku cell
  const renderCell = (row, col) => {
    const value = currentPuzzle[row][col];
    const isOriginal = originalPuzzle[row][col] !== 0;
    const isSelected = selectedCell && selectedCell.row === row && selectedCell.col === col;
    const isSameValue = value !== 0 && highlightedDigit === value;
    const isSameRow = selectedCell && selectedCell.row === row && !isSelected;
    const isSameCol = selectedCell && selectedCell.col === col && !isSelected;
    const isSameBox = selectedCell && 
                     Math.floor(selectedCell.row / 3) === Math.floor(row / 3) && 
                     Math.floor(selectedCell.col / 3) === Math.floor(col / 3) && 
                     !isSelected;
    const isLastUpdated = lastUpdatedCell && lastUpdatedCell.row === row && lastUpdatedCell.col === col;
    const hasError = hasConflict(row, col, value);
    
    // Cell styling
    let cellClass = "sudoku-cell";
    if (isSelected) cellClass += " selected";
    if (isSameValue) cellClass += " same-value";
    if (isSameRow || isSameCol) cellClass += " same-row-col";
    if (isSameBox) cellClass += " same-box";
    if (isOriginal) cellClass += " original";
    if (isLastUpdated) cellClass += " last-updated";
    if (hasError) cellClass += " error";
    
    // Border styling
    const isRightEdge = col === 2 || col === 5;
    const isBottomEdge = row === 2 || row === 5;
    if (isRightEdge) cellClass += " right-edge";
    if (isBottomEdge) cellClass += " bottom-edge";
    
    const cellStyle = {
      backgroundColor: isSelected 
        ? theme.primary 
        : isOriginal 
          ? `${theme.secondary}40` 
          : hasError
            ? '#ff000015'
            : isLastUpdated
              ? `${theme.primary}35`
              : isSameValue 
                ? `${theme.primary}30` 
                : (isSameRow || isSameCol || isSameBox) 
                  ? `${theme.primary}15` 
                  : undefined,
      color: isSelected 
        ? '#fff' 
        : hasError
          ? '#d32f2f'
          : isOriginal 
            ? theme.text 
            : theme.textSecondary,
      transition: isLastUpdated ? 'background-color 0.3s ease-in-out' : undefined
    };
    
    return (
      <div
        key={`cell-${row}-${col}`}
        className={cellClass}
        style={cellStyle}
        onClick={() => handleCellClick(row, col)}
        onContextMenu={(e) => handleCellRightClick(e, row, col)}
      >
        {value !== 0 ? (
          <span className={isOriginal ? "original-value" : "user-value"}>
            {value}
          </span>
        ) : (
          <div className="notes-container">
            {notes[row][col].map((isActive, index) => (
              <div 
                key={`note-${row}-${col}-${index}`} 
                className={`note-value ${isActive ? 'active' : ''}`}
                style={{ color: isActive ? theme.textSecondary : 'transparent' }}
              >
                {index + 1}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="sudoku-container">
      <div className="sudoku-controls">
        <button 
          className={`note-toggle ${isNoteMode ? 'active' : ''}`}
          onClick={() => setIsNoteMode(!isNoteMode)}
          style={{ 
            backgroundColor: isNoteMode ? theme.primary : theme.secondary,
            color: isNoteMode ? '#fff' : theme.text
          }}
        >
          Notes {isNoteMode ? 'ON' : 'OFF'}
        </button>
        
        <button 
          className={`hint-toggle ${showHints ? 'active' : ''}`}
          onClick={() => setShowHints(!showHints)}
          style={{ 
            backgroundColor: showHints ? theme.primary : theme.secondary,
            color: showHints ? '#fff' : theme.text,
            marginLeft: '8px'
          }}
        >
          Highlight Errors
        </button>
      </div>
      
      <div 
        className={`sudoku-board ${isComplete && animateSuccess ? 'completed' : ''}`} 
        style={{ borderColor: isComplete && animateSuccess ? '#4CAF50' : theme.text }}
      >
        {currentPuzzle.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="sudoku-row">
            {row.map((_, colIndex) => renderCell(rowIndex, colIndex))}
          </div>
        ))}
      </div>
      
      {/* Number controls for mobile */}
      <div className="number-controls">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={`num-${num}`}
            className={`number-button ${highlightedDigit === num ? 'highlighted' : ''}`}
            onClick={() => {
              if (!selectedCell || !isGameActive) return;
              
              if (isNoteMode) {
                toggleNote(selectedCell.row, selectedCell.col, num);
              } else {
                if (updateCell(selectedCell.row, selectedCell.col, num)) {
                  setLastUpdatedCell({ row: selectedCell.row, col: selectedCell.col });
                }
                setHighlightedDigit(num);
              }
            }}
            style={{ 
              backgroundColor: highlightedDigit === num ? theme.primary : theme.secondary,
              color: highlightedDigit === num ? '#fff' : theme.text
            }}
          >
            {num}
          </button>
        ))}
        <button
          className="number-button"
          onClick={() => {
            if (!selectedCell || !isGameActive) return;
            if (updateCell(selectedCell.row, selectedCell.col, 0)) {
              setLastUpdatedCell({ row: selectedCell.row, col: selectedCell.col });
            }
            setHighlightedDigit(null);
          }}
          style={{ 
            backgroundColor: theme.secondary,
            color: theme.text
          }}
        >
          ⌫
        </button>
      </div>
      
      {/* Keyboard shortcut help */}
      {isGameActive && (
        <div className="keyboard-shortcuts" style={{ color: theme.textSecondary }}>
          <p>Keyboard shortcuts: [N] Toggle Notes | [H] Highlight Errors | Arrow Keys to Navigate</p>
        </div>
      )}
    </div>
  );
};

export default SudokuBoard;