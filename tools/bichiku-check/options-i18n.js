/* Localized reference text. Product instructions always override generic planning examples. */
(function(){
"use strict";
const dict={
ja:{
title:"具体的な食品・防災用品・代用品",
intro:"「食料」「寝具」だけで終わらず、具体的な選択肢を比較します。実際に使える条件を確認し、必要なものだけ追加してください。",
search:"品名・用途で検索（例：ツナ缶、段ボール）",show:"具体例・代用品を見る",hide:"具体例を閉じる",all:"すべて",food:"食品",warmth:"寝具・防寒",toilet:"トイレ・衛生",water:"水",power:"照明・電源・道具",other:"その他",
dedicated:"非常用",normal:"普段使い",improvised:"緊急代用",full:"用途を満たす候補",conditional:"条件付き・自動算入なし",supplement:"補助・自動算入なし",
ready:"加熱・追加水なし",waterNeed:"飲める水が必要",heat:"加熱が必要",verify:"製品表示を確認",none:"使用条件を確認",
staple:"主食",protein:"たんぱく質",vegetable:"野菜・副菜",fruit:"果物",snack:"間食",hydration:"水分",floor:"床面断熱",warmthRole:"体の保温",sanitation:"排泄・衛生",equipment:"食事道具",light:"照明",powerRole:"電源",hygiene:"清潔",shelter:"雨・風",
owned:"保有分を登録",units:"利用できる数量",expiry:"期限（任意）",info:"使用条件・注意",amazon:"Amazon.co.jpで探す",noMatches:"一致する品目がありません。",notCounted:"この候補は必要数の充足に自動算入しません。",counts:"登録数量は上の必要数に合算されます（同じ品を二重登録しないでください）。",limited:"代用品は専用品と同じ性能を保証しません。",waterUnit:"飲用水のL数を入力",foodUnit:"主食として使える食数を入力（1包装＝1食とは限りません）",toiletUnit:"実際に使用できる回数を入力",pieceUnit:"必要数を満たせる人数・セット数を入力",unchanged:"この分類への登録分を除いた所持数",integrated:"具体的な品目の登録分も不足計算に含めています。",noHeatWarning:"加熱できない条件では、加熱が必要な品目は不足解消に算入しません。水戻しも飲用可能な水と製品説明が必要です。",
notes:{
potable:"アルファ米は水でも戻せる製品があります。必要な飲用水と戻し時間は製品の指示で確認。",
package:"戻し方・保存条件・必要水量は製品ごとに確認。",
portion:"食数は実際に食べられる量で登録。お菓子だけで栄養が足りるとは限りません。",
storage:"常温保存可能な未開封品か、期限・保管条件を個別確認。",
cook:"原則として加熱・調理が必要です。加熱できないときの食事として自動計上しません。",
noColdAssumption:"水に浸す方法が話題でも、すべての即席麺に安全性や適切な時間が保証されるわけではありません。製品表示・飲用水・衛生条件を優先。",
oats:"オートミールはタイプにより要加熱です。冷水で食べられると決めつけず、製品表示を確認。",
notMeal:"おかず・副菜として役立ちますが、1缶を主食1食として自動換算しません。",
retort:"通常の調理済みレトルト食品はそのまま食べられるものがあります。個別の加熱表示を確認。",
allergen:"アレルゲンや窒息の危険に注意。幼児等には適した食品を別途確認。",
heatDamage:"暑さで溶けたり品質が変化する可能性があります。",
waterLiters:"本数ではなく確保した飲用可能な水の総量（L）で登録。容器の清潔さも確認。",
notGuaranteed:"携帯浄水器だけで水の安全を保証できません。対象とする汚染物質・使用条件を製品で確認。",
floor:"床面との間に空気層・厚みをつくる用途です。素材・厚み・避難先の条件で効果が変わります。",
thin:"薄いシートだけでは床の冷えや硬さを十分に防げない場合があります。実物の厚みを確認。",
temporary:"一時的な代用例です。濡れ・汚れ・圧縮に弱く、専用マットと同等とはみなしません。",
space:"自宅にある寝具を活用できますが、持ち出し袋には重量・体積の制約があります。",
dry:"濡れた寝具は保温性が下がります。保管場所を確認。",
temperature:"想定する寒さに対応する温度域や使用条件を製品表示で確認。",
sheet:"アルミシートは熱の放射や風を抑える補助に使えますが、床用マット・毛布の完全な代用品ではありません。密閉・窒息に注意。",
weather:"雨風や日射、設置条件で有効性が変わります。",
burns:"低温やけどや火気・密閉使用に注意。製品指示を守ってください。",
kitUses:"使用可能回数と便袋・凝固剤・保管袋の同梱数を確認し、回数で登録。",
toiletCompatibility:"便袋・凝固剤・便座など必要部品が揃っていることを確認。部品単体では回数として算入しません。",
toiletFallback:"東京都が紹介する緊急対応例。吸収材・処分方法・衛生面に制約があり、専用トイレと同じとはみなしません。",
waste:"使用後の保管・悪臭対策と自治体のごみ処理方針を確認。",
foodContact:"食品に触れる用途では食品用の清潔な製品を使用。",
battery:"電池残量・交換用電池や充電方式を確認。",
hygiene:"断水時の衛生確保に役立ちますが、水と石けんによる手洗いの完全な代わりではありません。",
suffocation:"ポリ袋は一時的な雨よけに留め、顔・呼吸器を覆わず、子どもへの使用には特に注意。",
sanitaryContainer:"飲用の水を運ぶなら食品用容器の清潔さ・表示を確認。"
}},
en:{
title:"Specific supplies and practical substitutes",intro:"Explore actual foods, bedding, everyday alternatives and emergency fallbacks, not just broad categories. Check conditions before counting or buying.",search:"Search food or item (e.g. tuna, cardboard)",show:"Browse specific options",hide:"Close options",all:"All",food:"Food",warmth:"Bedding & warmth",toilet:"Toilet & hygiene",water:"Water",power:"Lights, power & tools",other:"Other",
dedicated:"Emergency product",normal:"Everyday item",improvised:"Emergency fallback",full:"Can fulfil purpose",conditional:"Conditional — not auto-counted",supplement:"Supplement — not auto-counted",ready:"No cooking / extra water",waterNeed:"Drinking-safe water needed",heat:"Heating required",verify:"Check product label",none:"Check usage conditions",
staple:"Staple food",protein:"Protein",vegetable:"Vegetables",fruit:"Fruit",snack:"Snack",hydration:"Hydration",floor:"Floor insulation",warmthRole:"Body warmth",sanitation:"Toilet / hygiene",equipment:"Meal equipment",light:"Lighting",powerRole:"Power",hygiene:"Hygiene",shelter:"Rain / wind",
owned:"Record what you own",units:"Usable amount",expiry:"Expiry (optional)",info:"Limits & cautions",amazon:"Search Amazon Japan",noMatches:"No matching options.",notCounted:"This option does not automatically satisfy the required quantity.",counts:"Entered units count toward the above target. Do not count the same item twice.",limited:"An improvised substitute is not guaranteed to perform like dedicated equipment.",waterUnit:"Enter total drinking-water liters, not bottle count",foodUnit:"Enter usable staple portions (one pack may not equal one full meal)",toiletUnit:"Enter actual usable toilet events",pieceUnit:"Enter persons / sets this equipment can cover",unchanged:"Other holdings, excluding detailed entries",integrated:"Specific holdings below are included in shortages above.",noHeatWarning:"When heating is unavailable, heat-dependent food cannot meet your target. Water-prepared food still needs safe water and product instructions.",
notes:{
potable:"Some alpha-rice products rehydrate with water. Follow the product's safe-water quantity and preparation time.",
package:"Preparation time, water needed and storage conditions vary by product.",
portion:"Enter realistic portions. Snacks alone do not provide balanced nutrition.",
storage:"Verify unopened shelf-stability, expiry and storage temperature on the label.",
cook:"Usually requires cooking or heating. Not counted as no-heat food.",
noColdAssumption:"Water soaking is discussed online, but safety and times cannot be assumed for every noodle product. Follow labeling, potable water and hygiene.",
oats:"Oats vary: some are ready-to-eat and others require cooking. Check instructions before cold preparation.",
notMeal:"Useful as protein or vegetables, but one can is not automatically one staple meal.",
retort:"Many fully sterilized retort foods can be eaten unheated; verify the product label.",
allergen:"Check allergens and choking hazards, especially for young children.",
heatDamage:"Warm temperatures may affect quality or cause melting.",
waterLiters:"Record the total safe drinking-water volume in liters, not the number of bottles.",
notGuaranteed:"A portable filter does not guarantee water safety against every contaminant. Check certified scope and conditions.",
floor:"Creates insulation between the body and floor; thickness and conditions matter.",
thin:"A thin sheet may be insufficient against hard or cold flooring.",
temporary:"Temporary fallback only; vulnerable to moisture, contamination and compression.",
space:"Household bedding may be too bulky or heavy for evacuation.",
dry:"Wet bedding may lose insulation; check storage conditions.",
temperature:"Check the product's appropriate temperature range and use instructions.",
sheet:"Reflective sheets can help reduce wind and radiant heat loss, but cannot fully replace an insulated mat or blanket. Avoid suffocation hazards.",
weather:"Performance depends on conditions including wind, rain and sunlight.",
burns:"Follow warnings about low-temperature burns, fire and enclosed spaces.",
kitUses:"Count the actual available uses, including matching bags, solidifier and disposal supplies.",
toiletCompatibility:"Verify that the bags, absorbent/solidifier, toilet seat and storage supplies work together.",
toiletFallback:"Emergency option described by Tokyo government; not equivalent to a complete toilet kit, and disposal/hygiene remain critical.",
waste:"Plan sealed storage, odor control and local waste disposal rules.",
foodContact:"Use clean, food-contact-safe products for food applications.",
battery:"Check remaining battery charge and compatible replacement batteries.",
hygiene:"Helpful when water is unavailable but not a complete substitute for washing with soap and water.",
suffocation:"Only use as a temporary rain barrier; never cover faces or airways, especially around children.",
sanitaryContainer:"For drinking water, use a clean food-safe container and follow its instructions."
}},
zh:{
title:"具体防灾用品及替代方案",intro:"不只显示宽泛分类，还可比较食品、寝具、日用品及紧急替代方案。使用前核对条件。",search:"搜索食品或用品（如：金枪鱼、纸板）",show:"查看具体用品与替代品",hide:"收起用品",all:"全部",food:"食品",warmth:"寝具与保暖",toilet:"厕所与卫生",water:"饮水",power:"照明、电源及工具",other:"其他",
dedicated:"应急专用",normal:"日常用品",improvised:"临时替代",full:"可满足用途",conditional:"有条件／不自动计入",supplement:"辅助／不自动计入",ready:"无需加热或额外水",waterNeed:"需要安全饮用水",heat:"需加热",verify:"核对产品标签",none:"确认使用条件",
staple:"主食",protein:"蛋白质",vegetable:"蔬菜",fruit:"水果",snack:"零食",hydration:"饮水",floor:"地面隔热",warmthRole:"身体保暖",sanitation:"排泄卫生",equipment:"餐具",light:"照明",powerRole:"电源",hygiene:"清洁",shelter:"防雨防风",
owned:"登记已有数量",units:"可使用数量",expiry:"有效期（可选）",info:"限制与注意",amazon:"在日本亚马逊查找",noMatches:"未找到匹配用品。",notCounted:"该用品不会自动计入足量判断。",counts:"填写的数量将计入上述需求，注意避免重复计算。",limited:"临时替代用品不保证与防灾专用品性能相同。",waterUnit:"填写可饮用水的总升数，而非瓶数",foodUnit:"填写实际可食用的主食份数（每包未必等于一餐）",toiletUnit:"填写可实际使用的次数",pieceUnit:"填写可供使用的人数或套数",unchanged:"其他存货（不含下面的具体登记）",integrated:"登记的具体用品会计入上方不足数量。",noHeatWarning:"无法加热时，需加热食品不会计入准备完成数量。用水冲泡仍须保证水质安全并遵守说明。",
notes:{
potable:"有些应急米饭可用冷饮用水泡发，请按产品要求核对水量和时间。",package:"水量、准备方法和储存条件以产品说明为准。",portion:"按实际可食用的份数填写。零食不代表营养充足。",storage:"核对是否可常温未开封保存及期限。",cook:"通常必须烹煮，无法加热时不计入。",noColdAssumption:"不可假设所有方便面均可安全冷水泡发，需以产品说明、饮用水和卫生条件为准。",oats:"燕麦品种不同，有些需要煮熟。请核对包装说明。",notMeal:"可补充蛋白质或蔬菜，但一罐不等于一份主食。",retort:"许多灭菌即食袋装食品可常温食用，仍须核对标签。",allergen:"注意过敏原、噎食风险，尤其是幼儿。",heatDamage:"高温可能影响品质或导致融化。",waterLiters:"按可安全饮用的水总升数登记，不按瓶数。",notGuaranteed:"便携净水器不能去除所有污染物，请核对产品适用范围。",floor:"与地面间隔热，效果取决于厚度和环境。",thin:"薄垫可能无法有效隔绝地面寒冷或坚硬。",temporary:"仅临时使用，易受潮、污染及压扁。",space:"家用寝具可能过重过大，难以携带。",dry:"潮湿寝具保温效果降低。",temperature:"检查产品适用温度及使用方法。",sheet:"反光保温毯可辅助防风保温，但不能完全替代地垫或毛毯，注意窒息风险。",weather:"效果受风雨、日照及使用环境影响。",burns:"注意低温烫伤、火源和封闭空间。",kitUses:"确认袋、凝固剂和收纳用品的数量，按可使用次数登记。",toiletCompatibility:"确认便袋、凝固剂、便座等部件配套。",toiletFallback:"东京都介绍的紧急方法，但与完整应急厕所不等效，仍需卫生处置。",waste:"考虑密封保存、防臭和当地垃圾处理规定。",foodContact:"接触食物时须使用干净的食品级用品。",battery:"确认电量和兼容的备用电池。",hygiene:"断水时有帮助，但不能完全替代肥皂和清水洗手。",suffocation:"仅作临时挡雨，不可遮盖口鼻，尤其注意儿童。",sanitaryContainer:"运输饮用水须使用干净、食品级容器。"
}},
vi:{
title:"Đồ dự phòng cụ thể và vật thay thế",intro:"So sánh từng loại thực phẩm, đồ ngủ, đồ thường dùng và vật thay thế tạm thời. Kiểm tra điều kiện trước khi tính là đã đủ.",search:"Tìm món ăn hoặc vật dụng (ví dụ: cá hộp, carton)",show:"Xem vật dụng và đồ thay thế",hide:"Đóng danh sách",all:"Tất cả",food:"Thực phẩm",warmth:"Ngủ & giữ ấm",toilet:"Vệ sinh",water:"Nước",power:"Đèn, nguồn điện & dụng cụ",other:"Khác",
dedicated:"Đồ khẩn cấp",normal:"Đồ dùng hằng ngày",improvised:"Thay thế tạm",full:"Có thể đáp ứng nhu cầu",conditional:"Có điều kiện — không tự cộng",supplement:"Bổ trợ — không tự cộng",ready:"Không cần nấu / thêm nước",waterNeed:"Cần nước uống an toàn",heat:"Cần đun nóng",verify:"Kiểm tra nhãn",none:"Kiểm tra cách dùng",
staple:"Thực phẩm chính",protein:"Chất đạm",vegetable:"Rau củ",fruit:"Trái cây",snack:"Ăn nhẹ",hydration:"Nước uống",floor:"Cách nhiệt sàn",warmthRole:"Giữ ấm cơ thể",sanitation:"Vệ sinh / nhà vệ sinh",equipment:"Dụng cụ ăn",light:"Chiếu sáng",powerRole:"Nguồn điện",hygiene:"Vệ sinh",shelter:"Mưa / gió",
owned:"Ghi lượng đang có",units:"Lượng dùng được",expiry:"Hạn dùng (tùy chọn)",info:"Giới hạn và lưu ý",amazon:"Tìm trên Amazon Nhật",noMatches:"Không có vật dụng phù hợp.",notCounted:"Vật dụng này không tự động tính là đáp ứng nhu cầu.",counts:"Số lượng nhập được tính vào nhu cầu phía trên. Tránh ghi trùng.",limited:"Vật thay thế tạm thời không đảm bảo hiệu quả như đồ chuyên dụng.",waterUnit:"Nhập tổng số lít nước uống an toàn, không phải số chai",foodUnit:"Nhập số phần ăn chính thực tế, không mặc định 1 gói = 1 bữa",toiletUnit:"Nhập số lượt sử dụng nhà vệ sinh thực tế",pieceUnit:"Nhập số người / bộ mà vật dụng đáp ứng",unchanged:"Đồ khác đang có (không gồm mục chi tiết)",integrated:"Đồ nhập chi tiết đã được tính vào phần thiếu phía trên.",noHeatWarning:"Khi không có nguồn đun, thức ăn cần nấu không được tính là đủ. Món ngâm nước vẫn cần nước uống an toàn và hướng dẫn sản phẩm.",
notes:{
potable:"Một số cơm khô khẩn cấp có thể hoàn nguyên bằng nước; xem lượng nước và thời gian trên nhãn.",package:"Lượng nước, cách chế biến và bảo quản tùy từng sản phẩm.",portion:"Ghi số phần ăn thực tế; đồ ăn nhẹ không đảm bảo dinh dưỡng cân bằng.",storage:"Kiểm tra khả năng bảo quản ở nhiệt độ phòng khi chưa mở và hạn dùng.",cook:"Thường cần nấu hoặc đun; không tính khi không thể đun nóng.",noColdAssumption:"Không thể giả định mọi loại mì đều an toàn khi ngâm nước lạnh. Hãy theo nhãn, nước sạch và vệ sinh.",oats:"Yến mạch có nhiều loại, một số cần nấu. Hãy kiểm tra nhãn trước khi ngâm nguội.",notMeal:"Bổ sung đạm hoặc rau nhưng một hộp không đương nhiên là một bữa chính.",retort:"Nhiều món đóng túi tiệt trùng ăn được không cần hâm; hãy kiểm tra nhãn.",allergen:"Lưu ý dị ứng và nguy cơ nghẹn, nhất là với trẻ nhỏ.",heatDamage:"Nhiệt độ cao có thể làm thay đổi chất lượng hoặc làm chảy.",waterLiters:"Nhập tổng lít nước uống an toàn, không phải số chai.",notGuaranteed:"Bộ lọc di động không đảm bảo xử lý mọi chất ô nhiễm; kiểm tra phạm vi sản phẩm.",floor:"Cách nhiệt với mặt sàn; hiệu quả phụ thuộc độ dày và điều kiện.",thin:"Tấm mỏng có thể không đủ cách nhiệt hay giảm cứng của sàn.",temporary:"Chỉ dùng tạm; dễ bị ướt, bẩn và nén xẹp.",space:"Chăn đệm gia đình có thể quá cồng kềnh để sơ tán.",dry:"Đồ ngủ ướt làm giảm khả năng giữ nhiệt.",temperature:"Kiểm tra nhiệt độ sử dụng phù hợp và hướng dẫn.",sheet:"Tấm phản quang hỗ trợ chống gió và giữ nhiệt nhưng không thể thay hoàn toàn đệm hay chăn. Tránh nguy cơ ngạt.",weather:"Hiệu quả phụ thuộc thời tiết, gió và ánh nắng.",burns:"Chú ý bỏng nhiệt thấp, lửa và không gian kín.",kitUses:"Đếm số lượt thực tế gồm túi, chất làm đông và đồ chứa.",toiletCompatibility:"Kiểm tra túi, chất hút đông, bệ ngồi và đồ chứa tương thích.",toiletFallback:"Biện pháp tạm do Tokyo giới thiệu, không tương đương bộ vệ sinh hoàn chỉnh; cần xử lý vệ sinh.",waste:"Tính đến đóng kín, mùi và quy định rác địa phương.",foodContact:"Chỉ dùng vật dụng sạch, an toàn tiếp xúc thực phẩm.",battery:"Kiểm tra pin còn lại và pin thay thế phù hợp.",hygiene:"Giúp khi thiếu nước, nhưng không thay thế hoàn toàn rửa tay bằng nước và xà phòng.",suffocation:"Chỉ che mưa tạm; không bao kín mặt hoặc đường thở, nhất là trẻ nhỏ.",sanitaryContainer:"Đựng nước uống cần vật chứa sạch, đạt chuẩn thực phẩm."
}}};
for(const [lang,d] of Object.entries(dict)) {
  for(const key of Object.keys(dict.ja)) if(!(key in d))throw Error(lang+" missing "+key);
  for(const key of Object.keys(dict.ja.notes)) if(!(key in d.notes))throw Error(lang+" warning missing "+key);
}
window.BICHIKU_OPTIONS_UI = Object.freeze(dict);
})();
