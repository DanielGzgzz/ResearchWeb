const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

// 1. Update the GeonMaterial colors to the strict academic palette and adjust opacity/transparency for flat/matte look.
// We remove the high transparency/glow that was present before and use the new hex codes.
code = code.replace(/const ePlus = '#00ff00';   \/\/ Green\n    const eMinus = '#ff0000';  \/\/ Red\n    const bPlus = '#800080';   \/\/ Purple\n    const bMinus = '#ffff00';  \/\/ Yellow/,
`    const ePlus = '#00E676';   // Mint Green
    const eMinus = '#D50000';  // Crimson Red
    const bPlus = '#651FFF';   // Deep Violet
    const bMinus = '#FFAB00';  // Amber/Yellow`);

// Update fragment shader to remove glow and use flatter shading.
const oldFragShaderRegex = /float ambient = 0\.3;\n    float glow = max\(0\.0, 1\.0 - dot\(vNormal, normalize\(vec3\(0, 0, 1\)\)\)\) \* 0\.4;\n    \n    vec3 finalColor = baseColor \* \(diff \* 0\.7 \+ ambient\) \+ baseColor \* glow;\n    gl_FragColor = vec4\(finalColor, 0\.95\);/;
const newFragShaderCode = `float ambient = 0.5;
    // Flat/matte shading, no artificial glow
    vec3 finalColor = baseColor * (diff * 0.5 + ambient);
    gl_FragColor = vec4(finalColor, 1.0);`;
code = code.replace(oldFragShaderRegex, newFragShaderCode);

// 2. We need to make sure the twist for the Electron is exactly 4*PI (720 degrees).
// In createContinuousSweepGeometry, we handle the twist. Let's look at `isCircular` twist and the twist parameter.
// The user says: "For the Spin-1/2 electron, the engine mathematically forces the square cross-section to rotate by exactly 720° (4π radians) before the loop closes."

// We'll update createContinuousSweepGeometry to accept a `twist` parameter directly, instead of using `isCircular` hardcoding 8.0*PI.
// Currently: `const phase = (i / segments) * Math.PI * 8.0;` in `if (isCircular)`.

code = code.replace(/function createContinuousSweepGeometry\(curve, segments, radius, closed=true, expansionRate=0\.0, isCircular=false\) \{/, 'function createContinuousSweepGeometry(curve, segments, radius, closed=true, expansionRate=0.0, twistAngle=0.0) {');

// Update the circular logic inside createContinuousSweepGeometry:
code = code.replace(/if \(isCircular\) \{[\s\S]*?B_vec = newB;\n        \}/,
`        if (twistAngle !== 0.0) {
            const phase = (i / segments) * twistAngle;
            const cosP = Math.cos(phase);
            const sinP = Math.sin(phase);

            const newN = new THREE.Vector3().addScaledVector(N, cosP).addScaledVector(B_vec, sinP).normalize();
            const newB = new THREE.Vector3().crossVectors(T, newN).normalize();
            N = newN;
            B_vec = newB;
        }`);

// Update E_mag and B_mag logic. For linear, we still want flat amplitude. For twisted (circular/electron), we want a square.
code = code.replace(/const E_mag = isCircular \? currentRadius \* 1\.5 : currentRadius \* 2\.0;\n        const B_mag = isCircular \? currentRadius \* 1\.5 : currentRadius \* 0\.2;/,
`const isSquare = twistAngle !== 0.0;
        const E_mag = isSquare ? currentRadius * 1.5 : currentRadius * 2.0;
        const B_mag = isSquare ? currentRadius * 1.5 : currentRadius * 0.2;`);

// Update the calls to createContinuousSweepGeometry
// In renderElectron:
code = code.replace(/createContinuousSweepGeometry\(curve, 100, tubeRadius, true\);/, 'createContinuousSweepGeometry(curve, 100, tubeRadius, true, 0.0, Math.PI * 4.0);');

// In renderLinearPhoton:
// Currently: const geometry = createContinuousSweepGeometry(curve, 100, amplitude, false, expansionRate, isCircular);
code = code.replace(/const geometry = createContinuousSweepGeometry\(curve, 100, amplitude, false, expansionRate, isCircular\);/,
`const twist = isCircular ? Math.PI * 4.0 : 0.0;
    const geometry = createContinuousSweepGeometry(curve, 100, amplitude, false, expansionRate, twist);`);

// In renderProton:
code = code.replace(/createContinuousSweepGeometry\(curve, 120, tubeRadius, true\);/, 'createContinuousSweepGeometry(curve, 120, tubeRadius, true, 0.0, Math.PI * 4.0);');

// In positronium annihilation photon jets:
code = code.replace(/const g1 = createContinuousSweepGeometry\(linearCurve, 100, hTube, false\);/, 'const g1 = createContinuousSweepGeometry(linearCurve, 100, hTube, false, 0.0, Math.PI * 4.0);');
code = code.replace(/const g2 = createContinuousSweepGeometry\(linearCurve, 100, hTube, false\);/, 'const g2 = createContinuousSweepGeometry(linearCurve, 100, hTube, false, 0.0, Math.PI * 4.0);');

fs.writeFileSync('app.js', code);
