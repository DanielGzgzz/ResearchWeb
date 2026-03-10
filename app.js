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
        features: ['4π (720°) twisted Möbius double-loop', 'Macroscopically massive boundary (193 fm)', 'Explains Dirac g=2 anomaly geometrically'],
        cameraPos: { x: 0, y: 0, z: 12 },
    },
    {
        id: 'proton',
        title: '3. Hadronic Architecture: The Proton',
        desc: 'Nucleons require a 3D architecture to distribute angular momentum. Compressed by 178,700 N of vacuum pressure, the resulting Trefoil knot is physically ~230x smaller than the electron orbit.',
        math: [
            { label: 'Resting Radius', expr: 'R_p = \\frac{4\\hbar}{m_p c} \\approx 0.8412 \\text{ fm}' },
            { label: 'Inward Vacuum Pressure', expr: 'F_{vac} = \\frac{4\\hbar c}{R_p^2}' },
        ],
        features: ['(3,2)-Torus knot (Trefoil knot)', 'Sub-femtometer density (0.84 fm)', 'Integrates to +1e via two outward twists (+2/3e) and one inward (-1/3e)'],
        cameraPos: { x: 0, y: 0, z: 1.5 },
    },
    {
        id: 'hydrogen',
        title: '4. The Hydrogen Atom (Protium)',
        desc: 'A tiny, dense proton anchoring an enormous electron in a geometric orbit. Notice the extreme scale discrepancy: the 0.84 fm proton core is dwarfed by the orbiting 193 fm electron.',
        math: [
            { label: 'Gravitational Shadowing', expr: 'G = \\frac{P_{vac}\\sigma^{2}}{4\\pi m_{p}^{2}}' },
        ],
        features: ['Central dense Trefoil knot (Proton)', '1 massive-scale orbiting Möbius loop (Electron)', 'Stable atomic equilibrium'],
        cameraPos: { x: 0, y: 0, z: 25 },
    },
    {
        id: 'deuterium',
        title: '5. Deuterium Atom (Heavy Hydrogen)',
        desc: 'A proton and neutron tightly bound via intersecting geometric repulsions, forming an FCC lattice core. The neutron is structurally identical but phase-shifted. Each hadron possesses an independent spatial orientation.',
        math: [
            { label: 'Nuclear Boundary Repulsion', expr: 'k \\approx 212,600 \\text{ N/fm}' },
        ],
        features: ['1 Proton / 1 Neutron dual-core', 'Independent 3D hadron orientations', 'Stable isotope'],
        cameraPos: { x: 0, y: 0, z: 25 },
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
        features: ['79 Protons / 118 Neutrons tightly packed core', '79 individually orbiting massive-scale electrons', 'High v = 0.58c velocities in inner shells'],
        cameraPos: { x: 0, y: 0, z: 150 },
    },
    {
        id: 'annihilation',
        title: '8. Positron-Electron Annihilation',
        desc: 'An electron meets its geometric inverse. Their mirrored chiralities cause absolute destructive interference upon collision, shattering the vacuum lock and unspooling into gamma radiation.',
        math: [
            { label: 'Annihilation Threshold', expr: 'E_{crit} = 1.02199 \\text{ MeV}' },
        ],
        features: ['Electron (Twist +2)', 'Positron (Twist -2)', 'Unspools into pure linear photons upon impact'],
        cameraPos: { x: 0, y: 0, z: 50 },
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
        cameraPos: { x: 0, y: 0, z: 80 },
    },
    {
        id: 'quasar',
        title: '11. The Gezin Radius & Quasar Emission',
        desc: 'A shadow cannot exceed 100% opacity. The absolute boundary of gravitational collapse occurs at the Gezin Radius. Mass exceeding this limit crushes into a "Super-Neutron" and phase-annihilates, violently ejecting continuous gamma radiation jets (Quasars).',
        math: [
            { label: 'The Gezin Radius', expr: 'R_{gezin} = R_p \\sqrt[3]{\\frac{M}{m_p}}' }
        ],
        features: ['Super-massive collapsed core', 'Matter accretion disk', 'Bi-polar linear gamma radiation jets (Quasar)'],
        cameraPos: { x: 0, y: 20, z: 120 },
    },
    {
        id: 'scattering',
        title: '12. Electron Light-by-Light Scattering',
        desc: 'Because electrons are entirely composed of trapped light (1D circular photons), scattering an electron is fundamentally a light-by-light interaction. An incoming linear photon collides with the topological knot, geometrically deflecting both bodies.',
        math: [
            { label: 'Compton Scattering Shift', expr: '\\Delta\\lambda = \\frac{h}{m_e c}(1 - \\cos\\theta)' }
        ],
        features: ['Target Geon (Electron)', 'Incoming Linear Photon (Gamma/X-ray)', 'Geometric Momentum Transfer Deflection'],
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
function addOrbitingElectron(centerPoint, orbitRadius, orbitSpeed, orbitPlaneRotation, dynamic=false) {
    // Enforce accurate physical scales. Electron is ~230x larger than a proton.
    const eRadius = 4.0;
    const eTube = 0.4;

    const electron = renderElectron(eRadius, eTube, [0,0,0]);
    // Remove from main static list so it doesn't get standard static rotation mixed up
    currentMeshes.splice(currentMeshes.indexOf(electron), 1);


    // Create thick, additive probability cloud trail
    // We use a large number of overlapping soft points to simulate dense probability distributions over time.
    const trailMax = 300;
    const trailGeom = new THREE.BufferGeometry();
    const trailPositions = new Float32Array(trailMax * 3);
    trailGeom.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));

    // Additive blending creates bright dense spots where the electron frequently visits
    const trailMat = new THREE.PointsMaterial({
        color: 0x4488ff,
        size: eRadius * 1.5, // Make it thick, enveloping the electron path
        transparent: true,
        opacity: 0.05, // Very low opacity per point so they build up slowly
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const trail = new THREE.Points(trailGeom, trailMat);
    trail.visible = SIM_STATE.trails;
    scene.add(trail);

    let initialPos = new THREE.Vector3(orbitRadius, 0, 0);
    const eulerRot = new THREE.Euler(orbitPlaneRotation[0], orbitPlaneRotation[1], orbitPlaneRotation[2]);
    initialPos.applyEuler(eulerRot);
    initialPos.add(centerPoint);

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
        trailMax: trailMax,
        dynamic: dynamic,
        velocity: new THREE.Vector3(
            (Math.random() - 0.5) * orbitSpeed,
            (Math.random() - 0.5) * orbitSpeed,
            (Math.random() - 0.5) * orbitSpeed
        )
    };

    if (dynamic) {
        orbitObj.mesh.position.copy(initialPos);
    }

    currentOrbiters.push(orbitObj);
}

// Helper to construct densely packed atomic nuclei (FCC Lattice approximation bounded spherically)
function packNucleus(numProtons, numNeutrons, baseScale=0.5) {
    const nucleusGroup = new THREE.Group();
    const totalNucleons = numProtons + numNeutrons;

    let pCount = 0;
    let nCount = 0;

    const spacing = baseScale * 2.2;

    // Generate Face-Centered Cubic (FCC) lattice coordinates
    const coords = [];
    if(totalNucleons === 1) {
        coords.push([0,0,0]);
    } else {
        // We generate a large enough block and then filter spherically
        // Estimate max radius needed based on volume
        const approximateRadius = Math.ceil(Math.pow(totalNucleons * 3/(4*Math.PI) * 2, 1/3)) + 1;

        for(let x = -approximateRadius; x <= approximateRadius; x++) {
            for(let y = -approximateRadius; y <= approximateRadius; y++) {
                for(let z = -approximateRadius; z <= approximateRadius; z++) {
                    // FCC Condition: x+y+z must be even
                    if ((Math.abs(x) + Math.abs(y) + Math.abs(z)) % 2 === 0) {
                        coords.push([x,y,z]);
                    }
                }
            }
        }
    }

    // Sort coords by distance to origin to pack from center outwards to form a sphere
    coords.sort((a,b) => (a[0]**2 + a[1]**2 + a[2]**2) - (b[0]**2 + b[1]**2 + b[2]**2));

    for(let i=0; i<totalNucleons; i++) {
        const isNeutron = (nCount < numNeutrons && (pCount >= numProtons || i % 2 === 0));
        if (isNeutron) nCount++; else pCount++;

        const pRadius = baseScale;
        const pTube = baseScale * 0.2;

        const cx = coords[i][0] * spacing;
        const cy = coords[i][1] * spacing;
        const cz = coords[i][2] * spacing;

        const nucleon = renderProton(pRadius, pTube, [cx, cy, cz], isNeutron);

        // Give each hadron a unique 3D spatial orientation within the lattice
        nucleon.rotation.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
        );

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
        renderElectron(4.0, 0.4);
    } else if (type === 'proton') {
        renderProton(0.2, 0.05);
    } else if (type === 'hydrogen') {
        packNucleus(1, 0, 0.1);
        addOrbitingElectron(new THREE.Vector3(0,0,0), 15, 2.0, [0, 0, 0]);
    } else if (type === 'deuterium') {
        packNucleus(1, 1, 0.1);
        addOrbitingElectron(new THREE.Vector3(0,0,0), 15, 1.8, [Math.PI/4, 0, 0]);
    } else if (type === 'water') {
        // Central Oxygen 16 (8p, 8n)
        packNucleus(8, 8, 0.1);

        // Hydrogen Bonds (1p each at 104.5 degrees)
        // Convert 104.5 degrees to radians: 104.5 * Math.PI / 180 = 1.8238 rad
        // Half angle is 52.25 degrees = 0.9119 rad
        const bondLength = 6.0;
        const h1Angle = Math.PI / 2 - (104.5 / 2) * Math.PI / 180; // slightly above/below x axis if centered on y
        // let's place Oxygen at origin, H1 at +angle, H2 at -angle.
        // Or standard: H1 and H2 down.
        const halfAngle = (104.5 / 2) * Math.PI / 180;

        const h1 = packNucleus(1, 0, 0.1);
        h1.position.set(Math.sin(halfAngle) * bondLength, -Math.cos(halfAngle) * bondLength, 0);

        const h2 = packNucleus(1, 0, 0.1);
        h2.position.set(-Math.sin(halfAngle) * bondLength, -Math.cos(halfAngle) * bondLength, 0);

        // 10 Electrons total
        // Inner O shell (2 electrons)
        for(let i=0; i<2; i++) {
            addOrbitingElectron(new THREE.Vector3(0,0,0), 8, 3.0, [Math.random()*Math.PI, Math.random()*Math.PI, 0]);
        }

        // Outer sharing shell (8 electrons)
        // Adjust the center slightly down to encompass the Hydrogens naturally
        const sharedCenter = new THREE.Vector3(0, -bondLength * 0.3, 0);
        for(let i=0; i<8; i++) {
            addOrbitingElectron(sharedCenter, 18, 1.5, [Math.random()*Math.PI, Math.random()*Math.PI, 0]);
        }

    } else if (type === 'gold') {
        const core = packNucleus(79, 118, 0.1);
        // Emphasizing the relativistic v = 0.58c speed of the inner 1s shell.
        // Speeds decay outward (v = Z*alpha*c / n).
        const shells = [
            { n: 2,  r: 12,  s: 5.8 },  // 1s shell (Highly relativistic)
            { n: 8,  r: 22,  s: 2.9 },  // 2s, 2p
            { n: 18, r: 35,  s: 1.9 },  // 3s, 3p, 3d
            { n: 32, r: 50, s: 1.45 }, // 4s, 4p, 4d, 4f
            { n: 18, r: 68, s: 1.16 }, // 5s, 5p, 5d
            { n: 1,  r: 85, s: 0.96 }  // 6s (Valence)
        ];
        shells.forEach(shell => {
            for(let i=0; i<shell.n; i++) {
                addOrbitingElectron(new THREE.Vector3(0,0,0), shell.r + (Math.random()-0.5)*3, shell.s + (Math.random()*0.2), [Math.random()*Math.PI*2, Math.random()*Math.PI*2, Math.random()*Math.PI*2]);
            }
        });

    } else if (type === 'annihilation') {
        renderElectron(4.0, 0.4, [-10, 0, 0]);
        renderElectron(4.0, 0.4, [10, 0, 0], true); // Positron
        currentMeshes[0].userData.velocity = [0.08, 0, 0];
        currentMeshes[1].userData.velocity = [-0.08, 0, 0];

    } else if (type === 'gravity') {
        // Earth and Moon analog using simple macroscopic spheres
        const earthGeom = new THREE.SphereGeometry(15, 32, 32);
        const earthMat = new THREE.MeshPhongMaterial({ color: 0x1e3a8a, wireframe: SIM_STATE.wireframe });
        const earth = new THREE.Mesh(earthGeom, earthMat);
        scene.add(earth);
        currentMeshes.push(earth);

        const moonGeom = new THREE.SphereGeometry(4, 32, 32);
        const moonMat = new THREE.MeshPhongMaterial({ color: 0x64748b, wireframe: SIM_STATE.wireframe });
        const moon = new THREE.Mesh(moonGeom, moonMat);

        // Setup tidal locking rotation group
        const orbitGroup = new THREE.Group();
        moon.position.set(40, 0, 0);

        // Add a visible marker to the moon to easily see the tidal lock (face always points at earth)
        const craterGeom = new THREE.SphereGeometry(1, 16, 16);
        const craterMat = new THREE.MeshBasicMaterial({ color: 0x334155 });
        const crater = new THREE.Mesh(craterGeom, craterMat);
        crater.position.set(-4, 0, 0); // pointing inward toward Earth origin
        moon.add(crater);

        orbitGroup.add(moon);
        orbitGroup.userData = { type: 'tidal_moon', rotationSpeed: { x: 0, y: 0.5, z: 0 } };
        scene.add(orbitGroup);
        currentMeshes.push(orbitGroup);

    } else if (type === 'quasar') {
        // Central Black Hole / Super-Neutron
        const coreGeom = new THREE.SphereGeometry(5, 32, 32);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.85 }); // Slightly transparent to see crushing core
        const bh = new THREE.Mesh(coreGeom, coreMat);
        scene.add(bh);
        currentMeshes.push(bh);

        // Show a crushed nuclear lattice inside the event horizon
        const crushedCore = packNucleus(20, 20, 0.1);
        crushedCore.scale.set(0.5, 0.5, 0.5); // Pack them very tightly
        // Note: packNucleus already adds to scene and currentMeshes.

        // Accretion disk
        const diskGeom = new THREE.RingGeometry(8, 25, 64);
        const diskMat = new THREE.MeshBasicMaterial({
            color: 0xffaa00,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8,
            wireframe: SIM_STATE.wireframe
        });
        const disk = new THREE.Mesh(diskGeom, diskMat);
        disk.rotation.x = Math.PI / 2;
        disk.userData = { rotationSpeed: { x: 0, y: 0, z: -1.5 } }; // Fast rotation
        scene.add(disk);
        currentMeshes.push(disk);

        // Bi-polar Gamma Ray Jets (Quasar emission)
        // Adjust positions so they originate exactly from the poles of the black hole
        const jet1 = renderLinearPhoton(100, 2, [0, 0, 0]);
        jet1.rotation.z = Math.PI / 2; // Point UP (Y axis)

        const jet2 = renderLinearPhoton(100, 2, [0, 0, 0]);
        jet2.rotation.z = -Math.PI / 2; // Point DOWN (-Y axis)
        jet2.rotation.x = Math.PI; // flip phase to mirror

    } else if (type === 'scattering') {
        // Target Electron (Stationary at start)
        const targetElectron = renderElectron(4.0, 0.4, [0, 0, 0]);
        targetElectron.userData.velocity = [0, 0, 0];
        targetElectron.userData.isScatteringTarget = true;

        // Incoming Linear Photon Wave (Approaching from -X)
        const incomingPhoton = renderLinearPhoton(20, 2, [-30, 0, 0]);
        // Set up the photon to travel along X
        incomingPhoton.userData.velocity = [0.3, 0, 0];
        incomingPhoton.userData.isScatteringProjectile = true;
        incomingPhoton.userData.hasScattered = false;

    } else if (type === 'custom') {
        // Read custom builder values
        const z = parseInt(inputZ.value) || 1;
        const n = parseInt(inputN.value) || 0;
        const e = parseInt(inputE.value) || 1;

        packNucleus(z, n, 0.1);

        // Custom Mode: Dynamic electrons with real-time repulsion to form natural shells
        for(let i=0; i<e; i++) {
            // Spawn electrons at randomized somewhat close distances, they will push each other away
            const initialRadius = 15 + Math.random() * 10;
            const initialSpeed = 10.0;
            addOrbitingElectron(new THREE.Vector3(0,0,0), initialRadius, initialSpeed, [Math.random()*Math.PI*2, Math.random()*Math.PI*2, Math.random()*Math.PI*2], true);
        }

        // Set an attractive charge in the core equal to Z
        scene.userData.coreCharge = z;
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
            if(!annihilated && mesh.userData.type === 'electron' && Math.abs(mesh.position.x) < 0.5) {
                annihilated = true;
                clearScene();
                // Instead of lines, use the 3D tube geometry of the loop and unspool them outwards
                // We'll mimic this by spawning detached loop pieces flying away
                // Creating a helix from the loop tube
                const hRadius = 4.0;
                const hTube = 0.4;

                class HelixCurve extends THREE.Curve {
                    getPoint(t, optionalTarget = new THREE.Vector3()) {
                        const u = t * Math.PI * 8; // Multiple loops
                        const x = t * 60 - 30; // Unspool across X
                        const y = Math.cos(u) * hRadius;
                        const z = Math.sin(u) * hRadius;
                        return optionalTarget.set(x, y, z);
                    }
                }

                const g1 = new THREE.TubeGeometry(new HelixCurve(), 200, hTube, 16, false);
                const m1 = createGeonMaterial(2.0); // e+
                const mesh1 = new THREE.Mesh(g1, m1);
                mesh1.userData = { isPhotonJet: true, dir: 1, rotationSpeed: { x: 0, y: 0, z: 0.5 } };
                mesh1.position.set(0, 0, 0);
                scene.add(mesh1);
                currentMeshes.push(mesh1);

                const g2 = new THREE.TubeGeometry(new HelixCurve(), 200, hTube, 16, false);
                const m2 = createGeonMaterial(-2.0); // e-
                const mesh2 = new THREE.Mesh(g2, m2);
                mesh2.userData = { isPhotonJet: true, dir: -1, rotationSpeed: { x: 0, y: 0, z: -0.5 } };
                mesh2.rotation.y = Math.PI; // flip
                mesh2.position.set(0, 0, 0);
                scene.add(mesh2);
                currentMeshes.push(mesh2);
            }
        }

        // Handle unspooled photon jets
        if (mesh.userData.isPhotonJet) {
            mesh.position.x += mesh.userData.dir * dt * 30;
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

            // Allow origins to dynamically move (e.g., scattering projectile)
            if (mesh.userData.isScatteringProjectile) {
                mesh.userData.origin[0] += mesh.userData.velocity[0] * dt * 60;
                mesh.userData.origin[1] += mesh.userData.velocity[1] * dt * 60;
                mesh.userData.origin[2] += mesh.userData.velocity[2] * dt * 60;

                // Check for collision with target electron near origin
                if (!mesh.userData.hasScattered && Math.abs(mesh.userData.origin[0]) < 2.0) {
                    mesh.userData.hasScattered = true;
                    // Deflect photon (scattering angle)
                    mesh.userData.velocity = [0.15, 0.2, 0];
                    mesh.rotation.z = Math.PI / 6; // visual tilt

                    // Deflect target electron (Conservation of Momentum)
                    const target = currentMeshes.find(m => m.userData.isScatteringTarget);
                    if (target) {
                        target.userData.velocity = [0.05, -0.05, 0]; // Push the electron
                    }
                }
            }

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
    currentOrbiters.forEach((orbiter, i) => {
        let currentPos, nextPos;

        if (orbiter.dynamic) {
            // Apply forces to dynamically simulate Schrodinger shells via Coulombic interactions
            const force = new THREE.Vector3(0,0,0);
            const pos = orbiter.mesh.position;

            // 1. Attraction to core
            const dirToCore = new THREE.Vector3().subVectors(orbiter.center, pos);
            const distToCore = dirToCore.length();
            if(distToCore > 0.1) {
                // F = k * (q1*q2) / r^2
                // We fake k for visual scale
                const pullStrength = 500 * (scene.userData.coreCharge || 1) / (distToCore * distToCore);
                force.add(dirToCore.normalize().multiplyScalar(pullStrength));
            }

            // 2. Repulsion from other electrons
            currentOrbiters.forEach((other, j) => {
                if (i === j) return;
                const dirToOther = new THREE.Vector3().subVectors(pos, other.mesh.position);
                const distToOther = dirToOther.length();
                if(distToOther > 0.1) {
                    const pushStrength = 400 / (distToOther * distToOther);
                    force.add(dirToOther.normalize().multiplyScalar(pushStrength));
                }
            });

            // Pauli exclusion pseudo-force / structural limit to prevent collapse into core
            if (distToCore < 10) {
                const bounce = new THREE.Vector3().subVectors(pos, orbiter.center).normalize();
                force.add(bounce.multiplyScalar(1000 / (distToCore * distToCore)));
            }

            // Apply angular momentum (centripetal pseudo-force) to maintain orbit
            const tangent = new THREE.Vector3(-pos.z, 0, pos.x).normalize();
            // Give them slightly different orbital axes so they don't all align flat
            tangent.applyAxisAngle(new THREE.Vector3(1,0,0), orbiter.planeRotX);
            tangent.applyAxisAngle(new THREE.Vector3(0,1,0), orbiter.planeRotY);
            tangent.applyAxisAngle(new THREE.Vector3(0,0,1), orbiter.planeRotZ);

            force.add(tangent.multiplyScalar(20)); // orbit push

            // Add a slight drag/damping so they settle into shells
            const drag = orbiter.velocity.clone().multiplyScalar(-0.1);
            force.add(drag);

            // Update Velocity & Position
            orbiter.velocity.add(force.multiplyScalar(dt));

            // Cap speed
            if(orbiter.velocity.length() > 50) {
                orbiter.velocity.normalize().multiplyScalar(50);
            }

            nextPos = pos.clone().add(orbiter.velocity.clone().multiplyScalar(dt));
            orbiter.mesh.position.copy(nextPos);

            // Look forward
            orbiter.mesh.lookAt(nextPos.clone().add(orbiter.velocity));

        } else {
            // Standard Fixed Geometric Orbit
            const nextAngle = orbiter.angle + (orbiter.speed * dt);

            let nx = Math.cos(nextAngle) * orbiter.radius;
            let nz = Math.sin(nextAngle) * orbiter.radius;

            let currentVec = new THREE.Vector3(Math.cos(orbiter.angle) * orbiter.radius, 0, Math.sin(orbiter.angle) * orbiter.radius);
            let nextVec = new THREE.Vector3(nx, 0, nz);

            const eulerRot = new THREE.Euler(orbiter.planeRotX, orbiter.planeRotY, orbiter.planeRotZ);
            currentVec.applyEuler(eulerRot);
            nextVec.applyEuler(eulerRot);

            currentPos = orbiter.center.clone().add(currentVec);
            nextPos = orbiter.center.clone().add(nextVec);

            // Move to current
            orbiter.mesh.position.copy(currentPos);
            orbiter.angle = nextAngle;

            // Kinematics: The Möbius ring must orient its primary axis along its direction of travel (velocity vector)
            // to represent the helical elongation (inertia) defined in the theory.
            orbiter.mesh.lookAt(nextPos);
        }

        // Apply intrinsic Z-spin while maintaining forward orientation
        orbiter.mesh.rotateZ(orbiter.mesh.userData.rotationSpeed.z * time * 20); // Internal spin

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
