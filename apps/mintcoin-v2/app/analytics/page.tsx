'use client';

import { useEffect, useState } from 'react';
import LandingSections from '../components/LandingSections';
import AnalyticsLogin from '../components/analytics/AnalyticsLogin';
import AnalyticsOverlay from '../components/analytics/AnalyticsOverlay';
import { ANALYTICS_AUTH_KEY } from '../components/analytics/analytics-data';

export default function AnalyticsPage() {
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);

  // Restore session on mount (refresh keeps you logged in).
  useEffect(() => {
    setAuthed(sessionStorage.getItem(ANALYTICS_AUTH_KEY) === '1');
    setReady(true);
  }, []);

  const handleSuccess = () => {
    sessionStorage.setItem(ANALYTICS_AUTH_KEY, '1');
    setAuthed(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ANALYTICS_AUTH_KEY);
    setAuthed(false);
  };

  // Avoid SSR/CSR flash before sessionStorage is read.
  if (!ready) return null;

  if (!authed) return <AnalyticsLogin onSuccess={handleSuccess} />;

  return (
    <>
      <LandingSections />
      <AnalyticsOverlay onLogout={handleLogout} />
    </>
  );
}
