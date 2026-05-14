import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import GalleryPage from './pages/GalleryPage';
import EventPromoPage from './pages/EventPromoPage';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProvansPreloader from './components/ProvansPreloader';
import { STROKE_PATHS } from './strokes-array';
import logoSrc from './img/provans-cropped.png';
import whiteLogoCropped from './img/white-logo-cropped.png';

function RootShell() {
  const [siteReady, setSiteReady] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (document.readyState === 'complete') {
      setSiteReady(true);
      return;
    }
    const onLoad = () => setSiteReady(true);
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  return (
    <>
      {!hidden && (
        <ProvansPreloader
          siteReady={siteReady}
          onFinished={() => setHidden(true)}
          duration={2800}
          strokeWidth={130}
          minDisplay={3000}
          strokePaths={STROKE_PATHS}
          background="cream"
          logoSrc={logoSrc}
          morphLogoSrc={whiteLogoCropped}
          morphTargetSelector=".hero-title-image"
          morphDuration={900}
        />
      )}
      <BrowserRouter
        basename={(process.env.PUBLIC_URL || '').replace(/\/+$/, '') || '/'}
      >
        <AuthProvider>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/events/:slug" element={<EventPromoPage />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <RootShell />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
