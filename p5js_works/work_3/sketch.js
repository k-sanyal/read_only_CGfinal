// ==========================================
// 1. GLOBAL VARIABLES
// ==========================================
let floorTex, wallTex;
let rotAngle = 0;
let currentIndex = 0; 

// Model Variables
let thinker, david, wolf, nike, samoth, disco, alexander, nifer;
let exhibits = [];

// UI Variables
let btnPrev, btnNext;
let lightBrightSlider, lightColorSlider, spinSlider;
let originalLightCheckbox, extraLightCheckbox;
let infoPanel;

// ==========================================
// 2. PRELOAD ASSETS
// ==========================================
function preload() {
  // Textures
  floorTex = loadImage('floor.jpg');
  wallTex = loadImage('10828890898630.jpg');

  // Models ('true' resizes them to fit the screen)
  thinker = loadModel('Rodin_Thinker.obj', true); 
  david = loadModel('david.obj', true);
  wolf = loadModel('wolf.obj', true);
  nifer = loadModel('nifer.obj', true);
  samoth = loadModel('samoth.stl', true);
  disco = loadModel('disco.obj', true);
  alexander = loadModel('alexander.obj', true);
}

// ==========================================
// 3. SETUP & UI CREATION
// ==========================================
function setup() {
  createCanvas(900, 600, WEBGL);
  noStroke();

  // Define our exhibit database with individual rotation corrections (rotX, rotY, rotZ)
  exhibits = [
    { model: david,     name: "Michelangelo's David", desc: "A masterpiece of Renaissance sculpture created in marble between 1501 and 1504.", r: 240, g: 240, b: 245, rotX: 0, rotY: 0, rotZ: PI, offsetY: -150 },
    { model: wolf,      name: "Capitoline Wolf",      desc: "A bronze sculpture depicting the mythical twin founders of Rome, Romulus and Remus.", r: 80, g: 80, b: 80, rotX: HALF_PI, rotY: 0, rotZ: 0, offsetY: -120 },
    { model: thinker,   name: "The Thinker",          desc: "A bronze sculpture by Auguste Rodin, representing philosophy and intellect.", r: 100, g: 180, b: 140, rotX: 0, rotY: 0, rotZ: PI, offsetY: -150 },
    { model: disco,     name: "Discobolus",           desc: "A Greek sculpture completed at the start of the Classical period, figuring a youthful athlete throwing discus.", r: 250, g: 250, b: 250, rotX: HALF_PI, rotY: 0, rotZ: 0, offsetY: -150 },
    { model: alexander, name: "Bust of Alexander",    desc: "A classical depiction of the great Macedonian king and military commander.", r: 200, g: 190, b: 180, rotX: 0, rotY: 0, rotZ: HALF_PI, offsetY: -160 },
    { model: nifer,     name: "Bust of Nefertiti",    desc: "A painted stucco-coated limestone bust of Nefertiti, the Great Royal Wife of Egyptian pharaoh Akhenaten.", r: 230, g: 200, b: 150, rotX: HALF_PI, rotY: 0, rotZ: 0, offsetY: -160 },
    { model: samoth,    name: "Samothrace Variant",   desc: "A monument found on the island of Samothrace representing the goddess Nike.", r: 245, g: 245, b: 245, rotX: HALF_PI, rotY: 0, rotZ: 0, offsetY: -160 }
  ];

  // --- UI SETUP ---
  
  // Right-Side Info Panel
  infoPanel = createDiv('');
  infoPanel.position(650, 50); 
  infoPanel.style('width', '200px');
  infoPanel.style('padding', '15px');
  infoPanel.style('background-color', 'rgba(0, 0, 0, 0.8)'); 
  infoPanel.style('color', 'white');
  infoPanel.style('font-family', 'sans-serif');
  infoPanel.style('border', '2px solid #b89947'); 
  infoPanel.style('border-radius', '10px');
  updateInfoPanel(); 

  // Left/Right Buttons
  btnPrev = createButton('◀ Previous');
  btnPrev.position(30, 540);
  btnPrev.style('padding', '10px');
  btnPrev.mousePressed(goPrevious);

  btnNext = createButton('Next ▶');
  btnNext.position(120, 540);
  btnNext.style('padding', '10px');
  btnNext.mousePressed(goNext);

  // Checkboxes for Lighting Controls
  originalLightCheckbox = createCheckbox(' Museum Original Lighting', true);
  originalLightCheckbox.position(300, 485);
  originalLightCheckbox.style('color', 'white');

  extraLightCheckbox = createCheckbox(' Direct Light', false);
  extraLightCheckbox.position(500, 485);
  extraLightCheckbox.style('color', 'white');

  // Bottom Sliders
  createDiv('Light Brightness').position(300, 520).style('color', 'white');
  lightBrightSlider = createSlider(0, 255, 200);
  lightBrightSlider.position(300, 545);

  createDiv('Light Color').position(460, 520).style('color', 'white');
  lightColorSlider = createSlider(0, 360, 60); 
  lightColorSlider.position(460, 545);

  createDiv('Spin Speed').position(620, 520).style('color', 'white');
  spinSlider = createSlider(0, 0.05, 0.01, 0.001); 
  spinSlider.position(620, 545);
}

// ==========================================
// 4. MAIN DRAW LOOP
// ==========================================
function draw() {
  background(10);
  orbitControl(4, 4, 0.1); 

  // --- BASE LIGHTING ---
  ambientLight(40); 
  directionalLight(60, 60, 70, 0.5, 1, -0.5); 

  // --- CHECKBOX LOGIC: ORIGINAL VS CUSTOM COLOR ---
  let mainLightBrightness = lightBrightSlider.value();

  if (originalLightCheckbox.checked()) {
    // Disable the color slider so user knows it's locked
    lightColorSlider.attribute('disfabled', '');
    // Warm Museum Spotlight
    spotLight(255, 240, 210, 0, -400, 0, 0, 1, 0, PI / 4, 50);
  } else {
    // Enable the color slider
    lightColorSlider.removeAttribute('disabled');
    // Custom Color Spotlight
    colorMode(HSB);
    let spotColor = color(lightColorSlider.value(), 80, mainLightBrightness);
    colorMode(RGB); 
    spotLight(spotColor, 0, -400, 0, 0, 1, 0, PI / 4, 50);
  }

  // --- CHECKBOX LOGIC: STUDIO MULTI-LIGHT ---
  if (extraLightCheckbox.checked()) {
    // A secondary spotlight crossing from the front-right to highlight the face
    spotLight(180, 190, 210, 200, -200, 300, -0.5, 0.5, -1, PI / 3, 20);
    // A soft rim light from behind to make the silhouette pop against the dark wall
    directionalLight(100, 100, 120, -0.5, 0.5, -1);
    // A slight under-glow to capture the bottom geometry
    directionalLight(50, 50, 50, 0, -1, 0);
  }

  // --- ROOM ARCHITECTURE ---
  // Floor
  push();
  translate(0, 150, 0);
  rotateX(HALF_PI);
  if (floorTex) texture(floorTex); else ambientMaterial(200, 200, 205);
  plane(1000, 1000);
  pop();

  // Back Wall
  push();
  translate(0, -50, -400);
  if (wallTex) texture(wallTex); else ambientMaterial(100, 15, 25);
  plane(1000, 400); 
  pop();

  // --- THE EXHIBIT ---
  let currentExhibit = exhibits[currentIndex];

  push();
  translate(0, 150, 0); 
  
  // Pedestal
  translate(0, -60, 0); 
  ambientMaterial(220);
  box(80, 120, 80);
  
  // Sculpture (Moved UP by shifting the Y translation)
  // Check if this specific exhibit has a custom offsetY. If not, default to -110.
  let customHeight = currentExhibit.offsetY !== undefined ? currentExhibit.offsetY : -110;
  
  // Sculpture (Moved UP using dynamic height)
  translate(0, customHeight, 0);
  
  // 1. Continuous spin
  rotateY(rotAngle); 
  // 2. Corrective tilts for the specific model
  rotateX(currentExhibit.rotX);
  rotateY(currentExhibit.rotY);
  rotateZ(currentExhibit.rotZ);
  
  specularMaterial(currentExhibit.r, currentExhibit.g, currentExhibit.b); 
  shininess(30);
  
  if (currentExhibit.model) {
    model(currentExhibit.model); 
  } else {
    box(50); 
  }
  pop();

  // Advance rotation
  rotAngle += spinSlider.value();
}

// ==========================================
// 5. INTERACTION FUNCTIONS
// ==========================================
function goNext() {
  currentIndex++;
  if (currentIndex >= exhibits.length) currentIndex = 0; 
  updateInfoPanel();
}

function goPrevious() {
  currentIndex--;
  if (currentIndex < 0) currentIndex = exhibits.length - 1; 
  updateInfoPanel();
}

function updateInfoPanel() {
  let ex = exhibits[currentIndex];
  infoPanel.html(`
    <h2 style="margin-top:0; border-bottom: 1px solid white; padding-bottom:5px;">${ex.name}</h2>
    <p style="font-size: 14px; line-height: 1.5;">${ex.desc}</p>
    <p style="font-size: 12px; color: #ccc;">Exhibit ${currentIndex + 1} of ${exhibits.length}</p>
  `);
}

function keyPressed() {

  // toggle fullscreen mode

  if (key == "f" || key == "F") {

    let fs = fullscreen();

    fullscreen(!fs);

  }

}

 

function windowResized() {

  resizeCanvas(windowWidth, windowHeight);

}