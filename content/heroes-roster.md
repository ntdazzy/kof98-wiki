# Hệ thống Võ Sĩ & độ hiếm

I have completed full verification against the source. All config numbers (rarity factors, star/quality tables, formulas, sect names, hero attributes, draw costs) are verified, and I found several fabricated/incorrect claims to fix. Here is the corrected final wiki.

---

# Hệ Thống Võ Sĩ (格斗家) & Độ Hiếm — Wiki KOF98

> Mọi con số dưới đây trích trực tiếp từ source Lua client (`reference/client-src/`) và bản Việt hoá (`data/i18n/tm.json`), ghi rõ `file:dòng`. Các khuyến nghị "meta" lấy từ cẩm nang gốc nhúng trong `tm.json` và được ghi chú riêng.

## 1. Tổng quan

Mỗi nhân vật gọi là **Võ Sĩ (格斗家 → Võ Sĩ**, `tm.json`). Một Võ Sĩ được định nghĩa bởi 3 "thẻ" cố định trong `config/HeroBase.lua`:

| Trường trong HeroBase | Ý nghĩa | Ví dụ (H001 Kusanagi Kyo) |
|---|---|---|
| `Rarity` | Độ hiếm (11→16) | `11` = R — `HeroBase.lua:17` |
| `Type` | Hệ chiến đấu 攻/防/技 | `"DPS"` = Đả — `HeroBase.lua:35` |
| `SectType` | Lưu Phái (流派) SECT1–8 | `"SECT1"` = Xí Diễm Liệt Hỏa — `HeroBase.lua:11` |
| `CombineCost` | Số mảnh để ghép/sinh tướng | `50` — `HeroBase.lua:22` |

Kho tướng gốc có **90 Võ Sĩ** (đếm khoá top-level `H… = {` trong `HeroBase.lua`). ID không liền mạch: H001–H077 (bản chính) + một số biến thể/boss H201–H261 (Kyo NEST, Leona thức tỉnh, các bản 大蛇 Orochi…). Ba thẻ trên quyết định sức mạnh nền, khắc chế, và tổ hợp đội hình.

---

## 2. Độ Hiếm (稀有度 → Độ Hiếm)

### 2.1 Sáu bậc độ hiếm

Mã số (`Hero_RarityMapping`, `ConfigValue.lua:13409-13419`) → nhãn hiển thị (`Translate_2.lua`). Số tướng đếm từ `HeroBase.lua` (top-level):

| Mã | Nhãn | Khoá nhãn / nguồn | Số tướng gốc |
|---|---|---|---|
| 11 | **R** | `Hero_Rarity_R` — `Translate_2.lua:5066` | 6 |
| 12 | **SR** | `Hero_Rarity_SR` — `Translate_2.lua:5070` | 11 |
| 13 | **SR+** | `Hero_Rarity_SRP` — `Translate_2.lua:5258` | 23 |
| 14 | **SSR** | `Hero_Rarity_SSR` — `Translate_2.lua:5078` | 17 |
| 15 | **UR** | `Hero_Rarity_UR` — `Translate_2.lua:5082` | 16 |
| 16 | **SP** ("Võ Sĩ SP") | `Hero_Rarity_SP` — `Translate_2.lua:5290` | 17 |

> Lưu ý tên nội bộ: mã 13 map tới khoá `Hero_Rarity_SRP` = "SR+". Ngoài ra còn một khoá `Hero_Rarity_SRS` = "SR_plus" (`Translate_2.lua:5074`) chỉ là tên kỹ thuật, không phải nhãn hiển thị. Tổng: 6+11+23+17+16+17 = **90**.

### 2.2 HAI hệ số độ hiếm — cần phân biệt rõ

Game dùng **hai** hệ số khác nhau, đừng nhầm:

**a) `Hero_RarityFactor` — nhân THẲNG vào chỉ số gốc (công/thủ/máu).** Đây là đòn bẩy chỉ số nền thật sự (`ConfigValue.lua:13216-13227`, dùng ở `HeroAttributeFormula.lua:89`):

| Độ hiếm | Mã | Hero_RarityFactor | Ghi chú |
|---|---|---|---|
| R | 11 | **0.95** | thấp hơn chuẩn |
| SR | 12 | **1.0** | mốc chuẩn |
| SR+ | 13 | **1.2** | |
| SSR | 14 | **1.44** | = 1.2² |
| UR | 15 | **1.728** | = 1.2³ |
| SP | 16 | **2.0736** | = 1.2⁴ |

Cấp số nhân theo hệ số 1.2. Cùng cấp/sao/phẩm, một **SP có chỉ số nền gấp ~2.07 lần một SR** (2.0736 / 1.0) và **gấp ~2.18 lần một R** (2.0736 / 0.95). Chính hệ số này giải thích vì sao độ hiếm quan trọng bậc nhất.

**b) `BV_RarityF` — nhân vào điểm LỰC CHIẾN hiển thị (战力 → Lực Chiến).** Nhỏ hơn, là factor cuối khi tính con số show ra (`ConfigValue.lua:53-64`, dùng ở `HeroCombatFormula.lua` factor5):

| Độ hiếm | Mã | BV_RarityF |
|---|---|---|
| R | 11 | **1.0** |
| SR | 12 | **1.05** |
| SR+ | 13 | **1.1** |
| SSR | 14 | **1.15** |
| UR | 15 | **1.2** |
| SP | 16 | **1.2** |

> **Server cũ:** Server mở trước 2020-02-13 đọc bảng `BV_RarityF_Old` (`ConfigValue.lua:65-76`), chênh lệch lớn hơn: R=1.0, SR=1.2, SR+=1.45, SSR/UR/SP=1.75. Ghi chú nằm ngay trong mô tả công thức: *"20200213之前开的服读旧的资质配置"* (`HeroCombatFormula.lua:5`).

---

## 3. Hệ Chiến Đấu 攻 / 防 / 技 (Đả / Thủ / Kĩ)

Trường `Type` có 3 giá trị, hiển thị bằng 1 chữ Hán (`Translate_1.lua:66127-66138`):

| Type (code) | Chữ | Đọc (bản Việt hoá) | Vai trò | Số tướng gốc |
|---|---|---|---|---|
| `DPS` | **攻** | **Đả** (Công) | Sát thủ, đầu ra sát thương | 30 |
| `TANK` | **防** | **Thủ** (Phòng) | Đỡ đòn, tuyến trước | 26 |
| `GANK` | **技** | **Kĩ** (Kỹ) | Khống chế / hỗ trợ / kỹ xảo | 34 |

(Đếm từ 90 tướng: DPS=30, TANK=26, GANK=34.)

### 3.1 Quan hệ khắc chế (克制 → Khắc Chế) — tam giác

Nguồn `tm.json`: *"攻克技，技克防，防克攻；克制时会造成额外伤害"* → **"Đả khắc Kĩ, Kĩ khắc Thủ, Thủ khắc Đả; khi khắc chế sẽ gây sát thương thêm."**

```
       攻 (Đả/DPS)
      ↗          ↘  khắc
  Thủ ←──────── Kĩ
 (防/TANK) khắc (技/GANK)
```

- **攻 (Đả)** khắc **技 (Kĩ)**
- **技 (Kĩ)** khắc **防 (Thủ)**
- **防 (Thủ)** khắc **攻 (Đả)**

Ra đúng hệ khắc chế → đòn đánh gây **thêm sát thương**. Trong phó bản, quy tắc gốc (`tm.json`): *"每关副本BOSS会有一名克制格斗家，当克制格斗家上阵时,BOSS攻防会降低"* → **"Mỗi ải phó bản BOSS có một Võ Sĩ Khắc Chế; cho tướng đó ra trận thì công/thủ của BOSS giảm."** Đây là mẹo cày ải quan trọng.

---

## 4. Lưu Phái (流派 → Lưu Phái) — 8 hệ SECT

Trường `SectType` = SECT1…SECT8. Tên hiển thị (`Translate_2.lua:64785-64816`):

| SECT | Tên Trung | Hán-Việt (nghĩa) | Số tướng | Đại diện (từ config) |
|---|---|---|---|---|
| SECT1 | 炽炎烈火 | Xí Diễm Liệt Hỏa (Lửa cháy rực) | 11 | Kyo, Mai, Li Liệt Hỏa |
| SECT2 | 极限武道 | Cực Hạn Võ Đạo | 10 | Robert, nhà Sakazaki (Ryo/Yuri/Takuma), K' |
| SECT3 | 汲血之刃 | Cấp Huyết Chi Nhận (Lưỡi hút máu) | 11 | Iori, Ukyo, Haohmaru, Nakoruru |
| SECT4 | 能源掌控 | Năng Nguyên Chưởng Khống (Khống chế năng lượng) | 12 | Benimaru, Chizuru |
| SECT5 | 隐秘暗杀 | Ẩn Bí Ám Sát | 12 | Leona, Mature/Vice, Hadiran |
| SECT6 | 无双战姬 | Vô Song Chiến Cơ | 11 | Athena, Kula, Blue Mary |
| SECT7 | 不屈金刚 | Bất Khuất Kim Cang | 12 | Maxima, Rugal (tuyến thủ) |
| SECT8 | 大蛇之力 | Đại Xà Chi Lực (Sức mạnh Orochi) | 11 | Chris, Shermie, Yashiro, Orochi |

### 4.1 Lưu Phái dùng để làm gì

Lưu Phái + Hệ (攻防技) là hai trục kích hoạt **Tổ Hợp (组合 → Tổ Hợp)** trong hệ đội hình có synergy (config nội bộ prefix `AutoChess`):
- Đủ N tướng cùng **Hệ**: *"${leixing}:${num1}/${num2}，战力增加${power}%"* → cộng % Lực Chiến (`Translate_1.lua:66125`, AutoChessUI83).
- Đủ N tướng cùng **Lưu Phái**: *"${liupai}:${num1}/${num2}，战力增加${power}%"* → cộng % Lực Chiến (`Translate_1.lua:66121`); chưa đủ thì hiện "组合未激活" (`Translate_1.lua:66141`, AutoChessUI84).

Lưu Phái còn là "chất keo" đội hình: theo cẩm nang gốc (`tm.json`), **nhiều Chiến Hồn khi số võ sĩ cùng Lưu Phái > 2 sẽ nhân đôi hoặc +50% hiệu quả** — gom một Lưu Phái lợi hơn ghép tướng rời rạc. Cực Hạn Lưu còn có buff "Bá Vương" (từ Ryo/Yuri) — buff của Yuri cộng thêm cho **các tướng nữ trong đội**.

> ⚠️ **Cùng 8 tên này còn dùng cho hệ tu luyện 封神之路 (Con Đường Phong Thần).** `SectMain.lua` định nghĩa `Sect_1…Sect_8` với **đúng 8 tên Lưu Phái** (`Sect_1_Name`=炽炎烈火 … `Sect_8_Name`=大蛇之力, `Translate_1.lua:87931/…/87289`), mỗi Lưu Phái nuôi **心法 (tâm pháp) + 招式 (Chiêu Thức)** của các tướng trong đó, tiêu **封神币 (Tiền Phong Thần)**. Đây là **cùng hệ Lưu Phái**, chỉ là một tầng tu luyện sâu hơn — KHÔNG phải một bảng phân loại khác.

---

## 5. Công Thức Chỉ Số & Lực Chiến (chính xác)

### 5.1 Chỉ số nền (Công / Thủ / Máu)

Từ `HeroAttributeFormula.lua` (hàm `getBasicAttNumByType`, ~dòng 94-114):

```
ChỉSố = factor1 × factor2 + baseValue

factor1 = QualityBaseValue + StarBaseValue + (StarFactor + QualityFactor) × Level
factor2 = baseRatioFactor × Hero_RarityFactor × attConstant
baseValue = BaseAttack / BaseDefence / BaseHp
```

Trong đó:
- `QualityBaseValue`, `QualityFactor` ← bảng phẩm `HeroQualityRate.lua`
- `StarBaseValue`, `StarFactor` ← bảng sao `HeroStarRate.lua`
- `baseRatioFactor` = hệ số tăng trưởng riêng của tướng: `AttackFactor` / `DefenceFactor` / `HpFactor` (VD Kyo `AttackFactor=1.07` — `HeroBase.lua:12`)
- `Hero_RarityFactor` = hệ số độ hiếm ở §2.2a
- `attConstant` = hằng số toàn cục theo loại chỉ số: **Công=1** (`Hero_AtkRate`, `ConfigValue.lua:13201-13205`), **Thủ=0.4** (`Hero_DefRate`, `:13206-13210`), **Máu=12** (`Hero_HpRate`, `:13211-13215`)

**Điểm mấu chốt:** Cấp (Level) nhân với **tổng** `(StarFactor + QualityFactor)` — nên càng nhiều sao + phẩm cao thì mỗi cấp càng "nặng ký". Độ hiếm nhân toàn bộ `factor2`.

### 5.2 Lực Chiến (战力 — điểm tổng)

Mô tả gốc lưu trong code (`HeroCombatFormula.lua:5`, hiện thực trong hàm `getHeroCombat`):

```
Lực Chiến = (Công + Thủ + Máu×0.08)
          × (BV_FixedFA + tỉ lệ sát thương + tỉ lệ miễn thương + phản đòn×0.6 + hút máu×0.6 + …)
          × (BV_FixedFB + bạo kích + kháng bạo×0.7 + cường bạo×0.4 + đỡ đòn + phá đỡ×0.7 + …)
          × (BV_FixedFC + Sao×BV_HeroStarF + cấp duyên vũ khí×BV_EquipStarF + % Chiến Hồn + % Tiềm Năng)
          × BV_RarityF          ← hệ số độ hiếm §2.2b (factor5 = rarityFactor)
          × BV_AdjustF
          + (Σ tỉ lệ sát thương/miễn thương…) × BV_AttrValueA
          + (Σ tỉ lệ bạo/đỡ/hiệu ứng/choáng…) × BV_AttrValueB
          + tổng cấp Chiến Hồn 135 × BV_SKValue
          + Σ(cấp kỹ năng × BV_SKValue)
```

Hằng số (`ConfigValue.lua`): `BV_FixedFA=3` (:31), `BV_FixedFB=12` (:36), `BV_FixedFC=1` (:41), `BV_HeroStarF=0.01` (:46), `BV_EquipStarF=0.01` (:52), `BV_AdjustF=0.012` (:80), `BV_AttrValueA=800` (:85), `BV_AttrValueB=400` (:90).

---

## 6. Nâng cấp & Mở khoá Võ Sĩ

Thứ tự ưu tiên chuẩn (cẩm nang gốc `tm.json`): **Thăng Sao → Thăng Phẩm → Nâng Cấp → Trang Bị → Kỹ Năng → Tinh Mạch.**

### 6.1 升级 — Nâng Cấp (Level)
Nhân thẳng vào `factor1` (§5.1). Nguyên liệu: EXP / kim tiền. Lợi ích mỗi cấp phụ thuộc số sao + phẩm đã có.

### 6.2 升星 — Thăng Sao (Star)
Bảng hệ số sao `HeroStarRate.lua` (37 mốc; id = (đại_sao-1)×6 + tiểu_sao + 1):

| Id | StarFactor | StarBaseValue | Nguồn |
|---|---|---|---|
| 1 | 1 | 0 | `HeroStarRate.lua:4-8` |
| 6 | 1 | 30 | `:29-33` |
| 7 | 2 | 40 | `:34-38` |
| 12 | 2 | 100 | `:59-63` |
| 13 | 3 | 120 | `:64-68` |
| 19 | 6 | 270 | `:94-98` |
| 25 | 10 | 420 | `:124-128` |
| 31 | 15 | 620 | `:154-158` |
| 37 (tối đa, 7★ đầy) | 20 | 800 | `:184-188` |

Chi phí thăng sao ở `HeroStarBase.lua` (VD H043 sao 1→2: `StarUpCost=200000` kim tiền, `StarUpScore=150`, các tiểu-sao `SmallStarUpFactor = {10,15,20,25,30}` — `HeroStarBase.lua:4-32`). Điểm thăng sao (`StarUpScore`/`SmallStarUpScore`) nạp từ **mảnh tướng (碎片)**.

### 6.3 升品 / 觉醒 — Thăng Phẩm / Thức Tỉnh (Quality)
Bảng phẩm `HeroQualityRate.lua`. Phẩm chia **bậc lớn Quality 1→7** và bậc nhỏ (QualityLevel):

| Mã phẩm | Quality | QualityFactor | QualityBaseValue | Nguồn |
|---|---|---|---|---|
| 10 | 1 | 4 | 0 | `HeroQualityRate.lua:4-10` |
| 20 | 2 | 5 | 50 | `:11-17` |
| 30 | 3 | 8 | 300 | `:32-38` |
| 40 | 4 | 14 | 800 | `:60-66` |
| 44 | 4 | 22 | 1900 | `:88-94` |
| 50 | 5 | 26 | 2300 | `:95-101` |
| 53 | 5 | 37 | 4700 | `:116-122` |
| 60 | 6 | 49 | 7900 | `:137-143` |
| 70 | 7 | 49 | 7900 | (đỉnh, `QualityFactor`/`QualityBaseValue` chững lại) |

Nguyên liệu: **đá thức tỉnh (觉醒石 → Đá Thức Tỉnh)** + mảnh. Cẩm nang lưu ý đá thức tỉnh **thiếu ở giai đoạn đầu** → gom qua Máy Gacha (扭蛋机) khi có sự kiện tặng.

### 6.4 星脉 — Tinh Mạch (Star-Vein)
Mở bằng **mảnh tư chất thấp**, cho **buff tiện ích toàn cục** — đòn bẩy FREE cực mạnh cho người ít nạp (mở khoá sau **cấp 23**, `tm.json`). Các mốc đáng đầu tư (đúng nguyên văn cẩm nang gốc):

| Tướng | Tinh Mạch nâng đầy = |
|---|---|
| **Vice & Mature** (薇丝/麦卓) | **2 lần miễn phí Thể Lực-Vàng mỗi ngày** |
| **Goro Daimon** (大门) | **thêm vài điểm Thể Lực mỗi giờ** |
| **Nakoruru** (娜可露露/露露) | **1 lượt rút thẻ miễn phí mỗi ngày** (nâng Tinh Mạch còn rút ngắn thời gian hồi) |

### 6.5 装备 / 技能 / 战魂 — Trang Bị / Kỹ Năng / Chiến Hồn
- **Trang bị (装备):** cộng chỉ số + duyên vũ khí (`武器缘等级` trong công thức Lực Chiến).
- **Kỹ năng (技能):** mỗi cấp kỹ năng cộng `BV_SKValue` vào Lực Chiến.
- **Chiến Hồn (战魂 → Chiến Hồn):** hệ nuôi lớn số 2 sau thẻ tướng. Đa số Hồn 4★, 5★ đều rất mạnh; hai Hồn sao thấp dễ kiếm được cẩm nang đề cử: **Benimaru 3★, Maxima 3★**. Chi tiết xem wiki Chiến Hồn.

---

## 7. Cách Sở Hữu Võ Sĩ

### 7.1 招募 — Chiêu Mộ (Rút thẻ)
`DrawCard.lua`: rút bằng Kim Cương (`IR_Diamond`) hoặc vé (`IM_FragDraw`). Chi phí **thay đổi theo banner**:
- **Chiêu mộ đơn (钻石招募):** 168–300 Kim Cương (VD banner H228 = 168 — `DrawCard.lua:4-20`; banner H256/H069 = 300).
- **Chiêu mộ ×10 (钻石10招):** 1500–3000 Kim Cương (H228 = 1500 — `DrawCard.lua:21-38`; H256/H069 = 3000).

**Bảo hiểm (保底):** lần rút 10 đầu tiên **chắc chắn ra SR+** (*"第一次十连必出SR+"*, `tm.json`). Pool tiêu chuẩn có **hai SSR: Ukyo (橘右京) và K (K')**; SSR chỉ ra dưới dạng **mảnh**, có cơ chế bảo hiểm — rút đủ số lần sẽ gom đủ **150 mảnh** (đủ ghép 1 SSR).

### 7.2 碎片 — Mảnh & Ghép Tướng (CombineCost)
Số mảnh để "sinh"/ghép tướng (trường `CombineCost` trong `HeroBase.lua`):

| Độ hiếm | CombineCost (mảnh) |
|---|---|
| R (11) | **20** (ngoại lệ Kyo H001 = 50) |
| SR (12) | **50** (ngoại lệ Benimaru H002 & Athena H013 = 20) |
| SR+ (13) | **50** |
| SSR (14) | **150** |
| UR (15) | **150** |
| SP (16) | **150** |

Mảnh tướng lấy từ: đổi cửa hàng, quét phó bản, sự kiện tích nạp, hộp tự chọn mảnh, lối chơi Kho Báu Iori Bang Hội (八神)…

### 7.3 Sự kiện & Nạp (cẩm nang gốc `tm.json`)
- **Ngày 1 nạp V4** → **Nakoruru 4 sao** (giúp đua Đấu Trường & đẩy ải).
- **Nạp nhỏ** → **Vũ Khí Thức Tỉnh Kusanagi Kyo** (sự kiện đáng-tiền nhất game, rất rẻ).
- **Ngày 3** có sự kiện nạp → mảnh **Mai (火舞)** + **Blue Mary**; gói V6-V8 tặng **Nakoruru**.
- **V10** → tặng thẳng **Iori (八神庵)**.
- **元神 (Nguyên Thần):** hệ tái sinh cấp cao (`HeroReborn.lua` / `RebornSystem.lua`), dùng mảnh Nguyên Thần nâng cấp Nguyên Thần.

---

## 8. Võ Sĩ Meta (theo config + cẩm nang gốc)

Rarity/Type/SectType lấy từ `HeroBase.lua`; ghi chú meta từ cẩm nang trong `tm.json`.

| ID | Tướng | Độ hiếm | Hệ | Lưu Phái | Ghi chú meta |
|---|---|---|---|---|---|
| H040 | **K'** (K) | SSR | 攻 Đả | SECT2 | Một trong **2 SSR pool tiêu chuẩn**; sức mạnh xếp **top đầu game** (cẩm nang). Rút chỉ ra mảnh, bảo hiểm 150 mảnh. |
| H050 | **Ukyo** (橘右京) | SSR | 技 Kĩ | SECT3 | SSR còn lại trong pool tiêu chuẩn. Nòng cốt đội Chảy Máu / Thiêu Đốt. |
| H010 | **Leona** (莉安娜) | SSR | 技 Kĩ | SECT5 | Cốt lõi **Ám Sát Lưu**, mạnh cả đẩy ải & Đấu Trường. Mục tiêu rút-đầu/reroll hàng đầu. |
| H028 | **Iori** (八神庵) | SSR | 攻 Đả | SECT3 | Điểm sát tuyến trước, chí mạng cao. Tặng ở mốc **V10** + tích mảnh qua Kho Báu Iori Bang Hội. |
| H044 | **Kula** (库拉) | SSR | 技 Kĩ | SECT6 | **Không nằm pool tiêu chuẩn** — là thưởng đua Lực Chiến. |
| H049 | **Haohmaru** (霸王丸) | SSR | 防 Thủ | SECT3 | Thưởng đua Lực Chiến (cẩm nang: "có thể cân nhắc đua thử"). |
| H008 | **Robert** (罗伯特) | SR+ | 攻 Đả | SECT2 | **Cốt lõi đầu ra Cực Hạn Lưu.** Rút-đầu tốt nhất cho người ít nạp. |
| H026 | **Blue Mary** (玛丽) | SR+ | 防 Thủ | SECT6 | **Thẻ Thủ tuyến trước hữu dụng bậc nhất giai đoạn đầu.** (Đã rời pool rút-đầu.) |
| H051 | **Nakoruru** (娜可露露) | SR+ | 技 Kĩ | SECT3 | Vạn năng: tụ hỏa/thu hoạch/ép máu; lên SSR & 6★ được. Tinh Mạch full = rút free/ngày. |
| H001 | **Kusanagi Kyo** (草薙京) | R | 攻 Đả | SECT1 | Lõi **Đội Lửa**; có đường free + vũ khí thức tỉnh rẻ → lên SSR rất nhanh. |
| H003 | **Goro Daimon** (大门五郎) | SR | 防 Thủ | SECT2 | Thẻ Thủ 6★ nhanh nhất cho dân free; thay tạm Takuma ở Cực Hạn Lưu. Tinh Mạch = +Thể Lực/giờ. |
| H029 / H030 | **Mature / Vice** (麦卓/薇丝) | SR | 攻 Đả | SECT5 | Tinh Mạch full = 2 lần free Thể Lực-Vàng/ngày. |

### 8.1 Đội hình mạnh (cẩm nang gốc, đúng roster)
- **Đội Lửa (火队):** Kusanagi Kyo, Kusanagi Saishu (草薙柴舟), Mai (不知火舞), ông già Chin (陈国汉), Li Liệt Hỏa (李烈火), Chris (克里斯). → xây quanh cơ chế 灼烧 (thiêu đốt); đa số có đường đổi mảnh **và cả vũ khí thức tỉnh** free, lớn cực nhanh. (Lưu ý: đội thiêu trộn cả tướng ngoài SECT1 như Chris — SECT8.)
- **Cực Hạn Lưu (极限流, SECT2):** Robert, Ryo, Yuri, Takuma (early thay bằng Daimon) + 2 trong {Kula / Xue (雪) / Athena / Chizuru (神乐千鹤)}.
- **Đội Chảy Máu / Thiêu Đốt:** Ukyo, Nakoruru, Iori, Kyo, Saishu, Li Liệt Hỏa.
- **Ám Sát Lưu (暗杀流, SECT5):** Leona + Hadiran (哈迪兰) + Hattori Hanzo (服部半藏), thêm Mary.

---

## 9. Mẹo Tối Ưu

1. **Nuôi theo thứ tự: Sao > Phẩm > Cấp > Trang bị > Kỹ năng > Tinh Mạch** — vì `Hero_RarityFactor` × sao × phẩm cộng dồn theo cấp số nhân (§5.1).
2. **Ép độ hiếm bằng thức tỉnh vũ khí Kyo (R→SSR)** thay vì cày SSR mới — rẻ hơn nhiều, tận dụng `Hero_RarityFactor` nhảy 0.95 → 1.44.
3. **Đầu tư Tinh Mạch tư chất thấp (Vice/Mature, Daimon, Nakoruru)** sớm → free Thể Lực + rút thẻ mỗi ngày, lợi kép cả game.
4. **Xếp đội đồng Lưu Phái + đồng Hệ** để kích Tổ Hợp (cộng % Lực Chiến) và nhân đôi/+50% hiệu quả Chiến Hồn.
5. **Dùng Hệ khắc chế khi đẩy ải/BOSS** (Đả↔Kĩ↔Thủ) → sát thương thêm + giảm công/thủ BOSS khi cho "Võ Sĩ Khắc Chế" ra trận.
6. **Chiến Hồn sao thấp Benimaru 3★ / Maxima 3★** để lướt giai đoạn đầu; Hồn 4-5★ là đòn bẩy dài hạn (đa số rất tốt).
7. **Bảo hiểm rút thẻ:** 10-pull đầu chắc chắn SR+. Giữ Kim Cương mua Thể Lực, đừng "tất tay".

---

## 10. Mini-Glossary Trung → Việt (theo `tm.json`)

| Trung | Việt hoá chuẩn | Ghi chú |
|---|---|---|
| 格斗家 | Võ Sĩ | Nhân vật/tướng |
| 稀有度 | Độ Hiếm | R/SR/SR+/SSR/UR/SP |
| 攻 / 防 / 技 | Đả / Thủ / Kĩ | DPS / TANK / GANK |
| 克制 | Khắc Chế | Đả khắc Kĩ, Kĩ khắc Thủ, Thủ khắc Đả |
| 流派 | Lưu Phái | Thẻ SECT1–8 trên tướng |
| 组合 | Tổ Hợp | Synergy đội hình |
| 战力 | Lực Chiến | Điểm sức mạnh tổng |
| 升级 | Nâng Cấp | Level |
| 升星 | Thăng Sao | Star, dùng mảnh |
| 升品 / 觉醒 | Thăng Phẩm / Thức Tỉnh | Quality, dùng đá thức tỉnh |
| 星脉 | Tinh Mạch | Star-Vein, buff tiện ích |
| 战魂 | Chiến Hồn | War-Soul |
| 战魂精华 | Tinh Hoa Chiến Hồn | Nguyên liệu Chiến Hồn |
| 神器 | Thần Khí | Artifact |
| 援护 | **Yểm Trợ** | Kỹ năng hỗ trợ/tiếp ứng |
| 招募 / 抽卡 | Chiêu Mộ / Rút Thẻ | Gacha |
| 碎片 | Mảnh | Fragment |
| 元神 | Nguyên Thần | Hệ tái sinh cấp cao |
| 体力 | Thể Lực | Stamina |
| 觉醒石 | Đá Thức Tỉnh | Nguyên liệu thăng phẩm |
| 封神之路 / 封神币 | Con Đường Phong Thần / Tiền Phong Thần | Tu luyện Lưu Phái (心法/招式) |
| 炽炎烈火 | Xí Diễm Liệt Hỏa | SECT1 — Đội Lửa |
| 极限武道 | Cực Hạn Võ Đạo | SECT2 — Cực Hạn Lưu |
| 隐秘暗杀 | Ẩn Bí Ám Sát | SECT5 — Ám Sát Lưu |
| 大蛇之力 | Đại Xà Chi Lực | SECT8 — Orochi |

---

### Nguồn chính đã đọc
- `config/ConfigValue.lua` — BV_RarityF (53-64), BV_RarityF_Old (65-76), BV_FixedFA/B/C (28-42), BV_HeroStarF/EquipStarF (43-52), BV_AdjustF (77-80), BV_AttrValueA/B (82-90), Hero_AtkRate/DefRate/HpRate (13201-13215), Hero_RarityFactor (13216-13227), Hero_RarityMapping (13409-13419)
- `config/HeroBase.lua` — 90 tướng (Rarity/Type/SectType/CombineCost/*Factor)
- `config/HeroStarRate.lua`, `HeroQualityRate.lua`, `HeroStarBase.lua` — bảng sao/phẩm/chi phí
- `snk/gameplay/develop/model/hero/HeroAttributeFormula.lua` (getBasicAttNumByType) & `HeroCombatFormula.lua` (:5, getHeroCombat) — công thức
- `config/Translate_1.lua` (66127-66138: 攻防技; 66121-66145: Tổ Hợp; 87931-88133 & 69935-69949 & 87287-87421: Sect_N_Name), `Translate_2.lua` (5065-5290: nhãn độ hiếm; 64785-64816: tên SECT)
- `config/DrawCard.lua` — chi phí chiêu mộ · `config/SectMain.lua`/`SectPosture.lua` — hệ 封神之路 · `config/HeroReborn.lua` — 元神
- `data/i18n/tm.json` — bản Việt hoá + cẩm nang gốc trong game (khắc chế, Tinh Mạch, meta, đội hình, nạp)

---

> ## Độ tin cậy
>
> **Đã kiểm chứng khớp 100% với source (giữ nguyên):**
> - Toàn bộ 6 bậc độ hiếm + 2 bảng hệ số: `Hero_RarityFactor` (0.95/1.0/1.2/1.44/1.728/2.0736) và `BV_RarityF` (1.0/1.05/1.1/1.15/1.2/1.2), kể cả bảng `_Old` — khớp `ConfigValue.lua`.
> - Phân bố tướng: R=6, SR=11, SR+=23, SSR=17, UR=16, SP=17 = 90; Hệ DPS=30/TANK=26/GANK=34; SECT1-8 = 11/10/11/12/12/11/12/11. Đếm chính xác từ khoá top-level `HeroBase.lua`.
> - 8 tên SECT, chữ 攻/防/技, câu khắc chế, quy tắc BOSS phó bản giảm công/thủ — khớp `Translate` + `tm.json` nguyên văn.
> - Bảng sao/phẩm, công thức chỉ số (`factor1×factor2+baseValue`), công thức Lực Chiến, hằng số Công=1/Thủ=0.4/Máu=12, ví dụ H043 — khớp source.
> - Meta hero (Rarity/Type/Sect của K', Ukyo, Leona, Iori, Kula, Haohmaru, Robert, Mary, Nakoruru, Kyo, Daimon, Mature/Vice) — khớp `HeroBase.lua`. Star-vein Vice/Mature/Daimon/Nakoruru, Chiến Hồn Benimaru/Maxima 3★, nạp V4→Nakoruru, V10→Iori, ngày 3→Mai+Mary — khớp nguyên văn cẩm nang trong `tm.json`.
>
> **Đã SỬA so với bản nháp:**
> 1. **Bỏ số bịa:** "K cần ~700 lượt", "Ukyo ~200-300 lượt", "K kèm Kula / ra ở Túi Phúc Bí Ẩn" — KHÔNG có trong source. Cẩm nang chỉ nói bảo hiểm **150 mảnh** và pool có 2 SSR (Ukyo + K). Kula/Haohmaru là **thưởng đua Lực Chiến**, không nằm pool.
> 2. **§4 hộp cảnh báo viết lại:** danh sách "街斗/兵刃/功夫/忍术/古武/超能/摔投/元素" là **bịa** (không có trong game). Thực tế `SectMain.lua` (封神之路) dùng **đúng 8 tên Lưu Phái** SECT1-8 — cùng hệ, khác tầng.
> 3. **援护 = Yểm Trợ** (không phải "Viện Hộ") và **升级 = Nâng Cấp** — theo `tm.json`.
> 4. **Quality 1→7** (không phải 1→5): keys tới "70", QualityFactor đỉnh 49, QualityBaseValue đỉnh 7900. Bổ sung dòng phẩm 60/70 và điền QualityFactor phẩm 53 = 37.
> 5. **§2.2a** sửa câu "SP gấp ~2.18 lần SR" → SP gấp ~2.07 lần SR (÷1.0) / ~2.18 lần R (÷0.95).
> 6. **§8.1 Đội Lửa** sửa roster đúng cẩm nang: thêm **Chin (陈国汉)**, bỏ **Iori** khỏi đội Lửa thuần (Iori thuộc đội Chảy Máu/Thiêu Đốt); nêu rõ đội thiêu trộn Chris (SECT8).
> 7. **Nhãn độ hiếm** sửa nguồn: SR+ = `Hero_Rarity_SRP` (`Translate_2.lua:5258`), SP = `Hero_Rarity_SP` (`:5290`); bỏ trích dẫn sai `ConfigValue.lua:15244-15250`.
> 8. **CombineCost** bổ sung ngoại lệ: SR có 2 tướng cc=20 (Benimaru H002, Athena H013).
> 9. **§7.1** chi phí rút thẻ nêu dải thật theo banner (168-300 đơn / 1500-3000 mười), không cố định 168/1500.
> 10. **H029/H030** điền Hệ = 攻 Đả (bản nháp để trống); buff Yuri sửa thành "cho các tướng nữ trong đội" (không giới hạn đồng phái).
>
> **Chưa chắc / chưa tìm được trong source (cần bắt thêm dữ liệu in-game):**
> - Tên hiển thị chính thức của chế độ synergy: config dùng prefix nội bộ `AutoChess` nhưng KHÔNG có chuỗi `自走棋` trong `tm.json` — nên bài dùng "Tổ Hợp (组合)" thay vì khẳng định tên "Auto-Chess".
> - Con số % chính xác của mỗi mốc Tổ Hợp (${power}%) và số tướng ngưỡng ${num1}/${num2} — nằm ở config Auto-Chess chưa trích số cụ thể.
> - Cơ chế pity chi tiết (đúng bao nhiêu lượt = 150 mảnh) — cẩm nang chỉ nói định tính "rút đủ số lần".
> - Dòng "cấp Chiến Hồn 135" trong công thức Lực Chiến là chép nguyên từ mô tả code (`战魂135总等级`); ý nghĩa "135" chưa giải mã.