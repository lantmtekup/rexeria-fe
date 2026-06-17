import React from 'react';
import { createRoot } from 'react-dom/client';
import AesthaDemoPage from './AesthaDemoPage';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AesthaDemoPage />
  </React.StrictMode>
);
