let glassesModel;
let lightAngle = 0;
let ps1t = 0;

// --- CAMERA DRAG VARIABLES ---
// Set to the default isometric view angles
let camRotX = -Math.PI / 6; 
let camRotY = Math.PI / 4;  

// UI state
let lights = [true, true, true, true];
let orbitSpeed = 30;
let spotCone = 30;
let spotConc = 10;
let glassH = -20;

// Sliders
let sl_orbitSpeed, sl_spotCone, sl_spotConc, sl_glassH;

// Toggle buttons
let btn0, btn1, btn2, btn3;

function preload() {
  glassesModel = loadModel('glasses.obj', true);
}

function setup() {
  setAttributes('antialias', false);
  createCanvas(800, 600, WEBGL);
  noSmooth();
  angleMode(RADIANS);

  // --- BUTTONS ---
  btn0 = createButton('White Spot ON');
  btn0.position(10, 10);
  btn0.style('background', '#111'); btn0.style('color', '#fff');
  btn0.style('border', '1px solid #d98aff'); btn0.style('font-family', 'monospace');
  btn0.style('font-size', '11px'); btn0.style('padding', '4px 8px'); btn0.style('cursor', 'pointer');
  btn0.mousePressed(() => toggleLight(0, btn0));

  btn1 = createButton('Pink Spot ON');
  btn1.position(10, 38);
  btn1.style('background', '#111'); btn1.style('color', '#fff');
  btn1.style('border', '1px solid #ff3399'); btn1.style('font-family', 'monospace');
  btn1.style('font-size', '11px'); btn1.style('padding', '4px 8px'); btn1.style('cursor', 'pointer');
  btn1.mousePressed(() => toggleLight(1, btn1));

  btn2 = createButton('Cyan Spot ON');
  btn2.position(10, 66);
  btn2.style('background', '#111'); btn2.style('color', '#fff');
  btn2.style('border', '1px solid #22ccff'); btn2.style('font-family', 'monospace');
  btn2.style('font-size', '11px'); btn2.style('padding', '4px 8px'); btn2.style('cursor', 'pointer');
  btn2.mousePressed(() => toggleLight(2, btn2));

  btn3 = createButton('Amber Dir ON');
  btn3.position(10, 94);
  btn3.style('background', '#111'); btn3.style('color', '#fff');
  btn3.style('border', '1px solid #ffcc00'); btn3.style('font-family', 'monospace');
  btn3.style('font-size', '11px'); btn3.style('padding', '4px 8px'); btn3.style('cursor', 'pointer');
  btn3.mousePressed(() => toggleLight(3, btn3));

  // --- SLIDERS (Refined Names) ---
  createP('Colored Light Orbit Speed').position(10, 118).style('color','#888').style('font-size','10px').style('font-family','monospace').style('margin','0').style('pointer-events', 'none');
  sl_orbitSpeed = createSlider(0, 100, 30);
  sl_orbitSpeed.position(10, 140); sl_orbitSpeed.style('width', '130px');

  createP('Spotlights Cone Spread').position(10, 158).style('color','#888').style('font-size','10px').style('font-family','monospace').style('margin','0').style('pointer-events', 'none');
  sl_spotCone = createSlider(5, 80, 30);
  sl_spotCone.position(10, 178); sl_spotCone.style('width', '130px');

  createP('Spotlights Edge Fade').position(10, 196).style('color','#888').style('font-size','10px').style('font-family','monospace').style('margin','0').style('pointer-events', 'none');
  sl_spotConc = createSlider(1, 200, 10);
  sl_spotConc.position(10, 216); sl_spotConc.style('width', '130px');

  createP('Object Y-Offset (Height)').position(10, 234).style('color','#888').style('font-size','10px').style('font-family','monospace').style('margin','0').style('pointer-events', 'none');
  sl_glassH = createSlider(-150, 150, -20);
  sl_glassH.position(10, 254); sl_glassH.style('width', '130px');
}

function toggleLight(i, btn) {
  lights[i] = !lights[i];
  const labels = ['White Spot', 'Pink Spot', 'Cyan Spot', 'Amber Dir'];
  btn.html(labels[i] + (lights[i] ? ' ON' : ' OFF'));
  btn.style('opacity', lights[i] ? '1' : '0.4');
}

// --- MOUSE DRAG SCENE CAMERA ---
function mouseDragged() {
  // Only rotate the scene if the mouse is dragged on the right side of the canvas
  // This prevents accidentally spinning the camera when dragging the UI sliders.
  if (mouseX > 160) {
    camRotY += (mouseX - pmouseX) * 0.01;
    camRotX += (mouseY - pmouseY) * 0.01;
  }
}

function draw() {
  ps1t += 1;

  // Read sliders safely
  orbitSpeed = Number(sl_orbitSpeed.value());
  spotCone   = Number(sl_spotCone.value());
  spotConc   = Number(sl_spotConc.value());
  glassH     = Number(sl_glassH.value());

  lightAngle += (orbitSpeed / 100) * 0.02;

  background(6, 6, 16);

  // --- CAMERA ---
  ortho(-width / 2, width / 2, -height / 2, height / 2, -2000, 2000);
  
  // Apply the interactive drag rotations
  rotateX(camRotX);
  rotateY(camRotY);

  // --- LIGHTING ---
  ambientLight(50, 50, 80);

  const coneAngle = radians(spotCone);

  if (lights[0]) {
    spotLight(255, 255, 255,
              0, -400, 0,
              0, 1, 0,
              coneAngle, spotConc);
  }

  if (lights[1]) {
    let px = 350 * cos(lightAngle);
    let pz = 350 * sin(lightAngle);
    spotLight(255, 40, 140,
              px, -300, pz,
              -px * 0.003, 1, -pz * 0.003,
              coneAngle, spotConc);
  }

  if (lights[2]) {
    let cx = 300 * cos(lightAngle + PI);
    let cz = 300 * sin(lightAngle + PI);
    spotLight(20, 200, 255,
              cx, -280, cz,
              -cx * 0.003, 1, -cz * 0.003,
              coneAngle, spotConc);
  }

  if (lights[3]) {
    directionalLight(255, 190, 60, 0.5, 1, 0.4);
  }

  // --- ENVIRONMENT ---
  drawRoom();
  drawImpossibleStairs();

  // --- PODIUM ---
  push();
  translate(0, 100, 0);
  fill(150, 150, 165);
  stroke(60);
  strokeWeight(0.5);
  box(300, 20, 300);
  pop();

  // --- FAKE SHADOW ---
  push();
  translate(0, 89, 0);
  rotateX(HALF_PI);
  noStroke();
  let sx = 18 * sin(lightAngle);
  let sy = 18 * cos(lightAngle);
  translate(sx, sy, 0);
  fill(8, 8, 18, 210);
  beginShape();
  vertex(-50, -50);
  vertex( 20, -50);
  vertex( 40, -20); 
  vertex( 30,   0); 
  vertex( 50,  30); 
  vertex( 30,  40); 
  vertex( 40,  50); 
  vertex( 20,  70); 
  vertex(-50,  70);
  endShape(CLOSE);
  pop();

  // --- GLASSES .OBJ ---
  push();
  translate(0, glassH, 0);

  let jx = (noise(ps1t * 0.018)       - 0.5) * 2.5;
  let jy = (noise(ps1t * 0.018 + 100) - 0.5) * 2.5;
  translate(jx, jy, 0);

  rotateX(sin(ps1t * 0.025) * 0.04); 

  noStroke();
  fill(35, 32, 40); 

  model(glassesModel);
  pop();
}

// --- ROOM ---
function drawRoom() {
  noStroke();

  push(); fill(18, 18, 40);
  translate(0, 115, 0); rotateX(HALF_PI);
  plane(700, 700); pop();

  push(); fill(13, 13, 34);
  translate(0, -185, -350);
  plane(700, 600); pop();

  push(); fill(11, 11, 30);
  translate(-350, -185, 0); rotateY(HALF_PI);
  plane(700, 600); pop();

  push(); fill(11, 11, 30);
  translate(350, -185, 0); rotateY(HALF_PI);
  plane(700, 600); pop();

  stroke(25, 25, 55);
  strokeWeight(0.5);
  for (let i = -3; i <= 3; i++) {
    push(); translate(i * 50, 114, 0); rotateX(HALF_PI);
    line(-350, 0, 350, 0); pop();
    push(); translate(0, 114, i * 50); rotateX(HALF_PI);
    line(0, -350, 0, 350); pop();
  }
  noStroke();
}

// --- IMPOSSIBLE ESCHER STAIRS ---
function drawImpossibleStairs() {
  noStroke();
  let sw = 90, sh = 14, sd = 42;

  for (let i = 0; i < 7; i++) {
    let jx = (noise(i * 33.1, ps1t * 0.012) - 0.5) * 1.8;
    let jy = (noise(i * 33.1 + 50, ps1t * 0.012) - 0.5) * 1.8;
    push();
    fill(20 + i * 5, 20 + i * 5, 52 + i * 7);
    translate(jx, -i * sh + jy, i * sd - 200);
    box(sw, sh, sd);
    pop();
  }

  push(); fill(26, 26, 68);
  translate( 52, -80, -200); box(9, 220, 9); pop();
  push(); fill(26, 26, 68);
  translate(-52, -80, -200); box(9, 220, 9); pop();

  push(); fill(26, 26, 68);
  translate(0, -188, -200); box(115, 9, 9); pop();

  push(); fill(22, 22, 60);
  translate(0, -50, -120); box(120, 7, 100); pop();
}