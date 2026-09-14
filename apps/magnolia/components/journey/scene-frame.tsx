/**
 * Khung của cảnh — khoá theo MÀN, không theo canvas. Không đặt được thành một
 * lớp của chương: lớp đi theo camera nên nó sẽ trôi ngang cùng cảnh.
 *
 * Dùng ĐÚNG `bg-panel-scrim` của trang — cùng cái gradient mà
 * `panel-background.tsx` đặt lên mọi panel ảnh khác:
 *   linear-gradient(0deg, rgba(11,9,8,.88) 0, rgba(11,9,8,.35) 45%, rgba(11,9,8,.15))
 *
 * Trước đó tôi tự làm một vignette đối xứng bốn góc cộng một lớp warm-wash.
 * Nó sai hệ: ảnh bị đóng khung thành "một bức ảnh trong khung đen", còn mọi
 * panel khác của trang thì TAN DẦN xuống nền than ở đáy. Dồn về đáy mới đúng,
 * và nó cũng làm nhịp sáng-tối của cả trang liền lại: đỉnh chương sáng nối
 * vào section sáng phía trên, đáy chương tan vào khối nội dung nền than phía
 * dưới.
 *
 * Dải trên chỉ để che mép 26 px mà camera luôn cắt (S = vh × 1.05 / 1080),
 * nên mỏng và nhạt.
 */
export function SceneFrame() {
  return (
    <div aria-hidden className='pointer-events-none absolute inset-0'>
      <div className='bg-panel-scrim absolute inset-0' />
      <div
        className='absolute inset-x-0 top-0 h-[9svh]'
        style={{
          background:
            'linear-gradient(to bottom, rgba(11,9,8,0.72) 0%, rgba(11,9,8,0.22) 55%, rgba(11,9,8,0) 100%)',
        }}
      />
    </div>
  );
}
