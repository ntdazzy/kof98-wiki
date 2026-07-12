# Nuôi Võ Sĩ: Cấp/Phẩm/Sao/Tinh Mạch/Kỹ Năng/Thức Tỉnh/Tiềm Năng

Đã kiểm chứng đầy đủ toàn bộ source. Tôi đã đối chiếu từng con số. Dưới đây là bản cuối đã sửa.

---

# Nuôi Võ Sĩ (格斗家养成) — Cẩm Nang Toàn Tập

> Trang wiki mô tả 7 hệ nuôi Võ Sĩ (格斗家 = **Võ Sĩ**): Nâng Cấp · Thăng Phẩm · Thăng Sao · Tinh Mạch · Kỹ Năng · Thức Tỉnh · Tiềm Năng. Mọi con số trích **thẳng từ config Lua gốc** (`reference/client-src/…`), ghi rõ `file:dòng`. Ví dụ chuẩn dùng **H001** (Kusanagi Kyo / 草薙京) và **H043** khi cần bảng sao.

---

## Mini-Glossary (Trung → Việt)

Tra chuẩn từ `data/i18n/tm.json`:

| Trung | Việt | Trung | Việt |
|---|---|---|---|
| 升级 | Nâng Cấp | 觉醒 | Thức Tỉnh |
| 升品 | Thăng Phẩm | 觉醒武器 | Vũ Khí Giác Tỉnh |
| 升星 | Thăng Sao | 技能 | Kỹ Năng |
| 星脉 | Tinh Mạch | 潜能 | Tiềm Năng (寻宝 = "Tìm Báu") |
| 突破 | Đột Phá | 战魂 | Chiến Hồn |
| 战力 | Lực Chiến | 战魂精华 | Tinh Hoa Chiến Hồn |
| 格斗家 | Võ Sĩ | 神器 | Thần Khí |
| 资质 | Tư Chất (độ hiếm cố định) | 援护 | Viện Trợ |
| 武器缘 | Duyên Vũ Khí (bậc sao vũ khí) | 碎片 | Mảnh |

Màu phẩm: 白 = Trắng, 绿 = Lục, 蓝 = Lam, 紫 = Tím, 橙 = Cam, 红 = Đỏ.

> **Phân biệt quan trọng — 资质 (Tư Chất) ≠ 升品 (Thăng Phẩm):** game dịch cả hai chữ na ná là "phẩm chất", nhưng đây là **hai hệ khác nhau** trong công thức:
> - **资质 / Tư Chất** = độ hiếm **cố định** của thẻ (R/SR/SSR…), KHÔNG nuôi được, quyết định hệ số nhân `factor5`.
> - **升品 / Thăng Phẩm** = hệ **nuôi được**, đổ vào **chỉ số nền** (`factor1`).

---

## 0. Lực Chiến (战力) sinh ra từ đâu — Công thức gốc

Trích nguyên văn `HeroCombatFormula.lua:5` (mô tả) + `:17-28` (code thật):

```
Lực Chiến = factor1 × factor2 × factor3 × factor4 × factor5 × factor6
          + factor7 + factor8 + factor9 + factor10 + factor11
```

| # | Nội dung | Hệ nào đổ vào |
|---|---|---|
| factor1 | `ATK + DEF + HP×0.08` (chỉ số nền) | **Nâng Cấp + Thăng Phẩm + Thăng Sao + Vũ khí** |
| factor2 | `3 + (sát thương/miễn thương/phản/hút…)` | thuộc tính |
| factor3 | `12 + (bạo kích/chống bạo/chặn/hiệu ứng…)` | thuộc tính |
| factor4 | `1 + Sao×0.01 + DuyênVũKhí×0.01 + %ChiếnHồn(cục bộ) + %TiềmNăng + %ĐộtPhá + %VòngQuay` | Sao/Vũ khí/Chiến Hồn/Tiềm Năng |
| **factor5** | **`资质` / Tư Chất — độ hiếm CỐ ĐỊNH của thẻ** (nhân toàn bộ) | **KHÔNG nuôi được** |
| factor6 | `0.012` (hiệu chỉnh) | hằng số |
| factor7 | `800 × Σ(nhóm tỉ lệ A)` | thuộc tính |
| factor8 | `400 × Σ(nhóm tỉ lệ B)` | thuộc tính |
| factor9 | `Σ(cấp kỹ năng × BV_SKValue)` | **Kỹ Năng** |
| factor10 | `战魂 tổng cấp × BV_SKValue` | Chiến Hồn |
| factor11 | vòng quay may mắn | — |

Hằng số gốc (`ConfigValue.lua`):

| Hệ số | Giá trị | Nguồn |
|---|---|---|
| `BV_FixedFA` | 3 | `ConfigValue.lua:28-32` |
| `BV_FixedFB` | 12 | `:33-37` |
| `BV_FixedFC` | 1 | `:38-42` |
| `BV_HeroStarF` | **0.01** (mỗi bậc Sao = +1% factor4) | `:43-47` |
| `BV_EquipStarF` | **0.01** (mỗi bậc Duyên Vũ Khí = +1% factor4) | `:48-52` |
| `BV_AdjustF` | 0.012 | `:77-81` |
| `BV_RarityF` (Tư Chất, **server mới**) | R=1 · SR=1.05 · SR+=1.1 · SSR=1.15 · (15)=1.2 · (16)=1.2 | `:53-63` |
| `BV_RarityF_Old` (server cũ, mở trước 13-02-2020) | R=1 · SR=1.2 · SR+=1.45 · (14/15/16)=1.75 | `:65-75` |

**Điểm mấu chốt (đã sửa):** `factor5 = rarityFactor` lấy từ `hero:getRareity()` — tức **độ hiếm gốc của thẻ** (`HeroAttribute.lua:104-114`), **không phải** Thăng Phẩm. Thăng Phẩm/Nâng Cấp/Thăng Sao đều đổ vào **factor1 (chỉ số nền)**, không đụng factor5.

**Công thức chỉ số nền** (`HeroAttributeFormula.lua:95-114`):

```
ChỉSốNền = [ PhẩmBase + SaoBase + (SaoRatio + PhẩmRatio) × Cấp ]
         × [ baseRatio × TưChất × hằngSố ]
         + baseValue
```

→ **Cấp là hệ số NHÂN** với tổng `(SaoRatio + PhẩmRatio)`. Đây là lý do cả 3 hệ Cấp–Phẩm–Sao ràng chặt nhau, và tại sao kéo cấp là nền tảng.

**Thứ tự ưu tiên đổ lực (khuyến nghị CHÍNH THỨC trong game, `Translate_1.lua:11206`):**
> **升星 → 升品 → 升级 → 装备 → 技能 → 星脉**
> Thăng Sao → Thăng Phẩm → Nâng Cấp → Trang bị (Thức Tỉnh) → Kỹ Năng → Tinh Mạch.

---

## 1. Nâng Cấp (升级) — `HeroExp.lua`

**Là gì:** Cho Võ Sĩ ăn Đan Kinh Nghiệm để lên cấp, tăng ATK/DEF/HP nền → đẩy `factor1`.

**Cơ chế:**
- Mỗi cấp cần `NeedExp` EXP. Bảng tới **cấp 150** (`HeroExp.lua`, 606 dòng).
- **Cap = Cấp Người Chơi:** ăn Đan thường thì `maxLevel = player:getLevel()` (`StrengthenLevelMediator.lua:255, :414`). Có chế độ Đan đặc biệt cho vượt lên `player level + N` (`:282, :419`).

**Số THẬT — EXP cần cho mỗi cấp** (`HeroExp.lua`):

| Cấp → | NeedExp | Dòng |
|---|---|---|
| 1→2 | 30 | `:4-6` |
| 10→11 | 480 | `:40-42` |
| 30→31 | 24 000 | `:120-122` |
| 50→51 | 360 000 | `:200-202` |
| 60→61 | 960 000 | `:240-242` |
| 80→81 | 5 400 000 | `:320-322` |
| 100→101 | 29 600 000 | `:400-402` |
| 120→121 | 90 800 000 | `:480-482` |
| 150 (trần bảng) | 322 000 000 | `:600-602` |

**Mẹo:** Cấp Võ Sĩ khoá theo cấp người chơi — đừng tích Đan để "vượt trần"; giữ core ăn kịp trần, Đan dư nuôi Võ Sĩ mới cho theo kịp đội hình.

---

## 2. Thăng Phẩm (升品) — `HeroQualityBase.lua` + `HeroQualityRate.lua`

**Là gì (đã sửa cơ chế):** Nâng "phẩm" của Võ Sĩ để **tăng chỉ số nền (ATK/DEF/HP)**. Về mặt code, Thăng Phẩm cấp hai giá trị vào công thức chỉ số nền (`HeroAttributeFormula.lua:35-44`):
- `QualityBaseValue` — **cộng thẳng** (flat) vào phần base.
- `QualityFactor` — **tỉ lệ theo cấp** (nhân với Cấp).

→ Đây **KHÔNG** phải `factor5` (Tư Chất). Nhưng vẫn là đòn bẩy **rất mạnh** vì `QualityFactor` tăng từ **4 (Trắng) → 49 (Đỏ)** và `QualityBaseValue` từ **0 → 7900**.

**Mã phẩm & màu** (`HeroQualityRate.lua`):

| Mã | Quality | Màu | Bậc "+" | `QualityBaseValue` | `QualityFactor` | Dòng |
|---|---|---|---|---|---|---|
| Q10 | 1 | **Trắng** | +0 | 0 | 4 | `:4-10` |
| Q20–Q22 | 2 | **Lục** | +0…+2 | 50→200 | 5→7 | `:11-31` |
| Q30–Q33 | 3 | **Lam** | +0…+3 | 300→650 | 8→12 | `:32-59` |
| Q40–Q44 | 4 | **Tím** | +0…+4 | 800→1900 | 14→22 | `:60-94` |
| Q50–Q56 | 5 | **Cam** | +0…+6 | 2300→7100 | 26→46 | `:95-150` |
| Q60–Q66 | 6 | **Đỏ** | +0…+6 | 7900 | 49 | `:137-192` |
| Q70 | 7 | (đỉnh) | +0 | 7900 | 49 | `:193-199` |

> `QualityLevel` = số "+N". VD Q44 = Tím +4, Q56 = Cam +6.

**Chi phí & khoá cấp** — bảng THẬT của **H001** (`HeroQualityBase.lua`), đã xác minh **toàn bộ**:

| Bước | `LevelRequest` | `CostGold` | `CostItem` chính | Dòng |
|---|---|---|---|---|
| Q10 | Lv1 | 5 000 | IM_QualityUp×3 + QS201/202/203 | `:4-28` |
| Q20 | Lv1 | 10 000 | IM_QualityUp×5 + QS201×3 | `:30-54` |
| Q21 | Lv8 | 12 500 | IM_QualityUp×15 + QS211×9 | `:56-80` |
| Q22 | Lv15 | 25 000 | IM_QualityUp×27 + QS211×15 | `:82-106` |
| Q30 | Lv23 | 50 000 | IM_QualityUp×60 + … | `:108+` |
| Q40 | Lv41 | 250 000 | — | — |
| Q43→Q44 | Lv52→**Lv55** | 400 000→500 000 | — | — |
| Q50 | Lv57 | 625 000 | — | — |
| Q56 | Lv76 | 2 500 000 | — | — |
| Q60 (Đỏ) | **Lv101** | 0 (chỉ tốn vật phẩm) | — | — |

> **Về mốc "+3→+4 cần Lv51":** `LevelRequest` là **theo từng Võ Sĩ / từng bước**, không cố định. Với H001, bước Tím +3→+4 (Q43→Q44) cần **Lv52→Lv55**. Nhưng đếm cả file: điều kiện **`LevelRequest = 51` xuất hiện đúng 47 lần** — rất nhiều Võ Sĩ có 1 bước phẩm chốt tại **Lv51**. Nói cách khác: đẩy phẩm sâu buộc phải kéo cấp Võ Sĩ (khoá theo cấp người chơi) → 3 hệ Cấp–Phẩm–Người-chơi ràng nhau.

**Nguyên liệu:** `IM_QualityUp` (đá thăng phẩm) + đá phẩm theo bậc `IM_QS2xx/QS3xx/QS4xx…` + Vàng (`IR_Gold`).

**Mẹo:** Mỗi lần lên **màu** (Lục→Lam→Tím…) là bước nhảy chỉ số nền lớn nhất. Ưu tiên đẩy màu cho core trước khi vọc "+".

---

## 3. Thăng Sao (升星) — `HeroStarBase.lua` + `HeroStarRate.lua` + `HeroStarSkill.lua`

**Là gì:** Dùng **Mảnh** (碎片) của chính Võ Sĩ đó nạp thành "điểm sao" (StarUpScore) để lên sao. **Tối đa 7 sao** (`H043_ST1..ST7`), mỗi sao có **5 tiểu tinh** (小星).

**Số THẬT** (bảng H043, `HeroStarBase.lua`):

| Sao | `StarUpScore` | `StarUpFactor` | `StarUpCost` (Vàng) | `SmallStarUpFactor` (5 tiểu tinh) | Dòng |
|---|---|---|---|---|---|
| 1★ | 150 | 50 | 200 000 | {10,15,20,25,30} | `:4-34` |
| 2★ | 300 | 100 | 500 000 | {15,20,40,60,80} | `:35-65` |
| 3★ | 500 | 150 | 1 000 000 | … | `:66-96` |
| 4★ | 800 | — | — | — | `:97-127` |
| 5★ | 2 000 | — | — | — | `:128-158` |
| 6★ | 3 000 | — | — | — | `:159-189` |
| 7★ | 0 (trần) | — | — | — | `:190+` |

- Tiểu tinh có `SmallStarUpScore` **thay đổi theo bậc** (ST1 = 100/lần, ST2 = 200/lần…) + `SmallStarUpCost` riêng (`:20-33`).
- **Hệ số Lực theo sao-tổng** (`HeroStarRate.lua`, gộp đại tinh+tiểu tinh, 1→37): sao-tổng 1 → factor 1, base 0 (`:4-8`); sao-tổng 37 → factor 20, base 800 (`:184-188`). Cả hai đổ vào chỉ số nền.
- **Cộng Lực trực tiếp:** `factor4` chứa `Sao × BV_HeroStarF (0.01)` → mỗi bậc **đại tinh** +1% (`HeroCombatFormula.lua:20`).
- **Kỹ năng Sao** (`HeroStarSkill.lua`): mỗi Võ Sĩ 1 kỹ năng `SK_Hxxx_Star`, `LevelMax=5`, **mở/nâng tại sao 3,4,5,6,7** (`:4-27`).

**Nguyên liệu:** Mảnh Võ Sĩ (rút thẻ, đổi mảnh, hoạt động) + Vàng.

**Mẹo:** Sao là **ưu tiên số 1** (vừa +% factor4, vừa mở kỹ năng sao, vừa nâng chỉ số nền). Gom đủ 150/300/500 điểm để nhảy sao.

---

## 4. Tinh Mạch (星脉) — `HeroSoulFate.lua` + `HeroSoulFateLevel.lua` + `HeroSoulFateStar.lua`

**Là gì:** Hệ nuôi **buff toàn cục theo Võ Sĩ**. Đặc điểm sống còn: hiệu quả áp dụng **cả khi Võ Sĩ KHÔNG ra trận** — nguyên văn `Translate_1.lua`: *"星脉效果即使格斗家不上阵也生效，千万别错过~"* (Tinh Mạch có hiệu quả kể cả khi Võ Sĩ không lên sàn, đừng bỏ lỡ).

**Cơ chế:**
- Mỗi Võ Sĩ có 1 "Tinh Mạch": **`StarMax` = 14** (hệ Tinh Mạch mới) **hoặc 7** (hệ Hồn cũ). Hệ 14 sao mở 15 kỹ năng Tinh Mạch (`SoulSkill` SPS0–SPS14), trần cấp riêng theo bậc `LevelMax = {10,20,30,50,60,70,80,100,110,120,130,140,150,160,200}` (`HeroSoulFate.lua:44-77`).
- **Nâng cấp Tinh Mạch** = cơ chế **Chúc Phúc (祝福/BlessValue) theo xác suất** (`HeroSoulFateLevel.lua:4-33`):
  - Mỗi lần tốn **`IR_SoulCream` × 300** (Kem Hồn).
  - `MaxExp = 160`, `BlessValue = 10`.
  - `LevelUpProb`: xác suất nền `0.006`, cộng dồn, **đủ 150 điểm chúc phúc thì lên chắc chắn** (bảo hiểm).
- **Thăng Sao Tinh Mạch** (`HeroSoulFateStar.lua`): tốn **đá Sao Hồn** (`SoulStar`, bậc 6★/7★) + **Mảnh Võ Sĩ** (`IM_Fxxx`) + **`IM_FateStone`** (Tinh Mạch Thạch, ở các bậc cao Star9/11/13…). VD `H001_FSoul_Star8`: SoulStar6×6 + SoulStar7×2 + IM_F001×400 (`:4-24`).

**Vì sao đáng làm** (dẫn `Translate_1.lua:11206`):
- 薇丝麦卓 (Vice) Tinh Mạch full = **2 lần miễn phí thể lực + vàng/ngày**.
- 娜可露露 (Nakoruru) full = **1 lần rút thẻ miễn phí/ngày**.
- 大门 (Daimon) full = **+thể lực mỗi giờ**.
- *"低资质碎片用处非常大…例如星脉、战魂"* — Tinh Mạch là **kho tiêu Mảnh phẩm thấp** cực tốt.

**Nguyên liệu:** Kem Hồn `IR_SoulCream`, Mảnh Võ Sĩ `IM_Fxxx`, Đá Sao Hồn `SoulStar`, `IM_FateStone`.

**Mẹo:** Tinh Mạch xếp **cuối** về Lực Chiến thô, nhưng **nhất về QoL toàn cục**. Dồn Mảnh dư (nhất là phẩm thấp) vào Tinh Mạch của Vice/Nakoruru/Daimon để "sinh lời kép" mỗi ngày, kể cả Võ Sĩ đó không ra trận.

---

## 5. Kỹ Năng (技能) — `ConfigValue.lua` + `HeroDevelopSkill.lua`

**Là gì:** Nâng cấp từng ô kỹ năng của Võ Sĩ (đòn thường + tuyệt chiêu + bị động…).

**Cơ chế & số THẬT:**
- **Trần cấp kỹ năng:** `Skill_MaxLv = 120` (`ConfigValue.lua:15154-15158`).
- **Cap = Cấp Võ Sĩ:** cấp kỹ năng **không vượt cấp Võ Sĩ hiện tại** — logic `heroLevel > skillData:getLevel()` (`StrengthenSkillMediator.lua:593`; đồng bộ `HeroSystem.lua:2742`, với khoảng chênh -5 cho nút nâng nhanh).
- **Chi phí = Điểm Kỹ Năng + Vàng:** chi phí/cấp lấy từ `Skill_CostBaseSx` theo ô, **nhân hệ số theo độ hiếm** `Skill_CostFactor` (`HeroDevelopSkill.lua`).
- **Bảng chi phí gốc** `Skill_CostBaseS1` (đòn 1, `ConfigValue.lua:14372+`): **250×5 → 500×5 → 1000×5 → 2000×5 → 3750×10 → 7500×5 …** (bậc thang).
- **Hệ số theo độ hiếm** `Skill_CostFactor` (`:15128-15138`): R(11)=0.8 · SR(12)=1.0 · SR+(13)=1.2 · SSR(14)=1.5 · (15)=1.5 · (16)=2.0.

**Cộng Lực trực tiếp** — `factor9 = Σ(cấp kỹ năng × BV_SKValue)` (`HeroCombatFormula.lua:25`). Bảng `BV_SKValue` (`ConfigValue.lua:92-106`):

| Ô kỹ năng | Lực/1 cấp |
|---|---|
| SK_A4 (tuyệt chiêu/大招) | **8** (cao nhất) |
| SK_A3 · SK_P1 · SK_P2 (bị động) | **6** |
| SK_A2 | 5 |
| SK_A1 (đòn thường) | 4 |
| SK_Soul1/3/5 | 0 |

**Mẹo:** Điểm Kỹ Năng khan → ưu tiên **A4 (+8/cấp)** và **bị động P1/P2 (+6/cấp)** để mỗi điểm ra nhiều Lực nhất. Đòn thường (A1, +4) nâng sau.

---

## 6. Thức Tỉnh (觉醒) — Vũ Khí — `HeroEquipBase.lua` + `HeroEquipQuality.lua`

**Là gì:** Mỗi Võ Sĩ có 1 **Vũ Khí** (`Hxxx_E1`) với **3 nhánh nuôi**: Phẩm vũ khí, **Duyên Vũ Khí (武器缘)**, và **Thức Tỉnh (觉醒)**.

**Cơ chế & số THẬT** (bảng H001_E1, `HeroEquipBase.lua:4-59`):

1. **Phẩm Vũ Khí** (`HeroEquipQuality.lua`): R_1_10 → R_1_20 → R_1_21 → … Mỗi bậc có `PlayerLevelLimit`, `EquipAttr` (VD R_1_10: ATK {8,1}, khoá Lv1, tốn `IR_Gold×2000` + `IM_QS201×1`; R_1_20: ATK {27,1.8}, khoá Lv9). Bậc cao thêm đá nâng vũ khí `IM_EquipUpxx` (`:4-59`).
2. **Duyên Vũ Khí / bậc sao vũ khí** (`StarUpCost`): tốn **`IM_RichStone`** (đá 琢磨), amount tăng dần **{1,3,5,10,15,20,25,30,35,40, 50×5, 60×5, 70×5, 80×5}** (30 bậc, `:23-58`). Đây là `武器缘等级` trong công thức → `factor4 += DuyênVũKhí × BV_EquipStarF (0.01)`, +1%/bậc.
3. **Thức Tỉnh** (`AwakenCost`): tốn **Mảnh Vũ Khí `IM_H001_E1`** với `amount = {3,3,3}` → **3 nấc Thức Tỉnh** (`:13-22`), mở **Vũ Khí Giác Tỉnh** (觉醒武器) — hiệu ứng/hình riêng + cộng chỉ số.

> **Sửa nguyên liệu:** đá 琢磨 trong config là **`IM_RichStone`** (KHÔNG phải `IR_RichStone`).

**Cộng Lực:** chỉ số nền vũ khí (ATK/…) vào `factor1`; Duyên Vũ Khí +1%/bậc vào `factor4`.

**Mẹo** (dẫn `Translate_1.lua:11206`): *"小额充值送草薙京觉醒武器…最具性价比的活动"* — gói nạp nhỏ tặng **Vũ Khí Giác Tỉnh Kyo là hoạt động đáng giá nhất game**. Đội **Lửa (火队)** thì *"觉醒武器也是可以换到的"* — đổi được **vũ khí giác tỉnh miễn phí**, cực hợp người chơi tiết kiệm.

---

## 7. Tiềm Năng (潜能) — `HeroPotential.lua` + `HeroPotentialCost.lua`

**Là gì:** Chuỗi **nấc Tiềm Năng** (Po_H001_1..8 — H001 có **8 tầng**) vừa **Đột Phá (突破)** mở kỹ năng mới, vừa **nâng cấp** cộng % Lực.

**Cơ chế & số THẬT** (`HeroPotential.lua:4-60`):
- Mỗi tầng có `BreakSkill` / `LevelUpSkill`. VD tầng 1 = `Po_Break_Skill_H001_01`; tầng 2 = `SK_H001_A1`.
- **`BreakCost`** (chi phí Đột Phá): tầng 1 = `IM_F001×30` (Mảnh Kyo) + `IM_RichStone×9` (`:14-23`); tầng 2 = `IM_F001×50 + IM_RichStone×15 + IM_E4_5×5` (`:73-86`).
- **`BreakCondition`** (điều kiện mở): yêu cầu **Võ Sĩ KHÁC đạt phẩm nhất định** — `Condi_OneHeroQualityUp`. VD tầng 2 cần **H001 ≥ Q53, H047 ≥ Q44, H003 ≥ Q30** (`:99-127`). Đây là "cổng liên kết dàn tướng".
- **10 bước nâng cấp/tầng** (`Cost = HeroPC_..._1..10`, chi phí từ `HeroPotentialCost.lua`). Chuỗi THẬT của H001 tầng 1 (`HeroPC_SR_DPS_1_1..10`): `IM_QualityUp` **15→18→21→24→27→…→54**, `CostGold` **9 000→66 000**, kèm đá phẩm `IM_QS4xx` + `IM_PSDps`.

> **Sửa số:** draft cũ ghi `IM_QualityUp 45→81→135…405` là **của nhóm cost khác**, KHÔNG phải H001. Chuỗi H001 thật là 15→54 như trên.

**Cộng Lực:** `factor4` chứa `potentialFactor = tổng %Tiềm Năng` (`HeroCombatFormula.lua:20`) + kỹ năng Đột Phá.

**Nguyên liệu:** Mảnh Võ Sĩ `IM_Fxxx`, Đá 琢磨 `IM_RichStone`, Đá thăng phẩm `IM_QualityUp` + đá phẩm — **dùng chung kho với Thăng Phẩm**, nên cân đối.

**Mẹo:** Tiềm Năng đòi **nuôi cả liên minh Võ Sĩ** (điều kiện phẩm chéo). Ưu tiên mở tầng có kỹ năng Đột Phá đổi meta cho core; các bước "+%" nhỏ để sau vì ăn chung nguyên liệu với Thăng Phẩm.

---

## Tổng kết ưu tiên nuôi (theo game gốc)

| Hệ | Đòn bẩy Lực | Nguyên liệu chính | Ưu tiên |
|---|---|---|---|
| **Thăng Sao** | +1%/sao factor4 + chỉ số nền + kỹ năng sao | Mảnh Võ Sĩ + Vàng | ⭐ #1 |
| **Thăng Phẩm** | chỉ số nền (factor1): base 0→7900, ratio 4→49 | IM_QualityUp + đá phẩm + Vàng | ⭐ #2 |
| **Nâng Cấp** | nhân chỉ số nền (Cấp × ratio Sao+Phẩm) | Đan EXP | #3 (khoá theo cấp người chơi) |
| **Thức Tỉnh/Vũ khí** | chỉ số nền + Duyên VK +1%/bậc | Mảnh VK + IM_RichStone | #4 |
| **Kỹ Năng** | +4…8/cấp (factor9) | Điểm Kỹ Năng + Vàng | #5 (ưu tiên A4, bị động) |
| **Tinh Mạch** | chỉ số + **QoL toàn cục** | Kem Hồn + Mảnh + Đá Sao Hồn | #6 (thấp về Lực, cao về lợi ích ngày) |

**Ràng buộc dây chuyền:** Cấp người chơi → mở trần **Cấp Võ Sĩ** → mở `LevelRequest` của **Thăng Phẩm** → mở trần **Kỹ Năng** (cap = cấp Võ Sĩ). Đồng thời trong công thức chỉ số nền, **Cấp là hệ số nhân** với tổng ratio Sao+Phẩm. Vì vậy **giữ core luôn kịp trần cấp** là nền tảng của mọi hệ.

---

*Số liệu trích từ `reference/client-src/config/` và `reference/client-src/snk/gameplay/develop/`. Tên Việt lấy từ `data/i18n/tm.json`. Không suy đoán con số ngoài config.*

---

> ## Độ tin cậy
>
> **Đã sửa — LỖI CƠ CHẾ lớn:**
> - **`factor5` KHÔNG phải Thăng Phẩm.** Draft cũ nói "Thăng Phẩm quyết định rarityFactor (factor5), đòn bẩy nhân". Thực tế `factor5 = extraData.rarityFactor` lấy từ `hero:getRareity()` = **độ hiếm cố định của thẻ (资质/Tư Chất, R/SR/SSR)**, không nuôi được (`HeroCombatFormula.lua:21`, `HeroAttribute.lua:104-114`, `BV_RarityF` `ConfigValue.lua:53-63`).
> - **升品 (Thăng Phẩm) thực chất cộng chỉ số nền (`factor1`)** qua `QualityBaseValue` (0→7900) + `QualityFactor` (4→49), nhân với Cấp (`HeroAttributeFormula.lua:35-44, 95-114`). Vẫn là đòn bẩy rất mạnh, nhưng cơ chế là cộng-vào-nền, không phải nhân-toàn-công-thức.
> - **Chuỗi cost Tiềm Năng H001 sai:** draft cũ ghi `IM_QualityUp 45→81→135→…→405`; thực tế H001 tầng 1 là **15→18→21→…→54**, CostGold **9 000→66 000** (`HeroPotentialCost.lua`, `HeroPC_SR_DPS_1_1..10`). Chuỗi 45→405 là của nhóm cost khác.
>
> **Đã sửa — điểm nhỏ:**
> - `援护` = **Viện Trợ** (tm.json), không phải "Yểm Trợ".
> - `觉醒武器` = **Vũ Khí Giác Tỉnh** (tm.json), draft ghi "Thức Tỉnh".
> - Đá 琢磨 = **`IM_RichStone`**, draft ghi sai `IR_RichStone` (không tồn tại; 1535 lượt dùng đều là IM_).
> - Duyên Vũ Khí StarUpCost đuôi là **80×5** (draft ghi 80×4); mảng đủ 30 bậc.
> - Tinh Mạch `StarMax` = **14 hoặc 7**, draft ghi "14–15" (không có 15).
> - `SmallStarUpScore` **thay đổi theo bậc** (ST1=100, ST2=200…), draft ghi cố định "100/lần".
> - `Skill_CostBaseS1` nhóm 3750 là **×10** (draft ghi ×6).
> - BreakCondition tầng 2 Tiềm Năng còn thêm **H003 ≥ Q30** (draft thiếu).
>
> **Đã xác minh KHỚP 100% (giữ nguyên):**
> - Toàn bộ bảng EXP Nâng Cấp (Section 1).
> - Cap Cấp = cấp người chơi (`StrengthenLevelMediator:255/282/414/419`); Cap Kỹ Năng = cấp Võ Sĩ (`StrengthenSkillMediator:593`, `HeroSystem:2742`).
> - `Skill_MaxLv=120`, `Skill_CostFactor`, `BV_SKValue` (A4=8, A3/P1/P2=6, A2=5, A1=4, Soul=0).
> - `HeroQualityRate` toàn bảng (mã Q10–Q70, base/factor).
> - **Bảng cost Thăng Phẩm H001 khớp từng dòng** (Q10 Lv1/5000 … Q56 Lv76/2.5M … Q60 Lv101/0).
> - **`LevelRequest = 51` xuất hiện đúng 47 lần** (đếm chính xác).
> - Bảng Sao H043 (StarUpScore 150/300/500/800/2000/3000, max 7 sao, 5 tiểu tinh); `HeroStarRate` 1→37 (factor 1→20, base 0→800); `HeroStarSkill` LevelMax=5, mở sao 3–7.
> - Tinh Mạch: MaxExp=160, BlessValue=10, IR_SoulCream×300, prob 0.006, bảo hiểm 150; `H001_FSoul_Star8` = SoulStar6×6+SoulStar7×2+IM_F001×400; `IM_FateStone` có thật.
> - Vũ khí: AwakenCost {3,3,3}; `IM_EquipUpxx` có thật.
> - Tiềm Năng: Po_H001 8 tầng; BreakCost tầng 1/2 khớp.
> - **Mọi trích dẫn Translate_1.lua khớp nguyên văn**: thứ tự `升星-升品-升级-装备-技能-星脉`; Vice/Nakoruru/Daimon; "不上阵也生效"; "小额充值送草薙京觉醒武器"; 火队 đổi 觉醒武器 free.
>
> **Chưa chắc / chưa re-verify từ source (giữ nhưng nên soi lại):**
> - Cơ chế "Điểm Kỹ Năng hồi theo thời gian, mua bằng Kim Cương, giới hạn/ngày" (`SkillPointWidget.lua`) — chưa mở file, suy từ mô tả UI.
> - Danh mục 6 loại `IM_ExpUp1..6` / `Hero_ExpItem` cho Nâng Cấp — chưa liệt kê từng id.
> - Ánh xạ `武器缘 (Duyên Vũ Khí) ↔ relationFactor` là suy luận (StarUpCost của Hxxx_E1 nuôi bậc sao vũ khí → `武器缘等级` trong công thức); đúng về mặt logic nhưng không có 1 dòng code duy nhất khẳng định trực tiếp.