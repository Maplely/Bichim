import { FaTimes, FaDownload, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { B } from './constants.js';

export default function LightboxModal({ images, currentIndex, M, onClose, onPrev, onNext }) {
  if (!images || currentIndex === null) return null;
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 99999, cursor: 'pointer',
    }}>
      {images.length > 1 && (
        <button onClick={e => { e.stopPropagation(); onPrev?.(); }} style={{ ...B, position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: '#fff', padding: 12, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FaArrowLeft size={18} />
        </button>
      )}
      <img src={images[currentIndex]} alt="" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 8, cursor: 'default' }} onClick={e => e.stopPropagation()} />
      {images.length > 1 && (
        <button onClick={e => { e.stopPropagation(); onNext?.(); }} style={{ ...B, position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: '#fff', padding: 12, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FaArrowRight size={18} />
        </button>
      )}
      <button onClick={onClose} style={{ ...B, position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,0.5)', color: '#fff', padding: 10, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <FaTimes size={18} />
      </button>
      <a href={images[currentIndex]} download style={{ ...B, position: 'absolute', bottom: 16, right: 16, background: 'rgba(0,0,0,0.5)', color: '#fff', padding: 10, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <FaDownload size={16} />
      </a>
      {images.length > 1 && (
        <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', background: 'rgba(0,0,0,0.5)', padding: '4px 12px', borderRadius: 12 }}>
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
