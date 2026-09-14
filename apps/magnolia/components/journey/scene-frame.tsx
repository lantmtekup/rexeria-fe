/**
 * Khung của cảnh — khoá theo MÀN, không theo canvas.
 *
 * Không đặt được thành một lớp của chương: lớp đi theo camera nên vignette sẽ
 * trôi ngang cùng cảnh, còn vignette thì phải đứng yên ở khung nhìn.
 *
 * Ba việc, tất cả bằng CSS nên không tốn asset:
 *   1. dải tối trên/dưới — seat cảnh vào nền than, và che mép 26 px mà camera
 *      luôn cắt (S = vh × 1.05 / 1080) nên không bao giờ lộ đường cắt cứng;
 *   2. vignette bốn góc — dồn mắt vào giữa khung, đúng cách một cú lia phim
 *      được grade;
 *   3. warm-wash rất nhạt — xích các render lệch tông lại gần nhau.
 */
export function SceneFrame() {
  return (
    <div aria-hidden className='pointer-events-none absolute inset-0'>
      <div
        className='absolute inset-0'
        style={{
          background:
            'radial-gradient(118% 88% at 50% 46%, rgba(11,9,8,0) 42%, rgba(11,9,8,0.30) 78%, rgba(11,9,8,0.72) 100%)',
        }}
      />
      <div
        className='absolute inset-x-0 top-0 h-[16svh]'
        style={{
          background:
            'linear-gradient(to bottom, #0b0908 0%, rgba(11,9,8,0.55) 45%, rgba(11,9,8,0) 100%)',
        }}
      />
      <div
        className='absolute inset-x-0 bottom-0 h-[18svh]'
        style={{
          background:
            'linear-gradient(to top, #0b0908 0%, rgba(11,9,8,0.60) 42%, rgba(11,9,8,0) 100%)',
        }}
      />
      <div
        className='absolute inset-0 mix-blend-soft-light'
        style={{ background: 'rgba(169,102,29,0.14)' }}
      />
    </div>
  );
}
