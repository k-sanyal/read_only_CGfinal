// sunflower field 26/03/29

let cols, rows;
let scl = 25; 
let w = 2200; 
let h = 1200; 
let flying = 0;
let terrain = [];

// VARS FOR UI AND PROPS
let cloudSlider, timeSelect, itemCheck, rockCheck, rainbowCheck;
let regenButton;
let imgSunflower, imgLadybug, imgRainbow, imgMoon, grainTex;

//PLACEMENT for RAINBOW (Day only)
let rainbowX = w-200;
let rainbowY = -200;
let rainbowZ = -400;  // IT IS DEPTH!!

// MOON (Night only)
let moonX = 800;
let moonY = -350;
let moonZ = -500;     // Depth

// RAND POS coordinates for bug
let ladybugX, ladybugY;

// VAR FOR STATIC cloud layout (because if no this, clouds generated each frame)
let cloudSeed;

function preload() {
  imgSunflower = loadImage('sunflower.png');
  imgLadybug = loadImage('ladybug.png');
  imgRainbow = loadImage('rainbow.png');
  imgMoon = loadImage('moon.png');
}

function setup() {
  createCanvas(800, 500, WEBGL);
  
  // UI INTERFACE
  let uiContainer = createDiv().style('display', 'flex').style('gap', '15px').style('margin-top', '10px').style('font-family', 'sans-serif').style('flex-wrap', 'wrap');
  
  let timeDiv = createDiv('<b>Time of Day:</b><br>').parent(uiContainer);
  timeSelect = createSelect().parent(timeDiv);
  timeSelect.option('Sunset');
  timeSelect.option('Night');
  
  // default at 0
  let cloudDiv = createDiv('<b>Cloud Amount:</b><br>').parent(uiContainer);
  cloudDiv.style('color', '#00ff00');
  cloudDiv.style('font-family', 'monospace');
  cloudSlider = createSlider(0, 15, 0).parent(cloudDiv);
  
  // default is FALSE (empty scene)
  let checkDiv = createDiv('<b>Generate Objects:</b><br>').parent(uiContainer);
  checkDiv.style('color', '#00ff00');
  checkDiv.style('font-family', 'monospace');
  itemCheck = createCheckbox(' Sunflowers', false).parent(checkDiv);
  itemCheck.style('color', '#00ff00');
  itemCheck.style('font-family', 'monospace');
  rockCheck = createCheckbox(' Rocks', false).parent(checkDiv);
  rockCheck.style('color', '#00ff00');
  rockCheck.style('font-family', 'monospace');
  rainbowCheck = createCheckbox(' Rainbow', false).parent(checkDiv);
  rainbowCheck.style('color', '#00ff00');
  rainbowCheck.style('font-family', 'monospace');

  let btnDiv = createDiv('<br>').parent(uiContainer);
  regenButton = createButton('Generate').parent(btnDiv);
  regenButton.mousePressed(regenerateWorld);

  // GRAIN Layer
  grainTex = createGraphics(width, height);
  grainTex.pixelDensity(1); 
  grainTex.loadPixels();
  for (let i = 0; i < grainTex.pixels.length; i += 4) {
    let grayTone = random(0, 255); 
    grainTex.pixels[i]     = grayTone; 
    grainTex.pixels[i + 1] = grayTone; 
    grainTex.pixels[i + 2] = grayTone; 
    grainTex.pixels[i + 3] = 10; // control
  }
  grainTex.updatePixels();

  // TERRAIN initialized by ARRAY
  cols = w / scl;
  rows = h / scl;
  for (let x = 0; x < cols; x++) {
    terrain[x] = [];
    for (let y = 0; y < rows; y++) {
      terrain[x][y] = 0; 
    }
  }

  // new state generation
  regenerateWorld();
}

function regenerateWorld() {
  flying = random(10000); 
  noiseSeed(random(10000)); 
  randomSeed(random(10000));
  cloudSeed = random(10000);

  ladybugX = floor(random(cols * 0.3, cols * 0.7));
  ladybugY = floor(random(rows * 0.2, rows * 0.8));
}

function draw() {

  // CALCULATE MOVEMENT & TERRAIN MATH

  flying -= 0.003; 
  let yoff = flying;
  
  for (let y = 0; y < rows; y++) {
    let xoff = 0;
    for (let x = 0; x < cols; x++) {
      let n = noise(xoff, yoff);
      let distFromCenter = abs(x - cols / 2) / (cols / 2);
      let valleyHeight = pow(distFromCenter, 2.5) * 600; 
      
      terrain[x][y] = map(n, 0, 1, -40, 60) + valleyHeight;
      xoff += 0.12;
    }
    yoff += 0.12;
  }

  // LIGHTING

  let isNight = false;
  if (timeSelect.value() === 'Night') {
    isNight = true;
  }

  if (isNight) {
    background(10, 15, 30);
    ambientLight(20, 30, 50); // Slightly darker ambient light
    
    // MOONLIGHT: Physical light emanating from the moon's position
    pointLight(180, 200, 255, moonX, moonY, moonZ); 
  } else {
    background(255, 90, 10); 
    ambientLight(110, 100, 90);
    directionalLight(255, 200, 120, 0, 1, -0.5); 
  }


  // CAMERA POSITION

  translate(0, 80);
  rotateX(PI / 2.3); 
  translate(-w / 2, -h / 2 + 100);


  // 4. FOR - DRAW 3D TERRAIN MESH

  noStroke();
  for (let y = 0; y < rows - 1; y++) {
    beginShape(TRIANGLE_STRIP);
    for (let x = 0; x < cols; x++) {
      let z1 = terrain[x][y];
      let z2 = terrain[x][y + 1];
      
      let valleyColor;
      let peakColor;

      if (isNight) {
        valleyColor = color(15, 30, 20);
        peakColor = color(30, 40, 35);
      } else {
        valleyColor = color(40, 90, 30);
        peakColor = color(100, 130, 40);
      }
      
      fill(lerpColor(valleyColor, peakColor, map(z1, -40, 400, 0, 1)));
      vertex(x * scl, y * scl, z1);
      
      fill(lerpColor(valleyColor, peakColor, map(z2, -40, 400, 0, 1)));
      vertex(x * scl, (y + 1) * scl, z2);
    }
    endShape();
  }


  // 5. DRAW sunflowers

  for (let y = 0; y < rows - 1; y++) { 
    for (let x = 0; x < cols; x++) {
      let z = terrain[x][y];
      let distFromCenter = abs(x - cols / 2) / (cols / 2);
      
      if (itemCheck.checked()) {
        if (distFromCenter < 0.4) {
          let flowerPatch = noise(x * 0.15, (y + flying) * 0.15);
          let flowerScale = constrain(map(flowerPatch, 0.55, 0.65, 0, 1), 0, 1);
          
          if (flowerScale > 0) {
            push();
            let offsetX = (noise(x, y) - 0.5) * scl;
            let offsetY = (noise(x + 10, y + 10) - 0.5) * scl;
            translate(x * scl + offsetX, y * scl + offsetY, z + 8); 
            
            rotateX(-PI / 2.3); 
            scale(flowerScale * 0.35); 
            
            noStroke();
            fill(255); 
            if (imgSunflower) texture(imgSunflower);
            plane(40, 50); 
            pop();
          }
        }
      }

      // draw ROCKS (sphere)
      if (rockCheck.checked()) {
        if (distFromCenter > 0.3) {
          let rockNoise = noise(x * 0.5, (y + flying) * 0.5 + 100);
          let rockScale = constrain(map(rockNoise, 0.7, 0.8, 0, 1), 0, 1);
          
          if (rockScale > 0) {
            push();
            translate(x * scl, y * scl, z);
            scale(rockScale);
            
            if (isNight) {
              fill(30);
            } else {
              fill(90);
            }
            sphere(15, 5, 4); 
            pop();
          }
        }
      }

      // spawn  LADYBUG =)
      if (x === ladybugX && y === ladybugY) {
        push();
        translate(x * scl, y * scl, z + 5); 
        rotateX(-PI / 2.3); 
        noStroke();
        fill(255);
        if (imgLadybug) texture(imgLadybug);
        plane(20, 20); 
        pop();
      }
    }
  }

  // CLOUDS, RAINBOW, AND MOON

  push();
  rotateX(-PI / 2.3); 
  translate(w / 2, -350, -400); 
  noStroke();
  
  // here clouds are locked to generated seed so they don't flicker each frame
  randomSeed(cloudSeed);
  
  // Clouds
  for(let i = 0; i < cloudSlider.value(); i++) {
    let drift = (abs(flying) * 30 + random(0, w)) % w;
    let cx = drift - w/2; 
    let cy = random(-80, 80);
    let cz = random(-300, 0);
    
    push();
    translate(cx, cy, cz);
    
    if (isNight) {
      fill(255, 255, 255, 100);
    } else {
      fill(255, 255, 255, 220);
    }
    
    ellipsoid(random(60, 120), random(15, 30), random(40, 80)); 
    pop();
  }
  pop();
  
  randomSeed(frameCount * 1000);

  // Rainbow 
  if (rainbowCheck.checked() && !isNight) { 
    push();
    rotateX(-PI / 2.3); 
    // Uses the manual coordinates cleanly without hidden offsets
    translate(rainbowX, rainbowY, rainbowZ); 
    noStroke();
    fill(255);
    if (imgRainbow) texture(imgRainbow);
    plane(500*3, 300*3); 
    pop();
  }

  // Moon
  if (isNight) { 
    push();
    rotateX(-PI / 2.3); 
    translate(moonX, moonY, moonZ); 
    noStroke();
    fill(255);
    if (imgMoon) texture(imgMoon);
    plane(150, 150); 
    pop();
  }

  // 7. POST-PROCESSED GRAIN OVERLAY

  push();
  resetMatrix();
  drawingContext.disable(drawingContext.DEPTH_TEST);
  noLights(); 
  
  let jitterX = random(-1, 1);
  let jitterY = random(-1, 1);
  image(grainTex, -width/2 + jitterX, -height/2 + jitterY, width + 4, height + 4); 
  
  drawingContext.enable(drawingContext.DEPTH_TEST);
  pop();
  
}