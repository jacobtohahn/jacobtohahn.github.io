const canvas = document.getElementById('game');
const context = canvas.getContext('2d');

var canvasWidth;
var canvasHeight;
var scale = window.devicePixelRatio;

setCanvasDim()

const grid = 40;
const paddleHeight = grid * 5; // 80

var paddleSpeed = 24;
var ballSpeed = 20;

var mouseX;
var mouseY;

var leftScore = 0;
var rightScore = 0;

var stop = false;
var frameCount = 0;
var $results = $("#results");
var fps, fpsInterval, startTime, now, then, elapsed;

document.onmousemove = mouseCoordinates;

const leftPaddle = {
  // start in the middle of the game on the left side
  x: grid * 2,
  y: canvasHeight / 2 - paddleHeight / 2,
  width: grid,
  height: paddleHeight,

  // paddle velocity
  dy: paddleSpeed
};
const rightPaddle = {
  // start in the middle of the game on the right side
  x: canvasWidth - grid * 3,
  y: canvasHeight / 2 - paddleHeight / 2,
  width: grid,
  height: paddleHeight,

  // paddle velocity
  dy: paddleSpeed
};
const ball = {
  // start in the middle of the game
  x: canvasWidth / 2,
  y: canvasHeight / 2,
  width: grid,
  height: grid,

  // keep track of when need to reset the ball position
  resetting: false,

  // ball velocity (start going to the top-right corner)
  dx: ballSpeed,
  dy: -ballSpeed
};

function setCanvasDim() {
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";

  canvasWidth = canvas.width = window.innerWidth * scale;
  canvasHeight = canvas.height = window.innerHeight * scale;
}

// check for collision between two objects using axis-aligned bounding box (AABB)
// @see https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
function collides(obj1, obj2) {
  return obj1.x < obj2.x + obj2.width &&
         obj1.x + obj1.width > obj2.x &&
         obj1.y < obj2.y + obj2.height &&
         obj1.y + obj1.height > obj2.y;
}

function mouseCoordinates(event){
  mouseX = event.clientX * scale;
  mouseY = event.clientY * scale;
  console.log(mouseX);
}

function startAnimating(fps) {
    fpsInterval = 1000 / fps;
    then = window.performance.now();
    startTime = then;
    console.log(startTime);
    loop();
}

// game loop
function loop(newtime) {
  // stop
  if (stop) {
    return;
  }

  // request another frame
  
  requestAnimationFrame(loop);

  // calc elapsed time since last loop

  now = newtime;
  elapsed = now - then;

  // if enough time has elapsed, draw the next frame

  if (elapsed > fpsInterval) {

    // Get ready for next frame by setting then=now, but...
    // Also, adjust for fpsInterval not being multiple of 16.67
    then = now - (elapsed % fpsInterval);

    setCanvasDim();

    maxPaddleY = canvasHeight - grid - paddleHeight;
  
    leftPaddle.x = grid * 2;
    rightPaddle.x = canvasWidth - grid * 3;

    // move paddles by their velocity
    if (mouseX > canvasWidth / 2) {
      if (mouseY > rightPaddle.y + paddleSpeed * scale) {
        rightPaddle.y += rightPaddle.dy;
      } else if (mouseY < rightPaddle.y) {
        rightPaddle.y -= rightPaddle.dy;
      } else {}
    } else {
      if (mouseY > leftPaddle.y + paddleSpeed * scale) {
        leftPaddle.y += leftPaddle.dy;
      } else if (mouseY < leftPaddle.y) {
        leftPaddle.y -= leftPaddle.dy;
      } else {}
    }

    // prevent paddles from going through walls
    if (leftPaddle.y < grid) {
      leftPaddle.y = grid;
    }
    else if (leftPaddle.y > maxPaddleY) {
      leftPaddle.y = maxPaddleY;
    }

    if (rightPaddle.y < grid) {
      rightPaddle.y = grid;
    }
    else if (rightPaddle.y > maxPaddleY) {
      rightPaddle.y = maxPaddleY;
    }
    
    // draw paddles
    context.fillStyle = 'white';
    context.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
    context.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);

    // move ball by its velocity
    ball.x += ball.dx;
    ball.y += ball.dy;

    // prevent ball from going through walls by changing its velocity
    if (ball.y < grid) {
      ball.y = grid;
      ball.dy *= -1;
    }
    else if (ball.y + grid > canvasHeight - grid) {
      ball.y = canvasHeight - grid * 2;
      ball.dy *= -1;
    }

    // reset ball if it goes past paddle (but only if we haven't already done so)
    if ( (ball.x < 0 || ball.x > canvasWidth) && !ball.resetting) {
      ball.resetting = true;
      
      if (ball.x < 0) {
        rightScore += 1;
      }
      if (ball.x > canvasWidth) {
        leftScore += 1;
      }

      // give some time for the player to recover before launching the ball again
      setTimeout(() => {
        ball.resetting = false;
        ball.x = canvasWidth / 2;
        ball.y = canvasHeight / 2;
      }, 400);
    }

    // check to see if ball collides with paddle. if they do change x velocity
    if (collides(ball, leftPaddle)) {
      ball.dx *= -1;

      // move ball next to the paddle otherwise the collision will happen again
      // in the next frame
      ball.x = leftPaddle.x + leftPaddle.width;
    }
    else if (collides(ball, rightPaddle)) {
      ball.dx *= -1;

      // move ball next to the paddle otherwise the collision will happen again
      // in the next frame
      ball.x = rightPaddle.x - ball.width;
    }

    // draw ball
    context.fillRect(ball.x, ball.y, ball.width, ball.height);

    // draw walls
    context.fillStyle = 'lightgrey';
    context.fillRect(0, 0, canvasWidth, grid);
    context.fillRect(0, canvasHeight - grid, canvasWidth, canvasHeight);

    // draw dotted line down the middle
    context.fillStyle = 'gray';
    for (let i = grid; i < canvasHeight - grid; i += grid * 2) {
      context.fillRect(canvasWidth / 2 - grid / 2, i, grid / 4, grid);
    }
    
    // draw scores
    context.fillStyle = 'white';
    context.font = '100px roboto mono';
    context.textAlign = 'center';
    context.fillText(leftScore, grid * 5, grid * 5);
    context.fillText(rightScore, canvasWidth - grid * 5, grid * 5);
  } 
}

// start the game
startAnimating(60)