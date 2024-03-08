import { ipcRenderer, contextBridge } from "electron";
import path from "path";

contextBridge.exposeInMainWorld("api", {
  send: (channel: string, data: any) => {
    const validChannels = ["toMain"];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel: string, func: any) => {
    const validChannels = ["fromMain"];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
  onProgressUpdate: (callback: (value: number) => void) => {
    ipcRenderer.on("update-counter", (event, value: number) => callback(value));
  },
  onSuccess: (callback: (value: string, length: number, isSuccess: boolean) => void) => {
    ipcRenderer.on("success", (event, value: string, length: number, isSuccess: boolean) =>
      callback(value, length, isSuccess)
    );
  },
});

contextBridge.exposeInMainWorld("direction", {
  toggle: () => ipcRenderer.invoke("direction:toggle"),
});

contextBridge.exposeInMainWorld("presetting", {
  openFileDialog: () => ipcRenderer.invoke("presetting:openFileDialog"),
});

contextBridge.exposeInMainWorld("file", {
  startDrag: (fileName: string) => {
    ipcRenderer.send("ondragstart", path.join(process.cwd(), fileName));
  },
});
