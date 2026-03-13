const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

// 1. Hook up the landing screen
const landingLogic = `
// --- ONBOARDING & TOOLTIPS ---
const landingScreen = document.getElementById('landing-screen');
const btnEnterSim = document.getElementById('btn-enter-sim');
const topNavBar = document.getElementById('top-nav-bar');
const tooltipLayer = document.getElementById('tooltip-layer');
const tooltipBox = document.getElementById('tooltip-box');
const tooltipTitle = document.getElementById('tooltip-title');
const tooltipDesc = document.getElementById('tooltip-desc');
const tooltipStep = document.getElementById('tooltip-step');
const btnTooltipNext = document.getElementById('btn-tooltip-next');

let currentTooltip = 0;
const tooltips = [
    { title: "The 4π Möbius Electron", desc: "This continuous sweeping loop mathematically confines a 1D photon track into a stable 3D orbit.", pos: { top: '30%', left: '30%' } },
    { title: "Mathematical Coloring", desc: "Notice the strictly orthogonal colors. The faces represent continuous Electric (Green/Red) and Magnetic (Purple/Yellow) gradients.", pos: { top: '30%', left: '50%' } },
    { title: "Simulation Controls", desc: "Use the sliders below to alter the time dilation and camera sensitivity. Use the right panel to read the geometric kinematics.", pos: { top: '70%', left: '70%' } }
];

function showTooltip(index) {
    if (index >= tooltips.length) {
        tooltipLayer.classList.add('hidden');
        tooltipBox.classList.add('opacity-0', 'scale-90');
        return;
    }

    const tip = tooltips[index];
    tooltipTitle.textContent = tip.title;
    tooltipDesc.textContent = tip.desc;
    tooltipStep.textContent = \`\${index + 1}/\${tooltips.length}\`;

    tooltipBox.style.top = tip.pos.top;
    tooltipBox.style.left = tip.pos.left;

    tooltipLayer.classList.remove('hidden');
    // small delay to allow display flex to apply before transition
    setTimeout(() => {
        tooltipBox.classList.remove('opacity-0', 'scale-90');
        tooltipBox.classList.add('opacity-100', 'scale-100');
    }, 50);
}

btnTooltipNext.addEventListener('click', () => {
    tooltipBox.classList.remove('opacity-100', 'scale-100');
    tooltipBox.classList.add('opacity-0', 'scale-90');
    setTimeout(() => {
        currentTooltip++;
        showTooltip(currentTooltip);
    }, 300);
});

btnEnterSim.addEventListener('click', () => {
    landingScreen.style.opacity = '0';
    setTimeout(() => {
        landingScreen.classList.add('hidden');
        // Start the tour on the first step
        goToStep(3); // Jump to electron for the tour as per user request context
        showTooltip(0);
    }, 700);
});

// Segmented Nav logic
function buildSegmentedNav() {
    topNavBar.innerHTML = '';
    // Let's pick 4 key steps to highlight in the top bar
    const highlightIds = ['em_linear', 'leptons', 'hadrons', 'water'];
    const navItems = tourSteps.filter(s => highlightIds.includes(s.id));

    navItems.forEach(step => {
        const btn = document.createElement('button');
        const origIdx = tourSteps.findIndex(s => s.id === step.id);

        btn.className = \`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all font-mono \${currentStepIndex === origIdx ? 'bg-blue-600/30 text-blue-400 border border-blue-500/50' : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e1e24]'}\`;

        // Strip number prefix for cleaner nav
        btn.textContent = step.title.replace(/^[0-9]+\.\s*/, '').replace(/Atoms: /, '').replace(/EM Waves: /, '').replace(/Leptons: /, '').replace(/Hadrons: /, '');

        btn.onclick = () => goToStep(origIdx);
        topNavBar.appendChild(btn);
    });
}
`;

code = code.replace(/\/\/ --- UI & INTERACTIVITY \(ENGINE CONTROLS\) ---/, '// --- UI & INTERACTIVITY (ENGINE CONTROLS) ---\n' + landingLogic);

// Call buildSegmentedNav in updateUI
code = code.replace(/docContainer\.innerHTML = html;/, 'docContainer.innerHTML = html;\n    buildSegmentedNav();');

// 2. Update the copy to include the Bishop Loop EM Architecture
// Add a function to render the static copy below the dynamic step copy
const staticCopy = `
<div class="mt-8 border-t border-[#2a2a35] pt-6 font-inter">
    <h2 class="text-[13px] font-bold text-white mb-2 uppercase tracking-widest border-b border-[#2a2a35] pb-2">Abandoning the Point-Particle: The Volumetric Sweep</h2>
    <p class="text-slate-400 text-[11px] leading-relaxed mb-4">Standard physics visualizes the electron as a zero-dimensional point or a smeared probability cloud. The Geon framework mathematically confines the electron as a one-dimensional photon track wrapped into a stable, continuous orbit. To accurately simulate this in 3D space, this engine abandons standard particle emitters and relies on a strict Parametric Volumetric Sweep governed by four absolute geometric rules.</p>

    <div class="space-y-4">
        <div>
            <h3 class="text-[11px] font-bold text-blue-400 mb-1">1. The Closed Loop (The Poynting Guide)</h3>
            <p class="text-slate-400 text-[11px] leading-relaxed">An electromagnetic wave propagates along its directional energy flux, governed by the Poynting vector ($\\vec{S}$). In a Geon, this vector does not travel in a straight line; it catches its own tail. The engine generates a 1D base curve—a perfect circle for the electron, or a (3,2)-Torus knot (Trefoil) for the nucleons —which acts as the absolute center-line of the track.</p>
        </div>
        <div>
            <h3 class="text-[11px] font-bold text-blue-400 mb-1">2. The Bishop Frame (Parallel Transport)</h3>
            <p class="text-slate-400 text-[11px] leading-relaxed">To extrude a 3D volume along a complex looping path, standard 3D rendering relies on the Frenet-Serret frame. However, Frenet frames calculate the normal vector using the second derivative of the curve, causing the entire 3D mesh to violently pinch and flip $180^\\circ$ at mathematical inflection points. To preserve the flawless topological continuity of the vacuum seal, this simulation utilizes a Bishop Frame (Parallel Transport). This ensures the geometric canvas glides smoothly around the entire loop without ever twisting upon itself.</p>
        </div>
        <div>
            <h3 class="text-[11px] font-bold text-blue-400 mb-1">3. The 4-Corner Electromagnetic Boundary</h3>
            <p class="text-slate-400 text-[11px] leading-relaxed">The physical "thickness" of the light track is not arbitrary. It is defined by the absolute amplitude boundaries of the orthogonal electric ($\\vec{E}$) and magnetic ($\\vec{B}$) fields. Instead of sweeping a high-poly cylinder, the engine sweeps a rigid 2D square along the Bishop frame. The four corners of this square represent the strict maximum flux boundaries of the $\\vec{E}$ and $\\vec{B}$ gradients, rendering the wave as a solid, permanent topological displacement in the Casimir fluid.</p>
        </div>
        <div>
            <h3 class="text-[11px] font-bold text-blue-400 mb-1">4. The $4\\pi$ Möbius Twist (Circular Polarization)</h3>
            <p class="text-slate-400 text-[11px] leading-relaxed">As the wave propagates, the orthogonal electric and magnetic fields continuously twist around the propagation axis due to circular polarization. For the Spin-1/2 electron, the engine mathematically forces the square cross-section to rotate by exactly $720^\\circ$ ($4\\pi$ radians) before the loop closes. When traced along a closed circular orbit, this twist mechanically creates the $4\\pi$ Möbius boundary. This absolute topological inversion forces the electric vectors to point inward on one hemisphere and outward on the other, generating the net volumetric displacement that we perceive as "charge."</p>
        </div>
    </div>
</div>
`;

code = code.replace(/<div class="mt-1 space-y-2">[\s\S]*?<\/div>\n    `;/, `$&
    html += \`${staticCopy}\`;
`);


fs.writeFileSync('app.js', code);
