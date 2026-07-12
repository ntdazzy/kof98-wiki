# Sự kiện & Tiền tệ

I have verified every claim against source. Compiling the corrected wiki now. Key corrections: the Golden Egg is a **stake/multiplier** (not a faucet), the 限时格斗家 draw costs are **12000/108000 KC or 1/10 vé** (draft cited an unreferenced 240/2160 template), and several translation fixes (扭蛋机 = Máy Gắp Thú, 援护 = Yểm Trợ, 魂晶 = Hồn Tinh).

---

# Sự Kiện & Tiền Tệ — KOF98 (Wiki)

Trang này mô tả cụm hệ thống "sự kiện + tiền tệ phụ" xoay quanh sảnh **拳魂世界 (Thế Giới Quyền Hồn)**: hai loại tiền sự kiện/vĩnh viễn (**Bánh Trứng**, **Xu Sưu Tập**), sự kiện đua **Võ Sĩ Giới Hạn Thời Gian**, và **Máy Gắp Thú Trang Bị** (máy vật liệu — gachapon trang bị, khác hẳn chiêu mộ tướng). Mọi con số đều trích từ config gốc trong `reference/client-src/config`.

> Quy ước: mỗi khẳng định có nguồn `file:dòng`. `type = 2` = vật phẩm/tiền thường; `type = 9` = mở túi (bag/pool). `IR_Diamond` = Kim Cương (KC), `IR_Gold` = Vàng.

---

## 0. Bản đồ hệ thống (đọc trước)

| Thành phần | Trung (gốc) | Việt | Bản chất | Vòng đời |
|---|---|---|---|---|
| Sảnh thế giới | 拳魂世界 | Thế Giới Quyền Hồn (WOF) | Chế độ SLG chiếm cứ theo mùa | Theo mùa (season) |
| Tiền sự kiện | 蛋挞 / `IM_DT` | Bánh Trứng | `ACTIVITY_ITEM` — thu hồi sau event | Tạm thời |
| Tiền vĩnh viễn | KOF收藏币 / `IR_KOF_MARK` | Xu Sưu Tập | `Page = CURRENCY` — không bị xoá | Vĩnh viễn |
| Sự kiện đua | 限时格斗家 | Võ Sĩ Giới Hạn Thời Gian | Đua **điểm + hạng** khi quay tướng giới hạn | Theo đợt |
| Máy vật liệu | 装备扭蛋机 | Máy Gắp Thú Trang Bị (gachapon trang bị) | Quay ra hồn 5★ + Đá Thức Tỉnh + trang bị | Free 1 lần/ngày |

Điểm mấu chốt cần phân biệt:
- **`ACTIVITY_ITEM`** (Bánh Trứng, vé `IM_ATL_Draw`...) = tiền/vé **gắn với 1 đợt sự kiện**, hết đợt bị **thu hồi/quy đổi**. Phải tiêu trước khi event đóng.
- **`IR_KOF_MARK`** (Xu Sưu Tập) nằm ở `Page = "CURRENCY"` → **giữ vĩnh viễn**, tích luỹ qua nhiều mùa (`Item.lua:58145`).
- **装备扭蛋机 (Máy Gắp Thú Trang Bị)** là máy **VẬT LIỆU** (trang bị/hồn/đá), **KHÁC** 招募 (chiêu mộ tướng). Nhầm hai cái này là sai bản chất.

---

## 1. 拳魂世界 — Thế Giới Quyền Hồn (WOF, sảnh)

`拳魂世界 = "Thế Giới Quyền Hồn"` (tm.json). Đây không phải một "cửa hàng", mà là **chế độ chiến thuật chiếm cứ (SLG) theo mùa** — sảnh chứa bản đồ, cứ điểm, công nghệ và tài nguyên riêng.

### 1.1 Cấu hình mùa (season)
Nguồn: `WOFSeason.lua:4-50` (mùa `WS_1`):

| Thông số | Giá trị | Ý nghĩa |
|---|---|---|
| `Duration` | 60 | Độ dài 1 mùa |
| `MaxAction` | 200 | Trần điểm hành động |
| `Territory` | 50 | Trần số ô lãnh thổ |
| `People` | 4 | Quy mô đội/liên minh |
| `BuildQueue` | 3 | Số hàng đợi xây dựng |
| `RestDuration` / `AbandonTime` | 5 / 5 | Nghỉ / bỏ đất |
| `DrugLimit` | 3000 | Trần "thuốc" (buff) |

Tài nguyên mùa (`WOFSeason.lua:17-26`): `IR_Forage` (粮草 = **Lương Thảo**) và `IR_Stone` (**Đá Tài Nguyên**), mỗi loại trần `limit = 10000`.

### 1.2 Cứ điểm trên bản đồ
Nguồn: `WOFStatic.lua`:
- `WOFS_Base` — đại bản doanh: `Territory = 9`, `Power = 300`, `Durability = 5`, ô `3×3` (`Size = {3,3}`, `:4-24`).
- `WOFS_Boss1/2/3` — BOSS: `Territory = 9`, `Durability = 10`, `Power = 300`, ô `3×3`, cần công nghệ `WOFT_Barrack` (`:25-138`).
- `WOFS_WildFort` — pháo đài hoang: `Territory = 1`, `Power = 50`, `Durability = 2`, ô `1×1` (`:57-80`).

### 1.3 Cây công nghệ (Technology)
`WOFSeason.lua:31-49` liệt kê **17 nhánh**: trần tài nguyên (`WOFT_RLimit`), tăng trần từng loại (`WOFT_R_Forage/Stone/Gold/WOF`), tăng tốc sản (`WOFT_Rate_Forage/Stone/Gold/WOF`), chỉ số tướng (`WOFT_Hero_Atk`, `WOFT_Hero_Def`), và công trình (`WOFT_Base`, `WOFT_Group`, `WOFT_Barrack`, `WOFT_GroupSeat`, `WOFT_Lighthouse`, `WOFT_Territory`).

Họ file liên quan: `WOFTerrain`, `WOFTech`, `WOFTechLevel`, `WOFStage`, `WOFRange`, `WOFMap`, `WOFDynamic`, `WOFArea`, `WOFStatic`, `WOFSeason` — tức WOF là một hệ con lớn, độc lập với các tiền tệ bên dưới.

---

## 2. 蛋挞 — Bánh Trứng (tiền sự kiện, thu hồi sau event)

### 2.1 Nó là gì
Nguồn: `Item.lua:37200-37223`

| Trường | Giá trị |
|---|---|
| `Id` | `IM_DT_20240601` |
| `CN_Name` | 蛋挞 (→ **Bánh Trứng**, tm.json) |
| `SubType` | **`ACTIVITY_ITEM`** (tiền sự kiện, thu hồi khi hết đợt) |
| `Page` / `Quality` | `CONSUMABLE` / 5 |
| `MaxPile` | 99999 |
| `Icon` | `danta.png` |

Vì là `ACTIVITY_ITEM`, Bánh Trứng chỉ có giá trị **trong đợt sự kiện đang chạy**; hết đợt sẽ bị thu hồi/quy đổi → **phải tiêu hết trước khi event đóng**.

### 2.2 Kiếm ở đâu

**Nguồn cơ bản (faucet):**
1. **Túi Mảnh Ghép Ký Ức (记忆拼图 / `IM_JYPT_20240601`)** — `SubType = BOX_RANDOM`, mở ra Bánh Trứng (`Item.lua:37224-37249`, `Reward = { "IM_DT_20240601" }`).
2. **Cửa đổi/nhiệm vụ trong sự kiện** — theo nội quy in-game, Bánh Trứng "lấy ở 【Hoạt động】-【cửa đổi sự kiện】" (`蛋挞可于【活动】-【…活动兑换】中获得`, `Translate_3.lua:1646`).

**Đập Trứng Vàng (砸金蛋 / GoldenEgg) — KHÔNG phải faucet, mà là máy NHÂN Bánh Trứng.**
Đây là điểm dễ hiểu sai. Nội quy gốc (`Translate_3.lua:1650`):
> "Mỗi lần đập kim đản **tốn 1 Bánh Trứng và 1 Bảo Chuỳ (宝锤)**; Bánh Trứng là **tiền vốn (本金)**, nhớ giữ lại ít nhất một quả! Ba quả kim đản thưởng lần lượt **2 lần, 3 lần, 5 lần bạo kích**, tương ứng **2 / 3 / 5 Bánh Trứng**."

Cơ chế đầy đủ:
- **Cược:** mỗi cú đập = **1 Bánh Trứng (vốn) + 1 Bảo Chuỳ** (`Translate_3.lua:1650`).
- **Trả về:** ba quả trứng cho **×2 / ×3 / ×5** (tức 2 / 3 / 5 Bánh Trứng).
- **Bảo hiểm:** "**Cứ 3 lần chắc ra đại thưởng bạo kích Bánh Trứng ×5**" (`每3次必出5倍蛋挞暴击大奖`, `Translate_3.lua:1670, 25318`).
- **Đập trúng ×5 thì reset ngay 3 quả trứng** (`Translate_3.lua:1654`) → chu kỳ mới.
- **Bảo Chuỳ (宝锤) lấy ở đâu:** mỗi lần **nạp bất kỳ 30 tệ = 1 Bảo Chuỳ**, tối đa **100 cái/ngày**, **reset 05:00** (`Translate_3.lua:1646`).

→ Vì mỗi bộ 3 lần đập cho 2+3+5 = **10 Bánh Trứng** đổi lấy 3 Bánh Trứng vốn (lời 7), Đập Trứng là **đòn bẩy nhân Bánh Trứng ròng dương** — nhưng bị chặn bởi **Bảo Chuỳ (tốn tiền nạp)**. Tagline "Đập tôi tặng Bánh Trứng" (`砸我就送你蛋挞`, `Translate_3.lua:1642, 1690`) chỉ là quảng cáo; bản chất là **cỗ máy nhân vốn**, không phải quà từ trên trời.

> **Biến thể vỏ trứng:** config có nhiều skin — `GoldenEggGold`, `GoldenEggDiamond`, `GoldenEggDRAGONCOIN`. Một chuỗi UI của skin Kim Cương ghi "3 lần chắc ra ×10 **Kim Cương**" (`每3次必出10倍钻石暴击大奖`, `Translate_3.lua:1598`) → có vẻ mỗi skin cược/trả một loại tiền khác nhau. Loại tiền cụ thể theo từng skin **chưa chắc** (xem Độ tin cậy).

### 2.3 Dùng gì — Cửa hàng đổi Bánh Trứng (`DH_TXJDH_20240601`)
Nguồn: `ActivityExchange.lua:1943-2193`. Dùng Bánh Trứng (`code = "IM_DT_20240601"`) đổi phần thưởng, mỗi ô có **giới hạn lượt (`Times`)** (đã đối chiếu từng ô):

| Ô đổi | Giá (Bánh Trứng) | Giới hạn lượt (`Times`) |
|---|---|---|
| `_2` | 130 | 1 |
| `_4` | 110 | 1 |
| `_3` | 100 | 1 |
| `_5` | 60 | 1 |
| `_6` / `_14` | 40 | 1 / 3 |
| `_9` | 35 | 5 |
| `_8` / `_12` | 30 | 1 / 5 |
| `_7` | 24 | 1 |
| `_10` / `_13` | 20 | 6 / 5 |
| `_15` / `_17` | 16 | 5 / 30 |
| `_11` | 15 | 6 |
| `_16` / `_18` | 6 | 30 / 50 |

Đọc bảng: các ô đắt (`_2`..`_8`, 60–130 Bánh Trứng, `Times = 1`) là **món cao cấp mua-một-lần**; các ô rẻ (`_16`/`_18`, 6 Bánh Trứng, `Times` 30–50) là **túi tiêu hao mua số lượng lớn** để "xả" Bánh Trứng cuối đợt. (Nội dung `Target = *_Reward` là túi thưởng do server phát; config client chỉ giữ cost + limit.)

> **Ngoài lề:** ô đầu tiên `_1` (`ActivityExchange.lua:1943`) **không** dùng Bánh Trứng mà tốn **10000 Kim Cương** (`Times = 75`) — một ô nạp KC riêng, không nằm trong hệ Bánh Trứng.

---

## 3. 收藏币 — Xu Sưu Tập (tiền vĩnh viễn) & Cửa Hàng Sưu Phẩm

### 3.1 Nó là gì
Nguồn: `Item.lua:58138-58161`

| Trường | Giá trị |
|---|---|
| `Id` | `IR_KOF_MARK` |
| `CN_Name` | KOF收藏币 (收藏币 → **Xu Sưu Tập**, tm.json) |
| `Page` | **`CURRENCY`** (tiền tệ — vĩnh viễn, không thu hồi) |
| `SubType` / `Quality` | `KOF_MARK` / 6 |
| `Isvisible` | 0 (ẩn trong túi, hiện ở thanh tiền cửa hàng) |

Đối lập với Bánh Trứng: đây là **tiền vĩnh viễn**, tích qua nhiều mùa, chuyên dùng cho hệ **sưu tầm (藏品 = Vật Sưu Tầm)**.

### 3.2 Kiếm ở đâu
- **Khai báo nguồn:** `ItemSource.lua:4-10` — `KOF_MARK`, `Text = "Source_Shop14"`, `ResourceType = "SHOP"` (gắn với Cửa Hàng Sưu Phẩm).
- **Nhiệm vụ nạp hằng ngày** (`ChargeDaily_20250813_Task*_Reward`, `Reward_17.lua`): chỉ các **mốc cao (Task8–13)** mới trả Xu Sưu Tập kèm vật phẩm khác — Task8/9/10/11 = **1 xu**, Task12 = **2 xu**, Task13 = **5 xu** (`Reward_17.lua:162, 184, 205, 226, 252, 273`). Task1–7 không có Xu Sưu Tập.
- **Hộp Xu Sưu Tập** (`IR_KOF_MARK_BOX`, `Item.lua:58162-58188`): `SubType = BOX_RANDOM`, mở ra `Skin_Shop_Reward`. Có biến thể **thời trang** `IR_FASHION_MARK` (时装藏品币, `Page = CURRENCY`, `Item.lua:71390-71413`).

### 3.3 Dùng gì — Cửa Hàng Sưu Phẩm (藏品商店 / Shop14)
Nguồn: `Shop.lua:654-744`

| Trường | Giá trị |
|---|---|
| `Id` | `Shop14` (`Shop14_Name` = 藏品商店 = **Cửa Hàng Sưu Phẩm**, `Translate_4.lua:20713`) |
| `DefaultCostType` | `IR_KOF_MARK` |
| `UnlockSystem` | **`Kof_Butler`** (mở qua hệ Quản Gia KOF) |
| `OpenTime` | từ `2025-08-01`, `Days = 999` |
| Số ô hàng | **71** (`Shop14_Reward1..71`) |
| `ResetSystem` | `resetMode = "NONE"` (không refresh — hàng cố định) |

Hàng bán (`Reward_19.lua:44055-44182`) là **mảnh sưu tập / tiền kỷ niệm (纪念币 mintage)** để hoàn thành bộ 藏品:
- **Mảnh phẩm Lam**: giá **1 xu/mảnh** (`unitPrice = 1`) — ví dụ `CP_XCTX_Blue`, `IM_Festival_Working_Mintage_Blue`, `IM_Halloween_Mintage_Blue`, `IM_Love20240520_Blue`, `IM_Niangao_Blue`, `IM_SpringFestivalTiger_Mintage_Blue`.
- **Mảnh phẩm Tím**: giá **2 xu/mảnh** (`unitPrice = 2`) — ví dụ `CP_KNX_Purple`, `CP_XCTX_Purple`.

> Có `Shop15` (`Shop.lua:925-954`) cũng dùng `IR_KOF_MARK` làm `DefaultCostType`, cũng khoá sau `Kof_Butler`, mở từ `2025-07-22` (`Days = 9999`), hiển thị `IM_Roulette_1` (皮肤兑换券 = Vé Đổi Trang Phục, 11 ô) — nhánh đổi trang phục.

---

## 4. 限时格斗家 — Võ Sĩ Giới Hạn Thời Gian (đua điểm + hạng)

Sự kiện đua khi **quay tướng giới hạn**: mỗi lần quay cộng điểm, điểm vừa mở **mốc phần thưởng cá nhân**, vừa xếp **bảng xếp hạng đua top**.

### 4.1 Khung sự kiện
Nguồn: `Activity_1.lua:1700-1811` (mẫu `ATLimit_NewOpen_Week1_20221229`, `Type = "ACTIVITYTIMELIMIT"`):

| Trường | Giá trị | Ý nghĩa |
|---|---|---|
| `hero` | `H251` | Võ sĩ giới hạn của đợt |
| `drawCardItem` | `IM_ATL_Draw` | Vé quay đợt (xem 4.3) |
| `OnceScore` | **10** | Mỗi lần quay = 10 điểm |
| `rankAmount` | **30** | Bảng xếp hạng lấy **Top 30** |
| `rankMailId` | `Mail_ActivityTimeLimitRank` | Thưởng hạng gửi qua thư |
| `shineItem` | `IM_FAll13`, `IM_FAll14` | Mảnh tướng toàn-năng thưởng kèm |

### 4.2 Hai nhánh thưởng (dual)

**(A) Nhánh Điểm cá nhân (`ScoreReward`)** — `Activity_1.lua:1738-1810`, **18 mốc** theo tổng điểm tích luỹ:

| Mốc | Điểm cần |
|---|---|
| 1–5 | 10 / 30 / 100 / 200 / 400 |
| 6–10 | 600 / 900 / 1200 / 1500 / 1800 |
| 11–15 | 2200 / 2400 / 2600 / 2800 / 3000 |
| 16–18 | 3200 / 3600 / **4000** |

Vì mỗi lần quay = 10 điểm, mốc tối đa 4000 điểm = **400 lượt quay**.

**(B) Nhánh Xếp Hạng đua Top (`rank`)** — `ActivityTimeLimit.lua:4-75` (mẫu `ATLimit_NewOpen_20221208`). Mỗi bậc hạng yêu cầu **đạt hạng ≤ X** VÀ **điểm tối thiểu**:

| Bậc | Hạng | Điểm tối thiểu |
|---|---|---|
| 1 | 1 | 2200 |
| 2 | 2–3 | 1600 |
| 3 | 4–5 | 1200 |
| 4 | 6–8 | 1000 |
| 5 | 9–11 | 600 |
| 6 | 12–16 | 400 |
| 7 | 17–22 | 200 |
| 8 | 23–30 | 0 |

→ Muốn nhận thưởng hạng phải **vừa lọt Top 30, vừa qua ngưỡng điểm** của bậc đó. Đây chính là cơ chế "dual rank + score".

### 4.3 Vé quay & chi phí
- **Vé chính:** `IM_ATL_Draw` = 限时神将招募券·当期 (**Vé Chiêu Mộ Thần Tướng Giới Hạn — đợt hiện tại**), `SubType = ACTIVITY_ITEM`, Quality 6 (`Item.lua:58017-58040`). Là `ACTIVITY_ITEM` → **thu hồi khi hết đợt**. Vé kiếm từ nhiệm vụ + phần thưởng điểm/hạng của chính sự kiện.
- **Gói quay THẬT của đợt này** (`drawCardId` trỏ tới `ATLimit_NewOpen_Week1_20221229_Draw_1/_10`, `DrawCard.lua:26444-26481`):

| Gói | Trả bằng vé | HOẶC Kim Cương (dự phòng) |
|---|---|---|
| Quay đơn (`_Draw_1`) | **1× `IM_ATL_Draw`** | **12000 KC** |
| Quay 10 (`_Draw_10`) | **10× `IM_ATL_Draw`** | **108000 KC** |

- **Đường chính là VÉ, không phải Kim Cương.** Giá KC (12000/lần) chỉ là dự phòng cực đắt — 400 lượt bằng KC ≈ 4.8 triệu KC, phi thực tế. Vé mới là tiền quay thật.
- Trên đường dự phòng KC: quay 10 (108000) rẻ hơn 10 lần quay đơn (120000), **tiết kiệm 12000 KC**. Trả bằng vé thì 1 lần = 1 vé, không có chiết khấu gói 10.
- **Free reset:** cả hai gói (và mẫu chung) có `FreeReset = "ATL_DrawCard_Free"` → `Reset.lua:1302-1320`: `resetMode = "WEEK"`, `setValue = 1`, `resetDate = {1..7}`, `resetTime = "05:00:00"` → **1 lượt quay free/ngày lúc 05:00**.

> **Lưu ý cho người dựng lại:** trong `DrawCard.lua:270-305` có mẫu chung `ATL_Hero_Draw_1/_10` giá **240 / 2160 KC** (thuần Kim Cương, không vé) — **nhưng không activity nào trỏ tới** (grep 0 tham chiếu ngoài `DrawCard.lua`). Đó là template rời/cũ, KHÔNG phải giá của đợt `Week1_20221229`. Đừng nhầm 240 là giá quay sự kiện này.

---

## 5. 装备扭蛋机 — Máy Gắp Thú Trang Bị (máy VẬT LIỆU, free 1 lần/ngày)

> **KHÁC 招募 (chiêu mộ tướng).** Máy này quay ra **trang bị + Đá Thức Tỉnh + hồn 5★ + tài nguyên**, không ra tướng. Mô tả gốc: "扭蛋机，产出装备强化道具" = "Máy gắp thú, sản xuất vật phẩm cường hoá trang bị" (`Translate_4.lua`).

### 5.1 Đạo cụ & điểm vào
Nguồn: `Item.lua:70407-70432`

| Trường | Giá trị |
|---|---|
| `Id` | `IM_EquipDraw` (`CN_Name` 装备扭蛋机币 = **Xu Máy Gắp Thú Trang Bị**) |
| `SubType` | `EQUIP_DRAW` |
| `Value` | 160 |
| `Link` | `view://RecruitEquipView…tabType=1` (mở màn máy) |
| `Resource` | `IM_EquipDraw_1` |

### 5.2 Chi phí quay
Nguồn: `DrawCard.lua:205-250`

| Gói | Cost gốc | Giảm giá (`CostOff`) | Giá sau giảm | Vé thay thế (`Coupon`) | Trần lượt/ngày (`DailyTimes`) |
|---|---|---|---|---|---|
| `DrawCard_Equip_1` (×1) | 80 KC | 0.5 | **40 KC** | 1× `IM_EquipDraw` | 30 |
| `DrawCard_Equip_10` (×10) | 680 KC | 1 (không giảm) | **680 KC** | 10× `IM_EquipDraw` | 300 |

- **Xu vé free mỗi ngày:** ngoài việc quay bằng KC, có **nhiệm vụ hằng ngày 探囊取物 tặng free `IM_EquipDraw`** (`每日免费领取 装备扭蛋机币`, `Translate_1.lua:53041`).
- **Free reset lượt quay:** gói ×1 có `FreeReset = "DrawCard_EquipFree"` → `Reset.lua:214-232`: `resetMode = "WEEK"`, `setValue = 1`, `resetDate = {1..7}`, `resetTime = "05:00:00"` → **mỗi ngày 1 lượt free lúc 05:00**.
- Gói ×1 còn có `OffReset = "DrawCard_EquipOff"` (`Reset.lua:252-270`) quản lý số lượt được hưởng **giá giảm 40 KC** (`Times = {0, 10}`, `DrawCard.lua:223-226`, reset ngày 05:00); hết ưu đãi quay về 80 KC.

### 5.3 Nội dung quay ra (pool)
Nguồn pool: `Reward_1.lua` + `Reward_100.lua`
- **Bảo đảm nền:** `DrawCard_Equip_1_normal` = **1× `IR_Equip`** (trang bị) mỗi lượt (`Reward_1.lua:109440-109450`).
- **Thưởng đặc biệt:** `SpecialReward = "DE_Bag1_RichStone"` → **1× `IM_RichStone` (觉醒石 = Đá Thức Tỉnh)** (`Reward_100.lua:2729-2743`; `IM_RichStone`: Quality 5, `Value` 480, `Item.lua:57485-57511`).
- **Túi random theo lượt:** `Reward = "GachaE_1_Rand"` (`Reward_1.lua:108089-108112`) dùng `RandomType = "Times"`, đổi túi theo số lần quay tích luỹ (`GachaEOnce_Bag1to20` → `GachaEOnce_Bag21toEnd`) — cơ chế bảo hiểm-theo-lượt.
- Vật phẩm rơi trong pool gồm: **Hồn 5★** (`GachaE_5StarSoulBag` / `…Normal`, `Reward_1.lua:106657, 109260`), **Hồn Tinh / Đá hồn** (`GachaEOnce_Bag3_SeniorSCys…`, các cấp `SCys`), **Vàng** (`GachaEOnce_Bag7_GoldNew`) và **trang bị** (`IR_Equip`).

→ Đây là nguồn cày **trang bị + Đá Thức Tỉnh + hồn 5★** ổn định; tận dụng **lượt free mỗi 05:00** + **xu vé free từ nhiệm vụ** là "lãi ròng" gần như không tốn Kim Cương.

---

## 6. Bảng so sánh nhanh 4 loại tiền/vé

| Tiền/Vé | ID | Loại | Kiếm chính | Tiêu ở | Thu hồi? |
|---|---|---|---|---|---|
| Bánh Trứng | `IM_DT_20240601` | `ACTIVITY_ITEM` | Túi Mảnh Ghép Ký Ức + cửa đổi sự kiện; **Đập Trứng ×5 để NHÂN vốn** (cần Bảo Chuỳ) | Shop đổi `DH_TXJDH` | **Có** (hết đợt) |
| Xu Sưu Tập | `IR_KOF_MARK` | `CURRENCY` | Nhiệm vụ nạp hằng ngày (Task8–13 = 1–5), Hộp Xu | Cửa Hàng Sưu Phẩm (Shop14, 71 ô) | **Không** (vĩnh viễn) |
| Vé Thần Tướng Giới Hạn | `IM_ATL_Draw` | `ACTIVITY_ITEM` | Nhiệm vụ + thưởng điểm/hạng sự kiện 限时格斗家 | Quay tướng giới hạn (1 vé/lần; dự phòng 12000 KC) | **Có** (hết đợt) |
| Xu Máy Gắp Thú Trang Bị | `IM_EquipDraw` | `EQUIP_DRAW` | Nhiệm vụ 探囊取物 free/ngày, mua | Máy Gắp Thú Trang Bị (thay 40–680 KC) | Bền (đạo cụ) |

---

## 7. Mẹo tối ưu

1. **Xả Bánh Trứng trước khi đợt đóng.** Vì là `ACTIVITY_ITEM` bị thu hồi, còn dư thì "đổ" vào ô rẻ số lượng lớn (`DH_TXJDH_..._16/_18`: 6 xu, `Times` 30–50). Ưu tiên các ô `Times = 1` giá 60–130 (món cao cấp) trước.
2. **Đập Trứng chỉ khi dư vốn + có Bảo Chuỳ.** Nhớ Đập Trứng **ngốn 1 Bánh Trứng vốn + 1 Bảo Chuỳ** mỗi cú (`Translate_3.lua:1650`), Bảo Chuỳ đến từ nạp tiền (30 tệ/cái, trần 100/ngày). Bộ 3 quả trả 2+3+5 = 10 (lời 7) và ×5 reset trứng, nên đập theo **cụm 3** để không phí lần bảo hiểm ×5. Đây là đòn bẩy nhân vốn, không phải nguồn free.
3. **Máy Gắp Thú Trang Bị: hốt free 05:00 + xu vé từ nhiệm vụ.** `DrawCard_EquipFree` cho 1 lượt free/ngày lúc 05:00 (`Reset.lua:214-232`), cộng nhiệm vụ 探囊取物 tặng xu vé free (`Translate_1.lua:53041`) — Đá Thức Tỉnh/trang bị/hồn gần như miễn phí, đừng bỏ lỡ.
4. **Muốn giảm giá thì quay lẻ, muốn số lượng thì quay 10.** Gói ×1 có `CostOff = 0.5` (40 KC) nhưng bị giới hạn bởi `DrawCard_EquipOff` (`Times = {0,10}`); hết ưu đãi mới chuyển gói ×10 (680 KC, không giảm nhưng `DailyTimes = 300`).
5. **限时格斗家: cày VÉ, nhắm ngưỡng điểm — đừng đốt Kim Cương.** Quay bằng **vé `IM_ATL_Draw`** (kiếm trong sự kiện), đừng dùng đường KC 12000/lần. Bậc hạng 8 (Top 23–30) chỉ cần **điểm ≥ 0**; bậc 7 (Top 17–22) cần **200 điểm = 20 lượt**. Nhớ dùng 1 lượt quay free/ngày (`ATL_DrawCard_Free`).
6. **Xu Sưu Tập tích dài hạn.** Không bị thu hồi → gom qua nhiều mùa để quét sạch mảnh phẩm Tím (2 xu) trong Shop14; nhớ mở hệ **Quản Gia KOF (`Kof_Butler`)** để vào cửa hàng.

---

## 8. Mini-glossary Trung → Việt

| Trung (gốc) | Hán-Việt / Việt | Ghi chú |
|---|---|---|
| 拳魂世界 | Thế Giới Quyền Hồn (WOF) | Chế độ SLG chiếm cứ theo mùa (tm.json) |
| 蛋挞 | Bánh Trứng | Tiền sự kiện `IM_DT`, thu hồi sau đợt (tm.json) |
| 金蛋 / 砸金蛋 | Trứng Vàng / Đập Trứng Vàng | Mini-game NHÂN Bánh Trứng (gloss của tôi) |
| 宝锤 | Bảo Chuỳ (búa báu) | Đạo cụ đập trứng, từ nạp tiền (gloss của tôi) |
| 记忆拼图 | Mảnh Ghép Ký Ức | Túi mở ra Bánh Trứng |
| 收藏币 / KOF收藏币 | Xu Sưu Tập | Tiền vĩnh viễn `IR_KOF_MARK` (tm.json) |
| 藏品 / 藏品商店 | Vật Sưu Tầm / Cửa Hàng Sưu Phẩm | Shop14 (tm.json) |
| 纪念币 (Mintage) | Tiền Kỷ Niệm | Món bán trong Cửa Hàng Sưu Phẩm |
| 时装藏品币 | Xu Sưu Phẩm Thời Trang | `IR_FASHION_MARK` |
| 限时格斗家 / 限时神将 | Võ Sĩ Giới Hạn Thời Gian / Thần Tướng Giới Hạn | Sự kiện đua điểm + hạng (格斗家=Võ Sĩ, 限时神将=Thần Tướng Giới Hạn, tm.json) |
| 招募 (vs 扭蛋机) | Chiêu Mộ (khác Gắp Thú) | Chiêu mộ = ra tướng; Gắp thú = ra vật liệu |
| 装备扭蛋机 | Máy Gắp Thú Trang Bị | Máy vật liệu (扭蛋机=Máy Gắp Thú, tm.json); quen gọi "gachapon trang bị" |
| 装备扭蛋机币 | Xu Máy Gắp Thú Trang Bị | `IM_EquipDraw` |
| 觉醒石 | Đá Thức Tỉnh | `IM_RichStone`, cường hoá/thức tỉnh trang bị (tm.json) |
| 觉醒 | Thức Tỉnh | Cơ chế nâng cấp (tm.json) |
| 战魂 | Chiến Hồn | Hồn (soul) (tm.json) |
| 魂晶 / 魂匣 | Hồn Tinh / Rương Hồn | Đá hồn / hộp hồn (tm.json) |
| 粮草 / 资源石 | Lương Thảo / Đá Tài Nguyên | Tài nguyên WOF (`IR_Forage` / `IR_Stone`) (tm.json: 粮草=Lương Thảo) |
| 皮肤兑换券 | Vé Đổi Trang Phục | `IM_Roulette_1` (gloss của tôi) |
| 神器 | Thần Khí | (hệ liên quan) (tm.json) |
| 援护 | Yểm Trợ | (hệ liên quan) (tm.json — KHÔNG phải "Viện Hộ") |
| 战力 | Lực Chiến | Sức mạnh nhân vật/account (tm.json) |

---

### Nguồn config đã đối chiếu
`Activity_1.lua` (khung 限时格斗家), `ActivityTimeLimit.lua` (bậc hạng), `ActivityExchange.lua` (shop Bánh Trứng), `Item.lua` (`IM_DT_20240601`, `IM_JYPT_20240601`, `IR_KOF_MARK`, `IR_KOF_MARK_BOX`, `IR_FASHION_MARK`, `IM_ATL_Draw`, `IM_EquipDraw`, `IM_RichStone`), `ItemSource.lua` (nguồn `KOF_MARK`), `Shop.lua` (Shop14/Shop15), `Reward_17.lua` (nhiệm vụ nạp), `Reward_19.lua` (hàng Shop14), `Reward_1.lua` + `Reward_100.lua` (pool máy gắp thú), `DrawCard.lua` + `Reset.lua` (gói quay + free reset), `WOFSeason.lua` + `WOFStatic.lua` (WOF), `Translate_1/3/4.lua` + `data/i18n/tm.json` (cơ chế trứng + thuật ngữ Việt).

---

> ## Độ tin cậy
>
> **Đã kiểm chứng khớp source (giữ nguyên):**
> - Toàn bộ số WOF (`WOFSeason.lua:4-50`, `WOFStatic.lua`): Duration 60, MaxAction 200, Territory 50, People 4, BuildQueue 3, Rest/Abandon 5, DrugLimit 3000, tài nguyên limit 10000, 17 nhánh công nghệ — **đúng hết**.
> - Item fields của Bánh Trứng, Xu Sưu Tập, `IM_ATL_Draw`, `IM_EquipDraw`, `IM_RichStone` — **đúng** (bổ sung: `IM_JYPT` là `BOX_RANDOM`, `IR_FASHION_MARK`/`IR_KOF_MARK_BOX` `Page=CURRENCY`/`BOX_RANDOM`).
> - **Bảng đổi Bánh Trứng** (18 ô, giá + `Times`) — **đối chiếu từng ô, đúng 100%**.
> - **18 mốc ScoreReward** (10→4000) và **8 bậc rank** (hạng + điểm) — **đúng 100%**.
> - Cost máy Gắp Thú (80→40 / 680, DailyTimes 30/300), free reset 05:00, pool (IR_Equip nền + DE_Bag1_RichStone→IM_RichStone + hồn 5★) — **đúng**.
> - Shop14 (IR_KOF_MARK, Kof_Butler, 2025-08-01, 71 ô, reset NONE), Blue 1 xu / Purple 2 xu, Shop15 — **đúng**.
> - ChargeDaily: **chỉ Task8–13** cho Xu Sưu Tập (1/1/1/1/2/5); Task1–7 không có (draft nói "mỗi mốc" — đã làm rõ).
>
> **Đã SỬA (draft sai/thiếu):**
> 1. **Đập Trứng Vàng KHÔNG phải faucet Bánh Trứng.** Draft coi nó là nguồn "tặng" Bánh Trứng. Thực tế (`Translate_3.lua:1650`): mỗi cú đập **tốn 1 Bánh Trứng (vốn) + 1 Bảo Chuỳ**, trả 2×/3×/5× = 2/3/5 Bánh Trứng; ×5 reset trứng (`:1654`); Bảo Chuỳ từ nạp 30 tệ (`:1646`). Đây là **máy nhân vốn**, không phải quà free. Faucet thật của Bánh Trứng = túi `IM_JYPT` + cửa đổi sự kiện.
> 2. **Giá quay 限时格斗家 sai.** Draft ghi 240 / 2160 KC (từ mẫu `ATL_Hero_Draw_1/_10`) — nhưng mẫu đó **không activity nào trỏ tới**. Đợt `Week1_20221229` thực tế dùng `…_Draw_1/_10` = **1 vé `IM_ATL_Draw` (hoặc 12000 KC) / 10 vé (hoặc 108000 KC)** (`DrawCard.lua:26444-26481`). Đường chính là **vé**, không phải KC. Đã sửa cả Mẹo #5 và bảng so sánh.
> 3. **Thuật ngữ theo tm.json:** 扭蛋机 = **Máy Gắp Thú** (draft ghi "Gachapon" — đã đổi, giữ gloss gachapon); 援护 = **Yểm Trợ** (draft ghi "Viện Hộ" — SAI); 魂晶 = **Hồn Tinh** (draft ghi "Tinh Hồn" — đảo chữ); 藏品 = **Vật Sưu Tầm**.
> 4. **Bổ sung:** ô `_1` cửa đổi Bánh Trứng thực chất tốn 10000 KC (không phải Bánh Trứng); nhiệm vụ 探囊取物 tặng xu vé máy Gắp Thú free/ngày; `DE_Bag1_RichStone` → `IM_RichStone`.
>
> **Chưa chắc (cần bắt in-game để chốt):**
> - **Loại tiền theo từng skin trứng** (Gold / Diamond / DragonCoin): rule text dùng chung "蛋挞", nhưng 1 chuỗi UI skin Kim Cương ghi "×10 钻石" (`Translate_3.lua:1598`) → có thể mỗi skin cược/trả một tiền khác. Config strings mâu thuẫn, chưa truy được data số học payout.
> - **Ngưỡng đổi túi trong `GachaE_1_Rand`**: tên túi là `Bag1to20`/`Bag21toEnd` nhưng khoá `Times` chuyển ở mốc **19** (`["1"]`, `["19"]`, `Reward_1.lua:108089-108112`) — lệch với tên, không rõ đây là bug config hay đếm tích luỹ khác.
> - **Tên Việt của 金蛋 / 宝锤 / 皮肤兑换券**: không có trong tm.json; "Trứng Vàng", "Bảo Chuỳ", "Vé Đổi Trang Phục" là gloss của tôi, chưa phải bản dịch chính thức.
> - Rule text Đập Trứng gắn nhãn 五一 (sự kiện 1/5) trong khi `IM_DT_20240601` là bản 1/6 — cùng cơ chế nhưng khác instance đợt; con số 2/3/5 và mốc nạp 30 tệ lấy từ bản 五一.