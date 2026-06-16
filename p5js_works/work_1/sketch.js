let teapot;
let pg; // for rendering pixels
let font;
let autoReveal = 0;
let pixelOffset = 96; //  thing that controlled by scroll
let patchCount = 2; // just changing number
let printedChars = 0;
let charTimer = 0;
const CHAR_SPEED = 3;
let rotX = 90;
let rotY = 15;
let lastMouseX = 0;
let lastMouseY = 0;
let isDragging = false;

function mousePressed() {
  isDragging = true;
  lastMouseX = mouseX;
  lastMouseY = mouseY;
}

function mouseReleased() {
  isDragging = false;
}

function preload() {
  teapot = loadModel('teapot.obj', true);
  font = loadFont('PressStart2P-Regular.ttf');
}

function setup() {
  createCanvas(600, 600, WEBGL);
  pg = createGraphics(600, 600, WEBGL); // second rendering window
  imageMode(CENTER);
  textFont(font);
}

function mouseWheel(event) {
  pixelOffset = constrain(pixelOffset + event.delta * 0.05, 0, 31);
  patchCount = floor(map(pixelOffset, 0, 31, 32, 2)); // high pixel = low patches
  return false; // prevent page scroll
}

function draw() {
  background(8, 8, 8);

  if (autoReveal < 1) autoReveal += 0.003;

  let px = autoReveal < 1 ? map(autoReveal, 0, 1, 48, 1) : constrain(1 + pixelOffset, 1, 32); // first ? statement (if) makes render go all way from 0 to 48 state so we can see how it changes and then go back to scroll func

  renderTeapot(px); // second render window

  push();
  ortho();
  noLights();
  drawTerminalText();
  pop();
  drawTitle();
}

function renderTeapot(pixelSize) {
  pg.clear(); // clear to remove rendering for each frame
  pg.background(8, 8, 8);

  pg.ambientLight(12, 12, 12);
  pg.spotLight(100, 100, 100, 200, -260, 500, -0.3, 0.4, -1, PI / 5, 22);
  pg.pointLight(50, 65, 160, -320, 80, 200);
  pg.pointLight(60, 42, 18,  0, 380, 100);

  pg.push();
  pg.translate(0, -20, 0);
  if (isDragging) {
  rotY += (mouseX - lastMouseX) * 0.01;
  rotX += (mouseY - lastMouseY) * 0.01;
  lastMouseX = mouseX;
  lastMouseY = mouseY;
  }
  pg.rotateY(rotY);
  pg.rotateX(rotX);
  pg.scale(2.0);           // smaller teapot
  pg.fill(235, 232, 225);
  pg.noStroke();
  pg.model(teapot);
  pg.pop();

  let px = max(1, round(pixelSize)); // for size of rendering pixels

  push();
  ortho();
  noLights();
  imageMode(CENTER);

  if (px <= 1) {
    image(pg, 0, 0, width, height);
  } else {
    let sw = max(4, floor(width  / px)); // here this is how teapot "pixelates", downscaling
    let sh = max(4, floor(height / px));
    let small = createGraphics(sw, sh);
    small.image(pg, 0, 0, sw, sh);
    drawingContext.imageSmoothingEnabled = false; // turn off blur for render
    image(small, 0, 0, width, height); // scaling back, pixels - squares
    drawingContext.imageSmoothingEnabled = true;
    small.remove();
  }
  pop();
}

function drawTerminalText() {
  charTimer++;
  if (charTimer >= CHAR_SPEED && autoReveal > 0.3) {
    printedChars++;
    charTimer = 0;
  }
  
  let dynamicLines = [
    "> MODELED BY MARTIN NEWELL",
    "> UNIVERSITY OF UTAH",
    "> BEZIER PATCHES: " + patchCount,   // live number
    "> THE HELLO WORLD OF 3D",
    "> SCROLL TO RENDER, DRAG TO MOVE_",
  ];

  let fullText = dynamicLines.join('\n');
  let visible  = fullText.substring(0, printedChars);
  let visLines = visible.split('\n');

  let lineH  = 22;
  let startX = width/2 - 24;
  let startY = height/2 - 24 - (dynamicLines.length * lineH);

  textFont(font);
  textSize(11);
  textAlign(RIGHT, TOP);


  // White text
  fill(255, 255, 255, 210);
  for (let i = 0; i < visLines.length; i++) {
    text(visLines[i], startX, startY + i * lineH);
  }
}
  
function drawTitle() {
  push();
  ortho();
  noLights();
  textFont(font);
  textSize(22);
  textAlign(LEFT, TOP);
  fill(255, 255, 255, 210);
  text("> UTAH TEAPOT", -width/2 + 24, -height/2 + 24);
  textSize(18);
  text("v1975", -width/2 + 330, -height/2 + 27);
  pop();
  }
