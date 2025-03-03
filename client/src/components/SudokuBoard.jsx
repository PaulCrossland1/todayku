import React, { useState, useContext, useEffect } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import '../styles/SudokuBoard.css';

const SudokuBoard = ({ 
  originalPuzzle, 
  currentPuzzle, 
  notes, 
  updateCell, 
  toggleNote, 
  isComplete,
  isGameActive 
}) => {
  const { theme } = useContext(ThemeContext);
  const [selectedCell, setSelectedCell] = useState(null);
  const [isNoteMode, setIsNoteMode] = useState(false);
  
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
          updateCell(row, col, num);
        }
        
        return;
      }
      
      // Handle backspace/delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        updateCell(row, col, 0);
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
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, isNoteMode, updateCell, toggleNote, isGameActive]);
  
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
    
    setSelectedCell({ row, col });
  };
  
  // Handle right click for notes
  const handleCellRightClick = (e, row, col) => {
    e.preventDefault();
    
    // Don't allow notes if game is not active
    if (!isGameActive) return;
    
    setSelectedCell({ row, col });
    setIsNoteMode(true);
  };
  
  // Render a single sudoku cell
  const renderCell = (row, col) => {
    const value = currentPuzzle[row][col];
    const isOriginal = originalPuzzle[row][col] !== 0;
    const isSelected = selectedCell && selectedCell.row === row && selectedCell.col === col;
    const isSameValue = value !== 0 && selectedCell && currentPuzzle[selectedCell.row][selectedCell.col] === value;
    const isSameRow = selectedCell && selectedCell.row === row && !isSelected;
    const isSameCol = selectedCell && selectedCell.col === col && !isSelected;
    const isSameBox = selectedCell && 
                     Math.floor(selectedCell.row / 3) === Math.floor(row / 3) && 
                     Math.floor(selectedCell.col / 3) === Math.floor(col / 3) && 
                     !isSelected;
    
    // Cell styling
    let cellClass = "sudoku-cell";
    if (isSelected) cellClass += " selected";
    if (isSameValue) cellClass += " same-value";
    if (isSameRow || isSameCol) cellClass += " same-row-col";
    if (isSameBox) cellClass += " same-box";
    if (isOriginal) cellClass += " original";
    
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
          : isSameValue 
            ? `${theme.primary}30` 
            : (isSameRow || isSameCol || isSameBox) 
              ? `${theme.primary}15` 
              : undefined,
      color: isSelected ? '#fff' : isOriginal ? theme.text : theme.textSecondary
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
      </div>
      
      <div className="sudoku-board" style={{ borderColor: theme.text }}>
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
            className="number-button"
            onClick={() => {
              if (!selectedCell || !isGameActive) return;
              
              if (isNoteMode) {
                toggleNote(selectedCell.row, selectedCell.col, num);
              } else {
                updateCell(selectedCell.row, selectedCell.col, num);
              }
            }}
            style={{ 
              backgroundColor: theme.secondary,
              color: theme.text
            }}
          >
            {num}
          </button>
        ))}
        <button
          className="number-button"
          onClick={() => {
            if (!selectedCell || !isGameActive) return;
            updateCell(selectedCell.row, selectedCell.col, 0);
          }}
          style={{ 
            backgroundColor: theme.secondary,
            color: theme.text
          }}
        >
          ⌫
        </button>
      </div>
    </div>
  );
};

export default SudokuBoard;