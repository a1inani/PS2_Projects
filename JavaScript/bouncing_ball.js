// {"name": "Bouncing Ball", "author": "Alinani", "version": "1.0", "file": "ball.js"}

const font = new Font("default");

// Ball properties
const ball = {
    x: 320.0,
    y: 224.0,
    vx: 3.0,
    vy: 2.5,
    radius: 20.0,
    color: Color.new(255, 200, 0, 128)
};

// Screen boundaries
const SCREEN_WIDTH = 640.0;
const SCREEN_HEIGHT = 448.0;

os.setInterval(() => {
    Screen.clear();
    
    // Update ball position
    ball.x += ball.vx;
    ball.y += ball.vy;
    
    // Bounce off edges
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > SCREEN_WIDTH) {
        ball.vx *= -1;
        ball.x = Math.max(ball.radius, Math.min(ball.x, SCREEN_WIDTH - ball.radius));
    }
    
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > SCREEN_HEIGHT) {
        ball.vy *= -1;
        ball.y = Math.max(ball.radius, Math.min(ball.y, SCREEN_HEIGHT - ball.radius));
    }
    
    // Draw ball
    Draw.circle(ball.x, ball.y, ball.radius, ball.color, true);
    
    font.print(10, 10, "Bouncing Ball Demo");
    
    Screen.flip();
}, 0);