async function runOCR(imageFile, lang = "eng") {
  if (!imageFile) return "";

  if (typeof Tesseract === "undefined") {
    throw new Error("Tesseract.js is not loaded.");
  }

  const { data } = await Tesseract.recognize(
    imageFile,
    lang,
    { logger: m => console.log(m) }
  );

  return coreProcessOCRText(data.text);
}
