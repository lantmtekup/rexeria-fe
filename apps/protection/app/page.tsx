'use client';

import { useState } from 'react';

import { AwardBadge } from '../components/AwardBadge';
import { CursorBalls } from '../components/CursorBalls';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { HeroScrollytelling } from '../components/HeroScrollytelling';
import { IntroVideo } from '../components/IntroVideo';
import { Preloader } from '../components/Preloader';

/**
 * Home — chuỗi intro mirror gốc:
 *   Preloader (bóng vàng + %) -> dispatch preloaderEndedMmr -> IntroVideo chạy
 *   1 lần -> reveal hero scrollytelling (canvas 240 frame pin).
 */
export default function Home() {
  const [introReady, setIntroReady] = useState(false);

  return (
    <main className='relative'>
      <Preloader onDone={() => setIntroReady(true)} />
      <IntroVideo play={introReady} />

      <CursorBalls />
      <Header />
      <AwardBadge />

      <HeroScrollytelling />

      {/* Nội dung sau khi unpin — footer + spacer để scroll thoát pin mượt */}
      <Footer />
    </main>
  );
}
