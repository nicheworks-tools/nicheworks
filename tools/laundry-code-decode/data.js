window.SYMBOLS = [
  // =========================
  // WASH
  // =========================
  { id:"wash_any", cat:"wash", m:{mode:"any"}, ja:{summary:"洗濯可", detail:"通常の洗濯が可能です。素材に応じてネット使用など調整してください。"}, en:{summary:"Machine washable", detail:"Normal machine wash is allowed. Adjust cycle as needed."}},
  { id:"wash_30", cat:"wash", m:{temp:30}, ja:{summary:"30℃以下で洗濯可", detail:"30℃以下の水温で洗濯してください。"}, en:{summary:"Wash at 30°C", detail:"Machine wash at or below 30°C."}},
  { id:"wash_40", cat:"wash", m:{temp:40}, ja:{summary:"40℃以下で洗濯可", detail:"40℃以下の水温で洗濯してください。"}, en:{summary:"Wash at 40°C", detail:"Machine wash at or below 40°C."}},
  { id:"wash_60", cat:"wash", m:{temp:60}, ja:{summary:"60℃以下で洗濯可", detail:"60℃以下の水温で洗濯してください。"}, en:{summary:"Wash at 60°C", detail:"Machine wash at or below 60°C."}},
  { id:"wash_95", cat:"wash", m:{temp:95}, ja:{summary:"95℃以下で洗濯可", detail:"高温洗いが可能です。色移り等に注意してください。"}, en:{summary:"Wash at 95°C", detail:"Hot wash allowed. Watch for color bleed."}},
  { id:"wash_gentle_30", cat:"wash", m:{temp:30, underline:1}, ja:{summary:"30℃以下・弱水流", detail:"弱い水流（デリケートコース等）で洗ってください。"}, en:{summary:"30°C gentle", detail:"Use gentle/delicate cycle at or below 30°C."}},
  { id:"wash_verygentle_30", cat:"wash", m:{temp:30, underline:2}, ja:{summary:"30℃以下・非常に弱い水流", detail:"非常に弱い水流（最弱設定）で洗ってください。"}, en:{summary:"30°C very gentle", detail:"Use very gentle cycle at or below 30°C."}},
  { id:"wash_hand", cat:"wash", m:{hand:true}, ja:{summary:"手洗い", detail:"手洗いしてください。強くこすらず、短時間でやさしく。"}, en:{summary:"Hand wash", detail:"Hand wash gently. Do not scrub hard."}},
  { id:"wash_no", cat:"wash", m:{no:true}, ja:{summary:"洗濯不可", detail:"水洗いできません。クリーニング表示がある場合は従ってください。"}, en:{summary:"Do not wash", detail:"Do not wash in water. Follow dry clean instructions if present."}},

  // =========================
  // BLEACH
  // =========================
  { id:"bleach_any", cat:"bleach", m:{allow:true}, ja:{summary:"漂白可", detail:"漂白剤の使用が可能です。衣類の注意書きも確認してください。"}, en:{summary:"Bleach allowed", detail:"Bleach may be used. Check garment notes."}},
  { id:"bleach_nonchlorine", cat:"bleach", m:{nonchlorine:true}, ja:{summary:"酸素系のみ可", detail:"塩素系は不可。酸素系（非塩素系）漂白剤のみ使用できます。"}, en:{summary:"Non-chlorine only", detail:"Do not use chlorine bleach. Non-chlorine bleach only."}},
  { id:"bleach_no", cat:"bleach", m:{no:true}, ja:{summary:"漂白不可", detail:"塩素系・酸素系いずれの漂白剤も使用できません。"}, en:{summary:"Do not bleach", detail:"Do not use any bleach."}},

  // =========================
  // DRY (Tumble + Natural)
  // =========================
  { id:"tumble_any", cat:"dry", m:{tumble:true}, ja:{summary:"タンブル乾燥可", detail:"乾燥機の使用が可能です。温度指定がある場合は従ってください。"}, en:{summary:"Tumble dry allowed", detail:"Tumble drying is allowed. Follow heat setting if specified."}},
  { id:"tumble_low", cat:"dry", m:{tumble:true, dots:1}, ja:{summary:"乾燥機 低温", detail:"低温設定でタンブル乾燥してください。"}, en:{summary:"Tumble dry low", detail:"Tumble dry on low heat."}},
  { id:"tumble_med", cat:"dry", m:{tumble:true, dots:2}, ja:{summary:"乾燥機 中温", detail:"中温設定でタンブル乾燥してください。"}, en:{summary:"Tumble dry medium", detail:"Tumble dry on medium heat."}},
  { id:"tumble_high", cat:"dry", m:{tumble:true, dots:3}, ja:{summary:"乾燥機 高温", detail:"高温設定でタンブル乾燥できますが、縮みに注意してください。"}, en:{summary:"Tumble dry high", detail:"High heat allowed. Watch for shrinkage."}},
  { id:"tumble_no", cat:"dry", m:{tumble:true, no:true}, ja:{summary:"乾燥機不可", detail:"タンブル乾燥（乾燥機）は使用できません。"}, en:{summary:"Do not tumble dry", detail:"Do not use a tumble dryer."}},

  { id:"dry_line", cat:"dry", m:{line:true}, ja:{summary:"つり干し", detail:"形を整えてつり干ししてください。"}, en:{summary:"Line dry", detail:"Hang to dry after reshaping."}},
  { id:"dry_drip", cat:"dry", m:{drip:true}, ja:{summary:"ぬれつり干し", detail:"絞らずに、ぬれたままつり干ししてください。"}, en:{summary:"Drip dry", detail:"Hang dripping wet. Do not wring."}},
  { id:"dry_flat", cat:"dry", m:{flat:true}, ja:{summary:"平干し", detail:"平らな場所で形を整えて干してください。"}, en:{summary:"Dry flat", detail:"Lay flat to dry after reshaping."}},
  { id:"dry_shade_line", cat:"dry", m:{line:true, shade:true}, ja:{summary:"日陰でつり干し", detail:"直射日光を避け、日陰でつり干ししてください。"}, en:{summary:"Line dry in shade", detail:"Hang to dry in the shade."}},
  { id:"dry_shade_flat", cat:"dry", m:{flat:true, shade:true}, ja:{summary:"日陰で平干し", detail:"直射日光を避け、日陰で平干ししてください。"}, en:{summary:"Dry flat in shade", detail:"Lay flat to dry in the shade."}},

  // =========================
  // IRON
  // =========================
  { id:"iron_any", cat:"iron", m:{allow:true}, ja:{summary:"アイロン可", detail:"アイロンがけ可能です。温度指定がある場合は従ってください。"}, en:{summary:"Iron allowed", detail:"Ironing is allowed. Follow heat setting if specified."}},
  { id:"iron_low", cat:"iron", m:{dots:1}, ja:{summary:"低温アイロン", detail:"110℃以下が目安です。"}, en:{summary:"Low heat iron", detail:"Low temperature (max ~110°C)."}},
  { id:"iron_med", cat:"iron", m:{dots:2}, ja:{summary:"中温アイロン", detail:"150℃以下が目安です。"}, en:{summary:"Medium heat iron", detail:"Medium temperature (max ~150°C)."}},
  { id:"iron_high", cat:"iron", m:{dots:3}, ja:{summary:"高温アイロン", detail:"200℃以下が目安です。素材によっては当て布推奨。"}, en:{summary:"High heat iron", detail:"High temperature (max ~200°C). Use a pressing cloth if needed."}},
  { id:"iron_no", cat:"iron", m:{no:true}, ja:{summary:"アイロン不可", detail:"アイロンがけできません。熱で変形する恐れがあります。"}, en:{summary:"Do not iron", detail:"Do not iron. Heat may damage the fabric."}},
  { id:"iron_no_steam", cat:"iron", m:{dots:2, steamNo:true}, ja:{summary:"スチーム不可（中温）", detail:"スチームは使わず、乾いたアイロンで中温。"}, en:{summary:"No steam (medium)", detail:"Do not use steam. Dry iron on medium heat."}},

  // =========================
  // DRY CLEAN
  // =========================
  { id:"dc_p", cat:"dryclean", m:{code:"P"}, ja:{summary:"ドライクリーニング（P）", detail:"プロに任せる表示です。溶剤Pでの処理が可能。"}, en:{summary:"Dry clean (P)", detail:"Professional dry clean. Solvent P allowed."}},
  { id:"dc_f", cat:"dryclean", m:{code:"F"}, ja:{summary:"ドライクリーニング（F）", detail:"溶剤Fでの処理が可能。"}, en:{summary:"Dry clean (F)", detail:"Professional dry clean. Solvent F allowed."}},
  { id:"dc_w", cat:"dryclean", m:{code:"W"}, ja:{summary:"ウエットクリーニング（W）", detail:"プロによるウエットクリーニングが可能。家庭洗濯とは別です。"}, en:{summary:"Professional wet clean (W)", detail:"Professional wet cleaning allowed. Not the same as home washing."}},
  { id:"dc_p_gentle", cat:"dryclean", m:{code:"P", underline:1}, ja:{summary:"ドライ（P）弱い処理", detail:"弱い処理でのドライクリーニング指定。"}, en:{summary:"Dry clean (P) gentle", detail:"Professional dry clean with gentle process."}},
  { id:"dc_no", cat:"dryclean", m:{no:true}, ja:{summary:"ドライ不可", detail:"ドライクリーニングできません。別のケア方法に従ってください。"}, en:{summary:"Do not dry clean", detail:"Do not dry clean. Follow other care instructions."}}
];
