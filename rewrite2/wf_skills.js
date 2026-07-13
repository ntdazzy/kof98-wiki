export const meta = {
  name: 'kof98-skillname-rewrite',
  description: 'Fix 41 lowercase/calque KOF98 skill names into proper Hán-Việt move names, verified',
  phases: [
    { title: 'Rewrite', detail: 'retranslate skill names to Hán-Việt' },
    { title: 'Verify', detail: 'check natural move-name reading, no CJK' },
  ],
}

const FILE = 'C:/Users/NTD/Desktop/game/kof98-wiki/rewrite2/input_skills.json'
const N = 41
const SIZE = 21
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
    `You fix Vietnamese translations of KOF98 (拳皇98) fighting-game SKILL / MOVE names. The current machine translations are bad calques (word-by-word literal).

Read the JSON file ${FILE} — an array of {i, zh, cur} where zh is the Chinese move name and cur is the bad current translation. Handle ONLY entries with i in [${start}, ${end}).

Produce a proper Vietnamese move name using Hán-Việt (Sino-Vietnamese) reading, Title Case, like a real fighting-game move. Examples of the FIX:
- 三连杀 cur "ba liên giết" -> "Tam Liên Sát"
- 五光斩 cur "năm sáng trảm" -> "Ngũ Quang Trảm"
- 冲波 cur "xung ba" -> "Xung Ba"
- 冻气拳 cur "đông khí quyền" -> "Đông Khí Quyền"
- 大击放 cur "lớn kích phóng" -> "Đại Kích Phóng"
Rules: NO Chinese characters in output. Use Hán-Việt readings (数字/元素/动作 -> Hán-Việt), Title Case each word, keep it a short move name.

Return {items:[{i, vi}]} for every entry in your range.`,
    { label: `skill:${start}-${end}`, phase: 'Rewrite', schema: SCHEMA },
  ),
  (rw, [start, end]) => {
    if (!rw || !rw.items || !rw.items.length) return { items: [] }
    return agent(
      `Strict check of Vietnamese KOF98 move-name translations. Source Chinese is in ${FILE} (entries i in [${start}, ${end})). Proposed:
${JSON.stringify(rw.items)}

For each: (1) ZERO Chinese characters, (2) proper Hán-Việt reading Title Case, (3) matches the source zh. Fix any that are wrong or still literal calques. Return {items:[{i, vi}]} with the FINAL name for every entry in the range.`,
      { label: `vskill:${start}-${end}`, phase: 'Verify', schema: SCHEMA },
    )
  },
)
const out = []
for (const r of results) if (r && r.items) out.push(...r.items)
return { count: out.length, items: out }
