import { useEffect, useRef, useState } from "react";
import { GiPauseButton } from "react-icons/gi";
import { FaPlay } from "react-icons/fa";
import Modal from "./components/Modal";

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
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        const xPos = col * 25;
        const yPos = row * 20;

        ctx.beginPath();
        ctx.strokeStyle = "#322421"; // Change line color (dark blue)
        ctx.lineWidth = 3;

        // Draw rounded rectangle
        ctx.moveTo(xPos + 5, yPos); // Start at top-left corner with a little offset
        ctx.arcTo(xPos + 25, yPos, xPos + 25, yPos + 20, 5); // Top-right corner
        ctx.arcTo(xPos + 25, yPos + 20, xPos, yPos + 20, 5); // Bottom-right corner
        ctx.arcTo(xPos, yPos + 20, xPos, yPos, 5); // Bottom-left corner
        ctx.arcTo(xPos, yPos, xPos + 25, yPos, 5); // Top-left corner

        ctx.stroke();

        if (grid[row][col] !== 0) {
          ctx.fillStyle = colors[grid[row][col]];
          ctx.fill(); // Fill the rounded grid box with color
        }
      }
    }
  };

  const drawBlock = (ctx, x, y, block, preview = false, center = false) => {
    if (!ctx) return; // Check if context is available

    const blockWidth = block.shape[0].length;
    const blockHeight = block.shape.length;
    const blockSize = 25; // Block size for width and height
    const blockHeightSize = 20;

    // If center is true, calculate the offset to center the block
    if (center) {
      const canvasWidth = ctx.canvas.width / blockSize;
      const canvasHeight = ctx.canvas.height / blockHeightSize;
      x = Math.floor((canvasWidth - blockWidth) / 2);
      y = Math.floor((canvasHeight - blockHeight) / 2);
    }

    block.shape.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        if (value !== 0) {
          const color = preview ? colors[block.color] : colors[block.color];

          // Rounded corner logic
          const startX = (x + colIndex) * blockSize;
          const startY = (y + rowIndex) * blockHeightSize;

          // Set the stroke and fill color
          ctx.strokeStyle = preview ? color : "#322421"; // Outline color for preview
          ctx.lineWidth = preview ? 2 : 0; // Outline for preview, none for regular blocks
          ctx.fillStyle = preview ? "transparent" : color; // Fill color

          // Draw rounded rectangle using arcs
          const radius = 5; // Radius for rounded corners
          ctx.beginPath();
          ctx.moveTo(startX + radius, startY); // Top-left corner
          ctx.arcTo(
            startX + blockSize,
            startY,
            startX + blockSize,
            startY + blockHeightSize,
            radius
          ); // Top-right corner
          ctx.arcTo(
            startX + blockSize,
            startY + blockHeightSize,
            startX,
            startY + blockHeightSize,
            radius
          ); // Bottom-right corner
          ctx.arcTo(startX, startY + blockHeightSize, startX, startY, radius); // Bottom-left corner
          ctx.arcTo(startX, startY, startX + blockSize, startY, radius); // Top-left corner again
          ctx.closePath();

          // Fill and stroke the rounded rectangle
          ctx.fill();
          ctx.stroke();
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
      nextCanvas.width = 80;
      nextCanvas.height = 70;
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
                setIsModalOpen(true);
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
  const handleModalClose = () => {
    setIsModalOpen(false); // Close the modal
    startGame(); // Restart the game
  };
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-custom-brown text-white">
      {!isGameStarted ? (
        <div className="text-center space-y-8">
          <h1 className="text-5xl font-bold text-white mb-4">
            Welcome to Tetris!
          </h1>
          <button
            onClick={startGame}
            className="px-8 py-3  text-white bg-custom-blue  font-semibold text-xl border border-white rounded-lg"
          >
            Play
          </button>
        </div>
      ) : (
        <div className="text-center space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-semibold">Score: {score}</h1>
              <button
                onClick={handlePauseResume}
                className={`px-4 py-2 bg-yellow-500 rounded-md shadow hover:bg-yellow-600 transition duration-300`}
              >
                {isPaused ? <FaPlay /> : <GiPauseButton />}
              </button>
            </div>
            <div className="mt-4 flex flex-col items-center gap-2">
              <canvas
                ref={nextCanvasRef}
                className="border-4 bg-custom-dark-brown border-custom-light-brown p-2 w-16 rounded-md"
              />
            </div>
          </div>
          <div className="mt-4">
            <canvas
              ref={canvasRef}
              className="bg-custom-brown border-8 p-2 rounded-md border-custom-yellow"
            />
          </div>
        </div>
      )}
      {isModalOpen && <Modal onClose={handleModalClose} score={score} />}
    </div>
  );
};

export default App;
