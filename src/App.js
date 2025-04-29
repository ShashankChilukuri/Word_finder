import React, { useState, useEffect } from 'react';
import WordGrid from './WordGrid';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const App = () => {
  const [topic, setTopic] = useState('');
  const [words, setWords] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [gridSize, setGridSize] = useState(10);
  const [gameStarted, setGameStarted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [customWords, setCustomWords] = useState('');
  const [useCustomWords, setUseCustomWords] = useState(false);

  const topics = {
    "Countries": ["france", "canada", "japan", "brazil", "egypt", "australia", "italy", "india", "mexico", "germany"],
    "Animals": ["tiger", "dolphin", "elephant", "giraffe", "penguin", "zebra", "lion", "koala", "rhino", "eagle"],
    "Fruits": ["apple", "banana", "orange", "grape", "mango", "kiwi", "peach", "pear", "cherry", "lemon"],
    "Planets": ["mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"],
    "Sports": ["soccer", "tennis", "cricket", "golf", "hockey", "baseball", "basketball", "volleyball", "swimming", "rugby"]
  };

  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  useEffect(() => {
    if (foundWords.length > 0 && words.length > 0 && foundWords.length === words.length) {
      setIsTimerRunning(false);
      setTimeout(() => {
        alert(`Congratulations! You found all words in ${formatTime(timer)}!`);
      }, 500);
    }
  }, [foundWords, words, timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTopicChange = (event) => {
    const selectedTopic = event.target.value;
    setTopic(selectedTopic);
    setUseCustomWords(false);
    adjustWordsForDifficulty(selectedTopic, difficulty);
  };

  const adjustWordsForDifficulty = (selectedTopic, selectedDifficulty) => {
    if (!selectedTopic) return;
    
    const allWords = topics[selectedTopic] || [];
    let wordCount;
    
    switch (selectedDifficulty) {
      case 'easy':
        wordCount = Math.min(5, allWords.length);
        setGridSize(8);
        break;
      case 'hard':
        wordCount = allWords.length;
        setGridSize(12);
        break;
      default: // medium
        wordCount = Math.min(7, allWords.length);
        setGridSize(10);
        break;
    }
    
    const selectedWords = allWords.slice(0, wordCount);
    setWords(selectedWords);
    setFoundWords([]);
  };

  const handleDifficultyChange = (event) => {
    const selectedDifficulty = event.target.value;
    setDifficulty(selectedDifficulty);
    adjustWordsForDifficulty(topic, selectedDifficulty);
  };

  const handleGridSizeChange = (event) => {
    const size = parseInt(event.target.value, 10);
    setGridSize(size);
  };

  const handleStartGame = () => {
    setGameStarted(true);
    setFoundWords([]);
    setTimer(0);
    setIsTimerRunning(true);
  };

  const handleResetGame = () => {
    setGameStarted(false);
    setFoundWords([]);
    setTimer(0);
    setIsTimerRunning(false);
  };

  const handleCustomWordsChange = (event) => {
    setCustomWords(event.target.value);
  };

  const handleUseCustomWords = () => {
    if (customWords.trim()) {
      const wordList = customWords
        .toLowerCase()
        .split(',')
        .map(word => word.trim())
        .filter(word => word.length > 0 && word.length <= gridSize);
      
      if (wordList.length > 0) {
        setWords(wordList);
        setUseCustomWords(true);
        setTopic('Custom');
      } else {
        alert('Please enter valid words separated by commas.');
      }
    }
  };

  const progressPercentage = words.length > 0 ? (foundWords.length / words.length) * 100 : 0;

  return (
    <div className="app-container">
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-3 sidebar">
            <div className="sidebar-content">
              <h2 className="app-title">Word Finder</h2>
              
              {gameStarted ? (
                <div className="game-stats">
                  <div className="timer-display">
                    <i className="bi bi-clock"></i> {formatTime(timer)}
                  </div>
                  
                  <div className="progress mb-3 mt-3">
                    <div 
                      className="progress-bar progress-bar-striped progress-bar-animated" 
                      role="progressbar" 
                      style={{ width: `${progressPercentage}%` }}
                      aria-valuenow={progressPercentage} 
                      aria-valuemin="0" 
                      aria-valuemax="100">
                      {Math.round(progressPercentage)}%
                    </div>
                  </div>
                  
                  <h3>Words to Find: {foundWords.length}/{words.length}</h3>
                  <div className="word-list">
                    {words.map((word, index) => (
                      <div 
                        key={index} 
                        className={`word-item ${foundWords.includes(word) ? 'found' : ''}`}
                      >
                        {foundWords.includes(word) ? word : word.replace(/[a-z]/g, '•')}
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    className="btn btn-danger btn-lg mt-4 w-100" 
                    onClick={handleResetGame}
                  >
                    Reset Game
                  </button>
                </div>
              ) : (
                <div className="game-setup">
                  <div className="form-group mb-3">
                    <label className="form-label">Select Topic:</label>
                    <select
                      className="form-select"
                      onChange={handleTopicChange}
                      value={topic}
                    >
                      <option value="" disabled>Choose a category</option>
                      {Object.keys(topics).map((topicName) => (
                        <option key={topicName} value={topicName}>{topicName}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group mb-3">
                    <label className="form-label">Difficulty:</label>
                    <select
                      className="form-select"
                      onChange={handleDifficultyChange}
                      value={difficulty}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  
                  <div className="form-group mb-3">
                    <label className="form-label">Grid Size:</label>
                    <select
                      className="form-select"
                      onChange={handleGridSizeChange}
                      value={gridSize}
                    >
                      <option value="8">8×8</option>
                      <option value="10">10×10</option>
                      <option value="12">12×12</option>
                      <option value="15">15×15</option>
                    </select>
                  </div>
                  
                  <div className="custom-words mb-3">
                    <label className="form-label">Or enter custom words (comma-separated):</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={customWords}
                      onChange={handleCustomWordsChange}
                      placeholder="e.g. monkey, elephant, tiger"
                    ></textarea>
                    <button 
                      className="btn btn-secondary mt-2" 
                      onClick={handleUseCustomWords}
                      disabled={!customWords.trim()}
                    >
                      Use Custom Words
                    </button>
                  </div>
                  
                  <button 
                    className="btn btn-primary btn-lg w-100 mt-3" 
                    onClick={handleStartGame}
                    disabled={words.length === 0}
                  >
                    Start Game
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="col-lg-9 game-area">
            {gameStarted && words.length > 0 && (
              <div className="game-board">
                <h3 className="text-center mb-4">
                  Find all words in the grid!
                </h3>
                <WordGrid 
                  topic={topic} 
                  words={words} 
                  setFoundWords={setFoundWords} 
                  gridSize={gridSize} 
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;