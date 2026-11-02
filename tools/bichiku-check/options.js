/* Concrete preparedness choices. Values are capabilities, NOT product safety certifications.
   "full" counts only a user-entered capacity (servings/L/uses/persons) under supported conditions.
   Supplements and improvised fallbacks never silently satisfy the parent requirement. */
(function(){
"use strict";
const rows=[
/* id | parent | role | kind | prep | equivalence | warning | search | JA EN ZH VI */
["alphaRice","food","staple","dedicated","water","full","potable","アルファ米 非常食 水戻し","アルファ化米","Alpha rice (water-rehydratable)","免煮应急米饭","Cơm khô hoàn nguyên bằng nước"],
["emergencyPorridge","food","staple","dedicated","water","full","package","非常食 おかゆ 水戻し","非常用おかゆ","Emergency rice porridge","应急粥","Cháo gạo khẩn cấp"],
["kanpan","food","staple","dedicated","ready","full","portion","乾パン 防災","乾パン","Emergency hardtack biscuits","压缩干面包","Bánh quy khô dự phòng"],
["cannedBread","food","staple","dedicated","ready","full","portion","缶詰パン 非常食","缶詰パン","Canned bread","罐装面包","Bánh mì đóng hộp"],
["longLifeBread","food","staple","normal","ready","full","storage","ロングライフパン 常温","ロングライフパン","Shelf-stable bread","常温长保质期面包","Bánh mì bảo quản lâu"],
["riceCrackers","food","staple","normal","ready","full","portion","保存 米菓 せんべい 個包装","米菓・せんべい","Rice crackers","米饼","Bánh gạo giòn"],
["packRice","food","staple","normal","heat","full","cook","パックご飯 レトルト","パックご飯（通常品）","Packaged cooked rice (usually heat)","包装米饭（通常需加热）","Cơm đóng gói (thường cần hâm)"],
["instantRice","food","staple","normal","verify","conditional","package","即席ごはん 水だけ","即席ご飯（製品条件を確認）","Instant rice (check label)","速食米饭（查说明）","Cơm ăn liền (xem nhãn)"],
["cupNoodles","food","staple","normal","heat","full","noColdAssumption","カップラーメン 防災 備蓄","カップ麺","Cup noodles","杯装方便面","Mì ly"],
["cupYakisoba","food","staple","normal","heat","full","noColdAssumption","カップ焼きそば 備蓄","カップ焼きそば","Cup yakisoba","杯装炒面","Mì xào ly"],
["cupUdon","food","staple","normal","heat","full","noColdAssumption","カップうどん 備蓄","カップうどん","Cup udon","杯装乌冬面","Mì udon ly"],
["bagNoodles","food","staple","normal","heat","full","noColdAssumption","袋麺 インスタントラーメン","袋入り即席麺","Packet instant noodles","袋装方便面","Mì gói"],
["instantOats","food","staple","normal","verify","conditional","oats","インスタント オートミール","インスタントオートミール","Instant oats","即食燕麦片","Yến mạch ăn liền"],
["rolledOats","food","staple","normal","heat","full","oats","ロールドオーツ オートミール","ロールドオーツ（通常は加熱）","Rolled oats (typically cooked)","传统燕麦片（通常需加热）","Yến mạch cán (thường cần nấu)"],
["cereal","food","staple","normal","ready","full","portion","コーンフレーク シリアル 常温","シリアル・コーンフレーク","Ready-to-eat cereal","即食谷物早餐","Ngũ cốc ăn liền"],
["granola","food","staple","normal","ready","full","portion","グラノーラ 保存食","グラノーラ","Granola","格兰诺拉麦片","Ngũ cốc granola"],
["driedPasta","food","staple","normal","heat","full","cook","乾燥 パスタ スパゲティ","乾燥パスタ","Dry pasta","干意大利面","Mì Ý khô"],
["driedSomen","food","staple","normal","heat","full","cook","そうめん 乾麺","そうめん・うどん等の乾麺","Dried noodles (somen/udon)","挂面／干乌冬面","Mì khô somen/udon"],
["dryRice","food","staple","normal","heat","full","cook","無洗米 備蓄","米・無洗米","Dry rice","大米／免洗米","Gạo khô"],
["tortillas","food","staple","normal","verify","conditional","storage","常温 トルティーヤ 保存","常温保存のパン・トルティーヤ","Shelf-stable tortillas","常温保存的薄饼","Bánh tortilla bảo quản thường"],
["tunaCan","food","protein","normal","ready","supplement","notMeal","ツナ缶 常温","ツナ缶","Canned tuna","金枪鱼罐头","Cá ngừ đóng hộp"],
["mackerelCan","food","protein","normal","ready","supplement","notMeal","サバ缶 水煮","サバ・イワシ缶","Canned mackerel / sardines","鲭鱼／沙丁鱼罐头","Cá thu / cá mòi đóng hộp"],
["chickenCan","food","protein","normal","ready","supplement","notMeal","焼き鳥缶 常温","肉・焼き鳥の缶詰","Canned meat / chicken","肉类罐头","Thịt / gà đóng hộp"],
["beansCan","food","protein","normal","ready","supplement","notMeal","蒸し豆 缶詰","豆・ミックスビーンズ","Canned beans","豆类罐头","Đậu đóng hộp"],
["retortCurry","food","protein","normal","ready","supplement","retort","レトルトカレー 常温","レトルトカレー","Retort curry sauce","即食咖喱酱","Cà ri đóng túi"],
["retortSide","food","protein","normal","ready","supplement","retort","レトルト おかず 常温","レトルトのおかず","Shelf-stable retort side dishes","常温即食配菜","Món ăn kèm đóng túi"],
["tofu","food","protein","normal","verify","supplement","storage","常温保存 豆腐","常温保存豆腐","Shelf-stable tofu","常温豆腐","Đậu hũ bảo quản thường"],
["fishSausage","food","protein","normal","verify","supplement","storage","魚肉ソーセージ 常温","魚肉ソーセージ","Fish sausage (check label)","鱼肉香肠","Xúc xích cá"],
["vegetableJuice","food","vegetable","normal","ready","supplement","notMeal","野菜ジュース 常温 紙パック","野菜ジュース","Vegetable juice","蔬菜汁","Nước rau củ"],
["cannedVeg","food","vegetable","normal","ready","supplement","notMeal","コーン缶 野菜缶","野菜の缶詰","Canned vegetables","蔬菜罐头","Rau củ đóng hộp"],
["driedSeaweed","food","vegetable","normal","ready","supplement","notMeal","焼きのり 乾燥わかめ","のり・乾燥わかめ","Seaweed / dried wakame","海苔／干海带芽","Rong biển khô"],
["driedVeg","food","vegetable","normal","heat","supplement","cook","乾燥野菜 スープ用","乾燥野菜","Dried vegetables","脱水蔬菜","Rau củ sấy khô"],
["driedFruit","food","fruit","normal","ready","supplement","notMeal","ドライフルーツ 保存","ドライフルーツ","Dried fruit","水果干","Trái cây sấy"],
["cannedFruit","food","fruit","normal","ready","supplement","notMeal","フルーツ缶詰","果物の缶詰","Canned fruit","水果罐头","Trái cây đóng hộp"],
["nuts","snack","snack","normal","ready","supplement","allergen","ミックスナッツ 小袋","ナッツ類","Nuts","坚果","Các loại hạt"],
["yokan","snack","snack","dedicated","ready","supplement","notMeal","防災 ようかん","保存ようかん","Emergency sweet-bean jelly","应急羊羹","Thạch đậu đỏ bảo quản"],
["energyBar","snack","snack","normal","ready","supplement","notMeal","栄養補助食品 バー 常温","栄養補助バー","Energy / nutrition bars","能量棒","Thanh dinh dưỡng"],
["cookies","snack","snack","normal","ready","supplement","notMeal","ビスケット 個包装 保存","ビスケット・クッキー","Biscuits / cookies","饼干","Bánh quy"],
["chocolate","snack","snack","normal","ready","supplement","heatDamage","チョコレート 個包装","チョコレート","Chocolate","巧克力","Sô cô la"],
["candy","snack","snack","normal","ready","supplement","notMeal","飴 キャンディ 個包装","飴・キャンディ","Hard candy","糖果","Kẹo"],
["water2L","water","hydration","normal","ready","full","waterLiters","飲料水 2L ケース","2Lペットボトルの飲料水","2L bottled drinking water","2升瓶装饮用水","Nước uống chai 2L"],
["water500","water","hydration","normal","ready","full","waterLiters","飲料水 500ml ケース","500mL飲料水","500mL bottled water","500毫升瓶装水","Nước chai 500mL"],
["longTermWater","water","hydration","dedicated","ready","full","waterLiters","5年 保存水","長期保存水","Long-life emergency water","长期保存饮用水","Nước uống dự trữ lâu năm"],
["purifier","water","hydration","dedicated","verify","conditional","notGuaranteed","携帯浄水器 防災","携帯浄水器（条件付き）","Portable water filter (conditional)","便携净水器（有条件）","Bộ lọc nước di động"],
["foamMat","sleepPad","floor","dedicated","none","full","floor","キャンプ 銀マット クローズドセル","断熱フォームマット","Closed-cell foam sleeping mat","闭孔泡沫睡垫","Đệm cách nhiệt xốp"],
["inflatableMat","sleepPad","floor","dedicated","none","full","floor","防災 エアマット キャンプ","エアマット","Inflatable sleeping mat","充气睡垫","Đệm hơi"],
["foldingMat","sleepPad","floor","normal","none","full","floor","折りたたみ マットレス 敷布団","折りたたみマットレス","Folding mattress","折叠床垫","Nệm gấp"],
["yogaMat","sleepPad","floor","normal","none","conditional","thin","ヨガマット 厚手","ヨガマット（薄さを確認）","Yoga mat (check insulation)","瑜伽垫（检查隔热）","Thảm yoga (kiểm tra cách nhiệt)"],
["picnicMat","sleepPad","floor","normal","none","conditional","thin","レジャーシート 厚手 断熱","厚手レジャーシート","Thick picnic mat","厚型野餐垫","Thảm dã ngoại dày"],
["cardboard","sleepPad","floor","improvised","none","conditional","temporary","", "重ねた段ボール","Layered cardboard","叠放的纸板","Bìa carton xếp lớp"],
["newspaper","sleepPad","floor","improvised","none","supplement","temporary","","新聞紙・紙類の重ね敷き","Layers of newspapers","多层报纸","Báo lót nhiều lớp"],
["futon","sleepPad","floor","normal","none","full","space","敷布団","敷布団・既存の寝具","Existing futon / bedding","现有日式床垫","Nệm futon sẵn có"],
["woolBlanket","blanket","warmth","normal","none","full","dry","毛布 防災","普段使いの毛布","Household blanket","家用毛毯","Chăn gia đình"],
["fleeceBlanket","blanket","warmth","normal","none","full","dry","フリースブランケット","フリース毛布","Fleece blanket","抓绒毯","Chăn nỉ"],
["sleepingBag","blanket","warmth","dedicated","none","full","temperature","寝袋 シュラフ 防災","寝袋・シュラフ","Sleeping bag","睡袋","Túi ngủ"],
["aluminumSheet","blanket","warmth","dedicated","none","supplement","sheet","アルミブランケット エマージェンシー","アルミ保温シート","Reflective emergency sheet","应急铝箔保温毯","Chăn giữ nhiệt phản quang"],
["winterJacket","blanket","warmth","normal","none","conditional","weather","ダウンジャケット 防寒","防寒着・上着","Insulated jacket","保暖外套","Áo khoác giữ ấm"],
["hotPack","blanket","warmth","normal","none","supplement","burns","使い捨てカイロ 防災","使い捨てカイロ","Disposable heat pack","一次性暖宝宝","Miếng dán giữ nhiệt"],
["toiletKit","toilet","sanitation","dedicated","none","full","kitUses","携帯トイレ 凝固剤 災害","携帯トイレ一式","Portable toilet kits","便携厕所套装","Bộ nhà vệ sinh di động"],
["toiletBags","toilet","sanitation","dedicated","none","conditional","toiletCompatibility","防災 トイレ袋 凝固剤","トイレ処理袋・凝固剤","Toilet bags and solidifier","应急厕所袋与凝固剂","Túi vệ sinh và chất làm đông"],
["bucketToilet","toilet","sanitation","dedicated","none","conditional","toiletCompatibility","簡易トイレ 折りたたみ","折りたたみ簡易便器","Portable commode frame","折叠应急坐便器","Ghế vệ sinh di động"],
["trashBagToilet","toilet","sanitation","improvised","none","conditional","toiletFallback","ゴミ袋 45L 防臭","ポリ袋＋新聞紙等の緊急トイレ","Garbage bags + absorbent paper","垃圾袋与吸水纸应急厕","Túi rác + giấy thấm vệ sinh"],
["petSheetsToilet","toilet","sanitation","improvised","none","supplement","toiletFallback","ペットシーツ 吸水","ペットシートを吸収材に","Pet pads as absorbent material","宠物尿垫作吸收材料","Tấm thấm thú cưng"],
["trashLiner","trashBags","sanitation","normal","none","full","waste","防臭袋 45L 黒 ゴミ袋","防臭袋・大型ごみ袋","Odor-proof refuse bags","防臭垃圾袋","Túi rác chống mùi"],
["saran","utensils","equipment","normal","none","supplement","foodContact","食品用 ラップ","食品用ラップ（食器洗浄の節水補助）","Food-safe cling wrap","食品保鲜膜","Màng bọc thực phẩm"],
["zipBags","utensils","equipment","normal","none","supplement","foodContact","食品用 保存袋 チャック","食品用保存袋","Food-safe zip bags","食品密封袋","Túi zip đựng thực phẩm"],
["paperDishes","utensils","equipment","normal","none","full","waste","紙皿 紙コップ 割り箸 防災","紙皿・紙コップ・割り箸","Disposable dishes / cutlery","一次性餐具","Bát đĩa dùng một lần"],
["headlamp","light","light","dedicated","none","full","battery","ヘッドライト 防災","ヘッドランプ","Headlamp","头灯","Đèn đeo đầu"],
["ledLantern","light","light","normal","none","full","battery","LEDランタン 乾電池","LEDランタン","Battery LED lantern","电池LED营灯","Đèn lồng LED dùng pin"],
["flashlight","light","light","normal","none","full","battery","懐中電灯 LED 乾電池","LED懐中電灯","LED flashlight","LED手电筒","Đèn pin LED"],
["phoneTorch","light","light","normal","none","conditional","battery","","スマートフォンのライト","Phone flashlight","手机手电筒","Đèn điện thoại"],
["batteryBank","powerbank","power","normal","none","full","battery","モバイルバッテリー 大容量","モバイルバッテリー","Power bank","移动电源","Pin sạc dự phòng"],
["dryCellCharger","powerbank","power","normal","none","conditional","battery","乾電池式 スマホ充電器","乾電池式充電器","AA battery phone charger","干电池手机充电器","Sạc điện thoại bằng pin AA"],
["solarCharger","powerbank","power","normal","none","conditional","weather","ソーラーチャージャー 防災","小型ソーラー充電器","Portable solar charger","便携太阳能充电器","Sạc năng lượng mặt trời"],
["wetWipesBaby","wetWipes","hygiene","normal","none","full","hygiene","赤ちゃん おしりふき 大容量","赤ちゃん用おしりふき","Baby wipes","婴儿湿巾","Khăn ướt em bé"],
["handWipes","wetWipes","hygiene","normal","none","full","hygiene","ウェットティッシュ ノンアルコール","手・体用ウェットティッシュ","Wet wipes","湿巾","Khăn ướt"],
["dryShampoo","sanitizer","hygiene","dedicated","none","supplement","hygiene","水のいらないシャンプー","ドライシャンプー","Waterless shampoo","免水洗发用品","Dầu gội khô"],
["poncho","raincoat","shelter","dedicated","none","full","weather","防災 レインポンチョ","レインポンチョ","Rain poncho","雨披","Áo mưa choàng"],
["jacketRain","raincoat","shelter","normal","none","full","weather","レインウェア 上下","雨具・レインウェア","Rain jacket and trousers","雨衣套装","Áo và quần mưa"],
["garbagePoncho","raincoat","shelter","improvised","none","conditional","suffocation","","大きなポリ袋の一時的な雨よけ","Temporary rain cover from large bag","大塑料袋临时挡雨","Che mưa tạm bằng túi lớn"],
["waterContainer","waterBag","hydration","normal","none","full","sanitaryContainer","給水袋 折りたたみ","折りたたみ給水袋","Foldable water carrier","折叠储水袋","Túi chứa nước gấp gọn"]
];
const options=rows.map(r=>({id:r[0],parent:r[1],role:r[2],kind:r[3],prep:r[4],equivalence:r[5],warning:r[6],query:r[7],names:{ja:r[8],en:r[9],zh:r[10],vi:r[11]},unitHint:r[1]==="food"?"servings":r[1]==="water"?"liters":r[1]==="toilet"?"uses":"items"}));
const ids=new Set(options.map(o=>o.id));
if(ids.size!==options.length) throw Error("duplicate option ids");
if(options.some(o=>Object.values(o.names).some(v=>!v)))throw Error("translation missing");
const waterDependentFood=new Set(["cupNoodles","cupYakisoba","cupUdon","bagNoodles","rolledOats","driedPasta","driedSomen","dryRice","driedVeg"]);
options.forEach(o=>{o.requiresWater=o.prep==="water"||waterDependentFood.has(o.id)});
const officialExamples={
 alphaRice:"https://www.maff.go.jp/j/zyukyu/foodstock/chapter06.html",
 cupNoodles:"https://www.keishicho.metro.tokyo.lg.jp/kurashi/saigai/yakudachi/food/instantnoodles/899806935150493697.html",
 cupYakisoba:"https://www.keishicho.metro.tokyo.lg.jp/kurashi/saigai/yakudachi/food/instantnoodles/1012154906709405696.html",
 cupUdon:"https://www.keishicho.metro.tokyo.lg.jp/kurashi/saigai/yakudachi/food/instantnoodles/1098362102173974528.html",
 cardboard:"https://www.gov-online.go.jp/tokusyu/bousai/shelter.html",
 trashBagToilet:"https://www.koho.metro.tokyo.lg.jp/2025/09/01-1.html"
};
options.forEach(o=>{if(officialExamples[o.id])o.sourceUrl=officialExamples[o.id]});
window.BICHIKU_OPTIONS=Object.freeze(options);
})();
