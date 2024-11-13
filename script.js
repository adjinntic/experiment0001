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

// Initialize grid of points
function initGrid() {
  gridPoints = [];
  
  const rows = Math.ceil(canvas.height / gridSpacing);
  const cols = Math.ceil(canvas.width / gridSpacing);

  for (let y = 0; y <= rows; y++) {
      for (let x = 0; x <= cols; x++) {
          const posX = x * gridSpacing;
          const posY = y * gridSpacing;

          // Create each point with its initial position (rest state)
          gridPoints.push({
              x: posX,
              y: posY,
              homeX: posX,
              homeY: posY,
              velocityX: 0,
              velocityY: 0,
              colorBrightness: 255 // Start as white
          });
      }
  }
}

// Update each point's position based on mouse influence
function updateGrid() {
  for (let point of gridPoints) {
      const dxMouse = mouse.x - point.x;
      const dyMouse = mouse.y - point.y;

      // Calculate distance from point to mouse
      const distanceToMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

      // If within influence radius, apply displacement towards mouse
      if (distanceToMouse < mouse.radius) {
          const forceFactor = (mouse.radius - distanceToMouse) / mouse.radius;

          // Displace point towards mouse with some elasticity
          point.velocityX += forceFactor * dxMouse * 0.05; 
          point.velocityY += forceFactor * dyMouse * 0.05;

          // Change color based on how far it's stretched from its home position
          const displacementRatio = Math.min(1, distanceToMouse / mouse.radius);
          point.colorBrightness = Math.round(255 * (1 - displacementRatio));
      } 
      
      // Gradually return to rest state if outside influence radius
      else {
          const dxHome = point.homeX - point.x;
          const dyHome = point.homeY - point.y;

          // Apply spring-like force back towards home position
          point.velocityX += dxHome * 0.02; 
          point.velocityY += dyHome * 0.02;

          // Gradually reset color back to white as it returns home
          if (Math.abs(dxHome) < 1 && Math.abs(dyHome) < 1) {
              point.colorBrightness = 255; 
          }
      }

      // Apply velocity and damping effect (to slow down over time)
      point.x += point.velocityX;
      point.y += point.velocityY;

      // Damping factor to reduce velocity over time
      point.velocityX *= 0.95; 
      point.velocityY *= 0.95; 
  }
}

// Draw all points on the canvas
function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let point of gridPoints) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
      
      // Set fill style based on brightness value calculated from displacement
      ctx.fillStyle = `rgb(${point.colorBrightness}, ${point.colorBrightness}, ${point.colorBrightness})`;
      
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