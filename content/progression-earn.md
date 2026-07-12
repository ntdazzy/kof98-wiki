# Cách kiếm tài nguyên & lộ trình

I have now verified every load-bearing claim against source. I found the draft is mostly accurate on the raw config numbers (stamina, gold, diamond, EXP curve, quality costs, VIP tables, item IDs — all confirmed) but has serious errors in the level-unlock table, the gold-dungeon name, and the gem-tier count. Here is the corrected final wiki.

---

# 🎯 KOF98 OL — Cách Kiếm Tài Nguyên & Lộ Trình Phát Triển

> Mọi con số trong trang này trích trực tiếp từ source Lua client (`reference/client-src/config/`), ghi rõ `file:dòng`. Tên tiếng Việt lấy từ bản dịch đã ship (`data/i18n/tm.json`). Các điểm đã sửa so với bản nháp ghi ở cuối mục **Độ tin cậy**.

---

## 1. Tổng quan — 9 tài nguyên & nơi kiếm chính

| Tài nguyên | ID item | Nguồn kiếm CHÍNH | File nguồn |
|---|---|---|---|
| **Thể Lực** (体力) | `IR_Power` | Hồi tự nhiên + Mua bằng KC (màn Mua Thể Lực) | `Item.lua:49292` |
| **Vàng** (金币) | `IR_Gold` | Điểm Kim (点金) · Bí Bảo Tài Đoàn (财团秘宝) · đánh ải | `Item.lua:49242` |
| **Kim Cương** (钻石) | `IR_Diamond` | Nhiệm vụ · Đấu Trường · Quỹ · Thẻ Tháng · Nạp | `Item.lua:49267` |
| **EXP Võ Sĩ** | `IM_ExpUp1/2/3` | Xưởng Coco (可可工坊) · Ải Cốt Truyện · Chiêu Mộ Vàng | `Item.lua:70094` |
| **Ngọc Thăng Phẩm** (Bảo Thạch Công/Thủ/Kỹ) | `IM_QS2xx` / `IM_PS*` | Ải Cốt Truyện · Tiệm Tạp Hóa | `Item.lua:62289` |
| **Mảnh Vạn Năng** (万能碎片) | `IM_FAll13/14/15` | Gacha · Đấu Trường · Xã Đoàn Iori | `Item.lua:57558` |
| **Tinh Hoa Chiến Hồn** (战魂精华) | `IR_SoulCream` / `IM_SoulUp1-3` | Phân giải Chiến Hồn trùng · Chiêu Mộ Trang Bị · Thần Điện Chiến Hồn | `Item.lua:50497` |
| **Nguồn Thần Khí** (神器之源) | `IR_ArtiUp` | Hộp sao ải Cốt Truyện/Tinh Anh/Ác Mộng | `Item.lua:49436` |
| **Tiền Phong Thần** (封神币) | `IR_Myth` | Con Đường Phong Thần (封神之路) | `Item.lua:49606` |

> Bản đồ nguồn tổng nằm ở `ItemSource.lua` (mỗi item → `ResourceType` + màn hình). Phân bố nguồn lớn nhất (đã đếm toàn file): `STAGE_NORMAL` 234 mục, `STAGE_ELITE` 203, `DRAW_EQUIP` 164, `ACTIVITY` 135, `SHOP` 89.

---

## 2. Thể Lực (体力 — Thể Lực) `IR_Power`

**Là gì:** Tài nguyên tiêu hao chính để đánh ải (Cốt Truyện, Tinh Anh, ải đặc biệt). Hết Thể Lực = không cày được nguyên liệu → van tiết quan trọng nhất mỗi ngày.

### Cơ chế & số liệu (config THẬT)

| Thông số | Giá trị | Nguồn |
|---|---|---|
| Mua 1 lần được | **80 Thể Lực** | `Power_BuyNum = 80` (`ConfigValue.lua:11533`) |
| Trần tích trữ | **3000** | `Power_Max = 3000` (`ConfigValue.lua:11538`) |
| Giá mua (thang KC theo lượt/ngày, 20 mốc) | `{0, 200, 400, 600, 800, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 6000, 7000, 8000, 10000, 15000, 20000}` | `Power_Price` (`ConfigValue.lua:11507–11528`) |
| Số lần mua/ngày (VIP0) | **4 lần** | `BuyStaminaTimes = 4` (`Vip.lua:11`) |
| Hồi tự nhiên | "mỗi X phút hồi 1 điểm" — chuỗi `每${min}分钟恢复1点体力` | `Translate_1.lua:7798` (giá trị `min` server nắm, không lộ trong config client) |

**Số lần mua Thể Lực tăng theo VIP** (`Vip.lua`): VIP0 = 4 · VIP1 = 5 · VIP2 = 6 · VIP3 = 7 · VIP4 = 8 · VIP5 = 9 · VIP6 = 10 lần/ngày (lên đến 18 lần ở VIP18).

### Cách kiếm thêm / mẹo

- **Mua bằng Kim Cương** (màn `BuyEnergyView`, `ItemSource.lua:963–968`, `ResourceType = BUY_POWER`). Vài lượt đầu rẻ (200–800 KC), tăng nhanh → **chỉ mua các lượt rẻ**.
- **"Chúc Phúc của Shermie" (夏尔美的祝福 / KOF Quản Gia):** đăng ký khi **Cấp Đội Ngũ ≥ 10** (`Translate_1.lua:84601`). Đặc quyền: bật KOF Quản Gia, **tốc hồi điểm kỹ năng x2**, quà free ngày, **Đấu Trường thua vẫn +2 điểm**, **+30 Thể Lực free/ngày**. ⚠️ Một mô tả quảng bá khác (`Translate_1.lua:84569`) ghi **+100 Thể Lực/ngày** — hai chuỗi trong source lệch nhau, chọn 30 theo điều khoản đăng ký chính thức.
- **Tinh Mạch (星脉):** Vice/Mature (薇丝麦卓) full = **2 lần Thể Lực + Vàng free/ngày**; Daimon (大门) full = **+vài Thể Lực mỗi giờ**; Nakoruru full = 1 lượt chiêu mộ free/ngày (guide `Translate_1.lua:11206`). Lợi ích lớn nhất từ mảnh tướng resource thấp.
- **Vật phẩm hồi:** Dược Tễ Thể Lực Nhỏ/Vừa/Lớn (`IM_PowerUp1/2/3`, SubType `POWER_UP`).

> Guide in-game khuyên giai đoạn đầu **mua đầy Thể Lực** (giá đã rẻ sau nhiều lần chỉnh), về sau canh mốc **nhiệm vụ tiêu 880 KC/ngày** để lên kế hoạch (`Translate_1.lua:11206`).

---

## 3. Vàng (金币 — Vàng) `IR_Gold`

**Là gì:** Tiền tệ nâng cấp phổ thông — tiêu vào Nâng Cấp võ sĩ, Thăng Phẩm, Thăng Sao, trang bị. Luôn thiếu ở mọi giai đoạn.

### Nguồn kiếm

| Nguồn | Cơ chế | File |
|---|---|---|
| **Điểm Kim** (点金) | Màn `BuyGoldView`, đổi KC lấy Vàng, có bạo kích | `ItemSource.lua:949–954` (`BUY_GOLD`) |
| Giá Điểm Kim (thang KC, 30 mốc) | `{0, 40, 40, 64, 64, 64, 64, 96, 96, 96, 96, 128, 128, 128, 160, 160, 200, 200, 200, 240, 240, 240, 288, 288, 320, 320, 480, 500, 500, 500}` | `BuyGold_Price` (`ConfigValue.lua:11563–11594`) |
| Số lần Điểm Kim/ngày | **VIP0 = 6**, VIP1 = **70**, VIP2 = 80, VIP3 = 100, VIP6 = 130 (jump lớn từ VIP0→VIP1) | `BuyGoldTimes` (`Vip.lua:8`) |
| **Bí Bảo Tài Đoàn** (财团秘宝) | Phó bản Vàng chuyên biệt, **reset mỗi ngày** (thứ 1–7), mở **Cấp Đội 26** | `StageSp_Gold` (`StageSp.lua:4`); tên hiển thị = 财团秘宝; unlock `UnlockSystem.lua` (Lv26) |
| Ải Cốt Truyện / Tinh Anh | Rơi Vàng khi qua ải + quét nhanh | `ItemSource.lua` (STAGE_NORMAL/ELITE) |

> ⚠️ **Đừng nhầm với 料理之劫 (Kiếp Nạn Ẩm Thực).** Đó là phó bản **Ẩm Thực (美食)** riêng (`StageSp_Food`, `ResourceType = STAGE_FOOD`, mở Cấp Đội 34) — sản xuất nguyên liệu **美食**, KHÔNG phải Vàng. Phó bản Vàng đúng tên là **财团秘宝 (Bí Bảo Tài Đoàn)**.

**Mẹo:** Guide khuyên "**Điểm Kim mỗi ngày 4 lần, làm đủ nhiệm vụ là được**" (`Translate_1.lua:11206`) — dù cap VIP0 là 6. Giá quy đổi của Vàng chỉ `Value = 0.002` KC/đơn vị (`Item.lua:49238`) → đừng phí KC mua Vàng ngoài các lượt rẻ.

---

## 4. Kim Cương (钻石 — Kim Cương) `IR_Diamond`

**Là gì:** Tiền tệ cao cấp (`Value = 1`, `Item.lua:49263`). Dùng cho: mua Thể Lực/Vàng, chiêu mộ, Máy Gắp Thú (扭蛋机), Đấu Trường, Phong Thần...

### Nguồn kiếm (F2P)

- **Nhiệm vụ ngày + Nhiệm vụ trưởng thành** (`Task.lua`, `TaskGrowUp.lua`).
- **Đấu Trường (竞技场):** đủ **20 điểm/ngày** → Mảnh Vạn Năng + Vàng + coin đấu trường; guide ghi combo "**115 KC lấy được 万能 + coin + vàng**" nếu không lật kèo (`Translate_1.lua:11206`).
- **Quỹ Trưởng Thành / Quỹ Lực Chiến (成长基金):** "phải mua, tặng KC free" — hai mục tiêu KC đầu game là **thưởng Lực Chiến** và **KC trong quỹ** (guide).
- **Thành tựu, sự kiện (ACTIVITY, 135 nguồn), Máy Gắp Thú** (đôi khi tặng **588 KC** — `Translate_1.lua:11206`).
- **Nạp / Thẻ Tháng:** `ItemSource.lua:956–961` (CHARGE) và `IR_Diamond_2` (月卡 Thẻ Tháng, `ItemSource.lua:1075–1080`).

---

## 5. EXP Võ Sĩ (Kinh Nghiệm Võ Sĩ)

**Là gì:** Điểm kinh nghiệm để **Nâng Cấp** (升级) võ sĩ. Nạp qua vật phẩm Sô-cô-la Kinh Nghiệm (SubType `EXP_UP`, dùng ở `StrengthenView tab 2`, `Item.lua:70095`).

### Vật phẩm & đường cong

| Vật phẩm | Tên (CN) | ID |
|---|---|---|
| Sô-cô-la KN (Nhỏ) | 经验巧克力（小） | `IM_ExpUp1` (`Item.lua:70094`) |
| Sô-cô-la KN (Lớn) | 经验巧克力（大） | `IM_ExpUp2` (`Item.lua:70125`) |
| Thanh Coco KN (Nhỏ) | 经验可可棒（小） | `IM_ExpUp3` (`Item.lua:70156`) |

**Đường cong EXP mỗi cấp** (`HeroExp.lua:4–35`): Lv1→2 = 30, 2→3 = 50, 3→4 = 80, 4→5 = 120, 5→6 = 160, 6→7 = 200, 7→8 = 240, 8→9 = 300, 9→10 = 360, 10→11 = 480...

- **Trần cấp võ sĩ:** `Hero_Maxlevel = 150` (`ConfigValue.lua:13385`).
- **Mua EXP trực tiếp:** tối đa **100 lần** (`Hero_BuyExp_MaxCount = 100`, `ConfigValue.lua:13429`).

### Nguồn kiếm (`ItemSource.lua`)

| Nguồn | Màn | ResourceType |
|---|---|---|
| **Ải Cốt Truyện** | `stageView` | `STAGE_NORMAL` (`ItemSource.lua:8578`) |
| **Xưởng Coco** (可可工坊) | `SpStageMainView tab=exp` | `STAGE_EXP` (`ItemSource.lua:8676`) — phó bản EXP, mở Cấp Đội 14 (`StageSp_Exp`) |
| Chiêu Mộ Vàng (byproduct) | `recruitHeroView` | `DRAW_CARD` (`ItemSource.lua:8683`) |

---

## 6. Ngọc Thăng Phẩm (Bảo Thạch Công/Thủ/Kỹ) — hệ 升品

**Là gì:** Nguyên liệu **Thăng Phẩm Võ Sĩ** (格斗家升品, `Translate_1.lua:4198`). Tất cả SubType `HERO_QUALITY`, dùng ở `StrengthenView tab 3`. Có 2 dòng:

### 6.1 Bảo Thạch (宝石) — bậc thường/trung, theo màu

| Loại | Tên Việt (bản dịch, bậc Phỉ Thúy) | ID |
|---|---|---|
| Công (攻击宝石) | **Bảo Thạch Công Kích Phỉ Thúy** | `IM_QS201` (`Item.lua:62289`) |
| Thủ (防御宝石) | **Bảo Thạch Phòng Ngự Phỉ Thúy** | `IM_QS202` (`Item.lua:62318`) |
| Kỹ (技能宝石) | **Bảo Thạch Kỹ Năng Phỉ Thúy** | `IM_QS203` (`Item.lua:62347`) |

Có **18 bậc màu tăng dần** (không phải 10), mỗi màu 3 loại Công/Thủ/Kỹ (`Item.lua:62289–63799`):
Phỉ Thúy → Mặc Lục → Bích Ngọc → Hải Lam → Nguyệt Quang → Cẩn Thanh → Tử Tinh → Tử Huỳnh → Tô Kỷ → Hắc Diệu → **Huy Long → Linh Hạc → Nhật Quang → Diệu Viêm → Đế Vương → Long Mạch → Thần Thánh → Hồng Liên**. Trên nữa còn **Vô Hạn** (无限, `Item.lua:63966`).

### 6.2 Nguồn Thạch (源石) — bậc cao Thăng Phẩm (Quality 5)

- **Nguồn Thạch Đả** (攻之源石) `IM_PSDps` — Quality 5 (`Item.lua:63887`)
- **Nguồn Thạch Thủ** (防之源石) `IM_PSTank` (`Item.lua:63913`)
- **Nguồn Thạch Kĩ** (技之源石) `IM_PSGank` (cùng dải)

### Cơ chế Thăng Phẩm (config THẬT)

Ví dụ Phẩm 10 của võ sĩ H001 (`HeroQualityBase.lua:4–28`):
- Tốn **5000 Vàng** + **Thuốc Cường Hóa (强化药剂 / IM_QualityUp) x3** + **Ngọc Công x1 + Thủ x1 + Kỹ x1**.
- Mỗi bậc kế cần Vàng tăng (Q20 = 10000 Vàng...) + `LevelRequest` cao hơn.
- **Trần phẩm:** `Hero_Maxquality = 70` (`ConfigValue.lua:13395`). Thăng phẩm tăng chỉ số cá nhân (`升品阶会提升个人属性值`, `Translate_1.lua:50576`). Thăng phẩm còn bị chặn bởi **Cấp Đội Ngũ** (`队伍等级不满足升品要求`, `Translate_1.lua:5558`).

### Nguồn kiếm ngọc

| Nguồn | ResourceType | File |
|---|---|---|
| **Ải Cốt Truyện** (M02P01...) | `STAGE_NORMAL` | `ItemSource.lua:1852, 1859` |
| **Tiệm Tạp Hóa** (ShopView Shop1) | `SHOP` | `ItemSource.lua:2895` |
| Thuốc Cường Hóa (强化药剂) | `STAGE_NORMAL` | `ItemSource.lua:8480` (`IM_QualityUp_1`) |

> ⚠️ **Đừng nhầm với hệ Đột Phá Tiềm Năng.** Có hệ riêng **Đột Phá Tiềm Năng** (潜能突破, mở **Cấp Đội 56** — xem mục 11) dùng **潜能源石** (nhặt từ hoạt động **đập quặng thần bí / 击碎矿石**, `Translate_1.lua:13890`), KHÁC ngọc Thăng Phẩm dù cùng nằm ở `tab 3`.

---

## 7. Mảnh Vạn Năng (万能碎片) & Mảnh Tướng

**Là gì:** Mảnh để **Thăng Sao** (升星) võ sĩ — trục養成 ưu tiên số 1 (guide xếp Thăng Sao đầu bảng Lực Chiến).

### Mảnh Vạn Năng (万能碎片 — Mảnh Vạn Năng)

- `IM_FAll13`, SubType `HERO_STAR`, dùng ở `StrengthenView tab 5` (Thăng Sao) — `Item.lua:57558`.
- **Mảnh vạn năng theo độ hiếm** (`Hero_StarFragment`, `ConfigValue.lua:13397`): R/SR/SRP → `IM_FAll13`; SSR/UR → `IM_FAll14`; SP → `IM_FAll15`. (Bản đồ hiếm: 11=R, 12=SR, 13=SRP, 14=SSR, 15=UR, 16=SP — `ConfigValue.lua:13409`).
- Trần sao: `Hero_Maxstar = 7` (`ConfigValue.lua:13390`).

### Nguồn kiếm mảnh

- **Gacha (chiêu mộ):** 10-liên **đầu tiên chắc chắn ra SR+**; 2 SSR trong pool là **Ukyo (橘右京)** và **K'** — chỉ ra **mảnh**, có bảo hiểm **~150 mảnh** là đủ (`Translate_1.lua:11206`).
- **Đấu Trường:** đủ 20 điểm/ngày → **Mảnh Vạn Năng** + Vàng + coin.
- **Iori Xã Đoàn (社团八神):** guide gọi là **"nơi sản xuất tính hiệu quả cao nhất game"** — mục 10 KC bắt buộc click, 20/30 KC tùy, cuối bảng còn tặng thưởng hạng 1, may mắn ra vài chục mảnh Iori (`Translate_1.lua:11206`).

---

## 8. Tinh Hoa Chiến Hồn (战魂精华) `IR_SoulCream`

**Là gì:** Tài nguyên nuôi **Chiến Hồn** (战魂 — hệ養成 lớn thứ 2 sau tướng). Chiến Hồn 7★ là đòn bẩy Lực Chiến FREE tốt nhất khi kẹt cap cấp.

### Vật phẩm

| Bậc | Tên Việt | ID | Quality |
|---|---|---|---|
| Tài nguyên chính | **Tinh Hoa Chiến Hồn** | `IR_SoulCream` (`Item.lua:50497`, `HeroSoulBagView tab 3`) | 4 |
| Sơ cấp (初级) | Tinh Hoa Chiến Hồn Sơ Cấp | `IM_SoulUp1` (`Item.lua:57663`) | 2 |
| Trung cấp (中级) | Tinh Hoa Chiến Hồn Trung Cấp | `IM_SoulUp2` (`Item.lua:57637`) | 3 |
| Cao cấp (高级) | Tinh Hoa Chiến Hồn Cao Cấp | `IM_SoulUp3` (`Item.lua:57611`) | 4 |

Ba `IM_SoulUp*` SubType `SOUL_UP`, dùng ở `StrengthenView tab 6`.

### Nguồn kiếm (`ItemSource.lua`)

- **Phân giải Chứng Chỉ Chiến Hồn hoặc Chiến Hồn 1–3 sao trùng** → ra Tinh Hoa (`Text = Source_DrawEquip_Cream`, `ItemSource.lua:8459`).
- **Chiêu Mộ Trang Bị** (`RecruitEquipView`, `ResourceType = DRAW_EQUIP`) là màn xuất.
- **Thần Điện Chiến Hồn** (战魂神殿 / HeroSoulTemple) mở **Cấp Đội 50** (xem mục 11).

> Guide gợi ý 2 Chiến Hồn 3★ rẻ mà mạnh cho người ít nạp: **Chiến Hồn Benimaru (红丸) 3★** và **Chiến Hồn Maxima (马克西马) 3★** (`Translate_1.lua:11206`).

---

## 9. Nguồn Thần Khí (神器之源) `IR_ArtiUp`

**Là gì:** Tài nguyên nâng cấp **Thần Khí**. Task gọi "神器精华" — nhưng trong config item **không tồn tại 神器精华**; tên chuẩn là **神器之源 = Nguồn Thần Khí** (`IR_ArtiUp`, SubType `ARTI_UP`, `Item.lua:49436`).

### Nguồn kiếm — hộp sao khi qua ải (`ItemSource.lua`)

| Nguồn | Màn | ResourceType |
|---|---|---|
| Hộp ải **Cốt Truyện** | `stageView` | `STAGE_NORMAL` (`ItemSource.lua:1012–1017`) |
| Hộp ải **Tinh Anh** | `stageView stageType=ELITE` | `STAGE_ELITE` (`ItemSource.lua:1054–1059`) |
| Hộp ải **Ác Mộng** | `stageView stageType=HARD` | `STAGE_HARD` (`ItemSource.lua:1068–1073`) |

- Hệ thống dùng nguồn này — **Siêu Thần Khí (超神器 / SuperArtifact)** — mở khoá ở **Cấp Đội 54** (không phải 52; xem mục 11). Ải Ác Mộng (nguồn dày nhất) mở **Cấp Đội 52**.

---

## 10. Tiền Phong Thần (封神币) `IR_Myth`

**Là gì:** Tiền tệ hệ **Phong Thần** (封神). `IR_Myth`, SubType `MYTH` (`Item.lua:49606`). Mô tả in-game: *"封神币，可在封神之路中获得"* — Tiền Phong Thần, nhận ở Con Đường Phong Thần (`Translate_1.lua:10998`).

### Nguồn & cơ chế

- **Con Đường Phong Thần** (封神之路 — màn `mythMapView`, `ItemSource.lua:1061–1066`), chế độ **roguelike đánh tầng**. Hệ Phong Thần (`Myth_System`) mở **Cấp Đội 28**.
- **Số lượt thử thách:** lưu tối đa **3 lượt** + hồi **1 lượt/ngày** (`Myth_ChallengeTimes: storage=3, addDaily=1`, `ConfigValue.lua:1131–1134`).
- **Quét tầng nhanh:** guide ghi *"封神之路每天可以最多扫荡X层"* (`Translate_1.lua:4058`) và có mốc **tăng sản lượng Tiền Phong Thần** (`Translate_1.lua:4062`).

> Guide: mục **Phong Thần 10 KC nên mua 1 lần/ngày, đặc biệt người chơi đội Lửa vì rất cần Tiền Phong Thần** (`Translate_1.lua:11206`).

---

## 11. Trần cấp Lv50 → 60 mở khoá gì?

**Cơ chế cấp:** Trục cấp trung tâm là **Cấp Đội Ngũ** (队伍等级). Nó gate hầu hết hệ thống (điều kiện `LEVEL` trong `UnlockSystem.lua`) và cả Thăng Phẩm (`Translate_1.lua:5558`). Có cơ chế phạt/điều kiện khi võ sĩ ra trận **lệch cấp so với Cấp Đội** quá `factor` (`上阵的任意一名格斗家等级与队伍等级相差大于等于`, `Translate_1.lua:40836`). Trần cấp võ sĩ tuyệt đối = 150 (`Hero_Maxlevel`); trần `Player_Maxlevel = 120` (`ConfigValue.lua:11543`).
*(Lưu ý: chuỗi `装备等级不可超过格斗家等级` ở `Translate_1.lua:7378` nói về **trang bị ≤ cấp võ sĩ**, KHÔNG phải cấp đội — đừng dùng nó làm căn cứ.)*

**Đột Phá Giới Hạn (限界突破 / Unlock_Break)** mở **Cấp Đội 45**, cho phép vượt trần cấp ở các mốc sao (`${star}星可突破`, `Translate_1.lua:7354`; xác nhận "升至7星...突破格斗家上限，激活限界突破" ở `Translate_1.lua:75849`).

### Hệ thống mở theo Cấp Đội Ngũ (trích `UnlockSystem.lua`, điều kiện `LEVEL`)

| Cấp | Hệ thống mở (tên hiển thị) | Ý nghĩa tài nguyên |
|---|---|---|
| **45** | Đột Phá Giới Hạn (限界突破) · Cờ Nhân PvP (AutoChessPVP) | Vượt trần cấp võ sĩ |
| **48** | **Sân Tập Xã Đoàn** (社团训练场 / Club_Train) | Buff "dùng cả đời" |
| **50** | **Yểm Trợ** (援护 / HeroAssist) · **Thần Điện Chiến Hồn** (战魂神殿) · **Đấu Trường Liên Server** (跨服竞技场) | Mở kho Tinh Hoa Chiến Hồn |
| **51** | Mối Đe Doạ Trên Bầu Trời (天空中的威胁 / Unlock_Plane) | Minigame máy bay |
| **52** | **Phó Bản Ác Mộng** (噩梦副本 / Hard_Stage) | Nguồn Thần Khí bậc cao (hộp STAGE_HARD) |
| **53** | **Lưu Phái** (流派 / Sect) · Phó bản Lưu Phái (世界道场) | — |
| **54** | **Thần Khí** (超神器 / SuperArtifact) · **Biến Thân / Lột Xác** (格斗家蜕变) | Bắt đầu tiêu Nguồn Thần Khí |
| **55** | Chiến Lính Đánh Thuê KOF (拳皇佣兵战 / MercenaryWar) | — |
| **56** | **Đột Phá Tiềm Năng** (潜能突破 / HeroPotential) · Cầu Nguyện Hồn (战魂祈愿) · Đấu Trường Thứ Nguyên (维度竞技场) · Can Thiệp (援护系统 / Intervene) | Bắt đầu tiêu 潜能源石 |
| **57** | Tranh Đoạt Tài Nguyên (资源争夺战 / liên server) | — |
| **58** | **Ấn Ký** (印记 / Signet) · Chiêu Mộ Ấn Ký | — |
| **60** | **Trận Vinh Quang** (荣耀之战) · Trang bị/Lưu phái nâng 1 chạm | — |
| **62** | **Tháp Đại Xà** (大蛇之塔 / Infinite_Tower) | — |
| **64** | **Cờ Nhân** (拳魂战牌 / AutoChess) | — |

*(Nguồn: `UnlockSystem.lua`, các mục có `Condition.LEVEL`, tên hiển thị resolve từ `Translate_*.lua`.)*

**Tóm lại Lv50→60 mở dồn dập:** Yểm Trợ + Thần Điện Chiến Hồn (**50**) → Ác Mộng (**52**) → Lưu Phái (**53**) → **Thần Khí + Biến Thân (54)** → Lính Đánh Thuê (**55**) → **Tiềm Năng (56)** → Ấn Ký (**58**) → Trận Vinh Quang (**60**). Đây là giai đoạn "nở" nhiều nguồn養成 — **ưu tiên cày Cấp Đội qua ngưỡng 50, 52, 54, 56** để mở các van tài nguyên chính (Chiến Hồn → Thần Khí → Tiềm Năng).

---

## 12. Lộ trình hằng ngày tối ưu (từ guide in-game `Translate_1.lua:11206`)

### Ưu tiên Lực Chiến (thứ tự vàng — trích nguyên guide)
> **Thăng Sao (升星) → Thăng Phẩm (升品) → Nâng Cấp (升级) → Trang Bị (装备) → Kỹ Năng (技能) → Tinh Mạch (星脉)**

### Checklist mỗi ngày (F2P/ít nạp)

| Việc | Mục tiêu | Phần thưởng |
|---|---|---|
| **Đấu Trường** | Đủ **20 điểm** (đánh Lực Chiến thấp để không lật kèo, thua chỉ +1 điểm) | Mảnh Vạn Năng + Vàng + coin |
| **Điểm Kim** (点金) | 4 lần (đủ nhiệm vụ) | Vàng |
| **Chiêu mộ** | Đủ 3 lần/ngày (nửa giá + free + Tinh Mạch Nakoruru) | Mảnh/tướng |
| **Quỹ** (基金) | Mua hết | KC free |
| **Máy Gắp Thú** (扭蛋机) | 2 lần/ngày | Đá Thức Tỉnh (觉醒石), đôi khi 588 KC |
| **Iori Xã Đoàn** (社团八神) | Click mục 10 KC (20/30 tùy) | Mảnh Iori — nguồn hiệu quả nhất |
| **Phong Thần** (封神) | Mua mục 10 KC 1 lần | Tiền Phong Thần |
| **Bí Bảo Tài Đoàn + Xưởng Coco** | Đánh/quét hết lượt ngày | Vàng (财团秘宝) + EXP (可可工坊) |
| **Tiêu KC** | Canh mốc **nhiệm vụ tiêu 880 KC/ngày** | Thưởng nhiệm vụ |
| **Sân Tập Xã Đoàn** (社团训练场, mở Lv48) | Mở hết | "Dùng cả đời" |

### Ưu tiên Tinh Mạch (từ mảnh resource thấp)
1. **Vice/Mature (薇丝麦卓):** full → 2 lần Thể Lực + Vàng free/ngày
2. **Daimon (大门):** full → +Thể Lực mỗi giờ
3. **Nakoruru (娜可露露):** full → 1 lượt chiêu mộ free/ngày

### Đội hình khuyến nghị cho ít nạp (guide)
- **Đội Lửa (火队):** Kyo (草薙京) · Saisyu (草薙柴舟) · Mai (不知火舞) · Chin Gentsai (镇元斋) · Li Liehuo (李烈火) · Yan-Ke (炎克) → nhiều tướng **đổi mảnh free mỗi ngày**, kể cả **vũ khí Thức Tỉnh cũng đổi được** → cực hợp F2P.
- **Cực Hạn Lưu / Kyokugen (极限流):** Robert (罗伯特) · Ryo (坂崎良) · Yuri (坂崎百合) · Takuma (坂崎琢磨, đầu game thay bằng Daimon/大门).

---

## 13. Mini-Glossary Trung → Việt (thuật ngữ trang này)

| Trung | Việt (bản dịch chuẩn tm.json) | Ghi chú |
|---|---|---|
| 体力 | Thể Lực | Năng lượng đánh ải |
| 金币 | Vàng | Tiền nâng cấp |
| 钻石 | Kim Cương | Tiền cao cấp |
| 点金 | Điểm Kim | Đổi KC → Vàng |
| 战力 | Lực Chiến | Sức mạnh tổng |
| 格斗家 | Võ Sĩ | Nhân vật/tướng |
| 队伍等级 | Cấp Đội Ngũ | Cấp trung tâm, gate hệ thống + Thăng Phẩm |
| 升级 / 升星 / 升品 | Nâng Cấp / Thăng Sao / Thăng Phẩm | 3 trục養成 |
| 限界突破 | Đột Phá Giới Hạn | Mở Cấp Đội 45, vượt trần cấp |
| 潜能突破 | Đột Phá Tiềm Năng | Mở Cấp Đội 56, dùng 潜能源石 |
| 宝石 (攻/防/技) | Bảo Thạch (Công/Thủ/Kỹ) | Ngọc Thăng Phẩm — 18 bậc màu |
| 源石 (攻/防/技) | Nguồn Thạch (Đả/Thủ/Kĩ) | Ngọc Thăng Phẩm bậc cao (Quality 5) |
| 强化药剂 | Thuốc Cường Hóa | Vật liệu Thăng Phẩm (IM_QualityUp) |
| 万能碎片 | Mảnh Vạn Năng | Thăng Sao |
| 战魂 / 战魂精华 | Chiến Hồn / Tinh Hoa Chiến Hồn | Hệ養成 số 2 |
| 神器 / 超神器 / 神器之源 | Thần Khí / Siêu Thần Khí / Nguồn Thần Khí | Hệ mở Cấp Đội 54; item = 神器之源 |
| 封神 / 封神币 / 封神之路 | Phong Thần / Tiền Phong Thần / Con Đường Phong Thần | Roguelike |
| 援护 | Yểm Trợ | Mở Cấp Đội 50 (HeroAssist); Intervene = 援护系统 (Lv56) |
| 星脉 | Tinh Mạch | Buff từ mảnh tướng |
| 觉醒 | Thức Tỉnh | Vũ khí thức tỉnh |
| 主线 / 精英 / 噩梦副本 | Ải Cốt Truyện / Tinh Anh / Phó Bản Ác Mộng | 3 loại ải; Ác Mộng mở Lv52 |
| 财团秘宝 | Bí Bảo Tài Đoàn | **Phó bản Vàng** (mở Lv26) |
| 料理之劫 | Kiếp Nạn Ẩm Thực | Phó bản **Ẩm Thực/美食** (mở Lv34), KHÔNG phải Vàng |
| 可可工坊 | Xưởng Coco | Phó bản EXP (mở Lv14) |
| 竞技场 | Đấu Trường | 20 điểm/ngày |
| 杂货商店 (Shop1) | Cửa Hàng Tạp Hóa | Nguồn ngọc |
| 社团 / 八神 | Xã Đoàn / Iori | Guild + gameplay Iori |
| 扭蛋机 | Máy Gắp Thú | Gacha (chủ yếu ra 觉醒石 / Đá Thức Tỉnh, đôi khi KC) |
| 流派 | Lưu Phái | Sect, mở Cấp Đội 53 |
| 印记 | Ấn Ký | Mở Cấp Đội 58 |
| 荣耀之战 | Trận Vinh Quang | Mở Cấp Đội 60 |
| 大蛇之塔 (Infinite_Tower) | Tháp Đại Xà | Mở Cấp Đội 62 |
| 拳魂战牌 | Cờ Nhân (AutoChess) | Mở Cấp Đội 64 |
| 拳皇佣兵战 | Chiến Lính Đánh Thuê KOF | Mở Cấp Đội 55 |
| 夏尔美的祝福 | Chúc Phúc của Shermie | Đăng ký (Cấp Đội ≥10), +30 Thể Lực/ngày |

---

**Các file nguồn chính đã đọc** (đường dẫn tuyệt đối):
- `C:\Users\NTD\Desktop\game\kof98-platform\reference\client-src\config\ItemSource.lua` (bản đồ nguồn)
- `...\config\Item.lua` (định nghĩa item + CN_Name — dòng trích là dòng `CN_Name`)
- `...\config\ConfigValue.lua` (số Power/Gold/Hero cap/Myth)
- `...\config\Vip.lua` (số lần mua/ngày theo VIP)
- `...\config\HeroExp.lua`, `HeroQualityBase.lua` (養成)
- `...\config\StageSp.lua` (phó bản đặc biệt: 财团秘宝 Vàng / 可可工坊 EXP / 料理之劫 Ẩm Thực / 世界道场 Lưu Phái)
- `...\config\UnlockSystem.lua` (mở khoá theo Cấp Đội — 142 mục điều kiện `LEVEL`)
- `...\config\Translate_1.lua:11206` (guide chiến thuật 7 ngày in-game — nguồn roadmap)
- `C:\Users\NTD\Desktop\game\kof98-platform\data\i18n\tm.json` (46.242 cặp dịch Việt)

---

> ## Độ tin cậy
>
> **Đã KIỂM CHỨNG khớp source (giữ nguyên bản nháp):** toàn bộ số Thể Lực (`Power_BuyNum=80`, `Power_Max=3000`, `Power_Price`), giá Điểm Kim (`BuyGold_Price`), bảng VIP (`BuyStaminaTimes` 4→10, `BuyGoldTimes` 6/70/80/130), trần Hero (`Maxlevel=150`, `Maxstar=7`, `Maxquality=70`, `BuyExp_MaxCount=100`), `Hero_StarFragment` + rarity map, `Myth_ChallengeTimes` (3/1), đường cong `HeroExp` (30/50/80/120/160/200/240/300), chi phí `HeroQualityBase` H001_Q10 (5000 Vàng + Cường Hóa x3 + 3 ngọc), mọi `CN_Name` item (Gold Value 0.002, Diamond Value 1, các ID currency + IM_ExpUp/QS/FAll/SoulUp/PSDps), toàn bộ màn nguồn `ItemSource.lua` (BuyGold/BuyEnergy/CHARGE/MonthCard/Myth/ArtiUp box + exp/gem/soul/quality), thống kê ResourceType (234/203/164/135/89), và nội dung guide `Translate_1.lua:11206` (thứ tự ưu tiên, Tinh Mạch, 150 pity, arena 20đ/115KC, 880KC, 588KC, Iori, Benimaru/Maxima 3★, đội Lửa/Cực Hạn).
>
> **ĐÃ SỬA (bản nháp SAI):**
> 1. **Phó bản Vàng:** bản nháp gọi nhầm là **料理之劫 (Kiếp Nạn Ẩm Thực)**. Thực tế `StageSp_Gold` tên hiển thị = **财团秘宝 (Bí Bảo Tài Đoàn)**, mở Cấp Đội 26. 料理之劫 là phó bản **Ẩm Thực (美食, StageSp_Food, ResourceType STAGE_FOOD, Lv34)** — nguồn khác hẳn. Xác nhận chéo qua VIP desc "财团秘宝金币产出" vs "料理之劫美食产出".
> 2. **Số bậc ngọc Thăng Phẩm:** không phải "10 bậc màu" mà là **18 bậc** (Phỉ Thúy…Hồng Liên) + Vô Hạn, mỗi bậc 3 loại (`Item.lua:62289–63799`). Bản nháp dừng ở bậc thứ 10.
> 3. **Bảng mở khoá Lv45–64 (mục 11) — nhiều lỗi:** (a) **Lv48** không phải Ác Mộng mà là **Sân Tập Xã Đoàn** (Club_Train); (b) **Lv51** không phải Lính Đánh Thuê mà là **Unlock_Plane** (天空中的威胁) — Lính Đánh Thuê (佣兵战) thực ở **Lv55**; (c) **Ác Mộng (噩梦副本)** mở **Lv52** (bản nháp để nhầm Lv48); (d) **Thần Khí (超神器) + Biến Thân** mở **Lv54** (bản nháp để nhầm Lv52); (e) **Tiềm Năng (潜能突破)** mở **Lv56** (bản nháp để nhầm Lv54). Kéo theo: mục 9 "Thần Khí mở Lv52" → **Lv54**; mục 6 "Tiềm Năng mở Lv54" → **Lv56**.
> 4. **SSR pool (mục 7):** 橘右京 = **Ukyo (Tachibana)**, không phải "Kyo Kusanae".
> 5. **Cơ chế cấp (mục 11):** bỏ trích sai `Translate_1.lua:7378` (chuỗi đó nói "trang bị ≤ cấp võ sĩ"). Thay bằng `40836` (lệch cấp đội) + `5558` (Cấp Đội gate Thăng Phẩm).
> 6. **Tên hiển thị (glossary):** 荣耀之战 = **Trận Vinh Quang** (không "Chiến Vinh Quang/荣耀战"); Infinite_Tower hiển thị **大蛇之塔 = Tháp Đại Xà** (không "无限塔/Tháp Vô Hạn"); 流派 = **Lưu Phái** (Sect); 扭蛋机 ra chủ yếu **觉醒石 (Đá Thức Tỉnh)** chứ không phải "đá tiềm năng"; 潜能源石 từ **đập quặng (击碎矿石)** chứ không xác nhận là 扭蛋机.
> 7. **神器精华:** không tồn tại như item — tên chuẩn là **神器之源 (Nguồn Thần Khí)** (đã ghi rõ).
>
> **CHƯA CHẮC / cần bắt live để chốt:**
> - **Chúc Phúc Shermie tặng bao nhiêu Thể Lực/ngày:** source lệch — điều khoản đăng ký (`:84601`) ghi **30**, chuỗi quảng bá (`:84569`) ghi **100**. Đã chọn 30 nhưng cần xác minh in-game.
> - **Tốc độ hồi Thể Lực tự nhiên:** client chỉ có template `每${min}分钟恢复1点体力` (`Translate_1.lua:7798`), giá trị `min` do server nắm.
> - **Sản lượng Tiền Phong Thần/tầng cụ thể** và **số tầng quét/ngày:** nằm trong `Reward_*.lua`/`MythSweepFloor.lua` theo từng map, chưa bung số.
> - **Số dòng `Item.lua`** trích theo **dòng `CN_Name`** (đã kiểm chứng đúng vị trí); vài trích `ItemSource.lua` dòng-cao lệch ±1 dòng so với block header (không ảnh hưởng nội dung).
> - **Romaji tên tướng đội Lửa** (Saisyu/Li Liehuo/Yan-Ke) suy từ chữ Hán, chưa đối chiếu tên hiển thị chính thức của bản Việt hoá.