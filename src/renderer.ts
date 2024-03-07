/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.ts` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import "./index.css";

declare global {
  interface Window {
    api: any;
    direction: any;
  }
}

console.log("renderer.ts 로드완료");

document.getElementById("imageSelecter").addEventListener("change", function (event: Event) {
  const files = (event.target as HTMLInputElement).files;

  if (files) {
    // 파일의 경로와 이름만 추출하여 별도의 객체로 만듭니다.
    const fileInfos = Array.from(files).map((file) => ({
      name: file.name,
      path: file.path,
      type: file.type,
    }));
    console.log(fileInfos);
    window.api.send("toMain", fileInfos);
  }
});

document.getElementById("directionSwitch").addEventListener("change", async () => {
  await window.direction.toggle();
});

const bar = document.getElementById("bar");

window.api.onProgressUpdate((value: number) => {
  bar.style.width = value + "%";
});

const message = document.getElementById("message");

window.api.onSuccess((value: string, length: number, isSuccess: boolean) => {
  if (isSuccess) {
    message.innerHTML = `이미지 변환 성공 ${
      length > 1 ? value + "외 " + (length - 1) + "개 이미지 변환됨" : value + " 이미지 변환됨"
    }`;
  } else {
    message.innerHTML = "이미지 변환 실패";
  }
  message.style.color = isSuccess ? "seagreen" : "tomato";
});

export default {};
