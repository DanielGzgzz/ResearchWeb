// Particle Simulation Core
let scene, camera, renderer;

// Custom Curves
class TrefoilCurve extends THREE.Curve {
    constructor(radius = 1, scaleZ = 1) {
        super();
        this.radius = radius;
        this.scaleZ = scaleZ;
    }
    getPoint(t, optionalTarget = new THREE.Vector3()) {
        const u = t * Math.PI * 2;
        const x = this.radius * (Math.sin(u) + 2 * Math.sin(2 * u));
        const y = this.radius * (Math.cos(u) - 2 * Math.cos(2 * u));
        const z = this.radius * (-Math.sin(3 * u)) * this.scaleZ;
        return optionalTarget.set(x, y, z);
    }
}

class MobiusCurve extends THREE.Curve {
    constructor(radius = 1) {
        super();
        this.radius = radius;
    }
    getPoint(t, optionalTarget = new THREE.Vector3()) {
        const u = t * Math.PI * 4;
        const x = this.radius * Math.cos(u/2);
        const y = this.radius * Math.sin(u/2);
        const z = 0;
        return optionalTarget.set(x, y, z);
    }
}

function init() {
    const container = document.getElementById('canvas-container');
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    const aspect = window.innerWidth / window.innerHeight;
    const d = 12; // Controls overall zoom, 12 fits 3x3 well
    camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);

    camera.position.set(0, 0, 100);
    camera.lookAt(scene.position);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    buildGrid();

    window.addEventListener('resize', onWindowResize, false);
    renderer.render(scene, camera);
}

function onWindowResize() {
    const aspect = window.innerWidth / window.innerHeight;
    const d = 12;
    camera.left = -d * aspect;
    camera.right = d * aspect;
    camera.top = d;
    camera.bottom = -d;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
}

function createDiscreteGeometry(curve, segments, radius, twistPhase=0) {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const colorObj = new THREE.Color();

    // We compute Frenet frames natively
    const frames = curve.computeFrenetFrames(segments, true);

    for (let i = 0; i < segments; i++) {
        const t0 = i / segments;
        const t1 = (i + 1) / segments;

        const p0 = curve.getPoint(t0);
        const p1 = curve.getPoint(t1);

        // Manual twist rotation to match reference image structure
        const angle0 = t0 * Math.PI * twistPhase;
        const angle1 = t1 * Math.PI * twistPhase;

        let n0 = frames.normals[i].clone();
        let b0 = frames.binormals[i].clone();
        let n1 = frames.normals[(i + 1) % segments].clone();
        let b1 = frames.binormals[(i + 1) % segments].clone();

        // Apply twist
        n0.applyAxisAngle(frames.tangents[i], angle0);
        b0.applyAxisAngle(frames.tangents[i], angle0);
        n1.applyAxisAngle(frames.tangents[(i + 1) % segments], angle1);
        b1.applyAxisAngle(frames.tangents[(i + 1) % segments], angle1);

        const v00 = new THREE.Vector3().copy(p0).addScaledVector(n0, radius).addScaledVector(b0, radius);
        const v01 = new THREE.Vector3().copy(p0).addScaledVector(n0, -radius).addScaledVector(b0, radius);
        const v02 = new THREE.Vector3().copy(p0).addScaledVector(n0, -radius).addScaledVector(b0, -radius);
        const v03 = new THREE.Vector3().copy(p0).addScaledVector(n0, radius).addScaledVector(b0, -radius);

        const v10 = new THREE.Vector3().copy(p1).addScaledVector(n1, radius).addScaledVector(b1, radius);
        const v11 = new THREE.Vector3().copy(p1).addScaledVector(n1, -radius).addScaledVector(b1, radius);
        const v12 = new THREE.Vector3().copy(p1).addScaledVector(n1, -radius).addScaledVector(b1, -radius);
        const v13 = new THREE.Vector3().copy(p1).addScaledVector(n1, radius).addScaledVector(b1, -radius);

        // Map segment color
        colors.push(0,0,0); // placeholder, will use vertex shader for gradient

        function addQuad(pA, pB, pC, pD) {
            positions.push(pA.x, pA.y, pA.z);
            positions.push(pB.x, pB.y, pB.z);
            positions.push(pC.x, pC.y, pC.z);

            positions.push(pA.x, pA.y, pA.z);
            positions.push(pC.x, pC.y, pC.z);
            positions.push(pD.x, pD.y, pD.z);
        }

        addQuad(v00, v10, v11, v01);
        addQuad(v01, v11, v12, v02);
        addQuad(v02, v12, v13, v03);
        addQuad(v03, v13, v10, v00);

        addQuad(v03, v02, v01, v00);
        addQuad(v10, v11, v12, v13);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    // Calculate custom UV for shader phase
    const phaseUvs = [];
    for(let i=0; i < positions.length/3; i++){
        // Roughly derive t from point index logic: 1 segment = 4 faces * 2 triangles * 3 verts = 24 verts. + 2 caps (2 * 2 * 3 = 12). 36 verts per segment.
        const segIdx = Math.floor(i / 36);
        phaseUvs.push(segIdx / segments);
    }
    geometry.setAttribute('phase', new THREE.Float32BufferAttribute(phaseUvs, 1));

    geometry.computeVertexNormals();
    return geometry;
}

function createGeonMaterial(palette) {
    let colorA, colorB, colorC;
    let isElectron = palette === 'electron' ? 1.0 : 0.0;

    // Electron: Purple to Blue
    if (palette === 'electron') {
        colorA = 'vec3(0.5, 0.0, 1.0)'; // Purple
        colorB = 'vec3(0.0, 0.2, 1.0)'; // Blue
        colorC = 'vec3(0.6, 0.2, 0.9)'; // Magenta-ish
    }
    // Proton: Red to Orange to Yellow/Grey
    else if (palette === 'proton') {
        colorA = 'vec3(1.0, 0.0, 0.0)'; // Red
        colorB = 'vec3(1.0, 0.5, 0.0)'; // Orange
        colorC = 'vec3(0.8, 0.8, 0.5)'; // Yellow/Grey
    }
    // Neutron: Green to Cyan to Dark Blue
    else {
        colorA = 'vec3(0.5, 1.0, 0.2)'; // Lime Green
        colorB = 'vec3(0.0, 0.8, 0.8)'; // Cyan
        colorC = 'vec3(0.2, 0.2, 0.6)'; // Dark Blue
    }

    return new THREE.ShaderMaterial({
        vertexShader: `
            attribute float phase;
            varying float vPhase;
            void main() {
                vPhase = phase;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying float vPhase;
            void main() {
                vec3 cA = ${colorA};
                vec3 cB = ${colorB};
                vec3 cC = ${colorC};
                float isElectron = ${isElectron};

                float t = fract(vPhase);
                vec3 finalColor;

                if (isElectron > 0.5) {
                    if (t < 0.5) {
                        finalColor = mix(cA, cB, smoothstep(0.0, 0.5, t));
                    } else {
                        finalColor = mix(cB, cA, smoothstep(0.5, 1.0, t));
                    }
                } else {
                    if (t < 0.3333) {
                        finalColor = mix(cA, cB, smoothstep(0.0, 0.3333, t));
                    } else if (t < 0.6666) {
                        finalColor = mix(cB, cC, smoothstep(0.3333, 0.6666, t));
                    } else {
                        finalColor = mix(cC, cA, smoothstep(0.6666, 1.0, t));
                    }
                }

                gl_FragColor = vec4(finalColor, 1.0);
            }
        `,
        side: THREE.DoubleSide
    });
}

function addDiscreteOutlines(mesh) {
    // Standard EdgesGeometry
    const edgesGeom = new THREE.EdgesGeometry(mesh.geometry, 30); // 30 deg threshold
    const lineMat = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 1 });
    const lineMesh = new THREE.LineSegments(edgesGeom, lineMat);
    mesh.add(lineMesh);
}

function buildGrid() {
    const spaceX = 8;
    const spaceY = 7;

    const scaleFactor = 1.8;

    // --- ELECTRON ROW (Top) ---
    const eCurve = new MobiusCurve(1.5);
    const eGeom = createDiscreteGeometry(eCurve, 60, 0.3, 2); // 2 full twists for Mobius
    const eMat = createGeonMaterial('electron');

    const eTop = new THREE.Mesh(eGeom, eMat);
    eTop.scale.set(scaleFactor, scaleFactor, scaleFactor);
    eTop.position.set(-spaceX, spaceY, 0);
    // Orient top view correctly

    const eIso = new THREE.Mesh(eGeom, eMat);
    eIso.scale.set(scaleFactor*0.6, scaleFactor*0.6, scaleFactor*0.6);
    eIso.position.set(0, spaceY - 1, 0);
    eIso.rotation.set(Math.PI/4, Math.PI/4, 0); // Isometric roughly

    const eSide = new THREE.Mesh(eGeom, eMat);
    eSide.scale.set(scaleFactor, scaleFactor, scaleFactor);
    eSide.position.set(spaceX, spaceY - 1.5, 0);
    eSide.rotation.set(Math.PI/2, 0, 0); // Side profile

    addDiscreteOutlines(eTop);
    addDiscreteOutlines(eIso);
    addDiscreteOutlines(eSide);

    scene.add(eTop);
    scene.add(eIso);
    scene.add(eSide);


    // --- PROTON ROW (Middle) ---
    const pCurve = new TrefoilCurve(1.0, 0.6); // slight z squash for volume
    const pGeom = createDiscreteGeometry(pCurve, 80, 0.15, 0); // no extra twist, knot provides frame
    const pMat = createGeonMaterial('proton');

    const pTop = new THREE.Mesh(pGeom, pMat);
    pTop.scale.set(scaleFactor*1.2, scaleFactor*1.2, scaleFactor*1.2);
    pTop.position.set(-spaceX, 0, 0);

    const pIso = new THREE.Mesh(pGeom, pMat);
    pIso.scale.set(scaleFactor*0.7, scaleFactor*0.7, scaleFactor*0.7);
    pIso.position.set(0, -1, 0);
    pIso.rotation.set(Math.PI/4, Math.PI/6, 0);

    const pSide = new THREE.Mesh(pGeom, pMat);
    pSide.scale.set(scaleFactor*1.2, scaleFactor*1.2, scaleFactor*1.2);
    pSide.position.set(spaceX, 0, 0);
    pSide.rotation.set(Math.PI/2, 0, 0);

    addDiscreteOutlines(pTop);
    addDiscreteOutlines(pIso);
    addDiscreteOutlines(pSide);

    scene.add(pTop);
    scene.add(pIso);
    scene.add(pSide);


    // --- NEUTRON ROW (Bottom) ---
    // Neutron is identical topology to proton, just different color/phase
    const nCurve = new TrefoilCurve(1.0, 0.6);
    const nGeom = createDiscreteGeometry(nCurve, 80, 0.15, 0);
    const nMat = createGeonMaterial('neutron');

    const nTop = new THREE.Mesh(nGeom, nMat);
    nTop.scale.set(scaleFactor*1.2, scaleFactor*1.2, scaleFactor*1.2);
    nTop.position.set(-spaceX, -spaceY, 0);

    const nIso = new THREE.Mesh(nGeom, nMat);
    nIso.scale.set(scaleFactor*0.7, scaleFactor*0.7, scaleFactor*0.7);
    nIso.position.set(0, -spaceY - 1, 0);
    nIso.rotation.set(Math.PI/4, Math.PI/6, 0);

    const nSide = new THREE.Mesh(nGeom, nMat);
    nSide.scale.set(scaleFactor*1.2, scaleFactor*1.2, scaleFactor*1.2);
    nSide.position.set(spaceX, -spaceY, 0);
    nSide.rotation.set(Math.PI/2, 0, 0);

    addDiscreteOutlines(nTop);
    addDiscreteOutlines(nIso);
    addDiscreteOutlines(nSide);

    scene.add(nTop);
    scene.add(nIso);
    scene.add(nSide);
}

window.onload = init;