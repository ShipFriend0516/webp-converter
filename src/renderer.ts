import "./index.css";

declare global {
  interface Window {
    api: any;
    direction: any;
    presetting: any;
  }
}

document.getElementById("outputDir").addEventListener("click", () => {
  console.log("file path select");
  window.presetting.openFileDialog();
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

  if (files) {
    // 파일의 경로와 이름만 추출하여 별도의 객체로 만듭니다.
    const fileInfos = Array.from(files).map((file) => ({
      name: file.name,
      path: file.path,
    }));
    console.log(fileInfos);
    window.api.send("toMain", fileInfos);
  }
  dropZone.classList.remove("dragover");
  dropZoneSpan.innerText = "클릭하거나 이미지를 드래그&드랍";
});

document.getElementById("imageSelecter").addEventListener("change", function (event: Event) {
  const files = (event.target as HTMLInputElement).files;

  if (files) {
    // 파일의 경로와 이름만 추출하여 별도의 객체로 만듭니다.
    const fileInfos = Array.from(files).map((file) => ({
      name: file.name,
      path: file.path,
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
    message.innerHTML = `${
      length > 1 ? `${value} 외 ${length - 1}개 이미지 변환됨"` : `[${value}] 이미지 변환됨`
    }`;
  } else {
    message.innerHTML = "이미지 변환 실패";
  }
  message.style.color = isSuccess ? "seagreen" : "tomato";
});
