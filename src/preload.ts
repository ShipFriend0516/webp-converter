import { ipcRenderer, contextBridge } from "electron";
import path from "path";

contextBridge.exposeInMainWorld("api", {
  send: (channel: string, data: File[]) => {
    const validChannels = ["toMain"];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
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
  openOutputDirectory: () => ipcRenderer.invoke("presetting:openOutputDirectory"),
  openFileDialog: () => ipcRenderer.invoke("presetting:openFileDialog"),
  setQuality: (value: string) => ipcRenderer.send("presetting:setQuality", parseInt(value)),
});

contextBridge.exposeInMainWorld("file", {
  startDrag: (fileName: string) => {
    ipcRenderer.send("ondragstart", path.join(process.cwd(), fileName));
  },
});
