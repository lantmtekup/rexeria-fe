// Trang giới thiệu dịch vụ — nối sau tour 3D (Phương án A: 3D là màn mở đầu ấn
// tượng, cuộn tiếp là trang giới thiệu bình thường). Nội dung dưới đây là DRAFT
// — thay tên công ty, dịch vụ, liên hệ thật trước khi lên production.
const SERVICES = [
  {
    eyebrow: 'Coding',
    title: 'Xây sản phẩm số',
    body: 'Từ website, ứng dụng web tới hệ thống nội bộ — code sạch, dễ mở rộng, bàn giao đúng hẹn. Trang bạn đang xem chính là một ví dụ.',
    points: ['Web app / Website', 'Tích hợp hệ thống', 'Bảo trì & nâng cấp'],
  },
  {
    eyebrow: 'Marketing',
    title: 'Tăng trưởng thương hiệu',
    body: 'Chiến lược nội dung, quảng cáo và đo lường hiệu quả thật — không chạy theo số ảo.',
    points: [
      'Chiến lược thương hiệu',
      'Quảng cáo đa kênh',
      'Đo lường & tối ưu',
    ],
  },
];

export default function Marketing() {
  return (
    <div className='relative z-10 bg-[#f6f1ec] text-neutral-900'>
      <section className='mx-auto max-w-3xl px-6 py-28 text-center sm:py-36'>
        <p className='text-[11px] font-medium tracking-[0.24em] text-neutral-400 uppercase'>
          [Draft — thay tên công ty]
        </p>
        <h1 className='mt-4 font-serif text-[clamp(32px,5vw,52px)] leading-tight font-light'>
          Tên công ty của bạn
        </h1>
        <p className='mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-neutral-600'>
          Chúng tôi làm coding và marketing — trải nghiệm 3D bạn vừa xem là minh
          chứng cho những gì đội ngũ có thể dựng được.
        </p>
      </section>

      <section className='mx-auto grid max-w-5xl gap-6 px-6 pb-24 sm:grid-cols-2'>
        {SERVICES.map(s => (
          <div
            key={s.eyebrow}
            className='rounded-2xl border border-neutral-200 bg-white p-8'
          >
            <span className='text-[10px] font-semibold tracking-[0.24em] text-neutral-400 uppercase'>
              {s.eyebrow}
            </span>
            <h3 className='mt-3 font-serif text-[22px] font-light'>
              {s.title}
            </h3>
            <p className='mt-3 text-[13.5px] leading-relaxed text-neutral-600'>
              {s.body}
            </p>
            <ul className='mt-5 space-y-1.5 text-[13px] text-neutral-500'>
              {s.points.map(p => (
                <li key={p} className='flex items-center gap-2'>
                  <span className='h-1 w-1 rounded-full bg-neutral-400' />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <footer className='border-t border-neutral-200 px-6 py-12 text-center'>
        <p className='text-[11px] tracking-[0.2em] text-neutral-400 uppercase'>
          Liên hệ
        </p>
        <p className='mt-2 text-[15px]'>[email@congty.com] · [0900 000 000]</p>
      </footer>
    </div>
  );
}
