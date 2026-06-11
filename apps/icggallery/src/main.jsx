import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import SplatTour from './SplatTour.jsx';
import './index.css';

// /splat → Gaussian Splatting POC (Option C); otherwise the glTF gallery.
const Root = window.location.pathname.startsWith('/splat') ? SplatTour : App;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
