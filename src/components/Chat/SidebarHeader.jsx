import { FaTimes } from 'react-icons/fa';
import ThemeToggle from '../ThemeToggle.jsx';
import { B } from './constants.js';

export default function SidebarHeader({ setTheme, mobile, onClose, M }) {
  const logoSrc = M.base === '#0F0F0F' ? '/BichimDarkMode.svg' : '/BichimWhiteMode.svg';
  return (
    <div style={{
      padding: '13px 14px', borderBottom: `1px solid ${M.surface0}`,
      display: 'flex', alignItems: 'center', gap: '8px',
    }}>
      <img src={logoSrc} alt="Bichim" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
      <span style={{ fontWeight: 700, fontSize: '0.88rem', flex: 1 }}>Bichim</span>
      <ThemeToggle onToggle={(t) => setTheme(t)} M={M} />
      {mobile && (
        <button onClick={onClose} aria-label="Fechar sidebar"
          style={{ ...B, background: 'none', color: M.sub0, padding: 8, minWidth: 36, minHeight: 36 }}>
          <FaTimes size={14} />
        </button>
      )}
    </div>
  );
}
