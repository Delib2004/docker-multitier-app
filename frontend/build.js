// Tiny "build" step so the Dockerfile can be a real multi-stage build.
const fs = require('fs');
fs.mkdirSync('dist', { recursive: true });
const html = fs.readFileSync('src/index.html', 'utf8')
  .replace('__BUILD_TIME__', new Date().toISOString());
fs.writeFileSync('dist/index.html', html);
console.log('Built dist/index.html');
