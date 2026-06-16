 let video;
let bodyPose;
let poses = [];
let connections;
let lerpPoints = null; 
let mode = 1; // 1: Auto-Dance, 2: Webcam Tracker

function preload() {
  // Initialize BlazePose for actual 3D coordinates
  bodyPose = ml5.bodyPose("BlazePose");
}

function setup() {
  createCanvas(800, 600, WEBGL);

  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide(); 

  bodyPose.detectStart(video, gotPoses);
  connections = bodyPose.getSkeleton();
}

function gotPoses(results) {
  poses = results;
}

function keyPressed() {
  if (key === ' ') {
    mode = mode === 1 ? 2 : 1;
    lerpPoints = null; // Reset smoothing when switching modes
  }
}

function draw() {
  background(0); 
  
  // Basic lighting to make the cylinders and spheres look 3D
  ambientLight(50);
  directionalLight(255, 255, 255, 0.5, 0.5, -1);
  
  orbitControl(); // Drag mouse to look around in 3D

  if (mode === 1) {
    drawAutoDance();
  } else {
    drawTracking();
  }
}

// ==========================================
// MODE 1: NATIVE 3D AUTO-DANCE 
// ==========================================
function drawAutoDance() {
  push();
  scale(height / 2); // Scale up to match canvas
  
  let speed = frameCount * 0.15;
  let bounce = sin(speed * 2) * 0.1; 
  translate(0, bounce, 0);
  rotateY(frameCount * 0.05); // Spin the whole robot

  // Procedural Skeleton
  let pts = {
    head: {x: 0, y: -0.6, z: 0},
    lSh: {x: -0.2, y: -0.3, z: 0}, rSh: {x: 0.2, y: -0.3, z: 0},
    lEl: {x: -0.3, y: 0, z: sin(speed)*0.2}, rEl: {x: 0.3, y: 0, z: -sin(speed)*0.2},
    lWr: {x: -0.4, y: 0.3, z: sin(speed)*0.4}, rWr: {x: 0.4, y: 0.3, z: -sin(speed)*0.4},
    lHip: {x: -0.15, y: 0.2, z: 0}, rHip: {x: 0.15, y: 0.2, z: 0},
    lKn: {x: -0.15, y: 0.5, z: -cos(speed*2)*0.2}, rKn: {x: 0.15, y: 0.5, z: -cos(speed*2)*0.2},
    lAnk: {x: -0.15, y: 0.8, z: 0}, rAnk: {x: 0.15, y: 0.8, z: 0}
  };

  // Draw Procedural Limbs
  drawRobotLimb(pts.lSh, pts.rSh, 0.04); drawRobotLimb(pts.lSh, pts.lHip, 0.04);
  drawRobotLimb(pts.rSh, pts.rHip, 0.04); drawRobotLimb(pts.lHip, pts.rHip, 0.04);
  drawRobotLimb(pts.head, pts.lSh, 0.02); drawRobotLimb(pts.head, pts.rSh, 0.02);
  drawRobotLimb(pts.lSh, pts.lEl, 0.02); drawRobotLimb(pts.lEl, pts.lWr, 0.02);
  drawRobotLimb(pts.rSh, pts.rEl, 0.02); drawRobotLimb(pts.rEl, pts.rWr, 0.02);
  drawRobotLimb(pts.lHip, pts.lKn, 0.03); drawRobotLimb(pts.lKn, pts.lAnk, 0.03);
  drawRobotLimb(pts.rHip, pts.rKn, 0.03); drawRobotLimb(pts.rKn, pts.rAnk, 0.03);

  // Draw Procedural Joints
  for (let key in pts) {
    push();
    translate(pts[key].x, pts[key].y, pts[key].z);
    fill(0, 255, 0); noStroke();
    if (key === 'head') box(0.32);
    else sphere(0.03, 6, 6);
    pop();
  }
  pop();
}

// ==========================================
// MODE 2: SMOOTHED 3D TRACKING
// ==========================================
function drawTracking() {
  push();
  // Mirror X-axis and scale BlazePose normalized data to screen size
  scale(-height / 2, height / 2, height / 2);

  if (poses.length > 0) {
    let pose = poses[0];

    // 1. Initialize lerpPoints on first frame
    if (!lerpPoints) {
      lerpPoints = [];
      for (let i = 0; i < pose.keypoints3D.length; i++) {
        lerpPoints[i] = { x: pose.keypoints3D[i].x, y: pose.keypoints3D[i].y, z: pose.keypoints3D[i].z };
      }
    }

    // 2. Smooth the movements
    let drag = 0.2; // Lower = heavier/smoother, Higher = faster/snappier
    for (let i = 0; i < pose.keypoints3D.length; i++) {
      lerpPoints[i].x = lerp(lerpPoints[i].x, pose.keypoints3D[i].x, drag);
      lerpPoints[i].y = lerp(lerpPoints[i].y, pose.keypoints3D[i].y, drag);
      lerpPoints[i].z = lerp(lerpPoints[i].z, pose.keypoints3D[i].z, drag);
    }

    // 3. Draw Solid Robot Limbs
    for (let i = 0; i < connections.length; i++) {
      let a = connections[i][0];
      let b = connections[i][1];
      
      if (pose.keypoints3D[a].confidence > 0.1 && pose.keypoints3D[b].confidence > 0.1) {
        let isTorso = (a === 11 || a === 12 || a === 23 || a === 24); 
        let thickness = isTorso ? 0.04 : 0.02; 
        
        drawRobotLimb(lerpPoints[a], lerpPoints[b], thickness);
      }
    }

    // 4. Draw Solid Joints
    for (let i = 0; i < lerpPoints.length; i++) {
      if (pose.keypoints3D[i].confidence > 0.1) {
        push();
        translate(lerpPoints[i].x, lerpPoints[i].y, lerpPoints[i].z);
        fill(0, 255, 0); noStroke();
        
        if (i === 0) box(0.32); // Box for head
        else sphere(0.03, 6, 6); // Spheres for joints
        pop();
      }
    }
  } else {
    lerpPoints = null; // Reset if you step off camera
  }
  pop();
}

// ==========================================
// UNIVERSAL 3D CYLINDER BUILDER
// ==========================================
function drawRobotLimb(p1, p2, thickness) {
  let limbLength = dist(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
  let midX = (p1.x + p2.x) / 2;
  let midY = (p1.y + p2.y) / 2;
  let midZ = (p1.z + p2.z) / 2;

  push();
  translate(midX, midY, midZ);

  // Vector Math to calculate the 3D rotation
  let defaultDir = createVector(0, 1, 0); 
  let targetDir = createVector(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z).normalize();

  let crossAxis = defaultDir.cross(targetDir); 
  let angle = acos(defaultDir.dot(targetDir)); 

  if (crossAxis.mag() > 0.001) {
    rotate(angle, crossAxis);
  }

  fill(20);          // Dark grey metal
  stroke(0, 255, 0); // Neon green outline
  strokeWeight(1);
  cylinder(thickness, limbLength, 8, 1); // 8 sides for retro low-poly look
  pop();
}