import { useEffect, useRef, useState } from 'react';

const HERO_VIDEO = `${process.env.PUBLIC_URL}/herovideo.mp4`;

type PreloadMode = 'none' | 'metadata' | 'auto';

function getVideoLoadPlan(): { preload: PreloadMode; defer: boolean } {
  const conn = (navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
  }).connection;

  if (!conn) return { preload: 'auto', defer: false };
  if (conn.saveData) return { preload: 'none', defer: true };

  switch (conn.effectiveType) {
    case 'slow-2g':
    case '2g':
      return { preload: 'none', defer: true };
    case '3g':
      return { preload: 'metadata', defer: false };
    default:
      return { preload: 'auto', defer: false };
  }
}

function scheduleIdle(task: () => void) {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(task, { timeout: 3000 });
  } else {
    setTimeout(task, 150);
  }
}

export default function HeroBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const retriesRef = useRef(0);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [preload, setPreload] = useState<PreloadMode>('auto');
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const plan = getVideoLoadPlan();
    setPreload(plan.preload);

    const start = () => setVideoSrc(HERO_VIDEO);

    if (plan.defer) {
      const onReady = () => scheduleIdle(start);
      if (document.readyState === 'complete') {
        onReady();
      } else {
        window.addEventListener('load', onReady, { once: true });
      }
      return () => window.removeEventListener('load', onReady);
    }

    start();
  }, []);

  useEffect(() => {
    if (!videoSrc || videoFailed) return;

    const video = videoRef.current;
    if (!video) return;

    const onCanPlay = () => {
      setVideoReady(true);
      video.play().catch(() => {});
    };

    const onError = () => {
      if (retriesRef.current < 2) {
        retriesRef.current += 1;
        setTimeout(() => video.load(), 1500 * retriesRef.current);
        return;
      }
      setVideoFailed(true);
      setVideoReady(false);
    };

    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('error', onError);

    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      onCanPlay();
    }

    return () => {
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('error', onError);
    };
  }, [videoSrc, videoFailed]);

  return (
    <div className="hero-media" aria-hidden="true">
      {videoSrc && !videoFailed && (
        <video
          ref={videoRef}
          className={`hero-video${videoReady ? ' hero-video--visible' : ''}`}
          src={videoSrc}
          muted
          loop
          playsInline
          autoPlay
          preload={preload}
          disablePictureInPicture
          disableRemotePlayback
          controlsList="nodownload nofullscreen noremoteplayback"
          tabIndex={-1}
        />
      )}
      <span className="hero-media-shield" aria-hidden="true" />
    </div>
  );
}
