const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');

// Load environment variables if .env file exists in the desktop directory
let targetUrl = 'http://localhost:3000'; // Default local development URL
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/^APP_URL=(.+)$/m);
  if (match && match[1]) {
    targetUrl = match[1].trim();
    console.log(`[SwasthRoute Desktop] Loaded custom APP_URL from .env: ${targetUrl}`);
  }
}

let mainWindow = null;
let splashWindow = null;

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 500,
    height: 350,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
    }
  });

  splashWindow.loadFile(path.join(__dirname, 'splash.html'));
  
  splashWindow.on('closed', () => {
    splashWindow = null;
  });
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    frame: false, // Frameless window for custom premium ERP styling
    show: false,  // Hide initially to prevent visual flickering
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadURL(targetUrl);

  // Intercept internet connection failures to show a premium custom offline screen
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    if (validatedURL === targetUrl && errorCode < 0 && errorCode !== -3) {
      console.log(`[SwasthRoute Desktop] Connection failed (${errorCode}: ${errorDescription}). Loading offline layout.`);
      mainWindow.loadFile(path.join(__dirname, 'offline.html'));

      // Check to see when connection is restored
      const reconnectInterval = setInterval(() => {
        const urlObj = new URL(targetUrl);
        const request = http.request({
          host: urlObj.hostname || 'localhost',
          port: urlObj.port || 80,
          path: '/',
          method: 'GET',
          timeout: 2500
        }, (response) => {
          if (response.statusCode >= 200 && response.statusCode < 400) {
            console.log('[SwasthRoute Desktop] Reconnected successfully. Reloading ERP application...');
            clearInterval(reconnectInterval);
            mainWindow.loadURL(targetUrl);
          }
        });
        request.on('error', () => {
          // Ignore and retry
        });
        request.end();
      }, 5000);

      // Clean up timer if user re-triggers loading manually
      mainWindow.webContents.once('did-start-loading', () => {
        clearInterval(reconnectInterval);
      });
    }
  });

  // Once the page is rendered, close the splash screen and reveal the main window
  mainWindow.once('ready-to-show', () => {
    if (splashWindow) {
      splashWindow.close();
    }
    mainWindow.show();
    mainWindow.focus();
  });

  // Handle window closure
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Function to poll the server port to check if it's active
function checkServerReady(callback) {
  if (!targetUrl.startsWith('http://localhost') && !targetUrl.startsWith('http://127.0.0.1')) {
    // If it's a cloud-hosted URL, proceed immediately without polling
    console.log('[SwasthRoute Desktop] Cloud URL detected. Skipping local port check.');
    callback();
    return;
  }

  // Parse port from local URL
  const urlObj = new URL(targetUrl);
  const port = urlObj.port || 80;
  const hostname = urlObj.hostname || 'localhost';

  const check = () => {
    console.log(`[SwasthRoute Desktop] Checking if local server is active on ${hostname}:${port}...`);
    const request = http.request({
      host: hostname,
      port: port,
      path: '/',
      method: 'GET',
      timeout: 2000
    }, (response) => {
      if (response.statusCode === 200 || response.statusCode === 302) {
        console.log('[SwasthRoute Desktop] Server is online and ready.');
        callback();
      } else {
        setTimeout(check, 1000);
      }
    });

    request.on('error', () => {
      setTimeout(check, 1000);
    });

    request.end();
  };

  check();
}

app.on('ready', () => {
  createSplashWindow();
  
  checkServerReady(() => {
    createMainWindow();
  });
});

// IPC communication endpoints for window controls
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow();
  }
});
