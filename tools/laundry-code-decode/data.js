window.SYMBOLS = [
  // =========================================================
  // WASH (洗濯)
  // m: { temp:number, underline:0|1|2, hand:true, no:true, mode:"any" }
  // =========================================================
  { id:"wash_any", cat:"wash", m:{mode:"any"},
    ja:{summary:"洗濯可", detail:"通常の洗濯が可能です。素材に応じてネット使用など調整してください。"},
    en:{summary:"Machine washable", detail:"Normal machine wash is allowed. Adjust cycle as needed."}
  },

  // --- temperature standard ---
  { id:"wash_20", cat:"wash", m:{temp:20},
    ja:{summary:"20℃以下で洗濯可", detail:"20℃以下（冷水）で洗濯してください。色落ちしやすい衣類向け。"},
    en:{summary:"Wash at 20°C", detail:"Machine wash at or below 20°C (cold). For color-sensitive items."}
  },
  { id:"wash_30", cat:"wash", m:{temp:30},
    ja:{summary:"30℃以下で洗濯可", detail:"30℃以下の水温で洗濯してください。"},
    en:{summary:"Wash at 30°C", detail:"Machine wash at or below 30°C."}
  },
  { id:"wash_40", cat:"wash", m:{temp:40},
    ja:{summary:"40℃以下で洗濯可", detail:"40℃以下の水温で洗濯してください。"},
    en:{summary:"Wash at 40°C", detail:"Machine wash at or below 40°C."}
  },
  { id:"wash_50", cat:"wash", m:{temp:50},
    ja:{summary:"50℃以下で洗濯可", detail:"50℃以下の水温で洗濯してください。縮みやすい素材は注意。"},
    en:{summary:"Wash at 50°C", detail:"Machine wash at or below 50°C. Watch for shrinkage on delicate fabrics."}
  },
  { id:"wash_60", cat:"wash", m:{temp:60},
    ja:{summary:"60℃以下で洗濯可", detail:"60℃以下の水温で洗濯してください。"},
    en:{summary:"Wash at 60°C", detail:"Machine wash at or below 60°C."}
  },
  { id:"wash_70", cat:"wash", m:{temp:70},
    ja:{summary:"70℃以下で洗濯可", detail:"高温洗いが可能です。表示がある場合のみ従ってください。"},
    en:{summary:"Wash at 70°C", detail:"Hot wash allowed only if specified on the care label."}
  },
  { id:"wash_95", cat:"wash", m:{temp:95},
    ja:{summary:"95℃以下で洗濯可", detail:"非常に高温で洗えます。色移り・素材劣化に注意。"},
    en:{summary:"Wash at 95°C", detail:"Very hot wash allowed. Watch for color bleed and fabric wear."}
  },

  // --- gentle (underline 1) ---
  { id:"wash_gentle_20", cat:"wash", m:{temp:20, underline:1},
    ja:{summary:"20℃以下・弱水流", detail:"冷水＋弱い水流（デリケートコース等）で洗ってください。"},
    en:{summary:"20°C gentle", detail:"Cold wash with gentle/delicate cycle."}
  },
  { id:"wash_gentle_30", cat:"wash", m:{temp:30, underline:1},
    ja:{summary:"30℃以下・弱水流", detail:"弱い水流（デリケートコース等）で洗ってください。"},
    en:{summary:"30°C gentle", detail:"Use gentle/delicate cycle at or below 30°C."}
  },
  { id:"wash_gentle_40", cat:"wash", m:{temp:40, underline:1},
    ja:{summary:"40℃以下・弱水流", detail:"弱水流（弱めのコース）で洗ってください。"},
    en:{summary:"40°C gentle", detail:"Use a gentle cycle at or below 40°C."}
  },
  { id:"wash_gentle_60", cat:"wash", m:{temp:60, underline:1},
    ja:{summary:"60℃以下・弱水流", detail:"弱水流で洗ってください。高温指定でも弱水流が前提です。"},
    en:{summary:"60°C gentle", detail:"Use a gentle cycle even at higher temperatures."}
  },

  // --- very gentle (underline 2) ---
  { id:"wash_verygentle_20", cat:"wash", m:{temp:20, underline:2},
    ja:{summary:"20℃以下・非常に弱い水流", detail:"最弱設定で洗ってください。型崩れしやすい衣類向け。"},
    en:{summary:"20°C very gentle", detail:"Use very gentle cycle. For shape-sensitive items."}
  },
  { id:"wash_verygentle_30", cat:"wash", m:{temp:30, underline:2},
    ja:{summary:"30℃以下・非常に弱い水流", detail:"非常に弱い水流（最弱設定）で洗ってください。"},
    en:{summary:"30°C very gentle", detail:"Use very gentle cycle at or below 30°C."}
  },
  { id:"wash_verygentle_40", cat:"wash", m:{temp:40, underline:2},
    ja:{summary:"40℃以下・非常に弱い水流", detail:"最弱設定で洗ってください。摩擦に弱い素材向け。"},
    en:{summary:"40°C very gentle", detail:"Use very gentle cycle. For friction-sensitive fabrics."}
  },

  // --- hand wash ---
  { id:"wash_hand_any", cat:"wash", m:{hand:true},
    ja:{summary:"手洗い", detail:"手洗いしてください。強くこすらず、短時間でやさしく。"},
    en:{summary:"Hand wash", detail:"Hand wash gently. Do not scrub hard."}
  },
  { id:"wash_hand_cold", cat:"wash", m:{hand:true, underline:1},
    ja:{summary:"手洗い（やさしく）", detail:"手洗い推奨。もみ洗いは避け、押し洗い中心で。"},
    en:{summary:"Hand wash (gentle)", detail:"Hand wash gently. Prefer press-washing; avoid rubbing."}
  },

  // --- no wash ---
  { id:"wash_no", cat:"wash", m:{no:true},
    ja:{summary:"洗濯不可", detail:"水洗いできません。クリーニング表示がある場合は従ってください。"},
    en:{summary:"Do not wash", detail:"Do not wash in water. Follow dry clean instructions if present."}
  },

  // =========================================================
  // BLEACH (漂白)
  // m: { allow:true, nonchlorine:true, no:true }
  // =========================================================
  { id:"bleach_any", cat:"bleach", m:{allow:true},
    ja:{summary:"漂白可", detail:"漂白剤の使用が可能です。衣類の注意書きも確認してください。"},
    en:{summary:"Bleach allowed", detail:"Bleach may be used. Check garment notes."}
  },
  { id:"bleach_chlorine_ok", cat:"bleach", m:{allow:true},
    ja:{summary:"塩素系漂白可（表示がある場合）", detail:"塩素系漂白剤が使える場合があります。色柄物は注意。"},
    en:{summary:"Chlorine bleach may be allowed", detail:"Chlorine bleach might be allowed. Use caution on colored items."}
  },
  { id:"bleach_nonchlorine", cat:"bleach", m:{nonchlorine:true},
    ja:{summary:"酸素系のみ可", detail:"塩素系は不可。酸素系（非塩素系）漂白剤のみ使用できます。"},
    en:{summary:"Non-chlorine only", detail:"Do not use chlorine bleach. Non-chlorine bleach only."}
  },
  { id:"bleach_nonchlorine_cold", cat:"bleach", m:{nonchlorine:true, underline:1},
    ja:{summary:"酸素系のみ（控えめ）", detail:"酸素系漂白剤のみ。濃度を上げ過ぎず短時間で。"},
    en:{summary:"Non-chlorine only (mild)", detail:"Non-chlorine bleach only. Keep concentration mild and time short."}
  },
  { id:"bleach_no", cat:"bleach", m:{no:true},
    ja:{summary:"漂白不可", detail:"塩素系・酸素系いずれの漂白剤も使用できません。"},
    en:{summary:"Do not bleach", detail:"Do not use any bleach."}
  },

  // =========================================================
  // DRY (乾燥)
  // tumble: { tumble:true, dots:1|2|3, no:true }
  // natural: { line:true, drip:true, flat:true, shade:true }
  // =========================================================

  // --- tumble allowed / heat levels ---
  { id:"tumble_any", cat:"dry", m:{tumble:true},
    ja:{summary:"タンブル乾燥可", detail:"乾燥機の使用が可能です。温度指定がある場合は従ってください。"},
    en:{summary:"Tumble dry allowed", detail:"Tumble drying is allowed. Follow heat setting if specified."}
  },
  { id:"tumble_low", cat:"dry", m:{tumble:true, dots:1},
    ja:{summary:"乾燥機 低温", detail:"低温設定でタンブル乾燥してください。縮み防止に有効。"},
    en:{summary:"Tumble dry low", detail:"Tumble dry on low heat. Helps prevent shrinkage."}
  },
  { id:"tumble_med", cat:"dry", m:{tumble:true, dots:2},
    ja:{summary:"乾燥機 中温", detail:"中温設定でタンブル乾燥してください。"},
    en:{summary:"Tumble dry medium", detail:"Tumble dry on medium heat."}
  },
  { id:"tumble_high", cat:"dry", m:{tumble:true, dots:3},
    ja:{summary:"乾燥機 高温", detail:"高温設定でタンブル乾燥できますが、縮みに注意してください。"},
    en:{summary:"Tumble dry high", detail:"High heat allowed. Watch for shrinkage."}
  },
  { id:"tumble_no", cat:"dry", m:{tumble:true, no:true},
    ja:{summary:"乾燥機不可", detail:"タンブル乾燥（乾燥機）は使用できません。"},
    en:{summary:"Do not tumble dry", detail:"Do not use a tumble dryer."}
  },

  // --- natural dry (basic) ---
  { id:"dry_line", cat:"dry", m:{line:true},
    ja:{summary:"つり干し", detail:"形を整えてつり干ししてください。"},
    en:{summary:"Line dry", detail:"Hang to dry after reshaping."}
  },
  { id:"dry_line_shade", cat:"dry", m:{line:true, shade:true},
    ja:{summary:"日陰でつり干し", detail:"直射日光を避け、日陰でつり干ししてください。"},
    en:{summary:"Line dry in shade", detail:"Hang to dry in the shade."}
  },
  { id:"dry_drip", cat:"dry", m:{drip:true},
    ja:{summary:"ぬれつり干し", detail:"絞らずに、ぬれたままつり干ししてください。"},
    en:{summary:"Drip dry", detail:"Hang dripping wet. Do not wring."}
  },
  { id:"dry_drip_shade", cat:"dry", m:{drip:true, shade:true},
    ja:{summary:"日陰でぬれつり干し", detail:"絞らずに、日陰でぬれたままつり干ししてください。"},
    en:{summary:"Drip dry in shade", detail:"Hang dripping wet in the shade. Do not wring."}
  },
  { id:"dry_flat", cat:"dry", m:{flat:true},
    ja:{summary:"平干し", detail:"平らな場所で形を整えて干してください。ニットに多い表示。"},
    en:{summary:"Dry flat", detail:"Lay flat to dry after reshaping. Common for knits."}
  },
  { id:"dry_flat_shade", cat:"dry", m:{flat:true, shade:true},
    ja:{summary:"日陰で平干し", detail:"直射日光を避け、日陰で平干ししてください。"},
    en:{summary:"Dry flat in shade", detail:"Lay flat to dry in the shade."}
  },

  // --- combinations for search convenience (same icon, different text) ---
  { id:"dry_line_reshape", cat:"dry", m:{line:true},
    ja:{summary:"つり干し（形を整える）", detail:"干す前にしわを伸ばし、形を整えてからつり干ししてください。"},
    en:{summary:"Line dry (reshape)", detail:"Smooth and reshape before hanging to dry."}
  },
  { id:"dry_flat_reshape", cat:"dry", m:{flat:true},
    ja:{summary:"平干し（形を整える）", detail:"干す前に形を整えてから平干ししてください。伸びやすい衣類向け。"},
    en:{summary:"Dry flat (reshape)", detail:"Reshape before drying flat. For stretch-prone items."}
  },

  // =========================================================
  // IRON (アイロン)
  // m: { allow:true, dots:1|2|3, steamNo:true, no:true }
  // =========================================================
  { id:"iron_any", cat:"iron", m:{allow:true},
    ja:{summary:"アイロン可", detail:"アイロンがけ可能です。温度指定がある場合は従ってください。"},
    en:{summary:"Iron allowed", detail:"Ironing is allowed. Follow heat setting if specified."}
  },

  // --- heat levels ---
  { id:"iron_low", cat:"iron", m:{dots:1},
    ja:{summary:"低温アイロン", detail:"110℃以下が目安です。化繊・アセテートなどに多い。"},
    en:{summary:"Low heat iron", detail:"Low temperature (max ~110°C). Common for synthetics."}
  },
  { id:"iron_med", cat:"iron", m:{dots:2},
    ja:{summary:"中温アイロン", detail:"150℃以下が目安です。ウール・ポリエステル混など。"},
    en:{summary:"Medium heat iron", detail:"Medium temperature (max ~150°C). Often for blends."}
  },
  { id:"iron_high", cat:"iron", m:{dots:3},
    ja:{summary:"高温アイロン", detail:"200℃以下が目安です。綿・麻など。素材によっては当て布推奨。"},
    en:{summary:"High heat iron", detail:"High temperature (max ~200°C). Often for cotton/linen."}
  },

  // --- steam not allowed variants ---
  { id:"iron_low_no_steam", cat:"iron", m:{dots:1, steamNo:true},
    ja:{summary:"低温・スチーム不可", detail:"スチームを使わず、乾いたアイロンで低温。"},
    en:{summary:"Low, no steam", detail:"Do not use steam. Dry iron on low heat."}
  },
  { id:"iron_med_no_steam", cat:"iron", m:{dots:2, steamNo:true},
    ja:{summary:"中温・スチーム不可", detail:"スチームは使わず、乾いたアイロンで中温。"},
    en:{summary:"Medium, no steam", detail:"Do not use steam. Dry iron on medium heat."}
  },
  { id:"iron_high_no_steam", cat:"iron", m:{dots:3, steamNo:true},
    ja:{summary:"高温・スチーム不可", detail:"スチームは使わず乾いたアイロンで高温。テカり防止に当て布推奨。"},
    en:{summary:"High, no steam", detail:"No steam. Dry iron on high heat. Use a pressing cloth if needed."}
  },

  // --- no iron ---
  { id:"iron_no", cat:"iron", m:{no:true},
    ja:{summary:"アイロン不可", detail:"アイロンがけできません。熱で変形・溶融する恐れがあります。"},
    en:{summary:"Do not iron", detail:"Do not iron. Heat may deform or melt the fabric."}
  },

  // --- extra (same icon, different practical guidance) ---
  { id:"iron_med_presscloth", cat:"iron", m:{dots:2},
    ja:{summary:"中温（当て布推奨）", detail:"中温アイロン。テカりやすい素材は当て布を使用してください。"},
    en:{summary:"Medium (press cloth)", detail:"Medium heat. Use a pressing cloth for shine-prone fabrics."}
  },
  { id:"iron_high_presscloth", cat:"iron", m:{dots:3},
    ja:{summary:"高温（当て布推奨）", detail:"高温アイロン。濃色は当て布を推奨します。"},
    en:{summary:"High (press cloth)", detail:"High heat. Use a pressing cloth on dark colors."}
  },

  // =========================================================
  // DRY CLEAN (ドライ/プロケア)
  // m: { code:"P"|"F"|"W", underline:1|2, no:true }
  // =========================================================
  { id:"dc_p", cat:"dryclean", m:{code:"P"},
    ja:{summary:"ドライクリーニング（P）", detail:"プロに任せる表示です。溶剤Pでの処理が可能。"},
    en:{summary:"Dry clean (P)", detail:"Professional dry clean. Solvent P allowed."}
  },
  { id:"dc_f", cat:"dryclean", m:{code:"F"},
    ja:{summary:"ドライクリーニング（F）", detail:"溶剤Fでの処理が可能。"},
    en:{summary:"Dry clean (F)", detail:"Professional dry clean. Solvent F allowed."}
  },
  { id:"dc_w", cat:"dryclean", m:{code:"W"},
    ja:{summary:"ウエットクリーニング（W）", detail:"プロによるウエットクリーニングが可能。家庭洗濯とは別です。"},
    en:{summary:"Professional wet clean (W)", detail:"Professional wet cleaning allowed. Not the same as home washing."}
  },

  // --- gentle processes ---
  { id:"dc_p_gentle", cat:"dryclean", m:{code:"P", underline:1},
    ja:{summary:"ドライ（P）弱い処理", detail:"弱い処理でのドライクリーニング指定。"},
    en:{summary:"Dry clean (P) gentle", detail:"Professional dry clean with gentle process."}
  },
  { id:"dc_p_verygentle", cat:"dryclean", m:{code:"P", underline:2},
    ja:{summary:"ドライ（P）非常に弱い処理", detail:"非常に弱い処理。型崩れしやすい衣類向け。"},
    en:{summary:"Dry clean (P) very gentle", detail:"Very gentle professional dry clean process."}
  },
  { id:"dc_f_gentle", cat:"dryclean", m:{code:"F", underline:1},
    ja:{summary:"ドライ（F）弱い処理", detail:"弱い処理でのドライクリーニング（F）。"},
    en:{summary:"Dry clean (F) gentle", detail:"Professional dry clean (F) with gentle process."}
  },
  { id:"dc_f_verygentle", cat:"dryclean", m:{code:"F", underline:2},
    ja:{summary:"ドライ（F）非常に弱い処理", detail:"非常に弱い処理でのドライクリーニング（F）。"},
    en:{summary:"Dry clean (F) very gentle", detail:"Professional dry clean (F) with very gentle process."}
  },
  { id:"dc_w_gentle", cat:"dryclean", m:{code:"W", underline:1},
    ja:{summary:"ウエット（W）弱い処理", detail:"プロによる弱いウエットクリーニング。"},
    en:{summary:"Wet clean (W) gentle", detail:"Professional wet clean with gentle process."}
  },
  { id:"dc_w_verygentle", cat:"dryclean", m:{code:"W", underline:2},
    ja:{summary:"ウエット（W）非常に弱い処理", detail:"プロによる非常に弱いウエットクリーニング。"},
    en:{summary:"Wet clean (W) very gentle", detail:"Professional wet clean with very gentle process."}
  },

  // --- no dry clean ---
  { id:"dc_no", cat:"dryclean", m:{no:true},
    ja:{summary:"ドライ不可", detail:"ドライクリーニングできません。別のケア方法に従ってください。"},
    en:{summary:"Do not dry clean", detail:"Do not dry clean. Follow other care instructions."}
  },

  // =========================================================
  // EXTRA: more variants to reach practical coverage (~120)
  // (SVGは同じでも検索用途と説明の違いで役に立つ)
  // =========================================================

  // ---- wash: common practical variants (same icons) ----
  { id:"wash_30_colorcare", cat:"wash", m:{temp:30},
    ja:{summary:"30℃以下（色物注意）", detail:"色移りしやすい場合は単独洗い・裏返し・洗濯ネット推奨。"},
    en:{summary:"30°C (color care)", detail:"If prone to bleeding, wash separately, inside out, and use a laundry bag."}
  },
  { id:"wash_40_normal", cat:"wash", m:{temp:40},
    ja:{summary:"40℃以下（標準）", detail:"一般的な衣類の標準設定です。"},
    en:{summary:"40°C (standard)", detail:"A common standard setting for many garments."}
  },
  { id:"wash_gentle_30_net", cat:"wash", m:{temp:30, underline:1},
    ja:{summary:"30℃弱水流（ネット推奨）", detail:"洗濯ネットに入れて弱水流で洗うと型崩れを防げます。"},
    en:{summary:"30°C gentle (use a bag)", detail:"Use a laundry bag on gentle cycle to reduce deformation."}
  },
  { id:"wash_hand_short", cat:"wash", m:{hand:true},
    ja:{summary:"手洗い（短時間）", detail:"長時間つけ置きは避け、短時間でやさしく洗ってください。"},
    en:{summary:"Hand wash (short)", detail:"Avoid long soaking; wash gently in a short time."}
  },
  { id:"wash_no_water", cat:"wash", m:{no:true},
    ja:{summary:"水洗い禁止", detail:"水に弱い素材の可能性。クリーニング店に相談推奨。"},
    en:{summary:"No water washing", detail:"Likely water-sensitive fabric. Consider professional care."}
  },

  // ---- bleach: extra guidance (same icons) ----
  { id:"bleach_nonchlorine_color", cat:"bleach", m:{nonchlorine:true},
    ja:{summary:"酸素系のみ（色柄向け）", detail:"色柄物は塩素系で色抜けしやすいので、酸素系のみが安全です。"},
    en:{summary:"Non-chlorine (colors)", detail:"Non-chlorine bleach is safer for colored fabrics."}
  },
  { id:"bleach_no_color", cat:"bleach", m:{no:true},
    ja:{summary:"漂白禁止（色落ち注意）", detail:"漂白で色落ち・繊維傷みのリスクがあります。使用しないでください。"},
    en:{summary:"No bleach (risk)", detail:"Bleach may cause fading or fiber damage. Do not use."}
  },

  // ---- dry: extra natural dry variants (same icons) ----
  { id:"dry_line_shade_wind", cat:"dry", m:{line:true, shade:true},
    ja:{summary:"日陰つり干し（風通し）", detail:"日陰で風通しの良い場所に干すと乾きやすいです。"},
    en:{summary:"Line dry in shade (airflow)", detail:"Shade with good airflow helps drying."}
  },
  { id:"dry_flat_shade_knit", cat:"dry", m:{flat:true, shade:true},
    ja:{summary:"日陰平干し（ニット向け）", detail:"ニットはハンガー干しで伸びやすいので平干し推奨。"},
    en:{summary:"Dry flat in shade (knits)", detail:"Knits may stretch on hangers; drying flat is recommended."}
  },
  { id:"tumble_low_delicate", cat:"dry", m:{tumble:true, dots:1},
    ja:{summary:"乾燥機 低温（デリケート）", detail:"低温で短めに。取り出して仕上げ干しすると縮みを抑えます。"},
    en:{summary:"Tumble low (delicate)", detail:"Low heat for a shorter time. Finish with air-drying to reduce shrinkage."}
  },
  { id:"tumble_no_alt", cat:"dry", m:{tumble:true, no:true},
    ja:{summary:"乾燥機NG（自然乾燥推奨）", detail:"乾燥機の熱・回転で傷む可能性。自然乾燥を選んでください。"},
    en:{summary:"No tumble (air dry)", detail:"Heat/tumbling may damage the fabric. Prefer air drying."}
  },

  // ---- iron: extra guidance variants (same icons) ----
  { id:"iron_low_synthetic", cat:"iron", m:{dots:1},
    ja:{summary:"低温（化繊向け）", detail:"化繊は高温で溶けることがあります。低温で素早く。"},
    en:{summary:"Low (synthetics)", detail:"Synthetics may melt at high heat. Use low heat briefly."}
  },
  { id:"iron_med_wool", cat:"iron", m:{dots:2},
    ja:{summary:"中温（ウール系）", detail:"ウールは当て布を使うとテカりを防げます。"},
    en:{summary:"Medium (wool)", detail:"Use a pressing cloth to avoid shine on wool."}
  },
  { id:"iron_no_alt", cat:"iron", m:{no:true},
    ja:{summary:"アイロンNG（スチームも不可）", detail:"熱を当てないでください。しわは吊るして伸ばす等で対応。"},
    en:{summary:"No iron (no steam)", detail:"Avoid heat. Remove wrinkles by hanging or gentle reshaping."}
  },

  // ---- dry clean: extra guidance (same icons) ----
  { id:"dc_p_only", cat:"dryclean", m:{code:"P"},
    ja:{summary:"ドライ（P）指定", detail:"家庭洗濯よりクリーニング店推奨。タグの他表示も併せて確認。"},
    en:{summary:"Dry clean (P) specified", detail:"Prefer professional care over home washing. Check other care notes too."}
  },
  { id:"dc_w_only", cat:"dryclean", m:{code:"W"},
    ja:{summary:"プロウエット（W）指定", detail:"家庭の“手洗い”とは別。プロの設備でのウエット処理向け。"},
    en:{summary:"Professional wet clean (W)", detail:"Different from home hand-wash. Intended for professional wet cleaning."}
  },

  // =========================================================
  // BULK ADDITIONS (to reach ~120 with useful search targets)
  // =========================================================

  // wash: more temps + gentle combinations (still meaningful)
  { id:"wash_30_alt", cat:"wash", m:{temp:30},
    ja:{summary:"30℃以下（標準）", detail:"迷ったら30℃以下が無難です。"},
    en:{summary:"30°C (safe default)", detail:"When unsure, 30°C is often a safe default."}
  },
  { id:"wash_40_alt", cat:"wash", m:{temp:40},
    ja:{summary:"40℃以下（しっかり洗い）", detail:"汚れが気になる場合は40℃以下で。素材の耐熱も確認。"},
    en:{summary:"40°C (stronger wash)", detail:"For heavier soil, wash up to 40°C if fabric allows."}
  },
  { id:"wash_gentle_20_alt", cat:"wash", m:{temp:20, underline:1},
    ja:{summary:"20℃弱水流（色落ち配慮）", detail:"色落ちしやすい衣類は冷水＋弱水流が安全です。"},
    en:{summary:"20°C gentle (color-safe)", detail:"Cold + gentle helps reduce dye loss."}
  },
  { id:"wash_verygentle_30_alt", cat:"wash", m:{temp:30, underline:2},
    ja:{summary:"30℃最弱（傷みやすい素材）", detail:"摩擦を極力減らす設定で。必要なら手洗いも検討。"},
    en:{summary:"30°C ultra gentle", detail:"Minimize friction. Consider hand wash if necessary."}
  },

  // bleach: duplicates for search terms
  { id:"bleach_any_alt", cat:"bleach", m:{allow:true},
    ja:{summary:"漂白OK（条件付き）", detail:"素材・色によっては傷むので、目立たない所で試すと安全です。"},
    en:{summary:"Bleach OK (with caution)", detail:"Test on a hidden area first as some fabrics/colors may be damaged."}
  },
  { id:"bleach_nonchlorine_alt", cat:"bleach", m:{nonchlorine:true},
    ja:{summary:"非塩素系のみ", detail:"酸素系漂白剤のみ使用可能。塩素系は使用しないでください。"},
    en:{summary:"Non-chlorine only", detail:"Use oxygen-based/non-chlorine bleach only. Avoid chlorine."}
  },

  // dry: more natural variants (same icons but common search phrases)
  { id:"dry_drip_alt", cat:"dry", m:{drip:true},
    ja:{summary:"ぬれ干し（脱水弱め）", detail:"脱水を弱めにして、絞らずにぬれ干しすると形崩れしにくいです。"},
    en:{summary:"Drip dry (gentle spin)", detail:"Use gentle spin and hang without wringing to reduce distortion."}
  },
  { id:"dry_line_alt", cat:"dry", m:{line:true},
    ja:{summary:"ハンガー干し", detail:"ハンガーでつり干ししてください。型崩れしやすい場合は厚手ハンガー推奨。"},
    en:{summary:"Hang dry", detail:"Hang to dry. Use a thicker hanger if it deforms easily."}
  },
  { id:"dry_flat_alt", cat:"dry", m:{flat:true},
    ja:{summary:"置き干し（平干し）", detail:"平らに置いて干してください。ニット・セーターなど。"},
    en:{summary:"Lay flat to dry", detail:"Lay flat to dry. Common for sweaters/knits."}
  },

  // tumble: more phrases
  { id:"tumble_low_alt", cat:"dry", m:{tumble:true, dots:1},
    ja:{summary:"乾燥機 低温（短め）", detail:"低温でも長時間は縮むことがあります。短め推奨。"},
    en:{summary:"Tumble low (short)", detail:"Even low heat may shrink items if run too long. Keep it short."}
  },
  { id:"tumble_med_alt", cat:"dry", m:{tumble:true, dots:2},
    ja:{summary:"乾燥機 中温（標準）", detail:"中温で乾燥機使用が可能。過乾燥に注意。"},
    en:{summary:"Tumble medium (standard)", detail:"Medium heat tumble allowed. Avoid overdrying."}
  },
  { id:"tumble_high_alt", cat:"dry", m:{tumble:true, dots:3},
    ja:{summary:"乾燥機 高温（注意）", detail:"高温は縮み・傷みが出やすいので注意。"},
    en:{summary:"Tumble high (caution)", detail:"High heat can cause shrinkage or wear. Use with caution."}
  },

  // iron: more duplicates for common searches
  { id:"iron_low_alt", cat:"iron", m:{dots:1},
    ja:{summary:"低温（110℃目安）", detail:"低温。プリント面は裏から当てると安全な場合があります。"},
    en:{summary:"Low (≈110°C)", detail:"Low heat. Iron prints from the reverse side when possible."}
  },
  { id:"iron_med_alt", cat:"iron", m:{dots:2},
    ja:{summary:"中温（150℃目安）", detail:"中温。しわはスチームに頼りすぎず当て布も活用。"},
    en:{summary:"Medium (≈150°C)", detail:"Medium heat. Use a pressing cloth when needed."}
  },
  { id:"iron_high_alt", cat:"iron", m:{dots:3},
    ja:{summary:"高温（200℃目安）", detail:"高温。焦げやすいので様子を見ながら。"},
    en:{summary:"High (≈200°C)", detail:"High heat. Watch closely to prevent scorching."}
  },

  // dryclean: more codes + process intensity duplicates
  { id:"dc_p_alt", cat:"dryclean", m:{code:"P"},
    ja:{summary:"ドライ（P）", detail:"溶剤P。クリーニング店にタグを見せて相談すると確実です。"},
    en:{summary:"Dry clean (P)", detail:"Solvent P. Show the label to the cleaner for best results."}
  },
  { id:"dc_f_alt", cat:"dryclean", m:{code:"F"},
    ja:{summary:"ドライ（F）", detail:"溶剤F。デリケート素材に多い場合があります。"},
    en:{summary:"Dry clean (F)", detail:"Solvent F. Sometimes used for more delicate items."}
  },
  { id:"dc_p_gentle_alt", cat:"dryclean", m:{code:"P", underline:1},
    ja:{summary:"ドライ（P）弱処理", detail:"弱い処理指定。摩擦・温度を抑えた工程。"},
    en:{summary:"Dry clean (P) gentle", detail:"Gentle process: reduced mechanical action and heat."}
  },
  { id:"dc_p_verygentle_alt", cat:"dryclean", m:{code:"P", underline:2},
    ja:{summary:"ドライ（P）最弱処理", detail:"最弱処理指定。装飾や型崩れしやすい衣類向け。"},
    en:{summary:"Dry clean (P) ultra gentle", detail:"Ultra gentle process: for embellished/shape-sensitive garments."}
  },
  { id:"dc_no_alt", cat:"dryclean", m:{no:true},
    ja:{summary:"ドライNG", detail:"ドライクリーニング不可。タグ内の別表示（手洗い等）を参照。"},
    en:{summary:"No dry clean", detail:"Dry cleaning not allowed. Follow other care symbols on the label."}
  }
];
