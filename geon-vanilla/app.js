import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- DATA: GUIDED TOUR ---
const tourSteps = [
    {
        id: 'vacuum',
        title: '1. The Casimir Vacuum Fluid',
        desc: 'The baseline simulation environment is a hyper-elastic, zero-point tensor fluid, not an empty void. Electromagnetic waves displace this vacuum. Low-energy waves exhibit spherical dilation via macroscopic expansion pressure (P_exp).',
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
        desc: 'A single proton (Trefoil knot) anchoring an electron (Möbius loop) in a geometric orbit via interlocking Casimir shadow fields.',
        math: [
            { label: 'Gravitational Shadowing', expr: 'G = \\frac{P_{vac}\\sigma^{2}}{4\\pi m_{p}^{2}}' },
        ],
        features: ['Central dense Trefoil knot (Proton)', 'Orbital expansive Möbius loop (Electron)', 'Stable atomic equilibrium'],
        cameraPos: { x: 0, y: 0, z: 15 },
    },
    {
        id: 'deuterium',
        title: '5. Deuterium Atom (Heavy Hydrogen)',
        desc: 'A proton and a neutron bound closely together via Strong Force geometric hard-stop repulsion, sharing a single electron orbit. The neutron is a structurally identical Trefoil but phase-shifted to produce a neutral macro-charge.',
        math: [
            { label: 'Nuclear Boundary Repulsion', expr: 'k \\approx 212,600 \\text{ N/fm}' },
        ],
        features: ['Proton-Neutron dual-core', 'Neutron has inverted color topology mapping', 'Stable isotope'],
        cameraPos: { x: 0, y: 0, z: 16 },
    },
    {
        id: 'water',
        title: '6. Water Molecule (H₂O)',
        desc: 'Two hydrogen atoms geometrically bonded to a massive central Oxygen nucleus. The bond angle of 104.5° is derived from the intersecting vacuum fluid pressure gradients.',
        math: [
            { label: 'Nuclear Fusion Hard Stop', expr: '\\Delta A_{shadow} \\approx 0.268 \\text{ fm}^2' }
        ],
        features: ['Composite Oxygen-16 nucleus (16 Trefoils)', 'Asymmetric polar bond structure', 'Geometric origin of the 104.5° angle'],
        cameraPos: { x: 0, y: 0, z: 35 },
    },
    {
        id: 'gold',
        title: '7. The Gold Atom (Au)',
        desc: 'A massive, complex macroscopic composite of 79 Protons and 118 Neutrons forming a deeply shadowed Casimir well, surrounded by interlocking geometric electron shells.',
        math: [
            { label: 'The Gezin Radius', expr: 'R_{gezin} = R_p \\sqrt[3]{\\frac{M}{m_p}}' }
        ],
        features: ['79 Protons / 118 Neutrons', 'Massive shadow well', 'Nearing gravitational collapse boundary'],
        cameraPos: { x: 0, y: 0, z: 60 },
    },
    {
        id: 'annihilation',
        title: '8. Positron-Electron Annihilation',
        desc: 'An electron meets its geometric inverse (the positron). Their opposing Möbius twists cancel, unspooling the confined circular tracks back into pure linear gamma radiation.',
        math: [
            { label: 'Pair Production / Annihilation Threshold', expr: 'E_{crit} = 1.02199 \\text{ MeV}' },
            { label: 'Emitted Photon Wavelength', expr: '\\lambda_{crit} = 1.213 \\text{ pm}' }
        ],
        features: ['Electron (Twist +2)', 'Positron (Twist -2)', 'Unspools into pure linear photons (Sinusoidal waves)'],
        cameraPos: { x: 0, y: 0, z: 25 },
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
let annihilated = false;

function createGeonMaterial(twistFactor, isNeutral=false) {
    // If neutral (e.g. neutron), we map to greys/desaturated colors to show macro neutrality
    const ePlus = isNeutral ? '#88aa88' : '#00ff00';
    const eMinus = isNeutral ? '#aa8888' : '#ff0000';
    const bPlus = isNeutral ? '#8888aa' : '#800080';
    const bMinus = isNeutral ? '#aaaa88' : '#ffff00';

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

function renderProton(radius=2, tubeRadius=0.4, pos=[0,0,0], isNeutral=false) {
    const curve = new TrefoilCurve(radius, tubeRadius);
    const geometry = new THREE.TubeGeometry(curve, 300, tubeRadius, 24, true);
    const material = createGeonMaterial(3.0, isNeutral);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...pos);
    mesh.userData = { type: isNeutral ? 'neutron' : 'proton', rotationSpeed: { x: 0, y: 0.3, z: 0.1 } };
    scene.add(mesh);
    currentMeshes.push(mesh);
    return mesh;
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
    currentMeshes.forEach(obj => {
        scene.remove(obj);
        if (obj.isGroup) {
            obj.children.forEach(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
                    else child.material.dispose();
                }
            });
        } else {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
        }
    });
    currentMeshes = [];
}


// --- UI & INTERACTIVITY (GUIDED TOUR) ---
const docContainer = document.getElementById('documentation');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const progressText = document.getElementById('tour-progress');
const selectDropdown = document.getElementById('tour-select');

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
    progressText.textContent = `Step ${currentStepIndex + 1} / ${tourSteps.length}`;

    // Update Documentation text
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

    setTimeout(renderMathElements, 50);
}

// Global switch function based on step ID
window.switchPhenomenon = (type) => {
    clearScene();
    annihilated = false; // Reset state

    if (type === 'vacuum') {
        // Just the starry background
    } else if (type === 'electron') {
        renderElectron();
    } else if (type === 'proton') {
        renderProton();
    } else if (type === 'hydrogen') {
        renderProton(1.5, 0.3);
        renderElectron(4, 0.15, [0, 0, 0]);
    } else if (type === 'deuterium') {
        renderProton(1.5, 0.3, [0.8, 0, 0]);
        renderProton(1.5, 0.3, [-0.8, 0, 0], true); // Neutron is Neutral
        renderElectron(5, 0.15, [0, 0, 0]);
    } else if (type === 'water') {
        const oxyGroup = new THREE.Group();
        for(let i=0; i<16; i++) {
            const rx = (Math.random() - 0.5) * 3;
            const ry = (Math.random() - 0.5) * 3;
            const rz = (Math.random() - 0.5) * 3;
            const isNeutron = i % 2 === 0;
            const mesh = renderProton(1.0, 0.2, [rx, ry, rz], isNeutron);
            oxyGroup.add(mesh);
        }
        scene.add(oxyGroup);
        currentMeshes.push(oxyGroup);

        renderProton(1.5, 0.3, [6, 4, 0]);
        renderProton(1.5, 0.3, [-6, 4, 0]);
        renderElectron(8, 0.1, [0, 0, 0]);
        renderElectron(10, 0.1, [0, 0, 0]);
    } else if (type === 'gold') {
        for(let i=0; i<50; i++) {
            const r = Math.random() * 8;
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.random() * Math.PI;
            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);
            renderProton(1.2, 0.2, [x,y,z], i%2===0);
        }
        renderElectron(12, 0.1);
        renderElectron(15, 0.1);
        renderElectron(18, 0.1);
    } else if (type === 'annihilation') {
        const curve = new MobiusCurve(2, 0.3);
        const geometry = new THREE.TubeGeometry(curve, 200, 0.3, 16, true);
        const material = createGeonMaterial(-2.0); // Positron has inverse twist (-E mapped differently intrinsically)
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(5, 0, 0);
        mesh.userData = { type: 'positron', rotationSpeed: { x: -0.2, y: -0.5, z: 0 }, velocity: [-0.05, 0, 0] };
        scene.add(mesh);
        currentMeshes.push(mesh);

        const meshE = new THREE.Mesh(geometry, createGeonMaterial(2.0));
        meshE.position.set(-5, 0, 0);
        meshE.userData = { type: 'electron', rotationSpeed: { x: 0.2, y: 0.5, z: 0 }, velocity: [0.05, 0, 0] };
        scene.add(meshE);
        currentMeshes.push(meshE);
    }
};

// Orchestrator
let targetCameraPos = new THREE.Vector3(0, 0, 10);

function goToStep(index) {
    if(index < 0 || index >= tourSteps.length) return;
    currentStepIndex = index;
    const step = tourSteps[currentStepIndex];

    // Ensure UI is updated before switching phenomena, this populates the select box
    // so tests and logic can find the options if goToStep is called during init.
    updateUI();

    window.switchPhenomenon(step.id);

    // Set target camera position for interpolation
    if(step.cameraPos) {
        targetCameraPos.set(step.cameraPos.x, step.cameraPos.y, step.cameraPos.z);
    }
}

// Listeners
btnPrev.addEventListener('click', () => goToStep(currentStepIndex - 1));
btnNext.addEventListener('click', () => goToStep(currentStepIndex + 1));
selectDropdown.addEventListener('change', (e) => goToStep(parseInt(e.target.value)));

// INITIALIZATION
goToStep(0);
// Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta();
    time += dt;

    currentMeshes.forEach(mesh => {
        // Rotations
        if(mesh.userData.rotationSpeed) {
            mesh.rotation.x += mesh.userData.rotationSpeed.x * dt;
            mesh.rotation.y += mesh.userData.rotationSpeed.y * dt;
            mesh.rotation.z += mesh.userData.rotationSpeed.z * dt;
        }

        // Velocity (for annihilation event)
        if(mesh.userData.velocity) {
            mesh.position.x += mesh.userData.velocity[0] * dt * 60; // 60fps baseline
            mesh.position.y += mesh.userData.velocity[1] * dt * 60;
            mesh.position.z += mesh.userData.velocity[2] * dt * 60;

            // Annihilation Trigger
            if(!annihilated && mesh.position.x > -0.5 && mesh.position.x < 0.5) {
                annihilated = true;
                clearScene();
                // Spawn pure gamma radiation replacing the loop
                renderPhotonWave(40, 3, [0,0,0], 'x', false);
                renderPhotonWave(40, 3, [0,0,0], 'x', true);
            }
        }

        // Photon Wave propagation
        if(mesh.userData.type === 'photon') {
            mesh.userData.time += dt * 5;
            const points = [];
            for(let i=0; i<100; i++) {
                let t = i/100 * 40 - mesh.userData.time;
                if(mesh.userData.reverse) t = -i/100 * 40 + mesh.userData.time;
                let p = [0,0,0];
                if(mesh.userData.axis === 'x') p = [t, Math.sin(t)*3, Math.cos(t)*3];
                points.push(new THREE.Vector3(p[0], p[1], p[2]));
            }
            mesh.geometry.setFromPoints(points);
        }

        if(mesh.material && mesh.material.uniforms) {
            mesh.material.uniforms.uTime.value = time;
        }
    });

    // Smooth camera interpolation
    camera.position.lerp(targetCameraPos, 2.0 * dt);

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
