// Interactive rotation control
let isDragging = false;
let currentX = 0;
let currentY = 0;
let rotationX = 60;
let rotationZ = -45;

const city = document.querySelector('.city');
const scene = document.querySelector('.scene');

// Mouse down event
scene.addEventListener('mousedown', (e) => {
    isDragging = true;
    currentX = e.clientX;
    currentY = e.clientY;
    city.style.animation = 'none'; // Stop auto-rotation when user interacts
});

// Mouse move event
document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - currentX;
    const deltaY = e.clientY - currentY;
    
    rotationX -= deltaY * 0.5;
    rotationZ -= deltaX * 0.5;
    
    // Limit rotation on X axis
    rotationX = Math.max(-90, Math.min(90, rotationX));
    
    city.style.transform = `rotateX(${rotationX}deg) rotateZ(${rotationZ}deg)`;
    
    currentX = e.clientX;
    currentY = e.clientY;
});

// Mouse up event
document.addEventListener('mouseup', () => {
    isDragging = false;
});

// Touch events for mobile
scene.addEventListener('touchstart', (e) => {
    isDragging = true;
    currentX = e.touches[0].clientX;
    currentY = e.touches[0].clientY;
    city.style.animation = 'none';
});

document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    
    const deltaX = e.touches[0].clientX - currentX;
    const deltaY = e.touches[0].clientY - currentY;
    
    rotationX -= deltaY * 0.5;
    rotationZ -= deltaX * 0.5;
    
    rotationX = Math.max(-90, Math.min(90, rotationX));
    
    city.style.transform = `rotateX(${rotationX}deg) rotateZ(${rotationZ}deg)`;
    
    currentX = e.touches[0].clientX;
    currentY = e.touches[0].clientY;
});

document.addEventListener('touchend', () => {
    isDragging = false;
});

// Add random light effects to building windows
function addWindowLights() {
    const buildings = document.querySelectorAll('.building');
    buildings.forEach((building) => {
        const faces = building.querySelectorAll('.face:not(.top)');
        faces.forEach((face) => {
            const windowsContainer = document.createElement('div');
            windowsContainer.className = 'windows';
            
            // Create random lit windows
            for (let i = 0; i < 8; i++) {
                if (Math.random() > 0.5) {
                    const light = document.createElement('div');
                    light.className = 'window-light';
                    light.style.position = 'absolute';
                    light.style.width = '8px';
                    light.style.height = '8px';
                    light.style.background = '#ffeb3b';
                    light.style.boxShadow = '0 0 10px #ffeb3b';
                    light.style.left = `${15 + (i % 4) * 20}px`;
                    light.style.top = `${20 + Math.floor(i / 4) * 30}px`;
                    light.style.opacity = Math.random() * 0.5 + 0.5;
                    windowsContainer.appendChild(light);
                }
            }
            face.appendChild(windowsContainer);
        });
    });
}

// Initialize window lights
addWindowLights();

// Animate window lights (blink randomly)
setInterval(() => {
    const lights = document.querySelectorAll('.window-light');
    lights.forEach((light) => {
        if (Math.random() > 0.95) {
            light.style.opacity = light.style.opacity === '0' ? '1' : '0';
        }
    });
}, 1000);

console.log('Mini 3D City loaded successfully!');
