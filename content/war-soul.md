# Chiến Hồn (战魂)

Verification complete. All Vietnamese terms confirmed (援护=Yểm Trợ per tm.json, so the draft was right there). I have everything I need. Here is the corrected final wiki.

---

# Chiến Hồn (战魂) — Wiki Hệ Thống

> Nguồn số liệu: trích từ `reference/client-src/`. Mọi con số kèm `file:dòng`. Đây là hệ thống tăng sức mạnh Võ Sĩ qua đường **nhân hệ số Lực Chiến (战力)**.
>
> Lưu ý đường dẫn: `HeroSoulLib.lua`, `HeroSoulSlot.lua`, `ConfigValue.lua`, `Item.lua`, `Translate_2.lua` nằm ở `config/`; còn `HeroSoulItem.lua`, `HeroSoulSlotList.lua`, `HeroCombatFormula.lua`, `HeroAttribute.lua`, `HeroSoulLibConfig.lua`, `HeroSoulSystem.lua` nằm dưới `snk/gameplay/develop/...`.

---

## 1. Chiến Hồn là gì?

**Chiến Hồn (战魂)** là các "linh hồn chiến đấu" gắn vào ô hồn của từng **Võ Sĩ (格斗家)**. Mỗi hồn mang một **Kỹ Năng Chiến Hồn (战魂技能)** và cộng chỉ số/hệ số cho võ sĩ đang lắp. Dữ liệu hồn có `level`, `star` (sao), `MaxUsage`, danh sách võ sĩ đang dùng, đọc từ bảng `HeroSoulLib`.

Có **1110 hồn** trong `HeroSoulLib.lua`, chia theo `Type`:

| Type (Trung) | Việt | Số lượng |
|---|---|---|
| PASSIVE | Bị Động | 375 |
| COMMAND | Mệnh Lệnh | 211 |
| ANGER | Nộ Khí (怒气) | 180 |
| TALENT | Thiên Phú (天赋) | 93 |
| HALO | Hào Quang (光环) | 90 |
| ATTR | Thuộc Tính | 83 |
| GLOBAL | Toàn Cục | 78 |

Tổng: 375+211+180+93+90+83+78 = **1110** (nguồn: đếm `Type = "..."` trong `HeroSoulLib.lua`). Enum 8 loại (kể cả **FATE/命运**): `HeroSoulLibConfig.lua:4-13`. Hồn **FATE (Vận Mệnh)** của ô 8 nằm ở bảng riêng `HeroSoulFate.lua`.

---

## 2. 8 Ô Hồn của mỗi Võ Sĩ (`HeroSoulSlot.lua`)

Mỗi võ sĩ có **đúng 8 ô** (`Hxxx_SoulSlot1..8`, không liên tiếp trong file). Ví dụ chuẩn của võ sĩ H001:

| Ô | Loại hồn nhận | Quality | Hồn cố định (FixedSoul) | Mở khoá | Nguồn |
|---|---|---|---|---|---|
| **Slot1** | Nộ Khí (ANGER) | 32 | `H001_Soul_Rp` | Mở sẵn | `HeroSoulSlot.lua:4-17`; type ANGER: `HeroSoulLib.lua:3701` |
| **Slot2** | GLOBAL/ATTR/COMMAND/PASSIVE | 32 | (trống) | Mở sẵn | `:18-34` |
| **Slot3** | GLOBAL/ATTR/COMMAND/PASSIVE | 40 | (trống) | Cần **Thức Tỉnh** | `:35-71` |
| **Slot4** | Hào Quang (HALO) | 50 | `H001_Soul_Passive` | Mở sẵn | `:72-85`; type HALO: `HeroSoulLib.lua:9` |
| **Slot5** | Thiên Phú (TALENT) | 42 | `H001_Soul_Talent` | Mở sẵn | `:5762-5775`; type TALENT: `HeroSoulLib.lua:54742` |
| **Slot6** | GLOBAL/ATTR/COMMAND/PASSIVE | 52 | (trống) | Cần Thức Tỉnh | `:6742-6778` |
| **Slot7** | GLOBAL/ATTR/COMMAND/PASSIVE | 62 | (trống) | Cần Thức Tỉnh (yêu cầu cấp cao) | `:6779-6819` |
| **Slot8** | **FATE (Vận Mệnh)**, Star=7 | 52 | `H001_Soul_Fate` | Thức Tỉnh + có **Đúc Lại** | `:12250-12285` |

- **Ô tự do (2, 3, 6, 7):** nhận 1 trong 4 loại `GLOBAL / ATTR / COMMAND / PASSIVE` — nơi lắp hồn "thường" (dòng I-series) bạn kiếm và nuôi.
- **Ô cố định (1, 4, 5, 8):** đã gắn sẵn hồn riêng của võ sĩ (Nộ Khí / Hào Quang / Thiên Phú / Vận Mệnh); bạn chỉ nâng cấp, không thay.

> **Lưu ý nguồn:** trường `Type` trong `HeroSoulSlot` của các ô cố định (1, 4, 5) ghi cứng là `{"TALENT"}` (dữ liệu thừa) — loại hồn THẬT lấy theo `Type` của `FixedSoul` (Slot1 Rp = ANGER, Slot4 Passive = HALO, Slot5 Talent = TALENT). Bảng trên dùng loại THẬT.

---

## 3. Cơ chế cộng Lực Chiến (战力) — ĐÒN BẨY chính

Công thức Lực Chiến THẬT (mã tính tại `HeroCombatFormula.lua:7-39`, dòng gộp `:28`):

```
LựcChiến = f1 × f2 × f3 × f4 × f5 × f6  +  f7 + f8 + f9 + f10 + f11

f1 = Công + Thủ + HP×0.08
f2 = ST/giảm ST/hút/phản/chân sát...          (BV_FixedFA + ...)
f3 = bạo/chuẩn/chặn/hiệu ứng...               (BV_FixedFB + ...)
f4 = BV_FixedFC + Sao×BV_HeroStarF + duyên vũ khí + [%HỒN không-toàn-cục]
     + tiềm năng + ...                        ← soulRateFactor Ở ĐÂY (:20)
f5 = hệ số tư chất (BV_RarityF)
f6 = BV_AdjustF
f7,f8 = tổng thuộc tính × BV_AttrValueA/B
f9 = skillFactor    f10 = soulFactor (HỒN phẳng, :26)    f11 = vòng may mắn
```

Chiến Hồn nạp vào Lực Chiến qua **hai kênh** (gộp tại `HeroSoulSlotList.lua:121-193`, tiêu thụ tại `HeroAttribute.lua:117-118`):

- **`soulRateFactor` (%) → nằm trong `f4`.** Vì `f4` nhân với `f1×f2×f3`, mỗi 1% cộng vào đây **nhân lên toàn bộ** Công/Thủ/HP. Đây là đòn bẩy chính.
- **`soulFactor` (phẳng) → `f10`**, cộng thẳng ở cuối. Chỉ **ANGER** và **HALO** cho giá trị phẳng khác 0.

> **⚠️ Đính chính (draft cũ sai):** Dòng `战魂135总等级 × BV_SKValue` CHỈ xuất hiện trong **chuỗi mô tả** `heroCombatDesc` (`HeroCombatFormula.lua:5`), **KHÔNG có** trong công thức tính THẬT (`:7-39`). Hơn nữa `BV_SKValue` cho `SK_Soul1 = SK_Soul3 = SK_Soul5 = 0` (`ConfigValue.lua:97,101,102`) → kênh "tổng cấp ô 1/3/5" **bằng 0**. Ô 1/3/5 đóng góp Lực Chiến qua LOẠI hồn (ANGER phẳng, hồn thường %, TALENT %), **không** qua tổng-cấp.

### Bảng hệ số theo loại hồn (`ConfigValue.lua`)

Mỗi ô là `{gốc, mỗi_cấp}`; hệ số = `gốc + mỗi_cấp × level` (level là `_level`, 0-based; `HeroSoulSlotList.lua:144,159,164`).

| Loại hồn | Kênh phẳng (soulFactor → f10) | Kênh % (soulRateFactor → f4) | Nguồn |
|---|---|---|---|
| **ANGER (Nộ, ô1)** | `BV_SoulRp = {40, 8}` | — | `:155-161` / code `:141-144` |
| **HALO (Hào Quang, ô4)** | `BV_SoulPassive = {80, 16}` | — | `:163-169` / `:145-149` |
| **COMMAND/ATTR/PASSIVE (ô tự do)** | `BV_SoulCommon` = **toàn `{0,0}`** | `BV_SoulCommonRate` (theo Sao) | `:171-216`, `:263-308` / `:156,161` |
| **GLOBAL (Toàn Cục)** | `BV_SoulCommon_Global` = **toàn `{0,0}`** → `combatGlobalFactor`, cộng ở `CombatSystem.lua:96` | **KHÔNG có** (xem đính chính) | `:217-262` / `:151-154` |
| **TALENT (Thiên Phú, ô5)** | `BV_SoulTalent` (theo tư chất võ sĩ) | `BV_SoulTalentRate` (theo tư chất) | `:355-384`, `:385-414` / `:166-175` |
| **FATE (Vận Mệnh, ô8)** | `BV_SoulFate` = **toàn `{0,0}`** | `BV_SoulFateRate` (theo Sao) | `:619-684`, `:685-748` / `:176-185` |

> **⚠️ Đính chính (GLOBAL):** `BV_SoulCommon_GlobalRate` (`:309-354`) **tồn tại trong config nhưng KHÔNG được mã nào đọc**. Ở `HeroSoulSlotList.lua:150-154`, hồn GLOBAL chỉ đọc `BV_SoulCommon_Global` (toàn `{0,0}`) vào `combatGlobalFactor`. Vậy hồn GLOBAL **cộng 0** vào con số Lực Chiến — giá trị của nó là **Kỹ Năng toàn đội**, không phải hệ số.
>
> **⚠️ Đính chính (_Old):** Các bảng `BV_Soul*_Old` (`:439-618`) **không được đọc ở đâu cả**. Cờ `isOldServer` (`HeroAttribute.lua:105-108`) chỉ đổi **`BV_RarityF` → `BV_RarityF_Old`** (hệ số tư chất, f5), KHÔNG động tới hồn.

### Hệ số % theo Sao — hồn thường `BV_SoulCommonRate` (`:263-308`)

Tra theo **`star` trực tiếp** (`HeroSoulSlotList.lua:161`, index = `getStar()`). Hồn thường có Sao 4–7:

| Sao | `{gốc, mỗi_cấp}` | % tại level 20 (max) = gốc + mỗi_cấp×20 |
|---|---|---|
| 4★ | `{0.006, 0.0007}` | 0.6% + 1.4% = **2.0%** |
| 5★ | `{0.012, 0.0014}` | 1.2% + 2.8% = **4.0%** |
| 6★ | `{0.018, 0.0021}` | 1.8% + 4.2% = **6.0%** |
| 7★ | `{0.021, 0.0024}` | 2.1% + 4.8% = **6.9%** |

Vì % này nằm trong `f4` (nhân), **lên 1 sao hồn + max cấp** nhân thêm vài % lên TOÀN BỘ Công/Thủ/HP → nuôi hồn đội Lực Chiến hiệu quả hơn nhiều so với cộng chỉ số phẳng.

### Hồn Vận Mệnh (FATE, ô8) — đòn bẩy % mạnh nhất

`BV_SoulFateRate` (`:685-748`) tra theo **`star + 1`** (`HeroSoulSlotList.lua:183`); `mỗi_cấp = 0` nên **chỉ phụ thuộc Sao**:

| Sao FATE | Index | % nhân (vào f4) |
|---|---|---|
| 0★ | 1 | 5% |
| 3★ | 4 | 14% |
| 6★ | 7 | 30% |
| 7★ (mặc định ô8) | 8 | **40%** |
| 13★ trở lên | 14–15 | **100%** |

Hồn Vận Mệnh sao cao (13★+) = **+100% nhân** lên toàn bộ chỉ số — mạnh nhất trong mọi loại hồn.

---

## 4. Nâng cấp & Mở khoá

### 4.1. Nâng cấp Level (bằng 魂晶 — Hồn Tinh)

- Hồn thường `LevelMax = 20` (`HeroSoulItem.lua:176-184`; ví dụ `HeroSoulLib.lua:26706`). `_level` chạy 0→20 (20 bậc); phí bậc kế = `amount[_level+1]` (`HeroSoulItem.lua:134-150`).
- Nguyên liệu: **`IM_SoulCrystal` (魂晶 — Hồn Tinh)** (`Item.lua:57697`, CN_Name `魂晶`).
- Ví dụ hồn 5★ `I001_Soul_Common_Star5` (`HeroSoulLib.lua:26738-26764`): mỗi bậc cần `20, 40, 80, 120, 160, 200, 240, 280, 320, 360, 400, 440, 480, 520, 560, 600, 700, 800, 900, 1000` → **tổng 8.220 Hồn Tinh** để max (không phải ~7.640).
- Hồn 6★ `I171` (`:36157-36183`): `35, 75, 150 … 1800` → tổng **15.360** (đắt hơn rõ rệt).
- Hồn cố định rẻ hơn, ví dụ `H001_Soul_Passive` (`:17-42`): `4, 6, 8, 10 … 500`.

### 4.2. Thức Tỉnh ô (觉醒 — mở Slot 3/6/7 và ô8)

Chi phí `AwakenCost`, kèm 2 phương án thay thế `AwakenCost2` / `AwakenCost3` (request `HeroSoulSystem.lua:1312-1331`). Ví dụ H001:

| Ô | Chi phí mở (AwakenCost) | Phương án 2 | Phương án 3 | Nguồn |
|---|---|---|---|---|
| Slot3 | `IM_RichStone` (Đá Thức Tỉnh) ×2 | `IM_F001` (mảnh) ×10 | `IR_Diamond` ×5.000 | `:47-70` |
| Slot6 | Đá Thức Tỉnh ×4 | mảnh ×20 | Kim Cương ×40.000 | `:6754-6777` |
| Slot7 | mảnh ×8 + Đá Thức Tỉnh ×3 | mảnh ×30 | Kim Cương ×80.000 | `:6791-6818` |
| Slot8 (FATE) | 1 hồn 4★ (SoulStar) + `IM_F001` ×200 + `IM_FateStone` (命运之源) ×1 | — | — | `:12263-12281` |

Nguyên liệu: **`IM_RichStone` = 觉醒石 (Đá Thức Tỉnh)** (`Item.lua:57485`); **`IM_FateStone` = 命运之源 (Nguồn Vận Mệnh)** (`Item.lua:57778`). Phương án 2/3 của Slot7 yêu cầu cấp võ sĩ (AwakenCost2Level=40, AwakenCost3Level=50).

### 4.3. Thăng Sao (升星) — qua Thần Điện

Hồn thường **không lên sao trực tiếp**. Muốn hồn sao cao hơn, bạn **ghép** ở Thần Điện Chiến Hồn (5★→6★→7★, xem mục 5).

---

## 5. Thần Điện Chiến Hồn (战魂神殿)

Nơi **ghép/tổng hợp** hồn sao cao. Hồn cấp 6 gọi là **圣魂 (Thánh Hồn)**. Các hồn Thần Điện có `IfHidden = 3` (chỉ hiện trong Thần Điện — `HeroSoulLibConfig.lua:99-100`).

Quy tắc (dịch chuẩn từ `tm.json`):

> **1.** "Tiêu hao nguyên liệu thỏa điều kiện, là có thể nhận Chiến Hồn 5 sao/6 sao siêu mạnh! Giúp lực chiến của bạn tăng vọt!"
> **2.** "Mỗi Chiến Hồn trong Thần Điện đều cực kỳ mạnh mẽ, nên **chỉ có thể sở hữu một cái**!"
> **4.** "Chiến Hồn đã nâng cấp khi dùng làm nguyên liệu ghép, **sẽ hoàn trả Hồn Tinh đã tiêu hao khi nâng cấp**." (an tâm ném hồn đã lên cấp vào ghép)

### Công thức ghép (ví dụ 6★ `I171_Soul_Common_Star6`, `HeroSoulLib.lua:36078-36183`)

Cần đủ 4 khe `Item1..Item4` (kiểm tra `HeroSoulSystem.lua:289-320, 369-444`):

| Khe | Loại | Yêu cầu |
|---|---|---|
| `Item1` | Multiple (num=2) | 2 đơn vị của { hồn `I002` 5★ **hoặc** Chứng `I002_Star5_SoulProve` } |
| `Item2` | Multiple (num=2) | (giống Item1) |
| `Item3` | SoulStar (num=2, Star=5) | 2 hồn bất kỳ Sao 5 |
| `Item4` | Item | `IR_SoulCore` (战魂核心 — Lõi Chiến Hồn) ×1 |
| `Currency` | | `IR_Diamond` ×5.000 |

Ghép xong ra 6★, và 6★ này **ghép tiếp** lên 7★ (`Composable = {"I217_Soul_Common_Star7"}`, `:36145-36147`). Hồn 5★ cũng có `Composable` trỏ lên 6★ (`I002` `:26793-26795`).

### Chứng Chiến Hồn (战魂凭证 / SoulProve) — "giữ hồn mà vẫn ghép"

> **Rule 3 (`tm.json`):** "Khi bạn cần một Chiến Hồn nào đó để ghép, nhưng lại muốn **giữ** Chiến Hồn này, có thể dùng **'Chứng Chiến Hồn'** của nó để thay thế làm nguyên liệu; Chứng Chiến Hồn sẽ **tự động nhận khi bạn nhận trùng Chiến Hồn 4, 5 sao**."

- Cơ chế: nhận **hồn trùng** 4★/5★ → tự có `..._SoulProve` (ví dụ `I001_Star5_SoulProve`, `Item.lua:50571-50592`, `SubType = HEROSOUL_N`, `SoulStar = 5`, CN_Name `霸极天威战魂凭证`).
- Trong công thức ghép, khe `list` chấp nhận **`type="soul"` (chính hồn)** HOẶC **`type="item"` (Chứng)** — code dựng danh sách tại `HeroSoulSystem.lua:289-320` (thêm cả soul lẫn `Transform` nếu là loại `HEROSOUL_N`). Nhờ đó nạp Chứng làm liệu mà **không mất** hồn gốc đang lắp.
- `Transform` trong config hồn = phần thưởng khi phân rã, luôn cho 1 Chứng tương ứng (ví dụ `HeroSoulLib.lua:36127-36130` → `I171_Star6_SoulProve` ×1).

---

## 6. Phân Rã (分解) → Tinh Hoa Chiến Hồn (战魂精华)

**`IR_SoulCream` = 战魂精华 (Tinh Hoa Chiến Hồn)** (`Item.lua:50480-50503`, `SubType = SOULCREAM`) — nguyên liệu nâng cấp hồn Thần Điện / đổi ở kho. **Khác hoàn toàn** với 魂晶 (Hồn Tinh) dùng lên Level.

Hai đường nhận:

> **Rule 5 (`tm.json`):** "Tinh Hoa Chiến Hồn có thể tự động nhận khi **phân rã Chứng Chiến Hồn** và khi **nhận trùng Chiến Hồn 1-3 sao**."

Phân rã Chứng (màn `BagHeroSoulResolveMediator.lua`): vật phẩm loại `HEROSOUL_N` (Chứng) được phân rã thành Tinh Hoa, số lượng = bảng **`HeroSoulStarResolve`** × số cái.

### Tỉ giá phân rã — Tinh Hoa nhận / mỗi Chứng theo Sao (`ConfigValue.lua:5375-5387`)

| Sao Chứng | Tinh Hoa nhận |
|---|---|
| 1★ | 15 |
| 2★ | 40 |
| 3★ | 150 |
| 4★ | 500 |
| 5★ | 2000 |
| 6★ | 5000 |
| 7★ | 8000 |

→ Phân rã 1 Chứng 5★ = **2.000 Tinh Hoa**.

---

## 7. Nguồn kiếm nguyên liệu (`Resource` → `Translate_2.lua`)

| Nguồn (`Soul_Source_*`) | Trung → Việt | Đi tới | Nguồn |
|---|---|---|---|
| `DRAWEQUIP` | 扭蛋机 → **Máy Gắp Thú** (gacha vật liệu, **KHÁC** gacha quay tướng) | `RecruitEquipView` | `Translate_2.lua:39144` |
| `MYTH` | 封神之路 → **Con Đường Phong Thần** (tiêu ở Cửa Hàng Phong Thần) | `mythMapView` | `:39148` |
| `TEMPLE` | 战魂神殿 → **Thần Điện Chiến Hồn** (ghép) | `HeroSoulBagView&tabType=3` | `:39276` |
| `Hero` | 格斗家碎片合成 → **Ghép từ mảnh Võ Sĩ** | | `:39160` |
| `ACTIVITY` | 限时活动 → **Sự kiện giới hạn** | | `:39152` |
| `Train` | 连击教学 → **Dạy Liên Kích** | | `:40208` |
| `VIP` | 至尊礼包 → **Gói Chí Tôn** | | `:44332` |
| `None` | 敬请期待 → **Sắp ra mắt** (chưa mở nguồn) | | `:39156` |

Phân bố `Resource` trong `HeroSoulLib` (trên các hồn có gắn nguồn): `Hero` **181**, `TEMPLE` **129**, `None` **95**, `ACTIVITY` **89**, `DRAWEQUIP` **20**, `MYTH` **14**, `Train` **6**, `VIP` **1**. (Ngoài ra 584 hồn để `Resource = {}` — phần lớn là hồn cố định H-series.)

Nguyên liệu học hồn: mở/học 1 hồn cần `LearnCostItem` = mảnh hồn `IM_FItemSoul_x` (ví dụ `IM_FItemSoul_1`), thường ×60 (`HeroSoulLib.lua:26721-26726`) — mảnh lấy từ Máy Gắp Thú / Phong Thần.

---

## 8. Mẹo tối ưu (dựa trên số thật)

1. **Ưu tiên hồn Vận Mệnh ô8 (FATE) và thăng sao nó.** `BV_SoulFateRate` cho tới **+100% nhân** — không loại nào bằng (`ConfigValue.lua:685-748`). Đòn bẩy Lực Chiến FREE tốt nhất khi kẹt cap.
2. **Nuôi hồn ô tự do lên sao cao rồi mới max cấp.** % nằm trong `f4` (nhân): 7★ max = 6.9% so với 4★ max chỉ 2.0% — chênh hơn 3 lần trên toàn bộ chỉ số (`:263-308`).
3. **Dùng Chứng (Chứng Chiến Hồn), đừng ném hồn gốc vào ghép.** Hồn trùng 4/5★ tự thành Chứng; Chứng thay được hồn trong công thức Thần Điện (`HeroSoulSystem.lua:289-320`), giữ hồn gốc vẫn lắp trên võ sĩ.
4. **Yên tâm ném hồn đã lên cấp làm liệu** — Thần Điện **hoàn trả toàn bộ Hồn Tinh** đã tốn (Rule 4). Không lỗ Hồn Tinh.
5. **Giữ hồn trùng 1–3★ để tự đổi Tinh Hoa**; Chứng 5★ chỉ phân rã khi thật cần (2.000 Tinh Hoa/cái) — vì còn dùng thay hồn trong ghép 6★.
6. **Thức Tỉnh bằng Đá Thức Tỉnh/mảnh trước, chừa Kim Cương.** Phương án Kim Cương (`AwakenCost3`) rất đắt (Slot7 = 80.000 Kim Cương) — chỉ dùng khi gấp (`HeroSoulSlot.lua:6801-6806`).
7. **Hồn GLOBAL nuôi vì Kỹ Năng toàn đội, không vì con số.** Hồn GLOBAL cộng **0** vào Lực Chiến hiển thị (`BV_SoulCommon_Global` toàn `{0,0}`); giá trị của nó là hiệu ứng buff cả đội. Đừng kỳ vọng nó đội Lực Chiến như hồn %.

---

## 9. Mini-Glossary Trung → Việt (chuẩn `tm.json`)

| Trung | Việt | Ghi chú |
|---|---|---|
| 战魂 | Chiến Hồn | Hệ thống chính |
| 战魂神殿 | Thần Điện Chiến Hồn | Nơi ghép hồn sao cao |
| 圣魂 | Thánh Hồn | Hồn 6★ |
| 战魂凭证 | Chứng Chiến Hồn (SoulProve) | Thay hồn làm liệu; từ hồn trùng 4/5★ |
| 战魂精华 | Tinh Hoa Chiến Hồn (`IR_SoulCream`) | Nguyên liệu; từ phân rã Chứng / trùng 1-3★ |
| 魂晶 | Hồn Tinh (`IM_SoulCrystal`) | Nâng Level hồn (KHÁC Tinh Hoa) |
| 战魂核心 | Lõi Chiến Hồn (`IR_SoulCore`) | Liệu ghép 6★ |
| 觉醒石 | Đá Thức Tỉnh (`IM_RichStone`) | Mở/Thức Tỉnh ô |
| 命运之源 | Nguồn Vận Mệnh (`IM_FateStone`) | Mở ô8 FATE |
| 分解 | Phân Rã | Chứng → Tinh Hoa |
| 融合 | Dung Hợp | Ghép hồn |
| 重铸 | Đúc Lại (Recast) | Đổi thuộc tính ô8 FATE (`RecastAttr`) |
| 觉醒 | Thức Tỉnh | Mở ô hồn |
| 升星 | Thăng Sao | Lên sao (qua Thần Điện) |
| 战力 | Lực Chiến | Chỉ số sức mạnh |
| 格斗家 | Võ Sĩ | Nhân vật |
| 神器 | Thần Khí | Vũ khí (hệ khác) |
| 援护 | Yểm Trợ | Hiệu ứng hồn |
| 天赋 | Thiên Phú (TALENT) | Hồn ô5 |
| 怒气 | Nộ Khí (ANGER) | Hồn ô1 |
| 光环 | Hào Quang (HALO) | Hồn ô4 |
| 命运 | Vận Mệnh (FATE) | Hồn ô8 |
| 扭蛋机 | Máy Gắp Thú | Gacha vật liệu (khác quay tướng) |
| 封神之路 | Con Đường Phong Thần | Nguồn nguyên liệu |

---

## 10. Bản đồ file nguồn

- **Cấu hình hồn:** `config/HeroSoulLib.lua` (1110 hồn), `config/HeroSoulFate.lua` (FATE)
- **Cấu hình 8 ô:** `config/HeroSoulSlot.lua`
- **Hệ số Lực Chiến:** `config/ConfigValue.lua` (BV_Soul*, HeroSoulStarResolve); `snk/.../hero/HeroCombatFormula.lua`, `HeroAttribute.lua`
- **Logic gộp hồn → Lực Chiến:** `snk/.../hero/HeroSoulSlotList.lua`; cộng global tại `snk/.../controller/CombatSystem.lua:96`
- **Model:** `snk/.../hero/HeroSoulSlot.lua`, `snk/.../soulBag/HeroSoulItem.lua`, `HeroSoulBag.lua`, `HeroSoulLibConfig.lua`
- **Controller (nâng/ghép/phân rã/thức tỉnh):** `snk/.../controller/HeroSoulSystem.lua`
- **Màn phân rã:** `snk/.../view/bag/BagHeroSoulResolveMediator.lua`
- **Vật phẩm:** `config/Item.lua`; **Nguồn/tên:** `config/Translate_2.lua`; **Bản dịch Việt:** `data/i18n/tm.json`

---

> ## Độ tin cậy
>
> **Đã KIỂM CHỨNG khớp source (giữ nguyên):**
> - Phân bố Type 375/211/180/93/90/83/78 = 1110 (đếm trong `HeroSoulLib.lua`).
> - 8 ô của H001: Quality 32/32/40/50/42/52/62/52; FixedSoul Rp/–/–/Passive/Talent/–/–/Fate; Star ô8 = 7 (`HeroSoulSlot.lua`).
> - `BV_SoulRp={40,8}`, `BV_SoulPassive={80,16}`; `BV_SoulCommon`/`_Global`/`Fate` toàn `{0,0}`.
> - `BV_SoulCommonRate` 4★→7★ = {0.006,0.0007}…{0.021,0.0024}; % max = 2.0/4.0/6.0/6.9% (index = `star`, code `:161`).
> - `BV_SoulFateRate`: 0★=5%, 7★=40%, 13★+=100% (index = `star+1`, code `:183`).
> - `HeroSoulStarResolve` 1★=15 … 7★=8000; công thức ghép I171 (Item1..4 + Currency 5000 Kim Cương); tên vật phẩm & tên Việt trong `tm.json`; phân bố `Resource` (181/129/95/89/20/14/6/1); 3 quy tắc Thần Điện + cơ chế Chứng/Tinh Hoa.
> - `soulRateFactor` nằm trong f4, `soulFactor` là f10 (`HeroCombatFormula.lua:20,26,28`).
>
> **ĐÃ SỬA (draft cũ SAI/bịa):**
> 1. **Tổng Hồn Tinh max hồn 5★ = 8.220** (không phải ~7.640). Là tổng đúng của 20 giá trị `amount` (`HeroSoulLib.lua:26738-26764`).
> 2. **`战魂135总等级 × BV_SKValue` KHÔNG phải cơ chế thật:** chỉ nằm trong chuỗi mô tả (`HeroCombatFormula.lua:5`), không có trong mã tính; và `SK_Soul1/3/5 = 0` (`ConfigValue.lua:97,101,102`). Đã bỏ khỏi công thức "thật" và bỏ mẹo "nâng đều ô 1/3/5 để cộng tổng-cấp".
> 3. **Kênh % của GLOBAL không tồn tại trong code:** `BV_SoulCommon_GlobalRate` không được đọc ở đâu; GLOBAL chỉ cộng `combatGlobalFactor` (toàn `{0,0}`) → 0. Giá trị GLOBAL là Kỹ Năng toàn đội. Đã sửa bảng + thêm mẹo #7.
> 4. **Các bảng `BV_Soul*_Old` KHÔNG dùng:** `isOldServer` chỉ đổi `BV_RarityF` (tư chất), không đổi hồn. Đã sửa ghi chú.
> 5. **Trường `Type` của ô cố định ghi cứng `{"TALENT"}`** (dữ liệu thừa) — loại thật lấy theo `FixedSoul`. Đã thêm lưu ý.
> 6. **`Soul_Source_None` = 敬请期待 = "Sắp ra mắt"** (không chỉ là "chờ"); thêm dòng None vào bảng nguồn + ghi chú 584 hồn `Resource={}`.
> 7. Sửa công thức pseudo-code sang dạng THẬT (`f1×…×f6 + f7…f11`); đổi "之证" → **战魂凭证** (đúng CN_Name vật phẩm); thống nhất "Tinh Hoa Chiến Hồn" (`IR_SoulCream`) tách khỏi "Hồn Tinh" (`IM_SoulCrystal`).
>
> **CHƯA CHẮC 100% (cần bắt in-game xác nhận):**
> - Quy ước hiển thị level trên UI: mã dùng `_level` 0-based, `getAttrLevel = _level+1`; "level 20" trong bảng % là `_level=20` (bậc cuối). Con số nguyên liệu tổng (8.220) đúng theo mã, nhưng nhãn "Lv" hiện trên màn có thể lệch 1 so với `_level`.
> - Cap sao tối đa của hồn FATE (bảng rate tới index 15 = star 14, đều 100% từ index 14): giới hạn thực do `HeroSoulFateStar.lua` quyết định — chưa soi file này.
> - `重铸` = "Đúc Lại" là suy diễn Hán-Việt (không có trong `tm.json` đã kiểm); các thuật ngữ còn lại đều lấy trực tiếp từ `tm.json`.