import sharp from "sharp";
import os from "os";
import path from "path";

function convertToWebP(
  image: File,
  direction = true,
  outputFolderPath = path.join(os.homedir(), "Downloads"),
  compressRate: number
) {
  try {
    const imagePath: string = image.path;
    const fileName: string = image.name;
    console.log(image.type);
    let outputFilePath = "";
    // 기본적으로 Direction은 webp로 변환하는 것
    const newFileName = fileName.slice(0, -path.extname(fileName).length);
    if (direction) {
      // Webp로
      outputFilePath = `${outputFolderPath}/${"converted"}_${newFileName}.webp`;
      sharp(imagePath).webp({ quality: compressRate }).toFormat("webp").toFile(outputFilePath);
    } else {
      // 역방향
      outputFilePath = `${outputFolderPath}/${"converted"}${newFileName}.jpg`;
      sharp(imagePath)
        .jpeg({ quality: 100, chromaSubsampling: "4:4:4" })
        .toFormat("jpeg")
        .toFile(outputFilePath);
    }

    console.log(`변환 성공! 변환파일: ${outputFilePath}`);

    // return outputFilePath;
  } catch (error) {
    console.error("변환 도중 오류:", error);
    throw error;
  }
}

export default convertToWebP;
