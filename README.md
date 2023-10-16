# Speiseplan Tray
This is a small tray application for the [Speiseplan](https://studentenwerk.sh/de/mensen-in-luebeck?ort=3&mensa=8#mensaplan) of the [Studierendenwerk Schleswig Holstein](https://studentenwerk.sh) for the Mensa in Lübeck's university district. It is written in [TypeScript](https://www.typescriptlang.org/) and [Vue.js](https://vuejs.org/) and uses [Electron](https://www.electronjs.org/) to run as a tray application. \
It builds on top of this [Speiseplan API](https://github.com/Draculente/mensa-api) and is inspired by [this widget](https://github.com/lomenzel/mensa) for KDE Plasma.

![Speiseplan](/srceenshots.png)

## Features
- 📅 View menus for current and next week 
- 🥦 Filter by vegan and vegetarian dishes 
- 🚫 Exclude dishes containing specific allergens 
- ❗ Show allergens without filtering dishes 
- 🌮 Display dishes from Mensa and Cafeteria 
- 🌍 Available for Linux and Windows 
## Local Setup
The following steps will get you up and running with a local development environment. We assume you have Node.js and npm installed:

1. Clone the repo with 
```bash
git clone https://github.com/Importantus/speiseplan-tray.git
```
2. Change into the directory and install dependencies
```bash
cd speiseplan-tray
npm install
```
3. Start the local development server
```bash
npm run dev
```
4. Install and use [gitmoji](#gitmoji) to commit

### Build
Run `npm run build` to build the app for production. The build artifacts will be stored in the `release/` directory.  
However, the build process is configured to run on GitHub Actions and will automatically create a release draft with the build artifacts, so you don't need to run this command yourself. For more information, see [Release](#release).

### Gitmoji

This project uses [gitmoji](https://gitmoji.carloscuesta.me/) to make commits more expressive.

#### Installation

```bash
npm install -g gitmoji-cli
```

#### Initialize as git hook

```bash
gitmoji -i
```


### Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

### Type Support For `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
   1. Run `Extensions: Show Built-in Extensions` from VSCode's command palette
   2. Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.
## Release

When you want to create a new release, follow these steps:

1. Update the version in the project's package.json file (e.g. 1.2.3)
1. Commit that change (`git commit -am v1.2.3`)
1. Tag the commit (`git tag v1.2.3`). Make sure your tag name's format is `v*.*.*` The workflow will use this tag to detect when to create a release
1. Push the changes to GitHub (`git push && git push --tags`)
1. Edit and publish the release draft created by the workflow in GitHub

After building successfully, the action will publish the release artifacts in a new release draft that will be created on GitHub with download links for the app. 

## Similar projects
- [Android Widget](https://github.com/hoppjan/LuebeckMensaWidget) (Android)
- [KDE Plasma Widget](https://github.com/lomenzel/mensa) (Linux with KDE Plasma)

## Known Issues
On some Linux distributions, the positioning of the window is not correct. This can be due to the window manager and/or the used display protocol. If you encounter this issue, please open an issue and provide information about your distribution and window manager.  
With some versions of Windows 10, the same error can occur. Contributions are welcome.
