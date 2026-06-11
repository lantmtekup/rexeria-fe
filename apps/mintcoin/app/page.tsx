import LandingContent from './components/LandingContent';
import AnalyticsTracker from './components/analytics/AnalyticsTracker';

export default function Home() {
  return (
    <>
      <LandingContent />
      {/* Public-visit tracking → ReXeR /v1/track. Not mounted on /analytics. */}
      <AnalyticsTracker />
    </>
  );
}
