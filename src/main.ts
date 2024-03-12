import { app, BrowserWindow, ipcMain, dialog, shell } from "electron";
import * as path from "path";
import convertToWebp from "./convertToWebP";
import os from "os";
import ElectronStore from "electron-store";
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

app.commandLine.appendSwitch("disable-frame-skipping", "true");
let direction = true;
let outputDir = path.join(os.homedir(), "Downloads"); // default
let compressRateLevel = 1; // default
const store = new ElectronStore();

const handleFileOpen = async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: "PathSelecter",
    defaultPath: outputDir,
    properties: ["openDirectory", "createDirectory"],
    message: "변환된 이미지 파일의 저장 위치 지정",
  });
  if (!canceled) {
    outputDir = filePaths[0];
    store.set("outputPath", outputDir);
  }
};

const handleOpenOutputDirectory = () => {
  shell.openPath(outputDir);
};

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 560,
    height: 360,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
    },
    show: false,
    resizable: false,
  });

  outputDir = store.get("outputPath") as string;
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  ipcMain.on("presetting:setQuality", (event, quality: number) => {
    compressRateLevel = quality;
  });

  ipcMain.on("toMain", (event, data: ImageFile[]) => {
    let progress = 0;
    let convertSuccess = true;
    const compressRate = 60 + 20 * compressRateLevel;
    console.log(`변환 설정 방향:${direction} 저장위치:${outputDir} 압축률:${compressRate}`);
    data.forEach((image: File) => {
      try {
        convertToWebp(image, direction, outputDir, compressRate);
        progress++;
        mainWindow.webContents.send("update-counter", (progress / data.length) * 100);
        console.log("진행도", progress);
      } catch (e) {
        console.error("main.ts 변환반복 중 오류발생", e.message);
        convertSuccess = false;
      }
    });

    mainWindow.webContents.send("success", data[0].name, data.length, convertSuccess);
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  ipcMain.handle("presetting:openFileDialog", handleFileOpen);
  ipcMain.handle("presetting:openOutputDirectory", handleOpenOutputDirectory);
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.handle("direction:toggle", () => {
  direction = !direction;
});
