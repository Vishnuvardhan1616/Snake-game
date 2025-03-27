import React, { useRef, useEffect, useState } from 'react';

const canvasWidth = 400;
const canvasHeight = 400;
const cellSize = 20;
const initialSpeed = 200; // initial interval speed in ms
const speedFactor = 10;   // speed increase per score point

// Returns a random food position on the grid
const getRandomFoodPosition = () => {
  const cols = canvasWidth / cellSize;
  const rows = canvasHeight / cellSize;
  const foodX = Math.floor(Math.random() * cols) * cellSize;
  const foodY = Math.floor(Math.random() * rows) * cellSize;
  return { x: foodX, y: foodY };
};

function App() {
  const canvasRef = useRef(null);
  const appleImgRef = useRef(new Image());
  const snakeImgRef = useRef(new Image());

  const [snake, setSnake] = useState([{ x: cellSize * 5, y: cellSize * 5 }]);
  const [food, setFood] = useState(getRandomFoodPosition());
  const [direction, setDirection] = useState({ x: cellSize, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const currentSpeed = Math.max(50, initialSpeed - score * speedFactor);

  // Load images once
  useEffect(() => {
    appleImgRef.current.src = '/apple.png';
    snakeImgRef.current.src = '/snake.png';
  }, []);

  // Handle key presses to change direction
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === cellSize) return;
          setDirection({ x: 0, y: -cellSize });
          break;
        case 'ArrowDown':
          if (direction.y === -cellSize) return;
          setDirection({ x: 0, y: cellSize });
          break;
        case 'ArrowLeft':
          if (direction.x === cellSize) return;
          setDirection({ x: -cellSize, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x === -cellSize) return;
          setDirection({ x: cellSize, y: 0 });
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  // Game loop: update snake position and check for collisions
  useEffect(() => {
    if (gameOver) return;
    const intervalId = setInterval(() => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const newHead = { x: head.x + direction.x, y: head.y + direction.y };

        // Check wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= canvasWidth ||
          newHead.y < 0 ||
          newHead.y >= canvasHeight
        ) {
          setGameOver(true);
          return prevSnake;
        }

        // Check self-collision
        for (let segment of prevSnake) {
          if (newHead.x === segment.x && newHead.y === segment.y) {
            setGameOver(true);
            return prevSnake;
          }
        }

        let newSnake = [newHead, ...prevSnake];

        // Check if food is eaten
        if (newHead.x === food.x && newHead.y === food.y) {
          setFood(getRandomFoodPosition());
          setScore((prevScore) => prevScore + 1);
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, currentSpeed);

    return () => clearInterval(intervalId);
  }, [direction, food, gameOver, currentSpeed]);

  // Draw snake and food on canvas using images
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Clear the canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw the food as an apple image (fallback to red square)
    if (appleImgRef.current.complete) {
      ctx.drawImage(appleImgRef.current, food.x, food.y, cellSize, cellSize);
    } else {
      ctx.fillStyle = 'red';
      ctx.fillRect(food.x, food.y, cellSize, cellSize);
    }

    // Draw each snake segment using the snake image (fallback to lime square)
    snake.forEach((segment) => {
      if (snakeImgRef.current.complete) {
        ctx.drawImage(snakeImgRef.current, segment.x, segment.y, cellSize, cellSize);
      } else {
        ctx.fillStyle = 'lime';
        ctx.fillRect(segment.x, segment.y, cellSize, cellSize);
      }
    });
  }, [snake, food]);

  // Restart game handler
  const handleRestart = () => {
    setSnake([{ x: cellSize * 5, y: cellSize * 5 }]);
    setFood(getRandomFoodPosition());
    setDirection({ x: cellSize, y: 0 });
    setScore(0);
    setGameOver(false);
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px', background: '#222', minHeight: '100vh' }}>
      <h1 style={{ color: 'white' }}>Snake Game</h1>
      <h2 style={{ color: 'yellow' }}>Score: {score}</h2>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{ border: '1px solid white', background: 'black' }}
      />
      {gameOver && (
        <div style={{ color: 'red', marginTop: '20px' }}>
          <h2>Game Over</h2>
          <button onClick={handleRestart}>Restart</button>
        </div>
      )}
    </div>
  );
}

export default App;
