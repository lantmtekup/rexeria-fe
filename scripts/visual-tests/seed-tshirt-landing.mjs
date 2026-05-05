/**
 * Seed a 7-block landing page for "Comfort Colors Blue Flower Bouquet Shirt".
 *
 * Login via /sign-in, POST /v1/canvas-templates with a pre-populated
 * canvas_data (block_editor schema, version 1). Print the editor URL on
 * success. Open the URL to edit / fine-tune.
 *
 * Block sequence — typical e-commerce single-product flow:
 *   1. HeroOverlay     — full-bleed lifestyle shot
 *   2. HeroSplit       — brand story + stats
 *   3. FeatureSection  — product highlights (4 cards)
 *   4. PhotoGallery    — 5-photo grid (folded, front, back, detail, lifestyle)
 *   5. FeatureSection  — why customers love it
 *   6. BookingForm     — order form + 4 reason chips
 *   7. CtaSection      — final CTA, shop now / view collection
 */
import { chromium } from 'playwright';
import { randomUUID } from 'node:crypto';

const BASE = 'http://localhost:3003';

// ── Block factory helpers ──────────────────────────────────────────────
const block = (blockType, name, contentVi, contentEn) => ({
  id: randomUUID(),
  blockType,
  name,
  contentVi,
  contentEn,
  isVisible: true,
});

// Unsplash placeholders (royalty-free, matching aesthetic).
const IMG = {
  hero: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1600&q=80',
  detail:
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=80',
  folded:
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=80',
  modelFront:
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80',
  modelBack:
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=80',
  closeUp:
    'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=900&q=80',
  lifestyle:
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80',
  ctaBg:
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80',
};

const blocks = [
  // 1) Hero Overlay
  block(
    'hero_overlay',
    'Hero — Bloom your day',
    {
      tag: 'NEW DROP · Spring 2026',
      title: 'Wear the bloom every day',
      subtitle:
        'Áo thun hoa xanh — in tay trên vải Comfort Colors, mềm mượt, lên màu trầm sang trọng.',
      ctaText: 'Mua ngay',
      ctaLink: '#order',
      backgroundUrl: IMG.hero,
    },
    {
      tag: 'NEW DROP · Spring 2026',
      title: 'Wear the bloom every day',
      subtitle:
        'Hand-printed on Comfort Colors fabric — soft, garment-dyed, vintage-feel tee that goes with everything.',
      ctaText: 'Shop now',
      ctaLink: '#order',
      backgroundUrl: IMG.hero,
    }
  ),

  // 2) Hero Split
  block(
    'hero_split',
    'Câu chuyện sản phẩm',
    {
      eyebrow: 'COMFORT COLORS · GARMENT DYED',
      title: 'Mềm như đã giặt cả trăm lần.',
      description:
        'Mỗi chiếc áo được nhuộm sau khi may, nên màu rất "trầm" và sờ vào mềm ngay từ lần mặc đầu tiên. Form unisex, dày dặn, càng giặt càng mềm.',
      imageUrl: IMG.detail,
      stats: [
        { value: '6', label: 'màu pastel' },
        { value: '5', label: 'kích cỡ S–2XL' },
        { value: '100%', label: 'cotton ring-spun' },
      ],
      ctaText: 'Xem chi tiết',
      ctaLink: '#features',
    },
    {
      eyebrow: 'COMFORT COLORS · GARMENT DYED',
      title: 'As soft as a hundred washes.',
      description:
        'Each tee is dyed after stitching, so the colour falls beautifully and the hand feels broken-in from day one. Unisex, heavyweight, and only gets better with wear.',
      imageUrl: IMG.detail,
      stats: [
        { value: '6', label: 'pastel colours' },
        { value: '5', label: 'sizes S–2XL' },
        { value: '100%', label: 'ring-spun cotton' },
      ],
      ctaText: 'Discover details',
      ctaLink: '#features',
    }
  ),

  // 3) Feature Section — product highlights
  block(
    'feature_section',
    'Highlights',
    {
      eyebrow: 'ĐIỂM NỔI BẬT',
      title: 'Vì sao bạn sẽ mặc áo này mỗi tuần',
      description:
        'Bốn lý do khiến chiếc tee Blue Bouquet trở thành "go-to" trong tủ đồ mùa xuân của bạn.',
      features: [
        {
          icon: 'Sparkles',
          label: 'Garment-dyed mềm sẵn',
          body: 'Nhuộm sau may → vải đã "broken-in", không cần giặt nhiều lần mới mặc thoải mái.',
        },
        {
          icon: 'ShieldCheck',
          label: 'Vải dày 6.1oz',
          body: 'Heavyweight, không xuyên thấu, đứng phom — mặc một mình hoặc layer đều ổn.',
        },
        {
          icon: 'Leaf',
          label: 'In tay 3 màu',
          body: 'Mực gốc nước, lên hoa xanh trầm, không nứt sau giặt. Mỗi áo là 1 sản phẩm thủ công.',
        },
        {
          icon: 'Home',
          label: 'Form unisex',
          body: 'Cắt rộng vừa phải, vai drop-shoulder, hợp cả nam và nữ. Size S → 2XL.',
        },
      ],
    },
    {
      eyebrow: 'HIGHLIGHTS',
      title: 'Reasons you will wear this every week',
      description:
        'Four reasons the Blue Bouquet tee will become your go-to spring layer.',
      features: [
        {
          icon: 'Sparkles',
          label: 'Garment-dyed softness',
          body: 'Dyed after stitching → fabric is already broken-in. Wear it straight out of the bag.',
        },
        {
          icon: 'ShieldCheck',
          label: 'Heavyweight 6.1oz',
          body: 'Substantial cotton — no see-through, holds its shape, layers beautifully.',
        },
        {
          icon: 'Leaf',
          label: 'Hand-printed in 3 inks',
          body: 'Water-based inks bloom into a moody blue floral. No cracking after washes.',
        },
        {
          icon: 'Home',
          label: 'Unisex fit',
          body: 'Relaxed cut with drop shoulder. Sizes S through 2XL, suited to all bodies.',
        },
      ],
    }
  ),

  // 4) Photo Gallery — 5 looks
  block(
    'photo_gallery',
    'Bộ sưu tập ảnh',
    {
      eyebrow: 'LOOKBOOK',
      title: 'Một thiết kế, vô số cách phối',
      description:
        'Mặc một mình với jeans baggy, layer dưới blazer linen, hoặc nhét vào chân váy midi — đều đẹp.',
      photos: [
        { url: IMG.modelFront, caption: 'Front · phối với baggy denim' },
        { url: IMG.folded, caption: 'Texture · vải Comfort Colors' },
        { url: IMG.modelBack, caption: 'Back detail' },
        { url: IMG.closeUp, caption: 'Close-up · in tay 3 màu' },
        { url: IMG.lifestyle, caption: 'Lifestyle · weekend casual' },
      ],
    },
    {
      eyebrow: 'LOOKBOOK',
      title: 'One tee, endless ways to wear',
      description:
        'Solo with baggy denim, layered under a linen blazer, or tucked into a midi skirt.',
      photos: [
        { url: IMG.modelFront, caption: 'Front · with baggy denim' },
        { url: IMG.folded, caption: 'Texture · Comfort Colors fabric' },
        { url: IMG.modelBack, caption: 'Back detail' },
        { url: IMG.closeUp, caption: 'Close-up · 3-colour hand print' },
        { url: IMG.lifestyle, caption: 'Lifestyle · weekend casual' },
      ],
    }
  ),

  // 5) Feature Section #2 — why customers love
  block(
    'feature_section',
    'Khách hàng nói gì',
    {
      eyebrow: 'CUSTOMER LOVE',
      title: 'Đánh giá 4.9 sao trên 1.200+ đơn',
      description:
        'Khách quay lại mua thêm vì độ mềm và bền — không phải vì in đẹp.',
      features: [
        {
          icon: 'Compass',
          label: 'Bền màu sau 30 lần giặt',
          body: 'Test trong studio: in không phai, vải không xù sau 30 chu kỳ giặt máy lạnh.',
        },
        {
          icon: 'Waves',
          label: 'Cảm giác đầu tiên',
          body: '"Mặc xong là không muốn cởi" — feedback xuất hiện trong 73% review 5 sao.',
        },
        {
          icon: 'TreePine',
          label: 'Mực gốc nước',
          body: 'An toàn cho da nhạy cảm, không có phthalate, đạt chuẩn OEKO-TEX.',
        },
        {
          icon: 'Building2',
          label: 'In tại Hà Nội',
          body: 'Local studio nhỏ, mỗi đơn được kiểm tra tay trước khi đóng gói.',
        },
      ],
    },
    {
      eyebrow: 'CUSTOMER LOVE',
      title: '4.9 stars across 1,200+ orders',
      description:
        'Repeat customers come back for the softness and durability — not just the print.',
      features: [
        {
          icon: 'Compass',
          label: '30-wash colourfast',
          body: 'Lab-tested: print stays sharp, fabric resists pilling after 30 cold cycles.',
        },
        {
          icon: 'Waves',
          label: 'First-touch addictive',
          body: '"Did not want to take it off" — appears in 73 % of our 5-star reviews.',
        },
        {
          icon: 'TreePine',
          label: 'Water-based inks',
          body: 'Skin-safe, phthalate-free, OEKO-TEX certified.',
        },
        {
          icon: 'Building2',
          label: 'Printed in Hanoi',
          body: 'A small studio — every shirt is hand-checked before it ships.',
        },
      ],
    }
  ),

  // 6) Booking Form — order form
  block(
    'booking_form',
    'Đặt mua',
    {
      eyebrow: 'ORDER FORM',
      title: 'Để lại thông tin — chúng tôi gửi áo trong 48h',
      description:
        'Free ship cho đơn từ 800k. Thanh toán khi nhận hàng (COD) khắp Việt Nam.',
      reasons: [
        { value: 'Free', label: 'ship đơn 800k+' },
        { value: '30 ngày', label: 'đổi trả miễn phí' },
        { value: 'COD', label: 'thanh toán khi nhận' },
        { value: 'Bảo hành', label: 'in 1 năm' },
      ],
      submitText: 'Đặt áo ngay',
      noteText: 'Nhân viên sẽ gọi xác nhận size + màu trong 1h làm việc.',
    },
    {
      eyebrow: 'ORDER FORM',
      title: 'Drop your details — we ship within 48h',
      description:
        'Free shipping over $35. Cash on delivery available across Vietnam.',
      reasons: [
        { value: 'Free', label: 'ship $35+' },
        { value: '30-day', label: 'free returns' },
        { value: 'COD', label: 'cash on delivery' },
        { value: '1-year', label: 'print warranty' },
      ],
      submitText: 'Place order',
      noteText: 'We will call to confirm size + colour within 1 business hour.',
    }
  ),

  // 7) CTA Section — final close
  block(
    'cta_section',
    'CTA cuối',
    {
      eyebrow: 'STILL THINKING?',
      title: 'Một chiếc áo bạn sẽ vẫn mặc 5 năm sau.',
      subtitle:
        'Mua riêng, hoặc xem cả bộ sưu tập "Bloom Spring" với 6 thiết kế áo thun in tay khác.',
      primaryText: 'Mua áo này',
      primaryLink: '#order',
      secondaryText: 'Xem cả bộ sưu tập',
      secondaryLink: '/collection/bloom-spring',
      backgroundUrl: IMG.ctaBg,
    },
    {
      eyebrow: 'STILL THINKING?',
      title: 'A tee you will still wear in five years.',
      subtitle:
        'Buy this one, or see the whole "Bloom Spring" capsule with six other hand-printed tees.',
      primaryText: 'Buy this tee',
      primaryLink: '#order',
      secondaryText: 'Browse the capsule',
      secondaryLink: '/collection/bloom-spring',
      backgroundUrl: IMG.ctaBg,
    }
  ),
];

// ── Run ────────────────────────────────────────────────────────────────
const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();

console.log('▶ login');
await page.goto(BASE + '/sign-in', { waitUntil: 'load' });
await page.waitForSelector('input[type=email]', { timeout: 15000 });
await page.locator('form button[type=submit]').first().click();
await page
  .waitForURL(/\/home/, { timeout: 20000 })
  .catch(e => console.log('  [waitURL]', e.message));
console.log('  ✓ session ready');

console.log('▶ POST /api/rexer/canvas-templates');
const created = await page.evaluate(
  async ({ blocks }) => {
    const res = await fetch('/api/rexer/canvas-templates', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Comfort Colors — Blue Flower Bouquet Tee',
        description:
          'Landing page giới thiệu + bán áo thun hoa xanh, in tay trên vải Comfort Colors.',
        width: 1280,
        height: 720,
        // BE oneof validator accepts only 'fabric'/'5.3.0'. Our block_editor
        // schema lives inside canvas_data — engine is just a capability tag.
        engine: 'fabric',
        engine_version: '5.3.0',
        is_template: false,
        canvas_data: {
          schema: 'block_editor',
          version: 1,
          blocks,
          activeBlockId: blocks[0].id,
        },
      }),
    });
    return { status: res.status, body: await res.text() };
  },
  { blocks }
);

if (created.status >= 200 && created.status < 300) {
  const parsed = JSON.parse(created.body);
  const tpl =
    parsed.canvas_template ??
    parsed.canvasTemplate ??
    parsed.template ??
    parsed;
  const id = tpl?.id ?? parsed?.id;
  if (!id) {
    console.error('🔴 created but no id in body:', created.body.slice(0, 400));
    process.exit(1);
  }
  console.log('  ✓ created');
  console.log('');
  console.log('Editor URL:');
  console.log(`  ${BASE}/canvas-templates/${id}`);
  console.log('');
  console.log('List URL:');
  console.log(`  ${BASE}/template  (filter "My Template")`);
} else {
  console.error('🔴 create failed:', created.status);
  console.error(created.body.slice(0, 600));
  process.exit(1);
}

await browser.close();
