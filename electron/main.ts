import { app, Tray, Menu, BrowserWindow, nativeImage } from 'electron'
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
    TrayWindow.get().showInPlace(p.x, p.y)
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
    this.setBounds({
      x: x + this.getSize()[0] / 2,
      y: y + this.getSize()[1] - 30
    })
    super.show()
  }

  static get() {
    if (!this.instance) {
      this.instance = new TrayWindow()
    }

    return this.instance
  }
}