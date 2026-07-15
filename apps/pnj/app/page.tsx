import LandingContent from './components/LandingContent';
import AnalyticsTracker from './components/analytics/AnalyticsTracker';

// Landing is fully client-driven (gsap/ScrollTrigger/Swiper). Skip static
// prerender (it renders per-request on the worker anyway) so the build's SSG
// pass doesn't choke evaluating browser-only deps.
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <>
      <LandingContent />
      {/* Public-visit tracking → ReXeR /v1/track. Not mounted on /analytics. */}
      <AnalyticsTracker />
    </>
  );
}
