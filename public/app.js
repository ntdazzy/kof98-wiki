/* ============================================================
   KOF98 WIKI — app  (viết cho người chơi, không phải người code)
   ============================================================ */
const S = { lang: localStorage.getItem('kof_lang') || 'vi', data: {}, index: [] };
const app = document.getElementById('app');
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => (s ?? '').toString().replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const T = o => !o ? '' : (S.lang === 'zh' ? (o.zh || o.vi) : (o.vi || o.zh)) || '';
const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');

/* ---------- nhãn thân thiện (đổi mã game -> tiếng người đọc) ---------- */
const EL = { '攻': 'Công', '防': 'Thủ', '技': 'Kỹ' };          // hệ chiến đấu
const EL_LETTER = { '攻': 'C', '防': 'T', '技': 'K' };
const RAR_ORDER = ['SP', 'UR', 'SSR', 'SRP', 'SR', 'R'];
const RAR_VI = { SP: 'Cực phẩm (SP)', UR: 'Tối thượng (UR)', SSR: 'Cực hiếm (SSR)', SRP: 'Hiếm+ (SRP)', SR: 'Hiếm (SR)', R: 'Thường (R)' };
const SOUL_TYPE = {
  COMMAND: 'Chỉ huy', GLOBAL: 'Toàn cục', PASSIVE: 'Bị động', ATTR: 'Thuộc tính',
  ANGER: 'Nộ khí', FATE: 'Mệnh hồn', TALENT: 'Thiên phú', HALO: 'Hào quang',
};
const ITEM_TYPE = {
  HONOUR: 'Vinh dự', BOX_RANDOM: 'Rương ngẫu nhiên', BOX_SELECT: 'Rương tự chọn',
  BOX_CD: 'Rương định giờ', BOX_CD_NUMBER: 'Rương định giờ',
  HEROSOUL_N: 'Mảnh Chiến Hồn', HEROSOUL_F: 'Mảnh Chiến Hồn', HEROSOUL: 'Chiến Hồn',
  SOUL_UP: 'Nâng Chiến Hồn', SOULCREAM: 'Nâng Chiến Hồn',
  FLOWERTASK: 'Tặng phẩm', FLOWERSHOW: 'Tặng phẩm',
  ACTIVITY_ITEM: 'Vật phẩm sự kiện',
  EQUIP_STAR: 'Nâng sao trang bị', EQUIP_F: 'Mảnh trang bị', EQUIP_QUALITY_UP: 'Nâng phẩm trang bị',
  EQUIP_REFINE: 'Tinh luyện trang bị',
  HERO_F: 'Mảnh võ sĩ', HERO_QUALITY: 'Nâng phẩm võ sĩ', HERO_STAR: 'Nâng sao võ sĩ', HEROREBORN: 'Tái sinh võ sĩ',
  INTERVENE: 'Chiêu mộ / Can thiệp', INTERVENEDRAW: 'Chiêu mộ',
  GOLD_ITEM: 'Vàng', MALL: 'Cửa hàng', MONTHCARD: 'Thẻ tháng', TIMEPURCHASE: 'Gói ưu đãi',
  VOUCHER: 'Phiếu', GMPAY: 'Gói nạp', GMPRIVILEGE: 'Đặc quyền',
  POWER_UP: 'Tăng lực chiến', EXP_UP: 'Tăng kinh nghiệm', COLLECT_UP: 'Đạo cụ sưu tập',
  COLLECT_TEAM: 'Sưu tập', SECT_UP: 'Nâng lưu phái', FIELD_STONE: 'Bảo thạch',
  RED_POCKET: 'Lì xì', MINTAGE: 'Đúc tiền', WOF: 'Vòng quay', ITEM_FRAG: 'Mảnh vật phẩm',
};
const itemTypeVi = t => ITEM_TYPE[t] || 'Vật phẩm';

/* ---------- data ---------- */
async function loadData() {
  const files = ['heroes', 'items', 'warsouls', 'systems', 'stats', 'equipment', 'events', 'artifacts', 'arena'];
  const res = await Promise.all(files.map(f => fetch(`data/${f}.json`).then(r => r.json()).catch(() => null)));
  files.forEach((f, i) => S.data[f] = res[i]);
  buildIndex();
}
function buildIndex() {
  const idx = [];
  (S.data.heroes || []).forEach(h => { const n = h.name || {}; if (n.vi || n.zh) idx.push({ t: 'hero', id: h.id, k: 'Võ Sĩ', vi: n.vi, zh: n.zh, icon: h.portrait || h.avatar, extra: RAR_VI[h.rarity] || '', route: `#/hero/${h.id}` }); });
  (S.data.warsouls || []).forEach(s => { const n = s.name || {}; if (n.vi || n.zh) idx.push({ t: 'soul', id: s.id, k: 'Chiến Hồn', vi: n.vi, zh: n.zh, icon: s.icon, extra: SOUL_TYPE[s.type] || '', route: `#/soul/${s.id}` }); });
  (S.data.items || []).forEach(it => { const n = it.name || {}; if ((n.vi || n.zh) && it.icon) idx.push({ t: 'item', id: it.id, k: 'Vật Phẩm', vi: n.vi, zh: n.zh, icon: it.icon, extra: itemTypeVi(it.type), route: `#/item/${it.id}` }); });
  (S.data.equipment || []).forEach(e => { const n = e.name || {}; if (n.vi || n.zh) idx.push({ t: 'equip', id: e.id, k: 'Trang Bị', vi: n.vi, zh: n.zh, icon: e.icon, extra: RAR_VI[e.quality] || '', route: `#/equip/${e.id}` }); });
  (S.data.systems || []).forEach(sy => { if (sy.title) idx.push({ t: 'guide', id: sy.key, k: 'Cẩm Nang', vi: sy.title, zh: sy.title, icon: null, extra: '', route: `#/guide/${sy.key}` }); });
  S.index = idx;
}

/* ---------- markdown ---------- */
function md(src) {
  const lines = src.replace(/\r/g, '').split('\n');
  let html = '', i = 0;
  const inline = t => esc(t)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, txt, url) => /^(https?:|mailto:|#|\/)/i.test(url.trim()) ? `<a href="${url.trim()}" rel="noopener">${txt}</a>` : txt)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
  const slug = t => norm(t).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);
  while (i < lines.length) {
    let l = lines[i];
    if (/^```/.test(l)) { let c = ''; i++; while (i < lines.length && !/^```/.test(lines[i])) c += lines[i++] + '\n'; html += `<pre><code>${esc(c)}</code></pre>`; i++; continue; }
    if (/^\|/.test(l) && i + 1 < lines.length && /^\|[\s:|-]+\|/.test(lines[i + 1])) {
      const rows = []; while (i < lines.length && /^\|/.test(lines[i])) rows.push(lines[i++]);
      const cells = r => r.split('|').slice(1, -1).map(c => c.trim());
      let t = '<div class="tw"><table><thead><tr>' + cells(rows[0]).map(c => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>';
      for (let r = 2; r < rows.length; r++) t += '<tr>' + cells(rows[r]).map(c => `<td>${inline(c)}</td>`).join('') + '</tr>';
      html += t + '</tbody></table></div>'; continue;
    }
    let m;
    if (m = l.match(/^(#{1,4})\s+(.*)/)) { const n = m[1].length; const id = n <= 3 ? slug(m[2]) : ''; html += `<h${n}${id ? ` id="${id}"` : ''}>${inline(m[2])}</h${n}>`; i++; continue; }
    if (/^>/.test(l)) { let c = ''; while (i < lines.length && /^>/.test(lines[i])) c += lines[i++].replace(/^>\s?/, '') + ' '; html += `<blockquote>${inline(c)}</blockquote>`; continue; }
    if (/^[-*]\s/.test(l)) { let c = '<ul>'; while (i < lines.length && /^[-*]\s/.test(lines[i])) c += `<li>${inline(lines[i++].replace(/^[-*]\s/, ''))}</li>`; html += c + '</ul>'; continue; }
    if (/^\d+\.\s/.test(l)) { let c = '<ol>'; while (i < lines.length && /^\d+\.\s/.test(lines[i])) c += `<li>${inline(lines[i++].replace(/^\d+\.\s/, ''))}</li>`; html += c + '</ol>'; continue; }
    if (/^(---|___|\*\*\*)\s*$/.test(l)) { html += '<hr>'; i++; continue; }
    if (l.trim() === '') { i++; continue; }
    let p = l; i++; while (i < lines.length && lines[i].trim() !== '' && !/^(#|\||>|[-*]\s|\d+\.\s|```)/.test(lines[i])) p += ' ' + lines[i++];
    html += `<p>${inline(p)}</p>`;
  }
  return html;
}
function tocFrom(src) {
  const out = [];
  src.split('\n').forEach(l => { const m = l.match(/^(#{2,3})\s+(.*)/); if (m) { const t = m[2].replace(/[*`]/g, ''); out.push({ n: m[1].length, t, id: norm(t).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) }); } });
  return out;
}

/* ---------- search ---------- */
const searchInput = $('#search'), searchPop = $('#searchPop');
let selIdx = -1, curResults = [];
function doSearch(q) {
  q = norm(q.trim());
  if (!q) { searchPop.classList.remove('show'); return; }
  const scored = [];
  for (const r of S.index) {
    const nv = norm(r.vi), nz = (r.zh || '').toLowerCase();
    let sc = 0;
    if (nv === q || nz === q) sc = 100;
    else if (nv.startsWith(q) || nz.startsWith(q)) sc = 70;
    else if (nv.includes(q) || nz.includes(q)) sc = 40;
    if (sc) scored.push([sc, r]);
  }
  scored.sort((a, b) => b[0] - a[0]);
  curResults = scored.slice(0, 24).map(x => x[1]); selIdx = -1;
  searchPop.innerHTML = curResults.length ? curResults.map((r, i) => `
    <a class="sres" href="${r.route}" data-i="${i}">
      <div class="si">${r.icon ? `<img loading="lazy" src="${r.icon}" alt="">` : (r.t === 'guide' ? '📖' : '')}</div>
      <div class="st"><b>${esc(T(r) || r.vi || r.zh)}</b><span>${esc(r.zh && S.lang !== 'zh' ? r.zh + ' · ' : '')}${esc(r.extra)}</span></div>
      <span class="sk">${r.k}</span>
    </a>`).join('') : '<div class="sempty">Không tìm thấy kết quả</div>';
  searchPop.classList.add('show');
}
searchInput.addEventListener('input', e => doSearch(e.target.value));
searchInput.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown') { e.preventDefault(); selIdx = Math.min(selIdx + 1, curResults.length - 1); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); selIdx = Math.max(selIdx - 1, 0); }
  else if (e.key === 'Enter' && curResults[selIdx]) { location.hash = curResults[selIdx].route; searchPop.classList.remove('show'); searchInput.blur(); return; }
  else if (e.key === 'Escape') { searchPop.classList.remove('show'); searchInput.blur(); return; }
  [...searchPop.querySelectorAll('.sres')].forEach((el, i) => el.classList.toggle('sel', i === selIdx));
});
document.addEventListener('click', e => { if (!e.target.closest('.searchbox')) searchPop.classList.remove('show'); });

/* ---------- helpers ---------- */
function zhLine(zh) { return zh && S.lang !== 'zh' ? `<div class="zh">${esc(zh)}</div>` : ''; }
// Tô màu số liệu + thuật ngữ trong game để đọc trực quan hơn.
function hl(text) {
  let s = esc(text);
  // số: có dấu +/-, %, ×, phần nghìn, thập phân
  s = s.replace(/(×\s?\d[\d.,]*|[+\-−±]\s?\d[\d.,]*\s?%?|\b\d[\d.,]*\s?%|\b\d[\d.,]*)/g, m => `<span class="nm">${m}</span>`);
  // thuật ngữ game trong 「」 và 【】
  s = s.replace(/「([^」]*)」/g, '<span class="tm">「$1」</span>').replace(/【([^】]*)】/g, '<span class="tm">【$1】</span>');
  return s;
}
function descBlock(o, fallback) {
  const vi = T(o);
  if (!vi) return fallback ? `<div class="desc-box muted">${esc(fallback)}</div>` : '';
  const showZh = o && o.zh && S.lang !== 'zh' && o.zh !== vi;
  return `<div class="desc-box">${hl(vi)}${showZh ? `<details class="zh-orig"><summary>Xem nguyên văn tiếng Trung</summary>${esc(o.zh)}</details>` : ''}</div>`;
}

/* ---------- pages ---------- */
function pageHome() {
  const st = S.data.stats || {};
  const cards = [
    ['⚔️', 'Võ Sĩ', `${st.heroes || 0} tướng — chỉ số, hệ, độ hiếm và toàn bộ kỹ năng`, '#/heroes'],
    ['🔥', 'Chiến Hồn', `${(st.warsouls || 0).toLocaleString()} chiến hồn — hiệu ứng, cách dùng`, '#/souls'],
    ['🗡️', 'Trang Bị', `${st.equipment || 0} bộ trang bị riêng của từng tướng`, '#/equips'],
    ['💎', 'Vật Phẩm', `${(st.itemsWithIcon || 0).toLocaleString()} vật phẩm — công dụng, nơi kiếm`, '#/items'],
    ['🎮', 'Tính Năng', 'Thần Khí, Đấu Trường, Cửa Hàng và các hệ thống game', '#/features'],
    ['🎉', 'Sự Kiện', `${st.events || 0} sự kiện trong game — chơi gì, nhận gì`, '#/events'],
    ['📖', 'Cẩm Nang', `${st.systems || 0} bài hướng dẫn cơ chế & mẹo chơi`, '#/guides'],
    ['🧮', 'Tính Lực Chiến', 'Ước tính lực chiến từ chỉ số tướng của bạn', '#/calc'],
  ];
  const guides = (S.data.systems || []);
  app.innerHTML = `
  <section class="hero fade">
    <h1>Cẩm nang <em>Quyền Hoàng 98</em><br>đầy đủ, dễ hiểu, tiếng Việt.</h1>
    <p>Tra cứu mọi thứ trong game: võ sĩ, chiến hồn, trang bị, vật phẩm, sự kiện và cách tăng lực chiến. Nội dung viết lại bằng tiếng Việt cho dễ đọc, kèm hình ảnh gốc trong game.</p>
    <div class="cta">
      <a class="btn btn-p" href="#/heroes">Xem danh sách Võ Sĩ →</a>
      <a class="btn btn-g" href="#/calc">🧮 Tính Lực Chiến</a>
    </div>
  </section>
  <div class="stat-row fade">
    <div class="stat"><div class="n">${st.heroes || 0}</div><div class="l">Võ Sĩ</div></div>
    <div class="stat"><div class="n">${(st.warsouls || 0).toLocaleString()}</div><div class="l">Chiến Hồn</div></div>
    <div class="stat"><div class="n">${(st.itemsWithIcon || 0).toLocaleString()}</div><div class="l">Vật Phẩm</div></div>
    <div class="stat"><div class="n">${st.equipment || 0}</div><div class="l">Trang Bị</div></div>
    <div class="stat"><div class="n">${st.events || 0}</div><div class="l">Sự Kiện</div></div>
  </div>
  <div class="grid-cards fade">
    ${cards.map(c => `<a class="navcard" href="${c[3]}"><div class="ic">${c[0]}</div><h3>${c[1]}</h3><p>${c[2]}</p><div class="arrow">→</div></a>`).join('')}
  </div>
  <div class="section-t">Hướng dẫn cơ chế game <div class="line"></div></div>
  <div class="grid-cards fade">
    ${guides.map((g, i) => `<a class="navcard sm" href="#/guide/${g.key}"><div class="ic">${GUIDE_ICON[i] || '📄'}</div><h3>${esc(g.title)}</h3><div class="arrow">→</div></a>`).join('')}
  </div>`;
}
const GUIDE_ICON = ['⚔️', '📈', '🔥', '🌟', '🛡️', '🎯', '🎮', '🎁', '🏪', '🤝', '💰', '👥'];

function heroPortrait(h) { return h.portrait || h.avatar || ''; }
function pageHeroes() {
  const heroes = (S.data.heroes || []).filter(h => (h.name.vi || h.name.zh) && heroPortrait(h));
  let fRar = 'all', fEl = 'all';
  const render = () => {
    const list = heroes.filter(h => (fRar === 'all' || h.rarity === fRar) && (fEl === 'all' || h.type === fEl));
    $('#hgrid').innerHTML = list.length ? list.map(h => `
      <a class="hcard" data-r="${h.rarity}" href="#/hero/${h.id}">
        <div class="port"><img loading="lazy" src="${esc(heroPortrait(h))}" alt="${esc(T(h.name))}" onerror="this.style.display='none'">
          <span class="rar" data-r="${h.rarity}">${h.rarity}</span>
          ${h.type ? `<span class="el" data-e="${h.type}" title="${EL[h.type]}">${EL[h.type]}</span>` : ''}
        </div>
        <div class="meta"><div class="nm">${esc(T(h.name) || '?')}</div>${h.name.zh && S.lang !== 'zh' ? `<div class="zh">${esc(h.name.zh)}</div>` : ''}</div>
      </a>`).join('') : emptyState();
    $('#hcount').textContent = `${list.length} võ sĩ`;
  };
  app.innerHTML = `
    <div class="page-head fade"><h1>⚔️ Võ Sĩ</h1><div class="sub">Bấm vào từng tướng để xem chỉ số, kỹ năng và hệ. Lọc nhanh theo độ hiếm hoặc hệ chiến đấu.</div></div>
    <div class="toolbar fade">
      <div class="fgroup"><span class="flabel">Độ hiếm</span><div class="chips" id="rarChips"><button class="chip on" data-v="all">Tất cả</button>${RAR_ORDER.map(r => `<button class="chip" data-v="${r}">${r}</button>`).join('')}</div></div>
      <div class="fgroup"><span class="flabel">Hệ</span><div class="chips" id="elChips">${Object.entries(EL).map(([k, v]) => `<button class="chip" data-v="${k}">${v}</button>`).join('')}</div></div>
      <span class="count" id="hcount"></span>
    </div>
    <div class="hgrid fade" id="hgrid"></div>`;
  $('#rarChips').addEventListener('click', e => { const b = e.target.closest('.chip'); if (!b) return; fRar = b.dataset.v; $$('#rarChips .chip').forEach(c => c.classList.toggle('on', c === b)); render(); });
  $('#elChips').addEventListener('click', e => { const b = e.target.closest('.chip'); if (!b) return; fEl = fEl === b.dataset.v ? 'all' : b.dataset.v; $$('#elChips .chip').forEach(c => c.classList.toggle('on', c.dataset.v === fEl)); render(); });
  render();
}

function pageHero(id) {
  const h = (S.data.heroes || []).find(x => x.id === id);
  if (!h) return notFound();
  const school = T(h.schoolName);
  app.innerHTML = `
  <div class="crumb"><a href="#/heroes">Võ Sĩ</a> / ${esc(T(h.name))}</div>
  <div class="detail fade">
    <div class="dpanel">
      <div class="dhero-art">
        ${heroPortrait(h) ? `<img src="${esc(heroPortrait(h))}" alt="${esc(T(h.name))}" onerror="this.style.display='none'">` : ''}
        <div class="badge"><span class="tag" style="color:var(--r-${h.rarity})">${RAR_VI[h.rarity] || h.rarity}</span>${h.type ? `<span class="tag el" data-e="${h.type}">Hệ ${EL[h.type]}</span>` : ''}</div>
      </div>
      ${h.namePic ? `<div class="namepic"><img src="${esc(h.namePic)}" alt=""></div>` : ''}
    </div>
    <div class="dpanel dbody">
      <h1>${esc(T(h.name) || '?')}</h1>
      <div class="subline">${esc(h.name.zh || '')}${school ? ` · Lưu phái <b>${esc(school)}</b>` : ''}</div>
      <div class="kv">
        <div class="cell"><div class="l">Công</div><div class="v" style="color:var(--el-atk)">${fmt(h.baseAtk)}</div></div>
        <div class="cell"><div class="l">Thủ</div><div class="v" style="color:var(--el-def)">${fmt(h.baseDef)}</div></div>
        <div class="cell"><div class="l">HP (sinh lực)</div><div class="v" style="color:var(--green)">${fmt(h.baseHp)}</div></div>
        <div class="cell"><div class="l">Tỉ lệ bạo kích</div><div class="v" style="color:var(--gold)">${h.critRate != null ? (h.critRate * 100).toFixed(1) + '%' : '—'}</div></div>
      </div>
      <p class="note">Đây là chỉ số nền lúc mới có tướng. Chỉ số thật tăng theo cấp, sao, trang bị và chiến hồn.</p>
      ${(T(h.shortDesc) || T(h.desc)) ? descBlock(T(h.shortDesc) ? h.shortDesc : h.desc) : ''}
      <a class="btn btn-g wfull" href="#/calc?hero=${h.id}">🧮 Ước tính lực chiến cho ${esc(T(h.name))}</a>
      ${(h.skills && h.skills.length) ? `<div class="section-t sub2">Kỹ năng <div class="line"></div></div>
        <div class="skills">${h.skills.map(s => `
          <div class="skill">
            <div class="sk-ic">${s.icon ? `<img loading="lazy" src="${esc(s.icon)}" alt="" onerror="this.parentNode.textContent='⚡'">` : '⚡'}</div>
            <div class="sk-b"><div class="sk-h"><b>${esc(T(s.name) || 'Kỹ năng')}</b><span class="pill">${esc(s.role)}</span></div>
              ${T(s.desc) ? `<p>${hl(T(s.desc))}</p>` : '<p class="muted">Chưa có mô tả.</p>'}</div>
          </div>`).join('')}</div>` : ''}
    </div>
  </div>`;
}

function pageSouls() {
  const souls = (S.data.warsouls || []).filter(s => s.name.vi || s.name.zh);
  let fT = 'all', q = '';
  const types = [...new Set(souls.map(s => s.type).filter(t => SOUL_TYPE[t]))];
  const render = () => {
    const list = souls.filter(s => (fT === 'all' || s.type === fT) &&
      (!q || norm(T(s.name)).includes(norm(q)) || (s.name.zh || '').includes(q)));
    $('#sgrid').innerHTML = list.length ? list.map(s => `
      <a class="scard" href="#/soul/${s.id}">
        <div class="sic">${s.icon ? `<img loading="lazy" src="${esc(s.icon)}" onerror="this.parentNode.textContent='🔥'" alt="">` : '🔥'}${s.star ? `<span class="star">★${s.star}</span>` : ''}</div>
        <div class="smeta"><div class="nm">${esc(T(s.name) || '?')}</div><div class="tag-s">${esc(SOUL_TYPE[s.type] || 'Chiến hồn')}</div></div>
      </a>`).join('') : emptyState();
    $('#scount').textContent = `${list.length} chiến hồn`;
  };
  app.innerHTML = `
    <div class="page-head fade"><h1>🔥 Chiến Hồn</h1><div class="sub">Chiến hồn tăng sức mạnh cho cả đội. Loại <b>Toàn cục</b> luôn có tác dụng; loại <b>Chỉ huy</b> buff cả sân khi tướng ra trận. Bấm để xem hiệu ứng chi tiết.</div></div>
    <div class="toolbar fade">
      <input class="inline" id="sq" placeholder="Tìm chiến hồn...">
      <div class="fgroup"><span class="flabel">Loại</span><div class="chips" id="tChips"><button class="chip on" data-v="all">Tất cả</button>${types.map(k => `<button class="chip" data-v="${k}">${SOUL_TYPE[k]}</button>`).join('')}</div></div>
      <span class="count" id="scount"></span>
    </div>
    <div class="sgrid fade" id="sgrid"></div>`;
  $('#sq').addEventListener('input', e => { q = e.target.value; render(); });
  $('#tChips').addEventListener('click', e => { const b = e.target.closest('.chip'); if (!b) return; fT = b.dataset.v; $$('#tChips .chip').forEach(c => c.classList.toggle('on', c === b)); render(); });
  render();
}
function pageSoul(id) {
  const s = (S.data.warsouls || []).find(x => x.id === id); if (!s) return notFound();
  app.innerHTML = `
  <div class="crumb"><a href="#/souls">Chiến Hồn</a> / ${esc(T(s.name))}</div>
  <div class="detail narrow fade">
    <div class="dpanel dcenter soul-art">
      ${s.icon ? `<img src="${esc(s.icon)}" alt="" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'ph',textContent:'🔥'}))">` : '<div class="ph">🔥</div>'}
    </div>
    <div class="dpanel dbody">
      <h1>${esc(T(s.name) || '?')}</h1>
      ${zhLine(s.name.zh)}
      <div class="tagrow">
        <span class="pill gold">${SOUL_TYPE[s.type] || 'Chiến hồn'}</span>
        ${s.star ? `<span class="pill">${s.star} sao</span>` : ''}
      </div>
      ${descBlock(s.desc, 'Chưa có mô tả hiệu ứng cho chiến hồn này.')}
      <a class="btn btn-g wfull" href="#/guide/war-soul">📖 Xem hướng dẫn Chiến Hồn</a>
    </div>
  </div>`;
}

function pageItems() {
  const items = (S.data.items || []).filter(it => (it.name.vi || it.name.zh) && it.icon);
  let q = '', cat = 'all';
  const cats = [...new Set(items.map(i => i.type).filter(Boolean))].sort((a, b) => itemTypeVi(a).localeCompare(itemTypeVi(b), 'vi'));
  const render = () => {
    const list = items.filter(it => (cat === 'all' || it.type === cat) &&
      (!q || norm(T(it.name)).includes(norm(q)) || (it.name.zh || '').includes(q))).slice(0, 600);
    $('#igrid').innerHTML = list.length ? list.map(it => {
      const d = T(it.funcDesc) || T(it.desc) || '';
      return `<a class="itemcard" href="#/item/${it.id}">
        <div class="ibox q-${it.quality || 1}"><img loading="lazy" src="${esc(it.icon)}" alt="" onerror="this.style.opacity=0"></div>
        <div class="imeta"><div class="inm">${esc(T(it.name) || '?')}</div>
          <div class="idesc">${esc(d.slice(0, 70))}${d.length > 70 ? '…' : ''}</div>
          <div class="itag">${esc(itemTypeVi(it.type))}</div></div>
      </a>`;
    }).join('') : emptyState();
    $('#icount').textContent = `${list.length}${list.length >= 600 ? '+' : ''} vật phẩm`;
  };
  app.innerHTML = `
    <div class="page-head fade"><h1>💎 Vật Phẩm</h1><div class="sub">Tra công dụng và nơi kiếm của mọi vật phẩm trong game. Gõ tên hoặc lọc theo loại.</div></div>
    <div class="toolbar fade">
      <input class="inline grow" id="iq" placeholder="Tìm vật phẩm theo tên...">
      <select class="inline" id="icat"><option value="all">Tất cả loại</option>${cats.map(c => `<option value="${esc(c)}">${esc(itemTypeVi(c))}</option>`).join('')}</select>
      <span class="count" id="icount"></span>
    </div>
    <div class="itemgrid fade" id="igrid"></div>`;
  $('#iq').addEventListener('input', e => { q = e.target.value; render(); });
  $('#icat').addEventListener('change', e => { cat = e.target.value; render(); });
  render();
}
function pageItem(id) {
  const it = (S.data.items || []).find(x => x.id === id); if (!it) return notFound();
  const fn = T(it.funcDesc), ds = T(it.desc);
  app.innerHTML = `
  <div class="crumb"><a href="#/items">Vật Phẩm</a> / ${esc(T(it.name))}</div>
  <div class="detail narrow fade">
    <div class="dpanel dcenter item-art">
      ${it.icon ? `<img src="${esc(it.icon)}" class="q-${it.quality || 1}" alt="" onerror="this.style.display='none'">` : '💎'}
    </div>
    <div class="dpanel dbody">
      <h1>${esc(T(it.name) || '?')}</h1>
      ${zhLine(it.name.zh || it.cnName)}
      <div class="tagrow"><span class="pill gold">${esc(itemTypeVi(it.type))}</span>${it.category ? `<span class="pill">${esc(it.category)}</span>` : ''}${it.quality ? `<span class="pill">${'★'.repeat(Math.min(it.quality, 7))}</span>` : ''}</div>
      ${it.usage ? `<div class="usebox"><div class="ulabel">📌 Dùng để làm gì?</div><div>${hl(it.usage)}</div></div>` : ''}
      ${it.source ? `<div class="usebox src"><div class="ulabel">📍 Nơi kiếm</div><div>${hl(it.source)}</div></div>` : ''}
      ${(fn || ds) ? `<div class="section-t sub2" style="margin:22px 0 10px">Chi tiết <div class="line"></div></div>${descBlock(fn ? it.funcDesc : it.desc)}` : (it.usage ? '' : '<div class="desc-box muted">Vật phẩm này chưa có mô tả chi tiết trong game.</div>')}
    </div>
  </div>`;
}

function heroName(hid) { const h = (S.data.heroes || []).find(x => x.id === hid); return h ? (T(h.name) || hid) : hid; }
function heroPortById(hid) { const h = (S.data.heroes || []).find(x => x.id === hid); return h ? heroPortrait(h) : ''; }
const slotVi = s => /^E\d$/.test(s || '') ? 'Món ' + s.slice(1) : (s || '');
function pageEquips() {
  const eq = (S.data.equipment || []).filter(e => e.name.vi || e.name.zh);
  let q = '', fq = 'all';
  const quals = ['SP', 'UR', 'SSR', 'SR', 'R'];
  const render = () => {
    const list = eq.filter(e => (fq === 'all' || e.quality === fq) &&
      (!q || norm(T(e.name)).includes(norm(q)) || (e.name.zh || '').includes(q) || norm(heroName(e.hero)).includes(norm(q)))).slice(0, 500);
    $('#eqgrid').innerHTML = list.length ? list.map(e => `
      <a class="scard" data-r="${e.quality}" href="#/equip/${e.id}">
        <div class="sic eq">${e.icon ? `<img loading="lazy" src="${esc(e.icon)}" onerror="this.parentNode.textContent='🗡️'" alt="">` : '🗡️'}<span class="star" data-r="${e.quality}">${e.quality}</span></div>
        <div class="smeta"><div class="nm">${esc(T(e.name) || '?')}</div><div class="tag-s">${esc(heroName(e.hero))}</div></div>
      </a>`).join('') : emptyState();
    $('#eqcount').textContent = `${list.length}${list.length >= 500 ? '+' : ''} trang bị`;
  };
  app.innerHTML = `
    <div class="page-head fade"><h1>🗡️ Trang Bị</h1><div class="sub">Mỗi võ sĩ có một bộ trang bị riêng (4 món). Nâng sao để tăng chỉ số, Thức Tỉnh để mở thêm sức mạnh.</div></div>
    <div class="toolbar fade">
      <input class="inline grow" id="eq" placeholder="Tìm theo tên trang bị hoặc tên tướng...">
      <div class="fgroup"><span class="flabel">Độ hiếm</span><div class="chips" id="eqChips"><button class="chip on" data-v="all">Tất cả</button>${quals.map(v => `<button class="chip" data-v="${v}">${v}</button>`).join('')}</div></div>
      <span class="count" id="eqcount"></span>
    </div>
    <div class="sgrid fade" id="eqgrid"></div>`;
  $('#eq').addEventListener('input', e => { q = e.target.value; render(); });
  $('#eqChips').addEventListener('click', e => { const b = e.target.closest('.chip'); if (!b) return; fq = b.dataset.v; $$('#eqChips .chip').forEach(c => c.classList.toggle('on', c === b)); render(); });
  render();
}
function pageEquip(id) {
  const e = (S.data.equipment || []).find(x => x.id === id); if (!e) return notFound();
  app.innerHTML = `
  <div class="crumb"><a href="#/equips">Trang Bị</a> / ${esc(T(e.name))}</div>
  <div class="detail narrow fade">
    <div class="dpanel dcenter item-art col">
      ${e.icon ? `<img src="${esc(e.icon)}" alt="" onerror="this.style.display='none'">` : '🗡️'}
      ${e.awakenIcon ? `<div class="awk"><img src="${esc(e.awakenIcon)}" alt="" onerror="this.style.display='none'"><span class="pill">Thức Tỉnh</span></div>` : ''}
    </div>
    <div class="dpanel dbody">
      <h1>${esc(T(e.name) || '?')}</h1>
      ${zhLine(e.name.zh)}
      <div class="tagrow">
        <span class="pill" style="color:var(--r-${e.quality})">${RAR_VI[e.quality] || e.quality}</span>
        <a class="pill link" href="#/hero/${e.hero}">Của ${esc(heroName(e.hero))}</a>
        ${slotVi(e.slot) ? `<span class="pill">${esc(slotVi(e.slot))}</span>` : ''}
      </div>
      ${(e.maxAtk != null || e.maxHp != null || e.maxDef != null) ? `<div class="kv three">
        ${e.maxAtk != null ? `<div class="cell"><div class="l">Công tối đa</div><div class="v" style="color:var(--el-atk)">${fmt(e.maxAtk)}</div></div>` : ''}
        ${e.maxHp != null ? `<div class="cell"><div class="l">HP tối đa</div><div class="v" style="color:var(--green)">${fmt(e.maxHp)}</div></div>` : ''}
        ${e.maxDef != null ? `<div class="cell"><div class="l">Thủ tối đa</div><div class="v" style="color:var(--el-def)">${fmt(e.maxDef)}</div></div>` : ''}
      </div><p class="note">Chỉ số tối đa khi nâng đủ sao.</p>` : ''}
      <div class="desc-box muted">Trang bị riêng của võ sĩ. Nâng sao để tăng chỉ số; mở Thức Tỉnh để tăng thêm sức mạnh. Xem chi tiết cơ chế ở <a class="ln" href="#/guide/equipment">hướng dẫn Trang Bị</a>.</div>
    </div>
  </div>`;
}

function pageEvents() {
  const evs = S.data.events || [];
  const groups = {};
  evs.forEach((e, i) => { e._i = i; (groups[e.category] = groups[e.category] || []).push(e); });
  app.innerHTML = `
    <div class="page-head fade"><h1>🎉 Sự Kiện Trong Game</h1><div class="sub">Tổng hợp các sự kiện và hoạt động thường có trong Quyền Hoàng 98 — chơi gì, làm gì để nhận thưởng. Bấm vào từng sự kiện để xem chi tiết. Sự kiện thật đổi theo thời gian trong game.</div></div>
    ${Object.entries(groups).map(([cat, list]) => `
      <div class="section-t sub2">${list[0].badge} ${esc(cat)} <span class="cbadge">${list.length}</span><div class="line"></div></div>
      <div class="evgrid fade">${list.map(e => `
        <a class="evcard" href="#/event/${e._i}">
          <div class="evtop"><span class="evbadge">${e.badge}</span><b>${esc(T(e.name) || '?')}</b></div>
          ${T(e.desc) ? `<p>${esc(T(e.desc).slice(0, 90))}${T(e.desc).length > 90 ? '…' : ''}</p>` : '<p class="muted">Sự kiện thường kỳ trong game.</p>'}
          <span class="evmore">Xem chi tiết →</span>
        </a>`).join('')}</div>`).join('')}`;
}
function pageEvent(i) {
  const e = (S.data.events || [])[+i]; if (!e) return notFound();
  app.innerHTML = `
  <div class="crumb"><a href="#/events">Sự Kiện</a> / ${esc(T(e.name))}</div>
  <div class="detail narrow fade">
    <div class="dpanel dcenter ev-logo"><div class="evbig">${e.badge}</div><div class="evcat">${esc(e.category)}</div></div>
    <div class="dpanel dbody">
      <h1>${esc(T(e.name) || '?')}</h1>
      ${zhLine(e.name.zh)}
      <div class="tagrow"><span class="pill gold">${e.badge} ${esc(e.category)}</span></div>
      ${T(e.desc) ? `<div class="desc-box">${hl(T(e.desc))}</div>` : '<div class="desc-box muted">Sự kiện thường kỳ trong game. Nội dung và phần thưởng thay đổi theo từng đợt.</div>'}
      <div class="usebox"><div class="ulabel">ℹ️ Lưu ý</div><div>Sự kiện trong game mở theo thời gian và có thể khác nhau giữa các đợt. Hãy vào mục Hoạt Động trong game để xem sự kiện đang diễn ra và thời hạn nhận thưởng.</div></div>
    </div>
  </div>`;
}

/* ---------- tính năng game ---------- */
function pageFeatures() {
  const st = S.data.stats || {};
  const feats = [
    ['🗿', 'Thần Khí', `Sức mạnh riêng của ${st.artifacts || 0} võ sĩ đặc biệt`, '#/artifacts'],
    ['🏆', 'Đấu Trường', 'PK xếp hạng với người chơi khác, giành danh hiệu', '#/arena'],
    ['🛒', 'Cửa Hàng', 'Các loại shop, tiền tệ và cách tiêu cho hiệu quả', '#/shop'],
    ['🗡️', 'Trang Bị', `${st.equipment || 0} bộ trang bị riêng của từng tướng`, '#/equips'],
    ['🔥', 'Chiến Hồn', `${(st.warsouls || 0).toLocaleString()} chiến hồn tăng lực cả đội`, '#/souls'],
    ['🎯', 'Can Thiệp', 'Cơ chế chiêu mộ / kéo võ sĩ về đội', '#/guide/intervene'],
  ];
  const g = S.data.systems || [];
  app.innerHTML = `
    <div class="page-head fade"><h1>🎮 Tính Năng Game</h1><div class="sub">Các hệ thống chính trong Quyền Hoàng 98. Bấm vào từng mục để hiểu cách chơi và cách tối ưu.</div></div>
    <div class="grid-cards fade">${feats.map(c => `<a class="navcard" href="${c[3]}"><div class="ic">${c[0]}</div><h3>${c[1]}</h3><p>${c[2]}</p><div class="arrow">→</div></a>`).join('')}</div>
    <div class="section-t">Hướng dẫn chi tiết cơ chế <div class="line"></div></div>
    <div class="grid-cards fade">${g.map((x, i) => `<a class="navcard sm" href="#/guide/${x.key}"><div class="ic">${GUIDE_ICON[i] || '📄'}</div><h3>${esc(x.title)}</h3><div class="arrow">→</div></a>`).join('')}</div>`;
}
function pageArtifacts() {
  const arts = S.data.artifacts || [];
  app.innerHTML = `
    <div class="page-head fade"><h1>🗿 Thần Khí (神器)</h1><div class="sub">Thần Khí là hệ thống sức mạnh riêng của một số võ sĩ đặc biệt. Mỗi Thần Khí mở thêm kỹ năng và chỉ số mạnh cho tướng đó khi bạn nghiên cứu và nâng cấp nó. Hiện có <b>${arts.length} võ sĩ</b> sở hữu Thần Khí. Bấm vào tướng để xem chi tiết.</div></div>
    <div class="hgrid fade">${arts.map(a => `
      <a class="hcard" data-r="${a.rarity}" href="#/hero/${a.hero}">
        <div class="port"><img loading="lazy" src="${esc(a.portrait || '')}" alt="" onerror="this.style.display='none'"><span class="rar" data-r="${a.rarity}">${a.rarity}</span><span class="el" style="background:rgba(0,0,0,.6);color:var(--gold)">🗿</span></div>
        <div class="meta"><div class="nm">${esc(T(a.name) || a.hero)}</div>${a.name.zh && S.lang !== 'zh' ? `<div class="zh">${esc(a.name.zh)}</div>` : ''}</div>
      </a>`).join('')}</div>
    <div class="usebox" style="margin-top:20px"><div class="ulabel">ℹ️ Cách hoạt động</div><div>Vào phần Thần Khí trong game, chọn võ sĩ có Thần Khí rồi nghiên cứu (dùng nguyên liệu) để mở và nâng các điểm sức mạnh. Thần Khí càng cao thì tướng càng mạnh, đặc biệt hữu ích cho các tướng chủ lực.</div></div>`;
}
function pageArena() {
  const titles = S.data.arena || [];
  app.innerHTML = `
    <div class="page-head fade"><h1>🏆 Đấu Trường (竞技场)</h1><div class="sub">Đấu Trường là chế độ PK xếp hạng: bạn đấu đội hình với người chơi khác để leo hạng, nhận thưởng theo mùa và giành các danh hiệu danh giá.</div></div>
    <div class="usebox"><div class="ulabel">🎮 Cách chơi</div><div>Chọn đội hình mạnh nhất, thách đấu các người chơi trên bảng xếp hạng. Thắng thì leo hạng, hạng càng cao thưởng càng lớn. Mỗi mùa kết thúc sẽ trao thưởng theo thứ hạng và làm mới bảng.</div></div>
    <div class="section-t sub2">Danh hiệu Đấu Trường <span class="cbadge">${titles.length}</span><div class="line"></div></div>
    <div class="sgrid fade">${titles.map(t => `
      <div class="scard" style="cursor:default">
        <div class="sic">${t.icon ? `<img src="${esc(t.icon)}" onerror="this.parentNode.textContent='🏅'" alt="">` : '🏅'}</div>
        <div class="smeta"><div class="nm">${esc(T(t.name) || 'Danh hiệu')}</div><div class="tag-s">${esc(t.cond)}</div></div>
      </div>`).join('')}</div>`;
}
function pageShop() {
  const shops = [
    ['💎', 'Cửa Hàng Kim Cương', 'Dùng Kim Cương (mua bằng nạp) đổi vật phẩm cao cấp: mảnh tướng SP/UR, vũ khí, chiến hồn hiếm.'],
    ['🎖️', 'Cửa Hàng Vinh Dự', 'Dùng điểm Vinh Dự kiếm từ Đấu Trường / hoạt động để đổi mảnh tướng, đạo cụ nâng cấp.'],
    ['🔮', 'Cửa Hàng Bí Ẩn', 'Shop làm mới ngẫu nhiên, thỉnh thoảng có món hời — nên xem mỗi ngày.'],
    ['👑', 'Cửa Hàng Đặc Quyền', 'Ưu đãi cho người chơi có thẻ tháng / đặc quyền.'],
    ['🪙', 'Cửa Hàng Vàng', 'Dùng Vàng (kiếm dễ) mua nguyên liệu cơ bản, đạo cụ thường ngày.'],
  ];
  app.innerHTML = `
    <div class="page-head fade"><h1>🛒 Cửa Hàng (商店)</h1><div class="sub">Trong game có nhiều loại cửa hàng, mỗi loại dùng một loại tiền khác nhau. Hiểu rõ để tiêu cho đáng, ưu tiên món tăng lực chiến.</div></div>
    <div class="evgrid fade">${shops.map(s => `<div class="evcard"><div class="evtop"><span class="evbadge">${s[0]}</span><b>${s[1]}</b></div><p>${s[2]}</p></div>`).join('')}</div>
    <div class="usebox" style="margin-top:18px"><div class="ulabel">💡 Mẹo tiêu tiền</div><div>Ưu tiên đổi <span class="nm">mảnh tướng SP/UR</span> và <span class="nm">chiến hồn</span> — đây là thứ tăng lực chiến bền nhất. Xem thêm ở <a class="ln" href="#/guide/economy-shop">hướng dẫn Kinh Tế & Cửa Hàng</a>.</div></div>`;
}
function pageGuides() {
  const g = S.data.systems || [];
  app.innerHTML = `
    <div class="page-head fade"><h1>📖 Cẩm Nang Chơi Game</h1><div class="sub">${g.length} bài hướng dẫn cơ chế và mẹo chơi, viết dễ hiểu cho mọi người chơi.</div></div>
    <div class="grid-cards fade">${g.map((x, i) => `<a class="navcard sm" href="#/guide/${x.key}"><div class="ic">${GUIDE_ICON[i] || '📄'}</div><h3>${esc(x.title)}</h3><div class="arrow">→</div></a>`).join('')}</div>`;
}
function pageGuide(key) {
  const g = (S.data.systems || []).find(x => x.key === key); if (!g) return notFound();
  const toc = tocFrom(g.markdown);
  app.innerHTML = `
    <div class="crumb"><a href="#/guides">Cẩm Nang</a> / ${esc(g.title)}</div>
    <div class="guide-layout fade">
      <aside class="toc"><h4>Mục lục</h4>${toc.map(t => `<a href="#${t.id}" class="${t.n === 3 ? 'h3' : ''}">${esc(t.t)}</a>`).join('')}</aside>
      <article class="md">${md(g.markdown)}</article>
    </div>`;
  $$('.toc a, .md a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href.startsWith('#/')) return;
    e.preventDefault();
    const el = document.getElementById(href.slice(1));
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
}

/* ---------- máy tính lực chiến (ngôn ngữ người chơi) ---------- */
function pageCalc(params) {
  const heroes = (S.data.heroes || []).filter(h => h.name.vi || h.name.zh);
  const pre = params.get('hero');
  // hằng số lấy từ công thức gốc trong game
  const K = { FA: 3, FB: 12, FC: 1, HeroStar: 0.01, EquipStar: 0.01, Adjust: 0.012, SK: 30 };
  const RF = { R: 1.0, SR: 1.05, SRP: 1.10, SSR: 1.15, UR: 1.20, SP: 1.20 };
  app.innerHTML = `
    <div class="page-head fade"><h1>🧮 Tính Lực Chiến</h1><div class="sub">Nhập chỉ số tướng của bạn để ước tính lực chiến. Con số dùng đúng cách game tính, nhưng chỉ mang tính tham khảo — game thật còn cộng thêm nhiều nguồn nhỏ khác.</div></div>
    <div class="calc fade">
      <div class="form">
        <div class="field"><label>Chọn tướng (tự điền chỉ số nền)</label>
          <select id="cHero"><option value="">— Tôi tự nhập —</option>${heroes.map(h => `<option value="${h.id}" ${h.id === pre ? 'selected' : ''}>${esc(T(h.name) || '?')} (${h.rarity})</option>`).join('')}</select></div>
        <div class="grid2">
          <div class="field"><label>Công</label><input id="cAtk" type="number" inputmode="numeric" value="35000"></div>
          <div class="field"><label>Thủ</label><input id="cDef" type="number" inputmode="numeric" value="9500"></div>
          <div class="field"><label>HP (sinh lực)</label><input id="cHp" type="number" inputmode="numeric" value="320000"></div>
          <div class="field"><label>Độ hiếm</label><select id="cRar">${Object.keys(RF).map(r => `<option value="${r}">${RAR_VI[r]}</option>`).join('')}</select></div>
          <div class="field"><label>Số sao của tướng</label><input id="cStar" type="number" inputmode="numeric" value="6"></div>
          <div class="field"><label>Duyên vũ khí</label><input id="cRel" type="number" inputmode="numeric" value="0"></div>
          <div class="field"><label>Tổng % tăng sát thương</label><input id="cHurt" type="number" inputmode="numeric" value="120"></div>
          <div class="field"><label>Tổng % bạo kích / hiệu ứng</label><input id="cCrit" type="number" inputmode="numeric" value="150"></div>
          <div class="field"><label>% cộng từ Chiến Hồn</label><input id="cSoul" type="number" inputmode="numeric" value="0"></div>
          <div class="field"><label>Tổng cấp kỹ năng</label><input id="cSkill" type="number" inputmode="numeric" value="300"></div>
        </div>
      </div>
      <div class="result">
        <div class="big" id="rBig">0</div><div class="lbl">Lực chiến ước tính</div>
        <button class="tgl" id="rTgl">Xem cách tính ▾</button>
        <div class="break" id="rBreak" hidden></div>
      </div>
    </div>
    <p class="note center">Không rõ chỉ số của mình? Mở trong game phần thông tin tướng, hoặc chọn tướng ở trên để lấy chỉ số nền rồi chỉnh theo.</p>`;
  const g = id => parseFloat($('#' + id).value) || 0;
  function calc() {
    const rar = $('#cRar').value;
    const base = g('cAtk') + g('cDef') + g('cHp') * 0.08;
    const dmg = K.FA + g('cHurt') / 100;
    const crit = K.FB + g('cCrit') / 100;
    const grow = K.FC + g('cStar') * K.HeroStar + g('cRel') * K.EquipStar + g('cSoul') / 100;
    const rf = RF[rar];
    const mult = base * dmg * crit * grow * rf * K.Adjust;
    const skill = g('cSkill') * K.SK;
    const total = Math.round(mult + skill);
    $('#rBig').textContent = total.toLocaleString();
    $('#rBreak').innerHTML = `
      <div class="row"><span>Sức mạnh nền (Công + Thủ + HP)</span><b>${Math.round(base).toLocaleString()}</b></div>
      <div class="row"><span>Nhân theo sát thương</span><b>×${dmg.toFixed(2)}</b></div>
      <div class="row"><span>Nhân theo bạo kích / hiệu ứng</span><b>×${crit.toFixed(2)}</b></div>
      <div class="row"><span>Nhân theo sao, duyên, chiến hồn</span><b>×${grow.toFixed(3)}</b></div>
      <div class="row"><span>Nhân theo độ hiếm (${rar})</span><b>×${rf}</b></div>
      <div class="row total"><span>Cộng thêm từ kỹ năng</span><b>+${skill.toLocaleString()}</b></div>`;
  }
  function fillHero() {
    const h = heroes.find(x => x.id === $('#cHero').value);
    if (h) { $('#cAtk').value = h.baseAtk || 0; $('#cDef').value = h.baseDef || 0; $('#cHp').value = h.baseHp || 0; $('#cRar').value = h.rarity; }
    calc();
  }
  $('#cHero').addEventListener('change', fillHero);
  $('#rTgl').addEventListener('click', () => { const b = $('#rBreak'); b.hidden = !b.hidden; $('#rTgl').textContent = b.hidden ? 'Xem cách tính ▾' : 'Ẩn cách tính ▴'; });
  $$('.calc input, .calc select').forEach(el => el.addEventListener('input', calc));
  if (pre) fillHero(); else calc();
}

/* ---------- misc ---------- */
const fmt = v => v == null ? '—' : Number(v).toLocaleString();
function emptyState(msg) { return `<div class="empty"><div class="ei">🔍</div><p>${esc(msg || 'Không có kết quả phù hợp. Thử bỏ bớt bộ lọc hoặc đổi từ khoá.')}</p></div>`; }
function notFound() { app.innerHTML = `<div class="empty big"><div class="ei">🔍</div><p>Không tìm thấy nội dung.</p><a class="btn btn-g" href="#/">← Về trang chủ</a></div>`; }

/* ---------- router ---------- */
function route() {
  const raw = location.hash.slice(1) || '/';
  const [path, qs] = raw.split('?');
  const params = new URLSearchParams(qs || '');
  const parts = path.split('/').filter(Boolean);
  window.scrollTo(0, 0);
  $$('.nav a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#/' + (parts[0] || '')));
  searchPop.classList.remove('show');
  if (!parts.length) return pageHome();
  const [p, id] = parts;
  const R = {
    heroes: pageHeroes, hero: () => pageHero(id), souls: pageSouls, soul: () => pageSoul(id),
    items: pageItems, item: () => pageItem(id), equips: pageEquips, equip: () => pageEquip(id),
    events: pageEvents, event: () => pageEvent(id), guides: pageGuides, guide: () => pageGuide(id),
    features: pageFeatures, artifacts: pageArtifacts, arena: pageArena, shop: pageShop,
    calc: () => pageCalc(params),
  };
  (R[p] || notFound)();
}

/* ---------- lang + boot ---------- */
$('#lang').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  S.lang = b.dataset.l; localStorage.setItem('kof_lang', S.lang);
  $$('#lang button').forEach(x => x.classList.toggle('on', x.dataset.l === S.lang));
  document.documentElement.lang = S.lang === 'zh' ? 'zh' : 'vi';
  route();
});
$('#burger').addEventListener('click', () => $('#nav').classList.toggle('open'));
$('#nav').addEventListener('click', e => { if (e.target.closest('a')) $('#nav').classList.remove('open'); });
$$('#lang button').forEach(x => x.classList.toggle('on', x.dataset.l === S.lang));

window.addEventListener('hashchange', route);
loadData().then(() => route()).catch(e => { app.innerHTML = `<div class="empty big"><div class="ei">⚠️</div><p>Lỗi tải dữ liệu: ${esc(e.message)}</p></div>`; });
