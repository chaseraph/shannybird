document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('game-container');
    const shannon = document.getElementById('shannon');
    const scoreDisplay = document.getElementById('score');
    const gameOverDisplay = document.getElementById('game-over');

    const GAME_WIDTH = 800;
    const GAME_HEIGHT = 600;
    const SHANNON_HEIGHT = 75;
    const SHANNON_WIDTH = 100;
    const PIPE_WIDTH = 60;
    const GAP_SIZE = 200; // Large gap for an easier game

    let shannonY = GAME_HEIGHT / 2 - SHANNON_HEIGHT / 2;
    let velocity = 0;
    let gravity = 0.5;
    let jumpPower = -9;
    let score = 0;
    let isGameOver = false;
    let gameLoopInterval;
    let pipeCreationInterval;

    // --- Core Game Functions ---

    function startGame() {
        // Reset state
        isGameOver = false;
        score = 0;
        shannonY = GAME_HEIGHT / 2 - SHANNON_HEIGHT / 2;
        velocity = 0;
        shannon.style.top = shannonY + 'px';
        scoreDisplay.textContent = 'Score: 0';
        gameOverDisplay.classList.add('hidden');
        
        // Remove old pipes
        document.querySelectorAll('.pipe').forEach(pipe => pipe.remove());

        // Start intervals
        gameLoopInterval = setInterval(gameLoop, 20); // Run the main game loop
        pipeCreationInterval = setInterval(createPipes, 2000); // Create a new pipe every 2 seconds
    }

    function jump() {
        if (isGameOver) return;
        velocity = jumpPower;
        // Tilt Shannon up slightly when jumping
        shannon.style.transform = 'rotate(-10deg)'; 
    }

    function gameLoop() {
        // 1. Apply Gravity and Movement
        velocity += gravity;
        shannonY += velocity;

        // 2. Clamp Shannon's position within the game boundaries
        if (shannonY > GAME_HEIGHT - SHANNON_HEIGHT) {
            shannonY = GAME_HEIGHT - SHANNON_HEIGHT;
            gameOver();
            return;
        }
        if (shannonY < 0) {
            shannonY = 0;
            velocity = 0;
        }

        shannon.style.top = shannonY + 'px';
        
        // Tilt Shannon down slightly when falling
        if (velocity > 0) {
            shannon.style.transform = 'rotate(10deg)';
        } else if (velocity === jumpPower) {
            // Keep the jump tilt for a moment
        } else {
            shannon.style.transform = 'rotate(0deg)';
        }


        // 3. Move and Check Pipes
        document.querySelectorAll('.pipe').forEach(pipe => {
            let pipeX = parseFloat(pipe.style.left);
            pipeX -= 3; // Pipe movement speed

            pipe.style.left = pipeX + 'px';

            // Check for scoring (pipe has passed the center of the player)
            if (pipeX + PIPE_WIDTH < (GAME_WIDTH/2 - SHANNON_WIDTH/2) && !pipe.passed) {
                // Only count the top pipe of a pair to avoid double scoring
                if (pipe.classList.contains('top-pipe')) {
                    score++;
                    scoreDisplay.textContent = `Score: ${score}`;
                }
                pipe.passed = true; // Mark as passed
            }

            // Remove pipes that are off-screen
            if (pipeX < -PIPE_WIDTH) {
                pipe.remove();
            }

            // 4. Collision Detection
            if (checkCollision(shannon, pipe)) {
                gameOver();
            }
        });
    }

    function createPipes() {
        if (isGameOver) return;

        // Randomly determine the position of the gap
        // Ensures the gap is at least 50px from the top and bottom edges
        const minHeight = 50;
        const maxHeight = GAME_HEIGHT - GAP_SIZE - minHeight;
        const gapBottomY = Math.random() * (maxHeight - minHeight) + minHeight;

        // Top Pipe
        const topPipeHeight = gapBottomY;
        const topPipe = document.createElement('div');
        topPipe.classList.add('pipe', 'top-pipe');
        topPipe.style.height = topPipeHeight + 'px';
        topPipe.style.left = GAME_WIDTH + 'px';
        topPipe.passed = false; // Custom property for scoring
        gameContainer.appendChild(topPipe);

        // Bottom Pipe
        const bottomPipeHeight = GAME_HEIGHT - topPipeHeight - GAP_SIZE;
        const bottomPipe = document.createElement('div');
        bottomPipe.classList.add('pipe', 'bottom-pipe');
        bottomPipe.style.height = bottomPipeHeight + 'px';
        bottomPipe.style.left = GAME_WIDTH + 'px';
        bottomPipe.passed = false; // Custom property for scoring
        gameContainer.appendChild(bottomPipe);
    }

    function checkCollision(player, obstacle) {
        const playerRect = shannon.getBoundingClientRect();
        const obstacleRect = obstacle.getBoundingClientRect();
        const containerRect = gameContainer.getBoundingClientRect();

        // Adjust coordinates relative to the game container
        const p = {
            x: playerRect.left - containerRect.left,
            y: playerRect.top - containerRect.top,
            w: playerRect.width,
            h: playerRect.height
        };

        const o = {
            x: obstacleRect.left - containerRect.left,
            y: obstacleRect.top - containerRect.top,
            w: obstacleRect.width,
            h: obstacleRect.height
        };

        // Standard AABB (Axis-Aligned Bounding Box) collision check
        return (
            p.x < o.x + o.w &&
            p.x + p.w > o.x &&
            p.y < o.y + o.h &&
            p.y + p.h > o.y
        );
    }

    function gameOver() {
        isGameOver = true;
        clearInterval(gameLoopInterval);
        clearInterval(pipeCreationInterval);
        
        gameOverDisplay.classList.remove('hidden');
    }

    // --- Event Listeners ---
    
    // Jump on click
    gameContainer.addEventListener('click', () => {
        if (isGameOver) {
            startGame();
        } else {
            jump();
        }
    });
    
    // Jump on spacebar
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault(); // Prevent scrolling
            if (isGameOver) {
                startGame();
            } else {
                jump();
            }
        }
    });

    // Initial start call
    startGame();
});