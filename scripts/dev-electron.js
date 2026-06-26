const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const host = '127.0.0.1';
const port = process.env.DEV_SERVER_PORT || '8080';
const startUrl = `http://${host}:${port}`;
const binExt = process.platform === 'win32' ? '.cmd' : '';
const vueCli = path.join(__dirname, '..', 'node_modules', '@vue', 'cli-service', 'bin', 'vue-cli-service.js');
const electron = path.join(__dirname, '..', 'node_modules', '.bin', `electron${binExt}`);
const children = [];

function run(command, args, env = {}) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, ...env },
  });
  children.push(child);
  return child;
}

function shutdown(code = 0) {
  children.forEach((child) => {
    if (!child.killed) {
      child.kill();
    }
  });
  process.exit(code);
}

process.on('SIGINT', () => shutdown());
process.on('SIGTERM', () => shutdown());

(async () => {
  run(process.execPath, [
    '--openssl-legacy-provider',
    vueCli,
    'serve',
    '--host',
    host,
    '--port',
    port,
    '--no-progress',
  ]);

  await new Promise((resolve, reject) => {
    const deadline = Date.now() + 60000;
    const check = () => {
      const req = http.get(startUrl, (res) => {
        res.resume();
        resolve();
      });
      req.on('error', () => {
        if (Date.now() > deadline) {
          reject(new Error(`Timed out waiting for ${startUrl}`));
          return;
        }
        setTimeout(check, 500);
      });
      req.setTimeout(1000, () => req.destroy());
    };
    check();
  });

  const electronArgs = ['.'];
  if (process.platform === 'linux') {
    electronArgs.push('--no-sandbox', '--disable-gpu-sandbox');
  }
  run(electron, electronArgs, {
    ELECTRON_START_URL: startUrl,
    ELECTRON_OZONE_PLATFORM_HINT: process.env.ELECTRON_OZONE_PLATFORM_HINT || 'x11',
    LIBGL_ALWAYS_SOFTWARE: process.env.LIBGL_ALWAYS_SOFTWARE || '1',
  }).on('exit', (code) => shutdown(code || 0));
})().catch((error) => {
  console.error(error);
  shutdown(1);
});
