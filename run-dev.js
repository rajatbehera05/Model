const { spawn } = require('child_process');
const path = require('path');

console.log('\x1b[32m%s\x1b[0m', '===========================================================');
console.log('\x1b[32m%s\x1b[0m', '  Starting Smart Parking System (Backend + Frontend)');
console.log('\x1b[32m%s\x1b[0m', '  Backend:  http://localhost:5000');
console.log('\x1b[32m%s\x1b[0m', '  Frontend: http://localhost:3000');
console.log('\x1b[32m%s\x1b[0m', '===========================================================\n');

// 1. Start Backend on port 5000
const backend = spawn('node server.js', {
  cwd: path.join(__dirname, 'backend'),
  shell: true,
  stdio: 'inherit'
});

// 2. Start Frontend on port 3000
const frontend = spawn('npm run dev', {
  cwd: path.join(__dirname, 'frontend'),
  shell: true,
  stdio: 'inherit'
});

function cleanup() {
  try { backend.kill(); } catch (e) {}
  try { frontend.kill(); } catch (e) {}
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
