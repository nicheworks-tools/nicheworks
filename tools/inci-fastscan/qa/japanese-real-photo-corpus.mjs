/**
 * Two REAL publicly pictured Japanese cosmetic ingredient panels with
 * independently published full ingredient lists. Images are transient CI
 * downloads and NEVER rehosted, committed or included in artifacts.
 *
 * These are candidate source-page-to-photo pairs, NOT independently verified
 * exact same-lot/packaging versions; comparisons must be described as
 * source-page-anchored proxy recognition tests, not definitive phone OCR QA.
 *
 * References: vendor product page and vendor's public product photo article;
 * second is the same @cosme variation detail page and its contributed photo.
 * Ingredient declarations are factual data (not protected marketing copy).
 */
const entries = [
  {
    id: 'zigen-all-in-one-gel-2025',
    product: 'ZIGEN All-in-one Face Gel',
    photoUrl: 'https://www.zigen-shop.com/Contents/ImagesPkg/column/2502b/04.jpg',
    photoSourceUrl: 'https://www.zigen-shop.com/Page/cont_2502b.aspx',
    ingredientSourceUrl: 'https://www.zigen-shop.com/Landing/Formlp/lp_g_001.aspx',
    sourceType: 'manufacturer',
    packagingVersion: 'unverified; manufacturer photo published February 2025, live ingredient page may change',
    ingredients: `水、グリセリン、プロパンジオール、アルギニン、ハマメリス水、グリチルリチン酸2K、タウリン、ロイシン、リシンHCl、プロリン、フェニルアラニン、ヒスチジンHCl、パルミチン酸レチノール、バリン、トレオニン、アミノカプロン酸、チロシン、セリン、コロイド性白金、クロレラ/シロバナルーピンタンパク発酵物、グルタミン酸、グリシン、クエン酸、グアニル酸2Na、エゾウコギ根エキス、イノシン酸2Na、イソロイシン、アラントイン、アラニン、アスパラギン酸Na、アスコルビン酸、セージ葉エキス、サボンソウ葉エキス、ゴボウ根エキス、レモン果実エキス、セイヨウオトギリソウ花/葉/茎エキス、ホップ花エキス、トウキンセンカ花エキス、水添レシチン、加水分解コラーゲン、セラミドNP、セラミドNG、セラミドAP、セラミドAG、セラミドEOP、水溶性コラーゲン、ダイズステロール、ヒアルロン酸Na、プラセンタエキス、ピリドキシンHCl、セイヨウキズタ葉/茎エキス、オランダガラシ葉/茎エキス、白金、金、銀、海塩、カプリルヒドロキサム酸、カプリリルグリコール、アセチルテトラペプチド-17、カルボマー、キサンタンガム、エチルヘキシルグリセリン、トコフェロール、メントール、o-シメン-5-オール、BG、炭酸水素Na、セルロースガム`
  },
  {
    id: 'kisocare-super-wrinkle-cream-va-no036-50g',
    product: 'KISOCARE Super Wrinkle Cream VA No.036 50g',
    photoUrl: 'https://fitter.cosme.net/media/collection/145/3225/11814607.jpg',
    photoSourceUrl: 'https://www.cosme.net/variations/1066605/',
    ingredientSourceUrl: 'https://www.cosme.net/variations/1066605/',
    sourceType: 'published brand-provided/approved product data plus user photo',
    packagingVersion: 'unverified; submitted photo may differ from current approved variation formulation',
    ingredients: `水、BG、ミリスチン酸オクチルドデシル、ラウリン酸メチルヘプチル、プロパンジオール、グリセリン、水添レシチン、ペンチレングリコール、水添ナタネ油アルコール、スクワラン、ドデカン、レチノール、レチノイン酸ヒドロキシピナコロン、レチノイン酸トコフェリル、パルミチン酸レチノール、水添レチノール、レチノイルヒアルロン酸Na、ナイアシンアミド、バクチオール、アルガニアスピノサ核油、ホホバ種子油、トリ（カプリル酸／カプリン酸）グリセリル、ピーナッツ油、フィトステロールズ、セラミドNG、セラミドAP、セラミドNP、セラミドEOP、ヒト遺伝子組換オリゴペプチド-1、アセチルヒアルロン酸Na、ヒアルロン酸クロスポリマー-2-Na、加水分解ヒアルロン酸Na、ヒアルロン酸Na、グリチルリチン酸2K、オレンジ油、オレンジ果皮油、オニサルビア油、イランイラン花油、ラベンダー油、ニオイテンジクアオイ油、イタリアイトスギ葉油、トコフェロール、ツボクサエキス、オウゴン根エキス、イタドリ根エキス、カンゾウ根エキス、チャ葉エキス、ローズマリー葉エキス、カミツレ花エキス、ベヘン酸グリセリル、オクタステアリン酸ポリグリセリル-6、ポリソルベート20、酢酸トコフェロール、キサンタンガム、クエン酸Na、ジメチルイソソルバイド、エチルヘキシルグリセリン、ホウケイ酸（Ca／Na）、酸化銀`
  }
];

export const japaneseRealPhotoSources = Object.freeze(entries.map(item => Object.freeze({
  ...item,
  ingredientList: Object.freeze(item.ingredients.split('、').map(value => value.trim()).filter(Boolean))
})));
