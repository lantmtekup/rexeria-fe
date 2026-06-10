import type { Metadata } from 'next';
import Link from 'next/link';

import { Button } from '@/components/atoms/button';

export const metadata: Metadata = {
  title: 'Về chúng tôi — Rexer',
  description:
    'Câu chuyện, sứ mệnh và giá trị của Rexer — nền tảng xây dựng thương hiệu bằng AI.',
};

const VALUES = [
  {
    title: 'Khách hàng là trọng tâm',
    desc: 'Mọi tính năng được xây dựng để giải quyết vấn đề thực tế của thương hiệu.',
  },
  {
    title: 'Đơn giản hoá sự phức tạp',
    desc: 'Công nghệ mạnh mẽ nhưng trải nghiệm phải dễ dùng cho tất cả mọi người.',
  },
  {
    title: 'Đổi mới không ngừng',
    desc: 'Chúng tôi liên tục ứng dụng AI để mang lại giá trị mới mỗi ngày.',
  },
];

export default function AboutPage() {
  return (
    <>
      <section className='border-b border-neutral-200 bg-neutral-50'>
        <div className='mx-auto max-w-3xl px-6 py-20 text-center'>
          <h1 className='text-4xl font-semibold tracking-tight sm:text-5xl'>
            Chúng tôi giúp thương hiệu toả sáng
          </h1>
          <p className='mt-6 text-lg text-neutral-600'>
            Rexer ra đời với niềm tin rằng mọi thương hiệu — dù lớn hay nhỏ —
            đều xứng đáng có công cụ chuyên nghiệp để kể câu chuyện của mình.
          </p>
        </div>
      </section>

      <section className='mx-auto max-w-3xl px-6 py-16'>
        <h2 className='text-2xl font-semibold'>Sứ mệnh của chúng tôi</h2>
        <p className='mt-4 leading-relaxed text-neutral-600'>
          Chúng tôi xây dựng một nền tảng nơi việc tạo trang giới thiệu, quản lý
          sản phẩm và triển khai marketing trở nên nhanh chóng và trực quan.
          Bằng cách kết hợp thiết kế đẹp với sức mạnh của AI, Rexer giúp đội ngũ
          của bạn tập trung vào điều quan trọng nhất: phát triển kinh doanh.
        </p>
      </section>

      <section className='border-t border-neutral-200 bg-neutral-50'>
        <div className='mx-auto max-w-6xl px-6 py-16'>
          <h2 className='text-center text-2xl font-semibold'>
            Giá trị cốt lõi
          </h2>
          <div className='mt-10 grid gap-6 md:grid-cols-3'>
            {VALUES.map(v => (
              <div
                key={v.title}
                className='rounded-2xl border border-neutral-200 bg-white p-6'
              >
                <h3 className='font-semibold text-neutral-900'>{v.title}</h3>
                <p className='mt-2 text-sm text-neutral-600'>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className='mx-auto max-w-3xl px-6 py-20 text-center'>
        <h2 className='text-3xl font-semibold tracking-tight'>
          Cùng xây dựng tương lai thương hiệu
        </h2>
        <Button asChild variant='pill' size='lg' className='mt-8'>
          <Link href='/rexer/lien-he'>Liên hệ với chúng tôi</Link>
        </Button>
      </section>
    </>
  );
}
