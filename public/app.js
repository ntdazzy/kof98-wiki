/* ============================================================
   KOF98 WIKI — app
   ============================================================ */
const S = { lang: localStorage.getItem('kof_lang') || 'vi', data: {}, index: [] };
const app = document.getElementById('app');
const $ = (s, r = document) => r.querySelector(s);
const esc = s => (s ?? '').toString().replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const T = o => !o ? '' : (S.lang === 'zh' ? (o.zh || o.vi) : (o.vi || o.zh)) || '';
const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/* ---------- data ---------- */
async function loadData() {
  const files = ['heroes', 'items', 'warsouls', 'systems', 'stats'];
  const res = await Promise.all(files.map(f => fetch(`data/${f}.json`).then(r => r.json()).catch(() => null)));
  files.forEach((f, i) => S.data[f] = res[i]);
  buildIndex();
}
function buildIndex() {
  const idx = [];
  (S.data.heroes || []).forEach(h => idx.push({ t: 'hero', id: h.id, k: 'Võ Sĩ', vi: h.name.vi, zh: h.name.zh, icon: h.avatar || h.portrait, extra: `${h.rarity} ${h.type}`, route: `#/hero/${h.id}` }));
  (S.data.warsouls || []).forEach(s => { if (s.name.vi || s.name.zh) idx.push({ t: 'soul', id: s.id, k: 'Chiến Hồn', vi: s.name.vi, zh: s.name.zh, icon: s.icon, extra: s.type, route: `#/soul/${s.id}` }); });
  (S.data.items || []).forEach(it => { if (it.name.vi || it.name.zh) idx.push({ t: 'item', id: it.id, k: 'Vật Phẩm', vi: it.name.vi, zh: it.name.zh, icon: it.icon, extra: it.type, route: `#/item/${it.id}` }); });
  (S.data.systems || []).forEach(sy => idx.push({ t: 'guide', id: sy.key, k: 'Cẩm Nang', vi: sy.title, zh: sy.title, icon: null, extra: '', route: `#/guide/${sy.key}` }));
  S.index = idx;
}

/* ---------- markdown ---------- */
function md(src) {
  const lines = src.replace(/\r/g, '').split('\n');
  let html = '', i = 0, tocFlush = false;
  const inline = t => esc(t)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
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
    $('#hgrid').innerHTML = list.map(h => `
      <a class="hcard" data-r="${h.rarity}" href="#/hero/${h.id}">
        <div class="port">${heroPortrait(h) ? `<img loading="lazy" src="${esc(heroPortrait(h))}" alt="${esc(T(h.name))}">` : ''}
          <span class="rar" data-r="${h.rarity}">${h.rarity}</span>
          ${h.type ? `<span class="el" data-e="${h.type}">${h.type}</span>` : ''}
        </div>
        <div class="meta"><div class="nm">${esc(T(h.name) || h.id)}</div><div class="zh">${esc(S.lang === 'zh' ? h.id : (h.name.zh || ''))}</div></div>
      </a>`).join('');
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
        ${heroPortrait(h) ? `<img src="${esc(heroPortrait(h))}" alt="">` : ''}
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
        ${h.desc.zh && S.lang !== 'zh' ? `<div class="zh-orig">中: ${esc(h.desc.zh)}</div>` : ''}</div>` : ''}
      <div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap">
        <span class="pill">Kỹ năng thường: ${esc(h.normalSkill || '—')}</span>
        <span class="pill">Kỹ năng sao: ${esc(h.starSkill || '—')}</span>
      </div>
      <a class="btn btn-g" style="margin-top:20px" href="#/calc?hero=${h.id}">🧮 Tính lực chiến cho ${esc(T(h.name))}</a>
    </div>
  </div>`;
}

function pageSouls() {
  const souls = (S.data.warsouls || []).filter(s => s.name.vi || s.name.zh);
  const TYPE = { COMMAND: 'Chỉ Huy', GLOBAL: 'Toàn Cục', PASSIVE: 'Bị Động', ATTR: 'Thuộc Tính', ANGER: 'Nộ Khí', FATE: 'Mệnh Hồn', TALENT: 'Thiên Phú' };
  let fT = 'all';
  const render = () => {
    const list = souls.filter(s => fT === 'all' || s.type === fT);
    $('#sgrid').innerHTML = list.map(s => `
      <div class="hcard" data-r="${s.star >= 7 ? 'SP' : s.star >= 5 ? 'UR' : ''}" style="cursor:default">
        <div class="port" style="aspect-ratio:1;display:grid;place-items:center;padding:14px">${s.icon ? `<img loading="lazy" src="${esc(s.icon)}" style="object-fit:contain" alt="">` : '<div style="font-size:32px">🔥</div>'}
          <span class="rar" data-r="${s.star >= 7 ? 'SP' : 'UR'}">★${s.star ?? '?'}</span></div>
        <div class="meta"><div class="nm">${esc(T(s.name) || s.id)}</div><div class="zh">${esc(TYPE[s.type] || s.type)}</div></div>
      </div>`).join('');
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
      (!q || norm(T(it.name)).includes(norm(q)) || (it.name.zh || '').includes(q) || norm(it.id).includes(norm(q)))).slice(0, 600);
    $('#igrid').innerHTML = list.map(it => `
      <div class="icell" title="${esc(T(it.name))}" onclick="location.hash='#/item/${it.id}'">
        <div class="box"><img loading="lazy" class="q-${it.quality || 1}" src="${esc(it.icon)}" alt=""></div>
        <div class="cap">${esc(T(it.name) || it.id)}</div>
      </div>`).join('');
    $('#icount').textContent = `${list.length}${list.length >= 600 ? '+' : ''} vật phẩm`;
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
      ${it.icon ? `<img src="${esc(it.icon)}" style="width:120px;height:120px;object-fit:contain" class="q-${it.quality || 1}" alt="">` : '💎'}
    </div>
    <div class="dpanel dbody">
      <h1>${esc(T(it.name) || it.id)}</h1>
      <div class="zh">${esc(it.name.zh || it.cnName || '')} · <span class="pill">${it.id}</span></div>
      <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">
        <span class="pill">Loại: ${esc(it.type || '—')}</span><span class="pill">Phẩm: ${it.quality ?? '—'}</span>
      </div>
      ${(T(it.funcDesc) || T(it.desc)) ? `<div class="desc-box">${esc(T(it.funcDesc) || T(it.desc))}
        ${(it.funcDesc.zh || it.desc.zh) && S.lang !== 'zh' ? `<div class="zh-orig">中: ${esc(it.funcDesc.zh || it.desc.zh)}</div>` : ''}</div>` : '<div class="desc-box" style="color:var(--txt-3)">Chưa có mô tả.</div>'}
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
    const id = a.getAttribute('href').slice(1); const el = document.getElementById(id);
    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
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
  if (p === 'items') return pageItems();
  if (p === 'item') return pageItem(id);
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
$('#burger').addEventListener('click', () => $('#nav').style.display = $('#nav').style.display === 'flex' ? '' : 'flex');
$$('#lang button').forEach(x => x.classList.toggle('on', x.dataset.l === S.lang));

window.addEventListener('hashchange', route);
loadData().then(() => route()).catch(e => { app.innerHTML = `<div class="loading">Lỗi tải dữ liệu: ${esc(e.message)}</div>`; });
