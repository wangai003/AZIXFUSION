// Suppress deprecation warnings
process.removeAllListeners('warning');
process.on('warning', () => {});

// Start the development server
const { spawn } = require('child_process');

const child = spawn('npm', ['start'], {
  stdio: 'inherit',
  shell: true
});

child.on('close', (code) => {
  console.log(`Development server exited with code ${code}`);
});
