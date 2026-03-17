import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

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
controls.panSpeed = 1.0;
controls.rotateSpeed = 1.0;
controls.zoomSpeed = 1.0;

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

let currentMeshes = [];
let time = 0;
const clock = new THREE.Clock();

// --- GEOMETRY AND MATERIALS ---
// --- TOPOLOGIES ---
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
        // True 4pi twist requires higher frequency vertical oscillation
        // A 4pi Mobius double loop (720 deg twist) is often mapped parametrically
        const z = Math.sin(u * 2) * this.tubeRadius * 1.5;
        // Note: u*2 produces a 4pi (720 degree) twist when mapped along the curve frame
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
        // Standard (3,2)-Torus knot equations
        const x = Math.sin(u) + 2 * Math.sin(2 * u);
        const y = Math.cos(u) - 2 * Math.cos(2 * u);
        const z = -Math.sin(3 * u);
        return optionalTarget.set(x * this.radius * 0.4, y * this.radius * 0.4, z * this.radius * 0.4);
    }
}

class LinearPhotonCurve extends THREE.Curve {
    constructor(length) {
        super();
        this.length = length;
    }
    getPoint(t, optionalTarget = new THREE.Vector3()) {
        return optionalTarget.set(t * this.length - (this.length / 2), 0, 0);
    }

    computeFrenetFrames(segments, closed) {
        const tangents = [];
        const normals = [];
        const binormals = [];
        const twistPerSegment = (Math.PI * 2.0) / segments; // Circular polarization twist

        for (let i = 0; i <= segments; i++) {
            tangents.push(new THREE.Vector3(1, 0, 0));
            const polRad = i * twistPerSegment;
            const n = new THREE.Vector3(0, Math.cos(polRad), Math.sin(polRad));
            normals.push(n);
            const b = new THREE.Vector3().crossVectors(tangents[i], n).normalize();
            binormals.push(b);
        }
        return { tangents, normals, binormals };
    }
}

// EM Field Colors
const COLOR_E_PLUS = new THREE.Color(0x00E676);  // Green
const COLOR_E_MINUS = new THREE.Color(0xD50000); // Red
const COLOR_B_PLUS = new THREE.Color(0x651FFF);  // Purple
const COLOR_B_MINUS = new THREE.Color(0xFFAB00); // Yellow

function getBaseColorForPhase(phase) {
    // Phase corresponds to position around the tube cross-section (0 to 1)
    // 0.25 = E+, 0.75 = E-, 0.0 = B+, 0.5 = B-
    // However, since we are using vertex colors, we just assign pure colors to corners.
    // Let's use logic based on face alignment.
    return new THREE.Color(0xffffff); // This will be calculated per vertex
}

function createVectorBricksGeometry(curve, segments, radius, closed=true) {
    const geom = new THREE.BufferGeometry();
    const positions = [];
    const normals = [];
    const colors = [];

    // U coordinate for propagation phase, V coordinate for azimuth angle
    const uvs = [];

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
        const currentRadius = radius;

        const E = frames.normals[i].clone().normalize().multiplyScalar(currentRadius);
        const B = frames.binormals[i].clone().normalize().multiplyScalar(currentRadius);

        const segmentLength = pt.distanceTo(nextPt);
        const halfThick = T.clone().multiplyScalar(segmentLength * 0.5);

        const E_vis = E.clone();
        const B_vis = B.clone();

        const c0 = pt.clone().add(E_vis).add(B_vis).sub(halfThick); // +E, +B, Back
        const c1 = pt.clone().sub(E_vis).add(B_vis).sub(halfThick); // -E, +B, Back
        const c2 = pt.clone().sub(E_vis).sub(B_vis).sub(halfThick); // -E, -B, Back
        const c3 = pt.clone().add(E_vis).sub(B_vis).sub(halfThick); // +E, -B, Back
        const c4 = pt.clone().add(E_vis).add(B_vis).add(halfThick); // +E, +B, Front
        const c5 = pt.clone().sub(E_vis).add(B_vis).add(halfThick); // -E, +B, Front
        const c6 = pt.clone().sub(E_vis).sub(B_vis).add(halfThick); // -E, -B, Front
        const c7 = pt.clone().add(E_vis).sub(B_vis).add(halfThick); // +E, -B, Front

        const u = i / segments;

        // Helper to add a discrete flat quad
        function addQuad(v0, v1, v2, v3, norm, facePhase, colorTop, colorBottom) {
            // facePhase maps to vUv.y for azimuthal angle.
            // But we actually do color strictly in shader, so let's just pass u and facePhase as uv.x and uv.y

            // Triangle 1
            positions.push(...v0, ...v1, ...v2);
            normals.push(...norm, ...norm, ...norm);
            uvs.push(u, facePhase, u, facePhase, u, facePhase);
            // We use vertex colors as base structural tracking, though shader will override with continuous phase
            colors.push(...colorTop.toArray(), ...colorTop.toArray(), ...colorBottom.toArray());

            // Triangle 2
            positions.push(...v0, ...v2, ...v3);
            normals.push(...norm, ...norm, ...norm);
            uvs.push(u, facePhase, u, facePhase, u, facePhase);
            colors.push(...colorTop.toArray(), ...colorBottom.toArray(), ...colorBottom.toArray());
        }

        const normE = E.clone().normalize();
        const normB = B.clone().normalize();
        const normT = T.clone().normalize();

        // Top face (+E direction) -> Maps to vUv.y = 0.25
        addQuad(c0.toArray(), c3.toArray(), c7.toArray(), c4.toArray(), normE.toArray(), 0.25, COLOR_E_PLUS, COLOR_E_PLUS);

        // Bottom face (-E direction) -> Maps to vUv.y = 0.75
        addQuad(c1.toArray(), c2.toArray(), c6.toArray(), c5.toArray(), normE.clone().negate().toArray(), 0.75, COLOR_E_MINUS, COLOR_E_MINUS);

        // Right face (+B direction) -> Maps to vUv.y = 0.0
        addQuad(c0.toArray(), c1.toArray(), c5.toArray(), c4.toArray(), normB.toArray(), 0.0, COLOR_B_PLUS, COLOR_B_PLUS);

        // Left face (-B direction) -> Maps to vUv.y = 0.5
        addQuad(c3.toArray(), c7.toArray(), c6.toArray(), c2.toArray(), normB.clone().negate().toArray(), 0.5, COLOR_B_MINUS, COLOR_B_MINUS);

        // Back face (-T direction) -> Cap
        addQuad(c0.toArray(), c3.toArray(), c2.toArray(), c1.toArray(), normT.clone().negate().toArray(), 0.0, COLOR_E_PLUS, COLOR_E_MINUS);

        // Front face (+T direction) -> Cap
        addQuad(c4.toArray(), c5.toArray(), c6.toArray(), c7.toArray(), normT.toArray(), 0.0, COLOR_E_PLUS, COLOR_E_MINUS);
    }

    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geom.computeBoundingSphere();

    return geom;
}

function createGeonMaterial(twistFactor) {
    const mat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        side: THREE.DoubleSide,
        roughness: 0.5,
        metalness: 0.1,
    });

    mat.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = { value: 0 };
        shader.uniforms.uTwistFactor = { value: twistFactor };
        shader.uniforms.colorEPlus = { value: COLOR_E_PLUS };
        shader.uniforms.colorEMinus = { value: COLOR_E_MINUS };
        shader.uniforms.colorBPlus = { value: COLOR_B_PLUS };
        shader.uniforms.colorBMinus = { value: COLOR_B_MINUS };

        shader.vertexShader = `
            varying vec2 vUvGeon;
            ${shader.vertexShader}
        `.replace(
            `#include <uv_vertex>`,
            `#include <uv_vertex>
            vUvGeon = uv;`
        );

        shader.fragmentShader = `
            uniform float uTime;
            uniform float uTwistFactor;
            uniform vec3 colorEPlus;
            uniform vec3 colorEMinus;
            uniform vec3 colorBPlus;
            uniform vec3 colorBMinus;
            varying vec2 vUvGeon;

            vec3 getContinuousPhaseColor(float phase) {
                float p = mod(phase, 6.28318530718) / 1.57079632679;
                float f = smoothstep(0.0, 1.0, fract(p));

                if (p < 1.0) {
                    return mix(colorEPlus, colorBPlus, f);
                } else if (p < 2.0) {
                    return mix(colorBPlus, colorEMinus, f);
                } else if (p < 3.0) {
                    return mix(colorEMinus, colorBMinus, f);
                } else {
                    return mix(colorBMinus, colorEPlus, f);
                }
            }

            ${shader.fragmentShader}
        `.replace(
            `vec4 diffuseColor = vec4( diffuse, opacity );`,
            `
            // faceAngle is derived from vUvGeon.y
            float faceAngle = vUvGeon.y * 6.28318530718;

            // Propagation logic
            float propagation = uTime * 20.0;

            // Combine twist, propagation, and local face angle
            float localPhase = vUvGeon.x * uTwistFactor * 6.28318530718 - propagation;
            float phi = localPhase + faceAngle;

            vec3 phaseColor = getContinuousPhaseColor(phi);
            vec4 diffuseColor = vec4( phaseColor, opacity );
            `
        );

        mat.userData.shader = shader;
    };

    return mat;
}

function addDiscreteOutlines(mesh, geometry) {
    const edges = new THREE.EdgesGeometry(geometry, 15);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 1, transparent: true, opacity: 0.8 }));
    mesh.add(line);
}

function addFieldVectors(mesh, curveType, params) {
    const updateVectorGroup = new THREE.Group();

    const eArrow = new THREE.ArrowHelper(new THREE.Vector3(1,0,0), new THREE.Vector3(0,0,0), 1.5, 0x00E676, 0.4, 0.2);
    const bArrow = new THREE.ArrowHelper(new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,0), 1.5, 0x651FFF, 0.4, 0.2);
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

function renderElectron() {
    clearScene();
    const radius = 4.0;
    const tubeRadius = 0.4;
    const curve = new MobiusCurve(radius, tubeRadius);
    const geometry = createVectorBricksGeometry(curve, 100, tubeRadius, true);
    // mathematically 4pi twist = 2.0 twist factor across closed geometry
    const material = createGeonMaterial(2.0);
    const mesh = new THREE.Mesh(geometry, material);
    addDiscreteOutlines(mesh, geometry);

    addFieldVectors(mesh, 'mobius', { radius, tubeRadius });
    scene.add(mesh);
    currentMeshes.push(mesh);

    camera.position.set(0, 0, 10);
    controls.target.set(0, 0, 0);
    controls.update();
}

function renderProton() {
    clearScene();
    const radius = 0.2;
    const tubeRadius = 0.05;
    const curve = new TrefoilCurve(radius, tubeRadius);
    const geometry = createVectorBricksGeometry(curve, 120, tubeRadius, true);
    // mathematically 3 outward lobes = 3.0 twist factor
    const material = createGeonMaterial(3.0);
    const mesh = new THREE.Mesh(geometry, material);
    addDiscreteOutlines(mesh, geometry);

    addFieldVectors(mesh, 'trefoil', { radius, tubeRadius });
    scene.add(mesh);
    currentMeshes.push(mesh);

    camera.position.set(0, 0, 0.5); // Zoomed in massively for sub-femto density
    controls.target.set(0, 0, 0);
    controls.update();
}

function renderPhoton() {
    clearScene();
    const length = 10.0;
    const amplitude = 0.5;
    const curve = new LinearPhotonCurve(length);
    const geometry = createVectorBricksGeometry(curve, 100, amplitude, false);
    const material = createGeonMaterial(10.0); // Spatial wave twist
    const mesh = new THREE.Mesh(geometry, material);
    addDiscreteOutlines(mesh, geometry);

    addFieldVectors(mesh, 'linear', { length, amplitude });
    scene.add(mesh);
    currentMeshes.push(mesh);

    camera.position.set(0, 0, 8);
    controls.target.set(0, 0, 0);
    controls.update();
}

document.getElementById('btn-electron').addEventListener('click', renderElectron);
document.getElementById('btn-proton').addEventListener('click', renderProton);
document.getElementById('btn-photon').addEventListener('click', renderPhoton);

function clearScene() {
    currentMeshes.forEach(obj => {
        scene.remove(obj);
        obj.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
                else child.material.dispose();
            }
        });
    });
    currentMeshes = [];
}

function updateFieldVectors(mesh, timeVal) {
    if(!mesh.userData.vectors) return;

    const v = mesh.userData.vectors;
    const curveParams = v.params;

    // Move vector origin along the curve continuously
    v.t += 0.005;
    if(v.t > 1) v.t -= 1;

    let curveObj;
    if (v.curveType === 'mobius') curveObj = new MobiusCurve(curveParams.radius, curveParams.tubeRadius);
    if (v.curveType === 'trefoil') curveObj = new TrefoilCurve(curveParams.radius, curveParams.tubeRadius);
    if (v.curveType === 'linear') curveObj = new LinearPhotonCurve(curveParams.length);

    if(curveObj) {
        const point = curveObj.getPoint(v.t);
        const tangent = curveObj.getTangent(v.t);

        // Approximate normal
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
    const dt = clock.getDelta();
    time += dt;

    currentMeshes.forEach(mesh => {
        // Only structural rotation is applied to standard mesh.
        // Spin is intrinsically modeled via uTime phase propagation.
        mesh.traverse((child) => {
            if(child.isMesh && child.material && child.material.userData && child.material.userData.shader) {
                child.material.userData.shader.uniforms.uTime.value = time;
            }
        });

        updateFieldVectors(mesh, time);
    });

    controls.update();
    renderer.render(scene, camera);
}

// Initial Render
renderElectron();
animate();

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});
