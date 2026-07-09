import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import provansCroppedLogo from '../img/provans-cropped.png';
import { GALLERY_PHOTOS, GALLERY_VIDEOS, galleryPhotoUrl, galleryVideoUrl } from '../galleryMedia';

export default function GalleryPage() {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="app">
      <header className="header">
        <div className="nav-left">
          <button className="nav-btn nav-btn--disabled" disabled>Галерея</button>
        </div>
        <button className="logo logo--visible" onClick={() => navigate('/')} aria-label="На главную">
          <img src={provansCroppedLogo} alt="Прованс" className="logo-image" />
        </button>
        <div className="nav-right">
          <button className="nav-btn" onClick={() => navigate('/', { state: { scrollTo: 'contacts' } })}>Контакты</button>
          <button className="burger" onClick={() => setIsMenuOpen(!isMenuOpen)}>☰</button>
        </div>
      </header>

      {isMenuOpen && (
        <div className="mobile-menu">
          <button className="mobile-menu-btn" onClick={() => navigate('/')}>Главная</button>
          <button className="mobile-menu-btn" style={{ opacity: 0.4 }} disabled>Галерея</button>
          <button className="mobile-menu-btn" onClick={() => navigate('/', { state: { scrollTo: 'contacts' } })}>Контакты</button>
        </div>
      )}

      <section className="gallery gallery-page">
        <h2 className="section-title">Галерея</h2>

        {GALLERY_PHOTOS.length === 0 && GALLERY_VIDEOS.length === 0 ? (
          <p className="gallery-empty">Фотографии скоро появятся</p>
        ) : (
          <div className="gallery-grid">
            {GALLERY_PHOTOS.map(filename => (
              <div key={`photo-${filename}`} className="gallery-item" onClick={() => setSelectedImage(filename)}>
                <img src={galleryPhotoUrl(filename)} alt="Интерьер Прованс" className="gallery-img" />
              </div>
            ))}
            {GALLERY_VIDEOS.map(filename => (
              <div key={`video-${filename}`} className="gallery-item gallery-item--video">
                <video
                  src={galleryVideoUrl(filename)}
                  className="gallery-img"
                  muted
                  loop
                  playsInline
                  autoPlay
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedImage && (
        <div className="modal-overlay" onMouseDown={() => setSelectedImage(null)}>
          <div className="modal-content image-modal" onMouseDown={e => e.stopPropagation()}>
            <img src={galleryPhotoUrl(selectedImage)} alt="Прованс" className="modal-image" />
            <button className="modal-close" onClick={() => setSelectedImage(null)}>×</button>
          </div>
        </div>
      )}
    </div>
  );
}
