/**
 * Wave 3: public real Japanese label photographs with explicit annotation grade.
 * Photos: NOT checked in. Original URLs are fetched in transient CI only.
 *
 * MUJI reference was independently read from the visible Japanese label photo,
 * NOT transcribed from OCR or an up-to-date marketing listing. It is a SINGLE
 * provisional visual reading, not a double-verified human label transcription.
 *
 * Biore manufacturer ingredients belong to the specified product name/JAN but
 * retailers also publish older formulations under the same JAN. This row MUST
 * NOT be used as photograph-ground-truth accuracy certification.
 */
const entries = [
  {
    id: 'muji-sensitive-highmoist-2020-photo-12',
    product: 'MUJI sensitive skin high-moisture lotion (older printed formulation, early-2020 photograph)',
    photoUrl: 'https://cloudflare.lipscosme.com/image/f5b50fa925ac91660be84c6d-1580295578.png?auto=avif%2Cwebp&fio=1&orient=1&width=1424',
    photoSourceUrl: 'https://lipscosme.com/posts/1732104',
    ingredientSourceUrl: 'https://lipscosme.com/posts/1732104',
    sourceType: 'consumer independently photographed Japanese label, photo-derived provisional transcription',
    referenceType: 'photo-visual-provisional',
    photoFormat: 'png',
    labelClass: 'cosmetic',
    packagingVersion: 'unverified; provisional visual reading of product label, no second independent human transcriber',
    referenceCaveat: 'Photo-visible component names were read independently of Tesseract OCR; spelling/line-end joins need a second human check before calling this certified ground truth',
    ingredients: "水、DPG、BG、グリセリン、ハトムギ種子エキス、グリチルリチン酸2K、(スチレン/アクリレーツ)コポリマー、エタノール、クエン酸、クエン酸Na、メチルパラベン、プロピルパラベン"
  },
  {
    id: 'biore-skin-care-face-wash-moisture-130g-4901301259660',
    product: 'Biore Skin Care Face Wash Moisture 130g, JAN 4901301259660',
    photoUrl: 'https://cdn.shopify.com/s/files/1/0695/5712/5440/files/P-2-BIOR-FWMOIS-130-Kao_Biore_Skin_Care_Face_Wash_Moisture_130g.jpg?v=1743425367',
    photoSourceUrl: 'https://japanesetaste.co.uk/products/kao-biore-skin-care-face-wash-moisture-130g',
    ingredientSourceUrl: 'https://www.kao-kirei.com/ja/item/khg/biore/4901301259660/',
    sourceType: 'packaged back-label retail photograph and manufacturer current-variant ingredient page',
    referenceType: 'public-product-page-proxy',
    photoFormat: 'jpg',
    labelClass: 'cosmetic',
    packagingVersion: 'unverified; manufacturer present-day formula may differ from retail photograph, even if JAN matches',
    referenceCaveat: 'Older retail descriptions for exactly this JAN use methylparaben instead of present-day sodium benzoate; source disagreement must NEVER be treated as photo OCR error or exact-batch proof',
    ingredients: "水、グリセリン、ステアリン酸、ミリスチン酸、ラウレス-6カルボン酸、パルミチン酸、水酸化K、ラウリン酸、ソルビトール、ポリクオタニウム-7、PG、安息香酸Na、EDTA-2Na、香料"
  }
];

export const japanesePhotoWave3 = Object.freeze(entries.map(item => Object.freeze({
  ...item, ingredientList: Object.freeze(item.ingredients.split('、').map(s => s.trim()).filter(Boolean))
})));
