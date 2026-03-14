import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

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
        desc: 'The baseline simulation environment is a hyper-elastic, zero-point tensor fluid. Electromagnetic waves displace this vacuum. (1 Unit = 1 Femtometer)',
        math: [
            { label: 'Kinematic Action Viscosity', expr: 'h = 6.62607 \\times 10^{-34} \\text{ kg}\\cdot\\text{m}^2/\\text{s}' },
            { label: 'Gravitation (Casimir Pressure Gradient)', expr: 'G = \\frac{P_{vac}\\sigma^{2}}{4\\pi m_{p}^{2}}' }
        ],
        features: ['Zero-point tensor fluid', 'Geons displace vacuum', 'Geometric shadowing causes gravity'],
        cameraPos: { x: 0, y: 0, z: 10 },
    },
    {
        id: 'electron',
        title: '2. Leptonic Architecture: The Electron',
        desc: 'Leptons are constructed from a continuous 1D circularly polarized photon track trapped in a stable quantum orbit. The 4π topological twist generates a macroscopic negative monopole and intrinsic spin-1/2.',
        math: [
            { label: 'Compton Wavelength Confinement', expr: '4\\pi r = \\lambda_c' },
            { label: 'Structural Radius', expr: 'r = \\frac{\\hbar}{2m_e c} = 193.0796 \\text{ fm}' },
            { label: 'Casimir Confinement Pressure', expr: 'F_{vac} = \\frac{\\hbar c}{2r^2} \\equiv \\frac{m_e c^2}{r}' },
        ],
        features: ['4π (720°) twisted Möbius double-loop', 'Macroscopically massive boundary (193 fm radius)', 'Explains Dirac g=2 anomaly geometrically'],
        cameraPos: { x: 0, y: 0, z: 10 },
    },
    {
        id: 'proton',
        title: '3. Hadronic Architecture: The Proton',
        desc: 'Nucleons require a 3D architecture to distribute angular momentum. Compressed by 178,700 N of vacuum pressure, the resulting Trefoil knot is physically ~230x smaller than the electron orbit.',
        math: [
            { label: 'Resting Radius', expr: 'R_p = \\frac{4\\hbar}{m_p c} = 0.8412 \\text{ fm}' },
            { label: 'Inward Vacuum Pressure', expr: 'F_{vac} = \\frac{4\\hbar c}{R_p^2}' },
        ],
        features: ['(3,2)-Torus knot (Trefoil knot)', 'Sub-femtometer density (0.84 fm radius)', 'Integrates to +1e via two outward twists (+2/3e) and one inward (-1/3e)'],
        cameraPos: { x: 0, y: 0, z: 6 },
    },
    {
        id: 'hydrogen',
        title: '4. The Hydrogen Atom (Protium)',
        desc: 'A tiny, dense 0.84 fm proton anchoring an enormous 193 fm electron at a massive distance. The Bohr radius (a0) is ~52,900 fm. This is the true, staggering geometric scale.',
        math: [
            { label: 'Gravitational Shadowing', expr: 'G = \\frac{P_{vac}\\sigma^{2}}{4\\pi m_{p}^{2}}' },
        ],
        features: ['Central dense Trefoil knot (0.84 fm core)', '1 massive-scale orbiting Möbius loop (193 fm)', '52,900 fm physical orbit'],
        cameraPos: { x: 0, y: 0, z: 120000 },
    },
    {
        id: 'deuterium',
        title: '5. Deuterium Atom (Heavy Hydrogen)',
        desc: 'A proton and neutron tightly bound via intersecting geometric repulsions at ~2 fm separation, forming an FCC lattice core. The neutron is structurally identical but phase-shifted.',
        math: [
            { label: 'Nuclear Boundary Repulsion', expr: 'k \\approx 212,600 \\text{ N/fm}' },
        ],
        features: ['1 Proton / 1 Neutron dual-core (2.2 fm spacing)', 'Independent 3D hadron orientations', '52,900 fm physical orbit'],
        cameraPos: { x: 0, y: 0, z: 120000 },
    },
    {
        id: 'water',
        title: '6. Water Molecule (H₂O) & Polarization',
        desc: 'Two hydrogen cores bound at ~95,840 fm distance to an Oxygen core at exactly 104.5°. 10 massive electrons repel each other dynamically in real-time across vast empty space.',
        math: [
            { label: 'Refractive Delay', expr: 'n = \\frac{c}{v_m} = 1 + (N_v \\cdot c \\cdot \\sigma \\cdot \\Delta t)' }
        ],
        features: ['Oxygen-16 core (8p, 8n)', '2 Protons strictly bonded at 104.5° (95,840 fm)', '10 dynamically repelling Electrons (Real-time n-body)'],
        cameraPos: { x: 0, y: 0, z: 250000 },
    },
    {
        id: 'gold',
        title: '7. The Gold Atom (Au) & Probability Clouds',
        desc: 'A massive Casimir well of 197 packed nucleons (radius ~6 fm). 79 macroscopically massive electrons (193 fm each) repel one another in complex shells spanning hundreds of thousands of femtometers.',
        math: [
            { label: 'Relativistic Absorption Shift', expr: '\\gamma = \\frac{1}{\\sqrt{1 - (v/c)^2}}' }
        ],
        features: ['79 Protons / 118 Neutrons packed (197 nucleons, 6 fm)', '79 massive repelling electrons', 'High relativistic velocities in deeply bound shells'],
        cameraPos: { x: 0, y: 0, z: 800000 },
    },
    {
        id: 'annihilation',
        title: '8. Positron-Electron Annihilation',
        desc: 'An electron meets its geometric inverse. Their mirrored chiralities cause absolute destructive interference upon collision, shattering the vacuum lock and unspooling into gamma radiation.',
        math: [
            { label: 'Annihilation Threshold', expr: 'E_{crit} = 1.02199 \\text{ MeV}' },
        ],
        features: ['Electron (Twist +2)', 'Positron (Twist -2)', 'Unspools into pure linear photons upon impact'],
        cameraPos: { x: 0, y: 0, z: 3000 },
    },
    {
        id: 'gravity',
        title: '9. Casimir Gravity & Tidal Locking',
        desc: 'Gravity is not curved space; it is the Casimir pressure gradient formed by geometric shadowing. When two macroscopic bodies overlap shadows, the vacuum pushes them together. Close proximity induces tidal locking (face-to-face alignment) of their internal topologies.',
        math: [
            { label: 'Gravitational Force', expr: 'F_g = \\frac{G m_1 m_2}{r^2}' }
        ],
        features: ['Massive Body 1 (Earth analog)', 'Massive Body 2 (Moon analog)', 'Tidally locked orbiting topologies'],
        cameraPos: { x: 0, y: 0, z: 150000000 },
    },
    {
        id: 'custom',
        title: '10. Custom Atomic Builder',
        desc: 'Input true nucleon counts. The engine geometrically packs the sub-femtometer core and generates valence shells where massive electrons organically form orbits via n-body Coulombic repulsion.',
        math: [
            { label: 'Nuclear Core Packing Volume', expr: 'V = \\frac{4}{3}\\pi (R_p \\sqrt[3]{A})^3' }
        ],
        features: ['Sub-femtometer FCC Core Builder', 'Real-time massive electron Coulombic repulsion', 'Dynamic physical scale rendering'],
        cameraPos: { x: 0, y: 0, z: 200000 },
    },
    {
        id: 'quasar',
        title: '11. The Gezin Radius & Quasar Emission',
        desc: 'A shadow cannot exceed 100% opacity. The absolute boundary of gravitational collapse occurs at the Gezin Radius. Mass exceeding this limit crushes into a "Super-Neutron" and phase-annihilates, violently ejecting continuous gamma radiation jets (Quasars).',
        math: [
            { label: 'The Gezin Radius', expr: 'R_{gezin} = R_p \\sqrt[3]{\\frac{M}{m_p}}' }
        ],
        features: ['Super-massive collapsed core', 'Matter accretion disk', 'Bi-polar linear gamma radiation jets (Quasar)'],
        cameraPos: { x: 0, y: 200, z: 200000 },
    },
    {
        id: 'scattering',
        title: '12. Electron Light-by-Light Scattering',
        desc: 'Because electrons are entirely composed of trapped light, scattering an electron is fundamentally a light-by-light interaction. An incoming linear photon collides, geometrically deflecting both bodies.',
        math: [
            { label: 'Compton Scattering Shift', expr: '\\Delta\\lambda = \\frac{h}{m_e c}(1 - \\cos\\theta)' }
        ],
        features: ['Target Geon (193 fm Electron)', 'Incoming Linear Photon (Gamma/X-ray)', 'Geometric Momentum Transfer Deflection'],
        cameraPos: { x: 0, y: 0, z: 1500 },
    }
];

// --- SCALES & PHYSICS CONSTANTS ---
// 1 Unit = 1 fm (femtometer)
const SCALE = {
    PROTON_RADIUS: 0.84, // 0.84 fm
    PROTON_TUBE: 0.2,
    ELECTRON_RADIUS: 193.0, // 193.0 fm
    ELECTRON_TUBE: 15.0,
    BOHR_RADIUS: 52900.0, // a0 = ~52,900 fm
    WATER_BOND: 95840.0 // O-H bond length = ~95.84 pm = 95,840 fm
};

// --- SHADERS ---

// --- CURVES ---
class LinearPhotonCurve extends THREE.Curve {
    constructor(length) {
        super();
        this.length = length;
    }
    getPoint(t, optionalTarget = new THREE.Vector3()) {
        // Photon travels along the X axis
        return optionalTarget.set(t * this.length, 0, 0);
    }

    // Override computeFrenetFrames to provide a stable, non-rotating reference frame for a straight line
    computeFrenetFrames(segments, closed) {
        const tangents = [];
        const normals = [];
        const binormals = [];

        for (let i = 0; i <= segments; i++) {
            tangents.push(new THREE.Vector3(1, 0, 0));
            // Rotate the normal by the user's polarization angle
            const polRad = SIM_STATE.lightPolarization * Math.PI / 180;
            const n = new THREE.Vector3(0, Math.cos(polRad), Math.sin(polRad));
            normals.push(n);
            const b = new THREE.Vector3().crossVectors(tangents[i], n).normalize();
            binormals.push(b);
        }

        return { tangents, normals, binormals };
    }
}

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

const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1e9);
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Post-Processing (Bloom)
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(container.clientWidth, container.clientHeight),
    0.15,  // strength
    0.4,   // radius
    0.95   // threshold
);
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

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

// Function to generate discrete square sections (bricks) along a curve
// Function to compute Bishop (Parallel Transport) Frames
function computeBishopFrames(curve, segments, closed) {
    // Generate parallel transport frames to avoid Frenet-Serret pinching/twisting
    const points = curve.getSpacedPoints(segments);
    const tangents = [];
    for (let i = 0; i <= segments; i++) {
        let t = new THREE.Vector3();
        if (i < segments) {
            t.subVectors(points[i+1], points[i]).normalize();
        } else {
            t.subVectors(points[i], points[i-1]).normalize();
        }
        tangents.push(t);
    }
    if (closed) {
        tangents[segments].copy(tangents[0]);
    }

    const normals = [];
    const binormals = [];
    let initialNormal = new THREE.Vector3();
    let min = Math.min(Math.abs(tangents[0].x), Math.abs(tangents[0].y), Math.abs(tangents[0].z));
    if (min === Math.abs(tangents[0].x)) initialNormal.set(1,0,0);
    else if (min === Math.abs(tangents[0].y)) initialNormal.set(0,1,0);
    else initialNormal.set(0,0,1);

    let v = new THREE.Vector3().crossVectors(tangents[0], initialNormal).normalize();
    initialNormal.crossVectors(tangents[0], v).normalize();
    normals.push(initialNormal);
    binormals.push(new THREE.Vector3().crossVectors(tangents[0], initialNormal).normalize());

    for (let i = 1; i <= segments; i++) {
        let prevNormal = normals[i-1];
        let currentNormal = prevNormal.clone();

        let axis = new THREE.Vector3().crossVectors(tangents[i-1], tangents[i]);
        if (axis.lengthSq() > 1e-10) {
            axis.normalize();
            let angle = Math.acos(THREE.MathUtils.clamp(tangents[i-1].dot(tangents[i]), -1, 1));
            currentNormal.applyAxisAngle(axis, angle);
        }

        // Orthogonalize just to be safe
        let currentBinormal = new THREE.Vector3().crossVectors(tangents[i], currentNormal).normalize();
        currentNormal.crossVectors(currentBinormal, tangents[i]).normalize();

        normals.push(currentNormal);
        binormals.push(currentBinormal);
    }

    if (closed) {
        let axis = new THREE.Vector3().crossVectors(normals[0], normals[segments]);
        let angle = Math.acos(THREE.MathUtils.clamp(normals[0].dot(normals[segments]), -1, 1));
        if (tangents[0].dot(axis) < 0) angle = -angle;
        let diff = angle / segments;
        for (let i = 1; i <= segments; i++) {
            normals[i].applyAxisAngle(tangents[i], diff * i);
            binormals[i].crossVectors(tangents[i], normals[i]).normalize();
        }
    }

    return { tangents, normals, binormals };
}

// Function to generate continuous swept sections along a curve
function createContinuousSweepGeometry(curve, segments, radius, closed=true, expansionRate=0.0, particleType='electron') {
    const geom = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const uvs = [];
    const indices = [];

    // Extract evenly spaced points and their mathematical frames using Bishop frame
    const points = curve.getSpacedPoints(segments);
    const frames = computeBishopFrames(curve, segments, closed);

    const ringVertices = [];

    const colorEPlus = new THREE.Color('#00E676');
    const colorEMinus = new THREE.Color('#D50000');
    const colorBPlus = new THREE.Color('#651FFF');
    const colorBMinus = new THREE.Color('#FFAB00');

    // We only generate vertices up to `segments - 1` if closed, to ensure perfect indexing wrap-around.
    const loopMax = closed ? segments - 1 : segments;

    for (let i = 0; i <= loopMax; i++) {
        const pt = points[i];
        const T = frames.tangents[i];

        // Inverse Square / Spherical Dilation Effect:
        const currentRadius = radius + (i * expansionRate);

        let N = frames.normals[i].clone().normalize();
        let B_vec = frames.binormals[i].clone().normalize();

        let twistAngle = 0.0;

        if (particleType === 'proton' || particleType === 'neutron' || particleType === 'antiproton') {
            twistAngle = Math.PI * 4.0;
        } else if (particleType === 'electron' || particleType === 'positron') {
            twistAngle = Math.PI * 4.0;
        } else if (particleType === 'linear_photon') {
            twistAngle = Math.PI * (4.0 / Math.max(0.1, SIM_STATE.lightWavelength));
        }

        if (particleType === 'positron' || particleType === 'antiproton') {
            twistAngle *= -1.0;
        }

        const tParam = i / segments;

        if (particleType === 'proton' || particleType === 'antiproton') {
            if (tParam > 0.6) {
                const blend = THREE.MathUtils.smoothstep(tParam, 0.6, 0.75);
                twistAngle += blend * Math.PI;
            }
        } else if (particleType === 'neutron') {
            if (tParam > 0.3) {
                const blend = THREE.MathUtils.smoothstep(tParam, 0.3, 0.45);
                twistAngle += blend * Math.PI;
            }
        }

        if (twistAngle !== 0.0 || (particleType === 'linear_photon' && SIM_STATE.lightPolarization !== 0)) {
            let phase = tParam * twistAngle;
            if (particleType === 'linear_photon') {
                phase += THREE.MathUtils.degToRad(SIM_STATE.lightPolarization);
            }

            const cosP = Math.cos(phase);
            const sinP = Math.sin(phase);

            const newN = new THREE.Vector3().addScaledVector(N, cosP).addScaledVector(B_vec, sinP).normalize();
            const newB = new THREE.Vector3().crossVectors(T, newN).normalize();
            N = newN;
            B_vec = newB;
        }

        const E_mag = currentRadius * 1.5;
        const B_mag = currentRadius * 1.5;

        const E = N.clone().multiplyScalar(E_mag);
        const B = B_vec.clone().multiplyScalar(B_mag);

        const c0 = pt.clone().add(E).add(B); // Top-Right (+E, +B)
        const c1 = pt.clone().add(E).sub(B); // Top-Left (+E, -B)
        const c2 = pt.clone().sub(E).sub(B); // Bottom-Left (-E, -B)
        const c3 = pt.clone().sub(E).add(B); // Bottom-Right (-E, +B)

        ringVertices.push({ c0, c1, c2, c3, u: tParam });
    }

    // Construct distinct faces with hard edges (by duplicating vertices per face), but shared along the length (for smooth shading)
    for (let i = 0; i <= loopMax; i++) {
        const r = ringVertices[i];

        // Face 1: Top (+E) [c1, c0]
        positions.push(...r.c1.toArray(), ...r.c0.toArray());
        colors.push(colorEPlus.r, colorEPlus.g, colorEPlus.b, colorEPlus.r, colorEPlus.g, colorEPlus.b);
        uvs.push(r.u, 0.25, r.u, 0.25);

        // Face 2: Bottom (-E) [c3, c2]
        positions.push(...r.c3.toArray(), ...r.c2.toArray());
        colors.push(colorEMinus.r, colorEMinus.g, colorEMinus.b, colorEMinus.r, colorEMinus.g, colorEMinus.b);
        uvs.push(r.u, 0.75, r.u, 0.75);

        // Face 3: Right (+B) [c0, c3]
        positions.push(...r.c0.toArray(), ...r.c3.toArray());
        colors.push(colorBPlus.r, colorBPlus.g, colorBPlus.b, colorBPlus.r, colorBPlus.g, colorBPlus.b);
        uvs.push(r.u, 0.0, r.u, 0.0);

        // Face 4: Left (-B) [c2, c1]
        positions.push(...r.c2.toArray(), ...r.c1.toArray());
        colors.push(colorBMinus.r, colorBMinus.g, colorBMinus.b, colorBMinus.r, colorBMinus.g, colorBMinus.b);
        uvs.push(r.u, 0.5, r.u, 0.5);
    }

    // Generate indices
    for (let i = 0; i < segments; i++) {
        const row0 = i * 8;
        let row1 = (i + 1) * 8;

        if (closed && i === segments - 1) {
            row1 = 0; // Wrap around to the start to perfectly weld the geometry
        }

        function addQuad(v0, v1, v2, v3) {
            indices.push(v0, v1, v2);
            indices.push(v0, v2, v3);
        }

        // Top Face
        addQuad(row0 + 0, row0 + 1, row1 + 1, row1 + 0);
        // Bottom Face
        addQuad(row0 + 2, row0 + 3, row1 + 3, row1 + 2);
        // Right Face
        addQuad(row0 + 4, row0 + 5, row1 + 5, row1 + 4);
        // Left Face (offset 7 is c1 (Top), offset 6 is c2 (Bottom))
        addQuad(row0 + 7, row0 + 6, row1 + 6, row1 + 7);
    }

    // Cap ends if not closed
    if (!closed) {
        // Start cap
        const startR = ringVertices[0];
        const scOffset = positions.length / 3;
        positions.push(...startR.c1.toArray(), ...startR.c0.toArray(), ...startR.c3.toArray(), ...startR.c2.toArray());
        for(let j=0; j<4; j++) { colors.push(0.5, 0.5, 0.5); uvs.push(0, 0); }
        // Start cap: c1, c0, c3, c2
        indices.push(scOffset, scOffset+2, scOffset+1);
        indices.push(scOffset, scOffset+3, scOffset+2);

        // End cap: c0, c1, c2, c3
        const endR = ringVertices[segments];
        const ecOffset = positions.length / 3;
        positions.push(...endR.c0.toArray(), ...endR.c1.toArray(), ...endR.c2.toArray(), ...endR.c3.toArray());
        for(let j=0; j<4; j++) { colors.push(0.5, 0.5, 0.5); uvs.push(1, 1); }
        indices.push(ecOffset, ecOffset+1, ecOffset+2);
        indices.push(ecOffset, ecOffset+2, ecOffset+3);
    }

    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(indices);

    // AAA Refinement: Smooth Vertex Normals
    // This perfectly calculates smooth lighting along the track but keeps faces separated because vertices aren't shared across corners!
    geom.computeVertexNormals();
    geom.computeBoundingSphere();

    return geom;
}

function createGeonMaterial(twistFactor, particleType = 'electron') {
    const mat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        wireframe: SIM_STATE.wireframe,
        transparent: true,
        opacity: 1.0,
        side: THREE.DoubleSide,
        depthWrite: particleType !== 'linear_photon',
        roughness: 0.3,
        metalness: 0.2
    });

    if (particleType === 'linear_photon') {
        mat.onBeforeCompile = function (shader) {
            shader.uniforms.uTime = { value: 0 };
            mat.userData.shader = shader; // Save reference so we can update uTime in animate()

            shader.vertexShader = `
                varying float vTrackPos;
            ` + shader.vertexShader;

            shader.vertexShader = shader.vertexShader.replace(
                `#include <uv_vertex>`,
                `#include <uv_vertex>
                vTrackPos = uv.x;`
            );

            shader.fragmentShader = `
                uniform float uTime;
                varying float vTrackPos;
            ` + shader.fragmentShader;

            shader.fragmentShader = shader.fragmentShader.replace(
                `#include <dithering_fragment>`,
                `#include <dithering_fragment>
                float speed = 2.0;
                float packetPos = fract(uTime * speed);
                float dist = abs(vTrackPos - packetPos);
                if (dist > 0.5) dist = 1.0 - dist;
                float packetWidth = 0.15;
                if (dist < packetWidth) {
                    gl_FragColor.a *= smoothstep(packetWidth, packetWidth * 0.2, dist);
                } else {
                    gl_FragColor.a = 0.0;
                }
                `
            );
        };
    }
    return mat;
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
    // Use the continuous sweeping geometry, replacing discrete bricks
    const pType = isPositron ? 'positron' : 'electron';
    const geometry = createContinuousSweepGeometry(curve, 1024, tubeRadius, true, 0.0, pType);
    const material = createGeonMaterial(isPositron ? -2.0 : 2.0, pType);
    const mesh = new THREE.Mesh(geometry, material);

    if(Array.isArray(pos)) mesh.position.set(...pos);
    else mesh.position.set(0,0,0);
    mesh.userData = {
        type: isPositron ? 'positron' : 'electron',
        rotationSpeed: { x: 0, y: 0, z: 0 }, // Removed rigid spin; mechanics are now strictly light propagation
        baseRadius: radius
    };

    addFieldVectors(mesh, 'mobius', { radius, tubeRadius });
    scene.add(mesh);
    currentMeshes.push(mesh);
    return mesh;
}

function renderLinearPhoton(length=10, amplitude=1, pos=[0,0,0], isCircular=false) {
    const curve = new LinearPhotonCurve(length);

    // In Light Mode, longer wavelengths disperse (spherical dilation P_exp).
    // Shorter wavelengths punch a tighter linear tunnel (high E Vacuum Crush).
    // Here we map SIM_STATE.lightWavelength to the expansionRate.
    const expansionRate = (SIM_STATE.lightMode) ? SIM_STATE.lightWavelength * 0.05 : 0.0;

    // Free Propagating Light uses the linear sweep logic but forces twisting for circular polarization
    const geometry = createContinuousSweepGeometry(curve, 1024, amplitude, false, expansionRate, 'linear_photon');

    const waveFreq = 100.0 / (SIM_STATE.lightWavelength * 10.0);
    const material = createGeonMaterial(waveFreq, 'linear_photon');
    const mesh = new THREE.Mesh(geometry, material);

    if(Array.isArray(pos)) mesh.position.set(...pos);
    else mesh.position.set(0,0,0);
    mesh.userData = { type: 'linear_photon', length, amplitude, origin: pos, curveType: 'linear' };

    addFieldVectors(mesh, 'linear', { length, amplitude });
    scene.add(mesh);
    currentMeshes.push(mesh);
    return mesh;
}

function renderProton(radius=2, tubeRadius=0.4, pos=[0,0,0], isNeutral=false, isAntimatter=false) {
    const curve = new TrefoilCurve(radius, tubeRadius);

    let pType = 'proton';
    if (isNeutral) pType = 'neutron';
    if (isAntimatter) pType = 'antiproton';

    // AAA Refinement: Trefoil requires 512 samples for smooth geometry
    const geometry = createContinuousSweepGeometry(curve, 512, tubeRadius, true, 0.0, pType);
    const material = createGeonMaterial(3.0, pType);
    const mesh = new THREE.Mesh(geometry, material);

    if(Array.isArray(pos)) mesh.position.set(...pos);
    else mesh.position.set(0,0,0);

    mesh.userData = { type: pType, rotationSpeed: { x: 0.05, y: 0.2, z: 0.05 } };

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

// Helper to construct densely packed atomic nuclei (FCC Lattice approximation)
function packNucleus(numProtons, numNeutrons, baseScale=0.5) {
    const nucleusGroup = new THREE.Group();
    const totalNucleons = numProtons + numNeutrons;

    let pCount = 0;
    let nCount = 0;

    const spacing = baseScale * 2.2;
    let shell = 0;
    let placed = 0;

    // Generate Face-Centered Cubic (FCC) lattice coordinates
    const coords = [];
    if(totalNucleons === 1) {
        coords.push([0,0,0]);
    } else {
        coords.push([0,0,0]); // Center
        while(coords.length < totalNucleons) {
            shell++;
            for(let x = -shell; x <= shell; x++) {
                for(let y = -shell; y <= shell; y++) {
                    for(let z = -shell; z <= shell; z++) {
                        // FCC Condition: x+y+z must be even
                        if (Math.abs(x) + Math.abs(y) + Math.abs(z) <= shell * 2 && (Math.abs(x)+Math.abs(y)+Math.abs(z)) % 2 === 0) {
                            // Check if already exists (simplistic check)
                            const exists = coords.some(c => c[0]===x && c[1]===y && c[2]===z);
                            if(!exists && coords.length < totalNucleons) {
                                coords.push([x,y,z]);
                            }
                        }
                    }
                }
            }
        }
    }

    // Sort coords by distance to origin to pack from center outwards
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
const inputCamSens = document.getElementById('cam-sens');
const camSensVal = document.getElementById('cam-sens-val');
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
        // Length 40, amplitude 1.5. Center it nicely ahead of the camera.
        renderLinearPhoton(40, 1.5, [-20, 0, 0]);
        return;
    }

    if (type === 'vacuum') {
        // Just the starry background
    } else if (type === 'electron') {
        renderElectron(4.0, 0.4);
    } else if (type === 'proton') {
        // Proton (Left)
        renderProton(0.2, 0.05, [-1, 0, 0], false);
        // Neutron (Center)
        renderProton(0.2, 0.05, [0, 0, 0], true);
        // Anti-Proton (Right)
        renderProton(0.2, 0.05, [1, 0, 0], false, true);
    } else if (type === 'hydrogen') {
        packNucleus(1, 0, 0.1);
        addOrbitingElectron(new THREE.Vector3(0,0,0), 15, 2.0, [0, 0, 0]);
    } else if (type === 'deuterium') {
        packNucleus(1, 1, 0.1);
        addOrbitingElectron(new THREE.Vector3(0,0,0), 15, 1.8, [Math.PI/4, 0, 0]);
    } else if (type === 'water') {
        // Central Oxygen 16 (8p, 8n)
        packNucleus(8, 8, 1.0);

        // Hydrogen Bonds (1p each at 104.5 degrees)
        // Distance is ~95.84 pm = 95,840 fm
        const bondLength = SCALE.WATER_BOND;
        const halfAngle = (104.5 / 2) * Math.PI / 180;

        const h1 = packNucleus(1, 0, 1.0);
        h1.position.set(Math.sin(halfAngle) * bondLength, -Math.cos(halfAngle) * bondLength, 0);

        const h2 = packNucleus(1, 0, 1.0);
        h2.position.set(-Math.sin(halfAngle) * bondLength, -Math.cos(halfAngle) * bondLength, 0);

        // Add Cartesian system to show length
        const mat = new THREE.LineBasicMaterial({color: 0xaaaaaa, transparent: true, opacity: 0.5});
        const geo1 = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), h1.position]);
        const geo2 = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), h2.position]);
        const geo3 = new THREE.BufferGeometry().setFromPoints([h1.position, h2.position]);
        const line1 = new THREE.Line(geo1, mat);
        const line2 = new THREE.Line(geo2, mat);
        const line3 = new THREE.Line(geo3, new THREE.LineBasicMaterial({color: 0x88ff88, transparent: true, opacity: 0.5}));
        scene.add(line1, line2, line3);
        currentMeshes.push(line1, line2, line3);

        // 10 Electrons total
        // Inner O shell (2 electrons)
        for(let i=0; i<2; i++) {
            addOrbitingElectron(new THREE.Vector3(0,0,0), SCALE.BOHR_RADIUS * 0.2, 3.0, [Math.random()*Math.PI, Math.random()*Math.PI, 0], true);
        }

        // Outer valence shell dynamically stabilizing
        const sharedCenter = new THREE.Vector3(0, -bondLength * 0.3, 0);
        for(let i=0; i<8; i++) {
            addOrbitingElectron(sharedCenter, SCALE.BOHR_RADIUS * 1.5, 1.5, [Math.random()*Math.PI, Math.random()*Math.PI, 0], true);
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
        // Create an electron and a positron orbiting a common center (Positronium)
        // Set dynamic state initially to false, wait for collision, then unspool.
        const orbitRadius = SCALE.ELECTRON_RADIUS * 10;

        // Electron
        const e1 = renderElectron(SCALE.ELECTRON_RADIUS, SCALE.ELECTRON_TUBE, [-orbitRadius, 0, 0]);
        e1.userData.velocity = [0, 0, 0];
        e1.userData.isPositronium = true;
        e1.userData.angle = Math.PI;
        e1.userData.orbitRadius = orbitRadius;

        // Positron
        const e2 = renderElectron(SCALE.ELECTRON_RADIUS, SCALE.ELECTRON_TUBE, [orbitRadius, 0, 0], true);
        e2.userData.velocity = [0, 0, 0];
        e2.userData.isPositronium = true;
        e2.userData.angle = 0;
        e2.userData.orbitRadius = orbitRadius;

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
        const qScale = SCALE.BOHR_RADIUS * 2; // Making the quasar visually scaled relative to atomic scale
        const coreGeom = new THREE.SphereGeometry(qScale * 0.05, 32, 32);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.85 }); // Slightly transparent to see crushing core
        const bh = new THREE.Mesh(coreGeom, coreMat);
        scene.add(bh);
        currentMeshes.push(bh);

        // Show a crushed nuclear lattice inside the event horizon
        const crushedCore = packNucleus(20, 20, SCALE.PROTON_RADIUS * 0.1);
        crushedCore.scale.set(0.5, 0.5, 0.5); // Pack them very tightly
        // Note: packNucleus already adds to scene and currentMeshes.

        // Accretion disk
        const diskGeom = new THREE.RingGeometry(qScale * 0.08, qScale * 0.25, 64);
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
    } else if (type === 'scattering') {
        // Target Electron (Stationary but spinning its internal field)
        const eRadius = SCALE.ELECTRON_RADIUS;
        const eTube = SCALE.ELECTRON_TUBE;
        const targetElectron = renderElectron(eRadius, eTube, [0, 0, 0]);

        // Incoming Linear Photon (Gamma ray)
        const photonStart = [-eRadius * 5, eRadius * 0.5, 0];
        const photon = renderLinearPhoton(eRadius, eRadius * 0.2, photonStart);

        // Setup scattering kinematics
        photon.userData.isScatteringPhoton = true;
        photon.userData.velocity = [eRadius * 2, 0, 0]; // Fast moving photon
        photon.userData.target = targetElectron;
        photon.userData.scattered = false;

        targetElectron.userData.velocity = [0, 0, 0];
        targetElectron.userData.isScatteredTarget = true;
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
    if(step.cameraPos && !SIM_STATE.lightMode) {
        camera.position.set(step.cameraPos.x, step.cameraPos.y, step.cameraPos.z);
        controls.target.set(0,0,0);
        controls.update();
    } else if (SIM_STATE.lightMode) {
        // Light mode camera setting
        camera.position.set(0, 0, 45);
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

inputCamSens.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    camSensVal.textContent = val.toFixed(1) + 'x';
    controls.panSpeed = val;
    controls.rotateSpeed = val;
    controls.zoomSpeed = val;
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
        camera.position.set(0, 0, 45);
        controls.target.set(0,0,0);
        controls.update();
    } else {
        lightEditorHud.classList.add('hidden');
        const step = tourSteps[currentStepIndex];
        if(step.cameraPos) {
            camera.position.set(step.cameraPos.x, step.cameraPos.y, step.cameraPos.z);
            controls.target.set(0,0,0);
            controls.update();
        }
    }
    // Refresh current step to apply visual override
    window.switchPhenomenon(tourSteps[currentStepIndex].id);
});

inputPolarization.addEventListener('input', (e) => {
    SIM_STATE.lightPolarization = parseInt(e.target.value);
    valPolarization.textContent = SIM_STATE.lightPolarization + '°';
    if(SIM_STATE.lightMode) window.switchPhenomenon(tourSteps[currentStepIndex].id);
});

inputWavelength.addEventListener('input', (e) => {
    SIM_STATE.lightWavelength = parseFloat(e.target.value);
    valWavelength.textContent = SIM_STATE.lightWavelength.toFixed(1);
    if(SIM_STATE.lightMode) window.switchPhenomenon(tourSteps[currentStepIndex].id);
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
    if (v.curveType === 'linear') curveObj = new LinearPhotonCurve(curveParams.length);

    if(curveObj) {
        const point = curveObj.getPoint(v.t);
        const tangent = curveObj.getTangent(v.t);

        // Normal is derivative of tangent, approximate it:
        const t2 = (v.t + 0.001) % 1;
        const tangent2 = curveObj.getTangent(t2);
        const normal = new THREE.Vector3().subVectors(tangent2, tangent).normalize();
        const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();

        // Spin the E and B fields around the Poynting vector (tangent)
        let twistRate = 0;
        if (v.curveType === 'mobius') twistRate = 2;
        if (v.curveType === 'trefoil') twistRate = 3;
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
        composer.render();
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

        // Positronium Orbit and Annihilation Event
        if(mesh.userData.isScatteringPhoton && !mesh.userData.scattered) {
            // Move photon
            mesh.position.x += mesh.userData.velocity[0] * dt;
            mesh.position.y += mesh.userData.velocity[1] * dt;
            mesh.position.z += mesh.userData.velocity[2] * dt;

            // Check collision with target electron
            const target = mesh.userData.target;
            const dist = mesh.position.distanceTo(target.position);

            if(dist < SCALE.ELECTRON_RADIUS * 1.5) {
                mesh.userData.scattered = true;

                // Compton Scattering Kinematics
                // Photon loses energy (longer wavelength, slower perceived speed) and deflects
                mesh.userData.velocity = [
                    mesh.userData.velocity[0] * 0.5,
                    SCALE.ELECTRON_RADIUS * 1.5,
                    0
                ];

                // Electron absorbs momentum and recoils
                target.userData.velocity = [
                    SCALE.ELECTRON_RADIUS * 1.0,
                    -SCALE.ELECTRON_RADIUS * 0.5,
                    0
                ];

                // Rotate the linear photon mesh to match its new trajectory
                const angle = Math.atan2(mesh.userData.velocity[1], mesh.userData.velocity[0]);
                mesh.rotation.z = angle;
            }
        }

        if(mesh.userData.isScatteredTarget && mesh.userData.velocity) {
            mesh.position.x += mesh.userData.velocity[0] * dt;
            mesh.position.y += mesh.userData.velocity[1] * dt;
            mesh.position.z += mesh.userData.velocity[2] * dt;
        }

        if(mesh.userData.isPositronium && !annihilated) {
            const angularVelocity = 0.5;
            const inwardVelocity = SCALE.ELECTRON_RADIUS * 2.0;

            const nextAngle = mesh.userData.angle + dt * angularVelocity;
            const nextRadius = mesh.userData.orbitRadius - dt * inwardVelocity;

            // Calculate next position to look at
            const nextPos = new THREE.Vector3(
                Math.cos(nextAngle) * nextRadius,
                0,
                Math.sin(nextAngle) * nextRadius
            );

            mesh.userData.angle = nextAngle;
            mesh.userData.orbitRadius = nextRadius;

            mesh.position.x = Math.cos(mesh.userData.angle) * mesh.userData.orbitRadius;
            mesh.position.z = Math.sin(mesh.userData.angle) * mesh.userData.orbitRadius;

            // Align orientation of the geometry precisely along the velocity vector
            mesh.lookAt(nextPos);
            // Stand the loops up so they face each other radially while traveling tangentially
            mesh.rotateX(Math.PI / 2);

            // Annihilation Trigger
            if(mesh.userData.orbitRadius < SCALE.ELECTRON_RADIUS * 2) {
                annihilated = true;
                clearScene();
                // Unspool into linear photons (helices to represent propagating twist)
                const hRadius = SCALE.ELECTRON_RADIUS;
                const hTube = SCALE.ELECTRON_TUBE;

                // Represent pure linear gamma radiation jets moving away (not springs)
                const jetLength = SCALE.ELECTRON_RADIUS * 10;
                class LinearJetCurve extends THREE.Curve {
                    getPoint(t, optionalTarget = new THREE.Vector3()) {
                        // Jet propogates along Z axis to conserve the total angular momentum and energy vectors
                        // from the XY plane collision
                        const z = t * jetLength - (jetLength / 2);
                        const wavePhase = t * Math.PI * 20;
                        const x = Math.cos(wavePhase) * hRadius * 0.1; // tight high freq wave
                        const y = Math.sin(wavePhase) * hRadius * 0.1;
                        return optionalTarget.set(x, y, z);
                    }
                }

                // Use the custom discrete vector bricks geometry
                const linearCurve = new LinearJetCurve();
                const g1 = createContinuousSweepGeometry(linearCurve, 128, hTube, false, 0.0, 'linear_photon');
                const m1 = createGeonMaterial(2.0, 'linear_photon');
                const mesh1 = new THREE.Mesh(g1, m1);
                mesh1.userData = { isPhotonJet: true, dir: 1, rotationSpeed: { x: 0, y: 0, z: 5.0 } };
                mesh1.position.set(0, 0, 0);
                scene.add(mesh1);
                currentMeshes.push(mesh1);

                const g2 = createContinuousSweepGeometry(linearCurve, 128, hTube, false, 0.0, 'linear_photon');
                const m2 = createGeonMaterial(-2.0, 'linear_photon');
                const mesh2 = new THREE.Mesh(g2, m2);
                mesh2.userData = { isPhotonJet: true, dir: -1, rotationSpeed: { x: 0, y: 0, z: -5.0 } };
                mesh2.position.set(0, 0, 0);
                scene.add(mesh2);
                currentMeshes.push(mesh2);
            }
        }

        // Handle unspooled photon jets
        if (mesh.userData.isPhotonJet) {
            mesh.position.z += mesh.userData.dir * dt * (SCALE.ELECTRON_RADIUS * 10);
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

        // linear_photon no longer needs CPU updates.
        // Wavelength, Expansion, and Propagation are handled statically by createVectorBricksGeometry
        // and animated by uTime in the fragment shader.

        if(mesh.material && mesh.material.userData && mesh.material.userData.shader) {
            mesh.material.userData.shader.uniforms.uTime.value = time;
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
               if(child.isMesh && child.material && child.material.userData && child.material.userData.shader) {
                   child.material.userData.shader.uniforms.uTime.value = time;
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

        if(orbiter.mesh.material && orbiter.mesh.material.userData && orbiter.mesh.material.userData.shader) {
            orbiter.mesh.material.userData.shader.uniforms.uTime.value = time;
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
    composer.render();
}
animate();

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
    composer.setSize(container.clientWidth, container.clientHeight);
});
