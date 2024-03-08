import { app, BrowserWindow, ipcMain, dialog } from "electron";
import * as path from "path";
import convertToWebP from "./coverter";
import os from "os";
import ElectronStore from "electron-store";
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

let direction = true;
let progress = 0;
let outputDir = path.join(os.homedir(), "Downloads");
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

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 520,
    height: 360,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
    },
  });
  mainWindow.setResizable(false);
  outputDir = store.get("outputPath") as string;
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  ipcMain.on("presetting:setQuality", (event, quality: number) => {
    compressRateLevel = quality;
  });

  ipcMain.on("toMain", (event, data: File[]) => {
    progress = 0;
    let convertSuccess = true;
    const compressRate = 70 + 10 * compressRateLevel;
    console.log(`변환 설정 방향:${direction} 저장위치:${outputDir} 압축률:${compressRate}`);
    data.forEach((image: File) => {
      try {
        convertToWebP(image, direction, outputDir, compressRate);
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

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  ipcMain.handle("presetting:openFileDialog", handleFileOpen);
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
  if (direction) {
    direction = false;
  } else {
    direction = true;
  }
});
