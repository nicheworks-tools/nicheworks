async function runOCR(imageFile, lang = "eng", onProgress = null) {
  if (!imageFile) return "";

  if (typeof Tesseract === "undefined") {
    throw new Error("Tesseract.js is not loaded.");
  }

  const { data } = await Tesseract.recognize(
    imageFile,
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
