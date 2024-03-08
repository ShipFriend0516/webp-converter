import sharp from "sharp";
import os from "os";
import path from "path";

function convertToWebP(
  image: File,
  direction = true,
  outputFolderPath = path.join(os.homedir(), "Downloads")
) {
  try {
    const imagePath: string = image.path;
    const fileName: string = image.name;
    let outputFilePath = "";
    // 기본적으로 Direction은 webp로 변환하는 것
    const newFileName = fileName.slice(0, -path.extname(fileName).length);
    if (direction) {
      outputFilePath = `${outputFolderPath}/${"converted"}_${newFileName}.webp`;
      sharp(imagePath).toFormat("webp").toFile(outputFilePath);
    } else {
      // 역방향
      outputFilePath = `${outputFolderPath}/${"converted_"}${newFileName}.jpg`;
      sharp(imagePath).toFormat("jpg").toFile(outputFilePath);
    }

    console.log(`변환 성공! Output file: ${outputFilePath}`);

    // return outputFilePath;
  } catch (error) {
    console.error("변환 도중 오류:", error);
    throw error;
  }
}

export default convertToWebP;
