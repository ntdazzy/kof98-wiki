# Viện Hộ (援护)

Đã kiểm chứng toàn bộ. Mọi bảng số lớn (tổng cấp, cost sao, cost kích hoạt, phân bố tier, 90/36 hero, hằng số công thức) đều KHỚP CHÍNH XÁC với source. Phát hiện chính cần sửa: **StarCombat/LevelCombat là trường config KHÔNG được code chiến đấu dùng** (grep 0 usage), nên diễn giải "sao chẵn tăng hệ số kỹ năng" là suy đoán sai; thiếu mảnh E1 ở cost kích hoạt H064; nhãn "SP (7 sao)" gây nhầm; và biến thể bảng sao của 5 hero SP. Dưới đây là bản cuối đã sửa.

---

# Yểm Trợ (援护) — Hệ thống Ngọc Trợ Chiến

> **Lưu ý tên gọi:** Bản Việt hoá chính thức dịch **援护 = "Yểm Trợ"** (`data/i18n/tm.json`: `"援护" → "Yểm Trợ"`), **援护技能 = "Kỹ Năng Yểm Trợ"**. Ngọc nguyên liệu riêng từng hero dịch theo mẫu **"Ngọc Trợ Chiến <Tên hero>"** (VD `"大蛇援护玉" → "Ngọc Trợ Chiến Orochi"`), còn ngọc gộp theo bậc (`SP/SR/UR/SSR援护玉`) lại dịch là **"Ngọc Trợ Hỗ <bậc>"**. Cách đọc Hán-Việt sát chữ của 援护 là "Viện Hộ". Trang này dùng **Yểm Trợ**, kèm chữ Trung gốc lần đầu.

---

## 1. Yểm Trợ là gì?

Mỗi **Võ Sĩ (格斗家)** bạn sở hữu đều có **một hệ Yểm Trợ (援护) riêng** gắn liền nhân vật đó — không dùng chung. Khi kích hoạt và nuôi, Yểm Trợ của một hero sẽ:

1. **Cộng thẳng Lực Chiến (战力)** vào sức mạnh đội, và
2. Cấp một **Kỹ Năng Yểm Trợ (援护技能)** — hiệu ứng thuộc tính (tăng Công/Thủ/HP...) áp lên trận đấu.

Về kỹ thuật, mỗi hero mang một object `Intervene` (chính là "assist info" của hero, lấy qua `heroData:getAssistInfo()`), tra bảng cấu hình `Intervene` qua trường `HeroBase.InterveneSkill` (nguồn: `model/hero/intervene/Intervene.lua:34-35`; `controller/InterveneSystem.lua:35-39`).

Bảng cấu hình khai báo **90 hero** có hệ Yểm Trợ, trong đó **36 hero đã mở** (`Open = 1`) — **54 hero còn lại** `Open = 0` nên đang khoá cứng, chưa phát hành (nguồn: thống kê `config/Intervene.lua`: 36 dòng `Open = 1`, 54 dòng `Open = 0`).

---

## 2. Điều kiện mở khoá & Kích hoạt

Trạng thái Yểm Trợ được quyết định trong `Intervene:getState()` (`Intervene.lua:89-106`) và enum `InterveneLockState` (`:24-28`):

| Trạng thái | Giá trị | Ý nghĩa |
|---|---|---|
| `kLock` | 0 | Khoá cứng — hệ chưa mở (`Open = 0`) |
| `kCanActive` | 1 | Chưa kích hoạt (hiện khi đủ điều kiện mà chưa bật, hoặc khi chưa đạt điều kiện) |
| `kCanUp` | 2 | **Đã kích hoạt** (server xác nhận), có thể nâng cấp/thăng sao — chỉ trạng thái này mới cộng Lực Chiến |

**Điều kiện để hiện & kích hoạt** (đồng nhất cho MỌI hero — kiểm chứng toàn file: cả 90 record đều `LevelCondition = 60`, `QualityCondition = 50`; nguồn `config/Intervene.lua:6,13`, so khớp trong `getState` `Intervene.lua:94-97`):

- Võ Sĩ phải đạt **Cấp (等级) ≥ 60** — `LevelCondition = 60`, so với `self._hero:getLevel()`.
- Võ Sĩ phải đạt **Phẩm Chất (品质) ≥ 50 = phẩm Cam (橙)** — `QualityCondition = 50`, so với `self._hero:getQuality()`.
  - *Vì sao 50 = Cam:* chỉ số màu phẩm = `math.floor(quality / 10)` → `50/10 = 5`; trong enum `ColorType`, `kOrange = 5` (`snk/assets/GameStyle.lua:11-20`), và `橙 = "Cam"` (`config/Translate_1.lua: Washwork_Text_Orange.Zh_CN = "橙"`; `tm.json: "橙" → "Cam"`).

**Phí kích hoạt (Cost)** — trả 1 lần để bật Yểm Trợ (trường `Cost` của mỗi hero). Ví dụ (lưu ý phí thay đổi theo hero):

| Hero | Ngọc Trợ Chiến riêng | Đá Thức Tỉnh (觉醒石) | Vàng (金币) | Mảnh Hồn (E1) | Nguồn |
|---|---|---|---|---|---|
| H001 Kyo (bậc SR, đang `Open=0`) | 30 | 1 | 225.000 | — | `Intervene.lua:79-92` |
| **H055 Orochi (bậc SSR, `Open=1`)** | **80** | **5** | **750.000** | — | `Intervene.lua:9693-9706` |
| H063 (bậc UR, đang `Open=0`) | 300 | 8 | 1.500.000 | 1 (`IM_H063_E1`) | `Intervene.lua:907-923` |
| **H064 Tung Fu Rue (bậc SP, `Open=1`, 7 sao)** | **120** | **8** | **1.500.000** | **1 (`IM_H064_E1`)** | `Intervene.lua:1057-1074` |

> **Con số "80"** trong ghi chú dự án chính là phí kích hoạt của **大蛇援护玉 (Ngọc Trợ Chiến Orochi = `InterveneItem_H055`)**: **80 ngọc + 5 Đá Thức Tỉnh + 750.000 Vàng** (`config/Intervene.lua:9693-9706`).
> **Sửa so với nháp:** H064 kích hoạt còn cần **thêm 1 mảnh `IM_H064_E1`** (`:1070-1073`); riêng H063/H064 (và các hero cao cấp) có mục mảnh Hồn ngay ở phí kích hoạt.

---

## 3. Cơ chế cộng Lực Chiến (công thức chính xác)

Lực Chiến do Yểm Trợ đóng góp tính trong `InterveneSystem:getCombatByHeroId()` (`controller/InterveneSystem.lua:97-113`). Dòng công thức gốc (`:109`) — **đây là công thức DUY NHẤT được runtime dùng**:

```lua
combat = config.starCombatBase[star + 1]
       + level * (config.starCombatUp[star + 1] + config.LevelCombatUp)
       + math.max(heroCombat * config.CombatVariable, config.MaxRelevantCombat)
```

Diễn giải:

```
LựcChiến_YểmTrợ = starCombatBase[sao]
                + Cấp × ( starCombatUp[sao] + LevelCombatUp )
                + max( LựcChiến_gốc_của_hero × CombatVariable , MaxRelevantCombat )
```

Hằng số cố định cho cả 90 hero (nguồn `config/Intervene.lua:7-9`, kiểm chứng toàn file):
- `CombatVariable = 0.2` → cộng **20% Lực Chiến gốc** của chính hero mang Yểm Trợ.
- `LevelCombatUp = 0`, `MaxRelevantCombat = -1`. Vì `heroCombat × 0.2 ≥ 0 > -1`, hàm `max(...)` **luôn** bằng `heroCombat × 0.2`.

**Hai điều kiện để phần Lực Chiến này được tính** (`InterveneSystem.lua:100,103`):
1. Yểm Trợ ở trạng thái đã kích hoạt (`isActiveById` → state = `kCanUp`).
2. Môi trường trận là **kNormal / kArena / kCrossArena** (đánh Thường, Đấu Trường, Đấu Trường Liên Server). Chế độ khác → phần cộng = 0.

→ Vì có thành phần `20% × Lực Chiến gốc`, **nuôi mạnh chính hero đó (Thăng Phẩm/Thức Tỉnh/Chiến Hồn...) sẽ tự động đội thêm Lực Chiến Yểm Trợ** — hiệu ứng lan (propagate) vào tổng lực account.

### Bảng `starCombatBase` / `starCombatUp` (hero tiêu chuẩn — 85/90 hero, VD H001/H055)

Nguồn H055: `starCombatUp` (`Intervene.lua:9629-9636`), `starCombatBase` (`:9739-9746`), `Skills` (`:9645-9651`):

| Sao | starCombatBase | starCombatUp (mỗi cấp) | Kỹ năng dùng (`Skills[sao+1]`) |
|---|---|---|---|
| 0★ | 30 | 10 | `..._0` |
| 1★ | 300 | 10 | `..._1` |
| 2★ | **0** | **0** | `..._2` |
| 3★ | 600 | 20 | `..._3` |
| 4★ | **0** | **0** | `..._4` |
| 5★ | 900 | 30 | `..._5` |

> **Đọc bảng (đã sửa cách diễn giải trong nháp):**
> - Công thức **KHÔNG cộng dồn** qua sao — nó tính lại theo **sao hiện tại**. Ở **2★ và 4★**, `starCombatBase = starCombatUp = 0`, nên phần **Lực Chiến phẳng = 0**, chỉ còn `20% × Lực Chiến gốc`. Nói cách khác: Lực Chiến phẳng chỉ "sống" ở các mốc **0★/1★/3★/5★**; lên 2★ hay 4★ thì phần phẳng tạm về 0 cho tới mốc lẻ kế tiếp.
> - **Mỗi lần thăng sao đều đổi Kỹ Năng Yểm Trợ** sang cấp cao hơn (`getSkillId` trả `Skills[sao+1]`, `Intervene.lua:108-116`) — kể cả sao chẵn. Vậy 2★/4★ **không cho Lực Chiến phẳng nhưng vẫn nâng cấp skill**.
> - ⚠️ **Trường `StarCombat` (và cả mảng `LevelCombat`) trong config KHÔNG được bất kỳ code chiến đấu nào dùng** (grep toàn `snk/`: 0 chỗ tham chiếu ngoài file config). Nên **không thể** khẳng định "sao chẵn tăng hệ số kỹ năng qua StarCombat" như bản nháp — đó là dữ liệu tham khảo/để trống trong build client này. Sức mạnh skill thay đổi qua **mảng `Skills`**, không qua `StarCombat`.

### Biến thể của 5 hero bậc SP

**5/90 hero (đúng bằng 5 hero bậc SP)** dùng bảng cao hơn ~1.2×: `starCombatBase` bắt đầu **36** (thay vì 30), `starCombatUp` bắt đầu **12** (thay vì 10). Ví dụ **H064** (7 sao): `starCombatBase = {36,360,0,720,0,1080,1280,1580}` (`:1107-1116`), `starCombatUp = {12,12,0,20,24,36,40,48}` (`:985-994`). *(Riêng H064, `starCombatUp` ở 4★ = 24 ≠ 0, nên quy tắc "2★/4★ về 0" chỉ đúng tuyệt đối cho 85 hero tiêu chuẩn.)*

**Ví dụ tính:** H055 ở **5★, Cấp 30**, hero gốc có Lực Chiến `C`:
`= 900 + 30 × 30 + 0.2 × C = 1.800 + 0.2 × C`.

---

## 4. Thăng Cấp (升级 · Cấp 1 → 30)

- **Cấp tối đa `MaxLevel = 30`** cho cả 90 hero (kiểm chứng: 90 dòng `MaxLevel = 30`).
- Nguyên liệu: **Tinh Hoa Trợ Hỗ (援护精华 = `InterveneCream`)** + **Vàng** (`config/InterveneLevel.lua`; hàm đọc cost `InterveneSystem.lua:83-88`). Không dùng nguyên liệu nào khác (kiểm chứng: mọi record cấp chỉ có `InterveneCream` + `IR_Gold`).
- Cost mỗi bậc phụ thuộc **hạng nguyên liệu (tier)** hero dùng, khai báo qua `UpgradeVariable`. Có **5 tier**: `SR / SRP / SSR / UR / SP`. Phân bổ (kiểm chứng đếm): **SR 17, SRP 23, SSR 20, UR 25, SP 5** (= 90).
- Cơ chế: record `*_Intervene_Level{N}` = chi phí đi từ **Cấp N → N+1** (`getUpLevelCost` trả `UpgradeVariable[level]`, `Intervene.lua:175-180`). Dùng record `Level1..Level29`; `Level30` tồn tại nhưng cost = 0 và không được gọi.

### Bảng Tinh Hoa Trợ Hỗ theo cấp (mỗi bước Cấp N → N+1)

Nguồn `config/InterveneLevel.lua` (`SR_Intervene_Level1` `:4`, `SSR_Intervene_Level1` `:564`, `SP_Intervene_Level1` `:1644`). Số dưới đây **đã tính lại trực tiếp từ file** và khớp 100%:

| Bước | SR | SRP | SSR | UR | SP |
|---|---|---|---|---|---|
| 1→2 | 100 | 200 | 300 | 400 | 600 |
| 2→3 | 100 | 200 | 300 | 400 | 600 |
| 3→4 | 120 | 240 | 360 | 480 | 720 |
| 5→6 | 140 | 280 | 420 | 560 | 840 |
| 9→10 | 180 | 360 | 540 | 720 | 1.080 |
| 10→11 | 216 | 432 | 648 | 864 | 1.296 |
| 15→16 | 288 | 576 | 864 | 1.200 | 1.800 |
| 19→20 | 560 | 1.120 | 1.680 | 2.400 | 3.600 |
| 25→26 | 1.080 | 2.160 | 3.300 | 4.500 | 6.750 |
| 29→30 | 1.350 | 2.700 | 4.200 | 5.400 | 8.100 |

*(Trích một số mốc; đủ 29 bước có trong file.)*

### Tổng nguyên liệu Cấp 1 → 30 (cộng đủ 29 bước — đã tính lại và khớp)

| Tier | Tổng Tinh Hoa Trợ Hỗ | Tổng Vàng |
|---|---|---|
| SR | **13.902** | 6.253.750 |
| SRP | **27.804** | 12.507.500 |
| SSR (VD Orochi) | **42.026** | 18.885.000 |
| UR (VD H063) | **57.426** | 25.015.000 |
| SP (VD H064) | **86.139** | 37.972.500 |

> **Sửa nhãn so với nháp:** hàng SP là **tier cost cấp** dùng cho **5 hero**, KHÔNG phải "SP = 7 sao". Chỉ **duy nhất H064** có 7 sao; 4 hero SP còn lại vẫn 5 sao.

---

## 5. Thăng Sao (升星 · 0★ → 5★, đặc biệt H064 7★)

- **Sao tối đa `MaxStar = 5`** cho **89/90 hero**; **duy nhất H064 (Tung Fu Rue) `MaxStar = 7`** (`Intervene.lua:982`; kiểm chứng: 89 dòng `MaxStar = 5`, 1 dòng `MaxStar = 7`).
- Nguyên liệu: **Ngọc Trợ Chiến riêng của hero** + **Đá Thức Tỉnh (觉醒石)** + **Vàng**, và ở một số mốc cần thêm **mảnh Hồn của hero** (`IM_<hero>_E1`). Hàm đọc cost: `InterveneSystem.lua:90-95`.
- Cơ chế: record `*_Intervene_Star{N}` = **chi phí đi từ sao N → N+1** (`getUpStarCost`: `star = math.min(_star + 1, MaxStar)`, trả `StarCost[star]`, `Intervene.lua:182-187`). Record sao cuối tồn tại nhưng không được dùng làm cost.
- Mỗi lần thăng sao **đổi Kỹ Năng Yểm Trợ** (`Skills[sao+1]`, `Intervene.lua:108-116`).

### 5A. H055 — 大蛇援护玉 (Orochi, SSR, MaxStar 5)

Nguồn `config/InterveneStar.lua`: Star0 `:6832`, Star1 `:4516`, Star2 `:4534`, Star3 `:4556`, Star4 `:4574`. Mảnh **`IM_H055_E1` = 大蛇之魂 (Đại Xà Chi Hồn)** (`Item.lua:67629`, `CN_Name = "大蛇之魂"`, Quality 4, `EQUIP_STAR`). Số đã tính lại và khớp:

| Bước sao | Ngọc Orochi | Đá Thức Tỉnh | Vàng | Mảnh Đại Xà Chi Hồn |
|---|---|---|---|---|
| 0★→1★ | 100 | 8 | 1.000.000 | — |
| 1★→2★ | 200 | 12 | 1.250.000 | — |
| 2★→3★ | 300 | 16 | 1.500.000 | 1 |
| 3★→4★ | 550 | 25 | 1.750.000 | — |
| 4★→5★ | 800 | 30 | 2.000.000 | 2 |
| **TỔNG 0★→5★** | **1.950** | **91** | **7.500.000** | **3** |

### 5B. H001 Kyo (SR, rẻ nhất, MaxStar 5 — lưu ý `Open=0`)

Mảnh: `IM_H001_E1` = 草薙剑之魂 (Hồn Kiếm Kusanagi) (`Item.lua:69889`, Quality 4). Ngọc riêng: `InterveneItem_H001` = 草薙京援护玉 (Quality 1). Records: Star0 `:5860`, Star1–Star4 `:4-79`:

| Bước | Ngọc | Đá TT | Vàng | Mảnh E1 |
|---|---|---|---|---|
| 0★→1★ | 40 | 2 | 300.000 | — |
| 1★→2★ | 60 | 3 | 375.000 | — |
| 2★→3★ | 80 | 4 | 450.000 | — |
| 3★→4★ | 120 | 6 | 525.000 | — |
| 4★→5★ | 150 | 8 | 600.000 | 1 |
| **TỔNG** | **450** | **23** | **2.250.000** | **1** |

### 5C. H064 Tung Fu Rue (SP, **MaxStar 7** — duy nhất)

Nguồn block `config/Intervene.lua:974-1127`; bảng sao `InterveneStar.lua` (Star0 `:8868`, Star1–Star5 `:7204-7301`, Star6 `:8886`, Star7 `:8908`). Số đã tính lại và khớp:

| Bước sao | Ngọc | Đá TT | Vàng | Mảnh E1 (`IM_H064_E1`) |
|---|---|---|---|---|
| 0★→1★ | 500 | 15 | 2.000.000 | — |
| 1★→2★ | 800 | 20 | 2.500.000 | — |
| 2★→3★ | 1.000 | 30 | 3.000.000 | 2 |
| 3★→4★ | 1.200 | 50 | 4.000.000 | — |
| 4★→5★ | 1.500 | 80 | 5.000.000 | 3 |
| 5★→6★ | 2.000 | 100 | 6.000.000 | — |
| 6★→7★ | 3.000 | 120 | 7.000.000 | 5 |
| **TỔNG 0★→7★** | **10.000** | **415** | **29.500.000** | **10** |

---

## 6. Nguyên liệu & cách kiếm

| Nguyên liệu (Trung → Việt) | Item ID | Phẩm | Dùng cho | Nguồn kiếm |
|---|---|---|---|---|
| **援护玉 → "Ngọc Trợ Chiến <Hero>"** (mỗi hero 1 loại, VD 大蛇援护玉 = Ngọc Trợ Chiến Orochi) | `InterveneItem_<hero>` | thay đổi theo hero (H001=1, H055=4) | Kích hoạt + Thăng Sao | Nguồn config hiển thị "Source_General_Unknown" (nhiều kênh); có sự kiện chiêu mộ riêng `InterveneDrawActivity` (`ItemSource.lua:6102, 6487`) |
| **援护精华 → Tinh Hoa Trợ Hỗ** | `InterveneCream` | 4 | Thăng Cấp | Nhiều nguồn ("General_Unknown") — `ItemSource.lua:6102` |
| **觉醒石 → Đá Thức Tỉnh** | `IM_RichStone` | 5 | Kích hoạt + Thăng Sao | **Chiêu mộ Trang bị (RecruitEquipView)** — `ItemSource.lua:8473-8479` (`Source_DrawEquip`, `view://RecruitEquipView`) |
| **<hero>之魂 → Hồn của hero** (VD 大蛇之魂 = Đại Xà Chi Hồn) | `IM_<hero>_E1` | 4 (`EQUIP_STAR`) | Một số mốc kích hoạt/Thăng Sao | Hệ Trang Bị/Thần Khí của hero đó |
| **金币 → Vàng** | `IR_Gold` | — | Mọi thao tác | Tài nguyên chung |

> Lưu ý: ngọc gộp theo bậc `SP/SR/UR/SSR援护玉` được game gọi là **"Ngọc Trợ Hỗ <bậc>"** (tm.json), khác với ngọc riêng của hero là **"Ngọc Trợ Chiến <Hero>"**. Tên Việt lấy từ `data/i18n/tm.json`; ID/phẩm lấy từ `config/Item.lua`.

---

## 7. Mẹo tối ưu

1. **Ưu tiên hero đã ra trận.** Yểm Trợ cộng `+20% Lực Chiến gốc` của chính hero đó (`CombatVariable = 0.2`), nên nuôi cho hero chủ lực (đã Thăng Phẩm/Thức Tỉnh cao) lời gấp nhiều lần hero yếu.
2. **Chỉ tính Lực Chiến ở Thường / Đấu Trường / Đấu Trường Liên Server** (`InterveneSystem.lua:103`). Nhắm leo Đấu Trường thì đây là đòn bẩy tốt; chế độ khác không nhận phần cộng này.
3. **Chọn mốc sao có chủ đích.** Lực Chiến **phẳng** chỉ có ở **sao 0/1/3/5** (base 30 → 300 → 600 → 900). Dừng ở **2★ hoặc 4★** thì phần phẳng về 0 (chỉ còn 20% Lực Chiến gốc) — nhưng vẫn đã đổi lên skill sao mới. Nếu cày để "khoe" Lực Chiến thì nên đẩy tới mốc **lẻ**; nếu chỉ cần hiệu ứng skill thì 2★/4★ đã đổi skill rồi.
4. **Đá Thức Tỉnh (觉醒石) là nút thắt chung.** Vừa dùng kích hoạt vừa Thăng Sao, nguồn chính là **chiêu mộ Trang bị** (`RecruitEquipView`). Gom có kế hoạch trước khi bung nhiều hero.
5. **Cấp 30 rẻ dần theo tier.** SR chỉ ~13.900 Tinh Hoa là full cấp — nên **max cấp các Yểm Trợ SR/SRP trước** để gặt Lực Chiến nhanh, để dành nguyên liệu nặng (SSR/UR/SP) cho hero chủ lực.
6. **H064 (7 sao) là khoản đầu tư dài nhất:** ~10.000 ngọc + 415 Đá Thức Tỉnh + 29,5 triệu Vàng + 10 mảnh Hồn cho full sao — chỉ đẩy khi hero này là trụ cột.

---

## 8. Mini-glossary (Trung → Việt)

| Trung | Việt (theo game) | Ghi chú |
|---|---|---|
| 援护 | Yểm Trợ | Tên hệ thống (Hán-Việt: "Viện Hộ") |
| 援护玉 | Ngọc Trợ Chiến (riêng hero) / Ngọc Trợ Hỗ (gộp bậc) | Nguyên liệu riêng mỗi hero |
| 大蛇援护玉 | Ngọc Trợ Chiến Orochi | = `InterveneItem_H055` |
| 援护精华 | Tinh Hoa Trợ Hỗ | = `InterveneCream`, nâng cấp |
| 援护技能 | Kỹ Năng Yểm Trợ | Đổi theo sao (`Skills[sao+1]`) |
| 觉醒石 | Đá Thức Tỉnh | = `IM_RichStone` |
| 觉醒 | Thức Tỉnh | |
| 大蛇之魂 | Đại Xà Chi Hồn | Mảnh Hồn H055 (`IM_H055_E1`) |
| 草薙京 | Kyo Kusanagi | = H001 |
| 唐福禄 | Tung Fu Rue | = H064 |
| 升级 | Thăng Cấp | Cấp 1→30 |
| 升星 | Thăng Sao | Sao 0→5 (H064: 7) |
| 升品 | Thăng Phẩm | (hệ hero, điều kiện mở) |
| 战力 | Lực Chiến | |
| 格斗家 | Võ Sĩ | Nhân vật |
| 品质 | Phẩm Chất | Cam (橙) = giá trị 50 |
| 战魂 / 战魂精华 | Chiến Hồn / Tinh Hoa Chiến Hồn | (hệ khác, tham chiếu) |
| 神器 | Thần Khí | |
| 金币 | Vàng | = `IR_Gold` |
| 招募 | Chiêu Mộ | Kênh gacha lấy ngọc/đá |

---

## 9. Nguồn tra cứu (file : dòng)

- Cấu hình hero: `config/Intervene.lua` — hằng số chung (`:5-13`), phí kích hoạt H001 (`:79-92`), H063 (`:907-923`), H064 (`:974-1127`, đặc biệt Cost `:1057-1074`), H055 Orochi (`:9618-9755`).
- Bảng cấp: `config/InterveneLevel.lua` — 5 tier SR/SRP/SSR/UR/SP (SR `:4`, SSR `:564`, SP `:1644`).
- Bảng sao: `config/InterveneStar.lua` — H001 (Star1–5 `:4-99`, **Star0 `:5860`**), H055 (Star1–5 `:4516-4614`, **Star0 `:6832`**), H064 (Star1–5 `:7204-7301`, Star0 `:8868`, Star6 `:8886`, Star7 `:8908`). *Lưu ý: các record Star0 nằm rời phía cuối file, không liền Star1–5.*
- Logic Lực Chiến & trạng thái: `controller/InterveneSystem.lua` — công thức (`:97-113`, dòng `:109`), điều kiện env (`:103`), active (`:131-135`).
- Model & state machine: `model/hero/intervene/Intervene.lua` — enum (`:24-28`), `getState` (`:89-106`), `getSkillId` (`:108-116`), `getUpLevelCost` (`:175-180`), `getUpStarCost` (`:182-187`).
- Vật phẩm: `config/Item.lua` — 大蛇援护玉 (`:1822`), 草薙京援护玉 (`:2953`), 援护精华 (`:3707`), 觉醒石 (`:57485`), 大蛇之魂 (`:67629`), 草薙剑之魂 (`:69889`).
- Nguồn vật phẩm: `config/ItemSource.lua:6102, 6487, 8473-8479`.
- Màu phẩm chất: `snk/assets/GameStyle.lua:11-44` (`kOrange = 5`); index = `quality/10` (`EuipRefineMediator.lua:191`).
- Tên Việt: `data/i18n/tm.json`.

---

> ## Độ tin cậy
>
> **Đã kiểm chứng ĐÚNG (trích số/tính lại trực tiếp từ file, khớp 100%):**
> - 90 hero, 36 `Open=1` / 54 `Open=0`; cả 90 đều `LevelCondition=60`, `QualityCondition=50`, `CombatVariable=0.2`, `LevelCombatUp=0`, `MaxRelevantCombat=-1`, `MaxLevel=30`.
> - `MaxStar`: 89 hero = 5, **1 hero (H064) = 7**. Phân bố tier cấp: SR 17 / SRP 23 / SSR 20 / UR 25 / SP 5.
> - Công thức Lực Chiến (`InterveneSystem.lua:109`) và điều kiện env (`:103`).
> - **Toàn bộ bảng số** đều khớp: tổng Tinh Hoa cấp 1→30 mỗi tier (13.902 / 27.804 / 42.026 / 57.426 / 86.139) và tổng Vàng; cost từng bước cấp; cost thăng sao H001 (tổng 450/23/2.250.000/1 mảnh), H055 (1.950/91/7.500.000/3 mảnh), H064 (10.000/415/29.500.000/10 mảnh); phí kích hoạt H001/H055/H063/H064.
> - Tên item + phẩm (`大蛇援护玉`=`InterveneItem_H055` Q4; `援护精华`=`InterveneCream` Q4; `觉醒石`=`IM_RichStone` Q5; `大蛇之魂`=`IM_H055_E1` Q4) và bản dịch Việt trong `tm.json`.
> - **Quality 50 = Cam (橙)**: đã truy được đường code (`quality/10 → ColorType.kOrange=5`) — bản nháp đúng, nay có nguồn.
> - `觉醒石` từ **Chiêu mộ Trang bị (RecruitEquipView)** — đúng.
>
> **Đã SỬA so với bản nháp:**
> 1. **`StarCombat` (và `LevelCombat`) là dữ liệu config KHÔNG được runtime dùng** (grep `snk/` = 0 usage ngoài config). Bỏ khẳng định sai "sao chẵn tăng hệ số kỹ năng qua StarCombat" và câu "quan sát trực tiếp từ dữ liệu". Sức mạnh skill đổi qua mảng `Skills[sao+1]`, đổi ở **mọi** sao (kể cả chẵn).
> 2. **Lực Chiến phẳng không cộng dồn:** ở 2★/4★ phần phẳng = 0 (chỉ còn 20% gốc). Đã viết lại phần diễn giải cho đúng công thức.
> 3. **Phí kích hoạt H064 thiếu 1 mảnh `IM_H064_E1`** trong nháp — đã bổ sung (`:1070-1073`).
> 4. **Nhãn "SP (7 sao)"** ở bảng tổng cấp gây hiểu nhầm SP=7 sao — đã đổi thành "SP" (tier 5 hero; chỉ H064 mới 7 sao).
> 5. **Bảng sao "tiêu chuẩn" đúng cho 85/90 hero**; 5 hero SP dùng biến thể cao hơn (base bắt đầu 36, up bắt đầu 12). Đã tách rõ.
> 6. **Naming ngọc:** ngọc riêng hero = "Ngọc Trợ Chiến <Hero>", ngọc gộp bậc = "Ngọc Trợ Hỗ <bậc>" — nháp gộp chung thành một, đã tách.
> 7. Sửa trích dẫn: các record `*_Star0` nằm rời cuối file (H001 Star0 ở `:5860`, không thuộc `:4-83`).
>
> **Chưa chắc / cần bắt live để chốt:**
> - Nguồn kiếm **Ngọc Trợ Chiến riêng của hero**: config chỉ ghi `Source_General_Unknown` (không nêu kênh cụ thể). Có tồn tại sự kiện `InterveneDrawActivity`, nhưng tỉ lệ/điều kiện drop cụ thể chưa có trong các file đã đọc — cần bắt màn Chiêu mộ Yểm Trợ thực tế.
> - Mảng `LevelCombat` (VD H055 `{90,180,...,2700}`) tồn tại trong config nhưng **không** vào công thức chiến đấu — chưa rõ nó phục vụ hiển thị gì; chưa xác minh.
> - Ý nghĩa `kCanActive` khi **chưa đạt** điều kiện: `getState` vẫn trả `kCanActive` (fallback dòng `:105`), và có mâu thuẫn nhỏ giữa cờ `_isActived` (sync `lockState==0`) với `getState` — đây là chi tiết đồng bộ client-server, không ảnh hưởng số liệu, chưa mô tả sâu.