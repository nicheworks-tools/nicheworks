/* Static, reviewed UI strings. No online translation service or user-input transmission. */
(function(){
"use strict";
var keys = [
"config","home","go","family","adults","children","infants","pets","days","conditions",
"noHeat","diet","budget","budgetHelp","calculate","results","needed","owned","missing",
"expiry","expired","priority1","priority2","priority3","amazon","stockHelp",
"core","shortages","complete","all","onlyMissing","onlyComplete","print","download",
"copy","reset","confirmReset","noMissing","noHeatNote","homeNote","goNote",
"infantNote","dietNote","budgetNote","pricesNote","affiliateNote","privacy",
"references","source1","source2","disclaimer","donate","support","have",
"needs","addStock","loading","copied","tapAmazon","extra","expiredHelp","sourced",
"goExample","qtyRule","footer","language"
];
var all = {
ja: [
"備える条件を設定","自宅で備える","持ち出し袋","人数・家族構成","大人","子ども","乳児","ペット","日数","追加条件",
"加熱・調理ができない想定","食事制限・アレルギーへの対応が必要","購入予算（円・任意）","価格を自動取得しないため、予算内に収まるとの判定はしません。","不足品を確認","不足品とチェックリスト","必要目安","自宅にある数","不足",
"期限（任意）","期限切れ","優先","確認","追加候補","Amazonで探す","家にある数を入れると不足数量を差し引きます。必要数量は初期目安であり、個別事情に合わせて調整してください。",
"優先項目の不足","不足のある項目","足りている項目","すべて","不足のみ","備蓄済み","印刷","CSV保存",
"リストをコピー","データを削除","この端末の保存データを削除しますか？","入力した項目では不足がありません。","調理できない場合、食料の欄には開封して食べられる食品など、実際に使える食数だけを入れてください。","自宅で過ごすための備蓄です。飲用・調理用の水とは別に生活用水も検討してください。","持ち出し品の数量は携行例です。自宅の3〜14日分と混同せず、重さ・避難経路を確認してください。",
"乳児用のミルク・おむつの必要量は体調・年齢・普段の使用量で調整してください。","アレルギー、宗教、菜食などに対応する食品は必ず商品表示を確認してください。","まず優先項目から揃え、予算内で買い足してください。","価格と在庫は掲載していません。Amazonで実際の条件をご確認ください。","リンクの一部は広告・アフィリエイトです。購入は任意です。","入力内容はこの端末のブラウザ内に保存されます。商品の検索語は固定で、家族構成や在庫数をAmazonに送信しません。",
"数量の参考","飲料水・食料の目安（首相官邸）","携帯トイレ・日常備蓄（政府広報）","このリストは備えの補助です。災害時は自治体・国の最新の公式情報を確認してください。","このツールが役立ったら開発を支援できます。","開発を支援","保有",
"必要","所持数を編集","読み込み中","コピーしました","購入先は日本のAmazonです","その他の候補","設定した期限が過ぎた品物は不足として計算します。","公式情報に基づく数値は水3L/人/日と携帯トイレ5回/人/日、食料は3食/人/日の計画用換算です。",
"持ち出し用の水は1人0.5Lの携行例です。これだけで1日分を満たす意味ではありません。","その他の個数は公式な最低基準ではなく、初期チェック用の仮置きです。","© NicheWorks — Small Web Tools for Boring Tasks","言語"],
en: [
"Set up your plan","Stay-at-home supplies","Go-bag checklist","Household","Adults","Children","Infants","Pets","Days","Additional needs",
"No cooking or heating available","Dietary restrictions or allergies","Shopping budget (JPY, optional)","No live prices are retrieved; we cannot verify that items fit your budget.","Check what is missing","Your shortages and checklist","Suggested target","You already have","Still needed",
"Expiry (optional)","Expired","Top priority","Review","Optional","Search on Amazon Japan","Enter what you already have; only the remaining amount is shown. Targets are starting estimates, not a guarantee of sufficiency.",
"Critical shortages","Items missing","Items covered","All","Missing only","Covered only","Print","Export CSV",
"Copy list","Delete saved data","Delete this device's saved data?","No shortages in the items shown.","If you cannot cook, count only food you can actually eat without heating or preparation water.","For staying at home. Remember that utility water is separate from drinking/cooking water.","Go-bag quantities are examples for carrying, NOT a 3–14-day household reserve. Check bag weight and evacuation routes.",
"Adjust infant feeding and diaper needs to age and actual use.","Check food labels for allergies, religion-based restrictions, or vegetarian needs.","Shop critical needs first and stay within your own budget.","No live price or stock claims; verify on Amazon Japan.","Some links are affiliate advertising. Buying is optional.","Your entries stay in this browser on this device. Amazon searches use fixed Japanese terms; no personal input is sent.",
"Guidance sources","Water and food (Prime Minister's Office)","Toilets and everyday stockpiles (Government of Japan)","This tool is a planning aid, not emergency instructions. Follow current official guidance.","You can support ongoing development.","Support development","Owned",
"Target","Edit quantity","Loading","Copied","Shopping links lead to Amazon Japan","Other suggestions","Items past their entered expiry date are counted as missing.","Official rules used: 3L water/person/day, 5 toilet uses/person/day; food uses 3 meal occasions/person/day for planning.",
"Go-bag water uses an illustrative 0.5L/person; this is NOT a full-day supply.","Other item counts are initial checklist suggestions, NOT official minimum quantities.","© NicheWorks — Small Web Tools for Boring Tasks","Language"],
zh: [
"设置备灾条件","居家储备","应急背包","家庭人数","成人","儿童","婴儿","宠物","储备天数","额外需求",
"无法加热或做饭","有饮食限制或过敏需求","购物预算（日元，可选）","不获取实时价格，因此无法判断是否在预算内。","查看缺少的物品","缺少的物品与清单","建议数量","已有数量","仍需补充",
"有效期（可选）","已过期","优先","需确认","可选","在日本亚马逊查找","填写家中现有数量，系统会计算不足部分。建议数量仅为初步参考。",
"重要物品缺口","不足项目","已备齐项目","全部","仅看不足","仅看已备","打印","导出CSV",
"复制清单","删除保存的数据","确定删除此设备保存的数据吗？","当前项目没有不足。","无法加热时，只计入无需烹饪及用水、可以实际食用的食品。","这是居家备灾计划。饮用和烹饪用水以外还应考虑生活用水。","背包数量仅为携带参考，不代表居家3至14天的储备。请检查重量及避难路线。",
"婴儿奶粉和尿布应按年龄及实际用量调整。","请核对食品标签上的过敏原、宗教或素食要求。","先购买优先物品，并自行控制预算。","不展示实时价格和库存，请在日本亚马逊确认。","部分链接属于广告或联盟推广，购买完全自愿。","数据仅保存在本设备的浏览器中。亚马逊搜索词固定，不传送家庭或库存信息。",
"参考来源","饮水与食物（日本首相官邸）","应急厕所与日常储备（日本政府）","本工具只用于准备参考，遇灾请以官方最新信息为准。","欢迎支持工具持续开发。","支持开发","已有",
"目标","修改数量","加载中","已复制","购买链接跳转日本亚马逊","其他建议","输入的有效期已过时，按缺少处理。","依据：每人每天3升饮用／烹饪用水、5次应急厕所；食物按每人每天3餐做计划换算。",
"应急背包的饮水按每人0.5升的示例计算，并非一天用量。","其他物品数量仅为清单初始建议，并非官方最低要求。","© NicheWorks — Small Web Tools for Boring Tasks","语言"],
vi: [
"Thiết lập nhu cầu","Dự trữ tại nhà","Túi sơ tán","Thành viên gia đình","Người lớn","Trẻ em","Trẻ sơ sinh","Thú cưng","Số ngày","Nhu cầu khác",
"Không thể đun nấu","Có dị ứng hoặc chế độ ăn riêng","Ngân sách mua sắm (JPY, tùy chọn)","Không lấy giá trực tiếp nên không thể xác nhận phù hợp ngân sách.","Kiểm tra đồ còn thiếu","Danh sách đồ còn thiếu","Mức gợi ý","Đã có","Còn thiếu",
"Hạn dùng (tùy chọn)","Đã hết hạn","Ưu tiên cao","Cần kiểm tra","Tùy chọn","Tìm trên Amazon Nhật","Nhập số lượng đang có để tính phần thiếu. Số lượng chỉ là mức gợi ý ban đầu.",
"Thiếu đồ thiết yếu","Mục còn thiếu","Mục đã đủ","Tất cả","Chỉ thiếu","Đã đủ","In","Xuất CSV",
"Sao chép danh sách","Xóa dữ liệu đã lưu","Xóa dữ liệu lưu trên thiết bị này?","Không còn mục nào thiếu.","Nếu không thể nấu, chỉ tính các suất ăn có thể dùng ngay mà không cần đun hoặc nước nấu.","Dùng để dự trữ tại nhà. Nước sinh hoạt cần tính riêng với nước uống và nấu ăn.","Số lượng trong túi sơ tán là ví dụ mang theo, KHÔNG phải dự trữ tại nhà 3–14 ngày. Hãy kiểm tra trọng lượng và đường sơ tán.",
"Hãy điều chỉnh lượng sữa, tã theo tuổi và mức dùng thực tế.","Kiểm tra nhãn thực phẩm về dị ứng, tôn giáo hoặc ăn chay.","Ưu tiên đồ thiết yếu và tự cân đối ngân sách.","Không hiển thị giá hay tồn kho trực tiếp; hãy kiểm tra trên Amazon Nhật.","Một số liên kết là quảng cáo tiếp thị liên kết. Việc mua là tùy ý.","Dữ liệu chỉ lưu trong trình duyệt trên thiết bị này. Từ khóa Amazon cố định, không gửi thông tin cá nhân.",
"Nguồn tham khảo","Nước và thực phẩm (Văn phòng Thủ tướng Nhật)","Nhà vệ sinh và dự trữ hằng ngày (Chính phủ Nhật)","Công cụ chỉ hỗ trợ chuẩn bị. Khi có thiên tai hãy theo thông tin chính thức mới nhất.","Bạn có thể hỗ trợ việc phát triển công cụ.","Ủng hộ phát triển","Đã có",
"Mục tiêu","Sửa số lượng","Đang tải","Đã sao chép","Liên kết mua dẫn đến Amazon Nhật","Gợi ý khác","Đồ quá hạn đã nhập sẽ được tính là thiếu.","Quy tắc tham khảo: 3L nước/người/ngày, 5 lượt vệ sinh/người/ngày; thực phẩm tính 3 bữa/người/ngày để lập kế hoạch.",
"Nước mang theo chỉ lấy ví dụ 0,5L/người, KHÔNG đủ cho một ngày.","Số lượng các đồ khác là gợi ý ban đầu, KHÔNG phải mức tối thiểu chính thức.","© NicheWorks — Small Web Tools for Boring Tasks","Ngôn ngữ"]
};
window.BICHIKU_I18N = {};
Object.keys(all).forEach(function(lang) {
  var dict={};
  keys.forEach(function(key,i) {dict[key]=all[lang][i] || all.en[i] || key;});
  window.BICHIKU_I18N[lang] = dict;
});
})();
