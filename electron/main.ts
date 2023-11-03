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
    { label: "Zeige Speiseplan", click: () => { TrayWindow.get().show() } },
    { label: "Schließen", click: () => { TrayWindow.get().hide() } },
    { label: "Beenden", role: "quit" }
  ])

  tray.setToolTip('Zeige Speiseplan')
  tray.setContextMenu(contextMenu)
  tray.addListener("click", (_e, _r, p) => {

    const options = [p, screen.getCursorScreenPoint(), tray?.getBounds()];

    for (const option of options) {
      if (
        typeof option === "object" &&
        typeof option.x === "number" &&
        typeof option.y === "number" &&
        option.x !== 0 &&
        option.y !== 0 &&
        option.x >= 0 &&
        option.y >= 0
      ) {
        TrayWindow.get().showInPlace(option.x, option.y);
        return;
      }
    }

    TrayWindow.get().show();
  })
})


class TrayWindow extends BrowserWindow {
  private static instance: TrayWindow | null = null;
  private lastOpened: Date = new Date();

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

    // If the window is last opened yesterday, reload the page.
    this.addListener("show", () => {
      this.lastOpened = new Date()
      if (this.lastOpened.getDate() !== new Date().getDate()) {
        this.loadSite()
      }
    })

    this.addListener("blur", () => {
      if (process.platform !== "linux") this.hide()
    })

    this.loadSite()
    // this.webContents.openDevTools()
  }

  loadSite() {
    if (VITE_DEV_SERVER_URL) {
      this.loadURL(VITE_DEV_SERVER_URL)
    } else {
      // this.loadFile('dist/index.html')
      this.loadFile(path.join(process.env.DIST, 'index.html'))
    }
  }

  showInPlace(x: number, y: number) {
    if (this.isVisible()) {
      this.hide();
      return;
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

    const offset = 20;

    let xPosition = Math.max(offset, x - windowSize[0] / 2);
    let yPosition = y > screenSize.height / 2 ? y - windowSize[1] - offset : y + offset;

    xPosition = Math.min(xPosition, screenSize.width - windowSize[0] - offset);
    yPosition = Math.min(yPosition, screenSize.height - windowSize[1] - offset);

    return { x: xPosition, y: yPosition };
  }

  static get() {
    if (!this.instance) {
      this.instance = new TrayWindow()
    }

    return this.instance
  }
}