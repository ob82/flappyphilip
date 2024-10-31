const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size based on device
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();

// Add viewport meta tag for mobile devices
const meta = document.createElement('meta');
meta.name = 'viewport';
meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0';
document.getElementsByTagName('head')[0].appendChild(meta);

// Add CSS to prevent scrolling and bouncing on mobile
const style = document.createElement('style');
style.textContent = `
    body {
        margin: 0;
        padding: 0;
        overflow: hidden;
        position: fixed;
        touch-action: none;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        user-select: none;
    }
    canvas {
        display: block;
        touch-action: none;
    }
`;
document.head.appendChild(style);

// Game constants
const JUMP_FORCE = -10;
const GRAVITY = 0.3;
const BOTTOM_TIME_LIMIT = 5000;

// Scale factors based on screen size
const SCALE_FACTOR = Math.min(canvas.width / 800, canvas.height / 600);
const BIRD_SIZE = 25 * SCALE_FACTOR;

// Game variables
let bird = {
    x: canvas.width * 0.2,
    y: canvas.height/2,
    velocity: 0,
    gravity: GRAVITY,
    jump: JUMP_FORCE,
    radius: BIRD_SIZE,
    bottomTimer: 0,
    isAtBottom: false
};

let storms = [];
let waves = [];
let gameOver = false;
let score = 0;
let lastTime = 0;

// Load images
const philippineFlag = new Image();
philippineFlag.src = 'philippine.gif';

const floodImage = new Image();
floodImage.src = '120814035457-phillipines-8-14-a.jpg';

// Wave creation with scaled dimensions
function createWave() {
    waves.push({
        x: canvas.width,
        y: canvas.height - 40 * SCALE_FACTOR,
        width: 50 * SCALE_FACTOR,
        height: 30 * SCALE_FACTOR,
        speed: 0.5 * SCALE_FACTOR,
        amplitude: 10 * SCALE_FACTOR,
        frequency: 0.02,
        offset: Math.random() * Math.PI * 2
    });
}

// Draw waves
function drawWaves() {
    ctx.save();
    waves.forEach(wave => {
        ctx.beginPath();
        ctx.moveTo(wave.x, wave.y);
        
        for(let i = 0; i <= wave.width; i++) {
            const y = wave.y + Math.sin(wave.offset + i * wave.frequency) * wave.amplitude;
            ctx.lineTo(wave.x + i, y);
        }
        
        ctx.lineTo(wave.x + wave.width, canvas.height);
        ctx.lineTo(wave.x, canvas.height);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, wave.y, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(30, 144, 255, 0.7)');
        gradient.addColorStop(1, 'rgba(0, 90, 190, 0.9)');
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        wave.x -= wave.speed;
        wave.offset += 0.05;
    });
    ctx.restore();
}

// Storm creation with scaled dimensions
function createStorm() {
    let gap = 280 * SCALE_FACTOR;
    let stormHeight = 40 * SCALE_FACTOR;
    storms.push({
        x: canvas.width,
        y: Math.random() * (canvas.height - gap - stormHeight),
        width: 60 * SCALE_FACTOR,
        height: stormHeight,
        rotation: 0,
        rotationSpeed: Math.random() * 0.06 + 0.03,
        scale: (Math.random() * 0.5 + 1.5) * SCALE_FACTOR,
        opacity: 0.8,
        layers: 5
    });
}

// Draw storm
function drawStorm(storm) {
    ctx.save();
    ctx.translate(storm.x + storm.width/2, storm.y + storm.height/2);
    ctx.rotate(storm.rotation);
    ctx.scale(storm.scale, storm.scale);
    
    for(let layer = 0; layer < storm.layers; layer++) {
        ctx.beginPath();
        ctx.globalAlpha = storm.opacity - (layer * 0.1);
        
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

// Draw bottom timer warning
function drawBottomTimer() {
    if (bird.isAtBottom) {
        const timeLeft = Math.ceil((BOTTOM_TIME_LIMIT - bird.bottomTimer) / 1000);
        ctx.fillStyle = 'red';
        ctx.font = `${24 * SCALE_FACTOR}px Arial`;
        ctx.fillText(`Warning: ${timeLeft}s`, canvas.width/2 - 50 * SCALE_FACTOR, 50 * SCALE_FACTOR);
    }
}

// Game loop
function update(currentTime) {
    if (!lastTime) lastTime = currentTime;
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    if (gameOver) {
        ctx.drawImage(floodImage, 0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = `${30 * SCALE_FACTOR}px Arial`;
        ctx.fillText('Game Over', canvas.width/2 - 70 * SCALE_FACTOR, canvas.height/2);
        ctx.font = `${20 * SCALE_FACTOR}px Arial`;
        ctx.fillText('Tap to restart', canvas.width/2 - 60 * SCALE_FACTOR, canvas.height/2 + 40 * SCALE_FACTOR);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update bird
    bird.velocity += bird.gravity;
    bird.velocity = Math.max(Math.min(bird.velocity, 10), -10);
    bird.y += bird.velocity;

    // Check if bird is at bottom
    if (bird.y + bird.radius >= canvas.height) {
        bird.y = canvas.height - bird.radius;
        bird.velocity = 0;
        bird.isAtBottom = true;
        bird.bottomTimer += deltaTime;
        
        if (bird.bottomTimer >= BOTTOM_TIME_LIMIT) {
            gameOver = true;
        }
    } else {
        bird.isAtBottom = false;
        bird.bottomTimer = 0;
    }

    // Keep bird within top boundary
    if (bird.y - bird.radius < 0) {
        bird.y = bird.radius;
        bird.velocity = 0;
    }

    // Draw bird
    ctx.drawImage(philippineFlag, bird.x - bird.radius, bird.y - bird.radius, 
                 bird.radius * 2, bird.radius * 2);

    drawBottomTimer();

    // Update and draw waves
    if (waves.length === 0 || waves[waves.length - 1].x < canvas.width - 100 * SCALE_FACTOR) {
        createWave();
    }
    
    drawWaves();
    
    // Check wave collision
    waves.forEach((wave, index) => {
        const waveTop = wave.y - wave.amplitude;
        if (bird.x + bird.radius > wave.x && 
            bird.x - bird.radius < wave.x + wave.width && 
            bird.y + bird.radius > waveTop && 
            bird.y + bird.radius < wave.y + wave.height) {
            gameOver = true;
        }
        
        if (wave.x + wave.width < 0) {
            waves.splice(index, 1);
        }
    });

    // Update and draw storms
    for (let i = storms.length - 1; i >= 0; i--) {
        let storm = storms[i];
        storm.x -= 3 * SCALE_FACTOR;
        storm.rotation += storm.rotationSpeed;
        
        drawStorm(storm);

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
    if (storms.length === 0 || storms[storms.length - 1].x < canvas.width - 160 * SCALE_FACTOR) {
        createStorm();
    }

    // Draw score
    ctx.fillStyle = 'white';
    ctx.font = `${20 * SCALE_FACTOR}px Arial`;
    ctx.fillText('Score: ' + score, 10 * SCALE_FACTOR, 30 * SCALE_FACTOR);

    requestAnimationFrame(update);
}

// Event listeners for both mouse click and touch
function handleInteraction(event) {
    event.preventDefault();
    if (gameOver) {
        bird.y = canvas.height/2;
        bird.velocity = 0;
        bird.bottomTimer = 0;
        bird.isAtBottom = false;
        storms = [];
        waves = [];
        score = 0;
        gameOver = false;
        lastTime = 0;
        update();
    } else {
        bird.velocity = JUMP_FORCE * SCALE_FACTOR;
    }
}

canvas.addEventListener('click', handleInteraction);
canvas.addEventListener('touchstart', handleInteraction);

// Handle window resize
window.addEventListener('resize', function() {
    resizeCanvas();
    // Recalculate scale factor
    const newScaleFactor = Math.min(canvas.width / 800, canvas.height / 600);
    bird.radius = 15 * newScaleFactor;
    bird.x = canvas.width * 0.2;
});

// Start game
update();
