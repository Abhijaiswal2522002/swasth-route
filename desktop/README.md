# SwasthRoute Pharmacy ERP Desktop Wrapper

This directory contains a standalone, fully self-contained Electron application wrapper designed to wrap the SwasthRoute web interface (Pharmacy ERP, Patient Portal, and Rider dashboard) into a native desktop shell (`swasthroute.exe`).

By isolating these files to this directory, you can easily copy this folder into a brand-new repository to compile and package your desktop client separately without affecting the core web repository!

---

## 📂 Project Structure

- `main.js`: Main Electron controller handling loading splash screen toggles, local port checking, and custom window management.
- `preload.js`: Secure bridge script exposing IPC window operations (minimize, maximize, close) to the web view.
- `splash.html`: Premium dark-themed launch splash screen with CSS animations.
- `package.json`: Independent NPM script definitions and `electron-builder` compilation options for compiling to a standalone `.exe` file.

---

## 🚀 How to Run and Package

### 1. Prerequisite
Ensure you have Node.js (version 18 or above) installed on your system.

### 2. Installation
Navigate into this folder and install dependencies:
```bash
npm install
```

### 3. Run Locally (Development)
You can run the desktop shell pointing either to your local Next.js frontend (default `http://localhost:3000`) or a cloud hosted URL.

#### Option A: Running with Local Frontend
1. Start your local web servers in the parent directory (`npm run dev` or `npm run build && npm run start`).
2. Inside this `/desktop` folder, run:
   ```bash
   npm start
   ```
   *Note: Electron will open a splash screen and automatically wait for your local port `3000` to be online before displaying the main SwasthRoute application.*

#### Option B: Pointing to Cloud-Hosted Production URL
If you want the desktop application to connect directly to a live website:
1. Create a file named `.env` inside this `/desktop` directory.
2. Add your hosted app URL:
   ```env
   APP_URL=https://swasthroute-yourdomain.com
   ```
3. Run the desktop wrapper:
   ```bash
   npm start
   ```
   *Note: Since it is a cloud URL, the client will skip local port checking and load the live website instantly.*

### 4. Build and Compile to Standalone Executable (`swasthroute.exe`)
To package this app into a single `.exe` file for Windows:
```bash
npm run build
```
This script runs `electron-builder`. It will compile the desktop wrapper and generate a standalone installation package (`.exe` file) located inside the newly created `/desktop/dist` folder!

---

## 🎨 Implementing Custom Window Controls (Minimize / Maximize / Close)
Since the window uses a frameless wrapper for a modern enterprise layout, you can add custom controls directly inside your web UI headers/navbars!

To connect button click handlers in your React/Next.js pages:
```javascript
// Check if running inside Electron context
const isElectron = typeof window !== 'undefined' && 'electronAPI' in window;

const handleMinimize = () => {
  if (isElectron) {
    (window as any).electronAPI.minimize();
  }
};

const handleMaximize = () => {
  if (isElectron) {
    (window as any).electronAPI.maximize();
  }
};

const handleClose = () => {
  if (isElectron) {
    (window as any).electronAPI.close();
  }
};
```
These functions map directly to the secure preloaded bridge exposed in `preload.js`.
