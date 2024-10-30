const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let bird = {
    x: 50,
    y: canvas.height/2,
    velocity: 0,
    gravity: 0.5,
    jump: -8,
    radius: 15
};

let storms = [];
let gameOver = false;
let score = 0;

// Load images
const philippineFlag = new Image();
philippineFlag.src = 'philippine.gif';

const floodImage = new Image();
floodImage.src = '120814035457-phillipines-8-14-a.jpg';

// Storm creation
function createStorm() {
    let gap = 200;
    let stormHeight = 30;
    storms.push({
        x: canvas.width,
        y: Math.random() * (canvas.height - gap - stormHeight),
        width: 50,
        height: stormHeight,
        rotation: 0
    });
}

// Game loop
function update() {
    if (gameOver) {
        // Show game over screen
        ctx.drawImage(floodImage, 0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.fillText('Game Over', canvas.width/2 - 70, canvas.height/2);
        ctx.font = '20px Arial';
        ctx.fillText('Click to restart', canvas.width/2 - 60, canvas.height/2 + 40);
        return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update bird
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Draw bird
    ctx.drawImage(philippineFlag, bird.x - bird.radius, bird.y - bird.radius, 
                 bird.radius * 2, bird.radius * 2);

    // Update and draw storms
    for (let i = storms.length - 1; i >= 0; i--) {
        let storm = storms[i];
        storm.x -= 2;
        storm.rotation += 0.02;

        // Draw rotating storm
        ctx.save();
        ctx.translate(storm.x + storm.width/2, storm.y + storm.height/2);
        ctx.rotate(storm.rotation);
        ctx.fillStyle = '#4169E1';
        ctx.beginPath();
        ctx.arc(0, 0, storm.height, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Collision detection
        let dx = bird.x - (storm.x + storm.width/2);
        let dy = bird.y - (storm.y + storm.height/2);
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < bird.radius + storm.height) {
            gameOver = true;
        }

        // Remove off-screen storms
        if (storm.x + storm.width < 0) {
            storms.splice(i, 1);
            score++;
        }
    }

    // Create new storms
    if (storms.length === 0 || storms[storms.length - 1].x < canvas.width - 200) {
        createStorm();
    }

    // Draw score
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 30);

    // Check boundaries
    if (bird.y > canvas.height || bird.y < 0) {
        gameOver = true;
    }

    requestAnimationFrame(update);
}

// Event listeners
canvas.addEventListener('click', function() {
    if (gameOver) {
        // Reset game
        bird.y = canvas.height/2;
        bird.velocity = 0;
        storms = [];
        score = 0;
        gameOver = false;
        update();
    } else {
        // Bird jump
        bird.velocity = bird.jump;
    }
});

// Start game
update(); 
