import type { AutomationProduct } from '@/lib/portal-v2/automation/types';

/**
 * Record sản phẩm → brief cho API insight.
 *
 * Đây là chỗ hai triết lý gặp nhau: demo BIND từ record và từ chối bịa, luồng
 * insight thì SINH bằng LLM. Ghép lại thành — dữ liệu sản phẩm đi vào brief,
 * nên AI viết dựa trên sự thật của sản phẩm thay vì tự nghĩ ra; chỗ nào record
 * không nói thì AI mới viết từ đầu.
 *
 * Cấu trúc bám đúng khối "Value proposition" của module Product, vì đó là hợp
 * đồng mà người nhập liệu đã đọc khi điền:
 *
 *   FEATURES  — sự thật    → chất liệu để giải thích
 *   BENEFITS  — nó làm gì cho khách → dẫn dắt
 *   CLAIMS    — khẳng định KÈM bằng chứng → chỗ duy nhất được phép quả quyết
 *   COMPETITORS — họ vs mình → nội dung so sánh
 *   DISCLAIMERS — miễn trừ đi kèm khẳng định
 *
 * Chỉ đưa vào thứ record THẬT SỰ có. Nhồi nhãn rỗng ("Đặc điểm: —") làm model
 * tưởng đó là nội dung và chép nguyên cái gạch ngang lên trang.
 */
export const briefFromProduct = (p: AutomationProduct): string => {
  const lines: string[] = [`Sản phẩm: ${p.title}`];

  if (p.type) lines.push(`Loại: ${p.type}`);
  if (p.category.trim()) lines.push(`Phân loại: ${p.category}`);
  if (p.priceText) lines.push(`Giá: ${p.priceText}`);
  if (p.body.trim()) lines.push(`Mô tả: ${p.body.trim()}`);

  if (p.features.length) {
    lines.push(`ĐẶC ĐIỂM (sự thật về sản phẩm):\n${bullets(p.features)}`);
  }
  if (p.benefits.length) {
    lines.push(`LỢI ÍCH (điều nó làm được cho khách):\n${bullets(p.benefits)}`);
  }

  // Khẳng định là chỗ DUY NHẤT được phép quả quyết, và luôn phải đi kèm dẫn
  // chứng — nói rõ trong brief để model không tự nâng một đặc điểm thành lời
  // cam kết.
  if (p.claims.length) {
    lines.push(
      'KHẲNG ĐỊNH ĐÃ CÓ BẰNG CHỨNG (chỉ được quả quyết trong phạm vi này):\n' +
        p.claims.map(c => `- ${c.text} — bằng chứng: ${c.proof}`).join('\n')
    );
  } else {
    lines.push(
      'KHÔNG có khẳng định nào được chứng minh. Đừng viết bất kỳ lời cam kết ' +
        'về hiệu quả, chứng nhận hay kết quả nào.'
    );
  }

  if (p.competitors.length) {
    lines.push(
      'SO VỚI ĐỐI THỦ:\n' +
        p.competitors
          .map(c => `- ${c.name}: họ ${c.theirs}; mình ${c.ours}`)
          .join('\n')
    );
  }

  if (p.disclaimers.length) {
    lines.push(
      `MIỄN TRỪ (phải giữ nguyên văn nếu nhắc tới khẳng định tương ứng):\n${bullets(p.disclaimers)}`
    );
  }

  return lines.join('\n\n');
};

const bullets = (items: string[]): string =>
  items.map(x => `- ${x}`).join('\n');
