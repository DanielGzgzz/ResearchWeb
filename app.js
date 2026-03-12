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
        desc: 'The baseline simulation environment is a hyper-elastic, zero-point tensor fluid. Electromagnetic waves displace this vacuum. (1 Unit = 1 Femtometer)',
        math: [
            { label: 'Kinematic Action Viscosity', expr: 'h = 6.62607 \times 10^{-34} \text{ kg}\\cdot\\text{m}^2/\\text{s}' },
            { label: 'Gravitation (Casimir Pressure Gradient)', expr: 'G = \\frac{P_{vac}\\sigma^{2}}{4\\pi m_{p}^{2}}' }
        ],
        features: ['Zero-point tensor fluid', 'Geons displace vacuum', 'Geometric shadowing causes gravity'],
        cameraPos: { x: 0, y: 0, z: 1000 },
    },
    {
        id: 'em_linear',
        title: '2. EM Waves: Linear & Polarized',
        desc: 'Linear and polarized electromagnetic waves propagating through the vacuum. Rectangular cross-sections represent the orthogonal points of amplitude of E and B fields.',
        math: [
            { label: 'Linear Propagation', expr: 'E(x,t) = E_0 \\sin(kx - \\omega t)' }
        ],
        features: ['Orthogonal Electric/Magnetic vectors', 'Pure linear propagation', 'Amplitude visualization'],
        cameraPos: { x: 0, y: 0, z: 200 },
    },
    {
        id: 'em_circular',
        title: '3. EM Waves: Circular & Elliptical',
        desc: 'Circularly and elliptically polarized electromagnetic waves where the amplitude cubes rotate around the propagation axis, effectively mapping a continuous Möbius trajectory.',
        math: [
            { label: 'Circular Twist', expr: 'E(z,t) = E_0 (\\cos(kz-\\omega t)\\hat{x} + \\sin(kz-\\omega t)\\hat{y})' }
        ],
        features: ['Rotating rectangular amplitudes', 'Helical spatial projection', 'Möbius loop phase completion'],
        cameraPos: { x: 0, y: 0, z: 200 },
    },
    {
        id: 'leptons',
        title: '4. Leptons: Electron & Positron',
        desc: 'The electron is a circularly polarized wave trapped in a stable quantum orbit. Its inverse geometric chirality forms the Positron.',
        math: [
            { label: 'Structural Radius', expr: 'r = \\frac{\\hbar}{2m_e c} = 193.0796 \\text{ fm}' },
            { label: 'Casimir Confinement', expr: 'F_{vac} = \\frac{\\hbar c}{2r^2}' }
        ],
        features: ['4π (720°) Möbius double-loop', 'Macroscopic 193 fm radius', 'Anti-matter chirality inversion'],
        cameraPos: { x: 0, y: 0, z: 1000 },
    },
    {
        id: 'hadrons',
        title: '5. Hadrons: Proton, Neutron & Antimatter',
        desc: 'Nucleons distribute angular momentum in 3D using a compressed Trefoil knot (0.84 fm). Neutrons are phase-shifted variants. Antimatter inverts the knot chirality.',
        math: [
            { label: 'Resting Radius', expr: 'R_p = \\frac{4\\hbar}{m_p c} = 0.8412 \\text{ fm}' },
            { label: 'Inward Vacuum Pressure', expr: '178,700 \\text{ N}' }
        ],
        features: ['(3,2)-Torus knot (Trefoil)', 'Sub-femtometer density', 'Geometric +1e derivation via twists'],
        cameraPos: { x: 0, y: 0, z: 3.5 },
    },
    {
        id: 'hydrogen',
        title: '6. Atoms: Hydrogen',
        desc: 'A tiny 0.84 fm proton anchoring a 193 fm electron. Bohr radius is ~52,900 fm. Showcases massive orbital scale and Coulomb attraction.',
        math: [
            { label: 'Bohr Orbit', expr: 'a_0 \\approx 52,900 \\text{ fm}' }
        ],
        features: ['Proton core', 'Dynamic orbiting electron', 'Relativistic kinematics'],
        cameraPos: { x: 0, y: 0, z: 120000 },
    },
    {
        id: 'deuterium',
        title: '7. Atoms: Deuterium',
        desc: 'Proton and Neutron tightly bound in an FCC lattice at 2.2 fm. Electron orbits externally.',
        math: [
            { label: 'Nuclear Boundary Repulsion', expr: 'k \\approx 212,600 \\text{ N/fm}' }
        ],
        features: ['Proton/Neutron dual-core', 'Phase-shifted topologies', '52,900 fm physical orbit'],
        cameraPos: { x: 0, y: 0, z: 120000 },
    },
    {
        id: 'water',
        title: '8. Atoms: Water Molecule (H₂O)',
        desc: 'Two hydrogen cores bound dynamically to an Oxygen core. The hydrogens are physically free and interacting via Lorentz forces and EM repulsions.',
        math: [
            { label: 'Lorentz Force', expr: 'F = q(E + v \\times B)' }
        ],
        features: ['Dynamic unbound hydrogens', 'Real-time n-body attracting & repelling', 'Free camera observation'],
        cameraPos: { x: 0, y: 0, z: 250000 },
    },
    {
        id: 'gold',
        title: '9. Atoms: Gold',
        desc: 'A massive Casimir well of 197 packed nucleons (radius ~6 fm). 79 massive electrons dynamically repel in high-density Schrödinger probability clouds.',
        math: [
            { label: 'Relativistic Shell Compression', expr: '\\gamma = \\frac{1}{\\sqrt{1 - (Z\\alpha)^2}}' }
        ],
        features: ['Dense FCC packed core', 'Schrödinger probability trails', 'High relativistic velocities'],
        cameraPos: { x: 0, y: 0, z: 800000 },
    },
    {
        id: 'custom',
        title: '10. Custom Atomic Builder',
        desc: 'Input true nucleon counts. The engine packs the core and spawns electrons that form organic shells via n-body Coulombic repulsion.',
        math: [
            { label: 'Core Packing Volume', expr: 'V = \\frac{4}{3}\\pi (R_p \\sqrt[3]{A})^3' }
        ],
        features: ['Sub-femtometer FCC Core Builder', 'Real-time electron shells', 'Dynamic physical scaling'],
        cameraPos: { x: 0, y: 0, z: 200000 },
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
uniform float isLinear;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

// Helper function to continuously interpolate between 4 colors around a wheel
vec3 getContinuousPhaseColor(float phase) {
    // Normalize phase to 0 -> 4.0
    float p = mod(phase, 6.28318530718) / 1.57079632679;

    // Smoothstep for non-linear, punchy color transitions
    float f = smoothstep(0.0, 1.0, fract(p));

    if (p < 1.0) {
        return mix(colorEPlus, colorBPlus, f);      // +E (Green) -> +B (Purple)
    } else if (p < 2.0) {
        return mix(colorBPlus, colorEMinus, f);     // +B (Purple) -> -E (Red)
    } else if (p < 3.0) {
        return mix(colorEMinus, colorBMinus, f);    // -E (Red) -> -B (Yellow)
    } else {
        return mix(colorBMinus, colorEPlus, f);     // -B (Yellow) -> +E (Green)
    }
}

void main() {
    // vUv.y strictly defines the geometric face angle around the tube
    // 0.25 = +E face (PI/2), 0.75 = -E face (3PI/2)
    // 0.00 = +B face (0),    0.50 = -B face (PI)
    float faceAngle = vUv.y * 6.28318530718;

    // Propagate wave along the length of the tube (vUv.x) via uTime to simulate light speed
    float propagation = uTime * 20.0;

    // Combine structural twist, propagation, and the local face angle to get the absolute field phase
    float localPhase = vUv.x * uTwistFactor * 6.28318530718 - propagation;

    vec3 baseColor;

    if (isLinear > 0.5) {
        // For linear photons, E and B fields are orthogonal and propagate forward
        // They are NOT twisted together.

        // Use vUv.x mapping to alternate colors along the length (like a pure wave propagation)
        // This makes it visible from all angles identically without caring about top/bottom sides.
        // It provides the "rainbow" linear look seen in pure EM waves.

        // This reproduces the getContinuousPhaseColor but using only localPhase (longitudinal), ignoring faceAngle
        baseColor = getContinuousPhaseColor(localPhase);
    } else {
        // The continuous relative phase combines the longitudinal wave phase with the transverse face angle
        float phi = localPhase + faceAngle;
        baseColor = getContinuousPhaseColor(phi);
    }

    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    float diff = max(dot(vNormal, lightDir), 0.0);
    float ambient = 0.3;
    float glow = max(0.0, 1.0 - dot(vNormal, normalize(vec3(0, 0, 1)))) * 0.4;

    vec3 finalColor = baseColor * (diff * 0.7 + ambient) + baseColor * glow;
    gl_FragColor = vec4(finalColor, 1.0);
}`;

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
function createVectorBricksGeometry(curve, segments, radius, closed=true, expansionRate=0.0, isCircular=false) {
    const geom = new THREE.BufferGeometry();
    const positions = [];
    const normals = [];
    const uvs = [];

    // Extract evenly spaced points and their mathematical frames
    const points = curve.getSpacedPoints(segments);
    const frames = curve.computeFrenetFrames(segments, closed);

    for (let i = 0; i < segments; i++) {
        const pt = points[i];
        let nextPt;
        if (!closed && i === segments - 1) {
            nextPt = pt.clone().add(pt.clone().sub(points[i-1]));
        } else {
            nextPt = points[(i + 1) % segments];
        }

        const T = frames.tangents[i];

        // Inverse Square / Spherical Dilation Effect:
        const currentRadius = radius + (i * expansionRate);

        let N = frames.normals[i].clone().normalize();
        let B_vec = frames.binormals[i].clone().normalize();

        if (isCircular) {
            // Physically twist the vectors around the tangent for circular polarization
            const phase = (i / segments) * Math.PI * 8.0; // 4 full rotations
            const cosP = Math.cos(phase);
            const sinP = Math.sin(phase);

            // Rotate N and B_vec around T
            const newN = new THREE.Vector3().addScaledVector(N, cosP).addScaledVector(B_vec, sinP).normalize();
            const newB = new THREE.Vector3().crossVectors(T, newN).normalize();
            N = newN;
            B_vec = newB;
        }

        // Treat mathematically as E (Normal) and B (Binormal) vectors
        // For linear polarized, we want rectangular cross-sections (wide E, thin B to represent amplitude points)
        // If circular, we want them perfectly equal (squares) since amplitude rotates equally

        const E_mag = isCircular ? currentRadius * 1.5 : currentRadius * 2.0;
        const B_mag = isCircular ? currentRadius * 1.5 : currentRadius * 0.2; // Thin in B direction for linear

        const E = N.multiplyScalar(E_mag);
        const B = B_vec.multiplyScalar(B_mag);

        // Create a thin brick (slice) centered at pt, thickness based on segment length
        const segmentLength = pt.distanceTo(nextPt);
        const halfThick = T.clone().multiplyScalar(segmentLength * 0.4); // 80% coverage, 20% gap

        const c0 = pt.clone().add(E).add(B).sub(halfThick); // +E, +B, Back
        const c1 = pt.clone().sub(E).add(B).sub(halfThick); // -E, +B, Back
        const c2 = pt.clone().sub(E).sub(B).sub(halfThick); // -E, -B, Back
        const c3 = pt.clone().add(E).sub(B).sub(halfThick); // +E, -B, Back
        const c4 = pt.clone().add(E).add(B).add(halfThick); // +E, +B, Front
        const c5 = pt.clone().sub(E).add(B).add(halfThick); // -E, +B, Front
        const c6 = pt.clone().sub(E).sub(B).add(halfThick); // -E, -B, Front
        const c7 = pt.clone().add(E).sub(B).add(halfThick); // +E, -B, Front

        const u = i / segments;

        function addQuad(v0, v1, v2, v3, norm, uvY) {
            positions.push(...v0, ...v1, ...v2);
            normals.push(...norm, ...norm, ...norm);
            uvs.push(u, uvY, u, uvY, u, uvY);

            positions.push(...v0, ...v2, ...v3);
            normals.push(...norm, ...norm, ...norm);
            uvs.push(u, uvY, u, uvY, u, uvY);
        }

        const normE = N.clone().normalize();
        const normB = B_vec.clone().normalize();
        const normT = T.clone().normalize();

        // Map faces to Shader E/B color coordinates
        addQuad(c0.toArray(), c3.toArray(), c7.toArray(), c4.toArray(), normE.toArray(), 0.25); // Top (+E)
        addQuad(c1.toArray(), c2.toArray(), c6.toArray(), c5.toArray(), normE.clone().negate().toArray(), 0.75); // Bottom (-E)
        addQuad(c0.toArray(), c1.toArray(), c5.toArray(), c4.toArray(), normB.toArray(), 0.0); // Right (+B)
        addQuad(c3.toArray(), c7.toArray(), c6.toArray(), c2.toArray(), normB.clone().negate().toArray(), 0.5); // Left (-B)
        addQuad(c0.toArray(), c3.toArray(), c2.toArray(), c1.toArray(), normT.clone().negate().toArray(), 0.0); // Back
        addQuad(c4.toArray(), c5.toArray(), c6.toArray(), c7.toArray(), normT.toArray(), 0.0); // Front
    }

    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.computeBoundingSphere();

    return geom;
}

function createGeonMaterial(twistFactor, particleType = 'electron') {
    // Revert to strict E/B field mapping
    const ePlus = '#00ff00';   // Green
    const eMinus = '#ff0000';  // Red
    const bPlus = '#800080';   // Purple
    const bMinus = '#ffff00';  // Yellow

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
            isLinear: { value: particleType === 'linear_photon' ? 1.0 : 0.0 },
        },
        side: THREE.DoubleSide,
        wireframe: SIM_STATE.wireframe,
        transparent: false,
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
        opacity: 0.3
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
    // Use the custom discrete vector bricks geometry
    const geometry = createVectorBricksGeometry(curve, 100, tubeRadius, true);
    const material = createGeonMaterial(isPositron ? -2.0 : 2.0, isPositron ? 'positron' : 'electron');
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


// ----------------------------------------------------------------------------
// CASIMIR VACUUM FLUID VISUALIZATION
// ----------------------------------------------------------------------------
function renderVacuumFluid() {
    // 1. Render the Zero-Point Tensor Fluid (Volumetric Grid of points)
    const range = 40;
    const spacing = 4;
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];

    for ( let x = -range; x <= range; x += spacing ) {
        for ( let y = -range; y <= range; y += spacing ) {
            for ( let z = -range; z <= range; z += spacing ) {
                vertices.push( x, y, z );
                // Faint bluish-white for vacuum modes
                colors.push( 0.2, 0.3, 0.5 );
            }
        }
    }

    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

    const material = new THREE.PointsMaterial( {
        size: 0.15,
        vertexColors: true,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
    });

    const vacuumField = new THREE.Points( geometry, material );
    vacuumField.userData.isVacuumField = true;
    vacuumField.scale.set(3, 3, 3);

    // Add a slight animation to the vacuum modes
    vacuumField.userData.update = function(time) {
        const positions = this.geometry.attributes.position.array;
        const colors = this.geometry.attributes.color.array;
        for ( let i = 0; i < positions.length; i += 3 ) {
            const x = positions[i];
            const y = positions[i+1];
            const z = positions[i+2];

            // Subtle quantum fluctuation
            const fluctuation = Math.sin(x * 0.5 + time * 2.0) * Math.cos(z * 0.5 + time * 1.5) * 0.2;
            positions[i+1] = Math.round(y/spacing)*spacing + fluctuation;

            // Color pulse based on displacement
            colors[i+1] = 0.3 + fluctuation * 0.5; // Green channel
        }
        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.color.needsUpdate = true;
    };

    scene.add( vacuumField );
    currentMeshes.push( vacuumField );

    renderLinearPhoton(6.0, 0.2, 0.05);
}

function renderLinearPhoton(length=10, amplitude=1, pos=[0,0,0], isCircular=false) {
    const curve = new LinearPhotonCurve(length);

    // In Light Mode, longer wavelengths disperse (spherical dilation P_exp).
    // Shorter wavelengths punch a tighter linear tunnel (high E Vacuum Crush).
    // Here we map SIM_STATE.lightWavelength to the expansionRate.
    const expansionRate = (SIM_STATE.lightMode) ? SIM_STATE.lightWavelength * 0.05 : 0.0;

    // Use the exact same discrete vector bricks as the particles
    const geometry = createVectorBricksGeometry(curve, 100, amplitude, false, expansionRate, isCircular);

    // For a linear photon to show spatial waves, the "twistFactor" becomes the number
    // of wavelengths that fit into the geometry.
    // 100 length / (SIM_STATE.lightWavelength * 10) gives a nice number of propagating waves
    const waveFreq = 100.0 / (SIM_STATE.lightWavelength * 10.0);
    const material = createGeonMaterial(waveFreq, 'linear_photon'); // Re-purpose twist for spatial wave freq
    const mesh = new THREE.Mesh(geometry, material);

    if(Array.isArray(pos)) mesh.position.set(...pos);
    else mesh.position.set(0,0,0);

    mesh.userData = { type: 'linear_photon', length, amplitude, origin: pos, curveType: 'linear' };

    addFieldVectors(mesh, 'linear', { length, amplitude });
    scene.add(mesh);
    currentMeshes.push(mesh);
    return mesh;
}

function renderProton(radius=2, tubeRadius=0.4, pos=[0,0,0], isNeutral=false) {
    const curve = new TrefoilCurve(radius, tubeRadius);
    // Use the custom discrete vector bricks geometry
    const geometry = createVectorBricksGeometry(curve, 120, tubeRadius, true);
    const material = createGeonMaterial(3.0, isNeutral ? 'neutron' : 'proton');
    const mesh = new THREE.Mesh(geometry, material);

    if(Array.isArray(pos)) mesh.position.set(...pos);
    else mesh.position.set(0,0,0);

    mesh.userData = { type: isNeutral ? 'neutron' : 'proton', rotationSpeed: { x: 0.05, y: 0.2, z: 0.05 } };

    addFieldVectors(mesh, 'trefoil', { radius, tubeRadius });
    scene.add(mesh);
    currentMeshes.push(mesh);
    return mesh;
}

// Function to generate an electron that physically orbits a central point
function addOrbitingElectron(centerPoint, orbitRadius, orbitSpeed, orbitPlaneRotation, dynamic=false) {
    // Enforce accurate physical scales. Electron is ~230x larger than a proton.
    const eRadius = SCALE.ELECTRON_RADIUS;
    const eTube = SCALE.ELECTRON_TUBE;

    const electron = renderElectron(eRadius, eTube, [0,0,0]);
    // Remove from main static list so it doesn't get standard static rotation mixed up
    currentMeshes.splice(currentMeshes.indexOf(electron), 1);


    // Create thick, additive probability cloud trail
    // We use a large number of overlapping soft points to simulate dense probability distributions over time.
    const trailMax = 2000;
    const trailGeom = new THREE.BufferGeometry();
    const trailPositions = new Float32Array(trailMax * 3);
    trailGeom.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));

    // Additive blending creates bright dense spots where the electron frequently visits
    // Enhanced trail visibility as requested: larger size, higher opacity, longer tail.
    const trailMat = new THREE.PointsMaterial({
        color: 0x4488ff,
        size: 6.0, sizeAttenuation: false, // Make it thick, enveloping the electron path
        transparent: true,
        opacity: 0.3, // Higher opacity to stand out as probability clouds
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
    // If the camera is incredibly far away, we apply a visual logarithmic scale to the nucleus so it's not entirely lost,
    // though the physical coordinates remain tightly packed.
    // Wait, let's just use SCALE.PROTON_RADIUS but visually scale the Group by a factor if we are in a massive scene.
    // Actually, I'll just change the baseScale calls in switchPhenomenon:

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


    // Add a glowing visual marker so the nucleus can be found at immense distances (like 120,000 fm)
    // The marker scales slightly with the nucleus size but guarantees a minimum visible footprint
    const markerGeom = new THREE.SphereGeometry(SCALE.PROTON_RADIUS * 10 * Math.pow(totalNucleons, 1/3), 16, 16);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2, depthWrite: false });
    const marker = new THREE.Mesh(markerGeom, markerMat);
    nucleusGroup.add(marker);

    // If the camera is extremely far, we might still not see the marker, so let's make it conditionally huge
    // depending on the physical scale requested in switchPhenomenon (handled globally by camera distance or just dynamically scaling)
    marker.userData = { isNucleusMarker: true };

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

    if (type === 'vacuum') {
        renderVacuumFluid();
    } else if (type === 'em_linear') {
        // EM Waves: Linear & Polarized
        renderLinearPhoton(100, 10, [-50, 0, 0], false);
    } else if (type === 'em_circular') {
        // EM Waves: Circular & Elliptical
        renderLinearPhoton(100, 10, [-50, 0, 0], true);
    } else if (type === 'leptons') {
        const eRadius = SCALE.ELECTRON_RADIUS;
        // Electron (Left)
        renderElectron(eRadius, eRadius * 0.1, [-eRadius * 2.5, 0, 0], 1, 2.0);
        // Positron (Right, flipped chirality)
        renderElectron(eRadius, eRadius * 0.1, [eRadius * 2.5, 0, 0], -1, 2.0);
    } else if (type === 'hadrons') {
        // Proton (Left)
        renderProton(0.2, 0.05, [-1, 0, 0], false);
        // Neutron (Center)
        renderProton(0.2, 0.05, [0, 0, 0], true);
        // Anti-Proton (Right)
        const ap = renderProton(0.2, 0.05, [1, 0, 0], false);
        ap.userData.rotationSpeed.y *= -1; // Flip chirality for antimatter

    } else if (type === 'hydrogen') {
        packNucleus(1, 0, SCALE.PROTON_RADIUS);
        addOrbitingElectron(new THREE.Vector3(0,0,0), SCALE.BOHR_RADIUS, 2.0, [0, 0, 0]);
    } else if (type === 'deuterium') {
        packNucleus(1, 1, SCALE.PROTON_RADIUS);
        addOrbitingElectron(new THREE.Vector3(0,0,0), SCALE.BOHR_RADIUS, 1.8, [Math.PI/4, 0, 0]);
    } else if (type === 'water') {
        // Central Oxygen 16 (8p, 8n)
        packNucleus(8, 8, SCALE.PROTON_RADIUS);

        // Dynamic unbounded hydrogens
        const bondLength = SCALE.WATER_BOND;
        const halfAngle = (104.5 / 2) * Math.PI / 180;

        // Spawn 10 dynamic electrons
        for(let i=0; i<10; i++) {
            addOrbitingElectron(new THREE.Vector3(0,0,0), SCALE.BOHR_RADIUS * 1.5, 12.0, [Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI], true);
        }

        // Spawn Dynamic Hydrogens as pseudo orbiters but massive
        const h1 = packNucleus(1, 0, SCALE.PROTON_RADIUS);
        h1.position.set(Math.sin(halfAngle) * bondLength, -Math.cos(halfAngle) * bondLength, 0);
        h1.userData = { isDynamicNucleus: true, charge: 1, velocity: new THREE.Vector3(0, 0, 0), mass: 1836 };


        const h2 = packNucleus(1, 0, SCALE.PROTON_RADIUS);
        h2.position.set(-Math.sin(halfAngle) * bondLength, -Math.cos(halfAngle) * bondLength, 0);
        h2.userData = { isDynamicNucleus: true, charge: 1, velocity: new THREE.Vector3(0, 0, 0), mass: 1836 };


    } else if (type === 'gold') {
        // Gold 197 (79 protons, 118 neutrons)
        packNucleus(79, 118, SCALE.PROTON_RADIUS * 0.5);

        // Generate relativistic electron shells
        for(let i=0; i<2; i++) {
            addOrbitingElectron(new THREE.Vector3(0,0,0), SCALE.BOHR_RADIUS * 0.1, 40.0, [Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI], true);
        }

        // Outer shells dynamically populate
        for(let i=0; i<77; i++) {
            const shellDist = SCALE.BOHR_RADIUS * (1 + Math.random()*5);
            const speed = 25.0 / (shellDist / SCALE.BOHR_RADIUS); // Speed drops off with distance
            addOrbitingElectron(new THREE.Vector3(0,0,0), shellDist, speed, [Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI], true);
        }

    } else if (type === 'custom') {
        // Read custom builder values
        const z = parseInt(inputZ.value) || 1;
        const n = parseInt(inputN.value) || 0;
        const e = parseInt(inputE.value) || 1;

        packNucleus(z, n, SCALE.PROTON_RADIUS);

        // Custom Mode: Dynamic electrons with real-time repulsion to form natural shells
        for(let i=0; i<e; i++) {
            const initialRadius = SCALE.BOHR_RADIUS + (Math.random() - 0.5) * SCALE.BOHR_RADIUS * 0.5;
            const initialSpeed = 10.0;
            addOrbitingElectron(new THREE.Vector3(0,0,0), initialRadius, initialSpeed, [Math.random()*Math.PI*2, Math.random()*Math.PI*2, Math.random()*Math.PI*2], true);
        }

        currentOrbiters.forEach(orbiter => {
            orbiter.coreCharge = z;
        });
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
    } else {
        lightEditorHud.classList.add('hidden');
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
        renderer.render(scene, camera);
        return;
    }

    const dt = rawDt * SIM_STATE.speed;
    time += dt;


    // Process dynamic nuclei (Hydrogen protons in Water)
    // Process dynamic nuclei (Hydrogen protons in Water)
    const dynamicNuclei = currentMeshes.filter(m => m.userData.isDynamicNucleus);
    if (dynamicNuclei.length > 0) {
        // Simple N-body integration for nuclei
        const repulsionConst = SCALE.WATER_BOND * 0.5; // Tuning factor for visual stability

        dynamicNuclei.forEach(nuc => {
            let force = new THREE.Vector3(0, 0, 0);

            // Attracted to center (Oxygen)
            const origin = new THREE.Vector3(0, 0, 0);
            const distToCenter = nuc.position.distanceTo(origin);
            const dirToCenter = new THREE.Vector3().subVectors(origin, nuc.position).normalize();

            // EM Spring-like attraction to simulate bonding energy well
            const bondDiff = distToCenter - SCALE.WATER_BOND;
            force.add(dirToCenter.multiplyScalar(bondDiff * 0.05));

            // Repel from other nuclei
            dynamicNuclei.forEach(otherNuc => {
                if (nuc !== otherNuc) {
                    const dist = nuc.position.distanceTo(otherNuc.position);
                    const dir = new THREE.Vector3().subVectors(nuc.position, otherNuc.position).normalize();
                    const repulsion = (repulsionConst * repulsionConst) / (dist * dist + 0.1);
                    force.add(dir.multiplyScalar(repulsion));
                }
            });

            // Interaction with electrons (attraction)
            currentOrbiters.forEach(orb => {
                const dist = nuc.position.distanceTo(orb.mesh.position);
                const dir = new THREE.Vector3().subVectors(orb.mesh.position, nuc.position).normalize();
                const attraction = (repulsionConst * repulsionConst) / (dist * dist + 0.1) * 0.2; // Weak attraction
                force.add(dir.multiplyScalar(attraction));
            });

            // Apply forces
            nuc.userData.velocity.add(force.multiplyScalar(dt / nuc.userData.mass));

            // Damping (simulating radiation resistance / binding limits)
            nuc.userData.velocity.multiplyScalar(0.95);

            // Update position
            nuc.position.addScaledVector(nuc.userData.velocity, dt * 5000); // Scaled for visible speed
        });
    }

    currentMeshes.forEach(mesh => {

        // Rotations        // Rotations
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
                const g1 = createVectorBricksGeometry(linearCurve, 100, hTube, false);
                const m1 = createGeonMaterial(2.0); // e+ (Phase Shifted EM)
                const mesh1 = new THREE.Mesh(g1, m1);
                mesh1.userData = { isPhotonJet: true, dir: 1, rotationSpeed: { x: 0, y: 0, z: 5.0 } };
                mesh1.position.set(0, 0, 0);
                scene.add(mesh1);
                currentMeshes.push(mesh1);

                const g2 = createVectorBricksGeometry(linearCurve, 100, hTube, false);
                const m2 = createGeonMaterial(-2.0); // e- (Phase Shifted EM)
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
