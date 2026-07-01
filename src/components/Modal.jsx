import { FaTimes } from 'react-icons/fa';

const M = { mantle: '#181825', surface0: '#313244', text: '#cdd6f4', sub0: '#a6adc8' };

const B = {
  border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
  fontFamily: 'inherit', transition: 'all 0.15s', display: 'flex',
  alignItems: 'center', justifyContent: 'center', gap: '6px',
};

export default function Modal({ title, onClose, children }) {
  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '16px', backdropFilter: 'blur(4px)',
      }}
    >
      <div style={{
        background: M.mantle, border: `1px solid ${M.surface0}`, borderRadius: '16px',
        padding: '24px', width: '100%', maxWidth: '400px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: M.text, fontSize: '1.05rem', fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{ ...B, background: 'none', color: M.sub0, padding: '4px' }}><FaTimes size={14} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
