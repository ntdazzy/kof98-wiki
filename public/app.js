/* ============================================================
   KOF98 WIKI — app
   ============================================================ */
const S = { lang: localStorage.getItem('kof_lang') || 'vi', data: {}, index: [] };
const app = document.getElementById('app');
const $ = (s, r = document) => r.querySelector(s);
const esc = s => (s ?? '').toString().replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const T = o => !o ? '' : (S.lang === 'zh' ? (o.zh || o.vi) : (o.vi || o.zh)) || '';
const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');

/* ---------- data ---------- */
async function loadData() {
  const files = ['heroes', 'items', 'warsouls', 'systems', 'stats', 'equipment'];
  const res = await Promise.all(files.map(f => fetch(`data/${f}.json`).then(r => r.json()).catch(() => null)));
  files.forEach((f, i) => S.data[f] = res[i]);
  buildIndex();
}
function buildIndex() {
  const idx = [];
  (S.data.heroes || []).forEach(h => { const n = h.name || {}; if (n.vi || n.zh) idx.push({ t: 'hero', id: h.id, k: 'Võ Sĩ', vi: n.vi, zh: n.zh, icon: h.portrait || h.avatar, extra: `${h.rarity} ${h.type}`, route: `#/hero/${h.id}` }); });
  (S.data.warsouls || []).forEach(s => { const n = s.name || {}; if (n.vi || n.zh) idx.push({ t: 'soul', id: s.id, k: 'Chiến Hồn', vi: n.vi, zh: n.zh, icon: s.icon, extra: s.type, route: `#/soul/${s.id}` }); });
  (S.data.items || []).forEach(it => { const n = it.name || {}; if (n.vi || n.zh) idx.push({ t: 'item', id: it.id, k: 'Vật Phẩm', vi: n.vi, zh: n.zh, icon: it.icon, extra: it.type, route: `#/item/${it.id}` }); });
  (S.data.equipment || []).forEach(e => { const n = e.name || {}; if (n.vi || n.zh) idx.push({ t: 'equip', id: e.id, k: 'Trang Bị', vi: n.vi, zh: n.zh, icon: e.icon, extra: e.quality, route: `#/equip/${e.id}` }); });
  (S.data.systems || []).forEach(sy => { if (sy.title) idx.push({ t: 'guide', id: sy.key, k: 'Cẩm Nang', vi: sy.title, zh: sy.title, icon: null, extra: '', route: `#/guide/${sy.key}` }); });
  S.index = idx;
}

/* ---------- markdown ---------- */
function md(src) {
  const lines = src.replace(/\r/g, '').split('\n');
  let html = '', i = 0, tocFlush = false;
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
      let t = '<table><thead><tr>' + cells(rows[0]).map(c => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>';
      for (let r = 2; r < rows.length; r++) t += '<tr>' + cells(rows[r]).map(c => `<td>${inline(c)}</td>`).join('') + '</tr>';
      html += t + '</tbody></table>'; continue;
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
    else if (nv.includes(q) || nz.includes(q) || norm(r.id).includes(q)) sc = 40;
    if (sc) scored.push([sc, r]);
  }
  scored.sort((a, b) => b[0] - a[0]);
  curResults = scored.slice(0, 24).map(x => x[1]); selIdx = -1;
  searchPop.innerHTML = curResults.length ? curResults.map((r, i) => `
    <a class="sres" href="${r.route}" data-i="${i}">
      <div class="si">${r.icon ? `<img loading="lazy" src="${r.icon}" alt="">` : (r.t === 'guide' ? '📖' : '')}</div>
      <div class="st"><b>${esc(T(r) || r.id)}</b><span>${esc(r.zh && S.lang !== 'zh' ? r.zh + ' · ' : '')}${esc(r.extra)}</span></div>
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

/* ---------- pages ---------- */
const RAR_ORDER = ['SP', 'UR', 'SSR', 'SRP', 'SR', 'R'];
const EL = { '攻': 'Công', '防': 'Thủ', '技': 'Kỹ' };

function pageHome() {
  const st = S.data.stats || {};
  const cards = [
    ['⚔️', 'Võ Sĩ', `${st.heroes || 0} tướng — chỉ số, hệ, độ hiếm, kỹ năng`, '#/heroes'],
    ['🔥', 'Chiến Hồn', `${st.warsouls || 0} hồn — loại, sao, hiệu ứng, tổng hợp`, '#/souls'],
    ['🗡️', 'Trang Bị', `${st.equipment || 0} trang bị võ sĩ — chỉ số, thức tỉnh`, '#/equips'],
    ['💎', 'Vật Phẩm', `${st.items || 0} vật phẩm — công dụng, nguồn kiếm`, '#/items'],
    ['📖', 'Cẩm Nang', `${st.systems || 0} hệ thống — cơ chế & mẹo tối ưu`, '#/guides'],
    ['🧮', 'Tính Lực Chiến', 'Máy tính theo công thức gốc HeroCombatFormula', '#/calc'],
    ['🗺️', 'Cách Kiếm & Lên Lực', 'Nguyên liệu ở đâu, lộ trình phá trần Lv50', '#/guide/progression-earn'],
  ];
  const guides = (S.data.systems || []);
  app.innerHTML = `
  <section class="hero fade">
    <h1>Bách khoa <em>Quyền Hoàng 98</em><br>đầy đủ, thông minh, song ngữ.</h1>
    <p>Tra cứu mọi thứ về game: võ sĩ, chiến hồn, thần khí, trang bị, công thức lực chiến, sự kiện, cách kiếm tài nguyên. Toàn bộ dữ liệu <b>trích 100% từ source game</b> — không bịa, có nguồn.</p>
    <div class="cta">
      <a class="btn btn-p" href="#/heroes">Xem Võ Sĩ →</a>
      <a class="btn btn-g" href="#/calc">🧮 Tính Lực Chiến</a>
    </div>
  </section>
  <div class="stat-row fade">
    <div class="stat"><div class="n">${st.heroes || 0}</div><div class="l">Võ Sĩ</div></div>
    <div class="stat"><div class="n">${(st.items || 0).toLocaleString()}</div><div class="l">Vật Phẩm</div></div>
    <div class="stat"><div class="n">${(st.warsouls || 0).toLocaleString()}</div><div class="l">Chiến Hồn</div></div>
    <div class="stat"><div class="n">${(st.icons || 0).toLocaleString()}</div><div class="l">Icon gốc</div></div>
    <div class="stat"><div class="n">${st.systems || 0}</div><div class="l">Cẩm nang</div></div>
  </div>
  <div class="grid-cards fade">
    ${cards.map(c => `<a class="navcard" href="${c[3]}"><div class="ic">${c[0]}</div><h3>${c[1]}</h3><p>${c[2]}</p><div class="arrow">→</div></a>`).join('')}
  </div>
  <div class="section-t">Cẩm nang hệ thống <div class="line"></div></div>
  <div class="grid-cards fade">
    ${guides.map(g => `<a class="navcard" href="#/guide/${g.key}"><h3 style="font-size:15px">${esc(g.title)}</h3><div class="arrow">→</div></a>`).join('')}
  </div>`;
}

function heroPortrait(h) { return h.portrait || h.avatar || ''; }
function pageHeroes() {
  const heroes = (S.data.heroes || []).filter(h => h.isShow !== 0);
  let fRar = 'all', fEl = 'all', q = '';
  const render = () => {
    const list = heroes.filter(h =>
      (fRar === 'all' || h.rarity === fRar) && (fEl === 'all' || h.type === fEl) &&
      (!q || norm(T(h.name)).includes(norm(q)) || (h.name.zh || '').includes(q)));
    $('#hgrid').innerHTML = list.length ? list.map(h => `
      <a class="hcard" data-r="${h.rarity}" href="#/hero/${h.id}">
        <div class="port">${heroPortrait(h) ? `<img loading="lazy" src="${esc(heroPortrait(h))}" alt="${esc(T(h.name))}" onerror="this.style.display='none'">` : ''}
          <span class="rar" data-r="${h.rarity}">${h.rarity}</span>
          ${h.type ? `<span class="el" data-e="${h.type}">${h.type}</span>` : ''}
        </div>
        <div class="meta"><div class="nm">${esc(T(h.name) || h.id)}</div><div class="zh">${esc(S.lang === 'zh' ? h.id : (h.name.zh || ''))}</div></div>
      </a>`).join('') : emptyState();
    $('#hcount').textContent = `${list.length} võ sĩ`;
  };
  app.innerHTML = `
    <div class="page-head fade"><h1>⚔️ Võ Sĩ</h1><div class="sub">${heroes.length} võ sĩ — lọc theo độ hiếm & hệ. Bấm để xem chi tiết chỉ số, kỹ năng.</div></div>
    <div class="toolbar fade">
      <div class="chips" id="rarChips"><button class="chip on" data-v="all">Tất cả</button>${RAR_ORDER.map(r => `<button class="chip" data-v="${r}">${r}</button>`).join('')}</div>
      <div class="chips" id="elChips">${Object.entries(EL).map(([k, v]) => `<button class="chip" data-v="${k}">${v} (${k})</button>`).join('')}</div>
      <span class="count" id="hcount"></span>
    </div>
    <div class="hgrid fade" id="hgrid"></div>`;
  $('#rarChips').addEventListener('click', e => { const b = e.target.closest('.chip'); if (!b) return; fRar = b.dataset.v; $$('#rarChips .chip').forEach(c => c.classList.toggle('on', c === b)); render(); });
  $('#elChips').addEventListener('click', e => { const b = e.target.closest('.chip'); if (!b) return; fEl = fEl === b.dataset.v ? 'all' : b.dataset.v; $$('#elChips .chip').forEach(c => c.classList.toggle('on', c.dataset.v === fEl)); render(); });
  render();
}
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

function pageHero(id) {
  const h = (S.data.heroes || []).find(x => x.id === id);
  if (!h) return notFound();
  const rf = { R: 1.0, SR: 1.05, SRP: 1.10, SSR: 1.15, UR: 1.20, SP: 1.20 }[h.rarity];
  app.innerHTML = `
  <div class="crumb"><a href="#/heroes">Võ Sĩ</a> / ${esc(T(h.name))}</div>
  <div class="detail fade">
    <div class="dpanel">
      <div class="dhero-art">
        ${heroPortrait(h) ? `<img src="${esc(heroPortrait(h))}" alt="${esc(T(h.name))}" onerror="this.style.display='none'">` : ''}
        <div class="badge"><span class="tag rar" data-r="${h.rarity}" style="color:var(--r-${h.rarity})">${h.rarity}</span>${h.type ? `<span class="tag el" data-e="${h.type}">${EL[h.type]} · ${h.type}</span>` : ''}</div>
      </div>
      ${h.namePic ? `<div style="padding:14px;text-align:center;background:var(--bg-2)"><img src="${esc(h.namePic)}" style="max-height:44px;margin:0 auto" alt=""></div>` : ''}
    </div>
    <div class="dpanel dbody">
      <h1>${esc(T(h.name) || h.id)}</h1>
      <div class="zh">${esc(h.name.zh || '')} · <span class="pill">${h.id}</span> · Lưu phái ${esc(h.school || '—')}</div>
      <div class="kv">
        <div class="cell"><div class="l">Công (ATK)</div><div class="v" style="color:var(--el-atk)">${h.baseAtk ?? '—'}</div></div>
        <div class="cell"><div class="l">Thủ (DEF)</div><div class="v" style="color:var(--el-def)">${h.baseDef ?? '—'}</div></div>
        <div class="cell"><div class="l">HP (生命)</div><div class="v" style="color:var(--green)">${h.baseHp ?? '—'}</div></div>
        <div class="cell"><div class="l">Hệ số phẩm (BV_RarityF)</div><div class="v" style="color:var(--gold)">×${rf ?? '—'}</div></div>
        <div class="cell"><div class="l">Hệ số Công</div><div class="v">${h.atkFactor ?? '—'}</div></div>
        <div class="cell"><div class="l">Tỉ lệ bạo kích</div><div class="v">${h.critRate != null ? (h.critRate * 100).toFixed(1) + '%' : '—'}</div></div>
      </div>
      ${(T(h.shortDesc) || T(h.desc)) ? `<div class="desc-box">${esc(T(h.shortDesc) || T(h.desc))}
        ${h.desc?.zh && S.lang !== 'zh' ? `<div class="zh-orig">中: ${esc(h.desc.zh)}</div>` : ''}</div>` : ''}
      <a class="btn btn-g" style="margin-top:20px" href="#/calc?hero=${h.id}">🧮 Tính lực chiến cho ${esc(T(h.name))}</a>
      ${(h.skills && h.skills.length) ? `<div class="section-t" style="margin:30px 0 14px;font-size:17px">Kỹ năng <div class="line"></div></div>
        <div class="skills">${h.skills.map(s => `
          <div class="skill">
            <div class="sk-ic">${s.icon ? `<img loading="lazy" src="${esc(s.icon)}" alt="">` : '⚡'}</div>
            <div class="sk-b"><div class="sk-h"><b>${esc(T(s.name) || s.id)}</b><span class="pill">${esc(s.role)}</span></div>
              ${(T(s.desc)) ? `<p>${esc(T(s.desc))}</p>` : ''}</div>
          </div>`).join('')}</div>` : ''}
    </div>
  </div>`;
}

function pageSouls() {
  const souls = (S.data.warsouls || []).filter(s => s.name.vi || s.name.zh);
  const TYPE = { COMMAND: 'Chỉ Huy', GLOBAL: 'Toàn Cục', PASSIVE: 'Bị Động', ATTR: 'Thuộc Tính', ANGER: 'Nộ Khí', FATE: 'Mệnh Hồn', TALENT: 'Thiên Phú' };
  let fT = 'all';
  const render = () => {
    const list = souls.filter(s => fT === 'all' || s.type === fT);
    $('#sgrid').innerHTML = list.length ? list.map(s => `
      <a class="hcard" data-r="${s.star >= 7 ? 'SP' : s.star >= 5 ? 'UR' : ''}" href="#/soul/${s.id}">
        <div class="port" style="aspect-ratio:1;display:grid;place-items:center;padding:14px">${s.icon ? `<img loading="lazy" src="${esc(s.icon)}" style="object-fit:contain" onerror="this.style.display='none'" alt="">` : '<div style="font-size:32px">🔥</div>'}
          <span class="rar" data-r="${s.star >= 7 ? 'SP' : 'UR'}">★${s.star ?? '?'}</span></div>
        <div class="meta"><div class="nm">${esc(T(s.name) || s.id)}</div><div class="zh">${esc(TYPE[s.type] || s.type)}</div></div>
      </a>`).join('') : emptyState();
    $('#scount').textContent = `${list.length} chiến hồn`;
  };
  app.innerHTML = `
    <div class="page-head fade"><h1>🔥 Chiến Hồn (战魂)</h1><div class="sub">${souls.length} chiến hồn. Loại Toàn Cục (全局) luôn bật cả đội; Chỉ Huy (指挥) buff toàn sân khi ra trận. Xem <a href="#/guide/war-soul" style="color:var(--gold)">cẩm nang Chiến Hồn</a>.</div></div>
    <div class="toolbar fade"><div class="chips" id="tChips"><button class="chip on" data-v="all">Tất cả</button>${Object.entries(TYPE).map(([k, v]) => `<button class="chip" data-v="${k}">${v}</button>`).join('')}</div><span class="count" id="scount"></span></div>
    <div class="hgrid fade" id="sgrid"></div>`;
  $('#tChips').addEventListener('click', e => { const b = e.target.closest('.chip'); if (!b) return; fT = b.dataset.v; $$('#tChips .chip').forEach(c => c.classList.toggle('on', c === b)); render(); });
  render();
}

function pageItems() {
  const items = (S.data.items || []).filter(it => (it.name.vi || it.name.zh) && it.icon);
  let q = '', cat = 'all';
  const cats = [...new Set(items.map(i => i.type).filter(Boolean))].sort();
  const render = () => {
    const list = items.filter(it => (cat === 'all' || it.type === cat) &&
      (!q || norm(T(it.name)).includes(norm(q)) || (it.name.zh || '').includes(q) || norm(it.id).includes(norm(q)))).slice(0, 900);
    $('#igrid').innerHTML = list.length ? list.map(it => `
      <a class="icell" title="${esc(T(it.name))}" href="#/item/${it.id}">
        <div class="box"><img loading="lazy" class="q-${it.quality || 1}" src="${esc(it.icon)}" alt="" onerror="this.style.display='none'"></div>
        <div class="cap">${esc(T(it.name) || it.id)}</div>
      </a>`).join('') : emptyState();
    $('#icount').textContent = `${list.length}${list.length >= 900 ? '+' : ''} vật phẩm`;
  };
  app.innerHTML = `
    <div class="page-head fade"><h1>💎 Vật Phẩm</h1><div class="sub">${items.length.toLocaleString()} vật phẩm có icon. Bấm để xem công dụng & nguồn kiếm.</div></div>
    <div class="toolbar fade">
      <input class="inline" id="iq" placeholder="Tìm vật phẩm..." style="min-width:200px">
      <select class="inline" id="icat"><option value="all">Tất cả loại</option>${cats.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('')}</select>
      <span class="count" id="icount"></span>
    </div>
    <div class="igrid fade" id="igrid"></div>`;
  $('#iq').addEventListener('input', e => { q = e.target.value; render(); });
  $('#icat').addEventListener('change', e => { cat = e.target.value; render(); });
  render();
}
function pageItem(id) {
  const it = (S.data.items || []).find(x => x.id === id); if (!it) return notFound();
  app.innerHTML = `
  <div class="crumb"><a href="#/items">Vật Phẩm</a> / ${esc(T(it.name))}</div>
  <div class="detail fade" style="grid-template-columns:280px 1fr">
    <div class="dpanel" style="padding:30px;display:grid;place-items:center;background:var(--bg-2)">
      ${it.icon ? `<img src="${esc(it.icon)}" style="width:120px;height:120px;object-fit:contain" class="q-${it.quality || 1}" alt="" onerror="this.style.display='none'">` : '💎'}
    </div>
    <div class="dpanel dbody">
      <h1>${esc(T(it.name) || it.id)}</h1>
      <div class="zh">${esc(it.name.zh || it.cnName || '')} · <span class="pill">${it.id}</span></div>
      <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">
        <span class="pill">Loại: ${esc(it.type || '—')}</span><span class="pill">Phẩm: ${it.quality ?? '—'}</span>
      </div>
      ${(T(it.funcDesc) || T(it.desc)) ? `<div class="desc-box">${esc(T(it.funcDesc) || T(it.desc))}
        ${(it.funcDesc?.zh || it.desc?.zh) && S.lang !== 'zh' ? `<div class="zh-orig">中: ${esc(it.funcDesc?.zh || it.desc?.zh)}</div>` : ''}</div>` : '<div class="desc-box" style="color:var(--txt-3)">Chưa có mô tả.</div>'}
    </div>
  </div>`;
}

const SOUL_TYPE = { COMMAND: 'Chỉ Huy (指挥)', GLOBAL: 'Toàn Cục (全局)', PASSIVE: 'Bị Động (被动)', ATTR: 'Thuộc Tính (属性)', ANGER: 'Nộ Khí (怒气)', FATE: 'Mệnh Hồn (命魂)', TALENT: 'Thiên Phú (天赋)' };
function pageSoul(id) {
  const s = (S.data.warsouls || []).find(x => x.id === id); if (!s) return notFound();
  app.innerHTML = `
  <div class="crumb"><a href="#/souls">Chiến Hồn</a> / ${esc(T(s.name))}</div>
  <div class="detail fade" style="grid-template-columns:280px 1fr">
    <div class="dpanel" style="padding:30px;display:grid;place-items:center;background:linear-gradient(180deg,var(--bg-3),#140d0f)">
      ${s.icon ? `<img src="${esc(s.icon)}" style="width:130px;height:130px;object-fit:contain" onerror="this.style.display='none'" alt="">` : '<div style="font-size:56px">🔥</div>'}
    </div>
    <div class="dpanel dbody">
      <h1>${esc(T(s.name) || s.id)}</h1>
      <div class="zh">${esc(s.name.zh || '')} · <span class="pill">${s.id}</span></div>
      <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">
        <span class="pill" style="color:var(--gold)">${SOUL_TYPE[s.type] || s.type}</span>
        <span class="pill">★ ${s.star ?? '?'}</span>
      </div>
      ${T(s.desc) ? `<div class="desc-box">${esc(T(s.desc))}
        ${s.desc?.zh && S.lang !== 'zh' ? `<div class="zh-orig">中: ${esc(s.desc.zh)}</div>` : ''}</div>` : '<div class="desc-box" style="color:var(--txt-3)">Chưa có mô tả hiệu ứng.</div>'}
      <a class="btn btn-g" style="margin-top:18px" href="#/guide/war-soul">📖 Cẩm nang Chiến Hồn</a>
    </div>
  </div>`;
}

function heroName(hid) { const h = (S.data.heroes || []).find(x => x.id === hid); return h ? (T(h.name) || hid) : hid; }
function pageEquips() {
  const eq = (S.data.equipment || []).filter(e => e.name.vi || e.name.zh);
  let q = '', fq = 'all';
  const quals = ['SP', 'UR', 'SSR', 'SR', 'R'];
  const render = () => {
    const list = eq.filter(e => (fq === 'all' || e.quality === fq) &&
      (!q || norm(T(e.name)).includes(norm(q)) || (e.name.zh || '').includes(q) || norm(heroName(e.hero)).includes(norm(q)))).slice(0, 500);
    $('#eqgrid').innerHTML = list.length ? list.map(e => `
      <a class="hcard" data-r="${e.quality}" href="#/equip/${e.id}">
        <div class="port" style="aspect-ratio:1;display:grid;place-items:center;padding:16px;background:var(--bg-2)">
          ${e.icon ? `<img loading="lazy" src="${esc(e.icon)}" style="object-fit:contain" onerror="this.style.display='none'" alt="">` : '<div style="font-size:30px">🗡️</div>'}
          <span class="rar" data-r="${e.quality}">${e.quality}</span></div>
        <div class="meta"><div class="nm">${esc(T(e.name) || e.id)}</div><div class="zh">${esc(heroName(e.hero))} · ${esc(e.slot)}</div></div>
      </a>`).join('') : emptyState();
    $('#eqcount').textContent = `${list.length}${list.length >= 500 ? '+' : ''} trang bị`;
  };
  app.innerHTML = `
    <div class="page-head fade"><h1>🗡️ Trang Bị (装备)</h1><div class="sub">${eq.length} trang bị võ sĩ (mỗi tướng có bộ riêng E1–E4). Xem <a href="#/guide/equipment" style="color:var(--gold)">cẩm nang Trang Bị</a>.</div></div>
    <div class="toolbar fade">
      <input class="inline" id="eq" placeholder="Tìm theo tên / võ sĩ..." style="min-width:200px">
      <div class="chips" id="eqChips"><button class="chip on" data-v="all">Tất cả</button>${quals.map(v => `<button class="chip" data-v="${v}">${v}</button>`).join('')}</div>
      <span class="count" id="eqcount"></span>
    </div>
    <div class="hgrid fade" id="eqgrid"></div>`;
  $('#eq').addEventListener('input', e => { q = e.target.value; render(); });
  $('#eqChips').addEventListener('click', e => { const b = e.target.closest('.chip'); if (!b) return; fq = b.dataset.v; $$('#eqChips .chip').forEach(c => c.classList.toggle('on', c === b)); render(); });
  render();
}
function pageEquip(id) {
  const e = (S.data.equipment || []).find(x => x.id === id); if (!e) return notFound();
  app.innerHTML = `
  <div class="crumb"><a href="#/equips">Trang Bị</a> / ${esc(T(e.name))}</div>
  <div class="detail fade" style="grid-template-columns:280px 1fr">
    <div class="dpanel" style="padding:30px;display:grid;place-items:center;gap:16px;background:var(--bg-2)">
      ${e.icon ? `<img src="${esc(e.icon)}" style="width:110px;height:110px;object-fit:contain" onerror="this.style.display='none'" alt="">` : '🗡️'}
      ${e.awakenIcon ? `<div style="text-align:center"><img src="${esc(e.awakenIcon)}" style="width:80px;height:80px;object-fit:contain" onerror="this.style.display='none'" alt=""><div class="pill" style="margin-top:6px">Thức Tỉnh</div></div>` : ''}
    </div>
    <div class="dpanel dbody">
      <h1>${esc(T(e.name) || e.id)}</h1>
      <div class="zh">${esc(e.name.zh || '')} · <span class="pill">${e.id}</span></div>
      <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">
        <span class="pill" style="color:var(--r-${e.quality})">${e.quality}</span>
        <a class="pill" href="#/hero/${e.hero}" style="color:var(--gold)">Của: ${esc(heroName(e.hero))}</a>
        <span class="pill">Ô ${esc(e.slot)}</span>
      </div>
      <div class="kv" style="margin-top:18px">
        ${e.maxAtk != null ? `<div class="cell"><div class="l">Công tối đa (max sao)</div><div class="v" style="color:var(--el-atk)">${e.maxAtk.toLocaleString()}</div></div>` : ''}
        ${e.maxHp != null ? `<div class="cell"><div class="l">HP tối đa (max sao)</div><div class="v" style="color:var(--green)">${e.maxHp.toLocaleString()}</div></div>` : ''}
        ${e.maxDef != null ? `<div class="cell"><div class="l">Thủ tối đa</div><div class="v" style="color:var(--el-def)">${e.maxDef.toLocaleString()}</div></div>` : ''}
      </div>
      <div class="desc-box" style="color:var(--txt-3)">Trang bị riêng của võ sĩ. Nâng sao để tăng chỉ số; Thức Tỉnh mở thêm sức mạnh. Chi tiết cơ chế xem <a href="#/guide/equipment" style="color:var(--gold)">cẩm nang Trang Bị</a>.</div>
    </div>
  </div>`;
}

function pageGuides() {
  const g = S.data.systems || [];
  app.innerHTML = `
    <div class="page-head fade"><h1>📖 Cẩm Nang Hệ Thống</h1><div class="sub">${g.length} bài viết đầy đủ, trích nguồn từ source game, đã được kiểm chứng chéo.</div></div>
    <div class="grid-cards fade">${g.map((x, i) => `<a class="navcard" href="#/guide/${x.key}"><div class="ic">${['⚔️', '📈', '🔥', '🌟', '🛡️', '🤝', '🗺️', '🎁', '🏪', '🔗', '💰', '👥'][i] || '📄'}</div><h3 style="font-size:15px">${esc(x.title)}</h3><div class="arrow">→</div></a>`).join('')}</div>`;
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
  // smooth-scroll toc + intra-links
  $$('.toc a, .md a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href.startsWith('#/')) return;            // real route link — let router handle
    e.preventDefault();
    const el = document.getElementById(href.slice(1));
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
}

/* ---------- combat calculator ---------- */
function pageCalc(params) {
  const heroes = S.data.heroes || [];
  const pre = params.get('hero');
  const BV = { FA: 3, FB: 12, FC: 1, HeroStar: 0.01, EquipStar: 0.01, Adjust: 0.012, AttrA: 800, AttrB: 400, SK: 30 };
  const RF = { R: 1.0, SR: 1.05, SRP: 1.10, SSR: 1.15, UR: 1.20, SP: 1.20 };
  app.innerHTML = `
    <div class="page-head fade"><h1>🧮 Máy Tính Lực Chiến</h1><div class="sub">Theo đúng công thức gốc <code>HeroCombatFormula.lua</code>: (Công+Thủ+HP×0.08) × các khối tỉ lệ × hệ số phẩm × 0.012 + phần cộng. Xem <a href="#/guide/combat-formula" style="color:var(--gold)">cẩm nang</a>.</div></div>
    <div class="calc fade">
      <div class="form">
        <div class="field"><label>Chọn võ sĩ (tự điền chỉ số nền)</label>
          <select id="cHero"><option value="">— Nhập tay —</option>${heroes.map(h => `<option value="${h.id}" ${h.id === pre ? 'selected' : ''}>${esc(T(h.name) || h.id)} (${h.rarity})</option>`).join('')}</select></div>
        <div class="grid2">
          <div class="field"><label>Công (ATK)</label><input id="cAtk" type="number" value="35000"></div>
          <div class="field"><label>Thủ (DEF)</label><input id="cDef" type="number" value="9500"></div>
          <div class="field"><label>HP</label><input id="cHp" type="number" value="320000"></div>
          <div class="field"><label>Độ hiếm (phẩm)</label><select id="cRar">${Object.keys(RF).map(r => `<option value="${r}">${r} (×${RF[r]})</option>`).join('')}</select></div>
          <div class="field"><label>Sao (星级)</label><input id="cStar" type="number" value="6"></div>
          <div class="field"><label>Duyên vũ khí (武器缘)</label><input id="cRel" type="number" value="0"></div>
          <div class="field"><label>Σ tỉ lệ sát thương (%)</label><input id="cHurt" type="number" value="120" step="1"></div>
          <div class="field"><label>Σ tỉ lệ bạo/hiệu ứng (%)</label><input id="cCrit" type="number" value="150" step="1"></div>
          <div class="field"><label>% Chiến Hồn (rate)</label><input id="cSoul" type="number" value="0"></div>
          <div class="field"><label>Tổng cấp kỹ năng</label><input id="cSkill" type="number" value="300"></div>
        </div>
      </div>
      <div class="result">
        <div class="big" id="rBig">0</div><div class="lbl">Lực Chiến</div>
        <div class="break" id="rBreak"></div>
      </div>
    </div>`;
  const g = id => parseFloat($('#' + id).value) || 0;
  function calc() {
    const rar = $('#cRar').value;
    const f1 = g('cAtk') + g('cDef') + g('cHp') * 0.08;
    const f2 = BV.FA + g('cHurt') / 100;
    const f3 = BV.FB + g('cCrit') / 100;
    const f4 = BV.FC + g('cStar') * BV.HeroStar + g('cRel') * BV.EquipStar + g('cSoul') / 100;
    const f5 = RF[rar];
    const mult = f1 * f2 * f3 * f4 * f5 * BV.Adjust;
    const f9 = g('cSkill') * BV.SK;
    const total = Math.round(mult + f9);
    $('#rBig').textContent = total.toLocaleString();
    $('#rBreak').innerHTML = `
      <div class="row"><span>Khối nền (Công+Thủ+HP×.08)</span><b>${Math.round(f1).toLocaleString()}</b></div>
      <div class="row"><span>× Sát thương</span><b>×${f2.toFixed(2)}</b></div>
      <div class="row"><span>× Bạo/Hiệu ứng</span><b>×${f3.toFixed(2)}</b></div>
      <div class="row"><span>× Sao/Duyên/Hồn</span><b>×${f4.toFixed(3)}</b></div>
      <div class="row"><span>× Phẩm (${rar})</span><b>×${f5}</b></div>
      <div class="row"><span>× Chuẩn hoá</span><b>×0.012</b></div>
      <div class="row"><span>Tích số nhân</span><b>${Math.round(mult).toLocaleString()}</b></div>
      <div class="row"><span>+ Lực kỹ năng</span><b>+${f9.toLocaleString()}</b></div>`;
  }
  function fillHero() {
    const h = heroes.find(x => x.id === $('#cHero').value);
    if (h) { $('#cAtk').value = h.baseAtk || 0; $('#cDef').value = h.baseDef || 0; $('#cHp').value = h.baseHp || 0; $('#cRar').value = h.rarity; }
    calc();
  }
  $('#cHero').addEventListener('change', fillHero);
  $$('.calc input, .calc select').forEach(el => el.addEventListener('input', calc));
  if (pre) fillHero(); else calc();
}

function emptyState(msg) { return `<div class="loading" style="grid-column:1/-1"><div style="font-size:40px">🔍</div><p style="margin-top:10px">${esc(msg || 'Không có kết quả phù hợp.')}</p></div>`; }
function notFound() { app.innerHTML = `<div class="loading"><div style="font-size:48px">🔍</div><p style="margin-top:14px">Không tìm thấy nội dung.</p><a class="btn btn-g" style="margin-top:16px" href="#/">← Về trang chủ</a></div>`; }

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
  if (p === 'heroes') return pageHeroes();
  if (p === 'hero') return pageHero(id);
  if (p === 'souls') return pageSouls();
  if (p === 'soul') return pageSoul(id);
  if (p === 'items') return pageItems();
  if (p === 'item') return pageItem(id);
  if (p === 'equips') return pageEquips();
  if (p === 'equip') return pageEquip(id);
  if (p === 'guides') return pageGuides();
  if (p === 'guide') return pageGuide(id);
  if (p === 'calc') return pageCalc(params);
  notFound();
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
loadData().then(() => route()).catch(e => { app.innerHTML = `<div class="loading">Lỗi tải dữ liệu: ${esc(e.message)}</div>`; });
