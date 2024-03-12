"use strict";
const electron = require("electron");
const path = require("path");
electron.contextBridge.exposeInMainWorld("api", {
  send: (channel, data) => {
    const validChannels = ["toMain"];
    if (validChannels.includes(channel)) {
      electron.ipcRenderer.send(channel, data);
    }
  },
  onProgressUpdate: (callback) => {
    electron.ipcRenderer.on("update-counter", (event, value) => callback(value));
  },
  onSuccess: (callback) => {
    electron.ipcRenderer.on(
      "success",
      (event, value, length, isSuccess) => callback(value, length, isSuccess)
    );
  }
});
electron.contextBridge.exposeInMainWorld("direction", {
  toggle: () => electron.ipcRenderer.invoke("direction:toggle")
});
electron.contextBridge.exposeInMainWorld("presetting", {
  openOutputDirectory: () => electron.ipcRenderer.invoke("presetting:openOutputDirectory"),
  openFileDialog: () => electron.ipcRenderer.invoke("presetting:openFileDialog"),
  setQuality: (value) => electron.ipcRenderer.send("presetting:setQuality", parseInt(value))
});
electron.contextBridge.exposeInMainWorld("file", {
  startDrag: (fileName) => {
    electron.ipcRenderer.send("ondragstart", path.join(process.cwd(), fileName));
  }
});
