# KOF98 Wiki — Bách khoa Quyền Hoàng 98

Wiki **song ngữ Trung–Việt** đầy đủ cho game KOF98 (拳皇98 / The King of Fighters '98). Tra cứu võ sĩ, chiến hồn, thần khí, trang bị, công thức lực chiến, sự kiện, cách kiếm tài nguyên — **toàn bộ dữ liệu trích 100% từ source game**, không bịa.

> Trang tĩnh (static), không cần backend. Deploy 2 phút lên Vercel hoặc Railway.

## ✨ Có gì

- **91 võ sĩ** — chỉ số nền, độ hiếm (R→SP), hệ (Công/Thủ/Kỹ), lưu phái, kỹ năng, art nhân vật gốc.
- **1.110 chiến hồn (战魂)** — loại (Toàn Cục/Chỉ Huy/Bị Động…), sao, hiệu ứng.
- **4.333 vật phẩm** — công dụng, phẩm chất, nguồn kiếm; **3.949 icon gốc**.
- **12 cẩm nang hệ thống** — công thức lực chiến, nuôi tướng, chiến hồn, thần khí, trang bị, viện hộ, chế độ chơi, sự kiện & tiền tệ, kinh tế/shop, liên kết cộng hưởng, lộ trình kiếm tài nguyên, hệ thống độ hiếm. Mỗi bài trích nguồn `file:dòng` và đã được nhiều agent kiểm chứng chéo.
- **Máy tính Lực Chiến** — theo đúng công thức gốc `HeroCombatFormula.lua`.
- **Tìm kiếm tức thì**, **chuyển ngữ Trung↔Việt** 1 chạm, responsive.
- **4.959 icon** giải mã trực tiếp từ APK (XXTEA + CCZ + zlib + PVR RGB565/A8).

## 🚀 Deploy

### Cách A — Vercel (khuyên dùng, nhanh nhất)
1. Vào [vercel.com/new](https://vercel.com/new), **Import** repo này (hoặc kéo-thả thư mục).
2. Framework Preset: **Other**. Output Directory: `public`. Không cần build command.
3. Bấm **Deploy**. Xong — có URL public.

Hoặc bằng CLI:
```bash
npm i -g vercel
vercel            # đăng nhập lần đầu, rồi deploy
vercel --prod     # deploy bản chính thức
```

### Cách B — Railway
```bash
npm i -g @railway/cli
railway login
railway init
railway up
```
(Railway sẽ phục vụ thư mục `public/` như static site; hoặc thêm service Nginx trỏ vào `public/`.)

### Cách C — GitHub Pages (miễn phí 100%, không cần Vercel)
Repo đã kèm workflow `.github/workflows/pages.yml`. Chỉ cần:
1. Vào **Settings → Pages → Source: GitHub Actions** (repo cần **Public**, hoặc GitHub Pro nếu Private).
2. Xong — URL live: `https://ntdazzy.github.io/kof98-wiki/` (tự deploy mỗi lần push).

### Chạy thử ở máy
```bash
npm run dev       # python -m http.server 5173 --directory public
# mở http://localhost:5173
```

## 🗂️ Cấu trúc

```
kof98-wiki/
├── public/
│   ├── index.html      # vỏ SPA
│   ├── app.js          # router + search + trang + máy tính + markdown renderer
│   ├── styles.css      # design system (dark, SNK crimson/gold)
│   ├── data/*.json      # heroes / items / warsouls / systems / stats
│   └── icons/*.png      # 4.959 icon gốc giải mã
├── content/*.md        # 12 bài cẩm nang (nguồn của systems.json)
├── vercel.json         # cấu hình static + cache-control
└── package.json
```

## 🔧 Dựng lại dữ liệu (nếu cần)

Dữ liệu được sinh từ source game bằng các script trong `kof98-platform/tools/`:
```bash
cd ../kof98-platform
python -m tools.wiki.extract_icons     # giải mã icon từ APK
python tools/wiki/build_data.py        # sinh public/data/*.json
```

## ⚖️ Ghi chú

Fan-made, phi thương mại, phục vụ tra cứu cá nhân. Không liên kết với SNK hay nhà phát hành. Toàn bộ tài nguyên thuộc bản quyền của chủ sở hữu tương ứng.
