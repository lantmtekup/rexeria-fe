import type { Metadata } from 'next';
import Link from 'next/link';

import { Bullets, DocTitle, Section, Todo } from '../_doc';

/**
 * Điều khoản sử dụng.
 *
 * Viết theo đúng cách nền tảng vận hành, không phải mẫu chung:
 *  - khách hàng là Bên Kiểm soát dữ liệu khách truy cập, ReXeR là Bên Xử lý
 *  - hệ thống TỪ CHỐI submit thiếu `consent` khi trang khai điểm đo `identified`
 *    (BE `leadUsecase.submitCore`) — nên nghĩa vụ bật ô đồng ý là điều khoản
 *    thật, có cơ chế cưỡng chế, chứ không phải câu chữ cho đẹp
 *  - nội dung AI sinh ra là BẢN NHÁP phải duyệt (`AI viết bản nháp` trên trang
 *    sản phẩm), nên trách nhiệm kiểm chứng thuộc về khách hàng
 *  - mỗi lần phát hành là một bản chụp bất biến, quay lui được
 *
 * Mục thanh toán để `<Todo>`: repo chưa có bảng giá công khai (chỉ có enum
 * `plan: phase1_managed|phase2_selfserve`), nên bịa ra điều khoản tính tiền ở
 * đây là tạo ra nghĩa vụ không ai kiểm được.
 */

export const metadata: Metadata = {
  title: { absolute: 'Điều khoản sử dụng — ReXeR Studio' },
  description:
    'Điều kiện sử dụng nền tảng ReXeR Studio: tài khoản, nội dung, nghĩa vụ với dữ liệu khách truy cập, tính năng AI, và giới hạn trách nhiệm.',
  alternates: { canonical: '/terms' },
  robots: { index: true, follow: true },
};

const EFFECTIVE_DATE = '08/09/2026';

export default function TermsPage() {
  return (
    <article>
      <DocTitle
        title='Điều khoản sử dụng'
        updated={EFFECTIVE_DATE}
        intro={
          <p>
            Đây là thoả thuận giữa bạn (&ldquo;Khách hàng&rdquo;) và ReXeR
            Studio (&ldquo;ReXeR&rdquo;, &ldquo;chúng tôi&rdquo;) về việc sử
            dụng nền tảng dựng và đo lường trang đích tại{' '}
            <strong>portal.rexerstudio.com</strong> cùng các trang được xuất bản
            từ đó. Tạo tài khoản hoặc sử dụng dịch vụ nghĩa là bạn chấp nhận các
            điều khoản này.
          </p>
        }
      />

      <Section n={1} title='Một số cách gọi trong tài liệu'>
        <Bullets
          items={[
            <>
              <strong>Nền tảng</strong> — portal, trình dựng trang, phần đo
              lường và các trang công khai được xuất bản từ đó.
            </>,
            <>
              <strong>Nội dung của bạn</strong> — chữ, hình ảnh, video, dữ liệu
              sản phẩm, logo và mọi thứ bạn tải lên hoặc tạo ra trên Nền tảng.
            </>,
            <>
              <strong>Khách truy cập</strong> — người xem trang đích do bạn xuất
              bản.
            </>,
            <>
              <strong>Thông tin khách để lại</strong> — dữ liệu Khách truy cập
              điền vào biểu mẫu trên trang của bạn.
            </>,
          ]}
        />
      </Section>

      <Section n={2} title='Tài khoản'>
        <p>
          Bạn chịu trách nhiệm về tính chính xác của thông tin đăng ký, về việc
          giữ an toàn thông tin đăng nhập, và về mọi hoạt động diễn ra dưới tài
          khoản của mình. Báo cho chúng tôi ngay khi nghi ngờ tài khoản bị truy
          cập trái phép.
        </p>
        <p>
          Tài khoản dành cho tổ chức và người từ 16 tuổi trở lên. Bạn không được
          chia sẻ tài khoản cho người ngoài tổ chức của mình.
        </p>
      </Section>

      <Section n={3} title='Nội dung của bạn thuộc về bạn'>
        <p>
          Bạn giữ toàn bộ quyền sở hữu đối với Nội dung của bạn. Bạn cấp cho
          chúng tôi quyền sử dụng có giới hạn — lưu trữ, sao chép, hiển thị và
          phân phối — chỉ nhằm vận hành Nền tảng và cung cấp dịch vụ cho chính
          bạn. Quyền này chấm dứt khi bạn xoá nội dung hoặc đóng tài khoản, trừ
          các bản sao lưu kỹ thuật sẽ hết hạn theo chu kỳ thông thường.
        </p>
        <p>
          Bạn cam kết có đủ quyền đối với những gì mình đăng tải: hình ảnh,
          phông chữ, nhãn hiệu, nội dung mua hoặc thuê. Chúng tôi không thẩm
          định trước nội dung của bạn.
        </p>
        <p>
          Mỗi lần phát hành tạo ra một bản chụp riêng của trang, nên bạn có thể
          quay về bản trước đó. Đây là tiện ích vận hành, không phải dịch vụ sao
          lưu — hãy tự giữ bản gốc của tư liệu quan trọng.
        </p>
      </Section>

      <Section n={4} title='Dữ liệu Khách truy cập — phần quan trọng nhất'>
        <p>
          Với dữ liệu của Khách truy cập trên trang bạn xuất bản,{' '}
          <strong>bạn là Bên Kiểm soát dữ liệu</strong> và{' '}
          <strong>ReXeR là Bên Xử lý</strong>. Chúng tôi xử lý theo chỉ dẫn của
          bạn, không dùng dữ liệu đó cho mục đích riêng và không chuyển cho
          khách hàng khác.
        </p>
        <p>Bạn có nghĩa vụ:</p>
        <Bullets
          items={[
            <>
              Có cơ sở pháp lý hợp lệ để thu thập và sử dụng dữ liệu — thường là
              sự đồng ý của Khách truy cập.
            </>,
            <>
              <strong>Bật ô đồng ý</strong> trên biểu mẫu khi trang của bạn thu
              thập thông tin định danh. Đây không phải khuyến nghị: Nền tảng{' '}
              <strong>từ chối</strong> lượt gửi biểu mẫu không kèm xác nhận đồng
              ý khi trang đã khai điểm đo ở mức định danh — biểu mẫu sẽ báo lỗi
              cho người điền chứ không âm thầm nhận.
            </>,
            <>
              Nêu rõ với Khách truy cập bạn là ai, thu thập để làm gì, và công
              bố chính sách quyền riêng tư của chính bạn.
            </>,
            <>
              Xử lý yêu cầu của Khách truy cập về dữ liệu của họ (truy cập,
              chỉnh sửa, xoá, rút lại đồng ý). Chúng tôi hỗ trợ bạn thực hiện
              trong phạm vi kỹ thuật.
            </>,
            <>
              Chỉ liên hệ Khách truy cập trong phạm vi họ đã đồng ý. Không dùng
              thông tin thu được để gửi tin nhắn, thư quảng cáo hàng loạt ngoài
              phạm vi đó.
            </>,
          ]}
        />
      </Section>

      <Section n={5} title='Những việc không được làm'>
        <Bullets
          items={[
            <>
              Đăng nội dung vi phạm pháp luật, xâm phạm quyền của người khác,
              hoặc gây hiểu nhầm về nguồn gốc — <strong>mạo danh</strong> tổ
              chức, cá nhân, cơ quan nhà nước; dựng trang giả mạo thương hiệu
              bạn không được uỷ quyền.
            </>,
            <>
              Thu thập thông tin đăng nhập, thông tin thanh toán hoặc dữ liệu
              nhạy cảm dưới danh nghĩa của một bên khác.
            </>,
            <>
              Công bố thông tin sai lệch về sản phẩm — đặc biệt các khẳng định
              về tình trạng pháp lý, giấy tờ, giấy phép hoặc cam kết lợi nhuận
              mà bạn không chứng minh được.
            </>,
            <>
              Tấn công, dò quét, làm quá tải hạ tầng, hoặc gửi dữ liệu tự động
              vào các đường thu thập công khai.
            </>,
            <>
              Bán lại quyền truy cập Nền tảng cho bên thứ ba nếu không có thoả
              thuận riêng bằng văn bản với chúng tôi.
            </>,
          ]}
        />
        <p>
          Chúng tôi có thể gỡ nội dung hoặc tạm ngừng tài khoản vi phạm. Với vi
          phạm không nghiêm trọng, chúng tôi sẽ báo trước và cho thời gian khắc
          phục khi hoàn cảnh cho phép.
        </p>
      </Section>

      <Section n={6} title='Tên miền riêng'>
        <p>
          Khi bạn kết nối tên miền của mình, bạn khẳng định mình có quyền sử
          dụng tên miền đó. Bạn tự chịu chi phí và trách nhiệm gia hạn với nhà
          đăng ký. Chứng chỉ bảo mật được cấp tự động qua hạ tầng đối tác; chúng
          tôi không bảo đảm việc cấp phát luôn thành công khi cấu hình DNS phía
          bạn chưa đúng.
        </p>
      </Section>

      <Section n={7} title='Tính năng AI'>
        <p>
          Nền tảng có thể tạo <strong>bản nháp</strong> nội dung từ hồ sơ sản
          phẩm của bạn. Nội dung do AI tạo ra{' '}
          <strong>chỉ là điểm khởi đầu, không phải bản hoàn chỉnh</strong>: nó
          có thể sai, lỗi thời, hoặc trùng lặp với nội dung khác. Bạn có trách
          nhiệm đọc, sửa và duyệt trước khi xuất bản, và bạn chịu trách nhiệm về
          nội dung đã xuất bản như với mọi nội dung khác bạn tự viết.
        </p>
        <p>
          <strong>Tuyệt đối không</strong> dùng nội dung AI chưa kiểm chứng cho
          các khẳng định về pháp lý, y tế, tài chính, hoặc tình trạng giấy tờ
          của một tài sản. Những nội dung đó phải do người có thẩm quyền của bạn
          xác nhận.
        </p>
        <p>
          Khi bạn dùng tính năng này, nội dung liên quan được gửi tới nhà cung
          cấp mô hình ngôn ngữ để xử lý — xem{' '}
          <Link className='underline' href='/privacy'>
            Chính sách quyền riêng tư
          </Link>
          , mục 5.
        </p>
      </Section>

      <Section n={8} title='Gói dịch vụ và thanh toán'>
        <Todo>
          Chưa có bảng giá công khai nên mục này chưa nêu được điều kiện thanh
          toán, chu kỳ, chính sách hoàn tiền, thuế và hậu quả của việc chậm
          thanh toán. Trong thời gian đó, điều kiện thương mại áp dụng theo thoả
          thuận riêng bằng văn bản giữa hai bên. Cần bổ sung trước khi mở đăng
          ký tự phục vụ.
        </Todo>
      </Section>

      <Section n={9} title='Tạm ngừng và chấm dứt'>
        <p>
          Bạn có thể ngừng sử dụng và yêu cầu đóng tài khoản bất cứ lúc nào.
          Trước khi đóng, hãy tải về nội dung bạn cần giữ.
        </p>
        <p>
          Chúng tôi có thể tạm ngừng hoặc chấm dứt quyền truy cập khi bạn vi
          phạm nghiêm trọng các điều khoản này, khi có yêu cầu của cơ quan nhà
          nước, hoặc khi cần thiết để bảo vệ Nền tảng và người dùng khác. Sau
          khi chấm dứt, trang đã xuất bản sẽ ngừng phục vụ.
        </p>
      </Section>

      <Section n={10} title='Mức độ sẵn sàng của dịch vụ'>
        <p>
          Chúng tôi cố gắng duy trì Nền tảng hoạt động liên tục nhưng không cam
          kết một tỉ lệ thời gian hoạt động cụ thể, trừ khi có thoả thuận mức
          dịch vụ riêng bằng văn bản. Có thể có gián đoạn do bảo trì, nâng cấp
          hoặc sự cố của nhà cung cấp hạ tầng.
        </p>
        <p>
          Dịch vụ được cung cấp &ldquo;như hiện có&rdquo;. Trong phạm vi pháp
          luật cho phép, chúng tôi không bảo đảm rằng Nền tảng sẽ đáp ứng mọi
          mục đích riêng của bạn hoặc không có lỗi.
        </p>
      </Section>

      <Section n={11} title='Giới hạn trách nhiệm'>
        <p>
          Trong phạm vi pháp luật cho phép, chúng tôi không chịu trách nhiệm về
          thiệt hại gián tiếp, mất lợi nhuận, mất cơ hội kinh doanh hoặc mất dữ
          liệu phát sinh từ việc sử dụng Nền tảng.
        </p>
        <Todo>
          Cần chốt mức trần trách nhiệm (thông lệ: tổng phí đã thanh toán trong
          12 tháng liền trước) sau khi có điều kiện thương mại ở mục 8.
        </Todo>
        <p>
          Không điều khoản nào ở đây loại trừ trách nhiệm mà pháp luật không cho
          phép loại trừ.
        </p>
      </Section>

      <Section n={12} title='Bồi hoàn'>
        <p>
          Bạn đồng ý bồi hoàn cho chúng tôi các khiếu nại của bên thứ ba phát
          sinh từ Nội dung của bạn, từ cách bạn thu thập và sử dụng dữ liệu
          Khách truy cập, hoặc từ việc bạn vi phạm các điều khoản này.
        </p>
      </Section>

      <Section n={13} title='Thay đổi điều khoản'>
        <p>
          Chúng tôi có thể cập nhật tài liệu này và sẽ đổi ngày hiệu lực ở đầu
          trang. Với thay đổi làm giảm quyền của bạn một cách đáng kể, chúng tôi
          sẽ thông báo trước qua email hoặc trong portal. Tiếp tục sử dụng sau
          khi thay đổi có hiệu lực nghĩa là bạn chấp nhận bản mới.
        </p>
      </Section>

      <Section n={14} title='Luật áp dụng và giải quyết tranh chấp'>
        <p>
          Các điều khoản này được điều chỉnh bởi pháp luật Việt Nam. Hai bên ưu
          tiên thương lượng; nếu không đạt được thoả thuận trong 30 ngày, tranh
          chấp được đưa ra toà án có thẩm quyền tại Việt Nam.
        </p>
        <Todo>
          Cần chốt toà án/trọng tài cụ thể theo địa chỉ trụ sở pháp nhân, cùng
          tên pháp nhân và mã số doanh nghiệp — xem mục 11 của Chính sách quyền
          riêng tư.
        </Todo>
      </Section>

      <Section n={15} title='Liên hệ'>
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
      </Section>
    </article>
  );
}
