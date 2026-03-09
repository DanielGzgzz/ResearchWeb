import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- DATA ---
const infoData = {
    electron: {
      title: 'Leptonic Architecture: The Electron',
      desc: 'Leptons are constructed from a continuous 1D circularly polarized photon track trapped in a stable quantum orbit. The topological twist generates a macroscopic negative monopole and intrinsic spin.',
      math: [
        { label: 'Compton Wavelength Confinement', expr: '4\\pi r = \\lambda_c' },
        { label: 'Structural Radius', expr: 'r = \\frac{\\hbar}{2m_e c} \\approx 1.93 \\times 10^{-13} \\text{ m}' },
        { label: 'Casimir Confinement Pressure', expr: 'F_{vac} = \\frac{\\hbar c}{2r^2} \\equiv \\frac{m_e c^2}{r}' },
      ],
      features: ['4π (720°) twisted Möbius double-loop', 'Continuous Green (+E), Red (-E), Purple (+B), Yellow (-B) mappings', 'Explains Dirac g=2 anomaly geometrically'],
    },
    proton: {
      title: 'Hadronic Architecture: The Proton',
      desc: 'Nucleons require a 3D architecture to distribute angular momentum without unspooling massive inertia. The geometric mechanical replacement for the strong force is 178,700 N of inward vacuum pressure.',
      math: [
        { label: 'Resting Radius', expr: 'R_p = \\frac{4\\hbar}{m_p c} \\approx 0.8412 \\text{ fm}' },
        { label: 'Inward Vacuum Pressure', expr: 'F_{vac} = \\frac{4\\hbar c}{R_p^2}' },
      ],
      features: ['(3,2)-Torus knot (Trefoil knot)', 'Three continuous spatial lobes (Quark replacement)', 'Integrates to +1e via two outward twists (+2/3e) and one inward (-1/3e)'],
    },
    hydrogen: {
      title: 'Hydrogen Atom',
      desc: 'An electron held in geometric orbit around a single central proton through interlocking Casimir shadow fields.',
      math: [
        { label: 'Gravitational Shadowing', expr: 'G = \\frac{P_{vac}\\sigma^{2}}{4\\pi m_{p}^{2}}' },
      ],
      features: ['Central dense Trefoil knot', 'Orbital expansive Möbius loop', 'Stable atomic equilibrium'],
    }
};

// --- SHADERS ---
const particleVertexShader = `
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
void main() {
  vUv = uv;
  vPosition = position;
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const particleFragmentShader = `
uniform float uTime;
uniform vec3 colorEPlus;   // Green
uniform vec3 colorEMinus;  // Red
uniform vec3 colorBPlus;   // Purple
uniform vec3 colorBMinus;  // Yellow
uniform float uTwistFactor;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
  float theta = vUv.y * 2.0 * 3.14159;
  float phase1 = sin(theta + vUv.x * uTwistFactor * 3.14159 * 2.0); // E field axis
  float phase2 = cos(theta + vUv.x * uTwistFactor * 3.14159 * 2.0); // B field axis

  vec3 eColor = mix(colorEMinus, colorEPlus, (phase1 + 1.0) / 2.0);
  vec3 bColor = mix(colorBMinus, colorBPlus, (phase2 + 1.0) / 2.0);

  float weightE = abs(phase1);
  float weightB = abs(phase2);
  float totalWeight = weightE + weightB;
  weightE /= totalWeight;
  weightB /= totalWeight;

  vec3 baseColor = eColor * weightE + bColor * weightB;

  vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
  float diff = max(dot(vNormal, lightDir), 0.0);
  float ambient = 0.3;
  float glow = max(0.0, 1.0 - dot(vNormal, normalize(vec3(0, 0, 1)))) * 0.4;

  vec3 finalColor = baseColor * (diff * 0.7 + ambient) + baseColor * glow;
  gl_FragColor = vec4(finalColor, 1.0);
}`;

// --- CURVES ---
class MobiusCurve extends THREE.Curve {
    constructor(radius, tubeRadius) {
        super();
        this.radius = radius;
        this.tubeRadius = tubeRadius;
    }
    getPoint(t, optionalTarget = new THREE.Vector3()) {
        const u = t * Math.PI * 2;
        const x = Math.cos(u) * this.radius;
        const y = Math.sin(u) * this.radius;
        const z = Math.sin(u * 2) * this.tubeRadius * 1.5;
        return optionalTarget.set(x, y, z);
    }
}

class TrefoilCurve extends THREE.Curve {
    constructor(radius, tubeRadius) {
        super();
        this.radius = radius;
        this.tubeRadius = tubeRadius;
    }
    getPoint(t, optionalTarget = new THREE.Vector3()) {
        const u = t * Math.PI * 2;
        const x = Math.sin(u) + 2 * Math.sin(2 * u);
        const y = Math.cos(u) - 2 * Math.cos(2 * u);
        const z = -Math.sin(3 * u);
        return optionalTarget.set(x * this.radius * 0.4, y * this.radius * 0.4, z * this.radius * 0.4);
    }
}

// --- SETUP SCENE ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050510);

const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100);
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

// Stars
const starsGeometry = new THREE.BufferGeometry();
const starsCount = 2000;
const posArray = new Float32Array(starsCount * 3);
for(let i = 0; i < starsCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 100;
}
starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const starsMaterial = new THREE.PointsMaterial({ size: 0.1, color: 0xffffff, transparent: true, opacity: 0.5 });
const starsMesh = new THREE.Points(starsGeometry, starsMaterial);
scene.add(starsMesh);

// --- PARTICLE FACTORIES ---
let currentMeshes = [];
let time = 0;

function createGeonMaterial(twistFactor) {
    return new THREE.ShaderMaterial({
        vertexShader: particleVertexShader,
        fragmentShader: particleFragmentShader,
        uniforms: {
            uTime: { value: 0 },
            colorEPlus: { value: new THREE.Color('#00ff00') },
            colorEMinus: { value: new THREE.Color('#ff0000') },
            colorBPlus: { value: new THREE.Color('#800080') },
            colorBMinus: { value: new THREE.Color('#ffff00') },
            uTwistFactor: { value: twistFactor },
        },
        side: THREE.DoubleSide,
    });
}

function renderElectron(radius=2, tubeRadius=0.3, pos=[0,0,0]) {
    const curve = new MobiusCurve(radius, tubeRadius);
    const geometry = new THREE.TubeGeometry(curve, 200, tubeRadius, 16, true);
    const material = createGeonMaterial(2.0);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...pos);
    mesh.userData = { type: 'electron', rotationSpeed: { x: 0.2, y: 0.5, z: 0 } };
    scene.add(mesh);
    currentMeshes.push(mesh);
}

function renderProton(radius=2, tubeRadius=0.4, pos=[0,0,0]) {
    const curve = new TrefoilCurve(radius, tubeRadius);
    const geometry = new THREE.TubeGeometry(curve, 300, tubeRadius, 24, true);
    const material = createGeonMaterial(3.0);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...pos);
    mesh.userData = { type: 'proton', rotationSpeed: { x: 0, y: 0.3, z: 0.1 } };
    scene.add(mesh);
    currentMeshes.push(mesh);
}

function clearScene() {
    currentMeshes.forEach(mesh => {
        scene.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
    });
    currentMeshes = [];
}


// --- UI & INTERACTIVITY ---
const buttons = document.querySelectorAll('.phenomenon-btn');
const docContainer = document.getElementById('documentation');

function renderMathElements() {
    // Requires KaTeX to be loaded globally via script tags in HTML
    if (window.katex) {
        document.querySelectorAll('.math-expr').forEach(el => {
            katex.render(el.textContent, el, {
                throwOnError: false,
                displayMode: true
            });
        });
    }
}

function updateUI(type) {
    // Update active button classes
    buttons.forEach(btn => {
        if (btn.dataset.target === type) {
            btn.className = 'phenomenon-btn px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-left bg-blue-600 text-white shadow-lg shadow-blue-900/50';
        } else {
            btn.className = 'phenomenon-btn px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-left bg-slate-800 hover:bg-slate-700 text-slate-300';
        }
    });

    // Update Documentation text
    const data = infoData[type];

    let html = `
        <div>
            <h2 class="text-xl font-bold text-white mb-2">${data.title}</h2>
            <p class="text-slate-300 text-sm leading-relaxed">${data.desc}</p>
        </div>
        <div>
            <h3 class="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wide">Key Topologies</h3>
            <ul class="list-disc list-inside text-sm text-slate-300 space-y-1">
                ${data.features.map(f => `<li>${f}</li>`).join('')}
            </ul>
        </div>
        <div class="mt-2 space-y-3">
            <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide">Geon Kinematics</h3>
            ${data.math.map(m => `
                <div class="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span class="text-xs text-slate-500 block mb-1">${m.label}</span>
                    <div class="text-blue-300 overflow-x-auto overflow-y-hidden pb-1 math-expr">${m.expr}</div>
                </div>
            `).join('')}
        </div>
    `;

    docContainer.innerHTML = html;

    // Slight delay to ensure DOM is updated before parsing Math
    setTimeout(renderMathElements, 50);
}

// Global switch function
window.switchPhenomenon = (type) => {
    clearScene();
    if (type === 'electron') {
        renderElectron();
    } else if (type === 'proton') {
        renderProton();
    } else if (type === 'hydrogen') {
        renderProton(1.5, 0.3);
        renderElectron(4, 0.15, [0, 0, 0]);
    }
    updateUI(type); // Ensure UI syncs
};

// Event Listeners
buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const type = e.target.dataset.target;
        window.switchPhenomenon(type);
    });
});

// INITIALIZATION
window.switchPhenomenon('electron');

// Animation Loop
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta();
    time += dt;

    currentMeshes.forEach(mesh => {
        mesh.rotation.x += mesh.userData.rotationSpeed.x * dt;
        mesh.rotation.y += mesh.userData.rotationSpeed.y * dt;
        mesh.rotation.z += mesh.userData.rotationSpeed.z * dt;
        if(mesh.material.uniforms) {
            mesh.material.uniforms.uTime.value = time;
        }
    });

    controls.update();
    renderer.render(scene, camera);
}
animate();

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});
