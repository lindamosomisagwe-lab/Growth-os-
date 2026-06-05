const fs = require('fs');
const content = fs.readFileSync('dashboard-vanilla.html', 'utf8');
const onclicks = [...content.matchAll(/onclick="([^"]+)"/g)].map(m => m[1]);
console.log([...new Set(onclicks)].join('\n'));
