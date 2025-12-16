async function runOCR(imageFile) {
  if (!imageFile) return "";

  if (typeof Tesseract === "undefined") {
    throw new Error("Tesseract.js is not loaded.");
  }

  const { data } = await Tesseract.recognize(
    imageFile,
    "eng+jpn",
    { logger: m => console.log(m) }
  );

  return coreProcessOCRText(data.text);
}
