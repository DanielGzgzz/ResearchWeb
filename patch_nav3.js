const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf-8');

const targetSection = `
                <!-- Simulation Presets / Analysis Target -->
                <div class="space-y-2">
                    <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex justify-between items-center">
                        Analysis Target
                        <span class="text-blue-500 font-normal">Active</span>
                    </label>
                    <select id="tour-select" class="w-full bg-[#12121a] border border-[#2a2a35] text-sm text-slate-200 rounded block p-2.5 focus:ring-blue-500 focus:border-blue-500 font-mono transition-colors hover:border-[#3a3a45] cursor-pointer outline-none">
                        <!-- Populated by JS -->
                    </select>
                </div>
`;

if (html.includes('id="tour-select"')) {
    html = html.replace(/<!-- Simulation Presets \/ Analysis Target -->[\s\S]*?<\/select>\s*<\/div>/, '');
    fs.writeFileSync('index.html', html);
    console.log("Removed Analysis Target dropdown from index.html");
} else {
    console.log("Could not find Analysis Target section");
}
