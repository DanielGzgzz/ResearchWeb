const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

// Replace the flat background color with nothing (transparent) so the CSS radial gradient shows through
// In app.js
code = code.replace(/scene\.background = new THREE\.Color\(0x020205\);/, '// scene.background = new THREE.Color(0x020205); // Let CSS handle the background gradient');
code = code.replace(/const renderer = new THREE\.WebGLRenderer\(\{ antialias: true, logarithmicDepthBuffer: true \}\);/, 'const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true, alpha: true });');

fs.writeFileSync('app.js', code);

// Now update style.css
let css = fs.readFileSync('style.css', 'utf8');
css += `
#canvas-container canvas {
    background: radial-gradient(circle at center, #111820 0%, #0A0F14 100%);
}
`;
fs.writeFileSync('style.css', css);
