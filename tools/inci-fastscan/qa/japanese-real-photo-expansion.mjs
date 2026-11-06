/**
 * Two additional genuine public Japanese cosmetic ingredient-label photographs.
 * All reference names are sourced from the *same pictured product* by the
 * photo author (Naturaglace) or manufacturer (to/one). Source-page transcriptions
 * are NOT certified same-package-lot ground truth. Do not assert phone accuracy.
 *
 * Actual photos are downloaded transiently by CI, never distributed by the app.
 * Multi-shade/optional pigment indicators and organic '*' notation have been
 * removed from individual reference strings; they are *not* proof that every
 * listed possible pigment was present in the photographed individual palette.
 */
const entries = [
  {
    id: 'naturaglace-color-control-base-01-202103',
    product: 'Naturaglace Color Control Base 01 Violet (2021 packaging)',
    photoUrl: 'https://stat.ameba.jp/user_images/20210317/20/rik01194/87/9f/j/o1080108014911798705.jpg',
    photoSourceUrl: 'https://ameblo.jp/rik01194/entry-12662974737.html',
    ingredientSourceUrl: 'https://ameblo.jp/rik01194/entry-12662974737.html',
    sourceType: 'photograph and independently typed component declaration by same purchaser',
    photoFormat: 'jpg',
    labelClass: 'cosmetic',
    packagingVersion: 'unverified; photo and transcription are in same 2021 review but no independent lot inspection',
    referenceCaveat: 'Optional +/- pigments and organic-origin symbols are not formula-verification; do not use later reformulation lists',
    ingredients: "水、オリーブ果実油、プロパンジオール、イソステアリン酸エチル、グリセリン、ラウリン酸ポリグリセリル-10、スクワラン、ゲットウ花/葉/茎水、ヤシ脂肪酸ソルビタン、水添ナタネ油アルコール、ダイマージリノール酸ダイマージリノレイル、ホホバ種子油、ヒポファエラムノイデス果実油、キサントフィル、ダイズ種子エキス、ロドデンドロンフェルギネウムエキス、ダマスクバラ花油、センチフォリアバラ花油、ローマカミツレ花油、ラベンダー油、パルマローザ油、オニサルビア油、ニオイテンジクアオイ油、セイヨウネズ果実油、グレープフルーツ果皮油、セイヨウシロヤナギ樹皮エキス、アラビアゴム、キサンタンガム、シリカ、パルミチン酸デキストリン、ペンタステアリン酸ポリグリセリル-10、水添レシチン、アニス酸、アニス酸Na、スクロース、タピオカデンプン、クエン酸、BG、酸化チタン、酸化鉄、グンジョウ、マイカ、ラウロイルリシン、水酸化Al、アルミナ、ステアリン酸"
  },
  {
    id: 'toone-petal-float-flawless-touch-01-4570106735626',
    product: 'to/one Petal Float Flawless Touch 01 (JAN 4570106735626)',
    photoUrl: 'https://cdn.yamibuy.net/item/e2388734cd318a74db0709b22d68dcfe_757x757.webp',
    photoSourceUrl: 'https://www.yami.com/zht/p/to-one-petal-float-flawless-touch-powder-foundation-01-1-7g/1023679931',
    ingredientSourceUrl: 'https://toonecosmetics.com/Form/Product/ProductDetail.aspx?bid=TO01&cat=TBDTOO&pid=4570106735626&shop=0',
    sourceType: 'retailer photo and independently published brand JAN-specific ingredient list',
    photoFormat: 'webp',
    labelClass: 'cosmetic',
    packagingVersion: 'unverified; matching JAN but image/package formulation revision is not independently authenticated',
    referenceCaveat: 'Brand describes two shade regions; unique union of listed names is a source-label proxy, not independent actual-box transcription',
    ingredients: "トリ（カプリル酸/カプリン酸）グリセリル、ミリスチン酸デキストリン、パルミチン酸デキストリン、トリイソステアリン酸ポリグリセリル-2、シリカ、セスキイソステアリン酸ソルビタン、ダイマージリノレイル水添ロジン縮合物、トコフェロール、水酸化Al、アボカド油、アルガニアスピノサ核油、オプンチアフィクスインジカ種子油、スクワラン、ホホバ種子油、ローズマリー葉油、アーモンド油、アンズ核油、オリーブ果実油、カニナバラ果実油、マカデミア種子油、ヒマワリ種子油、マイカ、酸化チタン、酸化鉄、ダイマージリノール酸ジ（イソステアリル/フィトステリル）"
  }
];

export const additionalJapanesePhotoSources = Object.freeze(entries.map(item => Object.freeze({
  ...item,
  ingredientList: Object.freeze(item.ingredients.split('、').map(value => value.trim()).filter(Boolean))
})));
