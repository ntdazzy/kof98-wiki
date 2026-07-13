export const meta = {
  name: 'kof98-soul-desc-rewrite',
  description: 'Rewrite 409 raw-MT KOF98 war-soul effect descriptions into clear, bulleted Vietnamese',
  phases: [
    { title: 'Rewrite', detail: 'clear Vietnamese, bullets, keep numbers + game terms' },
    { title: 'Verify', detail: 'check readability, numbers preserved, no Chinese' },
  ],
}

const FILE = 'C:/Users/NTD/Desktop/game/kof98-wiki/rewrite3/input.json'
const N = 409
const SIZE = 28
const ranges = []
for (let s = 0; s < N; s += SIZE) ranges.push([s, Math.min(s + SIZE, N)])

const SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        properties: { i: { type: 'number' }, vi: { type: 'string' } },
        required: ['i', 'vi'],
      },
    },
  },
  required: ['items'],
}

const results = await pipeline(
  ranges,
  ([start, end]) => agent(
    `You rewrite KOF98 (拳皇98 / Quyền Hoàng 98) mobile-game WAR-SOUL (Chiến Hồn) effect descriptions into clear, easy-to-read Vietnamese for ordinary players.

Read the JSON file ${FILE} — an array of {i, zh, cur} where zh is the Chinese source and cur is the current BAD machine translation (fused words, hard to read). Handle ONLY entries whose i is in [${start}, ${end}).

Rewrite each into natural, easy-to-understand Vietnamese. STYLE (very important — this is the whole point):
- Do NOT translate word-for-word / 100% Hán-Việt. Explain the MEANING so a normal player understands what the soul does.
- Use short lines with bullet points (start each effect line with "• "). Use real newlines (\\n) between bullets.
- If there is a unique-effect name in 「」 keep it, e.g. 「Băng Hoại」.
- KEEP ALL NUMBERS EXACTLY (2400, +50000, 15%, 48 giây, 300 điểm Nộ Khí...). Never change or drop a number.
- Use consistent Vietnamese game terms: 攻击=Công Kích, 防御=Phòng Ngự, 生命=Sinh Lực (HP), 伤害率=tỉ lệ sát thương, 免伤=miễn thương (giảm sát thương nhận), 怒气=Nộ Khí, 超绝技=Tuyệt Kỹ, 灼烧=「Thiêu Đốt」, 暴击=bạo kích, 格斗家=võ sĩ, 我方=phe ta, 敌方=phe địch, 持续=kéo dài, 副魂=phụ hồn.
- Zero Chinese characters in the output (game-term brackets 「」【】 with Vietnamese inside are fine).
- Keep it concise but complete. A player should instantly get: what stats it gives + what special effect it does.

Example:
zh "唯一效果「崩坏」：攻击+2000,防御+480,生命+24000，施放超绝前，自身损失40%当前生命值..."
-> vi "Hiệu ứng riêng 「Băng Hoại」:\\n• Công Kích +2000, Phòng Ngự +480, Sinh Lực +24000.\\n• Trước khi tung Tuyệt Kỹ: tự mất 40% Sinh Lực hiện tại..."

Return {items:[{i, vi}]} for every entry in your range.`,
    { label: `rw:${start}-${end}`, phase: 'Rewrite', schema: SCHEMA },
  ),
  (rw, [start, end]) => {
    if (!rw || !rw.items || !rw.items.length) return { items: [] }
    return agent(
      `Strict editor check of Vietnamese KOF98 war-soul descriptions. Source Chinese is in ${FILE} (entries i in [${start}, ${end})). Proposed rewrites:
${JSON.stringify(rw.items)}

For EACH, verify against the source zh: (1) ZERO Chinese characters, (2) every NUMBER from the source is present and unchanged, (3) reads clearly with bullet points, explains meaning (not word-for-word), (4) uses the standard Vietnamese game terms. Fix any that fail. Return {items:[{i, vi}]} with the FINAL good version for EVERY entry in the range.`,
      { label: `vf:${start}-${end}`, phase: 'Verify', schema: SCHEMA },
    )
  },
)
const out = []
for (const r of results) if (r && r.items) out.push(...r.items)
return { count: out.length, items: out }
