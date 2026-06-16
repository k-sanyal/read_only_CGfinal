let theaterImg;
let video;
let faceMesh;
let faces = [];
let currentPan = 0;
let currentTilt = 0;
let trackingMode = true;

let walker;
let walkerHeight = 160;

let panoramaRotationOffset = 16; 
let stageDistance = 1500; 
let stageHeight = 120; 
let stageXOffset = -250;   

let houseLight = 60;
let spot1Intensity = 0;
let spot2Intensity = 0;

function preload() {
  theaterImg = loadImage('theater2.png');
  faceMesh = ml5.faceMesh();
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  faceMesh.detectStart(video, gotPoses);

  walker = new BMWalker(0); 
  walker.setTranslationParam(false); 
}

function gotPoses(results) {
  faces = results;
}

function keyPressed() {
  if (key === ' ') {
    trackingMode = !trackingMode;
  }
}

function draw() {
  background(0);
  
  if (trackingMode && faces.length > 0) {
    let nose = faces[0].keypoints[1]; 
    let targetPan = map(nose.x, 0, video.width, PI, -PI);
    let targetTilt = map(nose.y, 0, video.height, -HALF_PI, HALF_PI);
    
    currentPan = lerp(currentPan, targetPan, 0.1);
    currentTilt = lerp(currentTilt, targetTilt, 0.1);
  } else if (!trackingMode) {
    currentPan = lerp(currentPan, 0, 0.1);
    currentTilt = lerp(currentTilt, 0, 0.1);
  }
  
  let totalPan = currentPan + panoramaRotationOffset;
  let lookX = sin(totalPan) * cos(currentTilt);
  let lookY = sin(currentTilt);
  let lookZ = -cos(totalPan) * cos(currentTilt);
  
  camera(0, 0, 0, lookX, lookY, lookZ, 0, 1, 0);

  ambientLight(houseLight); 
  
  if (keyIsDown(49)) spot1Intensity = lerp(spot1Intensity, 255, 0.1);
  else spot1Intensity = lerp(spot1Intensity, 0, 0.1);
  
  if (keyIsDown(50)) spot2Intensity = lerp(spot2Intensity, 255, 0.1);
  else spot2Intensity = lerp(spot2Intensity, 0, 0.1);

  noStroke();
  panorama(theaterImg);
  
  push();
  rotateY(-panoramaRotationOffset);
  translate(stageXOffset, stageHeight, -stageDistance); 
  
  directionalLight(120, 120, 120, 0, 1, -1);

  spotLight(
    spot1Intensity, spot1Intensity, spot1Intensity, 
    0, -500, 0, 
    0, 1, 0,     
    PI / 3, 1
  );

  spotLight(
    0, spot2Intensity * 0.8, spot2Intensity, 
    -300, -300, 100, 
    1, 0.5, -0.5,     
    PI / 2, 1
  );
  
  specularMaterial(255); 
  shininess(20);
  
  fill(120, 80, 60);
  box(650, 20, 400);
  
  drawTheatricalBMWalker();
  pop();
}

function drawTheatricalBMWalker() {
  walker.setPhase(0);
  
  let markers = walker.getMarkers(walkerHeight);
  let lines = walker.getLineMarkers(walkerHeight);
  let time = frameCount * 0.15;
  
  let leftHandY = -walkerHeight * 0.45 + sin(time) * 15;
  let leftHandX = -35 + cos(time) * 8;
  let leftHandZ = 25 + sin(time) * 10;
  
  let rightHandY = -walkerHeight * 0.45 + sin(time + PI) * 15;
  let rightHandX = 35 + cos(time + PI) * 8;
  let rightHandZ = 25 + sin(time + PI) * 10;

  let leftElbowY = -walkerHeight * 0.48 + sin(time - HALF_PI) * 5;
  let leftElbowX = -30;
  let leftElbowZ = 10;

  let rightElbowY = -walkerHeight * 0.48 + sin(time + PI - HALF_PI) * 5;
  let rightElbowX = 30;
  let rightElbowZ = 10;

  let displayMarkers = [];
  for (let m of markers) {
    let cloned = { x: m.x, y: m.y, z: m.z, desc: m.desc };
    
    if (cloned.desc === "L_Wrist" || cloned.desc === "L_Hand" || cloned.desc === "L_Finger") {
      cloned.x = leftHandX; cloned.y = leftHandY; cloned.z = leftHandZ;
    } else if (cloned.desc === "R_Wrist" || cloned.desc === "R_Hand" || cloned.desc === "R_Finger") {
      cloned.x = rightHandX; cloned.y = rightHandY; cloned.z = rightHandZ;
    } else if (cloned.desc === "L_Elbow") {
      cloned.x = leftElbowX; cloned.y = leftElbowY; cloned.z = leftElbowZ;
    } else if (cloned.desc === "R_Elbow") {
      cloned.x = rightElbowX; cloned.y = rightElbowY; cloned.z = rightElbowZ;
    }
    displayMarkers.push(cloned);
  }

  push();
  translate(0, -walkerHeight / 2 - 10, 0);
  
  stroke(255);
  strokeWeight(5);
  for (let ln of lines) {
    let id1 = ln[0].desc;
    let id2 = ln[1].desc;
    let p1 = displayMarkers.find(m => m.desc === id1);
    let p2 = displayMarkers.find(m => m.desc === id2);
    if (p1 && p2) {
      line(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
    }
  }
  
  noStroke();
  for (let pt of displayMarkers) {
    push();
    translate(pt.x, pt.y, pt.z);
    specularMaterial(255);
    if (pt.desc === "Head") {
      sphere(14);
    } else {
      sphere(7);
    }
    pop();
  }
  
  fill(255, 50, 50);
  push();
  let ball1Y = -walkerHeight + abs(sin(time * 2)) * -60;
  let ball1X = sin(time) * 30;
  translate(ball1X, ball1Y, 40);
  sphere(7);
  pop();
  
  fill(50, 255, 50);
  push();
  let ball2Y = -walkerHeight + abs(sin(time * 2 + PI)) * -60;
  let ball2X = sin(time + PI) * 30;
  translate(ball2X, ball2Y, 40);
  sphere(7);
  pop();
  
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}