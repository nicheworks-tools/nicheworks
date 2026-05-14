const raw=`length|長さ|mm|0.001m|部品、厚み、製図寸法|部品 厚み 製図
length|長さ|cm|0.01m|身長、日用品、短い距離|身長 日用品
length|長さ|m|1m|距離、寸法、高さ、幅|高さ 幅 距離
length|長さ|km|1000m|道路距離、移動距離、地図|道路 移動 地図
length|長さ|inch / インチ|2.54cm|画面、工具、配管、海外製品寸法|画面 工具 配管 海外製品
length|長さ|ft / フィート|0.3048m|身長、航空高度、建築寸法|身長 航空 建築
length|長さ|mile / マイル|1609.344m|英米圏の道路距離やmph|道路 英米圏 mph
length|長さ|寸|約0.0303m|尺の10分の1。和裁や木工|和裁 木工 尺|1
length|長さ|尺|約0.303m|建築、和裁、古典文献|建築 和裁 寸 間|1
length|長さ|分|約0.00303m|寸の10分の1|寸 尺|1
length|長さ|間|約1.818m|建築や部屋の寸法|建築 和室 畳|1
length|長さ|里|約3927m|古い地理表現や道のり|道のり 歴史|1
weight|重さ|g|1g|食品、日用品、少量の重さ|食品 日用品
weight|重さ|kg|1000g|体重、荷物、食品|体重 荷物 食品
weight|重さ|lb / ポンド|453.59237g|英米圏の体重・食品・荷物重量|英米圏 体重
weight|重さ|oz / オンス|28.3495231g|食品、飲料、軽量物|食品 飲料
weight|重さ|匁|3.75g|真珠、貴金属、薬種|真珠 貴金属 薬種|1
weight|重さ|斤|600g|食品や古い重量表現|食品 食パン|1
weight|重さ|貫|3750g|古い商取引や体重表現|商取引 体重|1
temp|温度|C / 摂氏|-|日常温度、気象、料理|気温 料理
temp|温度|F / 華氏|-|主に米国などの温度目盛|米国 料理
temp|温度|K / ケルビン|-|絶対零度を0Kとする科学向け単位|絶対零度 科学
volume|体積|ml|0.001L|飲料、薬液、料理|飲料 薬液 料理
volume|体積|L|1L|飲料、燃料、容器容量|飲料 燃料 容器
volume|体積|cup / カップ|0.24L|料理。国やレシピで差あり|料理 レシピ
volume|体積|合|0.18039L|米や酒の伝統的な体積単位|米 酒 料理|1
volume|体積|升|1.8039L|10合にあたる体積単位|米 酒 枡|1
volume|体積|斗|18.039L|10升にあたる大きな体積単位|農産物 商取引|1
area|面積|m²|1m²|部屋、土地、建物、床面積|部屋 土地 建物
area|面積|km²|1000000m²|地域、森林、湖、国土面積|地域 国土
area|面積|坪|3.305785m²|土地・建物・部屋の広さ。長さではなく面積|土地 部屋 不動産 建築|1
area|面積|畝|99.1736m²|農地などの伝統的な面積単位|農地|1
area|面積|反|991.736m²|農地面積|農地|1
area|面積|町|9917.36m²|大きな土地・農地面積|農地 土地|1
speed|速度|m/s|1m/s|物理、計測、風速|風速 物理
speed|速度|km/h|0.277778m/s|車、道路、移動速度|車 道路 移動
speed|速度|mph|0.44704m/s|英米圏の道路速度|マイル 英米圏
speed|速度|knot / ノット|0.514444m/s|船舶・航空の速度単位|船舶 航空 風速
pressure|圧力|Pa|1Pa|科学、工学、計測|科学 工学
pressure|圧力|hPa|100Pa|気圧や天気予報|気圧 天気
pressure|圧力|bar|100000Pa|工業・気象・機器表示|工業 気象
pressure|圧力|atm|101325Pa|標準大気圧|大気圧
pressure|圧力|torr|133.322Pa|真空や圧力表現|真空
pressure|圧力|psi|6894.76Pa|タイヤ空気圧、機械、海外製品|タイヤ 空気圧 機械`;
const U=raw.split('\n').map(r=>r.split('|'));
const C=[['all','すべて'],['length','長さ'],['weight','重さ'],['temp','温度'],['volume','体積'],['area','面積'],['speed','速度'],['pressure','圧力'],['traditional','伝統単位']];
const g=document.getElementById('grid'),c=document.getElementById('chips'),q=document.getElementById('q'),s=document.getElementById('status'),e=document.getElementById('empty');let a='all';
function esc(x){return String(x).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function n(x){return String(x||'').toLowerCase().trim()}
g.innerHTML=U.map((u,i)=>`<article class="u" data-i="${i}"><p class="meta"><span class="pill">${u[1]}</span>${u[6]?'<span class="pill trad">伝統単位</span>':''}</p><h3>${esc(u[2])}</h3><p><strong>換算値：</strong>${esc(u[3])}</p><p>${esc(u[4])}</p></article>`).join('');
c.innerHTML=C.map(x=>`<button class="chip${x[0]==='all'?' on':''}" data-f="${x[0]}">${x[1]}</button>`).join('');
function apply(){let k=n(q.value),cnt=0;[...g.children].forEach(el=>{let u=U[el.dataset.i],ok=(!k||n(u.join(' ')).includes(k))&&(a==='all'||u[0]===a||(a==='traditional'&&u[6]));el.hidden=!ok;if(ok)cnt++});s.textContent=cnt?`${cnt}件の単位を表示中`:'該当する単位がありません。';e.classList.toggle('show',!cnt)}
c.onclick=ev=>{let b=ev.target.closest('.chip');if(!b)return;a=b.dataset.f;c.querySelectorAll('.chip').forEach(x=>x.classList.toggle('on',x===b));apply()};q.oninput=apply;apply();