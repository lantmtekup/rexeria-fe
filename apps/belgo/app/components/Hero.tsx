export default function Hero() {
  return (
    <section id='hero' className='relative h-[80vh] w-full overflow-hidden'>
      {/* Background video */}
      <video
        className='absolute inset-0 h-full w-full object-cover'
        src='/assets/videos/hero.mp4'
        autoPlay
        muted
        loop
        playsInline
        preload='auto'
      />

      {/* Subtle scrim for legibility */}
      <div className='absolute inset-0 bg-black/20' />

      {/* Overlay text */}
      <div className='relative z-10 flex h-full items-center justify-center px-6'>
        <h1
          className='text-center leading-[0.92] text-[#EDE6D6]'
          style={{ fontFamily: 'var(--font-bebas), sans-serif' }}
        >
          <span className='block text-[18vw] md:text-[12vw]'>BELGIAN</span>
          <span className='block text-[18vw] md:text-[12vw]'>CRAFT BEER</span>
        </h1>
      </div>
    </section>
  );
}
