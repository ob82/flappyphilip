const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const JUMP_FORCE = -6;
const GRAVITY = 0.3;
const BOTTOM_TIME_LIMIT = 5000; // 5 seconds in milliseconds

// Game variables
let bird = {
    x: 50,
    y: canvas.height/2,
    velocity: 0,
    gravity: GRAVITY,
    jump: JUMP_FORCE,
    radius: 15,
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

// Wave creation
function createWave() {
    waves.push({
        x: canvas.width,
        y: canvas.height - 40,
        width: 50,
        height: 30,
        speed: 0.5,
        amplitude: 10,
        frequency: 0.002,
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

// Storm creation
function createStorm() {
    let gap = 280;
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
        ctx.font = '24px Arial';
        ctx.fillText(`Warning: ${timeLeft}s`, canvas.width/2 - 50, 50);
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
        ctx.font = '30px Arial';
        ctx.fillText('Game Over', canvas.width/2 - 70, canvas.height/2);
        ctx.font = '20px Arial';
        ctx.fillText('Click to restart', canvas.width/2 - 60, canvas.height/2 + 40);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update bird with smoother movement
    bird.velocity += bird.gravity;
    bird.velocity = Math.max(Math.min(bird.velocity, 10), -10);
    bird.y += bird.velocity;

    // Check if bird is at bottom
    if (bird.y + bird.radius >= canvas.height) {
        bird.y = canvas.height - bird.radius;
        bird.velocity = 0;
        bird.isAtBottom = true;
        bird.bottomTimer += deltaTime;
        
        // Check if bird has been at bottom too long
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

    // Draw bottom timer warning if needed
    drawBottomTimer();

    // Update and draw waves
    if (waves.length === 0 || waves[waves.length - 1].x < canvas.width - 100) {
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
        storm.x -= 3;
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
        bird.bottomTimer = 0;
        bird.isAtBottom = false;
        storms = [];
        waves = [];
        score = 0;
        gameOver = false;
        lastTime = 0;
        update();
    } else {
        // Smoother bird jump
        bird.velocity = JUMP_FORCE;
    }
});

// Start game
update();
