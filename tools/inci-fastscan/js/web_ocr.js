async function runOCR(imageFile, lang = "eng", onProgress = null, options = {}) {
  if (!imageFile) return "";

  if (typeof Tesseract === "undefined") {
    throw new Error("Tesseract.js is not loaded.");
  }

  const turns = Number.isInteger(options?.quarterTurns) ? options.quarterTurns : 0;
  if (turns && typeof prepareFastScanOcrImage !== "function") {
    throw new Error("Image rotation is unavailable.");
  }
  const preparedImage = turns ? await prepareFastScanOcrImage(imageFile, turns) : imageFile;

  const { data } = await Tesseract.recognize(
    preparedImage,
    lang,
    {
      logger: message => {
        console.log(message);
        if (typeof onProgress === "function") {
          onProgress({
            status: String(message?.status || ""),
            progress: Number.isFinite(message?.progress) ? message.progress : null
          });
        }
      }
    }
  );

  return coreProcessOCRText(data.text);
}
