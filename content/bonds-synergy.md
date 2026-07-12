# Liên kết & Cộng hưởng

Tôi đã kiểm chứng toàn bộ source. Dưới đây là bản cuối đã sửa.

---

# 🔗 Liên Kết & Cộng Hưởng — KOF98 (Hệ thống Lực Chiến/联动)

> Trang này gom mọi cơ chế "nhiều nhân vật / thẻ / vũ khí cộng hưởng với nhau để tăng sức mạnh" trong game: **Chiến Bài (战牌)**, **Lưu Phái (流派)**, **Phe (阵营)**, **Duyên / Liên Kết (羁绊 / 命运羁绊)**, **Duyên Vũ Khí (武器缘)** và phân loại **Đả / Thủ / Kĩ (攻/防/技)**. Mọi con số đều trích trực tiếp từ config gốc (`reference/client-src/config`), ghi rõ `file:dòng`.

## ⚠️ Đọc trước — hiểu lầm phổ biến nhất

Nhiều người nghĩ **đội hình chính (Võ Sĩ ra trận) có bond "3 người cùng hệ → cộng Lực Chiến"** giống các game gacha khác. **KOF98 KHÔNG có bond đó ở đội hình chính.**

- Cơ chế "**3 thẻ cùng hệ → cộng chỉ số**" chỉ tồn tại trong minigame **战牌 (Chiến Bài)**, tính theo từng **hàng 3 ô**, KHÔNG áp lên đội đánh thật. Xem [Mục 1](#1).
- Ở **đội hình chính**, hiệu ứng "cùng lưu phái" **không phải bond đội hình tự bật**, mà nằm trong **kỹ năng của từng 战魂 (Chiến Hồn)** — Chiến Hồn tự đếm số Võ Sĩ cùng lưu phái trên sân rồi tăng hiệu ứng. Xem [Mục 2](#2).

Nắm rõ chỗ này để không xếp đội sai kỳ vọng.

---

<a id="1"></a>
## 1. 战牌 — Chiến Bài (nơi thật sự có "3 cùng hệ cộng chỉ số")

**战牌 = Chiến Bài** (`拳魂战牌` = *Chiến Bài Quyền Hồn*, `跨服战牌` = *Chiến Bài Liên Server*, tm.json). Đây là minigame đấu thẻ riêng, tách hoàn toàn khỏi đội đánh chính. Bạn xếp thẻ tướng lên **bàn 4 hàng × 3 ô = 12 ô** (`ConfigValue.lua:5887` `AutoChessSolt_Group = 4`; `:5892` `AutoChessSolt_GroupNum = 3`; vòng lặp `deskIndex = 1..4`, `slotIndex = 1..3` tại `AutoChessCardDesk.lua:165–171`).

### 1.1. Mỗi thẻ có 2 nhãn: HỆ (SectType) và LOẠI (Type)

`AutoChessLib.lua` chứa **57 thẻ (57 tướng khác nhau, sao 1–5)**. Mỗi thẻ mang (ví dụ thẻ Kyo `AutoChessH001_1`, `AutoChessLib.lua:4–24`):

| Trường | Ví dụ | Ý nghĩa |
|---|---|---|
| `SectType` | `"SECT1"` | **Hệ / Lưu Phái** (SECT1–SECT8, xem [Mục 2](#2)) |
| `Type` | `"DPS"` | **Loại / Định vị** = Đả/Thủ/Kĩ (xem [Mục 5](#5)) |
| `Star` | `1` | Sao thẻ (1–5) |
| `GameCombat` | `1000` | Lực chiến thẻ trong ván thường |
| `GameGoldCombat` | `2500` | Lực chiến thẻ khi "vàng hoá" |
| `ChessData` / `ExtraAttr` | danh sách skill | Bộ chỉ số/skill thẻ cấp cho tướng |

### 1.2. Hai loại cộng hưởng — tính RIÊNG cho từng hàng

Toàn bộ logic ở hàm `AutoChessCardDesk:checkGroupEffect()` (`AutoChessCardDesk.lua:162–256`). Với mỗi hàng, hệ thống cộng dồn biến `addNum` từ **2 nguồn**:

**(A) Cộng hưởng theo LOẠI/vị trí — `GroupUp`** (`AutoChessCardDesk.lua:200–204`)
Mỗi hàng chỉ nhận đúng loại thẻ quy định (`ConfigValue.lua:5897–5915` `AutoChessSolt_GroupType`):

| Hàng | Loại thẻ được xếp | Cộng khi đủ 3 ô (`AutoChessSolt_GroupUp`, `ConfigValue.lua:5917–5925`) |
|---|---|---|
| Hàng 1 | `DPS` (Đả) | **+30%** |
| Hàng 2 | `TANK` (Thủ) | **+30%** |
| Hàng 3 | `GANK` (Kĩ) | **+30%** |
| Hàng 4 | `DPS` / `TANK` / `GANK` (bất kỳ) | **+30%** |

→ Xếp đủ 3 thẻ **đúng loại** của hàng → **+30% chỉ số** cho cả 3 thẻ trong hàng.

**(B) Cộng hưởng theo HỆ (cùng SectType) — `SectUp`** (`AutoChessCardDesk.lua:206–241`)
Điều kiện (dòng 237): **3 thẻ khác ID nhau** (`cardId1≠cardId2≠cardId3`) nhưng **cùng một hệ** (`sectType1==sectType2==sectType3`). Khi đó cộng thêm `SectUp` lấy theo **phẩm chất THẤP NHẤT** trong 3 thẻ (dòng 224–226, `AutoChessQuality.lua`):

| Phẩm chất thẻ | `SectUp` | Nguồn |
|---|---|---|
| 1 | **0%** | `AutoChessQuality.lua:6` |
| 2 | **0%** | `:11` |
| **3** (xanh dương) | **+30%** | `:24` |
| 4 | **+50%** | `:37` |
| 5 | **+70%** | `:50` |
| 6 | **+70%** | `:63` |
| 7 | **+70%** | `:76` |

Đúng như hai dòng hướng dẫn trong game (bản Việt):
> *"5. Đặt Chiến Bài loại nhất định (Đả/Thủ/Kĩ, đều đạt phẩm chất **xanh dương trở lên**) vào ô thẻ chỉ định, xếp đủ ba thẻ thì nhận cộng thuộc tính thêm!"* — `Translate_1.lua:66045` (rule GroupUp)
> *"6. Trong một nhóm ô nếu có ba Chiến Bài **cùng lưu phái** (đều đạt phẩm **xanh dương trở lên**), cũng nhận cộng thuộc tính thêm!"* — `Translate_1.lua:66049` (rule SectUp)

→ Giải thích vì sao "phẩm lam trở lên": phẩm 1–2 cho `SectUp = 0`, phẩm 3 (xanh dương) mới bắt đầu có bonus.

### 1.3. Hai cộng hưởng CỘNG DỒN → thẻ áp dụng thế nào

`addNum = GroupUp + SectUp`, rồi áp vào chỉ số thẻ theo công thức (`AutoChessCardDesk.lua:110`, trong `AutoChessSlot:rCreateEffect`):
```
config.attrNum = config.attrNum * (1 + addNum)
```
**Ví dụ đỉnh:** Hàng 1 xếp **3 thẻ DPS khác nhau, cùng hệ, phẩm 5** → `0.30 (loại) + 0.70 (hệ) = 1.00` → **chỉ số thẻ × 2 (gấp đôi)**.

> **Lưu ý (đã xác minh trong code):** (A) và (B) độc lập. `isSectFull` (điều kiện của B) chỉ tắt khi có ô trống — **không** kiểm tra đúng-loại-hàng; còn `isSlotFull` (điều kiện của A) đòi đủ 3 ô **và** đúng loại (`AutoChessCardDesk.lua:176–197`). Nên (B) chỉ cần "đủ 3 ô + 3 thẻ khác ID cùng hệ"; muốn ăn thêm (A) thì 3 thẻ phải đúng loại của hàng.

### 1.4. Mở khoá, màn chơi, nguyên liệu

- **Mở ô thẻ (`AutoChessSlot.lua`, theo ngày mở server `UnlockDate`):** ô 1–3 (Nhóm 1) ngày **57**; ô 4–6 (Nhóm 2) ngày **57**; ô 7–9 (Nhóm 3) ngày **58 / 59 / 60**; ô 10–12 (Nhóm 4) ngày **61 / 62 / 63**.
- **Màn PvE:** **12 màn** (`AutoChessGame.lua`), `TargetCombat` (lực chiến cần) tăng dần: màn 1 = **800** → màn 10 = **72.000** → màn 11 = **171.000** → màn 12 = **216.000**; `MaxCurrency` (điểm mua thẻ mỗi màn) đi từ **4 → 25**. Mỗi thẻ ra trận đánh Boss 1 đòn, hạ Boss thì qua màn (`Translate_1.lua:66209`).
- **Nâng cấp thẻ (`战牌合成` = Ghép Chiến Bài):** tiêu **thẻ cùng sao + thẻ trùng** (`AutoChessQuality.lua`): lên phẩm 2–3 cần `SameStarCost=1`+`SameChessCost=1`; phẩm 4 cần `2+2`; phẩm 5 cần `3+3`; phẩm 6 cần `4+4`; phẩm 7 cần `5+5`.

---

<a id="2"></a>
## 2. 流派 — Lưu Phái (8 hệ) & Cộng hưởng qua Chiến Hồn

**流派 = Lưu Phái** (tm.json). Mỗi Võ Sĩ mang đúng **1 lưu phái** ở trường `SectType` trong `HeroBase.lua` (vd Kyo H001 = `SECT1`). Có **8 lưu phái**. Tên hiển thị lấy từ `Sect_x_Name` (đã xác minh từng tên trong `Translate_1.lua`, và **đối chiếu 100% danh sách tướng**: mọi tướng trong `SectMain.lua > Sect_x` đều có `SectType = SECTx` trong `HeroBase.lua`):

| Mã | Trung (tên hiển thị) | Việt (Hán-Việt, tm.json) | Số tướng (SectType, `HeroBase.lua`) | Nguồn tên |
|---|---|---|---|---|
| SECT1 | 炽炎烈火 | **Xí Viêm Liệt Hỏa** | 11 | `Translate_1.lua:87933` |
| SECT2 | 极限武道 | **Cực Hạn Võ Đạo** | 10 | `:87421` |
| SECT3 | 汲血之刃 | **Cấp Huyết Chi Nhận** | 11 | `:88133` |
| SECT4 | 能源掌控 | **Năng Nguyên Chưởng Khống** | 12 | `:69937` |
| SECT5 | 隐秘暗杀 | **Ẩn Bí Ám Sát** | 12 | `:69941` |
| SECT6 | 无双战姬 | **Vô Song Chiến Cơ** | 12 | `:69945` |
| SECT7 | 不屈金刚 | **Bất Khuất Kim Cương** | 12 | `:69949` |
| SECT8 | 大蛇之力 | **Đại Xà Chi Lực** | 11 | `:87289` |

> ⚠️ **Đính chính:** một số hướng dẫn/bản nháp ghi 8 hệ là *街斗 / 兵刃 / 功夫 / 忍术 / 古武 / 超能 / 摔投 / 元素* (Đấu Phố / Binh Khí / Công Phu / Nhẫn Thuật / Cổ Võ / Siêu Năng / Vật Ném / Nguyên Tố). Đây **KHÔNG** phải tên chính thức — chúng đến từ chuỗi thử nghiệm `Sect_x_Catalog_DescTest` (vd `Sect_1_Catalog_DescTest` = *"街斗流派好哇..."*, `Translate_1.lua:885`), tức tên "thể loại/placeholder". Tên hiển thị thật là bảng trên.

Hệ thống tu luyện lưu phái ở `SectMain.lua` (`Sect_1..Sect_8`, mỗi phái có `HeroList`, `Mind` = 心法, `Posture` = 架势; mở ở cấp `ClientLevel = 53`).

### 2.1. Cộng hưởng cùng lưu phái = kỹ năng của Chiến Hồn, KHÔNG phải bond đội hình

Ở đội đánh chính **không có panel "3 cùng phái → cộng Lực Chiến"**. Thay vào đó, **một số 战魂 (Chiến Hồn)** có mệnh đề tự đếm số Võ Sĩ cùng lưu phái trên sân rồi nhân hiệu ứng. Hai ngưỡng gặp trong config:

| Ngưỡng (chữ Trung) | Nghĩa | Hiệu ứng | Nguồn |
|---|---|---|---|
| `同流派格斗家数量大于2` | Cùng phái **> 2** (tức **≥ 3**) | Giá trị **+50%** | `Translate_2.lua:34038` (SK_H007), `35290+` |
| `同流派的格斗家超过3人` | Cùng phái **> 3** (tức **≥ 4**) | Hiệu ứng **nhân đôi (翻倍)** | `Translate_2.lua:35146` (SK_I002); `Translate_4.lua:16566` |

Hướng dẫn trong game (guide `GodGuide_6`, `Translate_1.lua:11226`):
> *"很多战魂在同流派格斗家大于2时，也会出现翻倍或额外增加50%的效果奖励"* — "Nhiều Chiến Hồn khi số Võ Sĩ cùng phái > 2 sẽ nhân đôi hoặc +50% hiệu ứng."

→ **Kết luận:** muốn "combo cùng phái", phải trang bị **đúng Chiến Hồn có mệnh đề `同流派`**, rồi xếp **≥3 (hoặc ≥4) Võ Sĩ cùng lưu phái** ra trận. Cùng phái mà không có Chiến Hồn phù hợp → **không có cộng hưởng nào**.

### 2.2. Ví dụ chuẩn: Chiến Hồn 三辰永誓 (Tam Thần Vĩnh Thệ)

`三辰永誓战魂 = Tam Thần Vĩnh Thệ Chiến Hồn` (tm.json) là Chiến Hồn tiêu biểu cho cộng hưởng lưu phái (`Translate_4.lua:16566`, bản gốc):
> *"集齐60个可以合成5星三辰永誓战魂：提升自身6000生命，我方全体格斗家提升4%攻击与防御，持续48秒，己方相同流派的格斗家超过3人时，这些格斗家效果翻倍"*
> = "Gom đủ **60 cái** để ghép **Tam Thần Vĩnh Thệ 5 sao**: bản thân +**6000 sinh mệnh**; toàn bộ Võ Sĩ phe ta +**4% công & thủ** trong **48 giây**; khi Võ Sĩ cùng lưu phái phe ta **trên 3 người (≥4)**, hiệu quả với các Võ Sĩ này **nhân đôi**."

- **Cách kiếm/ghép:** gom **60 mảnh** → ghép 5★ tại **`战魂神殿` = Thần Điện Chiến Hồn**. Chứng `三辰永誓之证` nhận **khi trùng Chiến Hồn**; phân giải chứng dư được **2000 `战魂精华` (Tinh Hoa Chiến Hồn)** (`Translate_2.lua:38350`).

### 2.3. Chiến Hồn buff toàn phái (không cần ra trận)

Có nhóm Chiến Hồn/kỹ năng sao tăng lực **cho toàn bộ tướng của một phái, kể cả không ra trận** — mỗi trong 8 phái đều có một buff kiểu này, vd:
- `SK_H031_Soul_Passive_Eft_Desc` (`Translate_2.lua:35410`): *"提升所有隐秘暗杀流派格斗家 X% 攻击力（不上阵也可生效）"* — buff công cả phái **Ẩn Bí Ám Sát (SECT5)**, có hiệu lực dù **không lên trận**.
- Họ buff toàn phái tương tự có đủ 8 tên phái (SECT1 炽炎烈火 `Translate_2.lua:35418`; và bản `SK_Hxxx_Star_Attr_Desc` ở `Translate_1.lua:23732 / 24404 / 24444 / 24448 / 24452 / 24492 / 24516 / 25088`).

Đây là đòn bẩy dồn tài nguyên tập trung vào 1 phái để tăng lực nền cho account.

> **Về `能源掌控` (Năng Nguyên Chưởng Khống):** đây **chính là SECT4** (`Sect_4_Name`) — **một trong 8 lưu phái**, không phải "nhóm đặc biệt ngoài SECT". Buff *"所有能源掌控流派格斗家攻击、生命各提升X%"* (`Translate_1.lua:24404`) chỉ là buff-toàn-phái của SECT4, cùng họ với 7 phái còn lại. (Con số `X = Value[1]` do node/skill quyết định, không lộ tại dòng text này.)

---

<a id="3"></a>
## 3. 阵营 — Phe (hệ thống xã hội/PvP, KHÔNG buff chỉ số)

**阵营 = Phe** (tm.json). Đây là hệ thống **phe xã hội/PvP**, tách khỏi 8 lưu phái ở [Mục 2](#2). Có **4 phe** (`Translate_1.lua:12366–12378`; lúc chọn ban đầu hiển thị 3 phe tại `:10722–10730`):

| Trung | Việt (Hán-Việt) |
|---|---|
| 神乐阵营 | Phe Thần Nhạc (Kagura) |
| 草薙阵营 | Phe Thảo Trĩ (Kusanagi) |
| 八神阵营 | Phe Bát Thần (Yagami) |
| 异世界阵营 | Phe Dị Thế Giới |

- **Đặc điểm:** *"阵营无区别，请放心选择"* — các phe **không khác nhau về sức mạnh** (`Translate_1.lua:9114`). Vào **phe được đề xuất** thì nhận **thưởng Kim Cương** (`Translate_1.lua:9102`).
- **Nội dung phe:** `阵营资源争夺战` (Chiến Tranh Đoạt Tài Nguyên Phe), `阵营武道场` (Võ Đạo Trường Phe) — PvP đồng minh, xếp hạng nhận tài nguyên.

---

<a id="4"></a>
## 4. 羁绊 / 命运羁绊 — Duyên / Liên Kết (HeroRelation)

Đây mới là **hệ "liên kết" đúng nghĩa** của đội hình. Config `HeroRelation.lua` (`命运羁绊 = Duyên Vận Mệnh`, tm.json). Điểm quan trọng: **điều kiện là SỞ HỮU tướng + Sao/Vũ khí, KHÔNG phải "cùng hệ trong đội đánh"**. Có **3 loại** (`Type`):

| `Type` | Số bond | Điều kiện kích hoạt | Bản chất |
|---|---|---|---|
| `HERO` | 270 | `HEROAMOUNT` (sở hữu đủ N tướng) + `HEROSTAR` (đủ sao) | **Duyên Nhân Vật** |
| `EQUIP` | 363 | `EQUIPEVOLVE` (bậc tiến hoá vũ khí) | **Duyên Vũ Khí (武器缘)** — [Mục 6](#6) |
| `GLOBAL` | 90 | `RELATIONAMOUNT` / `RELATIONLEVEL` | **Liên Kết Toàn Cục** (buff account) |

(Đếm từ `HeroRelation.lua`; số lần xuất hiện các khoá điều kiện: `HEROAMOUNT` 741, `HEROSTAR` 471, `EQUIPEVOLVE` 1086, `RELATIONAMOUNT` 246, `RELATIONLEVEL` 156; ngoài ra `EQUIPEVOLVEANDTRANS` 3 lần.)

### 4.1. Ví dụ Duyên Nhân Vật (`HeroRelation.lua:4–45`)

```
H001_R1: RelationList = { H001, H017, H039 }   -- cần sở hữu 3 tướng này
EffectLevel = 3  (3 bậc)
Condition:  bậc1 { HEROAMOUNT=3 }
            bậc2 { HEROAMOUNT=3, HEROSTAR=15 }
            bậc3 { HEROAMOUNT=3, HEROSTAR=21 }
Skill:      { SK_Relation_H001_R1_1/_2/_3 }     -- mỗi bậc mở 1 kỹ năng liên kết
```
→ **Sở hữu đủ nhóm tướng chỉ định → mở bậc 1; nâng tất cả lên đủ Sao → mở bậc 2, 3**, mỗi bậc cấp 1 skill cộng chỉ số. Đây là lý do "duyên" thưởng cho việc **gom + thăng sao đúng nhóm tướng**, không liên quan hệ (SectType).

---

<a id="5"></a>
## 5. Type 攻/防/技 — Đả / Thủ / Kĩ (định vị Võ Sĩ)

Mỗi tướng còn có trường `Type` (`HeroBase.lua`) — **định vị**, khác lưu phái. Phân bố (đếm `HeroBase.lua`): `DPS` **30**, `GANK` **35**, `TANK` **26**. Bản dịch chuẩn (tm.json):

| `Type` | Trung | Việt (tm.json) | Vai trò |
|---|---|---|---|
| `DPS` | 攻 | **Võ sĩ hệ Đả** (`攻格斗家`) | Sát thương / output |
| `TANK` | 防 | **Võ sĩ hệ Thủ** (`防格斗家`) | Chống chịu / tuyến đầu |
| `GANK` | 技 | **Võ sĩ hệ Kĩ** (`技格斗家`) | Kỹ thuật / khống chế-hỗ trợ |

Nhãn này chính là thứ **战牌 (Chiến Bài)** dùng để phân hàng: Hàng 1 nhận Đả, Hàng 2 nhận Thủ, Hàng 3 nhận Kĩ (`ConfigValue.lua:5901–5915`). Thứ tự chữ Trung "攻防技" ↔ DPS/TANK/GANK.

---

<a id="6"></a>
## 6. 武器缘 — Duyên Vũ Khí (HeroRelation Type=EQUIP)

Là nhánh `Type="EQUIP"` của HeroRelation (`HeroRelation.lua:8572–8609`, vd `H001_R4`):
```
Type = "EQUIP"
RelationList = { H001_E1 }                       -- gắn với vũ khí của tướng
Condition: { EQUIPEVOLVE=1 } / { =2 } / { =3 }   -- theo bậc tiến hoá vũ khí
Skill:     { SK_Relation_H001_R4_1/_2/_3 }
```
→ **Tiến hoá vũ khí của tướng lên bậc 1/2/3 → lần lượt mở 3 bậc kỹ năng duyên vũ khí.** Một số bond yêu cầu `EQUIPEVOLVEANDTRANS` (tiến hoá **và** chuyển hoá vũ khí — chỉ 3 lần trong config). Đây là "缘" nhiều người gọi là *duyên vũ khí* — thưởng cho việc **nuôi vũ khí**, không phải gom tướng.

> **Liên quan (lore, chưa rõ số):** `神器 (Thần Khí)` có khái niệm *"神器之间的共鸣"* (cộng hưởng giữa các Thần Khí, `Translate_1.lua:56913`) và một hệ *"印记共鸣达到 X 级"* (Ấn Ký cộng hưởng đạt cấp X, `Translate_1.lua:40720`). Đây là dạng cộng hưởng vũ khí cấp cao ở hệ Thần Khí, tách khỏi Duyên Vũ Khí thường — nhưng phần lớn văn bản là **cốt truyện**, config chưa lộ công thức chỉ số cụ thể.

---

## 7. Mẹo tối ưu (dựa trên số THẬT)

1. **Chiến Bài — ưu tiên phẩm ≥ 3 (xanh dương).** `SectUp = 0` ở phẩm 1–2 (`AutoChessQuality.lua:6,11`). Nâng cả 3 thẻ trong hàng lên phẩm 5 để đạt trần **+70% hệ + 30% loại = ×2 chỉ số** cho hàng. Vì `SectUp` lấy theo **phẩm thấp nhất**, đừng để 1 thẻ phẩm thấp kéo cả hàng.
2. **Chiến Bài — 3 thẻ phải KHÁC ID.** Điều kiện hệ (`AutoChessCardDesk.lua:237`) bắt `cardId1≠cardId2≠cardId3`; 2 thẻ trùng ID sẽ **mất** cộng hưởng hệ.
3. **Đội chính — cùng phái phải đi kèm ĐÚNG Chiến Hồn.** Xếp ≥3 (hoặc ≥4) Võ Sĩ cùng lưu phái **chỉ có ích** khi tướng cầm 战魂 có mệnh đề `同流派`. Ưu tiên gom đủ **60 mảnh** ghép **Tam Thần Vĩnh Thệ 5★** để bật buff toàn đội + nhân đôi khi ≥4 cùng phái.
4. **Dồn tài nguyên theo 1 lưu phái** để ăn nhóm Chiến Hồn "buff cả phái, không cần ra trận" (`Translate_2.lua:35410`) — tăng lực nền cho account, không tốn ô đội hình.
5. **Duyên (羁绊):** khi đã sở hữu nhóm tướng của 1 bond, **thăng sao đồng đều** để leo bậc 2–3 (mốc `HEROSTAR=15/21…`); đây là Lực Chiến "miễn phí" chỉ từ nuôi sao.
6. **Duyên Vũ Khí (武器缘):** nuôi vũ khí lên bậc `EQUIPEVOLVE` 1→2→3 mở lần lượt 3 skill, đừng bỏ dở.
7. **Phe (阵营):** chọn **phe được đề xuất** để lấy thưởng Kim Cương; các phe **không chênh lệch sức mạnh**, chọn theo bạn bè/xã hội.

---

## 📖 Mini-glossary (Trung → Việt)

| Trung | Việt (chuẩn game) | Ghi chú |
|---|---|---|
| 战牌 | **Chiến Bài** | Minigame đấu thẻ (nơi có "3 cùng hệ") |
| 拳魂战牌 / 跨服战牌 | Chiến Bài Quyền Hồn / Liên Server | Chế độ Chiến Bài |
| 流派 | **Lưu Phái** | Hệ/phái của Võ Sĩ (SECT1–8) |
| 炽炎烈火 / 极限武道 / 汲血之刃 / 能源掌控 | Xí Viêm Liệt Hỏa / Cực Hạn Võ Đạo / Cấp Huyết Chi Nhận / Năng Nguyên Chưởng Khống | SECT1–4 |
| 隐秘暗杀 / 无双战姬 / 不屈金刚 / 大蛇之力 | Ẩn Bí Ám Sát / Vô Song Chiến Cơ / Bất Khuất Kim Cương / Đại Xà Chi Lực | SECT5–8 |
| 阵营 | **Phe** | Phe xã hội/PvP (không buff chỉ số) |
| 羁绊 / 命运羁绊 | **Duyên / Duyên Vận Mệnh** | Liên kết (HeroRelation) |
| 武器缘 | **Duyên Vũ Khí** | Liên kết theo tiến hoá vũ khí (EQUIP) |
| 战魂 | **Chiến Hồn** | Nơi chứa mệnh đề cộng hưởng lưu phái |
| 三辰永誓战魂 | **Tam Thần Vĩnh Thệ Chiến Hồn** | Chiến Hồn tiêu biểu cộng hưởng lưu phái |
| 战魂神殿 / 战魂精华 | **Thần Điện Chiến Hồn / Tinh Hoa Chiến Hồn** | Nơi ghép / nguyên liệu Chiến Hồn |
| 神器 | **Thần Khí** | Vũ khí huyền thoại (có cộng hưởng riêng) |
| 格斗家 / 战力 | **Võ Sĩ / Lực Chiến** | Nhân vật / chỉ số sức mạnh |
| 攻 / 防 / 技 | **Đả / Thủ / Kĩ** (DPS/TANK/GANK) | Định vị Võ Sĩ |
| 升品 / 升星 | Thăng Phẩm / Thăng Sao | Nâng phẩm / nâng sao |

---

### Nguồn chính đã đọc (file:dòng)
- `AutoChessCardDesk.lua:101–256` (logic cộng hưởng), `ConfigValue.lua:5887–5925`, `AutoChessQuality.lua:1–86`, `AutoChessLib.lua`, `AutoChessGame.lua`, `AutoChessSlot.lua`
- `HeroBase.lua` (SectType/Type tướng), `SectMain.lua` (8 lưu phái, ClientLevel=53)
- `HeroRelation.lua:4–45` (Duyên Nhân Vật), `:8572–8609` (Duyên Vũ Khí)
- `Translate_1.lua:66045/66049/66209` (rule Chiến Bài), `:87933/87421/88133/69937–69949/87289` (tên 8 phái), `:24404` (buff phái), `:9102/9114/10722–12378` (Phe), `:11226` (guide), `:56913/40720` (共鸣)
- `Translate_2.lua:34038` (+50%), `:35146` (nhân đôi), `:35410` (buff phái không-ra-trận), `:38350` (证 → 2000 Tinh Hoa); `Translate_4.lua:16566` (Tam Thần Vĩnh Thệ)
- `data/i18n/tm.json` (tên Việt chuẩn)

---

> ## Độ tin cậy
>
> **Đã SỬA so với bản nháp (lỗi/bịa xác nhận từ source):**
> 1. **Tên 8 lưu phái (Mục 2) — SAI toàn bộ.** Bản nháp ghi 街斗/兵刃/功夫/忍术/古武/超能/摔投/元素. Tên hiển thị thật (`Sect_x_Name`, đối chiếu 100% danh sách tướng `SectMain > Sect_x` khớp `SectType SECTx` trong HeroBase) là 炽炎烈火/极限武道/汲血之刃/能源掌控/隐秘暗杀/无双战姬/不屈金刚/大蛇之力 (Xí Viêm Liệt Hỏa … Đại Xà Chi Lực). Các tên cũ là chuỗi thử nghiệm `Sect_x_Catalog_DescTest`.
> 2. **`能源掌控` KHÔNG phải "nhóm đặc biệt ngoài 8 SECT".** Nó **chính là SECT4** (`Sect_4_Name`, toàn bộ 12 tướng đều `SectType=SECT4`). Đã gỡ khỏi mục "阵营" và gộp vào Mục 2; buff "所有能源掌控流派…" chỉ là buff-toàn-phái của SECT4, cùng họ với 7 phái kia.
> 3. **Phân bố Type: `DPS` = 30, không phải 33** (`HeroBase.lua`, đếm dòng `^\tType="DPS"`; GANK 35, TANK 26 đúng). Tổng DPS+GANK+TANK = 91.
> 4. **Ngày mở ô 10–12: 61/62/63**, không phải "61–62" (`AutoChessSlot.lua`, slot 12 `UnlockDate=63`).
> 5. **Bổ sung** rule SectUp gốc (`AutoChessCardRule_6`, `Translate_1.lua:66049`) — bản nháp chỉ dẫn rule 5.
> 6. Sửa vài số dòng trích dẫn cho khớp (thưởng Kim Cương phe = `9102`; `SK_H007`=34038; `SK_I002`=35146; `IM_FItemSoul_2`=16566).
>
> **Đã kiểm và ĐÚNG (giữ nguyên):** bàn 4×3=12; GroupUp = +30% mọi hàng; bảng SectUp (phẩm 1–2=0, 3=+30%, 4=+50%, 5–7=+70%); điều kiện B "3 thẻ khác ID + cùng hệ", (A)/(B) độc lập; ví dụ ×2; số tướng mỗi hệ (11/10/11/12/12/12/12/11); HeroRelation HERO 270 / EQUIP 363 / GLOBAL 90 và mọi count khoá điều kiện (741/471/1086/246/156); ví dụ H001_R1, H001_R4; AutoChessGame (800→72k→171k→216k, MaxCurrency 4→25); Tam Thần Vĩnh Thệ (60 mảnh, 6000 HP, 4% công-thủ, 48s, >3→nhân đôi); hai ngưỡng 同流派 (>2→+50%, >3→nhân đôi); buff phái "不上阵也可生效"; phân giải 证 → 2000 Tinh Hoa; 4 phe không chênh lệch sức mạnh; 攻/防/技 = Đả/Thủ/Kĩ = DPS/TANK/GANK.
>
> **Chưa chắc từ source (cần xác minh thêm):**
> - **Màu phẩm chất thẻ** (trắng/lục/tím/cam/đỏ cho phẩm 1,2,4,5,6): config `AutoChessQuality.lua` **không** ghi màu — chỉ riêng "phẩm 3 = xanh dương" được help in-game xác nhận (`蓝色或以上`). Các màu khác là **quy ước rarity chung**, chưa có trong config.
> - **Con số `Value[1]`** của các buff-toàn-phái và buff Năng Nguyên: chỉ lộ công thức + tên, số nằm ở node/skill kích hoạt, chưa trích được.
> - **神器 共鸣 / 印记共鸣:** phần lớn là văn bản cốt truyện + nhãn UI; có hệ "Ấn Ký cộng hưởng đạt cấp X" nhưng **công thức chỉ số cụ thể chưa xác minh**.
> - **Tổng số tướng:** `HeroBase.lua` có 91 dòng `SectType`/`Type` nhưng 90 `Id` dạng `H\d+` (lệch 1, có thể 1 entry mẫu). `SectMain > Sect_6` liệt kê 11 tướng trong khi HeroBase đếm 12 SECT6 (1 tướng chưa vào roster tu luyện phái). Không ảnh hưởng cơ chế.