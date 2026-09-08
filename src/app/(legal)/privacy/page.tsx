import type { Metadata } from 'next';
import Link from 'next/link';

import { Bullets, DocTitle, Section, Table, Todo } from '../_doc';

/**
 * Chính sách quyền riêng tư.
 *
 * VIẾT TỪ CÁI SẢN PHẨM THẬT SỰ LÀM, không phải từ mẫu chung. Mọi mục dưới đây
 * đối chiếu được với mã nguồn:
 *  - cookie phiên `rexer_session`, TTL 168h  → `config/base.yaml`
 *  - `rexer.tracker.visitor_id` / `session_id` (30 phút không hoạt động)
 *                                            → `src/lib/analytics/tracker.ts`
 *  - `rexer.consent.v1`, Consent Mode v2 mặc định TỪ CHỐI
 *                                            → `src/lib/analytics/ga.ts`
 *  - lead (tên/liên hệ/nội dung form/consent_at/điểm)
 *                                            → BE `internal/domain/models/lead.go`
 *  - chặn PII lọt vào analytics_events       → BE `guardNoPII`
 *  - quốc gia suy từ biên Cloudflare         → BE ingest `normalizeCountry`
 *
 * Chỗ nào CHƯA có dữ kiện thật thì để `<Todo>` hiện rõ trên trang, không đoán.
 * Pháp nhân, địa chỉ đăng ký và thời hạn lưu trữ là ba chỗ như vậy.
 */

export const metadata: Metadata = {
  title: { absolute: 'Chính sách quyền riêng tư — ReXeR Studio' },
  description:
    'ReXeR Studio thu thập, dùng và bảo vệ dữ liệu cá nhân như thế nào — cho người dùng nền tảng và cho khách truy cập trang đích do khách hàng của chúng tôi xuất bản.',
  alternates: { canonical: '/privacy' },
  robots: { index: true, follow: true },
};

const EFFECTIVE_DATE = '08/09/2026';

export default function PrivacyPage() {
  return (
    <article>
      <DocTitle
        title='Chính sách quyền riêng tư'
        updated={EFFECTIVE_DATE}
        intro={
          <>
            <p>
              ReXeR Studio (&ldquo;ReXeR&rdquo;, &ldquo;chúng tôi&rdquo;) cung
              cấp nền tảng dựng và đo lường trang đích tại{' '}
              <strong>rexerstudio.com</strong> và{' '}
              <strong>portal.rexerstudio.com</strong>. Tài liệu này nói rõ chúng
              tôi thu thập dữ liệu gì, vì sao, chia sẻ với ai và bạn có quyền
              gì.
            </p>
            <p className='mt-3'>
              Có một điểm cần phân biệt ngay, vì nó quyết định bạn phải hỏi ai
              khi muốn thực hiện quyền của mình: dữ liệu của{' '}
              <em>người dùng nền tảng</em> và dữ liệu của{' '}
              <em>khách truy cập trang đích</em> do khách hàng chúng tôi xuất
              bản được xử lý theo hai vai trò khác nhau. Xem mục 1.
            </p>
          </>
        }
      />

      <Section n={1} title='Hai vai trò, và điều đó nghĩa là gì với bạn'>
        <p>
          <strong>Khi bạn là người dùng nền tảng</strong> (bạn có tài khoản,
          đăng nhập vào portal để dựng trang): ReXeR là{' '}
          <strong>Bên Kiểm soát dữ liệu</strong>. Mọi yêu cầu về dữ liệu của bạn
          gửi thẳng cho chúng tôi theo mục 11.
        </p>
        <p>
          <strong>Khi bạn là khách truy cập một trang đích</strong> được dựng
          trên nền tảng của chúng tôi (bạn xem trang của một thương hiệu, có thể
          để lại thông tin liên hệ): thương hiệu đó là{' '}
          <strong>Bên Kiểm soát</strong>, còn ReXeR chỉ là{' '}
          <strong>Bên Xử lý</strong> — chúng tôi lưu và trả lại dữ liệu theo yêu
          cầu của họ, không tự dùng cho mục đích riêng. Muốn xoá thông tin đã để
          lại, hãy liên hệ chính thương hiệu đó trước; nếu không tìm được đầu
          mối, viết cho chúng tôi và chúng tôi sẽ chuyển tiếp.
        </p>
        <p>
          Chúng tôi <strong>không</strong> bán dữ liệu cá nhân, và{' '}
          <strong>không</strong> dùng lead của thương hiệu này để chào mời
          thương hiệu khác.
        </p>
      </Section>

      <Section n={2} title='Dữ liệu chúng tôi thu thập'>
        <p className='font-medium text-[#0e1117]'>
          a) Khi bạn dùng portal (bạn là người dùng nền tảng)
        </p>
        <Bullets
          items={[
            <>
              <strong>Tài khoản</strong>: địa chỉ email, tên hiển thị và ảnh đại
              diện. Nếu bạn đăng nhập bằng Google, các thông tin này do Google
              cung cấp qua Firebase Authentication — chúng tôi không nhận và
              không lưu mật khẩu Google của bạn.
            </>,
            <>
              <strong>Nội dung bạn tạo</strong>: trang, khối nội dung, hồ sơ
              thương hiệu và sản phẩm, hình ảnh và tệp bạn tải lên, tên miền bạn
              kết nối.
            </>,
            <>
              <strong>Nhật ký sử dụng</strong>: màn hình bạn mở và thao tác bạn
              thực hiện trong portal (ví dụ nối nguồn dữ liệu, thêm tên miền),
              gửi tới Google Analytics 4 và chỉ khi bạn đã đồng ý — xem mục 4.
            </>,
          ]}
        />

        <p className='mt-4 font-medium text-[#0e1117]'>
          b) Khi bạn xem một trang đích dựng trên nền tảng
        </p>
        <Bullets
          items={[
            <>
              <strong>Mã nhận dạng kỹ thuật</strong>: một mã ngẫu nhiên cho
              trình duyệt (<code>visitor_id</code>) và một mã cho phiên xem (
              <code>session_id</code>). Đây là chuỗi ngẫu nhiên do trình duyệt
              của bạn tự sinh, không gắn với tên hay email của bạn.
            </>,
            <>
              <strong>Hành vi trên trang</strong>: trang và phần nội dung bạn
              xem, thời gian dừng lại, độ sâu cuộn, các nút bạn nhấp.
            </>,
            <>
              <strong>Bối cảnh kỹ thuật</strong>: kích thước cửa sổ trình duyệt,
              trang giới thiệu bạn tới (referrer), tham số chiến dịch trên đường
              dẫn (<code>utm_source</code>, <code>utm_medium</code>,{' '}
              <code>utm_campaign</code>), và <strong>mã quốc gia</strong> do hạ
              tầng Cloudflare suy ra từ địa chỉ IP.
            </>,
            <>
              <strong>Thông tin bạn chủ động điền vào biểu mẫu</strong>: tên,
              email và/hoặc số điện thoại, cùng những trường khác mà thương hiệu
              đặt trong biểu mẫu đó (ví dụ ghi chú, ngân sách, sản phẩm quan
              tâm), và thời điểm bạn tích ô đồng ý được liên hệ.
            </>,
          ]}
        />
        <p>
          Chúng tôi <strong>không lưu địa chỉ IP đầy đủ</strong> của khách truy
          cập trong dữ liệu đo lường — chỉ lưu mã quốc gia suy ra từ nó. Hệ
          thống cũng chủ động <strong>từ chối</strong> các sự kiện đo lường mang
          theo thứ trông giống email hoặc số điện thoại, để thông tin cá nhân
          không lẫn vào kho phân tích: nơi duy nhất chứa thông tin liên hệ là
          bảng lead, và chỉ khi bạn tự điền.
        </p>
      </Section>

      <Section n={3} title='Chúng tôi dùng dữ liệu để làm gì'>
        <Table
          head={['Mục đích', 'Dữ liệu dùng đến', 'Cơ sở']}
          rows={[
            [
              'Tạo và bảo vệ tài khoản, giữ bạn đăng nhập',
              'Email, tên, cookie phiên',
              'Thực hiện hợp đồng',
            ],
            [
              'Vận hành nền tảng: lưu trang, ảnh, xuất bản, kết nối tên miền',
              'Nội dung bạn tạo',
              'Thực hiện hợp đồng',
            ],
            [
              'Đo lường trang đích và lập báo cáo cho thương hiệu',
              'Mã kỹ thuật, hành vi trên trang, quốc gia, tham số chiến dịch',
              'Lợi ích hợp pháp của thương hiệu, có sự đồng ý khi pháp luật yêu cầu',
            ],
            [
              'Chuyển thông tin bạn để lại cho thương hiệu để họ liên hệ',
              'Tên, liên hệ, nội dung biểu mẫu',
              'Sự đồng ý của bạn',
            ],
            [
              'Chấm mức độ quan tâm của một liên hệ (nóng/ấm/nguội)',
              'Nguồn truy cập và hành vi trên trang của chính phiên đó',
              'Lợi ích hợp pháp của thương hiệu',
            ],
            [
              'Cải thiện sản phẩm, biết tính năng nào được dùng',
              'Nhật ký sử dụng portal qua GA4',
              'Sự đồng ý',
            ],
            [
              'Bảo mật, chống gửi biểu mẫu tự động và lạm dụng',
              'Địa chỉ IP, User-Agent tại thời điểm gửi',
              'Lợi ích hợp pháp',
            ],
          ]}
        />
        <p>
          Việc chấm điểm liên hệ chỉ dùng để xếp thứ tự gọi lại, không tạo ra
          quyết định tự động nào gây hậu quả pháp lý cho bạn.
        </p>
      </Section>

      <Section n={4} title='Cookie và lưu trữ trên trình duyệt'>
        <p>
          Chúng tôi dùng cơ chế Consent Mode v2 của Google:{' '}
          <strong>mặc định TỪ CHỐI</strong> mọi mục đích lưu trữ cho quảng cáo
          và phân tích cho tới khi bạn bấm đồng ý trên thanh thông báo. Trước
          khi bạn đồng ý, Google Analytics không đặt cookie.
        </p>
        <Table
          head={['Tên', 'Loại', 'Dùng để', 'Thời hạn']}
          rows={[
            [
              <code key='a'>rexer_session</code>,
              'Cookie',
              'Giữ bạn đăng nhập vào portal. Bắt buộc, không tắt được.',
              '7 ngày',
            ],
            [
              <code key='b'>rexer.consent.v1</code>,
              'localStorage',
              'Nhớ lựa chọn đồng ý/từ chối của bạn để không hỏi lại',
              'Tới khi bạn xoá dữ liệu trình duyệt',
            ],
            [
              <code key='c'>rexer.tracker.visitor_id</code>,
              'localStorage',
              'Phân biệt trình duyệt để đếm "khách duy nhất" trên trang đích',
              'Tới khi bạn xoá dữ liệu trình duyệt',
            ],
            [
              <code key='d'>rexer.tracker.session_id</code>,
              'sessionStorage',
              'Gom các thao tác trong cùng một lượt xem',
              'Hết hạn sau 30 phút không hoạt động',
            ],
            [
              <code key='e'>_ga</code>,
              'Cookie (Google)',
              'Google Analytics 4 — thống kê truy cập',
              'Theo chính sách của Google; chỉ đặt khi bạn đồng ý',
            ],
          ]}
        />
        <p>
          Bạn đổi ý lúc nào cũng được: xoá dữ liệu trang trong trình duyệt sẽ
          xoá lựa chọn đã lưu và thanh thông báo sẽ hỏi lại.
        </p>
      </Section>

      <Section n={5} title='Chúng tôi chia sẻ dữ liệu với ai'>
        <Bullets
          items={[
            <>
              <strong>Thương hiệu vận hành trang đích</strong> — nhận thông tin
              bạn để lại và báo cáo đo lường của trang họ. Đây là mục đích của
              việc bạn điền biểu mẫu.
            </>,
            <>
              <strong>Google</strong> (Firebase Authentication, Google Analytics
              4) — đăng nhập và thống kê truy cập.
            </>,
            <>
              <strong>Cloudflare</strong> — hạ tầng phân phối, chứng chỉ bảo mật
              cho tên miền riêng, và chống lạm dụng.
            </>,
            <>
              <strong>Nhà cung cấp lưu trữ tệp</strong> — ảnh và tệp tải lên
              được lưu trên dịch vụ lưu trữ đối tượng tương thích S3.
            </>,
            <>
              <strong>Nhà cung cấp mô hình ngôn ngữ</strong> — khi bạn dùng tính
              năng soạn nội dung bằng AI, nội dung liên quan (hồ sơ sản phẩm,
              nội dung trang) được gửi tới nhà cung cấp mô hình để tạo bản nháp.
              Chúng tôi không gửi thông tin liên hệ của khách truy cập cho họ.
            </>,
            <>
              <strong>Cơ quan nhà nước</strong> — khi có yêu cầu hợp pháp.
            </>,
          ]}
        />
        <p>
          Các nhà cung cấp trên vận hành máy chủ ở nhiều quốc gia, nên dữ liệu
          có thể được xử lý ngoài lãnh thổ Việt Nam.
        </p>
        <Todo>
          Danh sách bên xử lý và địa điểm lưu trữ cần rà lại theo hạ tầng thực
          tế đang chạy, và bổ sung hồ sơ đánh giá tác động chuyển dữ liệu ra
          nước ngoài theo Nghị định 13/2023/NĐ-CP nếu áp dụng.
        </Todo>
      </Section>

      <Section n={6} title='Chúng tôi giữ dữ liệu bao lâu'>
        <p>
          Dữ liệu tài khoản và nội dung bạn tạo được giữ trong suốt thời gian
          tài khoản còn hiệu lực. Thông tin liên hệ khách để lại được giữ để
          thương hiệu sử dụng cho mục đích đã nêu khi thu thập.
        </p>
        <Todo>
          Chưa chốt thời hạn lưu cụ thể cho từng loại dữ liệu (tài khoản đã
          đóng, lead, sự kiện đo lường, nhật ký bảo mật) và cơ chế xoá tự động.
          Đây là nội dung bắt buộc phải nêu rõ — cần quyết định về vận hành
          trước khi công bố bản chính thức.
        </Todo>
      </Section>

      <Section n={7} title='Bảo mật'>
        <p>
          Kết nối tới nền tảng và tới mọi trang đích đều qua HTTPS. Phiên đăng
          nhập dùng cookie ký số. Thông tin liên hệ của khách được tách khỏi kho
          dữ liệu phân tích và chỉ hiển thị cho tài khoản thuộc đúng thương hiệu
          sở hữu trang. Việc gửi biểu mẫu công khai có giới hạn tần suất và cơ
          chế chống tự động.
        </p>
        <p>
          Không hệ thống nào an toàn tuyệt đối. Nếu xảy ra sự cố ảnh hưởng tới
          dữ liệu cá nhân, chúng tôi sẽ thông báo cho bên liên quan và cơ quan
          có thẩm quyền theo quy định.
        </p>
      </Section>

      <Section n={8} title='Quyền của bạn'>
        <p>
          Theo Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân, bạn có quyền:
          được biết; đồng ý và rút lại sự đồng ý; truy cập và nhận bản sao;
          chỉnh sửa; xoá; hạn chế xử lý; phản đối xử lý; và khiếu nại, tố cáo,
          khởi kiện.
        </p>
        <p>
          Rút lại sự đồng ý không làm mất hiệu lực của việc xử lý đã thực hiện
          trước đó. Nếu yêu cầu của bạn liên quan tới thông tin đã để lại trên
          trang đích của một thương hiệu, xem lại mục 1 — thương hiệu đó là bên
          quyết định.
        </p>
      </Section>

      <Section n={9} title='Trẻ em'>
        <p>
          Nền tảng dành cho tổ chức và người từ 16 tuổi trở lên. Chúng tôi không
          chủ ý thu thập dữ liệu của trẻ em. Nếu phát hiện đã thu thập, chúng
          tôi sẽ xoá.
        </p>
      </Section>

      <Section n={10} title='Thay đổi chính sách'>
        <p>
          Khi cập nhật, chúng tôi đổi ngày hiệu lực ở đầu trang. Với thay đổi
          ảnh hưởng đáng kể tới quyền của bạn, chúng tôi sẽ thông báo qua email
          hoặc ngay trong portal trước khi áp dụng.
        </p>
      </Section>

      <Section n={11} title='Liên hệ'>
        <p>
          Email{' '}
          <a className='underline' href='mailto:info@rexerstudio.com'>
            info@rexerstudio.com
          </a>
          {' · '}
          Điện thoại{' '}
          <a className='underline' href='tel:+84939084212'>
            0939 084 212
          </a>
        </p>
        <Todo>
          Cần điền tên pháp nhân đầy đủ, mã số doanh nghiệp, địa chỉ trụ sở đăng
          ký và đầu mối phụ trách bảo vệ dữ liệu cá nhân. Bản này chưa nêu được
          những thông tin đó nên chưa dùng làm căn cứ pháp lý được.
        </Todo>
        <p className='text-sm text-[#8b95a8]'>
          Xem thêm{' '}
          <Link className='underline' href='/terms'>
            Điều khoản sử dụng
          </Link>
          .
        </p>
      </Section>
    </article>
  );
}
