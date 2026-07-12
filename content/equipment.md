# Trang Bị (装备)

I have verified every number and mechanism against the source. The draft is largely accurate, but I found several real errors (hero identity, the Phẩm 60 cost attribution, a cost-label ambiguity, and one citation) plus a missing mechanism (the awaken relation-skill). Here is the corrected final wiki.

---

# Trang Bị (装备 · Trang Bị)

> Hệ thống trang bị của mỗi **Võ Sĩ** (格斗家 · `Võ Sĩ`) trong KOF98. Mỗi Võ Sĩ mang **1 bộ 4 món** riêng, mỗi món nâng cấp qua 4 trục độc lập: **Nâng Phẩm** (装备升品 · `Nâng Phẩm Trang Bị`), **Thăng Sao** (装备升星 · `Thăng Sao Trang Bị`), **Thức Tỉnh** (装备觉醒 · `Thức Tỉnh Trang Bị`) và **Tẩy Luyện** (装备洗练 · `Tẩy Luyện Trang Bị`). Đây là một trong những nguồn **Lực Chiến** (战力 · `Lực Chiến`) lớn nhất của account.
>
> Nguồn dữ liệu: `config/HeroEquipBase.lua`, `config/HeroEquipQuality.lua`, `config/HeroEquipRefine.lua`, `config/HeroRelation.lua`, `config/ConfigValue.lua`, `config/Item.lua`, và logic `snk/gameplay/develop/model/hero/equip/EuipRefineAttribute.lua`. Mọi con số đều trích trực tiếp (kèm `file:dòng`).

---

## 1. Nó là gì — cấu trúc "bộ 4 món"

Mỗi Võ Sĩ có đúng **4 ô trang bị**. Bốn ô ứng với `Type = 1..4` trong config (`ConfigValue.lua:9008` `RelationEquipName1..4`):

| Ô | Type | Tên Trung | Tên Việt | Thuộc tính từ 4 slot Tẩy Luyện |
|---|---|---|---|---|
| E1 | 1 | 武器 | **Vũ Khí** | Công (ATK) · Thủ (DEF) · Công % · Tăng Sát Thương |
| E2 | 2 | 衣服 | **Trang Phục** | Sinh Mệnh (HP) · Thủ · Thủ % · Giảm Sát Thương |
| E3 | 3 | 绝学 | **Tuyệt Học** | Sinh Mệnh · Công · Sinh Mệnh % · Kháng Bạo Kích |
| E4 | 4 | 纹章 | **Vân Chương** | Thủ (DEF) · Sinh Mệnh · Đỡ Đòn · Kháng Hiệu Ứng |

*(Bảng thuộc tính đọc từ `HeroEquipRefine.lua`: E1 = `HER_E1_*_1..4` = ATK/DEF/ATK_RATE/HURTRATE, dòng 4–143; E2 = HP/DEF/DEF_RATE/UNHURTRATE, dòng 144–283; E3 = HP/ATK/HP_RATE/UNCRITRATE, dòng 284–423; E4 = DEF/HP/BLOCKRATE/UNEFFECTRATE, dòng 424–563. Tên Việt các ô lấy từ `data/i18n/tm.json`.)*

**Về "bộ" (set):** không có set-bonus kiểu "mặc đủ 4 món cộng gộp". Thay vào đó **mỗi món có một kỹ năng Cộng Hưởng (`Type = "EQUIP"`) riêng**, mở khoá theo cấp **Thức Tỉnh của chính món đó** (xem §4). Ví dụ E1 của Kyo → `H001_R4` (`HeroRelation.lua:8572`), E2 → `H001_R5` (`:8611`).

### Độ hiếm trang bị (品质 · `Phẩm Chất`)

Trang bị của mỗi Võ Sĩ thuộc một trong 6 bậc hiếm. Cùng một Phẩm, bậc hiếm càng cao thì chỉ số nền càng lớn. Đo tại **Phẩm 60**, ATK nền của ô Vũ Khí (`HeroEquipQuality.lua`):

| Độ hiếm | Prefix | ATK nền @Phẩm60 | Hệ số so với R | Node _60 (file:dòng) |
|---|---|---|---|---|
| R | `R_1_*` | 2520 | ×1.00 | `:781` |
| SR | `SR_1_*` | 2646 | ×1.05 | `:4165` |
| SR+ | `SRP_1_*` | 2772 | ×1.10 | `:7549` |
| SSR | `SSR_1_*` | 2898 | ×1.15 | `:10933` |
| UR | `UR_1_*` | 3024 | ×1.20 | `:14317` |
| SP | `SP_1_*` | 3150 | ×1.25 | `:17701` |

Mỗi bậc hiếm = **+5% chỉ số nền** (đều cách nhau đúng +126 ATK). Điểm chuỗi bắt đầu (node _10): R `:4`, SR `:3389`, SR+ `:6773`, SSR `:10157`, UR `:13541`, SP `:16925`.

*(Lưu ý: bậc hiếm được gán cứng cho từng Võ Sĩ. Ví dụ ô Vũ Khí của Kyo — `H001_E1` — có `EquiplQualityId = "SR_1_10"`, tức chạy chuỗi Phẩm bậc SR, `HeroEquipBase.lua:9`.)*

---

## 2. Nâng Phẩm (装备升品 · `Nâng Phẩm Trang Bị`)

Trục chính tăng chỉ số nền + **cổng cấp account** (`PlayerLevelLimit`). Đây là "khung xương": Phẩm càng cao thì trần các trục khác (nhất là Tẩy Luyện) càng mở rộng.

**Cơ chế:** mỗi Phẩm là một node trong chuỗi `NextQuality`. Muốn lên Phẩm kế phải (1) đạt **`PlayerLevelLimit`** cấp account, (2) đủ Vàng + Bảo Thạch (宝石) + Bản Vẽ (图纸) + đôi khi Kim Cương.

`Quality` = số 2 chữ: **hàng chục = bậc phẩm** (1→6), **hàng đơn vị = `QualityLevel` (阶 con)**. Chuỗi Phẩm chuẩn ô Vũ Khí (`HeroEquipQuality.lua:4–787`):

| Phẩm | QualityLevel | **Cấp account (PlayerLevelLimit)** | Cấp trang bị | Dòng |
|---|---|---|---|---|
| 10 | 0 | **1** | 10 | :7 |
| 20 | 0 | **9** | 15 | :34 |
| 21 | 1 | **16** | 20 | :64 |
| 22 | 2 | **20** | 24 | :94 |
| 30 | 0 | **24** | 28 | :134 |
| 31 | 1 | **28** | 32 | :174 |
| 32 | 2 | **32** | 36 | :214 |
| 33 | 3 | **36** | 40 | :254 |
| 40 | 0 | **40** | 44 | :294 |
| 41–44 | 1–4 | **44 / 48 / 51 / 54** | 48 / 51 / 54 / 57 | :334–454 |
| 50 | 0 | **57** | 60 | :494 |
| 51–56 | 1–6 | **60 / 63 / 66 / 69 / 72 / 75** | 63 / 66 / 69 / 72 / 75 / 78 | :534–734 |
| **60** | 0 | **200** (endgame, khoá thực tế) | 117 | :774 |

**Điểm mấu chốt:**
- Trần cày được thực tế là **Phẩm 56 @ account Lv75**. **Phẩm 60 bị chốt `PlayerLevelLimit = 200`** (`:774`) — là bậc "treo" cho tương lai/sự kiện.
- Cấp trang bị tối đa = **117** (`ConfigValue.lua:12478` `Equip_LevelLimit = 117`), trùng cấp của Phẩm 60 (`:778`).

**Chi phí Nâng Phẩm (ô Vũ Khí, chuỗi `R_1_*`):**

| Nguyên liệu | Đạt Phẩm 56 (trần cày thực) | Đạt Phẩm 60 (toàn chuỗi) |
|---|---|---|
| Vàng (金币 · `Vàng`, `IR_Gold`) | **3.690.000** | **4.590.000** |
| Kim Cương (`Diamond.HERO_QUALITY`) | **3.860** | **4.260** |
| Bảo Thạch (宝石 · `Bảo Thạch`, `IM_QS***`) | ~**1.268** viên | ~**1.628** viên |
| Bản Vẽ Trang Bị (图纸 · `IM_EquipUp**`) | **35** tờ | **41** tờ |

Bảo Thạch chia **3 nhánh Công / Thủ / Kỹ Năng** (`IM_QS**1/**2/**3`), lên bậc màu theo Phẩm — ví dụ `IM_QS201` = 翡翠攻击宝石 (Bảo Thạch Công bậc Phỉ Thúy, `Item.lua:62289`). Bản Vẽ gồm nhiều loại (`IM_EquipUp21` = 精英装备图纸Ⅱ / Bản Vẽ Tinh Anh, `Item.lua:531`) → lên bậc theo Phẩm.

> **Bước Phẩm 56 → 60** trả tại node `R_1_56` (`HeroEquipQuality.lua:748–768`): **900.000 Vàng + 400 Kim Cương + `IM_EquipUp60` ×6 + `IM_QS601/602/603` ×120 mỗi loại** (=360 Bảo Thạch bậc 6). Node `R_1_60` (dòng 771–787) **rỗng hoàn toàn** (`ItemList = {}`, `Diamond = {}`) — chỉ là node cuối, không tốn thêm gì ngoài việc bị chốt account Lv200.

> **Ví dụ 1 node** (Phẩm 21, `HeroEquipQuality.lua:61–89`): cần `IR_Gold 5000` + `IM_EquipUp22 ×1` + `IM_QS211 ×3`, mở ở account Lv16, đưa ATK nền lên `{54, 2.7}`.

---

## 3. Thăng Sao (装备升星 · `Thăng Sao Trang Bị`)

**Tối đa 30 sao** (`ConfigValue.lua:12435` `Equip_StarCondition` có 30 mục). Mỗi lần Thăng Sao tốn **Đá Thức Tỉnh** (觉醒石 · `Đá Thức Tỉnh`, `id = IM_RichStone`, `Item.lua:57485` CN=觉醒石) — vật liệu thành trưởng lõi **dùng chung** cho cả Trang Bị lẫn **Chiến Hồn** (战魂 · `Chiến Hồn`).

Sao cộng chỉ số theo **2 phần** (ví dụ `H001_E1`, ô Vũ Khí):
- **Hệ số sao `StarRate`** (`HeroEquipBase.lua:100–133`): nhân thêm % lên chỉ số nền, từ 0 → **+100% ở sao 30** (`ATK = {0, 0.02, …, 1}`).
- **Giá trị nền `StarBasic`** (`HeroEquipBase.lua:149–183`): cộng thẳng, từ 0 → **+10.000 ATK ở sao 30**.

**Chi phí Thăng Sao (Đá Thức Tỉnh, `HeroEquipBase.lua:23–58`):** chuỗi 30 mốc `1, 3, 5, 10, 15, 20, 25, 30, 35, 40, 50×5, 60×5, 70×5, 80×5`.

| Mốc sao | Tổng Đá Thức Tỉnh |
|---|---|
| Sao 0 → 10 | **184** |
| Sao 0 → 15 | **434** |
| Sao 0 → 20 | **734** |
| **Sao 0 → 30 (max)** | **1.484** |

**Cổng khoá liên hoàn Sao ↔ Thức Tỉnh** (rất quan trọng): để lên **Sao 11 phải đạt Thức Tỉnh 2** (`ConfigValue.lua:12449` — mục thứ 11 của `Equip_StarCondition` ghi `Awaken = 2`). Sao và Thức Tỉnh phải cày xen kẽ, không thể dồn hết một trục.

---

## 4. Thức Tỉnh (装备觉醒 · `Thức Tỉnh Trang Bị`)

**Tối đa 3 cấp** (`ConfigValue.lua:12420` `Equip_AwakenCondition` có 3 mục). Thức Tỉnh đổi ngoại hình trang bị (`AwakenEquipIcon`, `HeroEquipBase.lua:141`) và **mở khoá kỹ năng Cộng Hưởng của món** (装备技).

**Cơ chế kỹ năng:** mỗi cấp Thức Tỉnh (nội bộ gọi `EQUIPEVOLVE`) mở 1 kỹ năng trong entry `HeroRelation` `Type = "EQUIP"` của món đó. Ví dụ ô Vũ Khí Kyo `H001_R4` (`HeroRelation.lua:8594–8609`): 3 kỹ năng `SK_Relation_H001_R4_1/2/3`, `Condition` lần lượt `EQUIPEVOLVE = 1 / 2 / 3`. Vậy Thức Tỉnh 1/2/3 = mở lần lượt 3 kỹ năng đó.

**Cổng khoá theo Sao** (`ConfigValue.lua:12423–12433`):

| Cấp Thức Tỉnh | Yêu cầu Sao |
|---|---|
| Thức Tỉnh 1 | Sao ≥ **3** |
| Thức Tỉnh 2 | Sao ≥ **6** |
| Thức Tỉnh 3 | Sao ≥ **15** |

**Chi phí Thức Tỉnh** khác nhau theo ô:
- **Ô Vũ Khí (E1)** dùng **hồn vũ khí riêng của Võ Sĩ**. Ví dụ Kyo: `IM_H001_E1` = 草薙剑之魂 (**Hồn Kiếm Kusanagi**, `Item.lua:69907`), số lượng `{3, 3, 3}` — mỗi cấp 3 viên, tổng **9** (`HeroEquipBase.lua:13–22`).
- **Ô Trang Phục (E2)** tiêu **Đá Thức Tỉnh** `{3, 10, 30}` — tổng **43** (`HeroEquipBase.lua:194–202`).

Vật liệu hồn vũ khí thường rơi từ rương theo Võ Sĩ (xem §7).

---

## 5. Tẩy Luyện (装备洗练 · `Tẩy Luyện Trang Bị`)

Trục "đánh bạc" chỉ số phụ. Mỗi món có **4 ô Tẩy Luyện** (danh sách `HeroEquipRefineId`, `HeroEquipBase.lua:135–140`). Vật liệu: **Kết Tinh Tẩy Luyện Trang Bị** (装备洗练结晶 · `Kết Tinh Tẩy Luyện Trang Bị`).

### 4 ô mở dần theo Sao

Mỗi ô mở ở một mốc Sao (`UnlockCondition.star`, `HeroEquipRefine.lua`):

| Ô Tẩy Luyện | Mở ở Sao | Thuộc tính (ô Vũ Khí) | Dòng |
|---|---|---|---|
| Slot 1 | **Sao 0** | Công (ATK) | `:27` |
| Slot 2 | **Sao 3** | Thủ (DEF) | `:62` |
| Slot 3 | **Sao 5** | Công % (ATK_RATE) | `:97` |
| Slot 4 | **Sao 8** | Tăng Sát Thương (HURTRATE) | `:132` |

### Công thức TRẦN chỉ số Tẩy Luyện (chính xác từ code)

`EuipRefineAttribute.lua:53`:
```
attrLimit = InitiaLimit + getLimitByEquipQualityLimit(quality, EquipQualityLimit)
```
- **`InitiaLimit`** = trần cơ bản khi Phẩm < 52.
- **`EquipQualityLimit`** = bảng cộng thêm trần, **chỉ kích hoạt từ Phẩm 52 trở lên** (`getLimitByEquipQualityLimit`, `:56–81` — lấy mốc phẩm cao nhất ≤ phẩm hiện tại; phẩm < 52 → cộng 0).

Ví dụ ô Vũ Khí bậc R, thuộc tính **ATK** (`HER_E1_R_1`, `HeroEquipRefine.lua:4–37`): `InitiaLimit = 360`; bảng `EquipQualityLimit`:

| Phẩm trang bị | Trần ATK Tẩy Luyện |
|---|---|
| < 52 | **360** |
| 52 | 360 + 720 = **1.080** |
| 53 | 360 + 1.800 = **2.160** |
| 54 | 360 + 2.880 = **3.240** |
| 55 | 360 + 3.960 = **4.320** |
| 56 | 360 + 5.400 = **5.760** |
| 60 | 360 + 6.840 = **7.200** |

→ Đây là lý do game báo *"Toàn bộ thuộc tính đã đầy, vui lòng nâng phẩm chất trang bị để đột phá giới hạn"* (全部属性已满，请升级装备品质突破上限 — `Translate_1.lua:43620`). **Muốn Tẩy Luyện cao hơn phải Nâng Phẩm trước.**

**Cơ chế roll:** biên độ mỗi lần Tẩy Luyện là `AttrRefineInterval = {-1.4, 0.85}` (`HeroEquipRefine.lua:23`); giá trị roll được lấy ngẫu nhiên tới trần `attrLimit` (`EuipRefineAttribute.lua:118–128`, `math.random(..., attrLimit)`). Bậc hiếm cao hơn có trần lớn hơn — ví dụ SSR ATK `InitiaLimit = 600` (`HER_E1_SSR_1`, `HeroEquipRefine.lua:1691`).

---

## 6. Đóng góp Lực Chiến (战力)

Tổng chỉ số một món ≈ **(nền Phẩm × [1 + StarRate]) + StarBasic + Tẩy Luyện**, cộng thêm kỹ năng Cộng Hưởng mở qua Thức Tỉnh; rồi quy đổi ra Lực Chiến qua công thức chiến lực chung (nằm ở tầng combat, **không** trong các file config này — chưa xác minh được số quy đổi). Cả 4 trục đều cộng Lực Chiến; game quảng bá **Tẩy Luyện** là nguồn tăng chỉ số qua **Trận Vinh Quang** (荣耀之战 · `Trận Vinh Quang`, `Translate_1.lua:43628`).

---

## 7. Cách kiếm nguyên liệu

| Nguyên liệu (Trung → Việt) | Dùng cho | Nguồn kiếm |
|---|---|---|
| 金币 **Vàng** | Nâng Phẩm | mọi hoạt động thường nhật |
| 觉醒石 **Đá Thức Tỉnh** (`IM_RichStone`) | Thăng Sao + Thức Tỉnh ô E2/E3/E4 | rương Đá Thức Tỉnh, sự kiện; **dùng chung với Chiến Hồn** |
| 宝石 **Bảo Thạch** (`IM_QS***`) | Nâng Phẩm | ải / cửa hàng, theo bậc màu (翡翠 Phỉ Thúy → …) |
| 图纸 **Bản Vẽ Trang Bị** (`IM_EquipUp**`) | Nâng Phẩm | ải, đổi cửa hàng (Tinh Anh 精英 → bậc cao hơn) |
| ***之魂** **Hồn vũ khí Võ Sĩ** (`IM_H###_E1`) | Thức Tỉnh ô Vũ Khí | rương vũ khí theo Võ Sĩ (VD Hồn Kiếm Kusanagi của Kyo) |
| 装备洗练结晶 **Kết Tinh Tẩy Luyện** | Tẩy Luyện | **Trận Vinh Quang** (荣耀之战, `Translate_1.lua:43628`) |
| 钻石 **Kim Cương** | Nâng Phẩm bậc cao | nạp / phần thưởng |

---

## 8. Mẹo tối ưu

1. **Nâng Phẩm bám sát cấp account.** Mỗi node chốt `PlayerLevelLimit`, nên đây là trục "miễn phí trần" — luôn đẩy Phẩm tối đa cho phép trước khi đổ tài nguyên vào Tẩy Luyện. Trần Tẩy Luyện chỉ bung ở **Phẩm 52/53/54/55/56**; dưới 52 thì Tẩy Luyện gần như "cứng" ở `InitiaLimit`.
2. **Đừng dồn hết Sao rồi mới Thức Tỉnh.** Sao 11 khoá cứng bởi Thức Tỉnh 2, mà Thức Tỉnh 2 cần Sao 6. Cày xen kẽ: Sao 3 → TT1 → Sao 6 → TT2 → Sao 11 → Sao 15 → TT3.
3. **Ưu tiên ô Vũ Khí (E1) và Trang Phục (E2).** E1 cho Công + Công % (đánh), E2 cho Sinh Mệnh + Giảm Sát Thương (trụ).
4. **Chia sẻ Đá Thức Tỉnh với Chiến Hồn.** `IM_RichStone` là tài nguyên chung; khi kẹt trần Nâng Phẩm, có thể dồn sang **Chiến Hồn** (đòn bẩy Lực Chiến free tốt hơn) rồi quay lại Thăng Sao sau.
5. **Tẩy Luyện chỉ khi đã ở Phẩm 52+.** Tẩy sớm = phí vật liệu vì trần thấp; sau khi phá trần bằng Nâng Phẩm mới re-roll để "ăn" giá trị cao.
6. **Phẩm 60 là bẫy tài nguyên.** Bước 56→60 ngốn 900.000 Vàng + 400 Kim Cương + 360 Bảo Thạch bậc 6 + 6 Bản Vẽ bậc 60, mà bị khoá account Lv200 — bỏ qua cho tới khi có nguồn dư/sự kiện.

---

## 9. Mini-Glossary (Trung → Việt)

| Trung | Hán-Việt | Nghĩa |
|---|---|---|
| 装备 | **Trang Bị** | Equipment |
| 格斗家 | **Võ Sĩ** | Nhân vật |
| 品质 | **Phẩm Chất** | Bậc hiếm/quality |
| 装备升品 | **Nâng Phẩm Trang Bị** | Nâng bậc phẩm |
| 装备升星 | **Thăng Sao Trang Bị** | Nâng sao |
| 装备觉醒 | **Thức Tỉnh Trang Bị** | Awaken |
| 装备洗练 | **Tẩy Luyện Trang Bị** | Re-roll chỉ số phụ |
| 装备洗练结晶 | **Kết Tinh Tẩy Luyện Trang Bị** | Vật liệu Tẩy Luyện |
| 觉醒石 | **Đá Thức Tỉnh** (`IM_RichStone`) | Vật liệu Thăng Sao (lõi) |
| 宝石 | **Bảo Thạch** | Vật liệu Nâng Phẩm |
| 图纸 | **Bản Vẽ Trang Bị** | Vật liệu Nâng Phẩm |
| 武器 / 衣服 / 绝学 / 纹章 | **Vũ Khí / Trang Phục / Tuyệt Học / Vân Chương** | 4 ô trang bị (E1–E4) |
| 战力 | **Lực Chiến** | Combat power |
| 战魂 | **Chiến Hồn** | War-soul (dùng chung Đá Thức Tỉnh) |
| 攻击 / 防御 / 生命 | **Công / Thủ / Sinh Mệnh** | ATK / DEF / HP |
| 伤害提升 / 伤害减免 | **Tăng / Giảm Sát Thương** | HURTRATE / UNHURTRATE |
| 暴击 / 抗暴击 | **Bạo Kích / Kháng Bạo Kích** | CRIT / UNCRITRATE |
| 格挡 / 效果抵抗 | **Đỡ Đòn / Kháng Hiệu Ứng** | BLOCKRATE / UNEFFECTRATE |
| 荣耀之战 | **Trận Vinh Quang** | Nguồn Kết Tinh Tẩy Luyện |

---

**Tóm tắt hằng số cốt lõi:** Sao tối đa **30** (`ConfigValue.lua:12435`) · Thức Tỉnh tối đa **3** cấp (`:12420`) · Cấp trang bị tối đa **117** (`:12478`) · 4 ô Tẩy Luyện mở ở Sao **0/3/5/8** (`HeroEquipRefine.lua`) · Trần Tẩy Luyện bung từ **Phẩm 52** (`EuipRefineAttribute.lua:53`) · Sao 11 cần Thức Tỉnh 2, Thức Tỉnh 1/2/3 cần Sao 3/6/15 (`ConfigValue.lua:12423–12449`) · Thức Tỉnh 1/2/3 mở kỹ năng Cộng Hưởng qua `EQUIPEVOLVE` (`HeroRelation.lua`) · 6 bậc hiếm R→SP cách nhau **+5%** chỉ số nền.

---

> ## Độ tin cậy
>
> **Đã kiểm chứng khớp 100% với source (giữ nguyên trong bản nháp):**
> - Bảng `PlayerLevelLimit` toàn chuỗi Phẩm 10→60 và cấp trang bị (`HeroEquipQuality.lua`, đã đọc từng node). Phẩm 60 = account Lv200, cấp 117 — đúng.
> - 6 bậc hiếm cách nhau +5%: R/SR/SR+/SSR/UR/SP = 2520/2646/2772/2898/3024/3150 @Phẩm60 — đọc từng node _60, đúng.
> - Chi phí Thăng Sao Đá Thức Tỉnh (chuỗi `1,3,5,…,80×5`) và các mốc 184/434/734/**1.484** — đúng.
> - Trần Tẩy Luyện ATK bậc R (360 → 7.200 theo Phẩm) + công thức `InitiaLimit + EquipQualityLimit` (kích hoạt từ Phẩm 52) — đúng.
> - Sao max 30, Thức Tỉnh max 3, cấp max 117; cổng Sao 11↔TT2, TT1/2/3↔Sao 3/6/15 — đúng.
> - `IM_RichStone` = 觉醒石 (Đá Thức Tỉnh), dùng chung Chiến Hồn — đúng (`Item.lua:57504`).
> - Toàn bộ thuật ngữ Hán-Việt khớp bản dịch chính thức game (`data/i18n/tm.json`): Nâng Phẩm Trang Bị / Thăng Sao / Thức Tỉnh / Tẩy Luyện / Trận Vinh Quang / Vũ Khí-Trang Phục-Tuyệt Học-Vân Chương / Đá Thức Tỉnh / Kết Tinh Tẩy Luyện.
> - Tổng Vàng chuỗi R = **4.590.000**, Kim Cương = **4.260** — số đúng, chỉ nhãn bị lệch (xem dưới).
>
> **ĐÃ SỬA (sai/bịa trong bản nháp):**
> 1. **`H001` KHÔNG phải K'** — mà là **Kyo Kusanagi (草薙京)**. `IM_H001_E1` = 草薙剑之魂 = Hồn Kiếm Kusanagi (`Item.lua:69907`; `Heritage_H001_Name = "草薙京像"`, `Translate_1.lua:85417`; `tm.json`: 草薙京 = "Kyo Kusanagi"). Đổi tên hồn vũ khí "Thảo Trĩ Kiếm Chi Hồn" → **Hồn Kiếm Kusanagi** cho khớp cách game gọi Kyo.
> 2. **Nhãn chi phí "Phẩm 10 → 56" sai phạm vi.** Số 4.590.000 Vàng / 4.260 Kim Cương là **toàn chuỗi tới Phẩm 60** (đã gồm bước 56→60). Đạt riêng Phẩm 56 = **3.690.000 Vàng / 3.860 Kim Cương**. Đã tách thành 2 cột.
> 3. **"Bước Phẩm 60 tốn 0 Vàng / 0 Kim Cương" sai.** Vật liệu `IM_QS601/602/603 ×120` + `IM_EquipUp60 ×6` nằm ở node **`R_1_56`** (`:748–768`), là bước **56→60**, và bước đó **có** 900.000 Vàng + 400 Kim Cương. Node `R_1_60` (`:771`) mới là node rỗng (0 cost). Citation cũ `:772` sai. Đã viết lại.
> 4. **Citation Trận Vinh Quang** `Translate_1.lua:43626` → **`:43628`** (dòng chứa 荣耀之战 + 装备洗练结晶).
> 5. **Citation ATK @Phẩm60** trong bảng bậc hiếm chỉ vào node _10 (điểm bắt đầu chuỗi); giá trị @Phẩm60 nằm ở node _60 — đã đổi sang dòng node _60 (781/4165/7549/10933/14317/17701). "R_1_60 tại dòng 772" → ATK ở `:781`.
> 6. **Bổ sung:** đếm lại Bảo Thạch (~1.628 viên tới Phẩm 60 / ~1.268 tới Phẩm 56) và Bản Vẽ (41 / 35 tờ) thay cho "hàng trăm / ~40" mơ hồ.
>
> **BỔ SUNG mới (nội dung thiếu trong bản nháp):**
> - **Cơ chế kỹ năng Cộng Hưởng của trang bị** (phần "bộ/set" mà đề bài hỏi): mỗi món có entry `HeroRelation` `Type="EQUIP"` với 3 kỹ năng mở theo `EQUIPEVOLVE = 1/2/3` (= 3 cấp Thức Tỉnh). Ví dụ Kyo E1 → `H001_R4`, kỹ năng `SK_Relation_H001_R4_1/2/3` (`HeroRelation.lua:8594–8609`). Đây là "装备技" mà §4 nhắc tới, nay có nguồn code chính xác. **Không có set-bonus gộp 4 món** — chỉ có kỹ năng riêng từng món theo Thức Tỉnh.
>
> **Chưa chắc / ngoài phạm vi config đã đọc:**
> - **Công thức quy đổi Lực Chiến** không nằm trong các file này (ở tầng combat) — §6 chỉ nêu cách chỉ số cộng dồn, không có hệ số quy đổi. Chưa đo được.
> - **Tên bậc màu Bảo Thạch / bậc Bản Vẽ cao** (墨绿/碧玉…, "Cao Thủ"): mới xác nhận 翡翠 (Phỉ Thúy) và 精英 (Tinh Anh); các bậc cao hơn chưa liệt kê hết từ `Item.lua` nên chỉ ghi "trở lên".
> - **Nội dung 3 kỹ năng Cộng Hưởng** (`ERelation0..3_Desc`, `SK_Relation_*`) chưa mở ra để đọc hiệu ứng cụ thể — chỉ xác nhận có 3 cấp gắn với Thức Tỉnh 1/2/3.