const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Add Fonts to head
const fontLinks = `
    <!-- Academic Typography -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;600&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
`;
html = html.replace(/<link href="style\.css" rel="stylesheet">/, '<link href="style.css" rel="stylesheet">\n' + fontLinks);

// 2. Change font classes on body
html = html.replace(/<body class="bg-\[#050510\] text-slate-200 font-sans overflow-hidden">/, '<body class="bg-[#050510] text-slate-200 overflow-hidden font-inter">');

// 3. Move the navigation dropdown to a top-center segmented bar
// First, extract the options we want for the segmented bar. We will keep the original dropdown in DOM but hidden, and sync it to custom buttons.
const segmentedNav = `
    <div id="top-nav-bar" class="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 flex bg-[#111820]/90 backdrop-blur border border-[#2a2a35] rounded-md shadow-2xl p-1 gap-1">
        <!-- Rendered by JS -->
    </div>
`;
html = html.replace(/<div id="canvas-container" class="absolute inset-0 z-0"><\/div>/, '<div id="canvas-container" class="absolute inset-0 z-0"></div>\n' + segmentedNav);

// 4. Hide the old Analysis Target dropdown area
html = html.replace(/<div class="mb-6">/, '<div class="mb-6 hidden">');

// 5. Add the Landing Screen Overlay
const landingScreen = `
    <div id="landing-screen" class="absolute inset-0 z-50 bg-[#0A0F14] flex flex-col items-center justify-center text-center p-8 transition-opacity duration-700">
        <h1 class="text-4xl md:text-6xl font-bold font-inter tracking-tight mb-4 text-slate-100">The Geon Framework: <span class="text-blue-500">Topological Determinism</span></h1>
        <h2 class="text-lg md:text-xl font-mono text-slate-400 mb-12">Derived from Daniel Gezin | ORCID: 0009-0003-7309-7050</h2>
        <p class="max-w-2xl text-lg text-slate-300 font-inter mb-12 leading-relaxed">
            Replacing probabilistic quantum clouds with deterministic fluid dynamics. Explore the absolute geometric boundaries of mass, charge, and gravity.
        </p>
        <button id="btn-enter-sim" class="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-10 rounded text-lg tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] border border-blue-400">
            Enter Simulation
        </button>
    </div>
`;
html = html.replace(/<body[\s\S]*?>/, '$&\n' + landingScreen);

fs.writeFileSync('index.html', html);

// Update style.css to map font families
let css = fs.readFileSync('style.css', 'utf8');
css = `
.font-inter { font-family: 'Inter', sans-serif; }
.font-mono { font-family: 'Fira Code', monospace; }
` + css;

// Make sure tooltips/guided tour is covered. We will do this by adding some hidden tooltips in HTML that JS will control.
const tooltips = `
    <div id="tooltip-layer" class="absolute inset-0 z-40 pointer-events-none hidden">
        <div id="tooltip-box" class="absolute bg-[#111820]/95 border border-blue-500/50 p-4 rounded shadow-2xl max-w-sm transition-all duration-300 transform scale-90 opacity-0 font-inter text-sm text-slate-200">
            <h3 id="tooltip-title" class="font-bold text-blue-400 mb-2 uppercase tracking-wider text-xs"></h3>
            <p id="tooltip-desc" class="leading-relaxed"></p>
            <div class="mt-4 flex justify-between items-center border-t border-slate-700 pt-3">
                <span id="tooltip-step" class="text-xs font-mono text-slate-500">1/3</span>
                <button id="btn-tooltip-next" class="pointer-events-auto bg-slate-800 hover:bg-slate-700 border border-slate-600 px-3 py-1 rounded text-xs font-bold text-slate-300 transition-colors">Next</button>
            </div>
        </div>
    </div>
`;
let newHtml = fs.readFileSync('index.html', 'utf8');
newHtml = newHtml.replace(/<\/body>/, tooltips + '\n</body>');
fs.writeFileSync('index.html', newHtml);
