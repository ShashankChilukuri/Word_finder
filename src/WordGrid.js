import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// WordGrid Component
const WordGrid = ({ topic, words, setFoundWords, gridSize }) => {
  const [grid, setGrid] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [selectionStart, setSelectionStart] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [foundCellsMap, setFoundCellsMap] = useState({});

  useEffect(() => {
    const grid = generateGrid(words, gridSize);
    setGrid(grid);
    setSelectedCells([]);
    setFoundCellsMap({});
  }, [words, gridSize]);

  const generateGrid = (words, gridSize) => {
    const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(' '));

    words.forEach((word) => {
      let placed = false;
      let attempts = 0;
      
      while (!placed && attempts < 100) {
        attempts++;
        // Add diagonal directions
        const directions = ['horizontal', 'vertical', 'diagonal-down', 'diagonal-up'];
        const direction = directions[Math.floor(Math.random() * directions.length)];
        const startRow = Math.floor(Math.random() * gridSize);
        const startCol = Math.floor(Math.random() * gridSize);

        if (canPlaceWord(word, startRow, startCol, direction, grid, gridSize)) {
          placeWord(word, startRow, startCol, direction, grid);
          placed = true;
        }
      }
    });

    // Fill remaining spaces with random letters
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (grid[row][col] === ' ') {
          grid[row][col] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
      }
    }

    return grid;
  };

  const canPlaceWord = (word, row, col, direction, grid, gridSize) => {
    const upperWord = word.toUpperCase();
    
    switch (direction) {
      case 'horizontal':
        if (col + upperWord.length > gridSize) return false;
        for (let i = 0; i < upperWord.length; i++) {
          if (grid[row][col + i] !== ' ' && grid[row][col + i] !== upperWord[i]) return false;
        }
        break;
      case 'vertical':
        if (row + upperWord.length > gridSize) return false;
        for (let i = 0; i < upperWord.length; i++) {
          if (grid[row + i][col] !== ' ' && grid[row + i][col] !== upperWord[i]) return false;
        }
        break;
      case 'diagonal-down':
        if (col + upperWord.length > gridSize || row + upperWord.length > gridSize) return false;
        for (let i = 0; i < upperWord.length; i++) {
          if (grid[row + i][col + i] !== ' ' && grid[row + i][col + i] !== upperWord[i]) return false;
        }
        break;
      case 'diagonal-up':
        if (col + upperWord.length > gridSize || row - upperWord.length < -1) return false;
        for (let i = 0; i < upperWord.length; i++) {
          if (grid[row - i][col + i] !== ' ' && grid[row - i][col + i] !== upperWord[i]) return false;
        }
        break;
      default:
        return false;
    }
    return true;
  };

  const placeWord = (word, row, col, direction, grid) => {
    const upperWord = word.toUpperCase();
    
    switch (direction) {
      case 'horizontal':
        for (let i = 0; i < upperWord.length; i++) {
          grid[row][col + i] = upperWord[i];
        }
        break;
      case 'vertical':
        for (let i = 0; i < upperWord.length; i++) {
          grid[row + i][col] = upperWord[i];
        }
        break;
      case 'diagonal-down':
        for (let i = 0; i < upperWord.length; i++) {
          grid[row + i][col + i] = upperWord[i];
        }
        break;
      case 'diagonal-up':
        for (let i = 0; i < upperWord.length; i++) {
          grid[row - i][col + i] = upperWord[i];
        }
        break;
      default:
        break;
    }
  };

  const handleMouseDown = (row, col) => {
    setIsDragging(true);
    setSelectionStart({ row, col });
    setSelectedCells([{ row, col }]);
  };

  const handleMouseOver = (row, col) => {
    if (!isDragging) return;

    const start = selectionStart;
    let cells = [];

    // Calculate line between start and current position
    const deltaRow = row - start.row;
    const deltaCol = col - start.col;
    
    // Check what type of line we're dealing with
    if (deltaRow === 0) { // Horizontal
      const startCol = Math.min(start.col, col);
      const endCol = Math.max(start.col, col);
      for (let c = startCol; c <= endCol; c++) {
        cells.push({ row: start.row, col: c });
      }
    } else if (deltaCol === 0) { // Vertical
      const startRow = Math.min(start.row, row);
      const endRow = Math.max(start.row, row);
      for (let r = startRow; r <= endRow; r++) {
        cells.push({ row: r, col: start.col });
      }
    } else if (Math.abs(deltaRow) === Math.abs(deltaCol)) { // Diagonal
      const steps = Math.abs(deltaRow);
      const rowStep = deltaRow > 0 ? 1 : -1;
      const colStep = deltaCol > 0 ? 1 : -1;
      
      for (let i = 0; i <= steps; i++) {
        cells.push({ 
          row: start.row + (i * rowStep), 
          col: start.col + (i * colStep) 
        });
      }
    } else {
      // Not a straight line, don't update selection
      return;
    }
    
    setSelectedCells(cells);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Get word from selected cells
    const word = getSelectedWord();
    
    if (word && words.includes(word.toLowerCase())) {
      // Add to found words if not already found
      setFoundWords(prev => {
        if (!prev.includes(word.toLowerCase())) {
          // Save these cells as found
          const cellKey = selectedCells.map(cell => `${cell.row}-${cell.col}`).join('|');
          setFoundCellsMap(prev => ({
            ...prev,
            [cellKey]: word.toLowerCase()
          }));
          
          return [...prev, word.toLowerCase()];
        }
        return prev;
      });
    } else {
      // Clear selection if word not found
      setSelectedCells([]);
    }
  };

  const getSelectedWord = () => {
    if (selectedCells.length < 2) return null;

    // Create a coherent word from the selected cells
    let word = '';
    for (const cell of selectedCells) {
      word += grid[cell.row][cell.col];
    }

    return word;
  };

  const isCellInFoundWord = (row, col) => {
    // Check if this cell is part of any found word
    for (const cellKey in foundCellsMap) {
      if (cellKey.includes(`${row}-${col}`)) {
        return foundCellsMap[cellKey]; // Return the word it belongs to
      }
    }
    return false;
  };

  const isCellSelected = (row, col) => {
    return selectedCells.some(cell => cell.row === row && cell.col === col);
  };

  const getCellClasses = (row, col) => {
    const foundWord = isCellInFoundWord(row, col);
    if (foundWord) {
      return 'cell-found';
    } else if (isCellSelected(row, col)) {
      return 'cell-selected';
    }
    return '';
  };

  // Handle touch events for mobile
  const handleTouchStart = (row, col) => {
    handleMouseDown(row, col);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (element && element.dataset.row !== undefined && element.dataset.col !== undefined) {
      const row = parseInt(element.dataset.row);
      const col = parseInt(element.dataset.col);
      handleMouseOver(row, col);
    }
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  return (
    <div className="word-grid-container">
      <div className="word-grid" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
        {grid.map((row, rowIndex) => (
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`grid-cell ${getCellClasses(rowIndex, colIndex)}`}
              data-row={rowIndex}
              data-col={colIndex}
              onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
              onMouseOver={() => handleMouseOver(rowIndex, colIndex)}
              onMouseUp={handleMouseUp}
              onTouchStart={() => handleTouchStart(rowIndex, colIndex)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {cell}
            </div>
          ))
        ))}
      </div>
    </div>
  );
};