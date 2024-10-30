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

// Enhanced storm creation
function createStorm() {
    let gap = 180;
    let stormHeight = 60;
    storms.push({
        x: canvas.width,
        y: Math.random() * (canvas.height - gap - stormHeight),
        width: 90,
        height: stormHeight,
        rotation: 0,
        rotationSpeed: Math.random() * 0.06 + 0.03,
        scale: Math.random() * 0.5 + 1.5,
        opacity: 0.8,
        layers: 5
    });
}

// Enhanced storm drawing
function drawStorm(storm) {
    ctx.save();
    ctx.translate(storm.x + storm.width/2, storm.y + storm.height/2);
    ctx.rotate(storm.rotation);
    ctx.scale(storm.scale, storm.scale);
    
    // Create multi-layered cyclone effect
    for(let layer = 0; layer < storm.layers; layer++) {
        ctx.beginPath();
        ctx.globalAlpha = storm.opacity - (layer * 0.1);
        
        // Spiral effect
        for(let i = 0; i < 30; i++) {
            let angle = (i / 30) * Math.PI * 2;
            let radius = (layer * 5) + (i * storm.height/20);
            let x = Math.cos(angle + storm.rotation * 2) * radius;
            let y = Math.sin(angle + storm.rotation * 2) * radius;
            
            if(i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.strokeStyle = '#4169E1';
        ctx.lineWidth = 3;
        ctx.stroke();
    }
    ctx.restore();
}

// Game loop
function update() {
    if (gameOver) {
        ctx.drawImage(floodImage, 0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.fillText('Game Over', canvas.width/2 - 70, canvas.height/2);
        ctx.font = '20px Arial';
        ctx.fillText('Click to restart', canvas.width/2 - 60, canvas.height/2 + 40);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update bird with boundary constraints
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Keep bird within canvas bounds
    if (bird.y + bird.radius > canvas.height) {
        bird.y = canvas.height - bird.radius;
        bird.velocity = 0; // Stop vertical movement at bottom
    }
    if (bird.y - bird.radius < 0) {
        bird.y = bird.radius;
        bird.velocity = 0; // Stop vertical movement at top
    }

    // Draw bird
    ctx.drawImage(philippineFlag, bird.x - bird.radius, bird.y - bird.radius, 
                 bird.radius * 2, bird.radius * 2);

    // Update and draw storms
    for (let i = storms.length - 1; i >= 0; i--) {
        let storm = storms[i];
        storm.x -= 3;
        storm.rotation += storm.rotationSpeed;
        
        drawStorm(storm);

        // Storm collision detection
        let dx = bird.x - (storm.x + storm.width/2);
        let dy = bird.y - (storm.y + storm.height/2);
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < bird.radius + (storm.height * storm.scale/2)) {
            gameOver = true;
        }

        if (storm.x + storm.width < 0) {
            storms.splice(i, 1);
            score++;
        }
    }

    // Create new storms
    if (storms.length === 0 || storms[storms.length - 1].x < canvas.width - 160) {
        createStorm();
    }

    // Draw score
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 30);

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
