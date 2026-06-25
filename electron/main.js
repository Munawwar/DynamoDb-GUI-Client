const { app, BrowserWindow, ipcMain, shell } = require('electron');
const { execFile } = require('child_process');
const path = require('path');

const awsBin = process.platform === 'win32' ? 'aws.cmd' : 'aws';
const desktopName = 'com.dynamodb.guiclient';
const appIcon = path.join(__dirname, '..', 'build', 'icons', '512x512.png');
const isDevelopment = !app.isPackaged && !!process.env.ELECTRON_START_URL;

app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');
if (process.platform === 'linux') {
  app.setDesktopName(desktopName);
}

function runAws(args) {
  return new Promise((resolve, reject) => {
    execFile(awsBin, args, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error((stderr || stdout || error.message).trim()));
        return;
      }
      resolve(stdout.trim());
    });
  });
}

async function getProfileRegion(name) {
  return runAws(['configure', 'get', 'region', '--profile', name]).catch(() => '');
}

async function getProfileValue(name, key) {
  return runAws(['configure', 'get', key, '--profile', name]).catch(() => '');
}

async function listProfiles() {
  const stdout = await runAws(['configure', 'list-profiles']);
  const profiles = stdout.split('\n').map((value) => value.trim()).filter(Boolean);
  const resolved = await Promise.all(
    profiles.map(async (name) => {
      const [region, ssoSession, ssoStartUrl] = await Promise.all([
        getProfileRegion(name),
        getProfileValue(name, 'sso_session'),
        getProfileValue(name, 'sso_start_url'),
      ]);
      return ssoSession || ssoStartUrl ? { name, region } : null;
    }),
  );
  return resolved.filter(Boolean);
}

async function resolveProfile(_, name) {
  if (!name) {
    throw new Error('Select an AWS profile first.');
  }
  const [region, exported] = await Promise.all([
    getProfileRegion(name),
    runAws(['configure', 'export-credentials', '--profile', name, '--format', 'process']),
  ]);
  if (!region) {
    throw new Error(`Profile "${name}" has no region configured.`);
  }
  const credentials = JSON.parse(exported);
  return {
    name,
    region,
    accessKeyId: credentials.AccessKeyId,
    secretAccessKey: credentials.SecretAccessKey,
    sessionToken: credentials.SessionToken,
    expiration: credentials.Expiration,
  };
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1100,
    minHeight: 700,
    show: true,
    autoHideMenuBar: true,
    backgroundColor: '#121820',
    icon: appIcon,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.once('ready-to-show', () => win.show());
  win.webContents.once('did-finish-load', () => {
    if (!win.isVisible()) {
      win.show();
    }
    win.focus();
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (isDevelopment) {
    win.loadURL(process.env.ELECTRON_START_URL);
    return;
  }
  win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
}

app.whenReady().then(() => {
  ipcMain.handle('aws:list-profiles', listProfiles);
  ipcMain.handle('aws:resolve-profile', resolveProfile);
  createWindow();

  app.on('activate', () => {
    if (!BrowserWindow.getAllWindows().length) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
