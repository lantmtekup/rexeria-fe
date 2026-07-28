/**
 * Seed sample product templates spanning 6 categories so the Templates tab
 * has realistic content out of the box.
 *
 * Auth — choose one:
 *   A) ENV `SEED_EMAIL` + `SEED_PASSWORD` → script logs in via /auth/login
 *      and reuses the Set-Cookie session.
 *   B) ENV `SEED_COOKIE` → paste the full `_access_token=...` cookie from
 *      DevTools (Application → Cookies → localhost:3000).
 *
 * Usage:
 *   npm run dev   # in another terminal
 *   SEED_EMAIL=admin@rexer.ai SEED_PASSWORD=xxxxxxxx \
 *     node scripts/visual-tests/seed-product-templates.mjs [--public]
 *
 * Flags:
 *   --public           set `is_public_template=true` (admin-gated by BE)
 *   --skip <category>  skip a category by key (fmcg/fashion/...)
 */
const BASE = 'http://localhost:3000';
const args = process.argv.slice(2);
const MAKE_PUBLIC = args.includes('--public');
const SKIP_FLAG = args.indexOf('--skip');
const SKIP = SKIP_FLAG !== -1 ? args[SKIP_FLAG + 1] : null;

// ── Auth ──────────────────────────────────────────────────────────────────
let COOKIE = process.env.SEED_COOKIE ?? null;

if (!COOKIE && process.env.SEED_EMAIL && process.env.SEED_PASSWORD) {
  console.log(`Logging in as ${process.env.SEED_EMAIL}...`);
  const loginRes = await fetch(`${BASE}/api/rexer/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.env.SEED_EMAIL,
      password: process.env.SEED_PASSWORD,
    }),
  });
  if (!loginRes.ok) {
    const text = await loginRes.text();
    throw new Error(
      `Login failed: HTTP ${loginRes.status} — ${text.slice(0, 200)}`
    );
  }
  // Extract _access_token from Set-Cookie header. Cloudflare tunnel may
  // proxy multiple Set-Cookie values; grab the first matching cookie name.
  const setCookies = loginRes.headers.getSetCookie?.() ?? [];
  const accessToken = setCookies
    .map(c => /_access_token=([^;]+)/.exec(c)?.[1])
    .find(Boolean);
  if (!accessToken) {
    throw new Error(
      'Login succeeded but Set-Cookie missing `_access_token`. Set SEED_COOKIE manually instead.'
    );
  }
  COOKIE = `_access_token=${accessToken}`;
  console.log('✅  Auth OK\n');
}

if (!COOKIE) {
  console.error(`
✗ No auth provided. Choose one:

  Option A (recommended):
    SEED_EMAIL=admin@rexer.ai SEED_PASSWORD=<your-password> \\
      node scripts/visual-tests/seed-product-templates.mjs

  Option B (paste cookie from DevTools):
    SEED_COOKIE='_access_token=<long-token>' \\
      node scripts/visual-tests/seed-product-templates.mjs

  To get the cookie: open localhost:3000 → DevTools → Application →
  Cookies → localhost:3000 → copy the value of '_access_token'.
`);
  process.exit(1);
}

async function rx(path, init = {}) {
  const res = await fetch(`${BASE}/api/rexer${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Cookie: COOKIE,
      ...(init.headers ?? {}),
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  if (!res.ok) {
    const detail =
      typeof json === 'object'
        ? `${json?.code ?? res.status} ${json?.message ?? ''}`
        : `HTTP ${res.status}`;
    throw new Error(`${init.method ?? 'GET'} ${path} → ${detail}`);
  }
  return json;
}

// ── Templates ────────────────────────────────────────────────────────────

/**
 * Each template = full ProductCreateRequest with V2 attributes:
 * - colors with `is_default` + `sort_order`
 * - features with `icon_name` (lucide)
 * - certifications structured
 * - sizes / ingredients as `string[]`
 * - is_template=true + template_category + template_tags
 */
const TEMPLATES = [
  // ── 1. Áo thun cotton premium (Fashion) ──
  {
    name: 'Áo thun cotton premium',
    slug: 'ao-thun-cotton-premium',
    sku: 'TPL-FASHION-TEE',
    description:
      'Áo thun unisex cotton 100%, mềm mại, thoáng mát. Co giãn 4 chiều, giữ phom sau nhiều lần giặt.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Trắng', hex: '#FFFFFF', is_default: true, sort_order: 0 },
      { name: 'Đen', hex: '#0A0A0A', sort_order: 1 },
      { name: 'Xanh Navy', hex: '#1F2937', sort_order: 2 },
      { name: 'Be', hex: '#D6CFC0', sort_order: 3 },
    ],
    features: [
      {
        label: 'Cotton 100%',
        description: 'Sợi cotton tự nhiên — mát, thấm hút mồ hôi.',
        icon_name: 'Leaf',
      },
      {
        label: 'Co giãn 4 chiều',
        description: 'Vận động thoải mái, không gò bó.',
        icon_name: 'Zap',
      },
      {
        label: 'Form chuẩn',
        description: 'Cắt may chuẩn unisex — phù hợp mọi vóc dáng.',
        icon_name: 'Star',
      },
      {
        label: 'Giặt máy được',
        description: 'Bền màu sau 50+ lần giặt — không bai giãn.',
        icon_name: 'ShieldCheck',
      },
    ],
    certifications: [
      {
        name: 'OEKO-TEX Standard 100',
        url: 'https://www.oeko-tex.com/',
      },
      { name: 'BCI Cotton' },
    ],
    status: 'active',
    is_template: true,
    template_category: 'fashion',
    template_tags: ['cotton', 'unisex', 'basic', 'tee'],
  },

  // ── 2. Trà sữa thảo mộc (F&B) ──
  {
    name: 'Trà sữa thảo mộc tự nhiên',
    sku: 'TPL-FNB-TEALATTE',
    description:
      'Trà sữa pha từ thảo mộc tự nhiên, không chứa chất bảo quản. 3 hương vị đặc trưng.',
    sizes: ['M (300ml)', 'L (500ml)', 'XL (700ml)'],
    colors: [
      { name: 'Matcha', hex: '#86A877', is_default: true, sort_order: 0 },
      { name: 'Oolong', hex: '#A86B3D', sort_order: 1 },
      { name: 'Sữa Tươi', hex: '#F8E9D2', sort_order: 2 },
    ],
    ingredients: [
      'Lá trà oolong',
      'Sữa tươi nguyên kem',
      'Đường mía hữu cơ',
      'Tinh chất matcha Nhật',
    ],
    features: [
      {
        label: 'Thảo mộc tự nhiên',
        description: 'Không chất bảo quản, không phẩm màu.',
        icon_name: 'Leaf',
      },
      {
        label: 'Ít đường',
        description: 'Đường mía hữu cơ — chỉ 30% so với truyền thống.',
        icon_name: 'Heart',
      },
      {
        label: 'Topping handmade',
        description: 'Trân châu được làm trong ngày tại quán.',
        icon_name: 'Sparkles',
      },
    ],
    certifications: [
      { name: 'HACCP Vietnam' },
      { name: 'FDA Approved', url: 'https://www.fda.gov/' },
    ],
    status: 'active',
    is_template: true,
    template_category: 'f&b',
    template_tags: ['trà sữa', 'thảo mộc', 'organic', 'beverage'],
  },

  // ── 3. Son môi lì nhung (Cosmetics) ──
  {
    name: 'Son môi lì nhung 24h',
    sku: 'TPL-COSME-LIPSTICK',
    description:
      'Son lì nhung lâu trôi 24h, dưỡng ẩm với hyaluronic acid. Không chứa paraben, không thử nghiệm trên động vật.',
    sizes: ['3.5g'],
    colors: [
      { name: 'Đỏ Ruby', hex: '#9F1239', is_default: true, sort_order: 0 },
      { name: 'Cam Đào', hex: '#FB923C', sort_order: 1 },
      { name: 'Hồng Nude', hex: '#F5B5A0', sort_order: 2 },
      { name: 'Mận Đỏ', hex: '#7C2D40', sort_order: 3 },
      { name: 'Tím Berry', hex: '#86445E', sort_order: 4 },
    ],
    ingredients: [
      'Hyaluronic Acid',
      'Vitamin E',
      'Bơ shea',
      'Dầu jojoba',
      'Sáp ong tự nhiên',
    ],
    features: [
      {
        label: 'Lâu trôi 24h',
        description: 'Bám màu suốt cả ngày — không lem khi ăn uống.',
        icon_name: 'Star',
      },
      {
        label: 'Dưỡng ẩm sâu',
        description: 'Hyaluronic acid giữ ẩm, môi luôn mịn mượt.',
        icon_name: 'Heart',
      },
      {
        label: 'Cruelty-free',
        description: 'Không thử nghiệm trên động vật — đạo đức.',
        icon_name: 'Sparkles',
      },
      {
        label: 'Vegan',
        description: 'Thành phần thuần thực vật, an toàn cho da nhạy cảm.',
        icon_name: 'Leaf',
      },
    ],
    certifications: [
      { name: 'Cruelty-Free International' },
      { name: 'Vegan Society' },
      { name: 'EWG Verified' },
    ],
    status: 'active',
    is_template: true,
    template_category: 'cosmetics',
    template_tags: ['son môi', 'lì', 'vegan', 'cruelty-free', 'lipstick'],
  },

  // ── 4. Tai nghe không dây (Electronics) ──
  {
    name: 'Tai nghe không dây Pro',
    sku: 'TPL-ELEC-EARBUDS',
    description:
      'Tai nghe Bluetooth 5.3, chống nước IPX5, pin 30h. Chống ồn chủ động ANC, mic hợp âm thanh trong call.',
    sizes: ['One Size'],
    colors: [
      { name: 'Đen Bóng', hex: '#0A0A0A', is_default: true, sort_order: 0 },
      { name: 'Trắng Ngà', hex: '#FAFAF7', sort_order: 1 },
      { name: 'Xanh Navy', hex: '#1F2937', sort_order: 2 },
    ],
    features: [
      {
        label: 'Bluetooth 5.3',
        description: 'Kết nối ổn định, không lag — game và call rõ.',
        icon_name: 'Zap',
      },
      {
        label: 'Chống nước IPX5',
        description: 'Chống mưa nhỏ + mồ hôi, chạy bộ thoải mái.',
        icon_name: 'ShieldCheck',
      },
      {
        label: 'Pin 30h tổng',
        description: 'Tai 6h + case 24h — đủ đi xa cả tuần.',
        icon_name: 'Flame',
      },
      {
        label: 'ANC chủ động',
        description: 'Cắt 95% tiếng ồn — tập trung tối đa.',
        icon_name: 'Shield',
      },
    ],
    certifications: [
      { name: 'CE Certified' },
      { name: 'RoHS Compliant' },
      { name: 'FCC' },
    ],
    status: 'active',
    is_template: true,
    template_category: 'electronics',
    template_tags: ['tai nghe', 'bluetooth', 'wireless', 'audio', 'earbuds'],
  },

  // ── 5. Nồi cơm điện cao cấp (Home) ──
  {
    name: 'Nồi cơm điện đa năng 6 chế độ',
    sku: 'TPL-HOME-RICECOOKER',
    description:
      'Nồi cơm điện cao tần — 6 chế độ nấu (cơm trắng/cháo/yến mạch/hấp/súp/giữ ấm). Lòng nồi dày 2.5mm, chống dính an toàn.',
    sizes: ['1.0L', '1.8L', '2.5L'],
    colors: [
      { name: 'Bạc', hex: '#D4D4D4', is_default: true, sort_order: 0 },
      { name: 'Đen Mờ', hex: '#1F1F1F', sort_order: 1 },
    ],
    features: [
      {
        label: '6 chế độ nấu',
        description: 'Cơm/cháo/yến mạch/hấp/súp/giữ ấm — 1 nút.',
        icon_name: 'Flame',
      },
      {
        label: 'Lòng dày 2.5mm',
        description: 'Lòng hợp kim chống dính, giữ nhiệt đều.',
        icon_name: 'Diamond',
      },
      {
        label: 'Tiết kiệm điện',
        description: 'Energy Star certified — tiết kiệm 25% so với nồi thường.',
        icon_name: 'Zap',
      },
    ],
    certifications: [
      { name: 'Energy Star', url: 'https://www.energystar.gov/' },
      { name: 'CE Marking' },
    ],
    status: 'active',
    is_template: true,
    template_category: 'home',
    template_tags: ['nồi cơm', 'gia dụng', 'kitchen', 'rice cooker'],
  },

  // ── 6. Sữa hạt cao cấp (FMCG) ──
  {
    name: 'Sữa hạt thực vật cao cấp',
    sku: 'TPL-FMCG-PLANTMILK',
    description:
      'Sữa thực vật từ hạt nguyên chất — không đường, không lactose, giàu canxi tự nhiên. 3 hương vị truyền thống.',
    sizes: ['180ml', '500ml', '1L'],
    colors: [
      { name: 'Hạnh Nhân', hex: '#E5C795', is_default: true, sort_order: 0 },
      { name: 'Yến Mạch', hex: '#D8C291', sort_order: 1 },
      { name: 'Đậu Nành', hex: '#F0E6CE', sort_order: 2 },
    ],
    ingredients: [
      'Hạnh nhân nguyên chất 12%',
      'Nước tinh khiết',
      'Canxi từ tảo biển',
      'Vitamin D2, B12',
    ],
    features: [
      {
        label: 'Không đường',
        description: 'Đường tự nhiên từ hạt — không thêm đường tinh luyện.',
        icon_name: 'Heart',
      },
      {
        label: 'Không lactose',
        description: 'Phù hợp người không dung nạp đường sữa, ăn chay.',
        icon_name: 'Leaf',
      },
      {
        label: 'Giàu canxi',
        description: '300mg canxi/serving — tương đương sữa bò.',
        icon_name: 'Sparkles',
      },
      {
        label: 'Vegan & Organic',
        description: 'USDA Organic certified — 100% thuần chay.',
        icon_name: 'TreePine',
      },
    ],
    certifications: [
      {
        name: 'USDA Organic',
        url: 'https://www.usda.gov/topics/organic',
      },
      { name: 'HACCP' },
      { name: 'Vegan Society' },
    ],
    status: 'active',
    is_template: true,
    template_category: 'fmcg',
    template_tags: ['sữa hạt', 'plant milk', 'organic', 'vegan', 'fmcg'],
  },
];

// ── Run ───────────────────────────────────────────────────────────────────

console.log(`\nSeeding ${TEMPLATES.length} product templates → ${BASE}\n`);

const summary = { created: [], skipped: [], failed: [] };

for (const tpl of TEMPLATES) {
  if (SKIP && tpl.template_category === SKIP) {
    summary.skipped.push(tpl.name);
    console.log(`⏭   Skip ${tpl.name} (--skip ${SKIP})`);
    continue;
  }

  const body = {
    ...tpl,
    ...(MAKE_PUBLIC ? { is_public_template: true } : {}),
  };

  try {
    const res = await rx('/products', { method: 'POST', body });
    const id = res.product?.id ?? '?';
    summary.created.push({
      name: tpl.name,
      id,
      category: tpl.template_category,
    });
    console.log(`✅   ${tpl.template_category.padEnd(11)} · ${tpl.name}`);
    console.log(`     id=${id}`);
  } catch (err) {
    summary.failed.push({ name: tpl.name, err: err.message });
    console.log(`❌   ${tpl.name} — ${err.message}`);
  }
}

console.log('\n=== SUMMARY ===');
console.log(`Created:  ${summary.created.length}`);
console.log(`Skipped:  ${summary.skipped.length}`);
console.log(`Failed:   ${summary.failed.length}`);

if (summary.created.length > 0) {
  console.log(`\nView at: ${BASE}/product → Templates tab`);
}
if (summary.failed.length > 0) {
  console.log('\nFailures:');
  summary.failed.forEach(f => console.log(`  ${f.name}: ${f.err}`));
}
