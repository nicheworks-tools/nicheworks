/* BichikuCheck curated category catalog. All Amazon searches are fixed; never put user data in URLs. */
/* h/g: quantity rules for home and go bag. "one" etc are planning suggestions, not official minima. */
(function () {
  "use strict";
  var rows = [
    ["water","food",1,"water","carryWater","保存水 飲料水 2L","飲料・調理用の水","Drinking and cooking water","饮用与烹饪用水","Nước uống và nấu ăn"],
    ["food","food",1,"food","", "非常食 そのまま食べられる 缶詰 レトルト","食料（食事回数）","Meals / food portions","食物（餐次数）","Thực phẩm (số bữa)"],
    ["snack","food",2,"one","people","防災 携帯食 ビスケット","携帯食・おやつ","Portable food / snacks","便携食品／零食","Thực phẩm mang theo"],
    ["toilet","hygiene",1,"toilet","goToilet","携帯トイレ 防災 凝固剤","携帯トイレ（使用回数）","Portable toilet uses","应急厕所（使用次数）","Nhà vệ sinh di động (lượt)"],
    ["toiletPaper","hygiene",2,"two","one","トイレットペーパー 備蓄","トイレットペーパー","Toilet paper","卫生纸","Giấy vệ sinh"],
    ["wetWipes","hygiene",2,"two","one","防災 ウェットティッシュ","ウェットティッシュ","Wet wipes","湿巾","Khăn ướt"],
    ["trashBags","hygiene",2,"one","one","防臭袋 ゴミ袋 防災","ゴミ袋・防臭袋","Waste / odor-proof bags","垃圾袋／防臭袋","Túi rác / túi chống mùi"],
    ["sanitizer","hygiene",2,"one","one","携帯 アルコール 消毒液","手指の衛生用品","Hand hygiene supplies","手部清洁用品","Đồ vệ sinh tay"],
    ["masks","hygiene",2,"people","people","マスク 防災 備蓄","マスク","Face masks","口罩","Khẩu trang"],
    ["sanitary","hygiene",2,"one","one","生理用品 ナプキン","生理用品（必要な人）","Menstrual supplies (if needed)","经期用品（按需）","Đồ dùng kinh nguyệt (nếu cần)"],
    ["toothbrush","hygiene",3,"people","people","旅行用 歯ブラシ セット","口腔ケア用品","Oral care supplies","口腔护理用品","Đồ vệ sinh răng miệng"],
    ["light","equipment",1,"two","people","LED 懐中電灯 防災","懐中電灯・ライト","Flashlights","手电筒／照明灯","Đèn pin"],
    ["lantern","equipment",2,"one","", "LED ランタン 乾電池","室内用ランタン","Indoor lantern","室内营灯","Đèn lồng dùng trong nhà"],
    ["batteries","equipment",2,"one","one","乾電池 防災 単三 単四","予備乾電池（セット）","Spare batteries (set)","备用电池（套）","Pin dự phòng (bộ)"],
    ["radio","equipment",2,"one","one","防災ラジオ 乾電池式","携帯ラジオ","Portable radio","便携收音机","Radio cầm tay"],
    ["powerbank","equipment",1,"one","one","モバイルバッテリー 防災","モバイルバッテリー","Power bank","移动电源","Pin sạc dự phòng"],
    ["cable","equipment",2,"one","one","充電ケーブル USB C Lightning","充電ケーブル","Charging cables","充电线","Cáp sạc"],
    ["stove","equipment",2,"one","", "カセットコンロ 防災","カセットコンロ","Portable cassette stove","便携卡式炉","Bếp gas mini"],
    ["gas","equipment",2,"one","", "カセットボンベ 防災","ガスボンベ（セット）","Gas canisters (set)","卡式气罐（套）","Bình gas mini (bộ)"],
    ["waterBag","equipment",2,"one","", "給水袋 折りたたみ 防災","給水袋","Foldable water container","折叠储水袋","Túi đựng nước gấp gọn"],
    ["utensils","equipment",3,"one","", "防災 食器 使い捨て","食器・カトラリー","Plates and cutlery","餐具","Chén đĩa và dụng cụ ăn"],
    ["canOpener","equipment",3,"one","", "缶切り コンパクト","缶切り","Can opener","开罐器","Dụng cụ mở hộp"],
    ["firstAid","health",1,"one","one","救急セット 防災","救急用品（セット）","First-aid kit","急救用品（套）","Bộ sơ cứu"],
    ["medicine","health",1,"one","one","","常用薬・お薬手帳の確認","Prescription medicines / health records","常用药与用药记录","Thuốc đang dùng / hồ sơ thuốc"],
    ["contacts","health",1,"one","one","","家族の連絡・避難計画","Family contact / evacuation plan","家人联系与避难计划","Kế hoạch liên lạc / sơ tán"],
    ["cash","health",2,"one","one","","現金・小銭","Cash / small change","现金／零钱","Tiền mặt / tiền lẻ"],
    ["documents","health",2,"one","one","","身分証・重要書類","ID and essential documents","身份证件与重要文件","Giấy tờ tùy thân"],
    ["towels","health",2,"people","people","タオル 速乾 防災","タオル","Towels","毛巾","Khăn"],
    ["clothes","health",2,"people","people","防災 着替え 衣類","着替え・下着","Spare clothes / underwear","换洗衣物／内衣","Quần áo / đồ lót dự phòng"],
    ["blanket","health",2,"one","people","エマージェンシーシート 防災","保温・防寒用品","Warmth / emergency blankets","保暖用品／急救毯","Đồ giữ ấm / chăn khẩn cấp"],
    ["cooling","health",3,"one","", "冷却タオル 防災 暑さ対策","暑さ対策用品","Hot-weather supplies","防暑用品","Đồ chống nóng"],
    ["whistle","evac",2,"people","people","防災 ホイッスル","ホイッスル","Emergency whistle","求救哨","Còi cứu hộ"],
    ["helmet","evac",2,"people","people","防災 ヘルメット","頭部保護用品","Head protection","头部防护用品","Đồ bảo vệ đầu"],
    ["goBag","evac",2,"", "people","防災 リュック 軽量","持ち出しリュック","Evacuation backpack","应急背包","Ba lô sơ tán"],
    ["raincoat","evac",3,"", "people","レインポンチョ 防災","レインウェア","Rain protection","雨衣","Áo mưa"],
    ["shoes","evac",2,"", "people","防災 避難 靴","歩きやすい靴","Walking shoes","便于行走的鞋","Giày đi bộ"],
    ["glasses","health",3,"one","one","","予備メガネなど（必要な人）","Spare glasses (if needed)","备用眼镜（按需）","Kính dự phòng (nếu cần)"],
    ["infantFeeding","special",1,"infants","infants","液体ミルク 防災 乳児","乳児の授乳用品","Infant feeding supplies","婴儿喂养用品","Đồ cho trẻ sơ sinh ăn"],
    ["diapers","special",1,"diapers","infantGo","紙おむつ（乳児）","乳児用おむつ（枚）","Baby diapers (pieces)","婴儿纸尿裤（片）","Tã em bé (miếng)"],
    ["childFood","special",2,"children","children","幼児食 常温 保存","子ども向け食品（セット）","Child-specific food (set)","儿童食品（套）","Thực phẩm cho trẻ em (bộ)"],
    ["petFood","special",1,"petDays","petGo","ペット フード 防災","ペットの食料（日数分）","Pet food (pet-days)","宠物食品（宠物天数）","Thức ăn thú cưng (ngày-thú)"],
    ["petCarrier","special",2,"pets","pets","ペット キャリー 避難","ペットの避難用品","Pet evacuation supplies","宠物避难用品","Đồ sơ tán cho thú cưng"],
    ["allergyFood","special",1,"one","one","アレルギー対応 非常食","食事制限に合う食品","Food matching dietary needs","符合饮食限制的食品","Thực phẩm phù hợp chế độ ăn"]
  ];
  var conditional = {infantFeeding:"infants",diapers:"infants",childFood:"children",petFood:"pets",petCarrier:"pets",allergyFood:"diet"};
  window.BICHIKU_CATALOG = rows.map(function(r) {
    return {id:r[0],group:r[1],priority:r[2],home:r[3],go:r[4],search:r[5],names:{ja:r[6],en:r[7],zh:r[8],vi:r[9]},conditional:conditional[r[0]]||""};
  });
})();
