# Các chế độ chơi

Đã kiểm chứng xong toàn bộ. Tất cả số liệu config lõi đều xác minh được; phát hiện một số sai sót (Tông Môn 8 phái mở cấp khác nhau, mở khoá Con Đường Phong Thần, Soul3 phẩm chất, số tuyến Myth, và nhiều citation trỏ sai dòng 850). Dưới đây là bản cuối đã sửa.

---

# 🎮 CÁC CHẾ ĐỘ CHƠI — Wiki KOF98

> Trang tổng hợp toàn bộ chế độ chơi (玩法) chính, trích thẳng số liệu từ config gốc. Mọi con số đều kèm nguồn `file:dòng` để tra cứu. Đường dẫn gốc: `reference/client-src/`, file cấu hình nằm trong `config/` (trừ khi ghi rõ path khác). Tên chế độ dùng bản Việt hoá chuẩn, kèm chữ Hán gốc lần đầu.

---

## 📖 Mini-glossary (Trung → Việt)

| Hán | Việt (chuẩn game) | Ghi chú |
|---|---|---|
| 主线关卡 | **Ải Cốt Truyện** | Màn chủ tuyến PvE |
| 精英副本 | **Phó Bản Tinh Anh** | Bản khó (HARD) |
| 探险副本 | **Phó Bản Thám Hiểm** | Farm vàng/EXP |
| 竞技场 | **Đấu Trường** | PvP xếp hạng |
| 封神之路 | **Con Đường Phong Thần** | Leo tháp roguelike |
| 拳皇争霸 | **Vương Giả Tranh Bá** | Giải PvP theo mùa |
| 巅峰对决 | **Quyết Đấu Đỉnh Cao** | Vòng chung kết loại trực tiếp |
| 阵营资源战 | **Chiến Tài Nguyên Phe** | Chiến trường 4 phe chiếm đất |
| 社团 | **Xã Đoàn** (Bang hội) | Bang hội |
| 战魂神殿 | **Thần Điện Chiến Hồn** | Hợp thành Chiến Hồn |
| 宗门 / 宗门试炼塔 | **Tông Môn / Tháp Tông Môn** | Tháp thử thách theo môn phái |
| 战魂 | **Chiến Hồn** | Hồn chiến (kỹ năng hồn) |
| 魂晶 | **Hồn Tinh** | Nguyên liệu hợp Chiến Hồn |
| 战魂精华 | **Tinh Hoa Chiến Hồn** | Nguyên liệu nâng Chiến Hồn |
| 神器 | **Thần Khí** | |
| 战力 | **Lực Chiến** | Sức mạnh tổng |
| 格斗家 | **Võ Sĩ** | Nhân vật |
| 升品 / 升星 | **Thăng Phẩm / Thăng Sao** | |
| 觉醒 | **Thức Tỉnh** | |
| 援护 | **Viện Hộ / Yểm Trợ** | |
| 封神币 | **Tiền Phong Thần** | Tệ Con Đường Phong Thần |
| 修炼点 / 封神修炼点 | **Điểm Tu Luyện (Phong Thần)** | Điểm cây thiên phú trong Phong Thần |
| 荣誉点 | **Điểm Vinh Dự** | Nhiệm vụ trong Phong Thần |
| 争霸币 / 巅峰币 | **Tiền Tranh Bá / Tiền Đỉnh Phong** | |
| 试炼币 | **Tiền Thí Luyện** | Tệ Tháp Tông Môn |
| 社团币 | **Tiền Bang** | Tệ Xã Đoàn |
| 万能碎片 | **Mảnh Vạn Năng** | Mảnh vạn năng (đổi Võ Sĩ) |
| 领地 / 势力 / 大本营 / 中心王座 | **Lãnh Địa / Thế Lực / Đại Bản Doanh / Vương Tọa Trung Tâm** | |
| 扫荡 | **Quét Nhanh** | Càn quét bỏ qua đánh tay |

**4 phe của Chiến Tài Nguyên Phe** (nguồn: `CampWarCross_rule2`, `Translate_1.lua:16782`): 🟡 Vàng = **Long Hổ Quyền** (龙虎之拳); 🟣 Tím = **Ngạ Lang Truyền Thuyết** (饿狼传说); 🔵 Xanh dương = **Đấu Vương** (格斗之王); 🔴 Đỏ = **Mạc Mạt Chi Hồn** (幕末之魂).

---

## 🗺️ Bảng mở khoá nhanh

| Chế độ | Cấp mở | Nguồn |
|---|---|---|
| Chủ Tuyến | **Cấp 1** | `StagePoint.lua` (M01P01 `OpenLevel = 1`) |
| Con Đường Phong Thần | **Cấp 28** (hiện icon ở Home từ cấp 23) | `UnlockSystem.lua` khối `Myth_System`: `Condition LEVEL = 28`, `ShowCondition LEVEL = 23` |
| Phó Bản Tinh Anh | **Cấp 52** | `StageHardMap.lua:7` (`OpenLevel = 52`) |
| Tông Môn — phái đầu tiên | **Cấp 53** | `SectMain.lua:7` (`ClientLevel = 53`, Sect_1) — các phái còn lại mở dần tới cấp 73 (xem mục 9) |
| Tháp Tông Môn | **Cấp 60** | `SectTowerPoint.lua:6` (`OpenLevel = 60`) |

> ⚠️ **Đính chính:** Con Đường Phong Thần (hệ Myth) mở theo **cấp nhân vật** (`Myth_System` cấp 28), KHÔNG liên quan tới 8 "Thần" `Unlockday 1–8` của `GodBase.lua` — đó là cây dưỡng thành **Thần** gắn Tông Môn (mục 9). Ngoài cấp hệ thống, mỗi **tuyến** trong Phong Thần còn cần sở hữu Võ Sĩ neo tuyến (VD tuyến MM01 cần đạt cấp + có Kyo H001 — `MythMap.lua`, `UnlockCondition`).

---

# 1. ⚔️ Chủ Tuyến & Phó Bản Tinh Anh (主线关卡 / 精英副本)

### Là gì
Xương sống PvE của game. **Chủ Tuyến** là chuỗi màn đánh theo chương để mở khoá hệ thống và farm nguyên liệu cơ bản; **Phó Bản Tinh Anh** là bản khó (Type `HARD`) của cùng bản đồ, thưởng vật phẩm thăng phẩm/thăng sao cao cấp hơn.

### Cơ chế
- Mỗi màn tốn **thể lực** và trả **vàng + EXP Võ Sĩ**. Ví dụ màn 1-1 (`M01P01`): `StaminaCost = 6`, `GoldReward = 1025`, hoàn thể lực `StaminaBack = 4` (`StagePoint.lua`, khối `M01P01`).
- **3 sao** mỗi màn theo `StarCondition`: `Pass` (qua màn) + `Death ≤ 3` + `Death ≤ 1` — `StagePoint.lua`, khối `StarCondition` của M01P01.
- **Thưởng lần đầu** (`FirstKillReward`) và **thưởng thêm khi quét** (`WipeExtraReward`) tách riêng.
- Mở **Quét Nhanh 10 liên** khi đủ cấp: *"Chủ tuyến quét nhanh 10 liên đã mở"* (`Translate_1.lua:52593`); phó bản thường mở 10 liên theo cấp: *"${uLevel} cấp mở 'Phó bản thường 10 liên quét'"* (`Translate_1.lua:42708`).

### Số liệu Phó Bản Tinh Anh (HARD)
- **13 bản đồ** HARD (`StageHardMap.lua`, đếm `Type = "HARD"`), mỗi bản đồ **6 màn** con (`SubPoint`).
- Mở ở **cấp 52** (`StageHardMap.lua:7`).
- **Rương theo tổng sao** — mỗi bản đồ có 2 mốc rương: **9 sao** và **18 sao** (6 màn × 3 sao = 18 tối đa). Ví dụ HM01: mốc `star = 9` → `StageBox_HM01_9`; mốc `star = 18` → `StageBox_HM01` (`StageHardMap.lua:18-28`).

### Mẹo (nguồn: `Translate_1.lua:11206`, "Bảy ngày đầu quan trọng")
- Ải nào chưa 3 sao thì **đừng cố reset nhiều lần** (phí thể lực), để tăng Lực Chiến rồi quay lại.
- Chương 2 nên **đánh tay** để học combo: `11123` hồi nộ toàn đội (đòn 1 thứ ba đánh vào Võ Sĩ thiếu nộ nhất), `3213` tăng sát thương đại chiêu kế, `22231` giảm công + choáng diện rộng (đòn 2 thứ ba đánh vào output chủ lực địch).

---

# 2. 🏟️ Đấu Trường (竞技场)

### Là gì
PvP xếp hạng bất đồng bộ (đánh đội hình phòng thủ của người khác), leo bảng theo **mùa** để nhận thưởng hạng + Mảnh Vạn Năng.

### Cơ chế & số liệu
- **23 mùa** cấu hình sẵn `AS_1…AS_23`. Mỗi mùa **dài 7 ngày, nghỉ 1 ngày**: `Duration = 7`, `RestDuration = 1` (`ArenaSeason.lua:5,17` cho AS_1, lặp cho mọi mùa).
  - *Lưu ý mâu thuẫn nguồn:* text luật cũ trong game nói *"mỗi 40 ngày một mùa"* (`Translate_1.lua:850`, `Arena_RuleTest01`), nhưng **config hiện hành là 7 ngày/mùa** — tin theo config.
- **15.000 robot** lấp bảng đầu mùa (`RobotAmount = 15000`, `ArenaSeason.lua:14`); hạng không đổi từ **6000** trở xuống (`UNchangedRank = 6000`, `ArenaSeason.lua:7`).
- **Phạm vi khiêu chiến (matchmaking)** chia 2 kiểu (`ArenaMatch.lua`):
  - `Type = "FIXED"` cho top: hạng 1–10 đánh trong khoảng `-10 … +30` bậc (`AM1_10`); hạng 41–50 khoảng `-20 … +100` (`AM1_50`); hạng 51–100 khoảng `-20 … +150` (`AM1_100`).
  - `Type = "PERCENT"` cho hạng thấp (từ hạng 101 trở xuống): dải hệ số `0.4 … 3.0` để ghép đối thủ theo phần trăm Lực Chiến (`AM1_200` = hạng 101–200).
- **Thưởng theo hạng cuối mùa** phân mốc dày: hạng 1, 3, 6, 10, 30, 60, 100, 200, 400, 700, 1000, 1500, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000… (`ArenaSeason.lua`, mảng `MaxRankReward` của mỗi mùa).
- **12 Danh Hiệu** (`ArenaTitle.lua`) theo điều kiện đặc biệt (`Factor`):
  - `KEEP_FIRST` — giữ hạng 1 (Title 1)
  - `RANK` top **3** (Title 2) / top **10** (Title 3)
  - `DEF_WINRATE_UP 0.6` — tỉ lệ thắng thủ ≥ 60% (Title 4)
  - `BATTLE_WINRATE_LOW 0.3` (Title 5)
  - `CONTINUE_WIN_UP 200` — **200** trận thắng liên tục (Title 6)
  - `PUBLIC_ENEMY 500` — bị đánh **500** lần = "kẻ thù chung" (Title 8)
  - `HIDDEN_ACE {10, 300}` (Title 9), `BEST_HERO` (Title 12)

### Nguyên liệu kiếm được
Mỗi ngày cày đủ **20 điểm** → **Mảnh Vạn Năng** (万能碎片) + Điểm Đấu Trường + vàng. **Thua vẫn +1 điểm** (game tự chỉ định 1 đối thủ Lực Chiến thấp ở **ngoài cùng bên phải** để chắc điểm). Nguồn: `Translate_1.lua:11206` mục "2. Cạnh Kỹ Trường".

### Mẹo
- **Ngày mở server, dồn sức leo càng cao càng tốt** — phần lớn là robot (Lực Chiến tăng đều theo hạng, dễ nhận diện, đội hình lộn xộn R lẫn SSR). Nhờ người top "để bài" (下卡) rồi đánh chiếm hạng 1 để nhận thưởng + xong nhiệm vụ Hội Chợ (嘉年华).

---

# 3. 🔥 Con Đường Phong Thần (封神之路) — roguelike leo tháp

### Là gì
Chế độ **leo tháp roguelike** đặc trưng nhất của game. Chọn một **tuyến Võ Sĩ**, dùng **1 nhân vật chính solo leo tầng** (层), gặp sự kiện ngẫu nhiên, ăn đạo cụ/thuốc trên bản đồ, tích **Điểm Tu Luyện** + **Tiền Phong Thần** để cộng cây thiên phú và lên tầng cao hơn. Xử lý bởi `snk/gameplay/myth/`, config `MythStage.lua` / `MythMap.lua` / `MythSweepFloor.lua` / `MythGrow.lua`.

> **Số tuyến:** config `MythMap.lua` hiện có **3 tuyến bản đồ**: **MM01 = Kusanagi Kyo** (草薙京, H001), **MM02 = Nakoruru** (娜可露露, H051), **MM03 = Terry** (特瑞, H004). Các bản hướng dẫn còn mô tả thêm tuyến **Hoả Diễm Văn Chương** (火焰纹章, `Translate_1.lua:11222`) nhưng tuyến này **chưa có** trong `MythMap.lua` bản đang đọc.

### Cơ chế cốt lõi
- **Chiến đấu từng tầng**: mỗi tầng là 1 trận, thắng khi hết giờ (`TimeOut`) hoặc giết `MythHERO`; mỗi trận **300.000 ms = 5 phút** (`MythStage.lua:10`, khối `MS00S01`). Điều kiện sao: `Pass / Death ≤ 3 / Death ≤ 1` (`MythStage.lua:31-42`).
- **Cây thiên phú 3 nhánh**: **Cá Nhân** (个人线), **Đội** (团队线), **Trợ Giúp** (辅助线). Nhánh Trợ Giúp **hàng giữa** sản **Điểm Tu Luyện Phong Thần** (kỹ năng "Phục Hưng" 复兴), kỹ năng cuối "Chiêu Tài Tiến Bảo" (招财进宝) sản **Tiền Phong Thần** (nguồn: hướng dẫn tuyến Nakoruru `Translate_1.lua:11218`, tuyến Hoả Diễm `Translate_1.lua:11222`).
- **Sự kiện ngẫu nhiên / Kỳ Ngộ** (奇遇, `MythRandom.lua`): rương xanh, thuốc (chảy máu/cuồng nộ/hồi sinh — tốn 100 Điểm Tu Luyện mỗi lần gặp奸商/kỳ ngộ), đạo cụ thuộc tính ("Bước Nhanh của Baby", "Hộ Vệ của Hikaru"), nhiệm vụ ẩn ("Bí mật Mộ Kiếm" 剑冢的秘密 — cần thu thập Kyo/Iori + Haohmaru để mở, tặng 1 Chiến Hồn).
- **Quét Nhanh theo tầng** (`MythSweepFloor.lua`): **123 mốc quét** (đếm `Floor =`); mỗi mốc có rương Trả phí/Miễn phí (`SweepBoxReward = {Pay, Free}`) và điểm tu luyện quét (`SweepGrowPoint`). Ví dụ `MM01F10` = quét tới tầng 10.
- **Nhiệm vụ Điểm Vinh Dự** (荣誉点): mỗi tuyến có **40 nhiệm vụ** (`MythMap.lua`, mảng `DPTask` của MM01 = `MM01_DpTask_1…40`), leo được **tối đa 100 điểm vinh dự**/tuyến (`Translate_1.lua:11222` "刷满100荣誉点").
- **Bảng xếp hạng ngày**: `RankReward` **14 mốc** — hạng 1, 2, 4, 7, 11, 21, 51, 101, 201, 501, 1000, 2000, 5000, 10000 (`MythMap.lua`, khối `RankReward` của MM01).
- **Hồi sinh tối đa 2 lần**: lần 1 tốn **100 kim cương**, lần 2 **200 kim cương**; hồi sinh xong bạn đầy máu, BOSS **không** hồi máu (`Translate_1.lua:11222`, mẹo #14).

### Nguyên liệu kiếm được
- **Tiền Phong Thần** (封神币) — chỉ kiếm được trong chế độ này (`Translate_1.lua`).
- **Điểm Tu Luyện Phong Thần** — nâng cây thiên phú.
- **Chiến Hồn (战魂)**: Con Đường Phong Thần **rơi Chiến Hồn** — nguồn Hồn Tinh cho Thần Điện Chiến Hồn.
- **Giá trị Trưởng Thành (成长值)** + mảnh Võ Sĩ của tuyến.

### Mẹo (`Translate_1.lua:11218/11222`)
- **Luôn Quét Nhanh trước**; thất bại/máu thấp thì chuyển đánh tay — đánh tay thu lợi cao hơn hẳn quét (mẹo #13). Cày thành tựu thì đánh tay từ tầng 1.
- Cắm **1 nhân vật chính ở tiền hàng**, hậu hàng để 1–2 quân "nước tương" gom combo (đặt lệch cột để tránh kỹ năng "liệt sát" đánh cả cột).
- Kỹ năng sản tài nguyên (Phục Hưng → Chiêu Tài Tiến Bảo) **cộng càng sớm, lời càng nhiều** Tiền Phong Thần (mẹo #11, #13).
- Đừng phí Tiền Phong Thần — sản lượng thấp mà điểm "phái Ám Sát ẩn giấu" tốn rất nhiều (mẹo #11). Tinh Mạch của Billy tăng sản lượng Tiền Phong Thần (mẹo #12).
- Có **5 lá thư của nhà thiết kế** rơi ngẫu nhiên, mỗi thư tặng kim cương, thư cuối tới **888 kim cương** (một lần duy nhất, mẹo #16).

---

# 4. 👑 Vương Giả Tranh Bá (拳皇争霸) + Quyết Đấu Đỉnh Cao (巅峰对决)

### Là gì
Giải đấu **PvP theo mùa** gồm **2 giai đoạn**:
1. **Sơ khảo "Vương Giả Tranh Bá"** = **đua điểm** (积分赛) — hệ `GBSeason.lua`.
2. **Chung kết "Quyết Đấu Đỉnh Cao"** = **loại trực tiếp** (淘汰赛) giữa **8 mạnh** (八强) — hệ `GBCSeason.lua`.

### Cơ chế & số liệu
- **11 mùa** cấu hình sẵn: `GBSeason_1 … GBSeason_11` (`GBSeason.lua`), thêm khối `GBSeasonDefault`; bản đồ mặc định `GBMap6_6` (một số mùa dùng `GBMap6_6_New`).
- **14 mốc thứ hạng vinh dự** mỗi mùa: hạng 1, 2, 3, 4, 6, 11, 21, 51, 101, 201, 301, 501, 1001, 3001 (`GBSeason.lua:11-25`, mảng `PlayerHonourRank`).
- Chung kết công bố 8 mạnh, đấu loại 1v1 tới ngôi vương.

### Nguyên liệu kiếm được
- **Tiền Tranh Bá (争霸币)** — kiếm khi tham gia Vương Giả Tranh Bá.
- **Tiền Đỉnh Phong (巅峰币)** — dùng ở shop Quyết Đấu Đỉnh Cao.
- Sự kiện kèm mảnh Võ Sĩ SR+ theo hạng.

### Mẹo
- Đội **cực hạn lưu** (Robert + nhà Sakazaki) và các quân khống chế (Ryuji Yamazaki "bánh bao") mạnh trong Tranh Bá.

---

# 5. 🏰 Chiến Tài Nguyên Phe (阵营资源战)

### Là gì
Chiến trường **4 phe chiếm đất theo mùa** trên bản đồ ô lưới. Bạn đại diện cho **Thế Lực (势力)** của mình, phối hợp cả phe **chiếm Lãnh Địa lấy tài nguyên**, cuối cùng **đánh chiếm Vương Tọa Trung Tâm**. Code: `snk/gameplay/campWar/`; config: `snk/gameplay/campWar/CampWarConfig.lua`. Có **2 chế độ** (`CampWarConfig.lua:63-66`): `kCampMode = 1` (cùng server) và `kServerMode = 2` (**跨服 xuyên server**).

### 4 phe (config `CampWarConfig.lua`, `Group_1…Group_4`; tên+màu theo `CampWarCross_rule2`)
- 🔵 **Group_1** (xanh dương) = **Đấu Vương** (格斗之王)
- 🟡 **Group_2** (vàng) = **Long Hổ Quyền** (龙虎之拳)
- 🟣 **Group_3** (tím) = **Ngạ Lang Truyền Thuyết** (饿狼传说)
- 🔴 **Group_4** (đỏ) = **Mạc Mạt Chi Hồn** (幕末之魂)

### Cơ chế (luật chính thức, `Translate_1.lua`, khối `CampWarCross_rule*`)
- **Mở theo tuần**: kỳ mới mở vào **thứ Hai**; mỗi mùa chia nhiều **Giai Đoạn (阶段/phase)** mở khoá dần theo "thiên hạ đại thế" (mùa/giai đoạn quản bởi `CampWarSeason.lua`, `CampWarPhase.lua`).
- **Thu tài nguyên** (`rule12`): sau khi phe chiếm Lãnh Địa, **mọi thành viên phe nhận tài nguyên vào đúng giờ (整点)**. Khung **12h trưa, 17h–20h, 21h** một số Lãnh Địa **tăng sản lượng**.
- **Cướp Lãnh Địa** (`rule10`): khi quân của phe đang giữ ô = 0, **phe của đội tới tiếp theo chiếm ô đó**. **Càng gần Đại Bản Doanh của mình, cộng thuộc tính Võ Sĩ càng cao**.
- **Phái quân** (`rule9`): chỉ được phái tới ô **liền kề** với Lãnh Địa của phe mình.
- **Thủ quân ban đầu** (`rule11`): gồm thủ quân phe + thủ quân trung lập.
- **Rương Trung Tâm** (`rule1`): lần đầu tới **cửu cung Vương Tọa Trung Tâm** nhận **thưởng lớn một lần**.
- **Đại thưởng Giai Đoạn** (`rule7`): cuối mỗi giai đoạn, phát thưởng theo **xếp hạng điểm phe**; ngoài ra có **thưởng xếp hạng Võ Huân** (武勋) cuối mùa (`rule4/rule6`).

### Nguyên liệu & mẹo
- Nhận **tài nguyên phe** + Điểm phe (阵营积分) → thưởng hạng cuối giai đoạn. Có **shop Tài Nguyên Chiến**.
- Mẹo: ưu tiên **giữ ô gần Đại Bản Doanh** để tối đa buff thuộc tính; canh khung giờ tăng sản lượng để đẩy quân.

---

# 6. 🤝 Xã Đoàn (社团) — Bang hội

### Là gì
Hệ thống bang hội đa chức năng: cùng xây dựng, làm nhiệm vụ, đánh phó bản, chơi mini-game, đấu Sân Đấu Xã Đoàn. Cây tính năng con mở ở `ClubLevel = 1` (`ClubTechnology.lua`).

### Các mảng con & số liệu
**a) Cống Hiến (捐献)** — `ClubDonation.lua`:
| Loại | Yêu cầu | EXP Bang |
|---|---|---|
| Vàng | 75.000 vàng | +50 |
| Kim cương | 30 kim cương | +100 |
| Sử thi (Epic) | 200 kim cương | +200 (cần `MemberCondition = 1`) |

Nguồn: `ClubDonation.lua`, khối `GoldDonation / DiamondDonation / EpicDonation` (`Demand` + `ClubExp`).

**b) Mini-game Bang** — `ClubGame.lua`: **Máy Bay (PLANE)** và **Nhảy (JUMP)**, mỗi loại **2 lượt/ngày** (`Times = 2`); mua thêm lượt bằng kim cương theo bậc **200 / 300 / 400** (`BuyCost.amount`). Thưởng tối đa game Nhảy: **150.000 vàng + 1.000 kim cương + 2 vật phẩm IM_F009** (`ClubGame.lua`, `ClubGame_Jump.MaxReward`).

**c) Cây Công Nghệ Bang** — `ClubTechnology.lua`: **4 nhánh** — **Cống Hiến** (`Club_Contribute`), **Mini-game** (`Club_Game`), **Máy Bay** (`Club_Plane`), **Bá Thần** (`Club_BaShen`); tất cả mở ở `ClubLevel = 1`.

**d) Phó Bản Câu Lạc Bộ (社团副本)** — `ClubStagePoint.lua`; đổi bang phải **chờ 24h / qua ngày** mới chơi lại (`Translate_1.lua`, ID `12713` "更换社团24小时后才能参与此玩法" & `11461` "更换社团后要等到明天才能玩").

**e) Sân Đấu Xã Đoàn (社团格斗场)** — `ClubArenaSeason.lua` + robot `ClubArenaRobot.lua`; **Bãi Huấn Luyện Bang (社团训练场)** — `ClubTrainLevel.lua`.

### Nguyên liệu & mẹo
- Kiếm **Tiền Bang (社团币)** qua cống hiến & hoạt động bang.
- Mẹo: **mở hết Bãi Huấn Luyện Bang** (dùng lâu dài); cống hiến kim cương để lấy Tiền Bang; mini-game/kho báu **Bá Thần / Bát Thần (八神宝藏)** là nguồn kiếm **mảnh Yagami** hiệu quả — mốc "10 kim cương / lần" nên điểm (`Translate_1.lua:11230`, phần "八神宝藏").

---

# 7. 🗺️ Phó Bản Thám Hiểm (探险副本)

### Là gì
Phó bản farm **vàng + EXP** với cơ chế "**tổng sao càng nhiều, thu nhập vàng càng cao**" (总星数越多，金币收益越高 — `Translate_1.lua:9374`).

### Số liệu
- **77 bản đồ** thám hiểm (`StageAdventureMap.lua`, đếm `Type = "ADVENTURE"`), mỗi bản đồ **5–10 màn** con (`SubPoint`); ví dụ `AM028` có 10 màn, `AM029`/`AM030` có 5 màn.
- Config phụ trợ: `StageAdventureBoss.lua`, `StageAdventureBox.lua` (rương), `StageAdventureEnemy.lua`.

### Mẹo
- **Đánh 3 sao tất cả màn** để đẩy tổng sao → mở mốc thu nhập vàng cao nhất. Có thể mua thêm lượt mở **Rương Thám Hiểm** bằng kim cương (`Translate_1.lua:11230`, mục "探险宝箱").

---

# 8. 🔮 Thần Điện Chiến Hồn (战魂神殿)

### Là gì
Nơi **hợp thành Chiến Hồn (合成战魂)** — biến Võ Sĩ/đạo cụ hồn thành **Chiến Hồn** (một kỹ năng phụ mà Võ Sĩ có thể **học**). Đây là mảng dưỡng thành **quan trọng thứ 2 sau thẻ bài** ("战魂也是这个游戏仅次于卡牌的养成部分" — `Translate_1.lua:11218`). UI: `snk/gameplay/develop/view/strengthen/HeroSoulTemple*Mediator.lua`.

### Cơ chế
- **Hợp thành**: có Võ Sĩ chỉ định hoặc đạo cụ Chiến Hồn thì hợp được; hợp xong xem/nâng cấp trong túi.
- **Học Chiến Hồn**: Chiến Hồn hiện "Có thể học" → cho một Võ Sĩ học, tương đương thêm 1 kỹ năng mới.
- **Kỹ năng Chiến Hồn theo Võ Sĩ** — `HeroBattleSoul.lua`: mỗi Chiến Hồn có `LevelMax = 20`, bảng `LevelCost` tăng dần (ví dụ `H001_Soul1`: 20, 25, 25, 30, 40 … 370). **Mở khoá theo phẩm chất Võ Sĩ** (`quality`): Soul1 = **40**, Soul2 = **42**, Soul3 = **44**, Soul4 = **51** (`HeroBattleSoul.lua:32, 63, 94, 125`).
- Config hệ liên quan: `HeroSoulLib.lua` (công thức), `HeroSoulSlot.lua` (ô cắm), `HeroSoulFate*.lua` (Duyên Phận Hồn), `HeroSoulRecommend.lua`.

### Nguyên liệu
- **Hồn Tinh (魂晶)** + **mảnh Võ Sĩ** để hợp Chiến Hồn.
- **Tinh Hoa Chiến Hồn (战魂精华)** để nâng cấp.
- Nguồn Hồn Tinh chính: **Con Đường Phong Thần rơi Chiến Hồn**, gói Chiến Hồn (礼包), Máy Gắp/Máy Trứng (扭蛋机).

### Mẹo
- Chiến Hồn **4★–5★** đa số đều tốt; low-star quá độ tốt: **Chiến Hồn Benimaru 3★, Chiến Hồn Maxima 3★**.
- Khi chọn NPC/đồng đội trong Con Đường Phong Thần, ưu tiên nhân vật mang **Chiến Hồn hỗ trợ tốt** (đồng đội kế thừa Chiến Hồn dưỡng bên ngoài — `Translate_1.lua:11218`).

---

# 9. 🗼 Tháp Tông Môn (宗门试炼塔 / SectTower)

### Là gì
Tháp thử thách gắn với hệ **Tông Môn (8 môn phái)**: leo từng tầng, mỗi tầng đấu đội hình Võ Sĩ theo phái. Code: `snk/gameplay/climbTower/controller/ClimbTowerSystem.lua` (đọc `SectTowerPoint`, `SectTower_List`, `SectTower_SectBuff`).

### Số liệu (`SectTowerPoint.lua`)
- **18 tầng** (`floor = 1 … 18`).
- Mở ở **cấp 60** (`OpenLevel = 60`, khối ST01).
- Mỗi trận **300.000 ms = 5 phút** (`Time = 300000`).
- **Hệ số sức mạnh tăng dần theo tầng**: `BattleFactor` 0.5 (tầng 1) → 0.5961 (tầng 2) → …
- **3 sao** mỗi tầng: `Pass / Death ≤ 3 / Death ≤ 1`.
- **AI địch theo phái**: pool `SECT` theo tầng (tầng 1 dùng `SECT1_1/SECT1_2`, tầng 2 dùng `SECT2_*`, …), lấy từ `AIHeroPool`.
- **Buff chọn khi leo**: hệ tháp có cơ chế chọn buff (`SectTower_SectBuff` trong `ClimbTowerSystem.lua`; config buff ở `TowerBuff.lua`).

### Hệ Tông Môn nền (`SectMain.lua`)
- **8 môn phái** `Sect_1 … Sect_8`, **mở dần theo cấp**: 53 / 54 / 55 / 56 / **70 / 71 / 72 / 73** (`ClientLevel`, các dòng 7 / 228 / 432 / 653 / 891 / 1129 / 1350 / 1588). ⚠️ KHÔNG phải tất cả cùng cấp 53 — chỉ Sect_1 mở ở 53, 4 phái cuối nhảy lên 70–73.
- Mỗi phái có danh sách Võ Sĩ, mỗi Võ Sĩ **12 Tâm Pháp (Mind)** (`MindList` 1–12) — nâng để cộng thuộc tính.
- (Liên quan: cây dưỡng thành **"Thần"** — `GodBase.lua`: 8 Thần gắn với phái + 1 Võ Sĩ, `Unlockday 1–8`, `MaxStage = 7`; nâng cấp tốn `IM_RichStone + IR_Gold + IM_FieldStone_*` — `GodStage.lua`, khối `God_1_1_x`.)

### Nguyên liệu & mẹo
- Kiếm **Tiền Thí Luyện (试炼币)** để mua đạo cụ (`Translate_1.lua`, cảnh báo "thiếu Tiền Thí Luyện").
- Mẹo: **dựng đội đúng phái** để tối đa buff Tông Môn; tận dụng buff chọn mỗi tầng; tầng nào chưa qua thì nâng Tâm Pháp/Thần của phái đó rồi quay lại.

---

## 📌 Bảng tổng hợp tệ & nguồn

| Chế độ | Tệ chính | Dùng để |
|---|---|---|
| Đấu Trường | Mảnh Vạn Năng + Điểm Đấu Trường | Đổi Võ Sĩ / shop đấu trường |
| Con Đường Phong Thần | Tiền Phong Thần + Điểm Tu Luyện | Cây thiên phú, shop Phong Thần; **rơi Chiến Hồn** |
| Vương Giả Tranh Bá | Tiền Tranh Bá / Tiền Đỉnh Phong | Shop Quyết Đấu Đỉnh Cao |
| Chiến Tài Nguyên Phe | Tài nguyên phe + Điểm phe / Võ Huân | Shop Tài Nguyên Chiến, thưởng hạng giai đoạn/mùa |
| Xã Đoàn | Tiền Bang | Shop bang, mảnh Yagami (Bá Thần) |
| Tháp Tông Môn | Tiền Thí Luyện | Shop thí luyện |

---

*Nguồn: số liệu trích từ `reference/client-src/config/*.lua` và `reference/client-src/snk/gameplay/*` (KOF98 client Lua đã decompile); tên Việt lấy từ `data/i18n/tm.json`. Mọi con số kèm `file:dòng` để kiểm chứng.*

---

> ## ✅ Độ tin cậy
>
> **Đã kiểm chứng khớp 100% với config (giữ nguyên):**
> - Chủ Tuyến M01P01: StaminaCost 6, GoldReward 1025, StaminaBack 4, OpenLevel 1 (`StagePoint.lua`).
> - Tinh Anh: 13 bản đồ HARD × 6 màn, OpenLevel 52, rương 9★/18★ (`StageHardMap.lua`).
> - Thám Hiểm: 77 bản đồ ADVENTURE, AM028=10 màn/AM029=5 màn (`StageAdventureMap.lua`).
> - Đấu Trường: Duration 7 + RestDuration 1, RobotAmount 15000, UNchangedRank 6000; matchmaking FIXED (1–10 `{-10,30}`, 41–50 `{-20,100}`) + PERCENT (101–200 `{0.4…3.0}`); 12 danh hiệu với Factor 3/10/0.6/200/500 đúng (`ArenaSeason.lua`, `ArenaMatch.lua`, `ArenaTitle.lua`).
> - Phong Thần: trận 300000ms, 123 mốc quét, 40 DPTask, RankReward 14 mốc; hồi sinh 100/200 kim cương, 5 thư 888 kim cương (`MythStage/MythMap/MythSweepFloor.lua`, `Translate_1.lua:11222`).
> - Tranh Bá: 11 mùa GBSeason, 14 mốc PlayerHonourRank (`GBSeason.lua`).
> - CampWar: kCampMode/kServerMode + toàn bộ luật (`CampWarConfig.lua`, `CampWarCross_rule*`).
> - Xã Đoàn: cống hiến 75000/+50, 30/+100, 200/+200; mini-game Times 2 & BuyCost 200/300/400, thưởng Nhảy 150000/1000/2×F009; 4 nhánh công nghệ (`ClubDonation/ClubGame/ClubTechnology.lua`).
> - Tháp: 18 tầng, OpenLevel 60, 300000ms, BattleFactor 0.5→0.5961; GodBase 8 Thần Unlockday 1–8 MaxStage 7 (`SectTowerPoint.lua`, `GodBase/GodStage.lua`).
>
> **Đã SỬA so với bản nháp:**
> 1. **Tông Môn 8 phái KHÔNG cùng mở cấp 53.** Thực tế 53/54/55/56/70/71/72/73 (`SectMain.lua` các dòng 7/228/432/653/891/1129/1350/1588). Chỉ phái đầu (Sect_1) mở ở 53.
> 2. **Mở khoá Con Đường Phong Thần** không phải "8 Thần Unlockday 1–8 của `GodBase.lua`" (đó là hệ Thần/Tông Môn). Đúng là hệ `Myth_System` mở ở **cấp 28** (`UnlockSystem.lua`, `Condition LEVEL = 28`, icon từ cấp 23); mỗi tuyến cần thêm Võ Sĩ neo (`MythMap.lua UnlockCondition`).
> 3. **Số tuyến Phong Thần: 3** (Kyo MM01/H001, Nakoruru MM02/H051, Terry MM03/H004), không phải 4. Tuyến "Hoả Diễm Văn Chương" chỉ có trong text hướng dẫn (`Translate_1.lua:11222`), chưa có trong `MythMap.lua`.
> 4. **HeroBattleSoul phẩm chất mở khoá:** Soul3 = **44** (không phải 42); Soul4 = 51. Chuỗi đúng: 40/42/44/51 (`HeroBattleSoul.lua:32,63,94,125`).
> 5. **Đường dẫn `CampWarConfig.lua`**: nằm ở `snk/gameplay/campWar/`, KHÔNG phải `config/`.
> 6. **Sửa citation guide chiến thuật:** các mẹo (combo chủ tuyến, arena 20 điểm/thua +1, mẹo Phong Thần #11–16) nằm ở `Translate_1.lua:11206` (guide 7 ngày đầu), `11218` (tuyến Nakoruru), `11222` (tuyến Hoả Diễm) — KHÔNG phải dòng 850. (Riêng câu "40 ngày/mùa" đúng là ở dòng 850, `Arena_RuleTest01`.)
> 7. **Số dòng nhỏ:** `StageHardMap` OpenLevel ở dòng **7** (không phải 6); `SectMain` ClientLevel ở dòng **7**; `ArenaSeason` UNchangedRank ở dòng **7** (không phải 8).
> 8. Bổ sung: Đấu Trường có **23 mùa** (AS_1…AS_23); mapping chính xác Group→màu→phe của CampWar; RankReward Phong Thần liệt kê đủ 14 mốc.
>
> **Chưa chắc / cần xác minh thêm từ source:**
> - **3 nhánh cây thiên phú Phong Thần** (Cá Nhân/Đội/Trợ Giúp) và tên kỹ năng "Phục Hưng"/"Chiêu Tài Tiến Bảo" lấy từ **text hướng dẫn** (`Translate_1.lua:11218/11222`), chưa đối chiếu cấu trúc phân nhánh trong `MythGrow.lua` (file dùng `Floor = "BUFF"/"EFFECT"`, không đặt tên nhánh trực tiếp).
> - **"100 điểm vinh dự/tuyến"** đến từ tiêu đề guide tuyến Hoả Diễm (`Translate_1.lua:11222`); chưa cộng dồn giá trị vinh dự của 40 `DPTask` để xác nhận tổng đúng 100 cho mọi tuyến.
> - Một số **tên tệ/shop** (Tiền Đỉnh Phong, shop Tài Nguyên Chiến, Tiền Thí Luyện) và mẹo đội hình (cực hạn lưu, Benimaru/Maxima 3★) lấy từ text hướng dẫn/UI, chưa truy tới bảng shop cụ thể.
> - Danh sách khung giờ tăng sản lượng CampWar (12h/17–20h/21h) và luật "thứ Hai mở kỳ mới" là bản `CampWarCross_*` (xuyên server); bản cùng-server (`kCampMode`) có thể khác chi tiết — chưa đối chiếu riêng.