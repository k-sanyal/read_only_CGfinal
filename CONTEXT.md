Project: read_only
A browser-based interactive portfolio built in Three.js.

CONCEPT:
A PS1-era styled room with a desk and a CRT monitor. The monitor
displays p5.js works from the course. The Three.js environment
applies PS1 rendering techniques as a deliberate aesthetic.

AESTHETIC REFERENCES:
- The Stanley Parable: static interior, office room, slightly off atmosphere
- PS1 era games (1994-2000): low poly geometry, vertex snapping,
  affine texture warping, dithered shadows, distance fog, color banding

TECHNICAL STRUCTURE:
- Three.js builds the 3D room (desk, CRT monitor mesh, window, objects)
- Custom GLSL vertex shader snaps geometry to simulate PS1 vertex quantization
- Scene renders into low-res WebGLRenderTarget (~320x240) upscaled with nearest-neighbor
- Billboard sprites for secondary desk objects
- 2D canvas overlay on top for scanlines, row shift glitch, RGB offset
- Monitor screen displays p5.js works as HTML layer aligned to the mesh

STACK:
- Three.js r128 via CDN
- Vanilla JS, no build tools
- Served with npx serve .
- Deployed to GitHub Pages

PROBLEMS EXIST AT THE MOMENT:
- the esc exit the work scene window not disappearing after closing
- some of the p5js work are window size locked so they do not fit the monitor screen

FURTHER:
- add more props
- credits command