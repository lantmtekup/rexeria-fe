import { MotionSection } from '@/components/motion-section';

export default function Page() {
  return (
    <main>
      <MotionSection
        preset="scale-in"
        className="relative flex h-screen items-center justify-center"
      >
        <h1 className="text-7xl font-light tracking-tight">
          Framer Clone Starter
        </h1>
      </MotionSection>

      <MotionSection
        preset="fade-up"
        stagger={0.08}
        className="mx-auto max-w-5xl px-6 py-48"
      >
        <p className="max-w-prose text-lg leading-relaxed text-neutral-600">
          Replace this with the sections you extracted from the source site.
          Use <code className="font-mono text-sm">MotionSection</code> for
          scroll-reveals; drop to <code className="font-mono text-sm">motion.div</code>
          with explicit <code className="font-mono text-sm">initial</code>/
          <code className="font-mono text-sm">animate</code>/
          <code className="font-mono text-sm">transition</code> when you have a
          specific config from <code className="font-mono text-sm">animations.json</code>.
        </p>
      </MotionSection>
    </main>
  );
}
