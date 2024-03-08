"use strict";
const electron = require("electron");
const path = require("path");
const sharp = require("sharp");
const os = require("os");
const ElectronStore = require("electron-store");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const path__namespace = /* @__PURE__ */ _interopNamespaceDefault(path);
function convertToWebP(image, direction2 = true, outputFolderPath = path.join(os.homedir(), "Downloads"), compressRate) {
  try {
    const imagePath = image.path;
    const fileName = image.name;
    console.log(image.type);
    let outputFilePath = "";
    const newFileName = fileName.slice(0, -path.extname(fileName).length);
    if (direction2) {
      outputFilePath = `${outputFolderPath}/${"converted"}_${newFileName}.webp`;
      sharp(imagePath).webp({ quality: compressRate }).toFormat("webp").toFile(outputFilePath);
    } else {
      outputFilePath = `${outputFolderPath}/${"converted_"}${newFileName}.jpg`;
      sharp(imagePath).webp({ lossless: true }).toFormat("jpeg").toFile(outputFilePath);
    }
    console.log(`변환 성공! 변환파일: ${outputFilePath}`);
  } catch (error) {
    console.error("변환 도중 오류:", error);
    throw error;
  }
}
if (require("electron-squirrel-startup")) {
  electron.app.quit();
}
let direction = true;
let progress = 0;
let outputDir = path__namespace.join(os.homedir(), "Downloads");
let compressRateLevel = 1;
const store = new ElectronStore();
const handleFileOpen = async () => {
  const { canceled, filePaths } = await electron.dialog.showOpenDialog({
    title: "PathSelecter",
    defaultPath: outputDir,
    properties: ["openDirectory", "createDirectory"],
    message: "변환된 이미지 파일의 저장 위치 지정"
  });
  if (!canceled) {
    outputDir = filePaths[0];
    store.set("outputPath", outputDir);
  }
};
const handleOpenOutputDirectory = () => {
  electron.shell.openPath(outputDir);
};
const createWindow = () => {
  const mainWindow = new electron.BrowserWindow({
    width: 560,
    height: 360,
    webPreferences: {
      preload: path__namespace.join(__dirname, "preload.js"),
      nodeIntegration: true
    }
  });
  outputDir = store.get("outputPath");
  {
    mainWindow.loadURL("http://localhost:5173");
  }
  electron.ipcMain.on("presetting:setQuality", (event, quality) => {
    compressRateLevel = quality;
  });
  electron.ipcMain.on("toMain", (event, data) => {
    progress = 0;
    let convertSuccess = true;
    const compressRate = 70 + 10 * compressRateLevel;
    console.log(`변환 설정 방향:${direction} 저장위치:${outputDir} 압축률:${compressRate}`);
    data.forEach((image) => {
      try {
        convertToWebP(image, direction, outputDir, compressRate);
        progress++;
        mainWindow.webContents.send("update-counter", progress / data.length * 100);
        console.log("진행도", progress);
      } catch (e) {
        console.error("main.ts 변환반복 중 오류발생", e.message);
        convertSuccess = false;
      }
    });
    mainWindow.webContents.send("success", data[0].name, data.length, convertSuccess);
  });
};
electron.app.whenReady().then(() => {
  electron.ipcMain.handle("presetting:openFileDialog", handleFileOpen);
  electron.ipcMain.handle("presetting:openOutputDirectory", handleOpenOutputDirectory);
  createWindow();
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.app.on("activate", () => {
  if (electron.BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
electron.ipcMain.handle("direction:toggle", () => {
  if (direction) {
    direction = false;
  } else {
    direction = true;
  }
});
