const { contextBridge, ipcRenderer } = require("electron");

console.log("Preload script executing!");

contextBridge.exposeInMainWorld("api", {
  invoke: (channel, ...args) => {
    console.log(`IPC invoke: ${channel}`, args);
    return ipcRenderer.invoke(channel, ...args);
  },
});
