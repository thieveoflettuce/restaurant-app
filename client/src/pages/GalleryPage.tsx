import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const PHOTOS = [1, 2, 3, 4, 5, 6];
const VIDEOS = [1, 2];

export default function GalleryPage() {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  return (
    <div className="app">
      <header className="header">
        <nav className="nav">
          <div className="nav-left" />
          <button className="logo" onClick={() => navigate('/')}>Прованс</button>
          <div className="nav-right" />
        </nav>
      </header>

      <section className="gallery gallery-page">
        <h2 className="section-title">Галерея</h2>

        <div className="gallery-grid">
          {PHOTOS.map(i => (
            <div key={`photo-${i}`} className="gallery-item" onClick={() => setSelectedImage(i)}>
              <img src={`${process.env.PUBLIC_URL}/interior${i}.jpg`} alt={`Интерьер ${i}`} className="gallery-img" />
            </div>
          ))}
          {VIDEOS.map(i => (
            <div key={`video-${i}`} className="gallery-item gallery-item--video">
              <video
                src={`${process.env.PUBLIC_URL}/gallery${i}.mp4`}
                className="gallery-img"
                controls
                muted
                playsInline
              />
            </div>
          ))}
        </div>
      </section>

      {selectedImage && (
        <div className="modal-overlay" onMouseDown={() => setSelectedImage(null)}>
          <div className="modal-content image-modal" onMouseDown={e => e.stopPropagation()}>
            <img
              src={`/interior${selectedImage}.jpg`}
              alt={`Прованс фото ${selectedImage}`}
              className="modal-image"
            />
            <button className="modal-close" onClick={() => setSelectedImage(null)}>×</button>
          </div>
        </div>
      )}
    </div>
  );
}
