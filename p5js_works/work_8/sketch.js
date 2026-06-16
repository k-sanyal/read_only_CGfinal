let camX = 0, camY = 0, camZ = 300;
let pan = -Math.PI / 2, tilt = 0;
let moveSpeed = 5;
let timeFactor = 0; 

let obstacles = [
  { x: -150, z: -200, size: 60, rot: 0, rotSpeed: 0.1 },
  { x:  150, z: -400, size: 80, rot: 0, rotSpeed: -0.04 },
  { x: -200, z: -600, size: 65, rot: 0, rotSpeed: 0.08 },
  { x:  100, z: -800, size: 70, rot: 0, rotSpeed: -0.08 },
  { x: -100, z: -1000, size: 60, rot: 0, rotSpeed: 0.07 },
  { x:  200, z: -1100, size: 75, rot: 0, rotSpeed: 0.03 }
];

let goal = { x: 0, z: -1350, radius: 100 };
let gameState = 'NONE'; 

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();
  
  let gl = this._renderer.GL;
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
}

function draw() {
  if (gameState === 'WIN') {
    drawWinScreen();
    return;
  } else if (gameState === 'LOSE') {
    drawLoseScreen();
    return;
  }

  background(240);

  calculateTimeFactor();
  handleMouseLook();
  handlePlayerMovement();
  updateObstacleAI();

  let lookX = camX + cos(pan) * cos(tilt);
  let lookY = camY + sin(tilt);
  let lookZ = camZ + sin(pan) * cos(tilt);
  camera(camX, camY, camZ, lookX, lookY, lookZ, 0, 1, 0);

  ambientLight(100);
  directionalLight(255, 255, 255, 0.5, 1, -0.5);
  directionalLight(150, 150, 150, -0.5, 0.5, 0.5);

  drawGridFloor();
  drawObstacles();
  drawGoalZone();

  let h = this._renderer.height;
  camera(0, 0, (h / 2.0) / tan(PI * 30.0 / 180.0), 0, 0, 0, 0, 1, 0);
  drawHUDSpace();
  
  if (dist(camX, camZ, goal.x, goal.z) < goal.radius) {
    gameState = 'WIN';
    exitPointerLock();
  }
}

function calculateTimeFactor() {
  let isMoving = keyIsDown(87) || keyIsDown(83) || keyIsDown(65) || keyIsDown(68);
  let isLooking = (document.pointerLockElement && (abs(movedX) > 0.5 || abs(movedY) > 0.5));

  if (isMoving || isLooking) {
    timeFactor = lerp(timeFactor, 1.0, 0.2);
  } else {
    timeFactor = lerp(timeFactor, 0.01, 0.1);
  }
}

function handlePlayerMovement() {
  let dx = cos(pan) * moveSpeed;
  let dz = sin(pan) * moveSpeed;
  let rightX = cos(pan + HALF_PI) * moveSpeed;
  let rightZ = sin(pan + HALF_PI) * moveSpeed;

  if (keyIsDown(87)) { camX += dx; camZ += dz; } 
  if (keyIsDown(83)) { camX -= dx; camZ -= dz; } 
  if (keyIsDown(65)) { camX -= rightX; camZ -= rightZ; } 
  if (keyIsDown(68)) { camX += rightX; camZ += rightZ; } 
}

function handleMouseLook() {
  if (document.pointerLockElement) {
    pan += movedX * 0.0025;
    tilt += movedY * 0.0025;
    tilt = constrain(tilt, -HALF_PI + 0.05, HALF_PI - 0.05);
  }
}

function updateObstacleAI() {
  for (let obs of obstacles) {
    obs.rot += obs.rotSpeed * timeFactor;

    let angleToPlayer = atan2(camZ - obs.z, camX - obs.x);

    let speed = 2.4 * timeFactor;
    obs.x += cos(angleToPlayer) * speed;
    obs.z += sin(angleToPlayer) * speed;

    let hitDistance = dist(camX, camZ, obs.x, obs.z);
    if (hitDistance < (obs.size / 2) + 35) {
      gameState = 'LOSE';
      exitPointerLock();
    }
  }
}

function drawObstacles() {
  for (let obs of obstacles) {
    push();
    translate(obs.x, 0, obs.z);
    rotateY(obs.rot);
    rotateX(obs.rot * 0.5);
    
    if (timeFactor > 0.1) {
      fill(220, 60, 40); 
    } else {
      fill(60, 60, 65);  
    }
    
    box(obs.size);
    pop();
  }
}

// 
function drawGridFloor() {
  push();
  translate(0, 50, 0);
  rotateX(HALF_PI);
  fill(210, 215, 220);
  plane(2000, 4000);
  pop();
}

function drawGoalZone() {
  push();
  translate(goal.x, 48, goal.z);
  rotateX(HALF_PI);
  fill(30, 200, 100, 180); 
  ellipse(0, 0, goal.radius * 2);
  pop();
}

function drawHUDSpace() {
  let w = this._renderer.width;
  let h = this._renderer.height;

  push();
  resetMatrix();
  translate(-w / 2, -h / 2);

  stroke(40);
  strokeWeight(2);
  line(w / 2 - 8, h / 2, w / 2 + 8, h / 2);
  line(w / 2, h / 2 - 8, w / 2, h / 2 + 8);
  noStroke();
  pop();
}

function drawWinScreen() {
  let w = this._renderer.width;
  let h = this._renderer.height;

  background(30, 180, 80); 
  camera(0, 0, (h / 2.0) / tan(PI * 30.0 / 180.0), 0, 0, 0, 0, 1, 0);

  push();
  resetMatrix();
  translate(-w / 2, -h / 2);
  textAlign(CENTER, CENTER);
  fill(255);
  textSize(w * 0.04);
  text("LEVEL COMPLETE", w / 2, h * 0.4);
  
  textSize(18);
  text("[Press R to Play Again]", w / 2, h * 0.65);
  pop();
}

function drawLoseScreen() {
  let w = this._renderer.width;
  let h = this._renderer.height;

  background(220, 30, 45); 
  camera(0, 0, (h / 2.0) / tan(PI * 30.0 / 180.0), 0, 0, 0, 0, 1, 0);

  push();
  resetMatrix();
  translate(-w / 2, -h / 2);
  textAlign(CENTER, CENTER);
  fill(255);
  textSize(w * 0.05);
  text("SUPER", w / 2, h * 0.35);
  text("HOT", w / 2, h * 0.5);
  
  textSize(16);
  fill(255, 200, 200);
  text("Ouch! A hazard block caught you.", w / 2, h * 0.68);
  fill(255);
  text("[Press R to Restart Loop]", w / 2, h * 0.78);
  pop();
}

function mousePressed() {
  if (gameState === 'NONE') {
    requestPointerLock();
  }
}

function keyPressed() {
  if (key === 'f' || key === 'F') {
    let fs = fullscreen();
    fullscreen(!fs);
    return;
  }

  if (key === 'r' || key === 'R') {
    camX = 0; camY = 0; camZ = 300;
    pan = -Math.PI / 2; tilt = 0;
    gameState = 'NONE';
    timeFactor = 0;
    
    obstacles[0].x = -150; obstacles[0].z = -200;
    obstacles[1].x =  150; obstacles[1].z = -400;
    obstacles[2].x = -200; obstacles[2].z = -600;
    obstacles[3].x =  100; obstacles[3].z = -800;
    obstacles[4].x = -100; obstacles[4].z = -1000;
    obstacles[5].x =  200; obstacles[5].z = -1100;
    
    for (let obs of obstacles) { obs.rot = 0; }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}