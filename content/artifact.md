# Thần Khí (神器)

I have completed verification of every number and mechanism claim against the source. All checks are done. Here is the corrected final wiki.

---

# Thần Khí (神器) — Wiki hệ thống

> Nguồn: `reference/client-src/config/` (`ArtifactMain`, `ArtifactPoint`, `ArtifactNakoruru`, `ArtifactAthena`, `ArtifactAthenaAction`, `SkillAttrEffect_1`, `SkillSpecialEffect`, `Skill_1`, `Item`, `ConfigValue`, `Translate_1`) + `snk/gameplay/develop/model/artifact/` + `controller/ArtifactSystem.lua`. Tên Việt lấy từ `data/i18n/tm.json` (bản Việt hoá đang chạy). Mọi số liệu đều kèm `file:dòng`.

---

## 1. Thần Khí là gì?

Nguyên văn dẫn nhập trong game (`config/Translate_1.lua:826`, bản Việt hoá):

> "Thần Khí, không chỉ đơn thuần là vũ khí. Thần Khí là vận mệnh truyền thừa của gia tộc, là người bạn cùng chiến đấu, là vầng hào quang thần tượng cổ vũ tiến lên~"

Thần Khí là hệ thống **bồi dưỡng (培养) cộng thuộc tính TOÀN ĐỘI**. Bạn tiêu **Nguồn Thần Khí (神器之源)** để thắp sáng/nâng cấp các **Điểm Thần Khí (神器点)**; mỗi Điểm cho **Cộng Thuộc Tính (属性加成)** áp lên **tất cả Võ Sĩ (格斗家)** ra trận — nên đây là đòn bẩy **Lực Chiến (战力)** dạng "buff nền" cộng dồn vĩnh viễn.

5 quy tắc lõi (`Translate_1.lua:830-846`):

| # | Cơ chế | Nguồn |
|---|--------|-------|
| 1 | Tiêu **Nguồn Thần Khí** để bồi dưỡng Thần Khí, cộng thuộc tính cho **tất cả Võ Sĩ** | `Translate_1.lua:830` |
| 2 | Mỗi Thần Khí bồi dưỡng đủ 1 giai đoạn thì được **Tiến Hóa (进化)**; tiến hóa xong cho **cộng thuộc tính đội hình mạnh hơn** | `Translate_1.lua:834` |
| 3 | **Mỗi lần Tiến Hóa** được chọn thắp sáng **1 Khí Hồn (器魂)**; Khí Hồn **tăng mạnh thuộc tính toàn đội** | `Translate_1.lua:838` |
| 4 | Khi Thần Khí đã bồi tới mức **có thể tiến hóa** thì **không được Đặt Lại (重置)** | `Translate_1.lua:842` |
| 5 | Với điều kiện mở khoá đầu tiên, dấu **"/"** nghĩa là **chỉ cần thỏa 1 trong 2** vế | `Translate_1.lua:846` |

---

## 2. Bản đồ Thần Khí — có bao nhiêu cái?

Game cấu hình **35 Thần Khí** riêng biệt: `Artifact_1 … Artifact_35` (`config/ArtifactMain.lua`, các entry từ dòng 4 đến 8569). Trong đó **9 cái thuộc nhóm Siêu/Cực Thần Khí (超神器/极神器)** — cờ `ArtiPro = 1`: **Artifact_21, 22, 25, 26, 29, 30, 33, 34, 35** (xử lý red-point riêng ở `ArtifactSystem.lua:305-338`).

> ⚠️ Lưu ý: enum `ArtifactType` (`model/artifact/ArtifactConfig.lua:4-30`) chỉ liệt kê **25 loại giao diện/cơ chế** (kSword, kNakoruru, kAthena, kSuperKuLa…), **không phải 35** — nhiều Thần Khí dùng chung một `UIType`. Con số 35 là số Thần Khí thực có trong `ArtifactMain`.

Một số Thần Khí mở đầu (`config/ArtifactMain.lua`):

| Id | Tên (Trung → Việt) | ArtiType | Võ sĩ | StageTotal (tổng cấp mỗi GĐ) | Mở khóa | Dòng |
|----|--------------------|----------|-------|-------------------------------|---------|------|
| Artifact_1 | 草薙剑 → **Thảo Trĩ Kiếm** | Normal | H001 | `{8, 40, 120}` | Qua ải `M03P02` | `4-137` |
| Artifact_2 | 玛玛哈哈 → **Mamahaha** | Nakoruru | H051 | `{8, 40, 120}` | Artifact_1 đạt GĐ3 + Lv30 | `507-528` |
| Artifact_3 | 八尺琼勾玉 → **Bát Xích Quỳnh Câu Ngọc** | Normal | H028 | `{20, 100, 300}` | (Artifact_4 **hoặc** Artifact_6 đạt GĐ3) + sở hữu H028 + Lv30 | `647-681` |
| Artifact_4 | 闪光水晶珠 → **Hạt Pha Lê Lấp Lánh** | Athena | H013 | `{30, 90, 180}` | Artifact_2 đạt GĐ3 + Lv46 | `1126-1146` |
| Artifact_5 | 八咫镜 → **Bát Chỉ Kính** | Normal | H016 | `{16, 80, 240}` | Artifact_3 đạt GĐ3 + Lv55 | `1261-1281` |
| Artifact_6 | 花蝶扇 → **Quạt Hoa Điệp** | Athena | H017 | — | Artifact_2 đạt GĐ3 + Lv38 | `1735-1750` |
| Artifact_21 | 库拉 → **Kula** (Cực Thần Khí) | Athena, `ArtiPro=1` | H044 | `{30, 90, 180}` | Artifact_20 **max GĐ3** + Lv54 | `3577-3597` |
| Artifact_35 | 蕾拉 → **Leila** (Cực Thần Khí) | Athena, `ArtiPro=1` | H251 | — | (theo Unlock riêng) | `8569-8580` |

> **Tam Thần Khí (三神器)** = Thảo Trĩ Kiếm (kiếm, H001) · Bát Chỉ Kính (gương, H016) · Bát Xích Quỳnh Câu Ngọc (ngọc, H028) — chính là bộ ba báu vật thần thoại KOF.

**3 giai đoạn (阶段)** mỗi Thần Khí có tên hậu tố (`ArtifactSystem.lua:70-76`, đọc `ConfigValue.Arti_Qulaity_Text` tại `ConfigValue.lua:43720`; văn bản gốc `Translate_1.lua:57759-57769`):

| Giai đoạn | Enum | Hiển thị | Nguồn |
|-----------|------|----------|-------|
| 1 | `kOne` | `${tên}·Sơ` (初) | `Arti_Qulaity_1` |
| 2 | `kTwo` | `${tên}·Cực` (极) | `Arti_Qulaity_2` |
| 3 | `kThree` | `${tên}·Chung` (终) | `Arti_Qulaity_3` |

(`StageTotal` = tổng số cấp điểm cần đạt để "đầy" mỗi giai đoạn, dùng cho thanh tiến độ.)

---

## 3. Cơ chế lõi & công thức

### 3.1. Điểm Thần Khí (神器点) — nguồn buff chính

Mỗi Thần Khí có nhiều **Điểm** (`ArtiContent`). Định nghĩa điểm nằm **rải theo loại**: Normal ở `config/ArtifactPoint.lua`, Nakoruru ở `config/ArtifactNakoruru.lua`, Athena ở `config/ArtifactAthena.lua`.

Ví dụ `ArtiPoint_1_1` (`config/ArtifactPoint.lua:21278-21304`):

- `MaxLevel = {1, 4, 10}` → cấp tối đa của điểm ở **giai đoạn 1 / 2 / 3** là 1, 4, 10.
- `Skill = {ATP_Skill_1_1_1, _1_1_2, _1_1_3}` → mỗi giai đoạn dùng một kỹ năng khác, mạnh dần.

Chuỗi liên kết buff: **Điểm → Kỹ năng điểm (`ATP_Skill_*`) → AttrEffect thực (`ATP_*`)**. Ví dụ `ATP_Skill_2_1_1` trỏ tới `AttrEffect = {ATP_2_1_1}` (`config/Skill_1.lua:58165-58184`).

**Công thức tăng trưởng** (`model/effect/attribute/AttrEffectFormula.lua:59-67`):

```
FIXED  (kFixed) : num = Value
LINEAR (kLevel) : num = Value[1] + (level - 1) * Value[2]   -- hầu hết Điểm Thần Khí
CUSTOM (kCustom): num = Value[level]
```

Số liệu buff THẬT (cộng thẳng; `EffectRange = ALL`; `Target` quy định phạm vi tướng nhận buff — `config/SkillAttrEffect_1.lua`):

| AttrEffect | Thuộc tính | Target | Value `{a,b}` | Công thức LINEAR | Đỉnh giai đoạn | Nguồn |
|------------|-----------|--------|----------------|-------------------|----------------|-------|
| `ATP_2_1_1` (Điểm 1 Mamahaha, GĐ1) | ATK | ALL | `{100, 0}` | 100 cố định | 100 (max lv1) | `:87136` |
| `ATP_2_1_2` (GĐ2) | ATK | ALL | `{50, 50}` | 50 × cấp | 200 (max lv4) | `:87303` |
| `ATP_2_1_3` (GĐ3) | ATK | ALL | `{30, 30}` | 30 × cấp | 300 (max lv10) | `:87470` |
| `ATP_2_2_2` (Điểm 2, GĐ2) | DEF | ALL | `{35, 35}` | 35 × cấp | 140 (max lv4) | `:87322` |
| `ATP_31_1_1` (Artifact_31) | ATK | **DPS** | `{120, 120}` | 120 × cấp | — | `:104924` |
| `ATP_35_1_1` (Artifact_35 Leila) | ATK | ALL | `{160, 160}` | 160 × cấp | — | `:108368` |

> Lên giai đoạn cao thì đổi sang kỹ năng mạnh hơn và mở nhiều cấp hơn (`{1,4,10}`), nên **giá trị cộng dồn phình rất nhanh ở giai đoạn 3**.

**Chi phí nâng điểm** = **Nguồn Thần Khí (`IR_ArtiUp`) + Vàng (`IR_Gold`)**, khai báo trong trường `Cost` của điểm, tăng theo cấp. Ví dụ `ArtiPoint_31_1` giai đoạn 3 (`config/ArtifactPoint.lua:63-95`):

- Nguồn Thần Khí mỗi cấp: `{1,2,3,4,5,6,7,8,9,10}` (tổng **55** để đầy 10 cấp)
- Vàng mỗi cấp: `{25000, 75000, 125000, 200000, 200000, 200000, 300000, 300000, 300000, 500000}`

### 3.2. Tiến Hóa (进化) — buff đội + thăng phẩm võ sĩ

Điều kiện & hiệu ứng (`model/artifact/StageDevelopArtifact.lua:30-64`): kích hoạt hiệu ứng Tiến Hóa khi **tất cả Điểm của giai đoạn hiện tại đạt max cấp** (`getAllPointLvMax`).

- **GĐ1** đầy điểm → bật `Evolve1`
- **GĐ2**: luôn có `Evolve1`; đầy điểm → thêm `Evolve2`
- **GĐ3**: có `Evolve1+2`; đầy điểm → thêm `Evolve3`

Hiệu ứng Tiến Hóa là **CHANGERARITY** — **nâng phẩm/độ hiếm cho võ sĩ đại diện** (`config/SkillSpecialEffect.lua`):

| Effect | heroId | Nâng phẩm tới | Nguồn |
|--------|--------|---------------|-------|
| `A1Evolve1_Effect` | H001 | 12 | `:13707` |
| `A1Evolve2_Effect` | H001 | 13 | `:13717` |
| `A1Evolve3_Effect` | H001 | 14 | `:13727` |

Trường `RarityChangeShow = {11, 14}` của Artifact_1 (`ArtifactMain.lua:134-137`) = hiển thị phẩm từ **11 → 14** sau khi tiến hóa đủ. ⇒ Ngoài buff toàn đội (từ việc mở giai đoạn kế), Tiến Hóa còn **thăng phẩm miễn phí** cho 1 tướng cụ thể.

> ⚠️ Quy tắc 4: khi đã bồi tới mức "có thể tiến hóa" thì **khóa Reset**. `BasisArtifact:canRset()` (`BasisArtifact.lua:282-320`) trả `false` nếu đã max giai đoạn cuối, đang chờ tiến hóa (`canUp`), hoặc điểm đã đầy.

### 3.3. Khí Hồn (器魂) — buff % toàn đội

- Mỗi Thần Khí có tối đa **3 ô Khí Hồn** (`ArtiSoul = {S1, S2, S3}`, ví dụ `ArtifactMain.lua:45-49`).
- **Mỗi lần Tiến Hóa cho +1 lượt** thắp Khí Hồn (quy tắc 3, `Translate_1.lua:838`); bạn **chỉ chọn 1** Khí Hồn mỗi lượt. Số lượt do server cấp qua `availableSouls` (`BasisArtifact.lua:98`), client đọc bằng `getSoulCanActiveCount` (`:278-280`).
- Khí Hồn cho buff **phần trăm**, phạm vi tùy `Target` (không phải cái nào cũng toàn đội). Ví dụ Khí Hồn của Artifact_1 (`config/SkillAttrEffect_1.lua`):

| Khí Hồn | Hiệu ứng | Target | Nguồn |
|---------|----------|--------|-------|
| `ATP_1_S1` | Giảm sát thương nhận (UNHURTRATE) **+10%** | FRONT (tuyến đầu) | `:90316` |
| `ATP_1_S2` | Tăng sát thương gây (HURTRATE) **+1.5%** & giảm nhận **+3%** | ALL (toàn đội) | `:90335` |
| `ATP_1_S3` | Tăng sát thương gây (HURTRATE) **+6%** | BACK (hàng sau) | `:90359` |

- Có thể **Đặt Lại trạng thái Khí Hồn** để chọn lại: `requestRsetSoul` (`ArtifactSystem.lua:697-709`); text UI "Đặt lại trạng thái tất cả Hồn Khì" (`重置所有器魂状态`, tm.json).

### 3.4. Thắp Sáng Một Chạm (一键点亮) — nuôi hàng loạt

"Thắp Sáng Một Chạm" (`一键点亮` → **Thắp Sáng Một Chạm**, tm.json) = nâng nhanh nhiều điểm thay vì bấm từng cái. Cơ chế (`controller/ArtifactSystem.lua:576-614`):

- Khi `extraData.chooseStatus == true`, request đổi `pointId = ""` (rỗng) — báo **server tự chọn & nâng** điểm phù hợp.
- Client có hàm dự đoán `getCanLevelupPointId` (`:222-257`, dùng cho red-point/preview) chọn theo thứ tự ưu tiên: **điểm có thể nâng (`showState=999`) trước → cấp thấp nhất trước → chỉ số (index) nhỏ trước**.
- Chức năng phải **mở khóa** trước ("Mở Thắp Sáng Một Chạm" = `开启一键点亮`, tm.json).

### 3.5. Thần Khí kiểu Athena (雅典娜) — cơ chế "rút thăm" điểm

Nhóm `ArtiType = "Athena"` (Artifact_4 Hạt Pha Lê, Artifact_6 Quạt Hoa Điệp, Artifact_21 Kula, Artifact_35 Leila…) dùng cơ chế **hành động (ArtiAction)** thay vì nâng thẳng: mỗi lần bồi dưỡng tung một action có **nhiều kết quả ngẫu nhiên theo tỉ lệ** (`config/ArtifactAthenaAction.lua`). Ví dụ `ArtiAction_35_1` (`:4-109`):

- `Stage1Effect`: 5 nhánh `Rate = 0.2 → 1.0`, đều `Flag = "Normal"`, mỗi nhánh phân bổ +1 vào một nhóm `ArtiPoint_35_x`.
- `Stage2Effect`: có cả `Flag = "Crit"` (kết quả tốt hơn).
- `Stage3Effect`: có nhánh **`Flag = "Failure"` (`Rate=1, Point={}`)** — tức có thể **hụt**, không được điểm.
- Request riêng: `requestUpArtifactAthena(id, actionId)` (`ArtifactSystem.lua:738-754`); bảng kết quả cấu hình ở `ConfigValue.Athena_ResultMap` (`ConfigValue.lua:43729`).

Điểm Athena (`config/ArtifactAthena.lua:4-20`) có `MaxLevel = 30` (một số, không phải mảng theo GĐ), `ExtraSkill` mở ở mốc cấp `{5, 12, 25}`, giá trị buff mạnh hơn Normal (ví dụ `ATP_35_1_1` = 160 ATK/cấp). Chi phí Athena nặng hơn: thêm nguyên liệu **`IM_FAll14`** ngoài Nguồn Thần Khí + Vàng (`ArtifactMain.lua:3106-3120`).

---

## 4. Nguyên liệu & cách kiếm

**Nguyên liệu chính: Nguồn Thần Khí (神器之源 = `IR_ArtiUp`)** — `config/Item.lua:49420-49444`:

- `CN_Name = "神器之源"` → **Nguồn Thần Khí**; `SubType = "ARTI_UP"`, `Page = "CURRENCY"`, `Quality = 4`.

Cách farm (khớp text in-game, tm.json):
- **"Đánh ải, lấy Nguồn Thần Khí"** (`打关卡，拿神器之源`) — nguồn cày chính từ ải chiến dịch.
- **Phúc Lợi Thần Khí Ngày/Tuần** (`每日神器福利` / `每周神器福利`), **Phúc Lợi Thần Khí Hồi Quy** (`回流神器福利`), các gói/rương lễ.
- Nhiều rương/thẻ nạp thả kèm `IR_ArtiUp` số lượng lớn (ví dụ rương thả `amount = 20` tại `Item.lua:38626`; rương "100 vạn vàng + ... + Nguồn Thần Khí x20" tại `Translate_1.lua:15026`).

**Nguyên liệu phụ:**
- **Vàng (`IR_Gold`)** — đi kèm mọi lần nâng điểm.
- **`IM_FAll14`** — chỉ cho Thần Khí kiểu Athena/Cực Thần Khí (`ArtifactMain.lua:3106`).

**Phần thưởng ngược từ Thần Khí:** mỗi giai đoạn có mốc tiến độ **33% / 66% / 100%** thả rương `ArtiBox_X_Y` (`ArtifactMain.lua:75-118`), cộng các **"trứng" (Eggs)** gắn mốc sự kiện (`ArtifactMain.lua:26-44`).

---

## 5. Lộ trình nâng cấp (mở khóa dây chuyền)

Thần Khí mở theo chuỗi điều kiện `Unlock`, thường gồm **cấp nhân vật (`PLAYER`)** + **Thần Khí trước đạt GĐ3 (`ARTIFACT_REACH` phase 3)** hoặc **sở hữu tướng (`OWN_HERO`)**:

```
Artifact_1 (ải M03P02)
   └─ GĐ3 → Artifact_2 (Lv30) ─┬─ GĐ3 → Artifact_4 (Lv46), Artifact_6 (Lv38)
                                └─ (Artifact_4 hoặc 6 GĐ3) → Artifact_3 (Lv30 + sở hữu H028) → GĐ3 → Artifact_5 (Lv55) → …
Cực Thần Khí (vd Artifact_21) mở khi Thần Khí trước max GĐ3 + đạt cấp nhân vật cao (Lv54).
```

(Chi tiết: `ArtifactMain.lua:512-528, 652-681, 1131-1146, 1266-1281, 1735-1750, 3582-3597`.) Quy tắc 5: trong điều kiện đầu, dấu **"/"** nghĩa là **chỉ cần thỏa 1 trong 2** vế (`Translate_1.lua:846`).

**Vòng lặp bồi dưỡng 1 Thần Khí:** Mở khóa → nâng các Điểm bằng Nguồn Thần Khí (dùng **Một Chạm** cho nhanh) → điểm đầy giai đoạn → **Tiến Hóa** (buff đội + thăng phẩm tướng + 1 lượt Khí Hồn) → chọn **Khí Hồn** → lặp lại cho giai đoạn kế (Sơ → Cực → Chung).

---

## 6. Mẹo tối ưu (đòn bẩy Lực Chiến)

1. **Dồn Nguồn Thần Khí vào Thần Khí sớm nhất (Artifact_1, _2)** để nhanh đạt **GĐ3** — vừa mở dây chuyền các Thần Khí sau, vừa gom đủ lượt **Khí Hồn**.
2. **Đẩy "đầy điểm" của giai đoạn hiện tại trước**: chỉ khi **toàn bộ điểm max** mới bật được `Evolve` (buff đội + thăng phẩm). Điểm dở dang = mất buff tiến hóa (`StageDevelopArtifact.lua:33-61`).
3. **Dùng Thắp Sáng Một Chạm** để tránh phân bổ tay sai; hệ thống tự dồn vào điểm cấp thấp/khả nâng trước (`ArtifactSystem.lua:242-254`).
4. **Chốt Khí Hồn theo nhu cầu đội**: Khí Hồn cho **% (giảm nhận / tăng gây sát thương)** — mạnh hơn nhiều so với vài trăm ATK phẳng của một điểm lẻ (so `ATP_1_S2` +3% giảm nhận toàn đội với `ATP_2_1_3` +30 ATK/cấp). Chú ý phạm vi `Target` (S1 tuyến đầu, S3 hàng sau). Chọn sai thì **Đặt Lại Khí Hồn** để đổi.
5. **Đừng lỡ tay Tiến Hóa nếu định Đặt Lại**: sau khi đạt mốc "có thể tiến hóa" là **khóa Reset** (quy tắc 4). Với Thần Khí **Athena**, nhớ có nhánh **"Failure"** (`ArtifactAthenaAction.lua`, Stage3) — kết quả điểm may rủi, nên gom nhiều Nguồn Thần Khí rồi hẵng bồi dưỡng liên tục.
6. **Thăng phẩm tướng miễn phí**: ưu tiên nuôi Thần Khí có **võ sĩ đại diện đang trong đội chính** — vì `Evolve` nâng phẩm chính tướng đó (H001 lên 12→13→14), cộng gộp vào **Lực Chiến account**.

---

## 7. Mini-glossary Trung → Việt

| Trung | Việt (bản game) | Ghi chú |
|-------|-----------------|---------|
| 神器 | Thần Khí | hệ thống này |
| 神器之源 | Nguồn Thần Khí | nguyên liệu chính (`IR_ArtiUp`) |
| 神器点 | Điểm Thần Khí | node buff |
| 器魂 | Khí Hồn | buff % toàn đội, chọn 1/lần tiến hóa |
| 进化 | Tiến Hóa | đầy điểm → buff đội + thăng phẩm tướng |
| 一键点亮 | Thắp Sáng Một Chạm | nuôi hàng loạt |
| 培养 | Bồi Dưỡng | nâng cấp Thần Khí |
| 重置 | Đặt Lại | reset (khóa khi đủ điều kiện tiến hóa) |
| 属性加成 | Cộng Thuộc Tính | buff |
| 格斗家 | Võ Sĩ | nhân vật |
| 战力 | Lực Chiến | sức chiến |
| 超神器 / 极神器 | Siêu / Cực Thần Khí | nhóm `ArtiPro=1` |
| 初 / 极 / 终 | Sơ / Cực / Chung | tên 3 giai đoạn |
| 草薙剑 / 八咫镜 / 八尺琼勾玉 | Thảo Trĩ Kiếm / Bát Chỉ Kính / Bát Xích Quỳnh Câu Ngọc | Tam Thần Khí (三神器) |
| 闪光水晶珠 / 玛玛哈哈 / 花蝶扇 | Hạt Pha Lê Lấp Lánh / Mamahaha / Quạt Hoa Điệp | Artifact_4 / _2 / _6 |

---

> ## Độ tin cậy
>
> Đã đối chiếu từng con số với config Lua giải nén (kèm `file:dòng`). **Các điểm ĐÃ SỬA so với bản nháp:**
>
> 1. **Artifact_21 `StageTotal`**: nháp ghi `{40,160,400}` — **SAI/bịa**. Thực tế `{30, 90, 180}` (`ArtifactMain.lua:3577-3581`).
> 2. **Artifact_21 mở khóa "Lv1"**: **SAI**. `ShowCondition PLAYER=1` (`:3019`) chỉ là điều kiện *hiển thị*; `Unlock` thực yêu cầu **Artifact_20 đạt max GĐ3 (`ARTIFACT_MAX phase 3`) + PLAYER=54** (`:3582-3597`).
> 3. **Tên Artifact_4**: nháp ghi "Athena 雅典娜" — **SAI**. Tên Thần Khí là **闪光水晶珠 → Hạt Pha Lê Lấp Lánh** (`Artifact_4_Name`). "Athena" chỉ là `ArtiType` (cơ chế) và H013 là nhân vật Athena.
> 4. **Tên Artifact_5**: nháp ghi "Bát Trĩ Nữ" — **SAI/bịa**. Tên là **八咫镜 → Bát Chỉ Kính** (gương, H016), một trong Tam Thần Khí.
> 5. **"35 loại Thần Khí (enum ArtifactType)"**: con số 35 **đúng** cho *số Thần Khí* (`Artifact_1..35` trong `ArtifactMain.lua`), nhưng enum `ArtifactType` (`ArtifactConfig.lua:4-30`) chỉ có **25** loại — đã tách rõ.
> 6. **Khí Hồn "Target = ALL"**: **chưa chính xác toàn phần**. `ATP_1_S1` là `Target=FRONT`, `ATP_1_S3` là `Target=BACK`, chỉ `S2` mới `ALL` — đã bổ sung bảng đủ 3 Khí Hồn + cột `Target`.
> 7. **"+1 lượt Khí Hồn / lần tiến hóa"** và **`getCanLevelupPointId`**: làm rõ chúng là **cơ chế server-driven / hàm client dự đoán** (nháp gọi nhầm là logic hardcode / "server chọn").
> 8. **Stage1Effect "Normal/Crit"**: **chưa chính xác** — Stage1 toàn `Normal`; `Crit`/`Failure` xuất hiện ở Stage2/Stage3. Đã chỉnh.
>
> **ĐÚNG NGUYÊN (đã xác minh khớp source):** toàn bộ số buff `ATP_*` (100/50/30/35/120/160), công thức LINEAR `Value[1]+(level-1)*Value[2]` (`AttrEffectFormula.lua:63`), chuỗi Điểm→Skill→AttrEffect (`Skill_1.lua:58165`), CHANGERARITY H001→12/13/14 (`SkillSpecialEffect.lua:13707-13727`), logic tiến hóa (`StageDevelopArtifact.lua:30-64`), chi phí `ArtiPoint_31_1` (`ArtifactPoint.lua:63-95`), StageTotal/Unlock của Artifact_1–6, item `IR_ArtiUp` (`Item.lua:49420`), 5 quy tắc & tên 3 giai đoạn, request Athena/Rset (`ArtifactSystem.lua`).
>
> **CHƯA CHẮC (server-side, ngoài file client):** (a) tỉ lệ rơi Nguồn Thần Khí ở ải/rương — không hardcode droprate trong client, chỉ mô tả theo text UI; (b) quan hệ AND/OR *giữa các nhóm* điều kiện `Unlock` do server phán (client chỉ đặc-case `OWN_HERO`), nên diễn giải chuỗi mở khóa theo cấu trúc dữ liệu + quy tắc 5.

---

**Tóm tắt cho caller:** Bản nháp có **5 lỗi số liệu/tên nghiêm trọng** (Artifact_21 StageTotal bịa `{40,160,400}` thực là `{30,90,180}`; Artifact_21 mở khóa "Lv1" thực là Artifact_20 max GĐ3 + Lv54; tên Artifact_4 và Artifact_5 sai; "35 loại" gán nhầm cho enum 25 phần tử) + **3 điểm imprecise** (Target Khí Hồn, nguồn số lượt Khí Hồn, flag Stage1). Tất cả đã sửa và trích nguồn. Phần công thức, số buff, cơ chế tiến hóa/CHANGERARITY, chi phí, và chuỗi liên kết buff đều xác minh **khớp source**.