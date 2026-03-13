const fs = require('fs');

let app = fs.readFileSync('app.js', 'utf8');
app = app.replace("const selectDropdown = document.getElementById('tour-select');\n", "");
app = app.replace(/selectDropdown\.innerHTML[\s\S]*?<\/option>\`\).join\(''\);\n/, "");
app = app.replace("selectDropdown.value = tourSteps[currentStep].id;\n", "");
app = app.replace("selectDropdown.addEventListener('change', (e) => goToStep(parseInt(e.target.value)));\n", "");

fs.writeFileSync('app.js', app);
