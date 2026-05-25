(() => {
  let currentLang = "ja";
  let entriesCache = [];
  let currentFilter = "all";
  let currentQuery = "";

  const messages = {
    ja: {
      loading: "辞書データを読み込み中です…",
      loadError: "辞書データの読み込みに失敗しました。時間を置いて再度お試しください。",
      copiedOld: "旧字体をコピーしました",
      copiedNew: "現代表記をコピーしました",
      placeholder: "旧字体・現代表記・一部の読み/意味で検索できます",
      noMatch: "該当する旧字体が見つかりませんでした。別の漢字・読み・新字体で検索してください。",
      showing: "表示中",
      searchResults: "検索結果",
      total: "全"
    },
    en: {
      loading: "Loading dictionary…",
      loadError: "Failed to load dictionary. Please try again later.",
      copiedOld: "Copied old form",
      copiedNew: "Copied modern form",
      placeholder: "Search by old form, modern form, or selected readings/meanings",
      noMatch: "No matching entries found. Try another kanji, selected reading, or modern form.",
      showing: "Showing",
      searchResults: "Search results",
      total: "total"
    }
  };

  const filters = [
    { id: "all", ja: "すべて", en: "All" },
    { id: "popular", ja: "よく使う", en: "Common" },
    { id: "name", ja: "人名・地名", en: "Names / Places" },
    { id: "common", ja: "旧常用漢字", en: "Common-use old forms" },
    { id: "document", ja: "文献・古文書", en: "Old documents" },
    { id: "rare", ja: "難読・参考", en: "Rare / Reference" }
  ];

  const popularOld = new Set(["國", "體", "舊", "學", "會", "廣", "澤", "邊", "邉", "齋", "濱", "﨑", "德", "榮", "壽", "區", "驛", "醫", "鐵", "戀"]);
  const nameOld = new Set(["澤", "邊", "邉", "齋", "齊", "濱", "﨑", "德", "廣", "榮", "壽", "神", "祥", "福", "穗", "鄕", "國", "龍", "櫻", "實"]);
  const commonOld = new Set(["亞", "惡", "壓", "圍", "醫", "爲", "隱", "營", "驛", "應", "歐", "奧", "樂", "學", "關", "觀", "舊", "區", "徑", "輕", "藝", "儉", "劍", "嚴", "廣", "國", "齋", "參", "兒", "實", "壽", "從", "處", "敍", "將", "燒", "證", "讓", "眞", "圖", "數", "聲", "靜", "攝", "專", "戰", "淺", "爭", "總", "聰", "莊", "屬", "續", "體", "對", "臺", "擇", "澤", "擔", "團", "彈", "斷", "遲", "廳", "聽", "鐵", "點", "轉", "傳", "燈", "德", "獨", "讀", "惱", "腦", "廢", "拜", "賣", "麥", "發", "髮", "拔", "祕", "濱", "拂", "變", "邊", "寶", "豐", "滿", "藥", "豫", "餘", "譽", "樣", "謠", "來", "覽", "龍", "禮", "靈", "齡", "歷", "戀", "勞"]);
  const documentOld = new Set(["舊", "學", "體", "會", "國", "縣", "營", "驛", "關", "戰", "廳", "敎", "數", "證", "讀", "觀", "嚴", "鐵", "藝", "靈", "讓", "爲", "據", "覽", "歸", "歷", "畫", "寶", "價", "傳", "圖", "團", "從", "應", "斷", "滿", "稱", "繪", "聲", "號", "譯", "轉", "輕", "驗", "黃", "黑"]);

  const metadata = {
    "亞": { readingJa: "あ", readingEn: "a", meaningJa: "次ぐ・第二の・アジアの音訳など。", meaningEn: "next to, secondary; also used in Asia-related transliterations.", category: "common" },
    "惡": { readingJa: "あく・わるい", readingEn: "aku / warui", meaningJa: "悪いこと・よくない状態。", meaningEn: "bad, evil, undesirable state.", category: "common" },
    "壓": { readingJa: "あつ・おす", readingEn: "atsu / osu", meaningJa: "押しつける・圧力をかける。", meaningEn: "to press; pressure.", category: "common" },
    "醫": { readingJa: "い", readingEn: "i", meaningJa: "病気を治すこと・医療。", meaningEn: "medicine; medical treatment.", category: "common", usageJa: "病院名・古い医学文献で見かけます。", usageEn: "Seen in hospital names and older medical texts." },
    "隱": { readingJa: "いん・かくれる", readingEn: "in / kakureru", meaningJa: "隠れる・見えなくする。", meaningEn: "to hide; conceal.", category: "common" },
    "營": { readingJa: "えい・いとなむ", readingEn: "ei / itonamu", meaningJa: "営む・事業や生活を行う。", meaningEn: "to operate, manage, conduct.", category: "common" },
    "驛": { readingJa: "えき", readingEn: "eki", meaningJa: "駅・交通や宿駅の拠点。", meaningEn: "station; transport post.", category: "common", usageJa: "古い地図・駅名標・文献で見かけます。", usageEn: "Seen in older maps, station signs, and documents." },
    "應": { readingJa: "おう・こたえる", readingEn: "o / kotaeru", meaningJa: "応じる・こたえる・ふさわしく合わせる。", meaningEn: "to respond, answer, correspond to.", category: "common", usageJa: "古い文書・団体名・学校名などで見かけることがあります。", usageEn: "Seen in older documents, organization names, and school names." },
    "歐": { readingJa: "おう", readingEn: "o", meaningJa: "欧州・ヨーロッパを表す字。", meaningEn: "Europe; European.", category: "common" },
    "奧": { readingJa: "おう・おく", readingEn: "o / oku", meaningJa: "奥・深いところ。", meaningEn: "inner part, depth.", category: "common" },
    "樂": { readingJa: "がく・らく・たのしい", readingEn: "gaku / raku / tanoshii", meaningJa: "音楽・楽しむ・楽であること。", meaningEn: "music; enjoyment; ease.", category: "common" },
    "學": { readingJa: "がく・まなぶ", readingEn: "gaku / manabu", meaningJa: "学ぶこと・知識・学問。", meaningEn: "learning, study, scholarship.", category: "popular", usageJa: "学校名・記念碑・古い文献で見かけます。", usageEn: "Seen in school names, monuments, and older texts." },
    "關": { readingJa: "かん・せき", readingEn: "kan / seki", meaningJa: "関所・関係する・かかわる。", meaningEn: "barrier; relation; to be connected.", category: "common" },
    "觀": { readingJa: "かん・みる", readingEn: "kan / miru", meaningJa: "見る・考え方・ものの見方。", meaningEn: "to observe; view; perspective.", category: "common" },
    "舊": { readingJa: "きゅう", readingEn: "kyu", meaningJa: "古い・以前の・昔の。", meaningEn: "old, former, previous.", category: "popular", usageJa: "『舊字』『舊字体』などの表記で見かけます。", usageEn: "Seen in old-style words such as 舊字." },
    "區": { readingJa: "く", readingEn: "ku", meaningJa: "区切る・区域・行政区画。", meaningEn: "district, section, division.", category: "common", usageJa: "行政・地名・古い資料で見かけます。", usageEn: "Seen in administrative, place-name, and older records." },
    "輕": { readingJa: "けい・かるい", readingEn: "kei / karui", meaningJa: "軽い・重くない。", meaningEn: "light; not heavy.", category: "common" },
    "藝": { readingJa: "げい", readingEn: "gei", meaningJa: "技芸・芸術・身につけた技。", meaningEn: "art, skill, craft.", category: "common" },
    "儉": { readingJa: "けん", readingEn: "ken", meaningJa: "つつましい・倹約する。", meaningEn: "frugal, thrifty.", category: "common" },
    "劍": { readingJa: "けん・つるぎ", readingEn: "ken / tsurugi", meaningJa: "剣・刀剣。", meaningEn: "sword, blade.", category: "common" },
    "嚴": { readingJa: "げん・きびしい", readingEn: "gen / kibishii", meaningJa: "厳しい・おごそか。", meaningEn: "strict, solemn, severe.", category: "common" },
    "廣": { readingJa: "こう・ひろい", readingEn: "ko / hiroi", meaningJa: "広い・範囲が大きい。", meaningEn: "wide, broad, spacious.", category: "name", usageJa: "人名・地名・屋号で見かけます。", usageEn: "Seen in names, places, and shop names." },
    "國": { readingJa: "こく・くに", readingEn: "koku / kuni", meaningJa: "国・国家・土地。", meaningEn: "country, nation, land.", category: "popular", usageJa: "古い文書・団体名・地名表記で見かけます。", usageEn: "Seen in older documents, organization names, and place names." },
    "齋": { readingJa: "さい・いつき", readingEn: "sai / itsuki", meaningJa: "斎む・清める・斎場や名に使われる字。", meaningEn: "purification; ritual abstinence; used in names.", category: "name", usageJa: "人名・屋号・寺社名などで見かけます。", usageEn: "Seen in names, shop names, and shrine or temple names." },
    "參": { readingJa: "さん・まいる", readingEn: "san / mairu", meaningJa: "参加する・参る・三の大字的表記。", meaningEn: "to participate; to visit; formal form associated with three.", category: "common" },
    "兒": { readingJa: "じ・こ", readingEn: "ji / ko", meaningJa: "児・こども。", meaningEn: "child.", category: "common" },
    "實": { readingJa: "じつ・み", readingEn: "jitsu / mi", meaningJa: "実・中身・まこと。", meaningEn: "truth, reality, fruit, substance.", category: "name" },
    "壽": { readingJa: "じゅ・ことぶき", readingEn: "ju / kotobuki", meaningJa: "長生き・祝い・めでたいこと。", meaningEn: "longevity, celebration, felicity.", category: "name", usageJa: "人名・祝い事・屋号などで見かけます。", usageEn: "Seen in names, celebratory contexts, and shop names." },
    "從": { readingJa: "じゅう・したがう", readingEn: "ju / shitagau", meaningJa: "従う・つき従う。", meaningEn: "to follow, obey.", category: "common" },
    "處": { readingJa: "しょ・ところ", readingEn: "sho / tokoro", meaningJa: "場所・ところ・処理する。", meaningEn: "place; to deal with or process.", category: "common" },
    "將": { readingJa: "しょう・まさに", readingEn: "sho / masani", meaningJa: "将来・率いる・まさに。", meaningEn: "general; future; about to.", category: "common" },
    "證": { readingJa: "しょう・あかし", readingEn: "sho / akashi", meaningJa: "証明・あかし。", meaningEn: "proof, evidence, certificate.", category: "common" },
    "讓": { readingJa: "じょう・ゆずる", readingEn: "jo / yuzuru", meaningJa: "譲る・ゆずり渡す。", meaningEn: "to transfer, yield, give way.", category: "common" },
    "眞": { readingJa: "しん・まこと", readingEn: "shin / makoto", meaningJa: "真実・まこと。", meaningEn: "truth, reality.", category: "common" },
    "圖": { readingJa: "ず・と", readingEn: "zu / to", meaningJa: "図・絵・計画。", meaningEn: "diagram, drawing, plan.", category: "common" },
    "數": { readingJa: "すう・かず", readingEn: "su / kazu", meaningJa: "数・数量。", meaningEn: "number, quantity.", category: "common" },
    "聲": { readingJa: "せい・こえ", readingEn: "sei / koe", meaningJa: "声・音。", meaningEn: "voice, sound.", category: "common" },
    "靜": { readingJa: "せい・しずか", readingEn: "sei / shizuka", meaningJa: "静か・動きが少ない。", meaningEn: "quiet, calm, still.", category: "common" },
    "專": { readingJa: "せん・もっぱら", readingEn: "sen / moppara", meaningJa: "専ら・ひとつに集中する。", meaningEn: "exclusive, specialized, devoted to.", category: "common" },
    "戰": { readingJa: "せん・たたかう", readingEn: "sen / tatakau", meaningJa: "戦う・戦争。", meaningEn: "war, battle, to fight.", category: "common" },
    "爭": { readingJa: "そう・あらそう", readingEn: "so / arasou", meaningJa: "争う・競う。", meaningEn: "to dispute, compete, fight.", category: "common" },
    "總": { readingJa: "そう・すべて", readingEn: "so / subete", meaningJa: "総じて・すべてをまとめる。", meaningEn: "whole, total, general.", category: "common" },
    "體": { readingJa: "たい・からだ", readingEn: "tai / karada", meaningJa: "体・からだ・形。", meaningEn: "body, form, substance.", category: "popular", usageJa: "古い書籍や旧字表記で見かけます。", usageEn: "Seen in older books and old-style writing." },
    "對": { readingJa: "たい・つい", readingEn: "tai / tsui", meaningJa: "向かい合う・対応する。", meaningEn: "opposite, pair, correspond to.", category: "common" },
    "擔": { readingJa: "たん・になう", readingEn: "tan / ninau", meaningJa: "担う・背負う・担当する。", meaningEn: "to carry, bear, take charge.", category: "common" },
    "團": { readingJa: "だん", readingEn: "dan", meaningJa: "団体・まとまり。", meaningEn: "group, association, mass.", category: "common" },
    "斷": { readingJa: "だん・たつ", readingEn: "dan / tatsu", meaningJa: "断つ・判断する・切る。", meaningEn: "to cut off; decide; judge.", category: "common" },
    "廳": { readingJa: "ちょう", readingEn: "cho", meaningJa: "庁・役所。", meaningEn: "government office, agency.", category: "common" },
    "聽": { readingJa: "ちょう・きく", readingEn: "cho / kiku", meaningJa: "聴く・聞き取る。", meaningEn: "to listen, hear attentively.", category: "common" },
    "鐵": { readingJa: "てつ", readingEn: "tetsu", meaningJa: "鉄・金属の鉄。", meaningEn: "iron, steel.", category: "common", usageJa: "鉄道・会社名・古い表記で見かけます。", usageEn: "Seen in railway, company, and older writing contexts." },
    "點": { readingJa: "てん", readingEn: "ten", meaningJa: "点・しるし・一点。", meaningEn: "point, dot, mark.", category: "common" },
    "轉": { readingJa: "てん・ころがる", readingEn: "ten / korogaru", meaningJa: "転がる・移る・変わる。", meaningEn: "to roll, transfer, change.", category: "common" },
    "傳": { readingJa: "でん・つたえる", readingEn: "den / tsutaeru", meaningJa: "伝える・受け継ぐ。", meaningEn: "to transmit, convey, inherit.", category: "common" },
    "燈": { readingJa: "とう・ひ", readingEn: "to / hi", meaningJa: "灯り・ともしび。", meaningEn: "lamp, light.", category: "common" },
    "德": { readingJa: "とく", readingEn: "toku", meaningJa: "徳・人としてのよさ・道徳的な力。", meaningEn: "virtue, moral excellence.", category: "name", usageJa: "人名・寺社名・古い文書で見かけます。", usageEn: "Seen in names, shrine or temple names, and older documents." },
    "讀": { readingJa: "どく・よむ", readingEn: "doku / yomu", meaningJa: "読む・読み取る。", meaningEn: "to read.", category: "common" },
    "腦": { readingJa: "のう", readingEn: "no", meaningJa: "脳・頭の中枢。", meaningEn: "brain.", category: "common" },
    "廢": { readingJa: "はい・すたれる", readingEn: "hai / sutareru", meaningJa: "廃れる・やめる・使わなくなる。", meaningEn: "to abolish, discontinue, fall into disuse.", category: "common" },
    "賣": { readingJa: "ばい・うる", readingEn: "bai / uru", meaningJa: "売る・販売する。", meaningEn: "to sell.", category: "common" },
    "發": { readingJa: "はつ・ほつ", readingEn: "hatsu / hotsu", meaningJa: "発する・出る・始まる。", meaningEn: "to emit, depart, begin.", category: "common" },
    "髮": { readingJa: "はつ・かみ", readingEn: "hatsu / kami", meaningJa: "髪・頭髪。", meaningEn: "hair of the head.", category: "common" },
    "祕": { readingJa: "ひ・ひめる", readingEn: "hi / himeru", meaningJa: "秘密・隠す。", meaningEn: "secret, hidden.", category: "common" },
    "濱": { readingJa: "ひん・はま", readingEn: "hin / hama", meaningJa: "浜・水辺。", meaningEn: "beach, shore, waterside.", category: "name", usageJa: "人名・地名で見かけます。", usageEn: "Seen in personal and place names." },
    "變": { readingJa: "へん・かわる", readingEn: "hen / kawaru", meaningJa: "変わる・変える。", meaningEn: "to change; unusual.", category: "common" },
    "邊": { readingJa: "へん・べ・あたり", readingEn: "hen / be / atari", meaningJa: "あたり・周辺・端。", meaningEn: "edge, vicinity, side.", category: "name", usageJa: "人名で見かけます。", usageEn: "Seen in personal names." },
    "邉": { readingJa: "へん・べ・あたり", readingEn: "hen / be / atari", meaningJa: "あたり・周辺・端。", meaningEn: "edge, vicinity, side.", category: "name", usageJa: "辺の異体字・旧字系表記。人名で見かけます。", usageEn: "Variant old-style form related to 辺. Seen in personal names." },
    "寶": { readingJa: "ほう・たから", readingEn: "ho / takara", meaningJa: "宝・大切なもの。", meaningEn: "treasure, precious thing.", category: "common" },
    "豐": { readingJa: "ほう・ゆたか", readingEn: "ho / yutaka", meaningJa: "豊か・多い・満ちている。", meaningEn: "abundant, rich, plentiful.", category: "common" },
    "滿": { readingJa: "まん・みちる", readingEn: "man / michiru", meaningJa: "満ちる・いっぱいになる。", meaningEn: "to be full, satisfied.", category: "common" },
    "藥": { readingJa: "やく・くすり", readingEn: "yaku / kusuri", meaningJa: "薬・治療に使うもの。", meaningEn: "medicine, drug.", category: "common" },
    "豫": { readingJa: "よ・あらかじめ", readingEn: "yo / arakajime", meaningJa: "予め・前もって。", meaningEn: "beforehand, in advance.", category: "common" },
    "餘": { readingJa: "よ・あまり", readingEn: "yo / amari", meaningJa: "余り・残り。", meaningEn: "remainder, excess.", category: "common" },
    "樣": { readingJa: "よう・さま", readingEn: "yo / sama", meaningJa: "様子・形式・敬称。", meaningEn: "manner, form, honorific title.", category: "common" },
    "來": { readingJa: "らい・くる", readingEn: "rai / kuru", meaningJa: "来る・これから。", meaningEn: "to come; future.", category: "common" },
    "覽": { readingJa: "らん・みる", readingEn: "ran / miru", meaningJa: "一覧する・見る。", meaningEn: "to look over, view, inspect.", category: "common" },
    "龍": { readingJa: "りゅう・たつ", readingEn: "ryu / tatsu", meaningJa: "竜・伝説上の生き物。", meaningEn: "dragon, mythical creature.", category: "name" },
    "禮": { readingJa: "れい", readingEn: "rei", meaningJa: "礼・作法・敬意。", meaningEn: "courtesy, ritual, respect.", category: "common" },
    "靈": { readingJa: "れい・たま", readingEn: "rei / tama", meaningJa: "霊・魂・不思議な力。", meaningEn: "spirit, soul, supernatural force.", category: "common" },
    "齡": { readingJa: "れい・よわい", readingEn: "rei / yowai", meaningJa: "年齢・年。", meaningEn: "age, years.", category: "common" },
    "歷": { readingJa: "れき", readingEn: "reki", meaningJa: "歴史・経過。", meaningEn: "history, passage of time.", category: "common" },
    "戀": { readingJa: "れん・こい", readingEn: "ren / koi", meaningJa: "恋・慕う気持ち。", meaningEn: "love, longing.", category: "common", usageJa: "文学作品・古い歌詞・装飾的な表記で見かけます。", usageEn: "Seen in literature, older lyrics, and decorative writing." },
    "勞": { readingJa: "ろう・いたわる", readingEn: "ro / itawaru", meaningJa: "労働・苦労・いたわる。", meaningEn: "labor, toil, care.", category: "common" }
  };

  const blockRanges = [
    { name: { ja: "CJK統合漢字拡張A", en: "CJK Unified Ideographs Extension A" }, start: 0x3400, end: 0x4dbf },
    { name: { ja: "CJK統合漢字", en: "CJK Unified Ideographs" }, start: 0x4e00, end: 0x9fff },
    { name: { ja: "CJK互換漢字", en: "CJK Compatibility Ideographs" }, start: 0xf900, end: 0xfaff },
    { name: { ja: "康熙部首", en: "Kangxi Radicals" }, start: 0x2f00, end: 0x2fdf },
    { name: { ja: "CJK統合漢字拡張B", en: "CJK Unified Ideographs Extension B" }, start: 0x20000, end: 0x2a6df },
    { name: { ja: "CJK統合漢字拡張C", en: "CJK Unified Ideographs Extension C" }, start: 0x2a700, end: 0x2b73f },
    { name: { ja: "CJK統合漢字拡張D", en: "CJK Unified Ideographs Extension D" }, start: 0x2b740, end: 0x2b81f },
    { name: { ja: "CJK統合漢字拡張E", en: "CJK Unified Ideographs Extension E" }, start: 0x2b820, end: 0x2ceaf },
    { name: { ja: "CJK統合漢字拡張F", en: "CJK Unified Ideographs Extension F" }, start: 0x2ceb0, end: 0x2ebef },
    { name: { ja: "CJK統合漢字拡張G", en: "CJK Unified Ideographs Extension G" }, start: 0x30000, end: 0x3134f },
    { name: { ja: "記号など", en: "Symbols & Others" }, start: 0, end: 0x10ffff }
  ];

  function getBlockName(char) {
    const code = char.codePointAt(0);
    const found = blockRanges.find(range => code >= range.start && code <= range.end);
    return found ? found.name : { ja: "その他", en: "Other" };
  }

  function getCategory(oldChar) {
    if (metadata[oldChar]?.category) return metadata[oldChar].category;
    if (popularOld.has(oldChar)) return "popular";
    if (nameOld.has(oldChar)) return "name";
    if (commonOld.has(oldChar)) return "common";
    if (documentOld.has(oldChar)) return "document";
    return "rare";
  }

  function getNewText(newChar) {
    return Array.isArray(newChar) ? newChar.join("、") : String(newChar || "");
  }

  function labelForCategory(category) {
    const found = filters.find(item => item.id === category);
    return found ? found[currentLang] : filters[filters.length - 1][currentLang];
  }

  function switchLang(lang) {
    currentLang = lang === "en" ? "en" : "ja";
    document.documentElement.lang = currentLang;
    document.querySelectorAll("[data-i18n]").forEach(el => { el.style.display = el.dataset.i18n === currentLang ? "" : "none"; });
    document.querySelectorAll(".nw-lang-switch button[data-lang]").forEach(btn => { btn.classList.toggle("active", btn.dataset.lang === currentLang); });
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      const ja = searchInput.dataset.placeholderJa || messages.ja.placeholder;
      const en = searchInput.dataset.placeholderEn || messages.en.placeholder;
      searchInput.placeholder = currentLang === "en" ? en : ja;
    }
  }

  function showToast(text) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 1600);
  }

  async function loadDict() {
    const res = await fetch("./dict.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load dict.json");
    return res.json();
  }

  function setCounts(dict) {
    const oldCount = Object.keys(dict.old_to_new || {}).length;
    document.querySelectorAll('[data-count="old"]').forEach(el => { el.textContent = oldCount; });
  }

  function setStatusText(text) {
    const el = document.getElementById("statusMessage");
    if (el) el.textContent = text || "";
  }

  function setStatus(messageKey) { setStatusText(messageKey ? (messages[currentLang][messageKey] || "") : ""); }

  function buildEntries(dict) {
    entriesCache = Object.entries(dict.old_to_new || {}).map(([oldChar, newChar]) => {
      const newText = getNewText(newChar);
      const meta = metadata[oldChar] || {};
      return {
        oldChar,
        newText,
        block: getBlockName(oldChar),
        category: getCategory(oldChar),
        readingJa: meta.readingJa || "",
        readingEn: meta.readingEn || "",
        meaningJa: meta.meaningJa || "",
        meaningEn: meta.meaningEn || "",
        usageJa: meta.usageJa || "",
        usageEn: meta.usageEn || ""
      };
    });
    entriesCache.sort((a, b) => a.oldChar.localeCompare(b.oldChar, "ja"));
    return entriesCache;
  }

  function addI18nLine(parent, className, jaLabel, enLabel, jaText, enText) {
    if (!jaText && !enText) return;
    const p = document.createElement("p");
    p.className = className;
    p.innerHTML = `<span data-i18n="ja">${jaLabel}：${jaText}</span><span data-i18n="en">${enLabel}: ${enText || jaText}</span>`;
    parent.appendChild(p);
  }

  function createCopyButton(value, kind) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy-btn";
    btn.dataset.copyValue = value;
    btn.dataset.copyKind = kind;
    btn.innerHTML = kind === "new" ? '<span data-i18n="ja">新字をコピー</span><span data-i18n="en">Copy modern</span>' : '<span data-i18n="ja">旧字をコピー</span><span data-i18n="en">Copy old</span>';
    return btn;
  }

  function createEntryCard(entry, compact) {
    const card = document.createElement("article");
    card.className = compact ? "kanji-card popular-card" : "kanji-card";
    card.dataset.old = entry.oldChar;
    card.dataset.new = entry.newText;
    card.dataset.reading = `${entry.readingJa} ${entry.readingEn}`;
    card.dataset.category = entry.category;

    const pair = document.createElement("div");
    pair.className = "kanji-pair";
    pair.innerHTML = `<div class="kanji-old">${entry.oldChar}</div><div class="kanji-arrow" aria-hidden="true">→</div><div class="kanji-new">${entry.newText}</div>`;
    card.appendChild(pair);

    addI18nLine(card, "kanji-reading", "読み", "Reading", entry.readingJa, entry.readingEn);
    addI18nLine(card, "kanji-meaning", "意味", "Meaning", entry.meaningJa, entry.meaningEn);
    if (!compact) addI18nLine(card, "kanji-usage", "用途", "Usage", entry.usageJa, entry.usageEn);

    const meta = document.createElement("p");
    meta.className = "kanji-meta";
    meta.innerHTML = `<span data-i18n="ja">分類：${labelForCategory(entry.category)}</span><span data-i18n="en">Category: ${labelForCategory(entry.category)}</span>`;
    card.appendChild(meta);

    const actions = document.createElement("div");
    actions.className = "copy-actions";
    actions.appendChild(createCopyButton(entry.oldChar, "old"));
    actions.appendChild(createCopyButton(entry.newText, "new"));
    card.appendChild(actions);
    return card;
  }

  function renderFilters() {
    const wrap = document.getElementById("filterButtons");
    if (!wrap) return;
    wrap.innerHTML = "";
    filters.forEach(filter => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "filter-btn";
      btn.dataset.filter = filter.id;
      btn.textContent = filter[currentLang];
      btn.classList.toggle("active", filter.id === currentFilter);
      btn.addEventListener("click", () => { currentFilter = filter.id; renderAll(); });
      wrap.appendChild(btn);
    });
  }

  function renderPopular() {
    const container = document.getElementById("popularContainer");
    if (!container) return;
    container.innerHTML = "";
    entriesCache.filter(entry => popularOld.has(entry.oldChar)).slice(0, 20).forEach(entry => container.appendChild(createEntryCard(entry, true)));
  }

  function getFilteredEntries() {
    const q = currentQuery.trim().toLowerCase();
    return entriesCache.filter(entry => {
      const matchesFilter = currentFilter === "all" || entry.category === currentFilter || (currentFilter === "popular" && popularOld.has(entry.oldChar));
      const haystack = `${entry.oldChar} ${entry.newText} ${entry.readingJa} ${entry.readingEn} ${entry.meaningJa} ${entry.meaningEn} ${entry.usageJa} ${entry.usageEn} ${labelForCategory(entry.category)}`.toLowerCase();
      return matchesFilter && (!q || haystack.includes(q));
    });
  }

  function renderGroups(entries) {
    const container = document.getElementById("groupContainer");
    const emptyMessage = document.getElementById("emptyMessage");
    if (!container || !emptyMessage) return;
    container.innerHTML = "";
    emptyMessage.hidden = entries.length > 0;
    if (!entries.length) {
      emptyMessage.querySelector('[data-i18n="ja"]').textContent = messages.ja.noMatch;
      emptyMessage.querySelector('[data-i18n="en"]').textContent = messages.en.noMatch;
      return;
    }
    const grouped = new Map();
    entries.forEach(entry => {
      const key = currentLang === "en" ? entry.block.en : entry.block.ja;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(entry);
    });
    Array.from(grouped.keys()).sort((a, b) => a.localeCompare(b, "ja")).forEach(key => {
      const groupSection = document.createElement("section");
      groupSection.className = "group-section";
      const heading = document.createElement("h3");
      heading.className = "group-heading";
      heading.innerHTML = `${key} <span class="badge">${grouped.get(key).length}</span>`;
      const grid = document.createElement("div");
      grid.className = "kanji-grid";
      grouped.get(key).forEach(entry => grid.appendChild(createEntryCard(entry, false)));
      groupSection.appendChild(heading);
      groupSection.appendChild(grid);
      container.appendChild(groupSection);
    });
  }

  function updateStatus(visibleCount) {
    const total = entriesCache.length;
    const isSearch = currentQuery.trim().length > 0 || currentFilter !== "all";
    setStatusText(currentLang === "en" ? `${isSearch ? messages.en.searchResults : messages.en.showing}: ${visibleCount} / ${total}` : `${isSearch ? messages.ja.searchResults : messages.ja.showing}：${visibleCount}件 / ${messages.ja.total}${total}件`);
  }

  function renderAll() {
    renderFilters();
    renderPopular();
    const filtered = getFilteredEntries();
    renderGroups(filtered);
    updateStatus(filtered.length);
    switchLang(currentLang);
  }

  function copyWithFallback(value) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(value);
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    return Promise.resolve();
  }

  function handleCopy(target) {
    const value = target.dataset.copyValue;
    const kind = target.dataset.copyKind || "old";
    if (!value) return;
    copyWithFallback(value).then(() => {
      const label = kind === "new" ? messages[currentLang].copiedNew : messages[currentLang].copiedOld;
      showToast(`${label}：${value}`);
    }).catch(() => showToast(value));
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".nw-lang-switch button[data-lang]").forEach(btn => { btn.addEventListener("click", () => { currentLang = btn.dataset.lang === "en" ? "en" : "ja"; renderAll(); }); });
    const searchInput = document.getElementById("searchInput");
    if (searchInput) searchInput.addEventListener("input", () => { currentQuery = searchInput.value || ""; renderAll(); });
    document.addEventListener("click", ev => { const target = ev.target.closest(".copy-btn"); if (target) handleCopy(target); });
    switchLang(currentLang);
    setStatus("loading");
    loadDict().then(dict => { setCounts(dict); buildEntries(dict); renderAll(); }).catch(() => setStatus("loadError"));
  });
})();
