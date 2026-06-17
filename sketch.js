// 0. Ambient computer hum (loops, low volume, starts at scene start)
const humAudio = new Audio('assets/671944__arch418__serv5.wav');
humAudio.loop = true;
humAudio.volume = 0.12;
// Try to start immediately; if the browser blocks autoplay-with-sound,
// fall back to starting on the first user interaction.
humAudio.play().catch(() => {
  const startHum = () => {
    humAudio.play().catch(() => {});
    window.removeEventListener('pointerdown', startHum);
    window.removeEventListener('keydown', startHum);
    window.removeEventListener('wheel', startHum);
  };
  window.addEventListener('pointerdown', startHum);
  window.addEventListener('keydown', startHum);
  window.addEventListener('wheel', startHum);
});

// 0b. UI interaction sound (plays on every click / keypress in the 3D view)
const clickSound = new Audio('assets/367852__jofae__button-pressed.mp3');
clickSound.volume = 0.35;
function playClick() {
  // Reset so rapid interactions retrigger instead of being ignored
  clickSound.currentTime = 0;
  clickSound.play().catch(() => {});
}
window.addEventListener('pointerdown', playClick);
window.addEventListener('keydown', playClick);

// 1. Scene, Camera, and Renderer Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050508);

// Camera setup (Perspective camera looking at the monitor)
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0.75, 1.45); // Positioned slightly above and back from the monitor

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.domElement.style.position = 'absolute';
renderer.domElement.style.top = '0';
renderer.domElement.style.left = '0';
renderer.domElement.style.zIndex = '1';
document.body.appendChild(renderer.domElement);

// Setup CSS3D Renderer
const cssRenderer = new THREE.CSS3DRenderer();
cssRenderer.setSize(window.innerWidth, window.innerHeight);
cssRenderer.domElement.style.position = 'absolute';
cssRenderer.domElement.style.top = '0';
cssRenderer.domElement.style.left = '0';
cssRenderer.domElement.style.width = '100%';
cssRenderer.domElement.style.height = '100%';
cssRenderer.domElement.style.pointerEvents = 'none'; // Clicks pass through to WebGL except on CSS3D elements
cssRenderer.domElement.style.zIndex = '2';
document.body.appendChild(cssRenderer.domElement);

// 2. Lighting (Creating a moody, slightly off-atmosphere dark room)
// Ambient light for general dark visibility
const ambientLight = new THREE.AmbientLight(0x0a0c10, 0.6);
scene.add(ambientLight);

// Overhead atmospheric spotlight (Stanley Parable style)
const overheadLight = new THREE.SpotLight(0xfff5ea, 2.5);
overheadLight.position.set(1.5, 3.5, 1.0);
overheadLight.target.position.set(0, 0.2, -0.5);
overheadLight.angle = Math.PI / 4;
overheadLight.penumbra = 0.8;
overheadLight.castShadow = true;
overheadLight.shadow.mapSize.width = 1024;
overheadLight.shadow.mapSize.height = 1024;
overheadLight.shadow.bias = -0.001;
scene.add(overheadLight);
scene.add(overheadLight.target);

// Screen glow point light (cool blue/teal emissive glow from the CRT screen)
const screenGlow = new THREE.PointLight(0x33aaff, 1.2, 3.0);
screenGlow.position.set(0, 0.73, 0.05);
scene.add(screenGlow);

// 3. Geometry & Meshes

// Dark Room (Inverted box enclosing the entire scene)
const roomGeometry = new THREE.BoxGeometry(8, 6, 8);
const roomMaterial = new THREE.MeshStandardMaterial({
  color: 0x090b0e,
  roughness: 0.95,
  metalness: 0.05,
  side: THREE.BackSide
});
const room = new THREE.Mesh(roomGeometry, roomMaterial);
room.position.set(0, 2.9, -1.0); // Floor sits at y = -0.1
room.receiveShadow = true;
scene.add(room);

// Desk Surface
const deskGeometry = new THREE.BoxGeometry(5.0, 0.1, 2.5);
const deskMaterial = new THREE.MeshStandardMaterial({
  color: 0x161412, // Dark wooden / plastic material
  roughness: 0.8,
  metalness: 0.1
});
const desk = new THREE.Mesh(deskGeometry, deskMaterial);
desk.position.set(0, -0.05, -0.5); // Top surface is at y = 0.0
desk.receiveShadow = true;
desk.castShadow = true;
scene.add(desk);

// CRT Monitor Group
const monitorGroup = new THREE.Group();

// Monitor Base
const baseGeometry = new THREE.BoxGeometry(0.5, 0.05, 0.5);
const monitorPlasticMaterial = new THREE.MeshStandardMaterial({
  color: 0x3d3e42, // Classic 90s dark gray computer plastic
  roughness: 0.6,
  metalness: 0.1
});
const monitorBase = new THREE.Mesh(baseGeometry, monitorPlasticMaterial);
monitorBase.position.set(0, 0.025, -0.5);
monitorBase.castShadow = true;
monitorBase.receiveShadow = true;
monitorGroup.add(monitorBase);

// Monitor Neck
const neckGeometry = new THREE.CylinderGeometry(0.08, 0.1, 0.1, 16);
const monitorNeck = new THREE.Mesh(neckGeometry, monitorPlasticMaterial);
monitorNeck.position.set(0, 0.1, -0.5);
monitorNeck.castShadow = true;
monitorNeck.receiveShadow = true;
monitorGroup.add(monitorNeck);

// Monitor Cabinet (CRT body)
const cabinetGeometry = new THREE.BoxGeometry(1.3, 1.0, 1.0);
const monitorCabinet = new THREE.Mesh(cabinetGeometry, monitorPlasticMaterial);
monitorCabinet.position.set(0, 0.65, -0.6);
monitorCabinet.castShadow = true;
monitorCabinet.receiveShadow = true;
monitorGroup.add(monitorCabinet);

// Monitor Screen Bezel (front frame)
const bezelGeometry = new THREE.BoxGeometry(1.32, 1.02, 0.05);
const monitorBezel = new THREE.Mesh(bezelGeometry, monitorPlasticMaterial);
monitorBezel.position.set(0, 0.65, -0.1);
monitorBezel.castShadow = true;
monitorBezel.receiveShadow = true;
monitorGroup.add(monitorBezel);

const screenGeometry = new THREE.PlaneGeometry(1.16, 0.87);
const screenMaterial = new THREE.MeshStandardMaterial({
  color: 0x07080a,
  roughness: 0.2,
  metalness: 0.8,
  emissive: 0x051a2e, // Subtle baseline glow from screen being powered on
  emissiveIntensity: 0.3
});
const monitorScreen = new THREE.Mesh(screenGeometry, screenMaterial);
// Positioned slightly in front of the bezel to avoid z-fighting
monitorScreen.position.set(0, 0.65, -0.07);
monitorScreen.receiveShadow = true;
monitorGroup.add(monitorScreen);

// Add CSS3D Object for the screen content
const screenFrame = document.createElement('iframe');
screenFrame.style.width = '1160px'; // Corresponds to 1.16 units in Three.js at 1000px/unit scale
screenFrame.style.height = '870px'; // Corresponds to 0.87 units
screenFrame.style.border = 'none';
screenFrame.style.backgroundColor = '#000'; // Ensure background is black
screenFrame.style.pointerEvents = 'auto'; // Allow interaction with iframe content
screenFrame.src = 'screen.html'; // Load our DOS interface

const screenObject = new THREE.CSS3DObject(screenFrame);
screenObject.position.set(0, 0.65, -0.07); // Align with the monitor screen mesh
screenObject.scale.set(0.001, 0.001, 0.001); // Scale down to match Three.js units
monitorGroup.add(screenObject);

scene.add(monitorGroup);

// Load Keyboard Model
const loader = new THREE.GLTFLoader();
loader.load('assets/ibm_model_m_keyboard.glb', (gltf) => {
  const keyboard = gltf.scene;
  keyboard.position.set(0, 0.05, 0.3); // Placed on desk, in front of monitor base
  keyboard.scale.set(1.8, 1.8, 1.8); // Adjust scale as needed
  keyboard.castShadow = true;
  keyboard.receiveShadow = true;
  keyboard.traverse((child) => {
    if (child.isMesh) {
      child.material.color.set(0x222222);
    }
  });
  scene.add(keyboard);
});

// Point camera at the center of the monitor screen
camera.lookAt(0, 0.65, -0.07);

// 4. Handle Window Resizing
window.addEventListener('resize', onWindowResize, false);

// Zoom functionality (with bounds)
window.addEventListener('wheel', (event) => {
  zoomCamera(event.deltaY);
});

// Listen for zoom events from the iframe
window.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'camera-zoom') {
    zoomCamera(event.data.deltaY);
  }
});

function zoomCamera(deltaY) {
  // event.deltaY is positive when scrolling down (zoom out), negative when scrolling up (zoom in)
  camera.position.z += deltaY * 0.005;
  // Clamp z between 0.2 (closer to screen) and 2.0 (further back)
  camera.position.z = Math.max(0.2, Math.min(camera.position.z, 2.0));
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  // Also resize the CSS3DRenderer
  cssRenderer.setSize(window.innerWidth, window.innerHeight);
  // Keep PS1 composer + shader resolution in sync
  if (typeof composer !== 'undefined') {
    composer.setSize(window.innerWidth, window.innerHeight);
    ps1Pass.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
  }
}

// ============================================================
// PS1 POST-PROCESSING (lite) — fully self-contained.
// To revert: set PS1_POST = false, or delete this block and the
// composer branch in animate() + the postprocessing scripts in index.html.
// Press "P" at runtime to toggle on/off live.
// ============================================================
let PS1_POST = true;

// Cheap classic-PS1 trio: low-res pixel snap + color banding + ordered dither.
const PS1Shader = {
  uniforms: {
    tDiffuse: { value: null },
    resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    pixelSize: { value: 3.0 },   // chunky pixels (downsample factor)
    colorDepth: { value: 32.0 }  // levels per channel (~5-bit)
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    uniform float pixelSize;
    uniform float colorDepth;
    varying vec2 vUv;

    // 4x4 ordered Bayer dither matrix
    float bayer(vec2 p) {
      int x = int(mod(p.x, 4.0));
      int y = int(mod(p.y, 4.0));
      int i = x + y * 4;
      float m[16];
      m[0]=0.0;  m[1]=8.0;  m[2]=2.0;  m[3]=10.0;
      m[4]=12.0; m[5]=4.0;  m[6]=14.0; m[7]=6.0;
      m[8]=3.0;  m[9]=11.0; m[10]=1.0; m[11]=9.0;
      m[12]=15.0;m[13]=7.0; m[14]=13.0;m[15]=5.0;
      float v = 0.0;
      for (int k = 0; k < 16; k++) { if (k == i) v = m[k]; }
      return v / 16.0 - 0.5;
    }

    void main() {
      // Pixel snap (low-res look)
      vec2 grid = resolution / pixelSize;
      vec2 uv = floor(vUv * grid) / grid;
      vec4 color = texture2D(tDiffuse, uv);

      // Ordered dither + color quantization (banding)
      float d = bayer(gl_FragCoord.xy / pixelSize) / colorDepth;
      color.rgb = floor(color.rgb * colorDepth + 0.5 + d) / colorDepth;

      gl_FragColor = color;
    }
  `
};

const composer = new THREE.EffectComposer(renderer);
composer.addPass(new THREE.RenderPass(scene, camera));
const ps1Pass = new THREE.ShaderPass(PS1Shader);
ps1Pass.renderToScreen = true;
composer.addPass(ps1Pass);

window.addEventListener('keydown', (e) => {
  if (e.key === 'p' || e.key === 'P') {
    PS1_POST = !PS1_POST;
    console.log('PS1 post-processing:', PS1_POST ? 'ON' : 'OFF');
  }
});

// 5. Render Loop
function animate() {
  requestAnimationFrame(animate);

  // Subtle camera breathing/drift effect to make the static room feel alive
  const time = Date.now() * 0.001;
  camera.position.x = Math.sin(time * 0.5) * 0.015;
  camera.position.y = 0.75 + Math.cos(time * 0.3) * 0.01;
  camera.lookAt(0, 0.65, -0.07);

  // Render the 3D scene (with or without PS1 post)
  if (PS1_POST) {
    composer.render();
  } else {
    renderer.render(scene, camera);
  }
  // CSS3D screen always renders on top, unaffected by post-processing
  cssRenderer.render(scene, camera);
}


animate();