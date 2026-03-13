const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const regex = /function createContinuousSweepGeometry\(curve, segments, radius, closed=true, expansionRate=0\.0, isCircular=false\)/;
console.log("Match: ", regex.test(code));
