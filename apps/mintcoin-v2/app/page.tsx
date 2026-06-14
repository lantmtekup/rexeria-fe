import LandingSections from './components/LandingSections';
import AnalyticsTracker from './components/analytics/AnalyticsTracker';

// Kunai-cloned scaffold for Jack Pine 1 kilo gold coin advertising.
// Sections: Emblem (top) · Manifesto · Works · Services · Process · CTA.
// The original Hero banner is hidden (Emblem now leads the page).
export default function Home() {
  return (
    <>
      <LandingSections />
      {/* Public-visit tracking → ReXeR /v1/track. Not mounted on /analytics. */}
      <AnalyticsTracker />
    </>
  );
}
