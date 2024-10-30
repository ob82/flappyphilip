const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let bird = {
    x: 50,
    y: canvas.height/2,
    velocity: 0,
    gravity: 0.2,
    jump: -12,
    radius: 25
};

let storms = [];
let waves = [];
let gameOver = false;
let score = 0;

// Load images
const philippineFlag = new Image();
philippineFlag.src = 'philippine.gif';

const floodImage = new Image();
floodImage.src = '120814035457-phillipines-8-14-a.jpg';

// Wave creation
function createWave() {
    waves.push({
        x: canvas.width,
        y: canvas.height - 40, // Position waves at bottom
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
            let radius = (layer * 5) + (i *
