const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

// I am recreating the patch from Step 2 because it seems the old run failed or wasn't applied correctly
// based on my previous grep. This will combine Step 2 (Continuous Volumetric Sweep) and Step 5 (Colors/Topology).

// Replace createVectorBricksGeometry completely with createContinuousSweepGeometry
const oldFuncRegex = /function createVectorBricksGeometry[\s\S]*?return geom;\n}/;

const newFunc = `
function createContinuousSweepGeometry(curve, segments, radius, closed=true, expansionRate=0.0, twistAngle=0.0) {
    const geom = new THREE.BufferGeometry();
    const positions = [];
    const normals = [];
    const uvs = [];

    // Extract evenly spaced points and their mathematical frames using Bishop frame
    const points = curve.getSpacedPoints(segments);
    const frames = computeBishopFrames(curve, segments, closed);

    const ringVertices = [];

    for (let i = 0; i <= segments; i++) {
        const pt = points[i];
        const T = frames.tangents[i];

        // Inverse Square / Spherical Dilation Effect:
        const currentRadius = radius + (i * expansionRate);

        let N = frames.normals[i].clone().normalize();
        let B_vec = frames.binormals[i].clone().normalize();

        if (twistAngle !== 0.0) {
            // Physically twist the vectors around the tangent for circular polarization
            const phase = (i / segments) * twistAngle;
            const cosP = Math.cos(phase);
            const sinP = Math.sin(phase);

            // Rotate N and B_vec around T
            const newN = new THREE.Vector3().addScaledVector(N, cosP).addScaledVector(B_vec, sinP).normalize();
            const newB = new THREE.Vector3().crossVectors(T, newN).normalize();
            N = newN;
            B_vec = newB;
        }

        const isSquare = twistAngle !== 0.0;
        const E_mag = isSquare ? currentRadius * 1.5 : currentRadius * 2.0;
        const B_mag = isSquare ? currentRadius * 1.5 : currentRadius * 0.2; // Thin in B direction for linear

        const E = N.clone().multiplyScalar(E_mag);
        const B = B_vec.clone().multiplyScalar(B_mag);

        // 4 Corners of the rectangle
        const c0 = pt.clone().add(E).add(B); // Top-Right (+E, +B)
        const c1 = pt.clone().add(E).sub(B); // Top-Left (+E, -B)
        const c2 = pt.clone().sub(E).sub(B); // Bottom-Left (-E, -B)
        const c3 = pt.clone().sub(E).add(B); // Bottom-Right (-E, +B)

        ringVertices.push({
            c0, c1, c2, c3, N: N.clone(), B_vec: B_vec.clone()
        });
    }

    function addQuad(v0, v1, v2, v3, norm, u0, u1, uvY) {
        // v0: top-left, v1: top-right, v2: bottom-right, v3: bottom-left (in local face coords)

        // Triangle 1: v0, v2, v1
        positions.push(...v0, ...v2, ...v1);
        normals.push(...norm, ...norm, ...norm);
        uvs.push(u0, uvY, u1, uvY, u1, uvY);

        // Triangle 2: v0, v3, v2
        positions.push(...v0, ...v3, ...v2);
        normals.push(...norm, ...norm, ...norm);
        uvs.push(u0, uvY, u0, uvY, u1, uvY);
    }

    for (let i = 0; i < segments; i++) {
        const r1 = ringVertices[i];
        const r2 = ringVertices[i+1];

        const u0 = i / segments;
        const u1 = (i + 1) / segments;

        // Top Face (+E), normal is N
        // v0: r1.c1, v1: r2.c1, v2: r2.c0, v3: r1.c0
        addQuad(r1.c1.toArray(), r2.c1.toArray(), r2.c0.toArray(), r1.c0.toArray(), r1.N.toArray(), u0, u1, 0.25);

        // Bottom Face (-E), normal is -N
        // v0: r1.c3, v1: r2.c3, v2: r2.c2, v3: r1.c2
        addQuad(r1.c3.toArray(), r2.c3.toArray(), r2.c2.toArray(), r1.c2.toArray(), r1.N.clone().negate().toArray(), u0, u1, 0.75);

        // Right Face (+B), normal is B_vec
        // v0: r1.c0, v1: r2.c0, v2: r2.c3, v3: r1.c3
        addQuad(r1.c0.toArray(), r2.c0.toArray(), r2.c3.toArray(), r1.c3.toArray(), r1.B_vec.toArray(), u0, u1, 0.0);

        // Left Face (-B), normal is -B_vec
        // v0: r1.c2, v1: r2.c2, v2: r2.c1, v3: r1.c1
        addQuad(r1.c2.toArray(), r2.c2.toArray(), r2.c1.toArray(), r1.c1.toArray(), r1.B_vec.clone().negate().toArray(), u0, u1, 0.5);
    }

    // Caps if not closed
    if (!closed) {
        const rStart = ringVertices[0];
        const normStart = frames.tangents[0].clone().negate();
        addQuad(rStart.c1.toArray(), rStart.c0.toArray(), rStart.c3.toArray(), rStart.c2.toArray(), normStart.toArray(), 0, 0, 0.99);

        const rEnd = ringVertices[segments];
        const normEnd = frames.tangents[segments].clone();
        addQuad(rEnd.c0.toArray(), rEnd.c1.toArray(), rEnd.c2.toArray(), rEnd.c3.toArray(), normEnd.toArray(), 1, 1, 0.99);
    }

    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.computeBoundingSphere();

    return geom;
}
`;

code = code.replace(oldFuncRegex, newFunc);

// Update calls to geometry function
code = code.replace(/createVectorBricksGeometry\(curve, 100, tubeRadius, true\);/, 'createContinuousSweepGeometry(curve, 100, tubeRadius, true, 0.0, Math.PI * 4.0);');
code = code.replace(/createVectorBricksGeometry\(curve, 100, amplitude, false, expansionRate, isCircular\);/, 'createContinuousSweepGeometry(curve, 100, amplitude, false, expansionRate, isCircular ? Math.PI * 4.0 : 0.0);');
code = code.replace(/createVectorBricksGeometry\(curve, 120, tubeRadius, true\);/, 'createContinuousSweepGeometry(curve, 120, tubeRadius, true, 0.0, Math.PI * 4.0);');
code = code.replace(/createVectorBricksGeometry\(linearCurve, 100, hTube, false\);/g, 'createContinuousSweepGeometry(linearCurve, 100, hTube, false, 0.0, Math.PI * 4.0);');
code = code.replace(/createVectorBricksGeometry/g, 'createContinuousSweepGeometry'); // catch-all for comments or other


// Update colors to the strict academic palette and adjust opacity/transparency for flat/matte look.
code = code.replace(/const ePlus = '#00ff00';   \/\/ Green\n    const eMinus = '#ff0000';  \/\/ Red\n    const bPlus = '#800080';   \/\/ Purple\n    const bMinus = '#ffff00';  \/\/ Yellow/,
`    const ePlus = '#00E676';   // Mint Green
    const eMinus = '#D50000';  // Crimson Red
    const bPlus = '#651FFF';   // Deep Violet
    const bMinus = '#FFAB00';  // Amber/Yellow`);

// Update fragment shader
const oldFragShaderRegex = /float ambient = 0\.3;\n    float glow = max\(0\.0, 1\.0 - dot\(vNormal, normalize\(vec3\(0, 0, 1\)\)\)\) \* 0\.4;\n    \n    vec3 finalColor = baseColor \* \(diff \* 0\.7 \+ ambient\) \+ baseColor \* glow;\n    gl_FragColor = vec4\(finalColor, 0\.95\);/;
const newFragShaderCode = `float ambient = 0.5;
    // Flat/matte shading, no artificial glow
    vec3 finalColor = baseColor * (diff * 0.5 + ambient);
    gl_FragColor = vec4(finalColor, 1.0);`;
code = code.replace(oldFragShaderRegex, newFragShaderCode);

fs.writeFileSync('app.js', code);
