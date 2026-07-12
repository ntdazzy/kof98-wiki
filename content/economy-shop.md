# Kinh tế & Cửa hàng

I have now verified every number and mechanism against source. All shop-item prices (ShopArena/KOF/Myth/Club), currency names, shop configs, and the refresh/reset logic check out. I found several errors to fix. Here is the corrected final wiki.

---

# 💰 Kinh Tế & Cửa Hàng (经济 & 商店 / Economy & Shops)

> Trang wiki tổng hợp toàn bộ hệ thống tiền tệ và cửa hàng của KOF98. Mọi con số trích trực tiếp từ source Lua client tại `reference/client-src/config/`. Định dạng nguồn: `tên_file:dòng`.

---

## 1. Tổng quan — Hệ thống hoạt động thế nào

Game có **2 lớp** trong hệ thống mua bán:

1. **Tiền tệ (Currency — mã `IR_*`)**: mỗi chế độ chơi (Đấu Trường, Phong Thần, Bang Hội...) sinh ra một loại "xu" riêng. Bạn không mua xu bằng tiền thật — bạn **kiếm bằng cách chơi chế độ tương ứng**.
2. **Cửa hàng (Shop — `Shop1`..`Shop15`, `GMShop1`..`GMShop10`)**: mỗi cửa hàng nhận **1 loại xu chính** (`DefaultCostType`) để mua hàng; **10 cửa hàng** dùng **Kim Cương (钻石)** để làm mới (refresh) gian hàng.

Nói ngắn gọn: **Chơi chế độ X → kiếm Xu X → tiêu Xu X ở Cửa Hàng X để đổi mảnh Võ Sĩ (格斗家) / Chiến Hồn (战魂) / trang bị / vật phẩm nâng cấp.**

Cấu hình gốc: mỗi cửa hàng là một bản ghi trong `config/Shop.lua`; danh sách món hàng (giá, số lượng, tồn kho) nằm trong các `config/Reward_*.lua`; tên vật phẩm trong `config/Item.lua`; tên tiếng Trung của tiền/cửa hàng trong `config/Translate_1..5.lua`.

---

## 2. Các loại tiền tệ — Kiếm ở đâu?

Bảng dưới liệt kê **mọi loại tiền** dùng trong hệ thống cửa hàng, kèm tên Trung gốc, tên Việt chuẩn (theo `data/i18n/tm.json`) và nguồn kiếm/dùng.

| Mã | Tên Trung | Tên Việt | Kiếm/Dùng (nguồn) | Dùng cho Shop |
|---|---|---|---|---|
| `IR_Gold` | 金币 | **Vàng** | Tiền thông dụng — *"通用货币"* `Translate_4:14762` | Shop1 (Tạp Hóa) |
| `IR_Diamond` | 钻石 | **Kim Cương** | Tiền quý — *"珍贵货币"* `Translate_4:14766` | Shop2; refresh 10 shop |
| `IR_Arena` | 荣誉币 | **Tiền Vinh Dự** | *"荣誉币，可在竞技场中获得"* (Đấu Trường 竞技场) `Translate_1:10976` | Shop3 |
| `IR_Tower` | 试炼币 | **Tiền Thí Luyện** | *"…可在音巢行动中获得"* (Âm Sào Hành Động 音巢行动) `Translate_1:10980` | Shop4 |
| `IR_Club` | 社团币 | **Tiền Bang** | *"…可在社团玩法中获得"* (chế độ Bang Hội 社团玩法) `Translate_1:10984` | Shop5 |
| `IR_KOF` | 争霸币 | **Tiền Tranh Bá** | *"…可在拳皇争霸中获得"* (KOF Tranh Bá 拳皇争霸) `Translate_1:10988` | Shop7 |
| `IR_RTPK` | 巅峰币 | **Tiền Đỉnh Phong** | *"…可在巅峰竞技中获得"* (Đỉnh Phong Cạnh Kỹ 巅峰竞技) `Translate_1:10992` | Shop8 |
| `IR_WOF` | 地图币 | **Tiền Bản Đồ** | Tên: *"地图币"* `Translate_4:14848` (nguồn kiếm không ghi rõ trong config) | Shop9 |
| `IR_Myth` | 封神币 | **Tiền Phong Thần** | *"…可在封神之路中获得"* (Con Đường Phong Thần 封神之路) `Translate_1:10996` | Shop10 |
| `IR_Bet` | 竞猜币 | **Xu Đoán Thắng** | *"可用于参与地下拳场"* (dùng cá cược ở Đấu Trường Ngầm 地下拳场) `Translate_1:11076` | Shop11 (sự kiện cũ) |
| `IR_CrystalStone` | 晶石 | **Tinh Thạch** | *"晶石，可在资源争夺战中获得"* (Chiến Đoạt Tài Nguyên 资源争夺战) `Translate_1:11088` | Shop12 |
| `IR_SectTower` | 挑战币 | **Xu Thử Thách** | *"为一战到顶的选手提供的奖励"* (thưởng từ 一战到顶 "một trận tới đỉnh") `Translate_1:21824` | Shop13 (Trại Tiếp Tế) |
| `IR_KOF_MARK` | 收藏币 | **Xu Sưu Tập** | *"重复收藏时装时可转化为10个收藏币"* (trùng Thời Trang → +10 xu) `Translate_4:20733` | Shop14 |
| `IR_KOF_ENERGY` | KOF能量 | **Năng Lượng KOF** | *"GM商城购买商品必备"* (vật phẩm GM) `Translate_4:22673` | GMShop1–10 |
| `IR_Equip` | 装备碎片 | **Mảnh Trang Bị** | Tên: *"装备碎片"* `Translate_4:14748` (rơi từ phó bản trang bị — không ghi rõ trong config) | Shop6 |
| `IM_Roulette_1`* | 皮肤兑换券 | **Phiếu Đổi Skin** | Vòng quay / hoạt động Thời Trang — `Item.lua:59917` (CN_Name) | Shop15 (mua skin) |

> `*` `IM_Roulette_1` là một **item** dùng làm tiền tệ trong Shop15 (xem ghi chú ¹ Mục 3).
>
> **Lưu ý về Kim Cương:** Kim Cương KHÔNG dùng để mua hàng ở các shop xu (trừ Shop2 và một vài ô đá thăng phẩm trong Shop1). Vai trò chính là **làm mới gian hàng** cho **10 cửa hàng có `RefreshMaxTimes=6`** (Shop1–5, 7–10, 13) — xem Mục 4.

---

## 3. Toàn bộ cửa hàng — Bảng tra nhanh

Trích từ `config/Shop.lua`. `Tiền mua` = `DefaultCostType`; `Refresh` = `RefreshCurrency` + `RefreshMaxTimes`; `Reset` = `ResetSystem.resetMode`.

| Shop | Tên Trung | Tên Việt | Tiền mua chính | Refresh (Kim Cương) | Kiểu reset | Nguồn |
|---|---|---|---|---|---|---|
| Shop1 | 杂货商店 | **Tạp Hóa** | Vàng (`IR_Gold`) | 6 lần | WEEK, mỗi ngày | `Shop.lua:4` |
| Shop2 | 神秘商店 | **Thần Bí** | Kim Cương (`IR_Diamond`) | 6 lần | NONE | `Shop.lua:63` |
| Shop3 | 荣誉商店 | **Vinh Dự** | Tiền Vinh Dự (`IR_Arena`) | 6 lần | WEEK, mỗi ngày | `Shop.lua:95` |
| Shop4 | 试炼商店 | **Thí Luyện** | Tiền Thí Luyện (`IR_Tower`) | 6 lần | WEEK, mỗi ngày | `Shop.lua:154` |
| Shop5 | 社团商店 | **Bang Hội** | Tiền Bang (`IR_Club`) | 6 lần | WEEK, mỗi ngày | `Shop.lua:205` |
| Shop6 | 装备兑换商店 | **Đổi Trang Bị** | Mảnh Trang Bị (`IR_Equip`) | 0 (không refresh) | None (`storage=-1`) | `Shop.lua:259` |
| Shop7 | 争霸商店 | **Tranh Bá** | Tiền Tranh Bá (`IR_KOF`) | 6 lần | WEEK, mỗi ngày | `Shop.lua:315` |
| Shop8 | 巅峰商店 | **Đỉnh Phong** | Tiền Đỉnh Phong (`IR_RTPK`) | 6 lần | WEEK, mỗi ngày | `Shop.lua:369` |
| Shop9 | 地图商店 | **Bản Đồ** | Tiền Bản Đồ (`IR_WOF`) | 6 lần | WEEK, mỗi ngày | `Shop.lua:418` |
| Shop10 | 封神商店 | **Phong Thần** | Tiền Phong Thần (`IR_Myth`) | 6 lần | WEEK, mỗi ngày | `Shop.lua:469` |
| Shop11 | 竞猜商店 | **Đoán Thắng** | Xu Đoán Thắng (`IR_Bet`) | 0 | NONE (sự kiện cũ 2019) | `Shop.lua:527` |
| Shop12 | 资源战商店 | **Chiến Tài Nguyên** | Tinh Thạch (`IR_CrystalStone`) | 0 | NONE (`SoldOutOrder=1`) | `Shop.lua:566` |
| Shop13 | 补给营地 | **Trại Tiếp Tế** | Xu Thử Thách (`IR_SectTower`) | 6 lần | WEEK, mỗi ngày | `Shop.lua:603` |
| Shop14 | 藏品商店 | **Sưu Phẩm** | Xu Sưu Tập (`IR_KOF_MARK`) | 0 | NONE (71 món, `SoldOutOrder=1`) | `Shop.lua:654` |
| Shop15 | 时装商店 | **Thời Trang** | Phiếu Đổi Skin (`IM_Roulette_1`)¹ | 0 | NONE (11 món, `SoldOutOrder=1`) | `Shop.lua:925` |
| GMShop1–10 | GM商城 | **GM Shop** | Năng Lượng KOF (`IR_KOF_ENERGY`) | 0 | — (không có `ResetSystem`) | `Shop.lua:745–924` |

> ¹ **Ngoại lệ giá của Shop15:** `Shop.lua:928` khai báo `DefaultCostType = "IR_KOF_MARK"`, nhưng từng món skin **ghi đè** bằng `costType = "IM_Roulette_1"`, và icon tiền hiển thị của shop là `RsShow = "IM_Roulette_1"` (`Shop.lua:934`). Do đó giá thực trả bằng **Phiếu Đổi Skin**, không phải Xu Sưu Tập. Đây là ví dụ cho cơ chế **item ghi đè tiền tệ mặc định của shop** (Mục 6).

---

## 4. Cơ chế Làm Mới (Refresh) & Reset — QUAN TRỌNG

Có **2 loại làm mới** hoàn toàn khác nhau, đừng nhầm:

### 4.1. Làm mới TỰ ĐỘNG & MIỄN PHÍ (rotation theo giờ)

Các shop WEEK có `ResetSystem.resetMode = "WEEK"`, `resetDate = {1,2,3,4,5,6,7}` (đủ 7 ngày) và `resetTime = {"04:00:00","12:00:00","20:00:00"}` (ví dụ Shop1: `Shop.lua:43-61`).

Logic tại `ResetUtils.lua:60-99` (hàm `getNextTime`) xác nhận: shop **tự đảo hàng miễn phí 3 mốc/ngày** vào **04:00, 12:00 và 20:00** mỗi ngày. Đây là "gian hàng mới" bạn thấy khi vào game.

### 4.2. Làm mới THỦ CÔNG (trả Kim Cương)

Muốn đổi hàng ngay không đợi tới giờ thì trả Kim Cương. Giá **tăng dần** theo số lần đã refresh trong chu kỳ.

`RefreshPrice = {20, 30, 100, 100, 200, 300}` (Shop1: `Shop.lua:35-42`, giống nhau ở mọi shop refresh được). `RefreshMaxTimes = 6` → tối đa **6 lần/chu kỳ**.

Công thức chính xác từ `ShopGroup.lua:242-262` (hàm `getRefreshCost`): **giá lần refresh kế tiếp = `RefreshPrice[số_lần_đã_refresh + 1]`**; nếu vượt danh sách thì giữ **giá cuối** (`prices[max]`).

| Lần refresh | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| **Giá (Kim Cương)** | 20 | 30 | 100 | 100 | 200 | 300 |
| **Cộng dồn** | 20 | 50 | 150 | 250 | 450 | **750** |

→ Refresh cả 6 lần trong 1 chu kỳ tốn **750 Kim Cương**. Tiền refresh luôn là `IR_Diamond` (`RefreshCurrency`).

### 4.3. Cờ đặc biệt

- **`SoldOutOrder = 1`** (Shop12 `Shop.lua:570`, Shop14 `Shop.lua:659`, Shop15 `Shop.lua:930`): cờ này bật cơ chế **đẩy món đã bán hết xuống cuối** danh sách (kiểm tra tại `ShopGroup.lua:272-278`, hàm `isNeedSoldOutOrder`), giúp bạn thấy ngay hàng còn mua được.
- **`OpenTime`** (Shop11/14/15): shop chỉ mở sau ngày `OpenTime` và kéo dài `Days` ngày.
  - Shop11 mở `2019-05-25` trong `14` ngày (`Shop.lua:536-539`) → **sự kiện cũ, thực tế đã đóng**.
  - Shop14 mở `2025-08-01` trong `999` ngày (`Shop.lua:664-667`).
  - Shop15 mở `2025-07-22` trong `9999` ngày (`Shop.lua:935-938`).
- **`LevelGoods["30"]`**: một số món chỉ hiện khi nhân vật đạt **cấp 30**, ví dụ Shop1 mở `Shop1_Slot16` (`Shop.lua:13-17`), Shop3 mở `ShopArena_13` (`Shop.lua:104-108`), Shop10 mở `ShopMyth_13` (`Shop.lua:478-482`).

---

## 5. Chi tiết từng cửa hàng trọng tâm (số liệu thật)

### 🛒 5.1. Shop1 — Tạp Hóa (杂货商店)

- **Tiền mua:** Vàng (`IR_Gold`) — cửa hàng DUY NHẤT tiêu Vàng làm tiền chính. **Refresh:** Kim Cương, 6 lần.
- **Bán gì:** đây là gian hàng **ngẫu nhiên có trọng số** (nhiều tầng `RandomType = "Once2"` và `"Level"`), xoay vòng:
  - **Mảnh nâng cấp ngẫu nhiên**: `Shop1_FragR / FragSR / FragSRP` (pool mảnh phẩm R / SR / SR+). Đây là **pool random không kèm trường giá** ở entry gốc — ví dụ `Shop1_FragR` (`Reward_1.lua:153567`) chỉ liệt kê nội dung quay (IM_F034 / IM_F005 / IM_F041), **không có `unitPrice`**.
  - **Đá Thăng Phẩm / Tiến Giai (升品/升阶)**: `Shop1_QupG` (Vàng, `Reward_1.lua:154029`) và `Shop1_QupD` (Kim Cương, `Reward_1.lua:154071`) — cũng là pool `Once2` (trọng số 80/15/4/1) trỏ tới các pool con, không có giá tại entry gốc.
  - **Món cố định mở ở Lv30 (`Shop1_Slot16`)**: **Đá Trùng Sinh Phẩm Chất Võ Sĩ** (格斗家品质重生石 / `IM_Reborn_HeroQuality`, `Item.lua:70836`) — giá **500 Vàng**, tồn kho `storage=3` (`Reward_1.lua:161613-161628`). *Đây là giá cố định DUY NHẤT xác nhận được trong Shop1.*
- **Cơ chế cấp độ:** các ô như `Shop1_Slot3` có `RandomType="Level"` với các mốc **Lv1/11/41/51/61/81** — nội dung và độ hiếm mảnh **tăng theo cấp người chơi** (`Reward_1.lua:124300-124409`).

### 🏆 5.2. Shop3 — Vinh Dự (荣誉商店)

- **Tiền mua:** Tiền Vinh Dự (`IR_Arena`) — kiếm ở **Đấu Trường (竞技场)**. **Refresh:** Kim Cương, 6 lần.

| Món | Mã | Vật phẩm (CN gốc) | SL | Giá (Vinh Dự) | Nguồn |
|---|---|---|---|---|---|
| ShopArena_1 | `IM_F007` | Mảnh Sakazaki Ryo (坂崎良[碎片]) | 5 | 320 | `Reward_1.lua:170522` |
| ShopArena_2 | `IM_F017` | Mảnh Mai Shiranui (不知火舞[碎片]) | 5 | 200 | `Reward_1.lua:170538` |
| ShopArena_3 | `IM_F041` | Mảnh Maxima (马克西马[碎片]) | 2 | 180 | `Reward_1.lua:170554` |
| ShopArena_4 | `IM_H007_E1` | Trang bị vũ khí "Tường Long chi Hồn" (翔龙之魂)² | 1 | 32000 | `Reward_1.lua:170570` |
| ShopArena_5 | `IM_H017_E1` | Trang bị vũ khí (SubType EQUIP_STAR) | 1 | 21600 | `Reward_1.lua:170586` |
| ShopArena_6 | `IM_H041_E1` | Trang bị vũ khí (SubType EQUIP_STAR) | 1 | 12000 | `Reward_1.lua:170602` |
| ShopArena_8 | `IB_FAll13Box` | Rương Mảnh Vạn Năng (万能碎片宝箱) | 1 | 400 | `Reward_1.lua:170629` |
| ShopArena_Soul | `I053_Soul_Common_Star5` | **Chiến Hồn thường 5★** (战魂) | 1 | **100000** | `Reward_1.lua:170689` |

> Ngoài ra còn các món kinh nghiệm/vàng (`ShopArena_9..12`) và đá tăng sao trang bị (`ShopArena_7`).
>
> ² **Đính chính:** các món `IM_H*_E1` (tên "…之魂") có `SubType = "EQUIP_STAR"`, `Page = "EQUIP"` (`Item.lua:67759`) → là **trang bị vũ khí riêng của từng võ sĩ**, KHÔNG phải hệ **Chiến Hồn (战魂)**. Chỉ các món mã `I*_Soul_Common_Star*` (type=10) mới là Chiến Hồn thật.

### ⚔️ 5.3. Shop7 — Tranh Bá (争霸商店)

- **Tiền mua:** Tiền Tranh Bá (`IR_KOF`) — kiếm ở **KOF Tranh Bá (拳皇争霸)**. **Refresh:** Kim Cương, 6 lần.

| Món | Mã | Vật phẩm | SL | Giá (Tranh Bá) | Nguồn |
|---|---|---|---|---|---|
| ShopKOF_1 | `IM_F015` | Mảnh Chin Gentsai (镇元斋[碎片]) | 5 | 400 | `Reward_1.lua:171937` |
| ShopKOF_2 | `IM_F042` | Mảnh Whip (薇普[碎片]) | 5 | 240 | `Reward_1.lua:171953` |
| ShopKOF_3 | `IM_F034` | Mảnh Li Xiangfei (李香绯[碎片]) | 2 | 200 | `Reward_1.lua:171969` |
| ShopKOF_4 | `IM_H015_E1` | Trang bị vũ khí "Biều Đạn chi Hồn" (瓢箪之魂)² | 1 | 38000 | `Reward_1.lua:171985` |
| ShopKOF_7 | `IB_RandomE4Box` | Rương Huy Chương Ngẫu Nhiên (随机纹章箱子) | 1 | 24000 | `Reward_1.lua:172033` |
| ShopKOF_8 | `IM_SoulCrystal` | Hồn Tinh (魂晶) | 10 | **36** | `Reward_1.lua:172049` |

### 🔥 5.4. Shop10 — Phong Thần (封神商店)

- **Tiền mua:** Tiền Phong Thần (`IR_Myth`) — kiếm ở **Con Đường Phong Thần (封神之路)**. **Refresh:** Kim Cương, 6 lần.

| Món | Mã | Vật phẩm | SL | Giá (Phong Thần) | Nguồn |
|---|---|---|---|---|---|
| ShopMyth_1 | `IM_F011` | Mảnh Ralf (拉尔夫[碎片]) | 5 | 320 | `Reward_1.lua:173341` |
| ShopMyth_2 | `IM_F013` | Mảnh Athena (麻宫雅典娜[碎片]) | 5 | 200 | `Reward_1.lua:173357` |
| ShopMyth_3 | `IM_F035` | Mảnh Vanessa (温妮莎[碎片]) | 2 | 180 | `Reward_1.lua:173373` |
| ShopMyth_4 | `IM_H011_E1` | Trang bị vũ khí "Đảo Toái Giả chi Hồn" (捣碎者之魂)² | 1 | 32000 | `Reward_1.lua:173389` |
| ShopMyth_8 | `IM_SoulCrystal` | Hồn Tinh (魂晶) | 10 | 30 | `Reward_1.lua:173448` |
| ShopMyth_Soul | `I086_Soul_Common_Star4` | **Chiến Hồn thường 4★** | 1 | **45000** | `Reward_1.lua:173508` |
| ShopMyth_Soul5 | `I307_Soul_Common_Star5` | **Chiến Hồn thường 5★** | 1 | **90000** | `Reward_1.lua:173524` |

### 🏳️ 5.5. Shop5 — Bang Hội (社团商店)

- **Tiền mua:** Tiền Bang (`IR_Club`) — kiếm từ **chế độ/nhiệm vụ Bang Hội (社团玩法)**. **Refresh:** Kim Cương, 6 lần.

| Món | Mã | Vật phẩm | SL | Giá (Tiền Bang) | Nguồn |
|---|---|---|---|---|---|
| ShopClub_1 | `IB_vitality` | Nguyên Khí / Thể lực (元气) | 20 | 40 | `Reward_1.lua:174772` |
| ShopClub_2 | `IB_vitality` | Nguyên Khí (元气) | 50 | 20 | `Reward_1.lua:174788` |
| ShopClub_3 | `IM_F002` | Mảnh Benimaru (二阶堂红丸[碎片]) | 2 | 180 | `Reward_1.lua:174804` |
| ShopClub_4 | `IM_H018_E1` | Trang bị vũ khí "Kinh Dị Mai Khôi chi Hồn" (惊异玫瑰之魂)² | 1 | 32000 | `Reward_1.lua:174820` |
| ShopClub_8 | `IM_DiamondDraw` | **Xu Chiêu Mộ Kim Cương** (钻石招募币) | 1 | **3600** | `Reward_1.lua:174879` |

### 🎴 5.6. Shop14 — Sưu Phẩm (藏品商店)

- **Tiền mua:** Xu Sưu Tập (`IR_KOF_MARK`) — nhận **10 xu mỗi lần trùng Thời Trang** (*"重复收藏时装时可转化为10个收藏币"* `Translate_4:20733`). **Không refresh** (`RefreshMaxTimes=0`), có `SoldOutOrder=1`.
- **Bán gì:** **71 món sưu phẩm** (藏品 — `CP_*`), mỗi món `storage=1` (mua 1 lần vĩnh viễn). Giá rất rẻ:

| Món | Mã | Vật phẩm (CN gốc) | Quality | Giá (Xu Sưu Tập) | Nguồn |
|---|---|---|---|---|---|
| Shop14_Reward1 | `CP_XCTX_Blue` | Huyễn Thải Đồng Tâm (炫彩童心／蓝色藏品) | 3 (Lam) | **1** | `Reward_19.lua:44055` |
| Shop14_Reward7 | `CP_KNX_Purple` | Hoa Cẩm Chướng — Tím (康乃馨／紫色) | 3 | **2** | `Reward_19.lua:44151` |

> Cả 71 ô đều `storage=1`; giá chỉ **1–2 Xu Sưu Tập**/món (xác nhận 2 mẫu đầu; các ô còn lại theo cùng khung 1–2 xu). Đây là "tủ sưu tầm" đổi từ thời trang trùng.

### 👗 5.7. Shop15 — Thời Trang (时装商店)

- **Tiền mua thực tế:** **Phiếu Đổi Skin** (`IM_Roulette_1` / 皮肤兑换券) — không phải Xu Sưu Tập (xem ghi chú ¹ Mục 3). **Không refresh**, có `SoldOutOrder=1`.
- **Bán gì:** **11 skin võ sĩ được bày bán** (`Shop15.Positions` = `Shop15_Reward1..Reward11`, `Shop.lua:939-951`), mỗi skin **7 Phiếu Đổi Skin**, `storage=999` (mua thoải mái).

| Món | Mã skin | Giá (Phiếu) | Tồn kho | Nguồn |
|---|---|---|---|---|
| Shop15_Reward1 | `Skin_H050_1` | 7 | 999 | `Reward_22.lua:213837` |
| Shop15_Reward2 | `Skin_H017_1` | 7 | 999 | `Reward_22.lua:213853` |
| Shop15_Reward3 | `Skin_H051_1` | 7 | 999 | `Reward_22.lua:213869` |
| ... | ... | ... | ... | ... |
| Shop15_Reward11 | `Skin_H028_1` | 7 | 999 | `Reward_22.lua:213997` |

> **Lưu ý:** `Reward_22.lua` định nghĩa **20** entry (`Shop15_Reward0..Reward19`), nhưng `Shop.lua` chỉ **nối 11** ô vào shop qua `Positions`. Người chơi chỉ thấy **11 skin**, không phải 20.

---

## 6. Ý nghĩa các trường cấu hình (đọc số cho đúng)

Mỗi món trong `Reward_*.lua` (ví dụ `Reward_1.lua:170526-170535`):

| Trường | Ý nghĩa |
|---|---|
| `unitPrice` | Giá **1 lượt mua** (tính theo `costType`) |
| `costType` | Loại tiền phải trả. **Ghi đè** `DefaultCostType` của shop nếu có (VD Shop15) |
| `amount` | Số lượng vật phẩm nhận **mỗi lượt mua** |
| `storage` | Giới hạn số lần mua trong 1 chu kỳ (per-item). `999` = gần như vô hạn |
| `costOff = 1` | Cờ đánh dấu món có khuyến mãi/giảm giá |
| `shopItem = 1` | Đánh dấu đây là hàng bày bán |
| `quality` | Phẩm chất (màu) của vật phẩm |
| `RandomType` | `Fixed` = cố định; `Level` = đổi theo **cấp người chơi**; `Once2` = **random có trọng số** (số trong `["81"]`, `["9"]` là trọng số) |

Cấp shop (`Shop.lua`): `DefaultCostType` (tiền mặc định), `RsShow` (icon tiền hiển thị), `RefreshCurrency`/`RefreshPrice`/`RefreshMaxTimes` (làm mới), `ResetSystem` (auto-reset + `storage` là bộ đếm reset, khác `storage` của món), `UnlockSystem` (điều kiện mở khóa), `Positions` (danh sách + thứ tự ô hàng thực tế), `LevelGoods` (hàng mở theo cấp), `SuperGoods*` (hàng SSR đặc biệt — chỉ Shop6).

**Hàng SSR đặc biệt (chỉ Shop6):** `SuperGoodsFresh=5`, `SuperGoodsNum={1,1}` (`Shop.lua:284-287`), `SuperGoodsLib` gồm **2 bể × 8 trang bị SSR** (`Shop_Equip_SSR_1..16`, `Shop.lua:292-313`). Nhận diện tại `ShopGroup.lua:280-293` (hàm `isSuperGoodsById`, hard-code đọc `Shop6`); có cổng cấu hình `GameConfigs.closeSuperGoods` để lọc tắt (`ShopGroup.lua:150`).

---

## 7. Mẹo tối ưu (dựa trên số liệu thật)

1. **Ưu tiên gom Chiến Hồn (战魂) 5★ từ Shop Vinh Dự / Phong Thần.** Đây là đòn bẩy Lực Chiến (战力) tốt nhất khi kẹt cap cấp. Giá: **5★ = 100.000 Vinh Dự** (`ShopArena_Soul`), **5★ = 90.000 Phong Thần** (`ShopMyth_Soul5`), **4★ = 45.000 Phong Thần** (`ShopMyth_Soul`). Mỗi chu kỳ chỉ mua được 1 (`storage=1`) nên gom đều.

2. **Hồn Tinh (魂晶) — mua bằng xu bạn đang dư.** Cùng gói 10 Hồn Tinh nhưng **khác loại tiền**: Tranh Bá **36 Tiền Tranh Bá** (`ShopKOF_8`) vs Phong Thần **30 Tiền Phong Thần** (`ShopMyth_8`). Vì hai loại xu khác nhau, không so "rẻ hơn" trực tiếp được — nên tiêu Tiền Tranh Bá cho Hồn Tinh và **giữ Tiền Phong Thần cho Chiến Hồn 5★ (90.000)**.

3. **Đừng phí Kim Cương refresh sớm.** Shop tự đảo hàng **miễn phí ở 04:00 / 12:00 / 20:00**. Chỉ refresh thủ công khi thấy đúng món cần. 2 lần đầu chỉ 20+30 = **50 Kim Cương**, nhưng lần 5–6 đội lên **200–300**/lần (tối đa 750/chu kỳ).

4. **Xu Chiêu Mộ Kim Cương (钻石招募币) ở Shop Bang Hội** = 3600 Tiền Bang (`ShopClub_8`) là nguồn chiêu mộ "miễn phí" đáng gom hàng tuần.

5. **Tiền Bang mua Thể Lực (元气) hiệu quả:** gói 50 Nguyên Khí chỉ 20 Tiền Bang (`ShopClub_2`, đơn giá 0.4/điểm) rẻ hơn gói 20 (40 xu, đơn giá 2/điểm) — luôn mua gói lớn trước.

6. **Sưu phẩm & Skin gần như "free":** Shop Sưu Phẩm bán 71 món giá 1–2 Xu Sưu Tập; cứ trùng Thời Trang là +10 xu. Skin ở Shop Thời Trang 7 Phiếu/skin, tồn kho 999 — gom Phiếu Đổi Skin từ vòng quay rồi quét.

7. **Canh `OpenTime`:** Shop Sưu Phẩm (mở 2025-08-01) và Shop Thời Trang (mở 2025-07-22) là nội dung mới; server chưa tới mốc thì các shop này ẩn. Shop Đoán Thắng (Shop11, mở 2019 chỉ 14 ngày) là **sự kiện cũ đã đóng**.

---

## 8. Mini-Glossary (Trung → Việt)

| Trung | Hán-Việt / Việt chuẩn | Ghi chú |
|---|---|---|
| 商店 | Cửa Hàng / Shop | |
| 杂货 | Tạp Hóa | |
| 荣誉币 | Tiền Vinh Dự | Xu Đấu Trường |
| 争霸币 | Tiền Tranh Bá | Xu KOF Tranh Bá |
| 封神币 | Tiền Phong Thần | Xu Con Đường Phong Thần |
| 社团币 | Tiền Bang | Xu Bang Hội |
| 试炼币 | Tiền Thí Luyện | |
| 巅峰币 | Tiền Đỉnh Phong | |
| 挑战币 | Xu Thử Thách | Thưởng từ 一战到顶 |
| 收藏币 | Xu Sưu Tập | Từ trùng thời trang |
| 晶石 | Tinh Thạch | Xu chiến tài nguyên |
| 钻石 | Kim Cương | Tiền cao cấp / refresh |
| 金币 | Vàng | Tiền thông dụng |
| 皮肤兑换券 | Phiếu Đổi Skin | Tiền mua skin (Shop15) |
| KOF能量 | Năng Lượng KOF | Tiền GM Shop |
| 战魂 | Chiến Hồn | Hệ hồn tăng Lực Chiến |
| 魂晶 | Hồn Tinh | Vật liệu nâng Chiến Hồn |
| ...之魂 (EQUIP_STAR) | ...chi Hồn | **Trang bị vũ khí võ sĩ** (KHÁC Chiến Hồn) |
| 神器 | Thần Khí | Vũ khí gia tộc |
| 升品 | Thăng Phẩm | Nâng phẩm chất |
| 升阶 | Tiến Giai | Nâng cấp bậc |
| 升星 | Thăng Sao | Nâng sao |
| 格斗家 | Võ Sĩ | Nhân vật |
| 碎片 | Mảnh (Toái Phiến) | Mảnh triệu hồi võ sĩ |
| 刷新 | Làm Mới (Refresh) | |
| 藏品 | Sưu Phẩm | |
| 时装 | Thời Trang | Skin |
| 元气 | Nguyên Khí | Thể lực |

---

## 9. Nguồn chính đã đọc

- `reference/client-src/config/Shop.lua` — 15 shop + 10 GMShop (cấu hình gốc)
- `reference/client-src/config/Reward_1.lua` — món hàng Shop1/3/5/7/10 (giá, số lượng)
- `reference/client-src/config/Reward_19.lua` — Shop14 (Sưu Phẩm, 71 ô)
- `reference/client-src/config/Reward_22.lua` — Shop15 (Thời Trang; 11 ô bày bán / 20 entry định nghĩa)
- `reference/client-src/config/Item.lua` — CN_Name vật phẩm
- `reference/client-src/config/Translate_1.lua` / `Translate_4.lua` — tên tiền tệ, cửa hàng + tip nguồn xu
- `reference/client-src/snk/gameplay/shop/model/ShopGroup.lua` — công thức refresh, SoldOutOrder, SuperGoods
- `reference/client-src/snk/gameplay/shop/controller/ResetUtils.lua` — logic auto-reset 04:00/12:00/20:00
- `data/i18n/tm.json` — tên Việt chuẩn (战魂=Chiến Hồn, 魂晶=Hồn Tinh, 收藏币=Xu Sưu Tập, 神器=Thần Khí)

---

> ## Độ tin cậy
>
> **Đã KIỂM CHỨNG khớp source (giữ nguyên vì đúng):**
> - Toàn bộ giá + mã + số lượng của **Shop3 (Vinh Dự), Shop7 (Tranh Bá), Shop10 (Phong Thần), Shop5 (Bang Hội)** — đối chiếu từng dòng `Reward_1.lua`, khớp 100% (gồm cả các mốc 100.000 / 90.000 / 45.000 Chiến Hồn, Hồn Tinh 36/30, Xu Chiêu Mộ 3600).
> - **15 dòng cấu hình shop** trong `Shop.lua` (tiền mua, RefreshMaxTimes, resetMode, số dòng) — khớp.
> - **Công thức refresh** `RefreshPrice[times+1]`, cap giá cuối, tổng 6 lần = 750 Kim Cương (`ShopGroup.lua:242-262`) — khớp chính xác.
> - **Auto-reset 04:00/12:00/20:00** (`ResetUtils.lua:60-99`) — khớp.
> - **Tên tiền tệ + nguồn kiếm** cho Arena/Tower/Club/KOF/RTPK/Myth/Crystal/SectTower/KOF_MARK — có câu mô tả gốc trong `Translate_*` (đã trích).
> - **71 món Shop14** và **giá skin 7 Phiếu (storage 999)** — khớp; item name (碎片, 之魂, 魂晶, 招募币, 重生石, 皮肤兑换券) khớp `Item.lua`.
>
> **Đã SỬA (bản nháp SAI hoặc bịa):**
> 1. **Shop15 "20 skin" → 11 skin bày bán.** `Shop.lua:939-951` chỉ nối `Reward1..Reward11`; `Reward_22.lua` có 20 entry (Reward0-19) nhưng 9 cái không vào `Positions`.
> 2. **Bỏ 2 giá Shop1 bịa:** "mảnh R = 500 Vàng (`153119`)" và "gói đá = 5000 Vàng (`132227`)" — SAI cả số dòng lẫn nội dung: `Shop1_FragR` (`153567`) và `Shop1_Stone_G_QS20` (`134531`) là **pool random KHÔNG có trường giá**. Giá 500 Vàng chỉ đúng cho `Shop1_Slot16` (đã giữ).
> 3. **`IM_H*_E1` KHÔNG phải "Chiến Hồn vũ khí".** Chúng là **trang bị vũ khí võ sĩ** (`SubType=EQUIP_STAR`, `Page=EQUIP`, `Item.lua:67759`); chỉ `I*_Soul_Common_Star*` mới là Chiến Hồn (战魂).
> 4. **Sửa citation tiền tệ:** "通用货币" ở `Translate_4:14762` (không phải 14724); "珍贵货币" ở `Translate_4:14766` (không phải `Translate_1:86127`); nguồn kiếm Xu Thử Thách xác nhận ở `Translate_1:21824` (IR_SectTower_Desc "一战到顶"), không phải dòng Name 21818.
> 5. **Thêm `SoldOutOrder=1` cho Shop15** (`Shop.lua:930`) — nháp chỉ ghi Shop12+Shop14.
> 6. **Shop11 là sự kiện cũ** (OpenTime 2019-05-25, 14 ngày); `IR_Bet` được mô tả là **dùng để cá cược ở 地下拳场**, không phải "kiếm ở đó".
> 7. **Sửa mẹo Hồn Tinh** (nháp tự mâu thuẫn: "mua ở Tranh Bá" nhưng lại nói "Phong Thần rẻ hơn") — hai loại xu khác nhau, không so trực tiếp.
> 8. Tên sưu phẩm chính xác: `CP_XCTX_Blue` = 炫彩童心 (Huyễn Thải Đồng Tâm), `CP_KNX_Purple` = 康乃馨 (Hoa Cẩm Chướng).
>
> **CHƯA CHẮC / hạn chế (không đủ dữ liệu trong config đã đọc):**
> - **Nguồn kiếm `IR_Gold` / `IR_Diamond` / `IR_WOF` / `IR_Equip`**: config chỉ cho *mô tả tiền* ("通用货币", "珍贵货币", "地图币", "装备碎片"), KHÔNG liệt kê chính xác nơi kiếm. Các dòng "nạp/hoạt động", "rơi phó bản trang bị", "chế độ bản đồ" là suy luận hợp lý, chưa trích được câu gốc.
> - **Giá các ô random Shop1** (Frag / Qup / Stone): nằm ở tầng leaf sâu hơn hoặc do hệ thống khác quyết định — chưa tìm thấy `unitPrice` trong các entry đã đọc, nên KHÔNG nêu số.
> - **Shop14**: chỉ xác minh giá 2 ô (Reward1=1, Reward7=2); 69 ô còn lại **giả định** theo cùng khung 1–2 xu, chưa mở từng dòng. Trường `quality` của cả hai mẫu đều = 3 dù tên Reward7 là "Purple" — nhãn màu trong bảng chỉ mang tính tham khảo.
> - **Shop15 skin**: xác minh đủ 11 ô bày bán = 7 Phiếu; 9 entry ẩn (Reward0, Reward12-19) chưa kiểm giá vì không hiển thị.