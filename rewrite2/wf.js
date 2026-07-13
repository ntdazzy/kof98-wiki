export const meta = {
  name: 'kof98-name-rewrite',
  description: 'Translate 191 leftover Chinese item/soul names into clean Hán-Việt Vietnamese, verified CJK-free',
  phases: [
    { title: 'Rewrite', detail: 'translate each batch of names to Hán-Việt' },
    { title: 'Verify', detail: 'adversarially check no Chinese remains + natural reading' },
  ],
}

const FILE = 'C:/Users/NTD/Desktop/game/kof98-wiki/rewrite2/input.json'
const N = 191
const SIZE = 32
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
  ([start, end], _orig, idx) => agent(
    `You translate KOF98 (拳皇98 / Quyền Hoàng 98) mobile game ITEM and WAR-SOUL names from Chinese into natural Vietnamese.

Read the JSON file at ${FILE}. It is an array of objects {i, kind, zh}. Handle ONLY the entries whose "i" is in the range [${start}, ${end}) — that is i >= ${start} and i < ${end}.

For each, produce a concise Vietnamese NAME using the Hán-Việt (Sino-Vietnamese) reading, Title Case, the way a Vietnamese KOF/game wiki writes item and soul names. Rules:
- Output MUST contain NO Chinese characters at all.
- Keep it short like a real game name (2-6 words). Do not add explanations.
- Use standard Hán-Việt readings. Examples: 能量秘法源泉 -> "Năng Lượng Bí Pháp Nguyên Tuyền"; 女装斗魂 -> "Nữ Trang Đấu Hồn"; 极地玉髓玄冰 -> "Cực Địa Ngọc Tủy Huyền Băng"; 坚实后盾战魂 -> "Kiên Thực Hậu Thuẫn Chiến Hồn"; 潜能突破四转 -> "Tiềm Năng Đột Phá Tứ Chuyển".
- If a segment is a common word better rendered by meaning (e.g. 女装 = "trang phục nữ" is odd for a soul; prefer Hán-Việt "Nữ Trang"), stay with Hán-Việt for consistency.

Return {items:[{i, vi}]} for every entry in your range.`,
    { label: `rewrite:${start}-${end}`, phase: 'Rewrite', schema: SCHEMA },
  ),
  (rw, [start, end]) => {
    if (!rw || !rw.items || !rw.items.length) return { items: [] }
    return agent(
      `You are a strict Vietnamese editor checking machine translations of KOF98 game item/soul names.

Here are proposed Vietnamese names (with their source Chinese available in ${FILE}, entries with i in [${start}, ${end})):
${JSON.stringify(rw.items)}

Read the file to see each source zh. For EVERY item, verify the Vietnamese:
1. Contains ZERO Chinese characters (if any remain, you MUST fix it).
2. Reads as a natural Hán-Việt game name, Title Case, concise.
3. Actually corresponds to the source zh reading.

Return {items:[{i, vi}]} containing the FINAL correct name for ALL entries in range [${start}, ${end}) (re-issue good ones unchanged, fix the bad ones). No Chinese characters anywhere.`,
      { label: `verify:${start}-${end}`, phase: 'Verify', schema: SCHEMA },
    )
  },
)

const out = []
for (const r of results) if (r && r.items) out.push(...r.items)
return { count: out.length, items: out }
