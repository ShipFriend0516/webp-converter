import sharp from "sharp";
import os from "os";
import path from "path";

function convertToWebp(
  image: File,
  direction = true,
  outputFolderPath = path.join(os.homedir(), "Downloads"),
  compressRate: number
) {
  try {
    const imagePath: string = image.path;
    const fileName: string = image.name;
    const fileExtension = path.extname(fileName).toLowerCase();
    console.log(fileExtension);
    let outputFilePath = "";
    // 기본적으로 Direction은 webp로 변환하는 것
    const newFileName = fileName.slice(0, -fileExtension.length);
    if (direction) {
      // Webp로
      outputFilePath = `${outputFolderPath}/${"converted"}_${newFileName}.webp`;
      if (fileExtension === ".png") {
        console.log("투명도 지원");
        sharp(imagePath)
          .webp({ quality: compressRate, alphaQuality: 100 })
          .toFormat("webp")
          .toFile(outputFilePath);
      } else if (fileExtension === ".gif") {
        sharp(imagePath)
          .metadata()
          .then((info) => {
            const hasTransparency = info.hasAlpha;
            if (hasTransparency) {
              return sharp(imagePath, { animated: true })
                .webp({
                  quality: compressRate,
                  alphaQuality: 100,
                  lossless: true,
                })
                .toFile(outputFilePath);
            } else {
              return sharp(imagePath, { animated: true })
                .webp({
                  quality: compressRate,
                  lossless: true,
                })
                .toFile(outputFilePath);
            }
          });
      } else {
        console.log("투명도 미지원");
        sharp(imagePath).webp({ quality: compressRate }).toFormat("webp").toFile(outputFilePath);
      }
    } else {
      // jpg로
      outputFilePath = `${outputFolderPath}/${"converted"}${newFileName}.jpg`;

      sharp(imagePath)
        .jpeg({ quality: 100, chromaSubsampling: "4:4:4" })
        .toFormat("jpeg")
        .toFile(outputFilePath);
    }

    // return outputFilePath;
  } catch (error) {
    console.error("변환 도중 오류:", error);
    throw error;
  }
}

export default convertToWebp;
