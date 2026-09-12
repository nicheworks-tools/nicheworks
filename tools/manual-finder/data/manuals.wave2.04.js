(window.MANUALFINDER_WAVE2_SEIKO ||= []).push(`H021|https://www.seikowatches.com/us-en/-/media/Files/Common/Seiko/instructions/Japanese/H/H021/H021.pdf
H022|https://www.seikowatches.com/us-en/-/media/Files/Common/Seiko/instructions/Japanese/H/H022/H022.pdf
H023|https://www.seikowatches.com/us-en/-/media/Files/Common/Seiko/instructions/Japanese/H/H023/H023.pdf
H024|https://www.seikowatches.com/us-en/-/media/Files/Common/Seiko/instructions/Japanese/H/H024/H024.pdf
H851|https://www.seikowatches.com/instructions/html/SEIKO_H851_D_JP/index
H855|https://www.seikowatches.com/instructions/html/SEIKO_H855_D_JP/index`);
(window.MANUALFINDER_WAVE2_ROLAND ||= []).push(`N-835|https://lib.roland.co.jp/support/jp/manuals/res/1808910/N-835_j1.pdf
NE-7|https://lib.roland.co.jp/support/jp/manuals/res/1809117/NE-7_je1.pdf
NF-1|https://lib.roland.co.jp/support/jp/manuals/res/1809519/NF-1_j.pdf
NS-50|https://lib.roland.co.jp/support/jp/manuals/res/1809116/NS-50_j.pdf
OC-2|https://lib.roland.co.jp/support/jp/manuals/res/1809767/OC-2_j2.pdf
OC-20G|https://lib.roland.co.jp/support/jp/manuals/res/1810530/OC-20G_j1.pdf
OD-1|https://lib.roland.co.jp/support/jp/manuals/res/1808908/OD-1_j.pdf
OD-2|https://lib.roland.co.jp/support/jp/manuals/res/1809115/OD-2_j.pdf
OD-2R|https://lib.roland.co.jp/support/jp/manuals/res/1809114/OD-2R_j.pdf
P-1|https://lib.roland.co.jp/support/jp/manuals/res/1810528/P-1_r_j2.pdf
P-330|https://lib.roland.co.jp/support/jp/manuals/res/1808903/P-330_j.pdf
P-55|https://lib.roland.co.jp/support/jp/manuals/res/1810023/P-55_j.pdf`);

// Wave 2S: direct Seiko caliber manuals verified from the official instruction index.
window.MANUALFINDER_WAVE2_SEIKO.push(`3X22|https://www.seikowatches.com/instructions/html/SEIKO_3X22_JP/index
3X32|https://www.seikowatches.com/instructions/html/SEIKO_3X32_JP/index
3X62|https://www.seikowatches.com/instructions/html/SEIKO_3X62_JP/index
4R34|https://www.seikowatches.com/instructions/html/SEIKO_4R34_JP/index
4R57|https://www.seikowatches.com/instructions/html/SEIKO_4R57_JP/index
5X53|https://www.seikowatches.com/instructions/html/SEIKO_5X53_JP/index
5X63|https://www.seikowatches.com/instructions/html/SEIKO_5X63_JP/index
5X83|https://www.seikowatches.com/instructions/html/SEIKO_5X83_JP/index
6R54|https://www.seikowatches.com/instructions/html/SEIKO_6R54_JP/index
6R64|https://www.seikowatches.com/instructions/html/SEIKO_6R64_JP/index
7B75|https://www.seikowatches.com/instructions/html/SEIKO_7B75_JP/index
7C17|https://www.seikowatches.com/jp-ja/-/media/Files/Common/Seiko/instructions/Japanese/7/7C17/7C17.pdf
7C21|https://www.seikowatches.com/jp-ja/-/media/Files/Common/Seiko/instructions/Japanese/7/7C21/7C21.pdf
7C46|https://www.seikowatches.com/jp-ja/-/media/Files/Common/Seiko/instructions/Japanese/7/7C46/7C46.pdf
7D46|https://www.seikowatches.com/jp-ja/-/media/Files/Common/Seiko/instructions/Japanese/7/7D46/7D46.pdf
7D48|https://www.seikowatches.com/jp-ja/-/media/Files/Common/Seiko/instructions/Japanese/7/7D48/7D48.pdf
7J21|https://www.seikowatches.com/jp-ja/-/media/Files/Common/Seiko/instructions/Japanese/7/7J21/7J21.pdf
7K36|https://www.seikowatches.com/jp-ja/-/media/Files/Common/Seiko/instructions/Japanese/7/7K36/7K36.pdf
7K52|https://www.seikowatches.com/jp-ja/-/media/Files/Common/Seiko/instructions/Japanese/7/7K52/7K52.pdf
7N00|https://www.seikowatches.com/jp-ja/-/media/Files/Common/Seiko/instructions/Japanese/7/7N00/7N00.pdf
7N07|https://www.seikowatches.com/jp-ja/-/media/Files/Common/Seiko/instructions/Japanese/7/7N07/7N07.pdf
7N21|https://www.seikowatches.com/jp-ja/-/media/Files/Common/Seiko/instructions/Japanese/7/7N21/7N21.pdf
8B63|https://www.seikowatches.com/instructions/html/SEIKO_8B63_JP/index
8B92|https://www.seikowatches.com/instructions/html/SEIKO_8B92_JP/index`);

// Normalize Seiko evidence/support links to the model-specific official caliber search.
// This removes the original H-index assumption while preserving the existing builder contract.
{
  const buildWave2 = window.MANUALFINDER_BUILD_WAVE2;
  if (typeof buildWave2 === "function") {
    window.MANUALFINDER_BUILD_WAVE2 = () => buildWave2().map((record) => {
      if (record.maker !== "Seiko" || !record.model) return record;
      const supportUrl = `https://www.seikowatches.com/jp-ja/customerservice/instruction?CaliberNumber=${encodeURIComponent(record.model)}&Language=ja-JP`;
      return { ...record, supportUrl, evidenceUrl: supportUrl };
    });
  }
}
