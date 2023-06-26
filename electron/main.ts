import { app, Tray, Menu, BrowserWindow, nativeImage, screen } from 'electron'
import path from 'node:path'

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, '../dist')
process.env.PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')


let tray: Tray | null = null;
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

app.on('window-all-closed', () => {
  console.log('window-all-closed')
})

app.setLoginItemSettings({
  openAtLogin: true,
})

app.whenReady().then(() => {
  const iconFile = process.platform === "win32" ? 'icon.ico' : 'icon.png';
  const icon = nativeImage.createFromPath(path.join(process.env.PUBLIC, iconFile))
  tray = new Tray(icon)

  const contextMenu = Menu.buildFromTemplate([
    { label: "Beenden", role: "quit" },
    { label: "Schließen", click: () => { TrayWindow.get().hide() } },
    { label: "Zeige Speiseplan", click: () => { TrayWindow.get().show() } }
  ])

  tray.setToolTip('Zeige Speiseplan')
  tray.setContextMenu(contextMenu)
  tray.addListener("click", (_e, _r, p) => {

    let bounds = tray?.getBounds();
    const { x, y } = bounds || p || screen.getCursorScreenPoint() || {};

    if (x && y) {
      TrayWindow.get().showInPlace(x, y);
    } else {
      TrayWindow.get().show();
    }
  })
})


class TrayWindow extends BrowserWindow {
  private static instance: TrayWindow | null = null;

  private constructor() {
    super({
      skipTaskbar: true,
      width: 300,
      height: 350,
      frame: false,
      movable: false,
      resizable: false,
      autoHideMenuBar: true,
      backgroundMaterial: "acrylic",
      show: false,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
      }
    })

    this.addListener("closed", () => {
      this.destroy()
      TrayWindow.instance = null
    })

    this.addListener("blur", () => {
      if (process.platform !== "linux") this.hide()
    })

    // Test active push message to Renderer-process.
    this.webContents.on('did-finish-load', () => {
      this?.webContents.send('main-process-message', (new Date).toLocaleString())
    })

    if (VITE_DEV_SERVER_URL) {
      this.loadURL(VITE_DEV_SERVER_URL)
    } else {
      // this.loadFile('dist/index.html')
      this.loadFile(path.join(process.env.DIST, 'index.html'))
    }

    // this.webContents.openDevTools()
  }

  showInPlace(x: number, y: number) {
    if (this.isVisible()) {
      this.hide();
    }
    if (typeof x === "number" && typeof y === "number") {
      try {
        this.setBounds(this.calculatePosition(x, y))
      } catch (err) {
        // ignore
      }
    }
    super.show()
  }

  calculatePosition(x: number, y: number) {
    const windowSize = this.getSize();
    const screenSize = screen.getDisplayNearestPoint({ x: x, y: y }).workAreaSize;

    let xPosition = Math.max(0, x - windowSize[0] / 2);
    let yPosition = y > screenSize.height / 2 ? y - windowSize[1] - 30 : y + windowSize[1] + 30;

    xPosition = Math.min(xPosition, screenSize.width - windowSize[0]);
    yPosition = Math.min(yPosition, screenSize.height - windowSize[1]);

    return { x: xPosition, y: yPosition };
  }

  static get() {
    if (!this.instance) {
      this.instance = new TrayWindow()
    }

    return this.instance
  }
}