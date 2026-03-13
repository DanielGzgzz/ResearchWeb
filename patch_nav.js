const fs = require('fs');

// 1. Fix app.js
let app = fs.readFileSync('app.js', 'utf8');
// Revert the sed hack
app = app.replace(
  "const topNavBar = document.createElement('div'); topNavBar.id = 'top-nav-bar'; document.body.appendChild(topNavBar);",
  "const topNavBar = document.getElementById('top-nav-bar');"
);

// 2. Fix index.html
let html = fs.readFileSync('index.html', 'utf8');
// Add top-nav-bar to canvas
if (!html.includes('id="top-nav-bar"')) {
    html = html.replace(
        '<!-- In-Canvas Controls Layer -->',
        `<!-- Top Center Nav Bar -->
            <div class="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex bg-[#0c0c14]/80 backdrop-blur-sm border border-[#1e1e24] rounded shadow-lg overflow-hidden" id="top-nav-bar">
            </div>

            <!-- In-Canvas Controls Layer -->`
    );
}

// Remove tour-select dropdown
html = html.replace(
    /<div class="mb-6 relative">[\s\S]*?<\/select>\n\s*<\/div>/,
    ''
);

fs.writeFileSync('app.js', app);
fs.writeFileSync('index.html', html);
