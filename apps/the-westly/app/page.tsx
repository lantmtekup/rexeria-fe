import Hero from './components/Hero';
import ProductShowcase from './components/ProductShowcase';
import SceneParallax from './components/SceneParallax';
import SceneReveal from './components/SceneReveal';
import ProductReveal from './components/ProductReveal';
import FinalResidences from './components/FinalResidences';
import Footer from './components/Footer';
import CustomPointer, { type CursorTarget } from './components/CustomPointer';

const VIEW_TOGGLE: Omit<CursorTarget, 'id'> = {
  action: 'view',
  label: 'VIEW',
  actionPressed: 'hide',
  labelPressed: 'BACK',
};

const CURSOR_TARGETS: CursorTarget[] = [
  { id: 'showcase-stack', ...VIEW_TOGGLE },
  { id: 'reveal-stack', ...VIEW_TOGGLE },
  { id: 'scene-parallax', ...VIEW_TOGGLE },
  { id: 'scene-reveal', ...VIEW_TOGGLE },
];

export default function Page() {
  return (
    <main className='relative bg-[#F3F1EA]'>
      <CustomPointer targets={CURSOR_TARGETS} />

      {/* Ba tầng ghim chồng lên nhau, mỗi tầng đứng yên cho tầng sau trườn lên
          che: Hero ← ProductShowcase ← SceneParallax. Muốn một section được
          "trườn lên trên" thì nó phải nằm TRONG wrapper của section bị che —
          sticky không ra khỏi phần tử cha được. `isolate` giữ z-index của cụm
          này ở trong nhà, khỏi đọ với hai cụm dưới. */}
      <div className='relative isolate'>
        <Hero />
        <ProductShowcase />
        {/* Quãng scroll ProductShowcase đứng yên trước khi bị che (nó sticky từ
            lg). Chỉ có ở lg — dưới đó section cao theo nội dung nên không ghim,
            thêm spacer vào chỉ tạo ra một khoảng trống. */}
        <div aria-hidden data-dwell className='hidden lg:block lg:h-screen' />

        {/* z-20 để cụm này trườn lên trên ProductShowcase (z-10) đang ghim.
            id='scene' là mốc ProductShowcase bám để chạy veil bàn giao — wrapper
            nằm trong luồng, khác với section bên trong (sticky, đo không ra). */}
        <div id='scene' className='relative z-20'>
          <SceneParallax />
          <div aria-hidden data-dwell className='h-[60svh] md:h-svh' />
          <FinalResidences />

          {/* Lại một tầng nữa: trườn lên trên FinalResidences đang ghim. */}
          <div id='reveal' className='relative z-20'>
            <SceneReveal />
            <div aria-hidden data-dwell className='h-[60svh] md:h-svh' />
            <ProductReveal />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
