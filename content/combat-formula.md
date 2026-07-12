# Công thức Lực Chiến (战力)

Đã đọc và đối chiếu toàn bộ source. Dưới đây là **bản cuối đã sửa**.

---

# ⚔️ Công Thức Lực Chiến (战力 · Zhànlì)

> Trang wiki giải thích **chính xác** cách game KOF98 tính chỉ số **Lực Chiến** của mỗi Võ Sĩ (格斗家) và của cả tài khoản. Mọi con số đều trích từ source Lua gốc (`file:dòng`). Không có số bịa.

**Nguồn chính:**
- Công thức Võ Sĩ: `reference/client-src/snk/gameplay/develop/model/hero/HeroCombatFormula.lua`
- Hằng số `BV_*`: `reference/client-src/config/ConfigValue.lua`
- Gom dữ liệu factor: `.../model/hero/HeroAttribute.lua`, `.../model/hero/HeroSoulSlotList.lua`
- Cộng dồn cấp tài khoản: `.../controller/CombatSystem.lua`

---

## 1. Lực Chiến là gì?

Lực Chiến (战力 / 战斗力, bản Việt hoá dịch cả hai là **Lực Chiến** — `tm.json`) là một con số duy nhất tóm tắt "độ mạnh" tổng hợp của một Võ Sĩ: gộp chỉ số cơ bản (Công/Thủ/HP), các tỉ lệ chiến đấu (bạo kích, chí mạng, hiệu ứng...), sao, phẩm chất, Chiến Hồn (战魂), kỹ năng... thành một điểm số để so sánh và xếp hạng.

Điểm cốt lõi phải nắm ngay: **công thức là một PHÉP NHÂN 6 khối rồi CỘNG thêm 5 khối phụ.** Khối nhân quyết định phần lớn Lực Chiến; khối cộng chỉ "bù thêm". Hiểu chỗ này là hiểu được đòn bẩy (xem §7).

---

## 2. Công thức tổng quát

Nguyên văn mô tả trong game (`HeroCombatFormula.lua:5`, chuỗi `heroCombatDesc`), viết lại gọn:

```
LựcChiến =
   ( Công + Thủ + HP×0.08 )                          ← factor1  (chỉ số nền)
 × ( 3  + Σ tỉ-lệ-sát-thương )                        ← factor2
 × ( 12 + Σ tỉ-lệ-bạo/chí-mạng/hiệu-ứng )             ← factor3
 × ( 1  + Sao×0.01 + DuyênVũKhí×0.01
        + %ChiếnHồn-rate + %TiềmNăng + %BộcPhát
        + %BánhXeVậnMệnh )                            ← factor4
 × HệSố-PhẩmChất (1.0 → 1.2)                           ← factor5
 × 0.012                                               ← factor6 (chuẩn hoá)
 + ( Σ attr sát-thương ) × 800                         ← factor7
 + ( Σ attr bạo/khống-chế ) × 400                      ← factor8
 + LựcKỹNăng                                           ← factor9 (skillFactor)
 + LựcChiếnHồn (cộng)                                  ← factor10 (soulFactor)
 + LựcBánhXeVậnMệnh (cộng)                             ← factor11 (fortuneWheelFactor)
```

Code thật (`HeroCombatFormula.lua:28`):

```lua
local combat = factor1 * factor2 * factor3 * factor4 * factor5 * factor6
             + factor7 + factor8 + factor9 + factor10 + factor11
```

**Ghi nhớ:** factor1…factor6 **nhân** với nhau → đây là "cỗ máy" chính. factor7…factor11 chỉ **cộng** vào sau.

---

## 3. Bóc từng factor: nó là gì, đến từ đâu, số thật

### factor1 — Chỉ số nền (`HeroCombatFormula.lua:17`)

```
factor1 = Công(ATK) + Thủ(DEF) + HP × 0.08
```

Trọng số lấy từ `BV_AttrF` (`ConfigValue.lua:4–27`), nhân qua hàm `_getAttrFactorByType` (`HeroCombatFormula.lua:41–46`):

| Chỉ số | Trọng số | Nguồn |
|---|---|---|
| Công (ATK) | 1 | `ConfigValue.lua:12` |
| Thủ (DEF) | 1 | `ConfigValue.lua:14` |
| HP (生命) | **0.08** | `ConfigValue.lua:9` |

→ 1 điểm Công = 1 đơn vị nền, nhưng **1 điểm HP chỉ = 0.08**. Muốn cày nền hiệu quả, ưu tiên Công/Thủ hơn HP thuần.

### factor2 — Khối tỉ lệ sát thương (`HeroCombatFormula.lua:18`)

```
factor2 = BV_FixedFA(=3) + Σ(attr × trọng số BV_AttrF)
```
- Hằng nền **`BV_FixedFA = 3`** — `ConfigValue.lua:31`.

| Attr (Trung) | Việt | Trọng số | Nguồn |
|---|---|---|---|
| 伤害率 HurtRate | Tỉ lệ sát thương | 1 | `ConfigValue.lua:16` |
| 免伤率 UnhurtRate | Tỉ lệ miễn thương | 1 | `ConfigValue.lua:10` |
| 反弹率 Reflection | Tỉ lệ phản đòn | 0.6 | `ConfigValue.lua:22` |
| 吸血率 Absorption | Tỉ lệ hút máu | 0.6 | `ConfigValue.lua:23` |
| 真实伤害 RealHurt | Sát thương thật | 1 | `ConfigValue.lua:11` |
| 真伤抵抗 UnRealHurt | Kháng ST thật | 1 | `ConfigValue.lua:15` |

### factor3 — Khối bạo kích / chí mạng / hiệu ứng (`HeroCombatFormula.lua:19`)

```
factor3 = BV_FixedFB(=12) + Σ(attr × trọng số BV_AttrF)
```
- Hằng nền **`BV_FixedFB = 12`** — `ConfigValue.lua:36`.

| Attr (Trung) | Việt | Trọng số | Nguồn |
|---|---|---|---|
| 暴击率 CritRate | Tỉ lệ bạo kích | 1 | `ConfigValue.lua:25` |
| 抗暴率 UncritRate | Kháng bạo kích | 0.7 | `ConfigValue.lua:18` |
| 暴击强度 CritStrg | Cường độ bạo kích | 0.4 | `ConfigValue.lua:24` |
| 格挡率 BlockRate | Tỉ lệ đỡ đòn | 1 | `ConfigValue.lua:17` |
| 破击率 UnblockRate | Tỉ lệ phá đỡ | 0.7 | `ConfigValue.lua:20` |
| 格挡强度 BlockStrg | Cường độ đỡ | 0.4 | `ConfigValue.lua:13` |
| 效果强度 EffectStrg | Cường độ hiệu ứng | 0.4 | `ConfigValue.lua:19` |
| 效果抵抗率 UneffectRate | Kháng hiệu ứng | 0.7 | `ConfigValue.lua:21` |
| 效果命中率 EffectRate | Tỉ lệ trúng hiệu ứng | 1 | `ConfigValue.lua:8` |

### factor4 — Khối "cộng dồn phần trăm" trong phép nhân (`HeroCombatFormula.lua:20`)

```
factor4 = BV_FixedFC(=1)
        + Sao(星级) × BV_HeroStarF
        + DuyênVũKhí(武器缘) × BV_EquipStarF     ← extraData.relationFactor
        + soulRateFactor   (%Chiến Hồn dạng rate)
        + potentialFactor  (%Tiềm Năng 潜能)
        + burstFactor      (%Bộc Phát)
        + fortuneWheelRateFactor (%Bánh Xe Vận Mệnh)
```

| Hằng | Giá trị | Ý nghĩa | Nguồn |
|---|---|---|---|
| `BV_FixedFC` | **1** | Nền của khối | `ConfigValue.lua:41` |
| `BV_HeroStarF` | **0.01** | Mỗi Sao (星级) +0.01 = +1% | `ConfigValue.lua:46` |
| `BV_EquipStarF` | **0.01** | Mỗi cấp Duyên Vũ Khí (武器缘) +0.01 | `ConfigValue.lua:51` |

Đây là khối "cộng bên trong phép nhân": mỗi +0.01 = **+1% trên toàn bộ tích số**. Các nguồn rate của Chiến Hồn (`soulRateFactor`) rót thẳng vào đây và **cộng dồn giữa nhiều loại Hồn** (Hồn thường + Thiên Phú + Vận Mệnh — xem §4). Gom tại `HeroAttribute.lua:117–133`.

### factor5 — Hệ số Phẩm Chất / Tư Chất (`HeroCombatFormula.lua:21`)

`factor5 = rarityFactor` — lấy từ **`BV_RarityF`** theo mã phẩm chất của Võ Sĩ (`hero:getRareity()`).

| Mã | Bậc thẻ | `BV_RarityF` | `BV_RarityF_Old` (server cũ) |
|---|---|---|---|
| 11 | R | **1.00** | 1.00 |
| 12 | SR | **1.05** | 1.20 |
| 13 | SRP | **1.10** | 1.45 |
| 14 | SSR | **1.15** | 1.75 |
| 15 | UR | **1.20** | 1.75 |
| 16 | SP | **1.20** | 1.75 |

Nguồn số: `BV_RarityF` `ConfigValue.lua:53–63`; bản cũ `BV_RarityF_Old` `ConfigValue.lua:65–75`. Ánh xạ mã→bậc: `Hero_RarityMapping` `ConfigValue.lua:13409–13420`.
Chọn bản mới/cũ theo `LoginSystem:isOldServer()` — server mở **trước 2020-02-13** đọc bản `_Old` (`HeroAttribute.lua:105–109`; mốc ngày ghi trong chú thích `heroCombatDesc`). Server cũ thưởng phẩm chất cao **rất nặng** (SSR ×1.75 so với ×1.15).

### factor6 — Hệ số chuẩn hoá (`HeroCombatFormula.lua:22`)

`factor6 = BV_AdjustF = 0.012` — `ConfigValue.lua:80`.
Hằng nhân toàn cục kéo tích số 6 khối về thang điểm hợp lý. **Không đổi được**, chỉ để hiểu vì sao Lực Chiến không "nổ" thành số khổng lồ.

### factor7 — Cộng theo attr sát thương × 800 (`HeroCombatFormula.lua:23`)

```
factor7 = BV_AttrValueA(=800) × ( 伤害率 + 免伤率 + 反弹率 + 吸血率
          + 真实伤害 + 真伤抵抗 + 必杀技免伤率 + 必杀技伤害率 )
```
- **`BV_AttrValueA = 800`** — `ConfigValue.lua:85`.
- Lưu ý: ở đây attr **KHÔNG** nhân trọng số `BV_AttrF` (khác factor2), lấy giá trị thô từ `attrData[...]`. Có thêm 必杀技免伤率 (`kSuhunique`) và 必杀技伤害率 (`kShunique`) — tỉ lệ giảm/tăng ST của Tuyệt Kỹ.

### factor8 — Cộng theo attr bạo/khống-chế × 400 (`HeroCombatFormula.lua:24`)

```
factor8 = ( 暴击率 + 抗暴率 + 暴击强度 + 格挡率 + 破击率 + 格挡强度
          + 效果强度 + 效果抵抗率 + 效果命中率 + 被治疗率
          + 眩晕增益/100000 + 眩晕抵抗/100000 + 眩晕增益率 + 眩晕抵抗率
          + 护盾增益率 + 免死率
          + 灼烧伤害率 + 灼烧免伤率 + 流血伤害率 + 流血免伤率
          + 中毒伤害率 + 中毒免伤率 ) × BV_AttrValueB(=400)
```
- **`BV_AttrValueB = 400`** — `ConfigValue.lua:90`.
- Hai attr choáng (眩晕增益/抵抗) **chia `/100000`** trước khi cộng (giá trị thô rất lớn, chuẩn hoá về hệ số nhỏ). Nguồn: `HeroCombatFormula.lua:24`.

### factor9 — Lực Kỹ Năng (`HeroCombatFormula.lua:25`)

`factor9 = skillFactor` = Σ(cấp kỹ năng × `BV_SKValue` của loại kỹ năng). Gom tại `HeroAttribute.lua:101` → `SkillList:getSubSkillListFactor()`.

`BV_SKValue` (`ConfigValue.lua:92–106`):

| Loại kỹ năng | Điểm / cấp | Nguồn |
|---|---|---|
| SK_A1 (chủ động 1) | 4 | `ConfigValue.lua:100` |
| SK_A2 | 5 | `ConfigValue.lua:98` |
| SK_A3 | 6 | `ConfigValue.lua:96` |
| SK_A4 | 8 | `ConfigValue.lua:104` |
| SK_P1 / SK_P2 (bị động) | 6 / 6 | `ConfigValue.lua:103,99` |
| SK_Soul1 / SK_Soul3 / SK_Soul5 | **0 / 0 / 0** | `ConfigValue.lua:101,102,97` |

→ Kỹ năng Chiến Hồn (SK_Soul*) **không** cộng Lực Chiến qua khối này (=0; chuỗi `heroCombatDesc` gọi term này là "战魂135总等级*BV_SKValue" nhưng do hằng =0 nên triệt tiêu). Kỹ năng chủ động bậc cao (A4=8) đáng nâng nhất.

### factor10 — Lực Chiến Hồn dạng cộng (`HeroCombatFormula.lua:26`)

`factor10 = soulFactor` = tổng cộng-dồn (`combatFactor`) từ các loại Chiến Hồn. Tính tại `HeroSoulSlotList:syncSubSoulListFactor` (`HeroSoulSlotList.lua:121–193`). Với mỗi ô Hồn đã mở (`kCanLevel`):

| Loại Hồn (Trung) | Việt | Điểm cộng vào factor10 | Hằng | Nguồn |
|---|---|---|---|---|
| 怒气 kAnger | Hồn Nộ Khí | 40 + 8×cấp | `BV_SoulRp={40,8}` | `ConfigValue.lua:155–162` / `HeroSoulSlotList.lua:140–144` |
| 光环 kHalo | Hồn Hào Quang (bị động) | 80 + 16×cấp | `BV_SoulPassive={80,16}` | `ConfigValue.lua:163–170` / `:145–149` |
| 天赋 kTalent | Hồn Thiên Phú | theo bậc thẻ, từ 30+5×cấp … đến 200+30×cấp | `BV_SoulTalent` | `ConfigValue.lua:355–384` / `:165–175` |
| 命运 kFate | Hồn Vận Mệnh | **= 0** (xem cảnh báo) | `BV_SoulFate` = **toàn 0** | `ConfigValue.lua:619–684` / `:176–186` |
| kAttr / kCommand / kPassive | Hồn thường (phi toàn cục) | **= 0** | `BV_SoulCommon` = **toàn 0** | `ConfigValue.lua:171–216` / `:155–164` |

> ⚠️ **SỬA SO VỚI HIỂU LẦM PHỔ BIẾN:** Hồn **Vận Mệnh (命运)** cho **0 điểm** ở khối cộng factor10, vì `BV_SoulFate` là mảng **toàn số 0** (`ConfigValue.lua:619–684`). Toàn bộ giá trị của Hồn Vận Mệnh nằm ở **factor4 (khối NHÂN)** qua `BV_SoulFateRate` — và đây là một trong những đòn bẩy factor4 mạnh nhất (xem §4). Hồn thường (`BV_SoulCommon`) cũng cho **0** ở factor10, nhưng đóng góp vào factor4 qua `BV_SoulCommonRate`.

### factor11 — Lực Bánh Xe Vận Mệnh dạng cộng (`HeroCombatFormula.lua:27`)

`factor11 = fortuneWheelFactor` — từ `FortuneWheel:getSubFortuneWheelFactor()` (`HeroAttribute.lua:122`).

---

## 4. Chiến Hồn (战魂) đi vào công thức ở đâu?

Chiến Hồn là hệ dưỡng thành FREE mạnh vì nó chạm **cả 3 chỗ**. `soulRateFactor` (đổ vào factor4) là **tổng gộp** của nhiều loại Hồn:

| Đường đi | Rơi vào | Hằng | Kiểu |
|---|---|---|---|
| Hồn thường (kAttr/kCommand/kPassive) → **rate %** | **factor4 (NHÂN)** qua `soulRateFactor` | `BV_SoulCommonRate` `ConfigValue.lua:263–308` | Nhân → compound |
| Hồn **Thiên Phú (天赋)** → điểm **và** rate % | factor10 (cộng) **và** factor4 (nhân) | `BV_SoulTalent` (cộng) + `BV_SoulTalentRate` (rate) `ConfigValue.lua:385–414` | Cả hai |
| Hồn **Vận Mệnh (命运)** → **chỉ** rate % | **factor4 (NHÂN)**, factor10 = 0 | `BV_SoulFateRate` `ConfigValue.lua:685–750` | Nhân → compound |
| Hồn Nộ (怒气) / Hào Quang (光环) → điểm cộng | factor10 (cộng) | `BV_SoulRp` / `BV_SoulPassive` | Cộng |
| Hồn **toàn cục** (全局 kGlobal) | **cấp tài khoản** (§5) | `BV_SoulCommon_Global` = **toàn 0** trên server mới | Cộng account |

`BV_SoulCommonRate` theo sao Hồn (`soulItemData:getStar()`, 1★→10★), dạng `{base, +mỗi-cấp}`:

| Sao Hồn | base % | +/cấp | Nguồn |
|---|---|---|---|
| 1★ | 0.002 | 0.0002 | `ConfigValue.lua:267–270` |
| 5★ | 0.012 | 0.0014 | `ConfigValue.lua:283–286` |
| 8★ | 0.024 | 0.0027 | `ConfigValue.lua:295–298` |
| 10★ | 0.030 | 0.0033 | `ConfigValue.lua:303–306` |

Ví dụ 1 Hồn thường 10★ nâng 10 cấp → `soulRateFactor += 0.030 + 0.0033×10 = 0.063` = **+6.3%** cắm thẳng vào factor4 (nhân toàn bộ nền Công/Thủ/HP).

`BV_SoulFateRate` theo sao Vận Mệnh (index = sao+1, phần "+mỗi-cấp" đều **= 0** nên chỉ phụ thuộc sao):

| Sao Hồn Vận Mệnh | rate % | Nguồn |
|---|---|---|
| Sao 0 | 0.05 (**+5%**) | `ConfigValue.lua:689–692` |
| Sao 5 | 0.22 (**+22%**) | `ConfigValue.lua:709–712` |
| Sao cao nhất (13–14) | 1.00 (**+100%**) | `ConfigValue.lua:741–748` |

→ Một Hồn **Vận Mệnh** sao tối đa đẩy `soulRateFactor` lên tới **+1.0 = +100%** trong factor4 — nhân đôi toàn bộ cỗ máy. Đây là đòn bẩy factor4 mạnh nhất trong hệ Chiến Hồn, và **hoàn toàn nằm ở khối nhân, không ở khối cộng**.

Logic mở-ô + cộng dồn: `HeroSoulSlotList:syncSubSoulListFactor` `HeroSoulSlotList.lua:121–193` (Nộ 140–144, Hào Quang 145–149, toàn cục 150–154, thường 155–164, Thiên Phú 165–175, Vận Mệnh 176–186).

---

## 5. Lực Chiến cấp TÀI KHOẢN (ngoài từng Võ Sĩ)

Tổng Lực Chiến đội hình gom tại **`CombatSystem:getSimpleTeamCombat`** (`CombatSystem.lua:29–64`):
= Σ Lực Chiến từng Võ Sĩ trong đội (viện hộ + 9 thành viên + 6 hỗ trợ, qua `getHeroCombatInTeam → hero:getCompleteCombat`) **+ MỘT lần** `getExtraTeamCombat` (chỉ cộng khi tổng > 0, `CombatSystem.lua:61`).

**`CombatSystem:getExtraTeamCombat`** (`CombatSystem.lua:79–123`) mới là phần cộng thêm cấp tài khoản (KHÔNG tự cộng lại Lực Chiến từng Võ Sĩ):

| Nguồn | Công thức | Hằng | Nguồn dòng |
|---|---|---|---|
| Truyền Thừa (传承) | `heritageSystem:getCombat()` | — | `CombatSystem.lua:83` |
| Tinh Mạch (星脉/galaxy) | Σ cấp × `BV_StarSKValue[phẩm]` | R=5, SR=6, SRP=8, SSR=16, UR=20, SP=24 | `CombatSystem.lua:88–93`; `BV_StarSKValue` `ConfigValue.lua:107–118` |
| Hồn toàn cục (全局) | Σ `getSubGlobalSoulListFactor()` | `BV_SoulCommon_Global` = **toàn 0** (server mới) | `CombatSystem.lua:96`; `ConfigValue.lua:217–262` |
| Năng Lượng (能量) | growValue × `BV_EnergyF` | **0.4** | `CombatSystem.lua:99`; `ConfigValue.lua:122` |
| Thần Khí (神器/artifact) | Σ subAttrLevel × `BV_ArtifactF` | **10** | `CombatSystem.lua:104–108`; `ConfigValue.lua:127` |
| Bang Hội (社团/sect) | Σ postureSubCombat + mindSubCombat | `BV_SectF` | `CombatSystem.lua:110–120`; `ConfigValue.lua:129–144` |

Đáng chú ý: **Tinh Mạch bậc SP cho 24 điểm/cấp** và **Thần Khí 10 điểm/cấp phụ** — hai nguồn cộng account rẻ để đẩy Lực Chiến tổng.

> ⚠️ **Lưu ý server mới:** "Hồn toàn cục" đọc `BV_SoulCommon_Global` (toàn 0) nên **cộng 0** trên server mới. Chỉ server cũ (`BV_SoulCommon_Global_Old`, `ConfigValue.lua:473–506`) mới cho điểm.

---

## 6. Ví dụ minh hoạ (nắm độ lớn từng khối)

Giả sử một Võ Sĩ SSR (phẩm 14, factor5 = 1.15):
- Nền: Công 5000 + Thủ 3000 + HP 40000×0.08 = 3200 → **factor1 = 11200**
- factor2 = 3 + (giả sử Σ tỉ lệ ST 0.5) = **3.5**
- factor3 = 12 + (Σ bạo/hiệu ứng 1.0) = **13.0**
- factor4 = 1 + Sao 6×0.01 + Duyên 5×0.01 + soulRate 0.063 ≈ **1.17**
- factor5 = **1.15**, factor6 = **0.012**

Khối nhân ≈ `11200 × 3.5 × 13.0 × 1.17 × 1.15 × 0.012 ≈ 8 200`.
Cộng thêm factor7 (vd Σattr 0.5 × 800 = 400), factor8 (Σ 1.0 × 400 = 400), factor9 kỹ năng, factor10 Hồn...

→ **Phần nhân (~8200) áp đảo phần cộng (~vài trăm–vài nghìn).** Đây là bản chất "đòn bẩy" ở §7.
(Số minh hoạ; chỉ số thật lấy từ `HeroAttribute:getAttributeByType`. Nếu có 1 Hồn Vận Mệnh sao cao đẩy soulRate +1.0 thì factor4 ≈ 2.17 → khối nhân gần **gấp đôi**.)

---

## 7. 🎯 Đòn bẩy nào tăng Lực Chiến nhiều nhất? (NHÂN thắng CỘNG)

Xếp hạng theo độ "lời":

**① factor4 — mỗi +0.01 = +1% TOÀN tích số, và có nguồn đẩy rất mạnh.** Sao (`BV_HeroStarF=0.01`), Duyên Vũ Khí (`BV_EquipStarF=0.01`), **%Chiến Hồn** (`soulRateFactor`), Tiềm Năng. Đặc biệt **Hồn Vận Mệnh sao cao đẩy rate lên tới +1.0 (+100%)** và Hồn thường/Thiên Phú cộng dồn thêm — vì nằm trong khối nhân nên khuếch đại toàn cỗ máy. Đây là đòn bẩy FREE tốt nhất khi kẹt cap cấp.

**② factor1 — cày Công/Thủ/HP nền.** Vì bị nhân bởi factor2×3×4×5×6, mỗi điểm nền được **khuếch đại** qua cả chuỗi. Nâng Cấp (升级), Thăng Phẩm (升品), Thăng Sao (升星), trang bị, Thần Khí đều đổ vào đây. HP chỉ hệ số 0.08 → ưu tiên Công/Thủ (`ConfigValue.lua:9,12,14`).

**③ factor5 — Phẩm Chất/Tư Chất.** Nhảy từ R(1.0) lên SP(1.2) = **+20% trên toàn khối nhân** trong một bước. Server cũ chênh còn khủng hơn (SSR ×1.75). Vì vậy "lên bậc thẻ" là bước nhảy Lực Chiến lớn.

**④ factor2 / factor3 — nâng các tỉ lệ %.** Cộng vào nền 3 và 12 rồi nhân. Tăng tỉ lệ ST / bạo kích / hiệu ứng scale toàn tích.

**⑤ Đuôi CỘNG (factor7–11).** `BV_AttrValueA=800`, `BV_AttrValueB=400` cho điểm phẳng theo attr đặc biệt. **KHÔNG compound** với nền → tốt lúc đầu game và cho tướng khống chế/hỗ trợ (nhiều attr hiệu ứng), nhưng **giảm giá trị tương đối** khi khối nhân đã lớn.

> **Quy tắc vàng:** Bơm vào khối **NHÂN** (factor1–5) luôn lời hơn khối **CỘNG** (factor7–11) một khi Võ Sĩ đã có nền tử tế. Khi bị chặn cap cấp → dồn **Chiến Hồn** (nhất là Vận Mệnh/Thiên Phú vào factor4) và Sao/Duyên/Phẩm.

**Xác nhận trong game:** Cẩm nang chính thức (chuỗi hướng dẫn trong `tm.json`) ghi thứ tự ưu tiên nuôi Võ Sĩ để tăng Lực Chiến là **升星 (Thăng Sao) → 升品 (Thăng Phẩm) → 升级 (Nâng Cấp) → Trang Bị → Kỹ Năng → 星脉 (Tinh Mạch)**, và khẳng định "Hồn là phần nuôi chỉ sau thẻ" — khớp với việc Thăng Sao (factor4) + nền (factor1) đứng đầu.

---

## 8. Cách nâng cấp / mở khoá / kiếm nguyên liệu

| Muốn tăng factor | Nâng cái gì (Trung → Việt) | Nguyên liệu tiêu biểu |
|---|---|---|
| factor1 nền | 升级 Nâng Cấp / 升品 Thăng Phẩm / 升星 Thăng Sao / trang bị | EXP, mảnh thẻ (碎片), đá thăng phẩm |
| factor4 Sao | 升星 Thăng Sao | Mảnh nhân vật / mảnh SP dùng chung |
| factor4 Duyên Vũ Khí | 武器缘 mở/nâng duyên vũ khí | Vũ khí, 觉醒 Thức Tỉnh vũ khí |
| factor4 %Hồn (rate) | 战魂 Chiến Hồn: nâng cấp + 升星 Hồn (ưu tiên Vận Mệnh, Thiên Phú) | 战魂精华 Tinh Hoa Chiến Hồn, 战魂神殿 Thần Điện Chiến Hồn |
| factor10 điểm Hồn | Hồn Nộ / Hào Quang / Thiên Phú | như trên |
| factor5 Phẩm | thăng bậc thẻ (R→SR→…→SP) | Mảnh thẻ đúng nhân vật |
| factor9 Kỹ năng | nâng kỹ năng (ưu tiên A4=8đ) | Sách kỹ năng / vàng |
| Account: Tinh Mạch (星脉) | 星脉 nâng cấp | Mảnh sao / đá tinh mạch |
| Account: Thần Khí (神器) | 神器 nâng phụ-cấp (mỗi cấp 10đ) | 神器点 Điểm Thần Khí |
| Account: Năng Lượng (能量) | mỗi growValue ×0.4 | vật phẩm năng lượng |

Nguồn Tinh Hoa Chiến Hồn (phân giải Hồn) xác nhận trong `tm.json` (chuỗi "phân rã… có thể nhận… Tinh Hoa Chiến Hồn"; Tinh Hoa còn tự nhận khi phân rã Chứng Chiến Hồn hoặc nhận trùng Hồn 1–3 sao).

**Mẹo tối ưu nhanh:**
1. Kẹt cap cấp Võ Sĩ → dồn **Hồn Vận Mệnh / Thiên Phú sao cao** (đẩy `soulRateFactor` factor4, nhân toàn cỗ máy) và **Tinh Mạch / Thần Khí** ở account.
2. Ưu tiên **Công/Thủ** hơn HP thuần khi chọn trang bị/nội tại (HP chỉ ×0.08).
3. Nâng **kỹ năng chủ động bậc cao (A4=8, A3=6)** trước kỹ năng Hồn (=0 điểm ở factor9).
4. Lên **Phẩm Chất/Sao** cho tướng chủ lực trước — factor5 và factor4 nhân toàn cỗ máy.
5. Không nhồi quá nhiều vào attr chỉ-cộng (factor7/8) cho carry đã mạnh — lời hơn khi bơm nền + nhân.

---

## 9. Mini-glossary Trung → Việt

| Trung | Hán-Việt / Việt hoá | Ghi chú |
|---|---|---|
| 战力 / 战斗力 | Lực Chiến | Chỉ số tổng độ mạnh (bản Việt dịch cả hai là "Lực chiến") |
| 格斗家 | Võ Sĩ | Nhân vật/tướng |
| 战魂 | Chiến Hồn | Hệ dưỡng thành chỉ sau thẻ |
| 战魂精华 | Tinh Hoa Chiến Hồn | Nguyên liệu từ phân giải Hồn |
| 战魂神殿 | Thần Điện Chiến Hồn | Nơi ghép/lấy Hồn |
| 全局战魂 | Chiến Hồn Toàn Cục | Cộng Lực Chiến cấp tài khoản (server mới = 0) |
| 神器 / 神器点 | Thần Khí / Điểm Thần Khí | Account, 10đ/cấp phụ |
| 星脉 | Tinh Mạch | Account, tới 24đ/cấp (SP) |
| 传承 | Truyền Thừa | Account (heritage) |
| 社团 | Bang Hội | Account (sect) |
| 能量 | Năng Lượng | Account (×0.4) |
| 升品 | Thăng Phẩm | Nâng phẩm chất |
| 升星 | Thăng Sao | Nâng sao (factor4) |
| 升级 | Nâng Cấp | Nâng level |
| 资质 / 稀有度 | Tư Chất / Phẩm Chất (Độ hiếm) | R→SR→SRP→SSR→UR→SP (factor5) |
| 武器缘 | Duyên Vũ Khí | `relationFactor` trong factor4 |
| 觉醒 | Thức Tỉnh | Nâng/mở vũ khí, kỹ năng |
| 潜能 | Tiềm Năng | potentialFactor (factor4) |
| 命运 / 天赋 / 怒气 / 光环 (Hồn) | Vận Mệnh / Thiên Phú / Nộ Khí / Hào Quang | Các loại Chiến Hồn |

---

## 10. Bảng tra nhanh hằng số

| Hằng | Giá trị | Vai trò | Nguồn |
|---|---|---|---|
| `BV_FixedFA` | 3 | nền factor2 | `ConfigValue.lua:31` |
| `BV_FixedFB` | 12 | nền factor3 | `ConfigValue.lua:36` |
| `BV_FixedFC` | 1 | nền factor4 | `ConfigValue.lua:41` |
| `BV_HeroStarF` | 0.01 | Sao → factor4 | `ConfigValue.lua:46` |
| `BV_EquipStarF` | 0.01 | Duyên VK → factor4 | `ConfigValue.lua:51` |
| `BV_RarityF` | 1.0–1.2 | factor5 (phẩm) | `ConfigValue.lua:53–63` |
| `BV_RarityF_Old` | 1.0–1.75 | factor5 server cũ | `ConfigValue.lua:65–75` |
| `BV_AdjustF` | 0.012 | factor6 chuẩn hoá | `ConfigValue.lua:80` |
| `BV_AttrValueA` | 800 | ×attr ST → factor7 | `ConfigValue.lua:85` |
| `BV_AttrValueB` | 400 | ×attr bạo → factor8 | `ConfigValue.lua:90` |
| `BV_SKValue` | 0–8 | điểm/cấp kỹ năng → factor9 | `ConfigValue.lua:92–106` |
| `BV_AttrF.HP` | 0.08 | trọng số HP → factor1 | `ConfigValue.lua:9` |
| `BV_SoulRp` | {40,8} | Hồn Nộ → factor10 | `ConfigValue.lua:155–162` |
| `BV_SoulPassive` | {80,16} | Hồn Hào Quang → factor10 | `ConfigValue.lua:163–170` |
| `BV_SoulTalent` | 30–200 (+5…30/cấp) | Hồn Thiên Phú → factor10 | `ConfigValue.lua:355–384` |
| `BV_SoulTalentRate` | 0.002–… | Hồn Thiên Phú **%→factor4** | `ConfigValue.lua:385–414` |
| `BV_SoulCommon` | toàn 0 | Hồn thường (cộng=0) | `ConfigValue.lua:171–216` |
| `BV_SoulCommonRate` | 0.002–0.03 | Hồn thường **%→factor4** | `ConfigValue.lua:263–308` |
| `BV_SoulFate` | **toàn 0** | Hồn Vận Mệnh (cộng=0) | `ConfigValue.lua:619–684` |
| `BV_SoulFateRate` | 0.05–1.0 | Hồn Vận Mệnh **%→factor4** (tới +100%) | `ConfigValue.lua:685–750` |
| `BV_SoulCommon_Global` | toàn 0 (server mới) | Hồn toàn cục (account) | `ConfigValue.lua:217–262` |
| `BV_StarSKValue` | 5–24 | Tinh Mạch (account) | `ConfigValue.lua:107–118` |
| `BV_EnergyF` | 0.4 | Năng Lượng (account) | `ConfigValue.lua:122` |
| `BV_ArtifactF` | 10 | Thần Khí (account) | `ConfigValue.lua:127` |

---

**Tóm tắt một câu:** Lực Chiến = `(Công+Thủ+HP×0.08) × khối-ST × khối-bạo-kích × khối-%(sao/hồn/duyên) × phẩm × 0.012` **rồi cộng** các đuôi phẳng; muốn tăng nhiều nhất hãy bơm vào **khối NHÂN** — đặc biệt **%Chiến Hồn (Vận Mệnh tới +100%) trong factor4** và **nền + Sao + Phẩm** — vì phần cộng không được khuếch đại.

---

> ## Độ tin cậy
>
> **Đã kiểm chứng đúng với source (giữ nguyên):** toàn bộ hằng `BV_*` và số dòng trong §3, §5, §10 (BV_AttrF, FixedFA/FB/FC=3/12/1, HeroStarF/EquipStarF=0.01, RarityF 1.0–1.2, RarityF_Old 1.0–1.75, AdjustF=0.012, AttrValueA/B=800/400, SKValue 0–8, StarSKValue 5–24, EnergyF=0.4, ArtifactF=10, SoulRp/Passive, SoulCommon/SoulCommon_Global toàn 0, SoulCommonRate 0.002–0.03); cấu trúc `factor1..6 nhân + factor7..11 cộng` (`HeroCombatFormula.lua:28`); ánh xạ mã 11–16 → R/SR/SRP/SSR/UR/SP (`Hero_RarityMapping`); chọn config cũ theo `isOldServer` mốc 2020-02-13; danh sách attr trong factor7/factor8 khớp từng dòng code; kết luận "NHÂN thắng CỘNG".
>
> **Đã SỬA so với bản nháp:**
> 1. **Hồn Vận Mệnh (命运/kFate):** bản nháp ghi rót vào **factor10 "theo sao"** qua `BV_SoulFate`. SAI — `BV_SoulFate` là mảng **toàn 0** (`ConfigValue.lua:619–684`) nên factor10 = 0. Giá trị thật nằm ở **factor4** qua `BV_SoulFateRate` (`:685–750`), lên tới **+1.0 = +100%**. Đây là sửa quan trọng nhất; kéo theo cập nhật §3 (factor10), §4, §7, §10 và phần tóm tắt.
> 2. **Hồn Thiên Phú (天赋):** bổ sung — nó đóng góp **cả** factor10 (`BV_SoulTalent`, khác 0) **lẫn** factor4 (`BV_SoulTalentRate`), bản nháp chỉ ghi factor10.
> 3. **§5 tên hàm:** bản nháp gọi `CombatSystem:getCombat` (không tồn tại) và bảo nó "Σ Lực Chiến từng Võ Sĩ + thêm". Thực tế: tổng đội gom ở **`getSimpleTeamCombat`** (`:29–64`, cộng `getExtraTeamCombat` một lần ở dòng 61); còn **`getExtraTeamCombat`** (`:79–123`) chỉ tính phần cộng-thêm cấp account, KHÔNG tự cộng lại Lực Chiến từng Võ Sĩ.
> 4. **Hồn toàn cục = 0 trên server mới:** `BV_SoulCommon_Global` toàn 0 (`:217–262`); chỉ `_Old` (`:473–506`) mới khác 0. Đã ghi chú ở §4 và §5.
> 5. **Thuật ngữ 社团 = Bang Hội** (đúng theo `tm.json`), thay "Xã/Xã đoàn" của bản nháp.
> 6. **战斗力:** bản Việt hoá dịch là "Lực chiến" (đồng nhất 战力), không phải "Lực Chiến Đấu".
> 7. Ví dụ §6: factor4 chỉnh 1.18 → **1.17** cho khớp phép cộng (1 + 0.06 + 0.05 + 0.063); thêm minh hoạ trường hợp có Hồn Vận Mệnh (factor4 ≈ 2.17).
> 8. Thêm cột `BV_SoulTalent/TalentRate`, `BV_SoulFate/FateRate` vào §10; thêm xác nhận thứ tự ưu tiên nuôi từ cẩm nang `tm.json` vào §7.
>
> **Chưa chắc chắn 100% từ source (cần bắt/đo thêm nếu muốn tuyệt đối):**
> - **`burstFactor`** (một số hạng trong factor4): lấy từ `hero:getBurst():getSubBurstListFactor()` (`HeroAttribute.lua:120`). Bản dịch tạm là "Bộc Phát"; **chưa xác minh** tên Trung/Việt chính thức trong `tm.json`. `heroCombatDesc` không liệt kê hạng này (code có, mô tả không), nên đây là hạng "ẩn".
> - **武器缘 = "Duyên Vũ Khí"**: suy từ chuỗi `heroCombatDesc` ("武器缘等级") + biến `relationFactor`; **không có** entry trong `tm.json` nên tên Việt là dịch tạm, chưa phải bản Việt hoá chính thức.
> - **Diễn giải "眩晕/100000 = đơn vị mili-giây"** trong factor8 chỉ là suy đoán về đơn vị; source chỉ chắc chắn phép chia `/100000` (`HeroCombatFormula.lua:24`).
> - Giá trị cụ thể của Truyền Thừa (`heritageSystem:getCombat()`) và Bánh Xe Vận Mệnh (factor11) tính trong module riêng, chưa mở ra trong phạm vi rà soát này.