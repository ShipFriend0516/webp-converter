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
function convertToWebp(image, direction2 = true, outputFolderPath = path.join(os.homedir(), "Downloads"), compressRate) {
  try {
    const imagePath = image.path;
    const fileName = image.name;
    const fileExtension = path.extname(fileName).toLowerCase();
    console.log(fileExtension);
    let outputFilePath = "";
    const newFileName = fileName.slice(0, -fileExtension.length);
    if (direction2) {
      outputFilePath = `${outputFolderPath}/${"converted"}_${newFileName}.webp`;
      if (fileExtension === ".png") {
        console.log("투명도 지원");
        sharp(imagePath).webp({ quality: compressRate, alphaQuality: 100 }).toFormat("webp").toFile(outputFilePath);
      } else if (fileExtension === ".gif") {
        sharp(imagePath).metadata().then((info) => {
          const hasTransparency = info.hasAlpha;
          if (hasTransparency) {
            return sharp(imagePath, { animated: true }).webp({
              quality: compressRate,
              alphaQuality: 100,
              lossless: true
            }).toFile(outputFilePath);
          } else {
            return sharp(imagePath, { animated: true }).webp({
              quality: compressRate,
              lossless: true
            }).toFile(outputFilePath);
          }
        });
      } else {
        console.log("투명도 미지원");
        sharp(imagePath).webp({ quality: compressRate }).toFormat("webp").toFile(outputFilePath);
      }
    } else {
      outputFilePath = `${outputFolderPath}/${"converted"}${newFileName}.jpg`;
      sharp(imagePath).jpeg({ quality: 100, chromaSubsampling: "4:4:4" }).toFormat("jpeg").toFile(outputFilePath);
    }
  } catch (error) {
    console.error("변환 도중 오류:", error);
    throw error;
  }
}
if (require("electron-squirrel-startup")) {
  electron.app.quit();
}
let direction = true;
let outputDir = path__namespace.join(os.homedir(), "Downloads");
let compressRateLevel = 1;
const store = new ElectronStore();
const createWindow = () => {
  const mainWindow = new electron.BrowserWindow({
    width: 560,
    height: 360,
    webPreferences: {
      preload: path__namespace.join(__dirname, "preload.js"),
      nodeIntegration: true
    },
    resizable: false
  });
  if (typeof store.get("outputPath") === "undefined") {
    outputDir = path__namespace.join(os.homedir(), "Downloads");
  } else if (typeof store.get("outputPath") === "string") {
    outputDir = store.get("outputPath");
  }
  {
    mainWindow.loadURL("http://localhost:5173");
  }
  electron.ipcMain.on("presetting:setQuality", (event, quality) => {
    compressRateLevel = quality;
  });
  electron.ipcMain.on("toMain", (event, data) => {
    let progress = 0;
    let convertSuccess = true;
    const compressRate = 60 + 15 * compressRateLevel;
    console.log(`변환 설정 방향:${direction} 저장위치:${outputDir} 압축률:${compressRate}`);
    data.forEach((image) => {
      try {
        convertToWebp(image, direction, outputDir, compressRate);
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
electron.ipcMain.handle("direction:toggle", () => {
  direction = !direction;
});
