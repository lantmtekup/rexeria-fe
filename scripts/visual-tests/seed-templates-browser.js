/**
 * Seed 6 product templates by pasting this entire block into the browser
 * DevTools Console at http://localhost:3000 (must be logged in).
 *
 * The browser auto-sends the session cookie with each fetch — no JWT setup.
 */
(async () => {
  const TEMPLATES = [
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
          description: 'Cắt may chuẩn unisex.',
          icon_name: 'Star',
        },
        {
          label: 'Giặt máy được',
          description: 'Bền màu sau 50+ lần giặt.',
          icon_name: 'ShieldCheck',
        },
      ],
      certifications: [
        { name: 'OEKO-TEX Standard 100', url: 'https://www.oeko-tex.com/' },
        { name: 'BCI Cotton' },
      ],
      status: 'active',
      is_template: true,
      template_category: 'fashion',
      template_tags: ['cotton', 'unisex', 'basic', 'tee'],
    },
    {
      name: 'Trà sữa thảo mộc tự nhiên',
      sku: 'TPL-FNB-TEALATTE',
      description:
        'Trà sữa pha từ thảo mộc tự nhiên, không chứa chất bảo quản.',
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
          description: 'Trân châu được làm trong ngày.',
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
    {
      name: 'Son môi lì nhung 24h',
      sku: 'TPL-COSME-LIPSTICK',
      description: 'Son lì nhung lâu trôi 24h, dưỡng ẩm với hyaluronic acid.',
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
          description: 'Bám màu suốt cả ngày.',
          icon_name: 'Star',
        },
        {
          label: 'Dưỡng ẩm sâu',
          description: 'Hyaluronic acid giữ ẩm.',
          icon_name: 'Heart',
        },
        {
          label: 'Cruelty-free',
          description: 'Không thử nghiệm trên động vật.',
          icon_name: 'Sparkles',
        },
        {
          label: 'Vegan',
          description: 'Thành phần thuần thực vật.',
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
      template_tags: ['son môi', 'lì', 'vegan', 'cruelty-free'],
    },
    {
      name: 'Tai nghe không dây Pro',
      sku: 'TPL-ELEC-EARBUDS',
      description:
        'Tai nghe Bluetooth 5.3, chống nước IPX5, pin 30h. Chống ồn chủ động ANC.',
      sizes: ['One Size'],
      colors: [
        { name: 'Đen Bóng', hex: '#0A0A0A', is_default: true, sort_order: 0 },
        { name: 'Trắng Ngà', hex: '#FAFAF7', sort_order: 1 },
        { name: 'Xanh Navy', hex: '#1F2937', sort_order: 2 },
      ],
      features: [
        {
          label: 'Bluetooth 5.3',
          description: 'Kết nối ổn định, không lag.',
          icon_name: 'Zap',
        },
        {
          label: 'Chống nước IPX5',
          description: 'Chống mưa nhỏ + mồ hôi.',
          icon_name: 'ShieldCheck',
        },
        {
          label: 'Pin 30h tổng',
          description: 'Tai 6h + case 24h.',
          icon_name: 'Flame',
        },
        {
          label: 'ANC chủ động',
          description: 'Cắt 95% tiếng ồn.',
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
      template_tags: ['tai nghe', 'bluetooth', 'wireless', 'audio'],
    },
    {
      name: 'Nồi cơm điện đa năng 6 chế độ',
      sku: 'TPL-HOME-RICECOOKER',
      description:
        'Nồi cơm điện cao tần — 6 chế độ nấu, lòng dày 2.5mm chống dính.',
      sizes: ['1.0L', '1.8L', '2.5L'],
      colors: [
        { name: 'Bạc', hex: '#D4D4D4', is_default: true, sort_order: 0 },
        { name: 'Đen Mờ', hex: '#1F1F1F', sort_order: 1 },
      ],
      features: [
        {
          label: '6 chế độ nấu',
          description: 'Cơm/cháo/yến mạch/hấp/súp/giữ ấm.',
          icon_name: 'Flame',
        },
        {
          label: 'Lòng dày 2.5mm',
          description: 'Lòng hợp kim chống dính, giữ nhiệt đều.',
          icon_name: 'Diamond',
        },
        {
          label: 'Tiết kiệm điện',
          description: 'Energy Star certified.',
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
      template_tags: ['nồi cơm', 'gia dụng', 'kitchen'],
    },
    {
      name: 'Sữa hạt thực vật cao cấp',
      sku: 'TPL-FMCG-PLANTMILK',
      description:
        'Sữa thực vật từ hạt nguyên chất — không đường, không lactose, giàu canxi tự nhiên.',
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
          description: 'Đường tự nhiên từ hạt.',
          icon_name: 'Heart',
        },
        {
          label: 'Không lactose',
          description: 'Phù hợp người không dung nạp đường sữa.',
          icon_name: 'Leaf',
        },
        {
          label: 'Giàu canxi',
          description: '300mg canxi/serving.',
          icon_name: 'Sparkles',
        },
        {
          label: 'Vegan & Organic',
          description: 'USDA Organic certified.',
          icon_name: 'TreePine',
        },
      ],
      certifications: [
        { name: 'USDA Organic', url: 'https://www.usda.gov/topics/organic' },
        { name: 'HACCP' },
        { name: 'Vegan Society' },
      ],
      status: 'active',
      is_template: true,
      template_category: 'fmcg',
      template_tags: ['sữa hạt', 'plant milk', 'organic', 'vegan'],
    },
  ];

  console.log(`Seeding ${TEMPLATES.length} templates…`);
  const created = [];
  const failed = [];

  for (const tpl of TEMPLATES) {
    try {
      const res = await fetch('/api/rexer/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(tpl),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`HTTP ${res.status} — ${body.slice(0, 200)}`);
      }
      const j = await res.json();
      const id = j.product?.id ?? '?';
      created.push({ name: tpl.name, id, category: tpl.template_category });
      console.log(
        `✅ ${tpl.template_category.padEnd(11)} · ${tpl.name} · id=${id}`
      );
    } catch (e) {
      failed.push({ name: tpl.name, err: e.message });
      console.error(`❌ ${tpl.name} — ${e.message}`);
    }
  }

  console.log(`\nDone: ${created.length} created · ${failed.length} failed`);
  console.log('Reload /product → tab Templates');
})();
