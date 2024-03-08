import "./index.css";

declare global {
  interface ImageFile {
    name: string;
    path: string;
    type: string;
  }
  interface Window {
    api: {
      send: (channel: string, arr: ImageFile[]) => void;
      onProgressUpdate: (callback: (value: number) => void) => void;
      onSuccess: (callback: (value: string, length: number, isSuccess: boolean) => void) => void;
    };
    direction: {
      toggle: () => void;
    };
    presetting: {
      openOutputDirectory: () => void;
      openFileDialog: () => void;
      setQuality: (value: string) => void;
    };
  }
}

document.getElementById("outputDir").addEventListener("click", () => {
  window.presetting.openFileDialog();
});

document.getElementById("openOutputDir").addEventListener("click", () => {
  window.presetting.openOutputDirectory();
});

const dropZone = document.getElementById("dragPoint");
const dropZoneSpan = document.getElementById("dragPointSpan");
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = "copy";
  dropZone.classList.add("dragover");
  dropZoneSpan.innerText = "이미지를 업로드";
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
  dropZoneSpan.innerText = "클릭하거나 이미지를 드래그&드랍";
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  const files = e.dataTransfer.files;

  if (files.length > 0) {
    // 파일의 경로와 이름만 추출하여 별도의 객체로 만듭니다.
    const fileInfos = Array.from(files).map((file) => ({
      name: file.name,
      path: file.path,
      type: file.type,
    }));
    window.api.send("toMain", fileInfos);
  }
  dropZone.classList.remove("dragover");
  dropZoneSpan.innerText = "클릭하거나 이미지를 드래그&드랍";
});

document.getElementById("imageSelecter").addEventListener("change", function (event: Event) {
  const files = (event.target as HTMLInputElement).files;

  if (files.length > 0) {
    // 파일의 경로와 이름만 추출하여 별도의 객체로 만듭니다.
    const fileInfos = Array.from(files).map((file) => ({
      name: file.name,
      path: file.path,
      type: file.type,
    }));
    window.api.send("toMain", fileInfos);
  }
});

// 설정
const directionSpan = document.getElementById("directionSpan");
document.getElementById("directionSwitch").addEventListener("change", async (event) => {
  (event.target as HTMLInputElement).checked
    ? (directionSpan.innerText = "Image > Webp")
    : (directionSpan.innerText = "Webp > JPG");

  await window.direction.toggle();
});

const bar = document.getElementById("bar");
window.api.onProgressUpdate((value: number) => {
  bar.style.width = value + "%";
});

const message = document.getElementById("message");
window.api.onSuccess((value: string, length: number, isSuccess: boolean) => {
  if (isSuccess) {
    message.innerHTML = `${
      length > 1 ? `${value} 외 ${length - 1}개 이미지 변환됨"` : `[${value}] 이미지 변환됨`
    }`;
  } else {
    message.innerHTML = "이미지 변환 실패";
  }
  message.style.color = isSuccess ? "seagreen" : "tomato";
});

const compressLevelBtn = document.getElementById("compressLevel");
compressLevelBtn.addEventListener("click", (event) => {
  const target = event.target as HTMLInputElement;
  target.value = ((parseInt(target.value) + 1) % 3).toString();
  window.presetting.setQuality(target.value);
  switch (target.value) {
    case "0":
      target.innerHTML = "하";
      break;
    case "1":
      target.innerHTML = "중";
      break;
    case "2":
      target.innerHTML = "상";
      break;
    default:
      break;
  }
});
