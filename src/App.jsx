import React, { useEffect, useRef, useState } from "react";

const App = () => {
  const canvasRef = useRef(null);
  const nextCanvasRef = useRef(null);
  const [grid, setGrid] = useState(
    Array(20)
      .fill(null)
      .map(() => Array(10).fill(0))
  );
  const [nextBlock, setNextBlock] = useState({ shape: null, color: null });
  const [currentBlock, setCurrentBlock] = useState({
    shape: null,
    color: null,
  });
  const [x, setX] = useState(4); // Starting position
  const [y, setY] = useState(0);
  const [intervalSpeed, setIntervalSpeed] = useState(1000);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [score, setScore] = useState(0);

  const colors = [
    "gray",
    "violet",
    "red",
    "lime",
    "yellow",
    "orange",
    "blue",
    "cyan",
  ];

  const tetrominoes = [
    {
      shape: [
        [1, 1, 1],
        [0, 1, 0],
      ],
      color: 1,
    },
    {
      shape: [
        [2, 2, 0],
        [0, 2, 2],
      ],
      color: 2,
    },
    {
      shape: [
        [3, 3],
        [3, 3],
      ],
      color: 3,
    },
    {
      shape: [
        [4, 0],
        [4, 4],
        [4, 4],
      ],
      color: 4,
    },
    {
      shape: [
        [0, 5],
        [5, 5],
        [5, 0],
      ],
      color: 5,
    },
  ];

  const getRandomBlock = () => {
    const randomIndex = Math.floor(Math.random() * tetrominoes.length);
    return tetrominoes[randomIndex];
  };

  const checkCollision = (grid, block, offsetX, offsetY) => {
    for (let row = 0; row < block.shape.length; row++) {
      for (let col = 0; col < block.shape[row].length; col++) {
        if (block.shape[row][col] !== 0) {
          const xPos = offsetX + col;
          const yPos = offsetY + row;
          if (xPos < 0 || xPos >= 10 || yPos >= 20 || grid[yPos][xPos] !== 0) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const mergeBlock = (grid, block, offsetX, offsetY) => {
    const newGrid = grid.map((row) => row.slice());
    for (let row = 0; row < block.shape.length; row++) {
      for (let col = 0; col < block.shape[row].length; col++) {
        if (block.shape[row][col] !== 0) {
          newGrid[offsetY + row][offsetX + col] = block.color;
        }
      }
    }
    return newGrid;
  };

  const removeFullLines = (grid) => {
    const newGrid = grid.filter((row) => row.some((cell) => cell === 0));
    const clearedLines = 20 - newGrid.length;
    setScore((prevScore) => prevScore + clearedLines * 100); // Increment score for cleared lines
    while (newGrid.length < 20) {
      newGrid.unshift(Array(10).fill(0));
    }
    return newGrid;
  };

  const drawGrid = (ctx) => {
    if (!ctx) return; // Check if context is available
    ctx.clearRect(0, 0, 250, 400);
    for (let row = 0; row < 20; row++) {
      for (let col = 0; col < 10; col++) {
        ctx.strokeStyle = "gray";
        ctx.lineWidth = 1;
        ctx.strokeRect(col * 25, row * 20, 25, 20);
        if (grid[row][col] !== 0) {
          ctx.fillStyle = colors[grid[row][col]];
          ctx.fillRect(col * 25, row * 20, 25, 20);
        }
      }
    }
  };

  const drawBlock = (ctx, x, y, block, preview = false) => {
    if (!ctx) return; // Check if context is available
    block.shape.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        if (value !== 0) {
          const color = preview ? colors[block.color] : colors[block.color];
          ctx.strokeStyle = preview ? color : "black"; // Use color for preview outline
          ctx.lineWidth = preview ? 2 : 0; // Outline for preview, no outline for filled blocks
          ctx.fillStyle = preview ? "transparent" : color;
          ctx.fillRect((x + colIndex) * 25, (y + rowIndex) * 20, 25, 20);
          ctx.strokeRect((x + colIndex) * 25, (y + rowIndex) * 20, 25, 20);
        }
      });
    });
  };

  const rotateBlock = (block) => {
    const rotatedShape = block.shape[0]
      .map((_, index) => block.shape.map((row) => row[index]))
      .map((row) => row.reverse());
    return {
      shape: rotatedShape,
      color: block.color,
    };
  };

  const getDropPosition = (block, startX) => {
    let dropY = 0;
    while (!checkCollision(grid, block, startX, dropY + 1)) {
      dropY++;
    }
    return dropY;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas ? canvas.getContext("2d") : null;
    if (ctx) {
      canvas.width = 250;
      canvas.height = 400;
      drawGrid(ctx);
      if (currentBlock) {
        const dropY = getDropPosition(currentBlock, x);
        drawBlock(ctx, x, y, currentBlock);
        drawBlock(ctx, x, dropY, currentBlock, true); // Draw preview outline
      }
    }

    const nextCanvas = nextCanvasRef.current;
    const nextCtx = nextCanvas ? nextCanvas.getContext("2d") : null;
    if (nextCtx) {
      nextCanvas.width = 150;
      nextCanvas.height = 150;
      if (nextBlock.shape) {
        drawBlock(nextCtx, 0, 0, nextBlock);
      }
    }

    const gameLoop = () => {
      if (!isPaused && isGameStarted) {
        if (currentBlock) {
          setY((prev) => {
            const newY = prev + 1;
            if (checkCollision(grid, currentBlock, x, newY)) {
              setGrid((prevGrid) => {
                const updatedGrid = mergeBlock(prevGrid, currentBlock, x, y);
                const cleanedGrid = removeFullLines(updatedGrid);
                return cleanedGrid;
              });

              const newBlock = nextBlock.shape ? nextBlock : getRandomBlock();
              setNextBlock(getRandomBlock());
              if (checkCollision(grid, newBlock, 4, 0)) {
                alert("Game Over!");
                setIsGameStarted(false); // Reset game
                setGrid(
                  Array(20)
                    .fill(null)
                    .map(() => Array(10).fill(0))
                );
                setScore(0);
                return 0;
              }

              setCurrentBlock(newBlock);
              setX(4);
              setY(0);
              return 0;
            }
            return newY;
          });
        }
      }
    };

    const gameInterval = setInterval(gameLoop, intervalSpeed);

    return () => clearInterval(gameInterval);
  }, [
    currentBlock,
    grid,
    x,
    y,
    intervalSpeed,
    nextBlock,
    isPaused,
    isGameStarted,
  ]);

  useEffect(() => {
    if (!currentBlock && isGameStarted) {
      const newBlock = getRandomBlock();
      setCurrentBlock(newBlock);
      setNextBlock(getRandomBlock());
    }
  }, [currentBlock, isGameStarted]);

  const handleMoveLeft = () =>
    setX((prev) =>
      prev > 0 && !checkCollision(grid, currentBlock, prev - 1, y)
        ? prev - 1
        : prev
    );
  const handleMoveRight = () =>
    setX((prev) =>
      prev < 9 && !checkCollision(grid, currentBlock, prev + 1, y)
        ? prev + 1
        : prev
    );
  const handleMoveDown = () =>
    setY((prev) =>
      checkCollision(grid, currentBlock, x, prev + 1) ? prev : prev + 1
    );
  const handleRotate = () => {
    const rotatedBlock = rotateBlock(currentBlock);
    if (!checkCollision(grid, rotatedBlock, x, y)) {
      setCurrentBlock(rotatedBlock);
    }
  };
  const handlePauseResume = () => setIsPaused((prev) => !prev);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isGameStarted && !isPaused) {
        switch (e.key) {
          case "ArrowLeft":
            handleMoveLeft();
            break;
          case "ArrowRight":
            handleMoveRight();
            break;
          case "ArrowDown":
            handleMoveDown();
            break;
          case "ArrowUp":
            handleRotate();
            break;
          case "p":
            handlePauseResume();
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGameStarted, isPaused, currentBlock, x, y]);

  const startGame = () => {
    setIsGameStarted(true);
    setIsPaused(false);
    setCurrentBlock(getRandomBlock());
    setNextBlock(getRandomBlock());
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white">
      {!isGameStarted ? (
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to Tetris!</h1>
          <button
            onClick={startGame}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700"
          >
            Play
          </button>
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Score: {score}</h1>
          <button
            onClick={handlePauseResume}
            className={`px-6 py-2 ${
              isPaused ? "bg-green-600" : "bg-red-600"
            } text-white rounded-lg shadow-lg hover:${
              isPaused ? "bg-green-700" : "bg-red-700"
            }`}
          >
            {isPaused ? "Resume" : "Pause"}
          </button>
          <div className="mt-4">
            <canvas ref={canvasRef} className="border border-gray-500" />
          </div>
          <div className="mt-4">
            <h2 className="text-xl font-semibold">Next Block:</h2>
            <canvas ref={nextCanvasRef} className="border border-gray-500" />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
