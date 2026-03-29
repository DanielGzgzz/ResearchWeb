import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- SCENE SETUP ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
// Add alpha blending capabilities
renderer.setClearColor(0x000000, 1);
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Visual helper axes (subtle)
const axesHelper = new THREE.AxesHelper( 2 );
axesHelper.material.opacity = 0.2;
axesHelper.material.transparent = true;
scene.add( axesHelper );

// --- PHYSICS STATE ---
// The particle state object
let state = {
    active: false,
    n: 2,
    l: 1,
    m: 0,

    // Euler Integration State
    r: 0,
    theta: 0,
    phi: 0,
    vr: 0,
    vtheta: 0,
    vphi: 0,

    // Constants
    a0: 1.0,
    K_vac: 1.0,
    E_n: 0,

    // Visual trace
    maxPoints: 100000,
    pointCount: 0,
    positions: null,
    geometry: null,
    pointsMesh: null
};

const dt = 0.05; // Time step per integration frame

// Color palette mapping based on quantum numbers (n, l)
const orbitalColors = {
    '1_0': 0xff3333, // 1s - Red
    '2_0': 0x33ff33, // 2s - Green
    '2_1': 0x3366ff, // 2p - Blue
    '3_0': 0xffff33, // 3s - Yellow
    '3_1': 0xff33ff, // 3p - Magenta
    '3_2': 0x33ffff, // 3d - Cyan
    '4_0': 0xff9933, // 4s - Orange
    'default': 0xffffff // White
};

function getOrbitalColor(n, l) {
    const key = `${n}_${l}`;
    return orbitalColors[key] || orbitalColors['default'];
}

// --- INITIALIZE SIMULATION ---
function initSimulation() {
    state.n = parseInt(document.getElementById('sel-n').value);
    state.l = parseInt(document.getElementById('sel-l').value);
    state.m = parseInt(document.getElementById('sel-m').value);

    // Physics Init
    state.r0 = Math.pow(state.n, 2) * state.a0;
    state.E_n = state.K_vac / state.r0;

    // Initial drop point
    state.r = state.r0 * 0.9;
    state.theta = state.l > 0 ? Math.PI / 4.0 : Math.PI / 2.0;
    state.phi = 0.0;

    state.vr = 0.0;
    state.vtheta = 0.1;
    state.vphi = 0.1;

    // Rendering Init (Points Cloud)
    if (state.pointsMesh) {
        scene.remove(state.pointsMesh);
        state.geometry.dispose();
        state.pointsMesh.material.dispose();
    }

    state.positions = new Float32Array(state.maxPoints * 3);
    state.geometry = new THREE.BufferGeometry();
    state.geometry.setAttribute('position', new THREE.BufferAttribute(state.positions, 3));
    state.geometry.setDrawRange(0, 0); // Don't draw anything yet
    state.pointCount = 0;

    // Use additive blending and semi-transparency for true density visual
    const material = new THREE.PointsMaterial({
        color: getOrbitalColor(state.n, state.l),
        size: 0.08,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    state.pointsMesh = new THREE.Points(state.geometry, material);
    scene.add(state.pointsMesh);

    // Auto-adjust camera based on scale (n)
    const zoom = Math.max(5, state.n * 3);
    camera.position.set(zoom, zoom * 0.5, zoom);

    state.active = true;
}

function clearCanvas() {
    state.active = false;
    if (state.pointsMesh) {
        scene.remove(state.pointsMesh);
        state.geometry.dispose();
        state.pointsMesh.material.dispose();
        state.pointsMesh = null;
    }
}

// --- DETERMINISTIC EULER INTEGRATION LOOP ---
function updatePhysics(steps) {
    if (!state.active) return;

    const posAttribute = state.geometry.attributes.position;

    for (let i = 0; i < steps; i++) {
        if (state.pointCount >= state.maxPoints) {
            state.active = false;
            break; // Stop simulating when buffer is full
        }

        // A. Calculate Geon Fluid-Dynamic Forces
        // Radial centrifugal outward vs vacuum Casimir crush inward
        const F_r = (state.E_n / state.r) - (state.K_vac / Math.pow(state.r, 2));

        // Angular restoring forces carving the nodal planes (Transverse pressure)
        const F_theta = -0.1 * state.l * Math.cos(state.theta) * Math.sin(state.theta);
        const F_phi = 0.05 * state.m;

        // B. Euler Integration (Velocities)
        state.vr += F_r * dt;
        state.vtheta += F_theta * dt;
        state.vphi += F_phi * dt;

        // Vacuum kinematic damping to prevent runaway
        state.vr *= 0.999;
        state.vtheta *= 0.999;
        // phi usually not damped to maintain angular momentum orbit

        // C. Update Positions
        state.r += state.vr * dt;
        state.theta += state.vtheta * dt;
        state.phi += state.vphi * dt;

        // D. Convert to Cartesian Coordinates
        const x = state.r * Math.sin(state.theta) * Math.cos(state.phi);
        const y = state.r * Math.sin(state.theta) * Math.sin(state.phi);
        const z = state.r * Math.cos(state.theta);

        // E. Store in Three.js Buffer
        const idx = state.pointCount * 3;
        posAttribute.array[idx] = x;
        posAttribute.array[idx + 1] = y;
        posAttribute.array[idx + 2] = z;

        state.pointCount++;
    }

    // Inform WebGL to update the buffer and draw the new points
    posAttribute.needsUpdate = true;
    state.geometry.setDrawRange(0, state.pointCount);
}

// --- RENDER LOOP ---
function animate() {
    requestAnimationFrame(animate);

    if (state.active) {
        const speed = parseInt(document.getElementById('sim-speed').value);
        updatePhysics(speed);
    }

    controls.update();
    renderer.render(scene, camera);
}

// --- UI EVENT LISTENERS ---
document.getElementById('btn-restart').addEventListener('click', initSimulation);
document.getElementById('btn-clear').addEventListener('click', clearCanvas);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start loop
animate();
