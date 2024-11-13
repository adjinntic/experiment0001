const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Mouse object
const mouse = {
  x: null,
  y: null,
  radius: 150
};

// Event listener for mouse movement
window.addEventListener('mousemove', function(event) {
  mouse.x = event.x;
  mouse.y = event.y;
});

window.addEventListener('resize', function() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initGrid();
});

// Grid settings
const gridSpacing = 30; // Distance between grid points
let gridPoints = [];

// Initialize grid of points with random colors
function initGrid() {
  gridPoints = [];
  
  const rows = Math.ceil(canvas.height / gridSpacing);
  const cols = Math.ceil(canvas.width / gridSpacing);

  for (let y = 0; y <= rows; y++) {
      for (let x = 0; x <= cols; x++) {
          const posX = x * gridSpacing;
          const posY = y * gridSpacing;

          // Create each point with its initial position (rest state)
          // Initialize each point with a random hue for colorful effect
          const hue = Math.random() * 360; // Random hue between 0 and 360

          gridPoints.push({
              x: posX,
              y: posY,
              homeX: posX,
              homeY: posY,
              velocityZ: 0,
              zOffset: -100, // Initial Z offset behind canvas
              maxZOffset: 100, // Maximum Z offset towards camera
              hue: hue, // Store initial hue value for color transitions
              saturation: 80, // Fixed saturation value for vibrant colors
              lightness: 50, // Initial lightness value (will change based on zOffset)
              size: 3 // Initial size of the point
          });
      }
  }
}

// Update each point's position and color based on mouse influence
function updateGrid() {
  for (let point of gridPoints) {
      const dxMouse = mouse.x - point.x;
      const dyMouse = mouse.y - point.y;

      // Calculate distance from point to mouse
      const distanceToMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

      // If within influence radius, apply displacement along Z axis
      if (distanceToMouse < mouse.radius) {
          const forceFactor = (mouse.radius - distanceToMouse) / mouse.radius;

          // Move point along Z axis towards camera
          point.velocityZ += forceFactor * (point.maxZOffset - point.zOffset) * 0.05;

          // Change lightness based on how far it's stretched along Z axis
          const displacementRatio = Math.min(1, Math.abs(point.zOffset) / point.maxZOffset);
          point.lightness = Math.round(50 + displacementRatio * 30); // Increase lightness as it moves towards the camera

      } 
      
      // Gradually return to rest state if outside influence radius
      else {
          // Apply spring-like force back towards rest Z position (-100)
          point.velocityZ += (-100 - point.zOffset) * 0.02;

          // Gradually reset lightness back to its initial value as it returns home
          if (Math.abs(point.zOffset + 100) < 1) {
              point.lightness = 50; 
          }
      }

      // Apply velocity and damping effect (to slow down over time)
      point.zOffset += point.velocityZ;

      // Damping factor to reduce velocity over time
      point.velocityZ *= 0.1; 
      
      // Oscillate around rest position when returning from large displacements
      if (Math.abs(point.zOffset + 100) < 5 && Math.abs(point.velocityZ) > 0.5) {
        point.velocityZ *= -0.8; // Reverse velocity slightly for oscillation effect
      }
      
      // Adjust size based on Z offset for a pseudo-3D effect
      const sizeFactor = Math.max(0.05, (point.maxZOffset + point.zOffset) / (point.maxZOffset * 2));
      
      point.size = sizeFactor * 200 
    }
}

// Draw all points on the canvas with HSL colors for smooth gradients
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let point of gridPoints) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
        
        // Set fill style using HSL based on hue and lightness values calculated from z-offset
        ctx.fillStyle = `hsl(${point.hue}, ${point.saturation}%, ${point.lightness}%)`;
        
        ctx.fill();
        ctx.closePath();
    }
}

// Animation loop
function animate() {
    updateGrid();
    drawGrid();
    
    requestAnimationFrame(animate);
}

// Initialize everything and start animation loop
initGrid();
animate();