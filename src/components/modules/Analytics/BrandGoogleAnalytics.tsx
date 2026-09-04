import { GA_MEASUREMENT_ID } from '@/lib/analytics/ga';

/**
 * Thẻ GA4 của CHÍNH BRAND trên trang công khai của họ.
 *
 * Landing chạy trên domain riêng của brand thì traffic đó là của brand — số
 * liệu phải chảy về property GA4 của họ, không chỉ về property nền tảng. Id lấy
 * từ `ga_measurement_id` trong payload `/v1/public/pages/{slug}` (cột
 * `brands.ga_measurement_id`, migration 000105).
 *
 * Là server component chèn thẻ THÔ, không dùng next/script, vì hai lý do:
 * - phải chạy lúc parse HTML để `config` có mặt trong dataLayer TRƯỚC khi
 *   `ConsentBanner` và `PageviewTracker` chạy effect — chúng dò dataLayer để
 *   biết trang có GA hay không (`hasAnyGaConfig`);
 * - trạng thái consent mặc định (denied) đã do root layout khai báo, thẻ này
 *   chỉ thêm một property vào cùng hàng đợi nên thừa hưởng nguyên vẹn.
 *
 * `send_page_view: false` cho đồng bộ với property nền tảng: mọi lượt xem đều
 * do `PageviewTracker` bắn một lần, và gtag phát event đó tới MỌI property đã
 * config. Để mặc định true thì lần tải đầu bị đếm hai lần ở phía brand.
 */
export function BrandGoogleAnalytics({
  measurementId,
}: {
  measurementId?: string;
}) {
  const id = (measurementId ?? '').trim();
  if (!id) return null;
  // Property của brand trùng property nền tảng ⇒ bỏ qua, nếu không mọi event
  // bị gửi hai lần vào cùng một property.
  if (id === GA_MEASUREMENT_ID) return null;
  // Chỉ nhận đúng dạng GA4. Giá trị này đi từ DB ra thẳng thẻ <script>, nên
  // whitelist ký tự ở đây là chốt chặn cuối cùng chống chèn mã.
  if (!/^G-[A-Z0-9]{4,20}$/.test(id)) return null;

  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${id}`} />
      <script
        dangerouslySetInnerHTML={{
          __html:
            'window.dataLayer=window.dataLayer||[];' +
            'function gtag(){dataLayer.push(arguments);}' +
            `gtag('config','${id}',{send_page_view:false});`,
        }}
      />
    </>
  );
}
