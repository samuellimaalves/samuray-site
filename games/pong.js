const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const gameStatusEl = document.getElementById('gameStatus');
const highScoreEl = document.getElementById('highScore');

let gameRunning = false;
let highScore = 0;

const paddleWidth = 12, paddleHeight = 80;
const player = { x: 20, y: canvas.height / 2 - paddleHeight / 2, width: paddleWidth, height: paddleHeight, score: 0 };
const ai = { x: canvas.width - 32, y: canvas.height / 2 - paddleHeight / 2, width: paddleWidth, height: paddleHeight, score: 0 };
const ball = { x: canvas.width / 2, y: canvas.height / 2, radius: 8, dx: 4, dy: 3 };

let keys = {};

// Controles de Teclado (PC)
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if ([' ', 'ArrowUp', 'ArrowDown', 'w', 's'].includes(e.key)) {
        if (e.target === document.body) e.preventDefault();
    }
});
window.addEventListener('keyup', (e) => { keys[e.key] = false; });

// Controles Touch (Celular - Arrastar na tela)
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touchY = e.touches[0].clientY - rect.top;
    const scaleY = canvas.height / rect.height;
    player.y = (touchY * scaleY) - (player.height / 2);

    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
}, { passive: false });

// Suporte a mouse drag para testes no PC
let isMouseDown = false;
canvas.addEventListener('mousedown', () => { isMouseDown = true; });
window.addEventListener('mouseup', () => { isMouseDown = false; });
canvas.addEventListener('mousemove', (e) => {
    if (!isMouseDown) return;
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    const scaleY = canvas.height / rect.height;
    player.y = (mouseY * scaleY) - (player.height / 2);
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
});

startBtn.addEventListener('click', () => {
    gameRunning = !gameRunning;
    gameStatusEl.textContent = gameRunning ? "Jogando" : "Pausado";
    gameStatusEl.style.color = gameRunning ? "#55ff55" : "#ff5555";
    if (gameRunning) loop();
});

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = -ball.dx;
}

function update() {
    if (!gameRunning) return;

    if (keys['w'] || keys['W'] || keys['ArrowUp']) {
        player.y -= 6;
    }
    if (keys['s'] || keys['S'] || keys['ArrowDown']) {
        player.y += 6;
    }

    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;

    // IA simples
    let aiCenter = ai.y + ai.height / 2;
    if (aiCenter < ball.y - 35) {
        ai.y += 3.5;
    } else if (aiCenter > ball.y + 35) {
        ai.y -= 3.5;
    }
    if (ai.y < 0) ai.y = 0;
    if (ai.y + ai.height > canvas.height) ai.y = canvas.height - ai.height;

    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
    }

    // Colisão Jogador
    if (
        ball.x - ball.radius < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height
    ) {
        let deltaY = ball.y - (player.y + player.height / 2);
        ball.dx = Math.abs(ball.dx) + 0.2;
        ball.dy = deltaY * 0.15;
        ball.x = player.x + player.width + ball.radius;
    }

    // Colisão IA
    if (
        ball.x + ball.radius > ai.x &&
        ball.y > ai.y &&
        ball.y < ai.y + ai.height
    ) {
        let deltaY = ball.y - (ai.y + ai.height / 2);
        ball.dx = -(Math.abs(ball.dx) + 0.2);
        ball.dy = deltaY * 0.15;
        ball.x = ai.x - ball.radius;
    }

    // Pontuação
    if (ball.x < 0) {
        ai.score++;
        if (player.score > highScore) highScore = player.score;
        highScoreEl.textContent = highScore;
        resetBall();
    } else if (ball.x > canvas.width) {
        player.score++;
        if (player.score > highScore) highScore = player.score;
        highScoreEl.textContent = highScore;
        resetBall();
    }
}

function draw() {
    ctx.fillStyle = '#0b0b0b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Linha central
    ctx.strokeStyle = '#222';
    ctx.setLineDash([5, 15]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Raquetes e Bola
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillRect(ai.x, ai.y, ai.width, ai.height);

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // Placar
    ctx.font = 'bold 48px -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.textAlign = 'center';
    ctx.fillText(player.score, canvas.width / 4, 70);
    ctx.fillText(ai.score, (canvas.width / 4) * 3, 70);
}

function loop() {
    update();
    draw();
    if (gameRunning) {
        requestAnimationFrame(loop);
    }
}

draw();
