import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- STATE: ENGINE CONTROLS ---
const SIM_STATE = {
    speed: 1.0,
    paused: false,
    wireframe: false,
    vectors: true,
    trails: false,
    lightMode: false,
    lightPolarization: 0,
    lightWavelength: 1.0,
};

// --- DATA: SIMULATION PRESETS ---
const tourSteps = [
    {
        id: 'vacuum',
        title: '1. The Casimir Vacuum Fluid',
        desc: 'The baseline simulation environment is a hyper-elastic, zero-point tensor fluid. Electromagnetic waves displace this vacuum.',
        math: [
            { label: 'Kinematic Action Viscosity', expr: 'h = 6.62607 \\times 10^{-34} \\text{ kg}\\cdot\\text{m}^2/\\text{s}' },
            { label: 'Gravitation (Casimir Pressure Gradient)', expr: 'G = \\frac{P_{vac}\\sigma^{2}}{4\\pi m_{p}^{2}}' }
        ],
        features: ['Zero-point tensor fluid', 'Geons displace vacuum', 'Geometric shadowing causes gravity'],
        cameraPos: { x: 0, y: 0, z: 20 },
    },
    {
        id: 'electron',
        title: '2. Leptonic Architecture: The Electron',
        desc: 'Leptons are constructed from a continuous 1D circularly polarized photon track trapped in a stable quantum orbit. The 4π topological twist generates a macroscopic negative monopole and intrinsic spin-1/2.',
        math: [
            { label: 'Compton Wavelength Confinement', expr: '4\\pi r = \\lambda_c' },
            { label: 'Structural Radius', expr: 'r = \\frac{\\hbar}{2m_e c} \\approx 1.93 \\times 10^{-13} \\text{ m}' },
            { label: 'Casimir Confinement Pressure', expr: 'F_{vac} = \\frac{\\hbar c}{2r^2} \\equiv \\frac{m_e c^2}{r}' },
        ],
        features: ['4π (720°) twisted Möbius double-loop', 'Continuous Green (+E), Red (-E), Purple (+B), Yellow (-B) mappings', 'Explains Dirac g=2 anomaly geometrically'],
        cameraPos: { x: 0, y: 0, z: 10 },
    },
    {
        id: 'proton',
        title: '3. Hadronic Architecture: The Proton',
        desc: 'Nucleons require a 3D architecture to distribute angular momentum without unspooling massive inertia. The geometric mechanical replacement for the strong force is 178,700 N of inward vacuum pressure compressing the Trefoil.',
        math: [
            { label: 'Resting Radius', expr: 'R_p = \\frac{4\\hbar}{m_p c} \\approx 0.8412 \\text{ fm}' },
            { label: 'Inward Vacuum Pressure', expr: 'F_{vac} = \\frac{4\\hbar c}{R_p^2}' },
        ],
        features: ['(3,2)-Torus knot (Trefoil knot)', 'Three continuous spatial lobes (Quark replacement)', 'Integrates to +1e via two outward twists (+2/3e) and one inward (-1/3e)'],
        cameraPos: { x: 0, y: 0, z: 12 },
    },
    {
        id: 'hydrogen',
        title: '4. The Hydrogen Atom (Protium)',
        desc: 'A single proton (Trefoil knot) anchoring an electron (Möbius loop) in a geometric orbit via interlocking Casimir shadow fields. The electron structure does not scale; it remains a point-like topology orbiting the macroscopic well.',
        math: [
            { label: 'Gravitational Shadowing', expr: 'G = \\frac{P_{vac}\\sigma^{2}}{4\\pi m_{p}^{2}}' },
        ],
        features: ['Central dense Trefoil knot (Proton)', '1 constant-scale orbiting Möbius loop (Electron)', 'Stable atomic equilibrium'],
        cameraPos: { x: 0, y: 0, z: 15 },
    },
    {
        id: 'deuterium',
        title: '5. Deuterium Atom (Heavy Hydrogen)',
        desc: 'A proton and a neutron bound closely together via Strong Force geometric hard-stop repulsion, sharing a single orbiting electron. The neutron is structurally identical but phase-shifted to produce a neutral macro-charge.',
        math: [
            { label: 'Nuclear Boundary Repulsion', expr: 'k \\approx 212,600 \\text{ N/fm}' },
        ],
        features: ['1 Proton / 1 Neutron dual-core', '1 orbiting Electron', 'Stable isotope'],
        cameraPos: { x: 0, y: 0, z: 16 },
    },
    {
        id: 'water',
        title: '6. Water Molecule (H₂O) & Polarization',
        desc: 'Two hydrogen atoms geometrically bonded to a central Oxygen nucleus. The bond angle of 104.5° is formed by intersecting Casimir shadow gradients. Here, we observe the complex interaction of 10 electrons orbiting the tri-core structure.',
        math: [
            { label: 'Refractive Delay', expr: 'n = \\frac{c}{v_m} = 1 + (N_v \\cdot c \\cdot \\sigma \\cdot \\Delta t)' }
        ],
        features: ['Oxygen-16 core (8p, 8n) bounded by 2 Protons', '10 dynamically orbiting Electrons sharing shells', 'Demonstrates geometric constraints of complex molecules'],
        cameraPos: { x: 0, y: 0, z: 35 },
    },
    {
        id: 'gold',
        title: '7. The Gold Atom (Au) & Probability Clouds',
        desc: 'A massive composite of 79 Protons and 118 Neutrons forming a deeply shadowed Casimir well. To observe Schrödinger probability density, enable "Schrödinger Clouds" below to trace the electrons.',
        math: [
            { label: 'Relativistic Absorption Shift', expr: '\\gamma = \\frac{1}{\\sqrt{1 - (v/c)^2}}' }
        ],
        features: ['79 Protons / 118 Neutrons tightly packed core', '79 individually orbiting constant-scale electrons', 'High v = 0.58c velocities in inner shells'],
        cameraPos: { x: 0, y: 0, z: 60 },
    },
    {
        id: 'annihilation',
        title: '8. Positron-Electron Annihilation',
        desc: 'An electron meets its geometric inverse. Their mirrored chiralities cause absolute destructive interference upon collision, shattering the vacuum lock and unspooling into gamma radiation.',
        math: [
            { label: 'Annihilation Threshold', expr: 'E_{crit} = 1.02199 \\text{ MeV}' },
        ],
        features: ['Electron (Twist +2)', 'Positron (Twist -2)', 'Unspools into pure linear photons upon impact'],
        cameraPos: { x: 0, y: 0, z: 25 },
    },
    {
        id: 'gravity',
        title: '9. Casimir Gravity & Tidal Locking',
        desc: 'Gravity is not curved space; it is the Casimir pressure gradient formed by geometric shadowing. When two macroscopic bodies overlap shadows, the vacuum pushes them together. Close proximity induces tidal locking (face-to-face alignment) of their internal topologies.',
        math: [
            { label: 'Gravitational Force', expr: 'F_g = \\frac{G m_1 m_2}{r^2}' }
        ],
        features: ['Massive Body 1 (Earth analog)', 'Massive Body 2 (Moon analog)', 'Tidally locked orbiting topologies'],
        cameraPos: { x: 0, y: 0, z: 80 },
    },
    {
        id: 'custom',
        title: '10. Custom Atomic Builder',
        desc: 'Input Z (Protons), Neutrons, and Electrons below to simulate an arbitrary atomic superposition. The engine will geometrically pack the nucleus and generate approximate valence shells.',
        math: [
            { label: 'Nuclear Core Packing Volume', expr: 'V = \\frac{4}{3}\\pi (R_p \\sqrt[3]{A})^3' }
        ],
        features: ['Interactive Core Builder', 'Dynamic Electron Shell Generator', 'Real-time Superposition Engine'],
        cameraPos: { x: 0, y: 0, z: 40 },
    }
];

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
scene.background = new THREE.Color(0x020205);

const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 10000);
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
const starsCount = 3000;
const posArray = new Float32Array(starsCount * 3);
for(let i = 0; i < starsCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 2000;
}
starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const starsMaterial = new THREE.PointsMaterial({ size: 0.5, color: 0xffffff, transparent: true, opacity: 0.5 });
const starsMesh = new THREE.Points(starsGeometry, starsMaterial);
scene.add(starsMesh);

// --- PARTICLE FACTORIES & VECTORS ---
let currentMeshes = [];
let currentOrbiters = []; // Track electrons that orbit the nucleus
let time = 0;
let annihilated = false;

function createGeonMaterial(twistFactor, isNeutral=false) {
    const ePlus = isNeutral ? '#557755' : '#00ff00';
    const eMinus = isNeutral ? '#775555' : '#ff0000';
    const bPlus = isNeutral ? '#555577' : '#800080';
    const bMinus = isNeutral ? '#777755' : '#ffff00';

    return new THREE.ShaderMaterial({
        vertexShader: particleVertexShader,
        fragmentShader: particleFragmentShader,
        uniforms: {
            uTime: { value: 0 },
            colorEPlus: { value: new THREE.Color(ePlus) },
            colorEMinus: { value: new THREE.Color(eMinus) },
            colorBPlus: { value: new THREE.Color(bPlus) },
            colorBMinus: { value: new THREE.Color(bMinus) },
            uTwistFactor: { value: twistFactor },
        },
        side: THREE.DoubleSide,
        wireframe: SIM_STATE.wireframe,
        transparent: true,
        opacity: SIM_STATE.lightMode ? 0.3 : 1.0 // Dim topology if focusing on light prop
    });
}

function updateMaterialsWireframe() {
    scene.traverse((child) => {
        if (child.isMesh && child.material instanceof THREE.ShaderMaterial) {
            child.material.wireframe = SIM_STATE.wireframe;
        }
    });
}

function createWaveMaterial() {
    return new THREE.LineBasicMaterial({
        color: 0x00ffff,
        linewidth: 2,
        transparent: true,
        opacity: 0.8
    });
}

// Vector helper to draw E, B, and S vectors along the curve
function addFieldVectors(mesh, curveType, params) {
    if(!SIM_STATE.vectors) return;

    // Choose a point along the curve to visualize fields
    let t = 0;
    const updateVectorGroup = new THREE.Group();

    const eArrow = new THREE.ArrowHelper(new THREE.Vector3(1,0,0), new THREE.Vector3(0,0,0), 1.5, 0x00ff00, 0.4, 0.2);
    const bArrow = new THREE.ArrowHelper(new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,0), 1.5, 0x800080, 0.4, 0.2);
    const sArrow = new THREE.ArrowHelper(new THREE.Vector3(0,0,1), new THREE.Vector3(0,0,0), 2.5, 0x3b82f6, 0.5, 0.3); // Poynting Blue

    updateVectorGroup.add(eArrow);
    updateVectorGroup.add(bArrow);
    updateVectorGroup.add(sArrow);
    mesh.add(updateVectorGroup);

    mesh.userData.vectors = {
        group: updateVectorGroup, e: eArrow, b: bArrow, s: sArrow,
        curveType: curveType, params: params, t: 0
    };
}

function renderElectron(radius=2, tubeRadius=0.3, pos=[0,0,0], isPositron=false) {
    const curve = new MobiusCurve(radius, tubeRadius);
    const geometry = new THREE.TubeGeometry(curve, 200, tubeRadius, 16, true);
    const material = createGeonMaterial(isPositron ? -2.0 : 2.0);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...pos);
    mesh.userData = {
        type: isPositron ? 'positron' : 'electron',
        rotationSpeed: { x: 0.2, y: 0.5, z: 0 },
        baseRadius: radius
    };

    addFieldVectors(mesh, 'mobius', { radius, tubeRadius });
    scene.add(mesh);
    currentMeshes.push(mesh);
    return mesh;
}

function renderLinearPhoton(length=10, amplitude=1, pos=[0,0,0]) {
    const points = [];
    // Only polarization (no circular twist)
    const polRad = SIM_STATE.lightPolarization * Math.PI / 180;

    for(let i=0; i<100; i++) {
        let t = i/100 * length;
        let wave = Math.sin(t * (1.0 / SIM_STATE.lightWavelength)) * amplitude;

        let py = Math.cos(polRad) * wave;
        let pz = Math.sin(polRad) * wave;

        points.push(new THREE.Vector3(t+pos[0], py+pos[1], pz+pos[2]));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3 });
    const line = new THREE.Line(geometry, material);
    line.userData = { type: 'linear_photon', length, amplitude, timeOffset: 0, origin: pos };
    scene.add(line);
    currentMeshes.push(line);
    return line;
}

function renderProton(radius=2, tubeRadius=0.4, pos=[0,0,0], isNeutral=false) {
    const curve = new TrefoilCurve(radius, tubeRadius);
    const geometry = new THREE.TubeGeometry(curve, 250, tubeRadius, 20, true);
    const material = createGeonMaterial(3.0, isNeutral);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...pos);
    mesh.userData = { type: isNeutral ? 'neutron' : 'proton', rotationSpeed: { x: 0.05, y: 0.2, z: 0.05 } };

    addFieldVectors(mesh, 'trefoil', { radius, tubeRadius });
    scene.add(mesh);
    currentMeshes.push(mesh);
    return mesh;
}

// Function to generate an electron that physically orbits a central point
function addOrbitingElectron(centerPoint, orbitRadius, orbitSpeed, orbitPlaneRotation) {
    // Keep electron scale constant (same as standard electron model)
    const eRadius = 0.5;
    const eTube = 0.1;

    const electron = renderElectron(eRadius, eTube, [0,0,0]);
    // Remove from main static list so it doesn't get standard static rotation mixed up
    currentMeshes.splice(currentMeshes.indexOf(electron), 1);


    // Create Trail for Schrodinger Probability Cloud
    const trailGeom = new THREE.BufferGeometry();
    const trailPositions = new Float32Array(50 * 3); // 50 tail segments
    trailGeom.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    const trailMat = new THREE.LineBasicMaterial({ color: 0x4444ff, transparent: true, opacity: 0.4 });
    const trail = new THREE.Line(trailGeom, trailMat);
    trail.visible = SIM_STATE.trails;
    scene.add(trail);

    // Setup orbital properties
    const orbitObj = {
        mesh: electron,
        center: centerPoint,
        radius: orbitRadius,
        speed: orbitSpeed,
        angle: Math.random() * Math.PI * 2,
        planeRotX: orbitPlaneRotation[0],
        planeRotY: orbitPlaneRotation[1],
        planeRotZ: orbitPlaneRotation[2],
        trail: trail,
        trailPositions: [],
        trailMax: 50
    };
    currentOrbiters.push(orbitObj);
}

// Helper to construct densely packed atomic nuclei
function packNucleus(numProtons, numNeutrons, baseScale=0.5) {
    const nucleusGroup = new THREE.Group();
    const totalNucleons = numProtons + numNeutrons;

    let pCount = 0;
    let nCount = 0;

    // Fibonaci sphere packing approximation for the core
    const phi = Math.PI * (3 - Math.sqrt(5));  // golden angle

    for(let i=0; i<totalNucleons; i++) {
        let x = 0, y = 0, z = 0;
        let packRadius = 0;

        if (totalNucleons > 1) {
            y = 1 - (i / (totalNucleons - 1)) * 2;  // y goes from 1 to -1
            const radius = Math.sqrt(1 - y * y);  // radius at y
            const theta = phi * i;  // golden angle increment

            x = Math.cos(theta) * radius;
            z = Math.sin(theta) * radius;

            // Scale distance based on total nucleons to pack them tightly
            packRadius = Math.cbrt(totalNucleons) * baseScale * 1.5;
        }

        const isNeutron = (nCount < numNeutrons && (pCount >= numProtons || i % 2 === 0));

        if (isNeutron) nCount++; else pCount++;

        const pRadius = baseScale;
        const pTube = baseScale * 0.2;
        const nucleon = renderProton(pRadius, pTube, [x*packRadius, y*packRadius, z*packRadius], isNeutron);

        // Remove from global scene & array and attach to group
        scene.remove(nucleon);
        currentMeshes.splice(currentMeshes.indexOf(nucleon), 1);
        nucleusGroup.add(nucleon);
    }

    scene.add(nucleusGroup);
    currentMeshes.push(nucleusGroup);
    return nucleusGroup;
}

function renderPhotonWave(length=10, amplitude=1, pos=[0,0,0], axis='x', reverse=false) {
    const points = [];
    for(let i=0; i<100; i++) {
        let t = i/100 * length;
        if(reverse) t = -t;
        let p = [0,0,0];
        if(axis === 'x') p = [t, Math.sin(t)*amplitude, Math.cos(t)*amplitude];
        else if(axis === 'y') p = [Math.cos(t)*amplitude, t, Math.sin(t)*amplitude];

        points.push(new THREE.Vector3(p[0]+pos[0], p[1]+pos[1], p[2]+pos[2]));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, createWaveMaterial());
    line.userData = { type: 'photon', reverse: reverse, axis: axis, time: 0 };
    scene.add(line);
    currentMeshes.push(line);
}

function clearScene() {
    let allObjects = [...currentMeshes];
    currentOrbiters.forEach(o => {
        allObjects.push(o.mesh);
        if(o.trail) allObjects.push(o.trail);
    });

    allObjects.forEach(obj => {
        scene.remove(obj);
        // Recursively dispose of all deeply nested geometries and materials (like ArrowHelpers)
        obj.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
                else child.material.dispose();
            }
        });
    });
    currentMeshes = [];
    currentOrbiters = [];
}


// --- UI & INTERACTIVITY (ENGINE CONTROLS) ---
const docContainer = document.getElementById('documentation');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const selectDropdown = document.getElementById('tour-select');

// Sim Controls
const inputSpeed = document.getElementById('sim-speed');
const speedVal = document.getElementById('speed-val');
const btnPlayPause = document.getElementById('btn-play-pause');
const btnResetCam = document.getElementById('btn-reset-cam');

const chkWireframe = document.getElementById('toggle-wireframe');
const chkVectors = document.getElementById('toggle-vectors');
const chkTrails = document.getElementById('toggle-trails');
const chkLightMode = document.getElementById('toggle-light-mode');

// Light Propagator Editor
const lightEditorHud = document.getElementById('light-editor-hud');
const valPolarization = document.getElementById('val-polarization');
const inputPolarization = document.getElementById('sim-polarization');
const valWavelength = document.getElementById('val-wavelength');
const inputWavelength = document.getElementById('sim-wavelength');

// Atom Builder
const atomBuilderUI = document.getElementById('atom-builder');
const inputZ = document.getElementById('build-z');
const inputN = document.getElementById('build-n');
const inputE = document.getElementById('build-e');
const btnBuildAtom = document.getElementById('btn-build-atom');

let currentStepIndex = 0;

function renderMathElements() {
    if (window.katex) {
        document.querySelectorAll('.math-expr').forEach(el => {
            katex.render(el.textContent, el, {
                throwOnError: false,
                displayMode: true
            });
        });
    }
}

function updateUI() {
    const data = tourSteps[currentStepIndex];

    // Update Dropdown
    selectDropdown.innerHTML = tourSteps.map((step, idx) =>
        `<option value="${idx}" ${idx === currentStepIndex ? 'selected' : ''}>${step.title}</option>`
    ).join('');

    // Update Buttons
    btnPrev.disabled = currentStepIndex === 0;
    btnNext.disabled = currentStepIndex === tourSteps.length - 1;

    // Update Documentation text
    let html = `
        <div>
            <h2 class="text-sm font-bold text-white mb-2 leading-tight">${data.title}</h2>
            <p class="text-slate-400 text-[11px] leading-relaxed mb-4">${data.desc}</p>
        </div>
        <div class="bg-[#12121a] border border-[#2a2a35] rounded p-3">
            <h3 class="text-[9px] font-bold text-blue-500 mb-2 uppercase tracking-widest border-b border-[#2a2a35] pb-1">Topology Properties</h3>
            <ul class="list-disc list-inside text-[11px] text-slate-300 space-y-1 font-mono">
                ${data.features.map(f => `<li>${f}</li>`).join('')}
            </ul>
        </div>
        <div class="mt-1 space-y-2">
            <h3 class="text-[9px] font-bold text-purple-500 uppercase tracking-widest pl-1 mt-4">Computed Kinematics</h3>
            ${data.math.map(m => `
                <div class="bg-[#050508] p-3 rounded border border-[#1e1e24] shadow-inner">
                    <span class="text-[9px] text-slate-500 block mb-1 font-mono uppercase">${m.label}</span>
                    <div class="text-slate-300 overflow-x-auto overflow-y-hidden pb-1 math-expr">${m.expr}</div>
                </div>
            `).join('')}
        </div>
    `;

    docContainer.innerHTML = html;

    // Ensure KaTeX is fully loaded via the CDN before attempting to render equations
    if (document.readyState === 'complete') {
        renderMathElements();
    } else {
        window.addEventListener('load', renderMathElements);
    }
}

// Global switch function based on step ID
window.switchPhenomenon = (type) => {
    clearScene();
    annihilated = false; // Reset state

    // Atom Builder Visibility
    if (type === 'custom') atomBuilderUI.classList.remove('hidden');
    else atomBuilderUI.classList.add('hidden');

    if (SIM_STATE.lightMode) {
        // OVERRIDE: If Light Mode is on, just show raw light waves
        renderLinearPhoton(30, 4, [-15, 0, 0]);
        return;
    }

    if (type === 'vacuum') {
        // Just the starry background
    } else if (type === 'electron') {
        renderElectron(2, 0.3);
    } else if (type === 'proton') {
        renderProton(2, 0.4);
    } else if (type === 'hydrogen') {
        packNucleus(1, 0, 0.6); // 1p, 0n
        addOrbitingElectron(new THREE.Vector3(0,0,0), 5, 2.0, [0, 0, 0]);
    } else if (type === 'deuterium') {
        packNucleus(1, 1, 0.6); // 1p, 1n
        addOrbitingElectron(new THREE.Vector3(0,0,0), 6, 1.8, [Math.PI/4, 0, 0]);
    } else if (type === 'water') {
        // Central Oxygen 16 (8p, 8n)
        packNucleus(8, 8, 0.4);
        // Hydrogen Bonds (1p each at 104.5 degrees approx)
        const h1 = packNucleus(1, 0, 0.4);
        h1.position.set(5, -3, 0);
        const h2 = packNucleus(1, 0, 0.4);
        h2.position.set(-5, -3, 0);

        // 10 Electrons total
        for(let i=0; i<2; i++) addOrbitingElectron(new THREE.Vector3(0,0,0), 3, 3.0, [Math.random()*Math.PI, Math.random()*Math.PI, 0]); // Inner O shell
        for(let i=0; i<8; i++) addOrbitingElectron(new THREE.Vector3(0,-1,0), 8, 1.5, [Math.random()*Math.PI, Math.random()*Math.PI, 0]); // Outer sharing shell

    } else if (type === 'gold') {
        const core = packNucleus(79, 118, 0.2);
        const shells = [
            { n: 2, r: 4, s: 3.0 }, { n: 8, r: 6, s: 2.5 }, { n: 18, r: 9, s: 2.0 },
            { n: 32, r: 13, s: 1.5 }, { n: 18, r: 18, s: 1.0 }, { n: 1, r: 24, s: 0.5 }
        ];
        shells.forEach(shell => {
            for(let i=0; i<shell.n; i++) {
                addOrbitingElectron(new THREE.Vector3(0,0,0), shell.r + (Math.random()-0.5), shell.s + (Math.random()*0.2), [Math.random()*Math.PI*2, Math.random()*Math.PI*2, Math.random()*Math.PI*2]);
            }
        });

    } else if (type === 'annihilation') {
        renderElectron(2, 0.3, [-5, 0, 0]);
        renderElectron(2, 0.3, [5, 0, 0], true); // Positron
        currentMeshes[0].userData.velocity = [0.03, 0, 0];
        currentMeshes[1].userData.velocity = [-0.03, 0, 0];

    } else if (type === 'gravity') {
        // Earth and Moon analog
        const earth = packNucleus(30, 30, 0.3);
        earth.position.set(0,0,0);

        const moon = packNucleus(10, 10, 0.2);
        moon.position.set(20, 0, 0);

        // Tidally locked electron orbiting moon
        addOrbitingElectron(new THREE.Vector3(20,0,0), 4, 1.0, [0,0,0]);

    } else if (type === 'custom') {
        // Read custom builder values
        const z = parseInt(inputZ.value) || 1;
        const n = parseInt(inputN.value) || 0;
        const e = parseInt(inputE.value) || 1;

        packNucleus(z, n, 0.3);

        // Very basic shell distributor for custom mode
        let ePlaced = 0;
        let shellR = 4;
        while(ePlaced < e) {
            let capacity = 2 * Math.pow((shellR/4), 2); // pseudo-capacity
            if(capacity < 2) capacity = 2;
            let toPlace = Math.min(e - ePlaced, Math.floor(capacity));
            for(let i=0; i<toPlace; i++) {
                 addOrbitingElectron(new THREE.Vector3(0,0,0), shellR, 3.0 / (shellR/2), [Math.random()*Math.PI*2, Math.random()*Math.PI*2, Math.random()*Math.PI*2]);
            }
            ePlaced += toPlace;
            shellR += 3;
        }
    }

    // Set wireframe state on freshly created materials
    updateMaterialsWireframe();
};

// Orchestrator
function goToStep(index) {
    if(index < 0 || index >= tourSteps.length) return;
    currentStepIndex = index;
    const step = tourSteps[currentStepIndex];

    // Ensure UI is updated before switching phenomena, this populates the select box
    // so tests and logic can find the options if goToStep is called during init.
    updateUI();

    window.switchPhenomenon(step.id);

    // Set camera position instantly for the new step to allow free observation
    if(step.cameraPos) {
        camera.position.set(step.cameraPos.x, step.cameraPos.y, step.cameraPos.z);
        controls.target.set(0,0,0);
        controls.update();
    }
}

// Listeners
btnPrev.addEventListener('click', () => goToStep(currentStepIndex - 1));
btnNext.addEventListener('click', () => goToStep(currentStepIndex + 1));
selectDropdown.addEventListener('change', (e) => goToStep(parseInt(e.target.value)));

btnPlayPause.addEventListener('click', () => {
    SIM_STATE.paused = !SIM_STATE.paused;
    btnPlayPause.innerHTML = SIM_STATE.paused
        ? '<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg><span>Play Sim</span>'
        : '<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg><span>Pause Sim</span>';
});

btnResetCam.addEventListener('click', () => {
    const step = tourSteps[currentStepIndex];
    if(step.cameraPos) {
        camera.position.set(step.cameraPos.x, step.cameraPos.y, step.cameraPos.z);
        controls.target.set(0,0,0);
        controls.update();
    }
});

btnBuildAtom.addEventListener('click', () => {
    window.switchPhenomenon('custom');
});

inputSpeed.addEventListener('input', (e) => {
    SIM_STATE.speed = parseFloat(e.target.value);
    speedVal.textContent = SIM_STATE.speed.toFixed(1) + 'x';
});

chkWireframe.addEventListener('change', (e) => {
    SIM_STATE.wireframe = e.target.checked;
    updateMaterialsWireframe();
});

chkVectors.addEventListener('change', (e) => {
    SIM_STATE.vectors = e.target.checked;
    const allObjects = [...currentMeshes, ...currentOrbiters.map(o => o.mesh)];
    allObjects.forEach(mesh => {
        if(mesh.userData.vectors && mesh.userData.vectors.group) mesh.userData.vectors.group.visible = SIM_STATE.vectors;
    });
});

chkTrails.addEventListener('change', (e) => {
    SIM_STATE.trails = e.target.checked;
    currentOrbiters.forEach(o => {
        if(o.trail) o.trail.visible = SIM_STATE.trails;
    });
});

chkLightMode.addEventListener('change', (e) => {
    SIM_STATE.lightMode = e.target.checked;
    if (SIM_STATE.lightMode) {
        lightEditorHud.classList.remove('hidden');
    } else {
        lightEditorHud.classList.add('hidden');
    }
    // Refresh current step to apply visual override
    window.switchPhenomenon(tourSteps[currentStepIndex].id);
});

inputPolarization.addEventListener('input', (e) => {
    SIM_STATE.lightPolarization = parseInt(e.target.value);
    valPolarization.textContent = SIM_STATE.lightPolarization + '°';
});

inputWavelength.addEventListener('input', (e) => {
    SIM_STATE.lightWavelength = parseFloat(e.target.value);
    valWavelength.textContent = SIM_STATE.lightWavelength.toFixed(1);
});

// INITIALIZATION
goToStep(0);
// Animation Loop
const clock = new THREE.Clock();

// Telemetry removed per user request

function updateFieldVectors(mesh, timeVal) {
    if(!mesh.userData.vectors || !mesh.userData.vectors.group.visible) return;

    const v = mesh.userData.vectors;
    const curveParams = v.params;

    // Move vector origin along the curve
    v.t += 0.005 * SIM_STATE.speed;
    if(v.t > 1) v.t -= 1;

    let curveObj;
    if (v.curveType === 'mobius') curveObj = new MobiusCurve(curveParams.radius, curveParams.tubeRadius);
    if (v.curveType === 'trefoil') curveObj = new TrefoilCurve(curveParams.radius, curveParams.tubeRadius);

    if(curveObj) {
        const point = curveObj.getPoint(v.t);
        const tangent = curveObj.getTangent(v.t);

        // Normal is derivative of tangent, approximate it:
        const t2 = (v.t + 0.001) % 1;
        const tangent2 = curveObj.getTangent(t2);
        const normal = new THREE.Vector3().subVectors(tangent2, tangent).normalize();
        const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();

        // Spin the E and B fields around the Poynting vector (tangent)
        const twistRate = (v.curveType === 'mobius') ? 2 : 3;
        const phase = v.t * Math.PI * 2 * twistRate + timeVal * 2;

        const eDir = new THREE.Vector3().addScaledVector(normal, Math.cos(phase)).addScaledVector(binormal, Math.sin(phase)).normalize();
        const bDir = new THREE.Vector3().crossVectors(tangent, eDir).normalize();

        v.group.position.copy(point);

        v.e.setDirection(eDir);
        v.b.setDirection(bDir);
        v.s.setDirection(tangent); // Poynting follows the curve track
    }
}

function animate() {
    requestAnimationFrame(animate);
    const rawDt = clock.getDelta();
    if(SIM_STATE.paused) {
        controls.update();
        renderer.render(scene, camera);
        return;
    }

    const dt = rawDt * SIM_STATE.speed;
    time += dt;

    currentMeshes.forEach(mesh => {
        // Rotations
        if(mesh.userData.rotationSpeed) {
            mesh.rotation.x += mesh.userData.rotationSpeed.x * dt;
            mesh.rotation.y += mesh.userData.rotationSpeed.y * dt;
            mesh.rotation.z += mesh.userData.rotationSpeed.z * dt;
        }

        // Velocity (for annihilation event)
        if(mesh.userData.velocity && !mesh.isGroup) {
            mesh.position.x += mesh.userData.velocity[0] * dt * 60;
            mesh.position.y += mesh.userData.velocity[1] * dt * 60;
            mesh.position.z += mesh.userData.velocity[2] * dt * 60;

            // Annihilation Trigger (Check distance between origin and particle)
            if(!annihilated && Math.abs(mesh.position.x) < 0.5) {
                annihilated = true;
                clearScene();
                // Spawn pure gamma radiation replacing the loop
                renderPhotonWave(60, 4, [0,0,0], 'x', false);
                renderPhotonWave(60, 4, [0,0,0], 'x', true);
            }
        }

        // Photon Wave propagation
        if(mesh.userData.type === 'photon') {
            mesh.userData.time += dt * 10;
            const points = [];
            for(let i=0; i<100; i++) {
                let t = i/100 * 60 - mesh.userData.time;
                if(mesh.userData.reverse) t = -i/100 * 60 + mesh.userData.time;
                let p = [0,0,0];
                if(mesh.userData.axis === 'x') p = [t, Math.sin(t)*4, Math.cos(t)*4];
                points.push(new THREE.Vector3(p[0], p[1], p[2]));
            }
            mesh.geometry.setFromPoints(points);
        }

        // Linear EM Propagation Mode Editor
        if(mesh.userData.type === 'linear_photon') {
            mesh.userData.timeOffset += dt * 10;
            const points = [];
            const polRad = SIM_STATE.lightPolarization * Math.PI / 180;
            const pos = mesh.userData.origin;
            for(let i=0; i<100; i++) {
                let t = i/100 * mesh.userData.length;
                let wavePhase = (t - mesh.userData.timeOffset) * (1.0 / SIM_STATE.lightWavelength);
                let wave = Math.sin(wavePhase) * mesh.userData.amplitude;

                let py = Math.cos(polRad) * wave;
                let pz = Math.sin(polRad) * wave;

                points.push(new THREE.Vector3(t+pos[0], py+pos[1], pz+pos[2]));
            }
            mesh.geometry.setFromPoints(points);
        }

        if(mesh.material && mesh.material.uniforms) {
            mesh.material.uniforms.uTime.value = time;
        }

        // Vectors
        updateFieldVectors(mesh, time);

        // If it's a group (Nucleus), rotate the whole core slowly
        if(mesh.isGroup) {
            mesh.rotation.x += 0.1 * dt;
            mesh.rotation.y += 0.2 * dt;
        } else {
           // Also do child meshes in group for materials
           mesh.traverse((child) => {
               if(child.isMesh && child.material && child.material.uniforms) {
                   child.material.uniforms.uTime.value = time;
               }
           });
        }
    });

    // Process Orbiting Electrons
    currentOrbiters.forEach(orbiter => {
        orbiter.angle += orbiter.speed * dt;

        // Calculate base orbit on XZ plane
        let x = Math.cos(orbiter.angle) * orbiter.radius;
        let z = Math.sin(orbiter.angle) * orbiter.radius;
        let y = 0;

        // Apply 3D plane rotation
        let vec = new THREE.Vector3(x, y, z);
        vec.applyEuler(new THREE.Euler(orbiter.planeRotX, orbiter.planeRotY, orbiter.planeRotZ));

        orbiter.mesh.position.copy(orbiter.center).add(vec);

        // Intrinsic Rotation & Shaders & Vectors
        orbiter.mesh.rotation.x += orbiter.mesh.userData.rotationSpeed.x * dt;
        orbiter.mesh.rotation.y += orbiter.mesh.userData.rotationSpeed.y * dt;
        orbiter.mesh.rotation.z += orbiter.mesh.userData.rotationSpeed.z * dt;

        if(orbiter.mesh.material && orbiter.mesh.material.uniforms) {
            orbiter.mesh.material.uniforms.uTime.value = time;
        }
        updateFieldVectors(orbiter.mesh, time);

        // Update Trail for probability cloud
        if(SIM_STATE.trails && orbiter.trail) {
            orbiter.trailPositions.push(orbiter.mesh.position.clone());
            if(orbiter.trailPositions.length > orbiter.trailMax) {
                orbiter.trailPositions.shift();
            }
            const positions = orbiter.trail.geometry.attributes.position.array;
            for(let i=0; i<orbiter.trailPositions.length; i++) {
                positions[i*3] = orbiter.trailPositions[i].x;
                positions[i*3+1] = orbiter.trailPositions[i].y;
                positions[i*3+2] = orbiter.trailPositions[i].z;
            }
            orbiter.trail.geometry.attributes.position.needsUpdate = true;
            orbiter.trail.geometry.setDrawRange(0, orbiter.trailPositions.length);
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
