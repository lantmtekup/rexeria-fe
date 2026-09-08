import * as React from 'react';

/**
 * Vài mảnh dựng sẵn cho trang pháp lý — để hai trang chỉ còn nội dung.
 *
 * Đánh số mục là CÓ NGHĨA ở đây chứ không phải trang trí: khi có tranh chấp,
 * người ta trích dẫn "mục 7.2", nên số phải ổn định và hiện ra được.
 */

export function DocTitle({
  title,
  updated,
  intro,
}: {
  title: string;
  /** Ngày hiệu lực, dạng tuyệt đối. Không bao giờ "cập nhật gần đây". */
  updated: string;
  intro: React.ReactNode;
}) {
  return (
    <header className='mb-10'>
      <h1 className='text-3xl font-semibold tracking-tight'>{title}</h1>
      <p className='mt-2 text-xs tracking-wide text-[#8b95a8] uppercase'>
        Hiệu lực từ {updated}
      </p>
      <div className='mt-5 text-[15px] leading-relaxed text-[#3d4657]'>
        {intro}
      </div>
    </header>
  );
}

export function Section({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={`muc-${n}`}
      className='scroll-mt-20 border-t border-[#e2e7f0] py-7'
    >
      <h2 className='text-lg font-semibold'>
        <span className='mr-2 text-[#8b95a8] tabular-nums'>{n}.</span>
        {title}
      </h2>
      <div className='mt-3 flex flex-col gap-3 text-[15px] leading-relaxed text-[#3d4657]'>
        {children}
      </div>
    </section>
  );
}

/** Danh sách gạch đầu dòng — dùng chung để hai trang không lệch khoảng cách. */
export function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className='flex list-disc flex-col gap-2 pl-5 marker:text-[#8b95a8]'>
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}

/**
 * Bảng — bọc trong khung cuộn ngang riêng, không để cả trang trôi ngang trên
 * điện thoại.
 */
export function Table({
  head,
  rows,
}: {
  head: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className='overflow-x-auto rounded-lg border border-[#e2e7f0] bg-white'>
      <table className='w-full border-collapse text-sm'>
        <thead>
          <tr>
            {head.map(h => (
              <th
                key={h}
                className='border-b border-[#e2e7f0] bg-[#f5f7fb] px-3 py-2 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-[#8b95a8] uppercase'
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td
                  key={j}
                  className='border-b border-[#e2e7f0] px-3 py-2.5 align-top text-[#3d4657] last:border-r-0'
                >
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Chỗ CHƯA CÓ DỮ KIỆN THẬT, hiện rõ trên màn hình.
 *
 * Cố ý chói mắt. Một chính sách quyền riêng tư có ô trống mà nhìn như đã xong
 * là thứ nguy hiểm hơn hẳn một ô trống nhìn ra ngay: nó được đem đi trích dẫn,
 * được gửi cho khách doanh nghiệp, rồi mới có người phát hiện thiếu.
 */
export function Todo({ children }: { children: React.ReactNode }) {
  return (
    <p className='rounded-lg border border-dashed border-[#e0a800] bg-[#fff8e5] px-3 py-2 text-sm text-[#7a5c00]'>
      <strong className='font-semibold'>Cần bổ sung — </strong>
      {children}
    </p>
  );
}
