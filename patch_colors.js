const fs = require('fs');

let code = fs.readFileSync('app.js', 'utf8');

const newMatFunc = `function createGeonMaterial(palette) {
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
        vertexShader: \`
            attribute float phase;
            varying float vPhase;
            void main() {
                vPhase = phase;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        \`,
        fragmentShader: \`
            varying float vPhase;
            void main() {
                vec3 cA = \${colorA};
                vec3 cB = \${colorB};
                vec3 cC = \${colorC};
                float isElectron = \${isElectron};

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
        \`,
        side: THREE.DoubleSide
    });
}`;

const regex = /function createGeonMaterial\(palette\) \{[\s\S]*?side: THREE\.DoubleSide\n    \}\);\n\}/;
code = code.replace(regex, newMatFunc);

fs.writeFileSync('app.js', code);
