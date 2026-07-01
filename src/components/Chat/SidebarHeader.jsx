import { FaComment, FaSun, FaMoon, FaTimes } from 'react-icons/fa';
import { B } from './constants.js';

export default function SidebarHeader({ theme, setTheme, mobile, onClose, M }) {
  return (
    <div style={{
      padding: '13px 14px', borderBottom: `1px solid ${M.surface0}`,
      display: 'flex', alignItems: 'center', gap: '8px',
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%', background: M.mauve,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <FaComment size={13} color={M.crust} />
      </div>
      <span style={{ fontWeight: 700, fontSize: '0.88rem', flex: 1 }}>Bichim</span>
      <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        style={{ ...B, background: 'none', color: M.peach, padding: 8, minWidth: 36, minHeight: 36 }}
        title="Alternar tema" aria-label="Alternar tema">
        {theme === 'dark' ? <FaSun size={13} /> : <FaMoon size={13} />}
      </button>
      {mobile && (
        <button onClick={onClose} aria-label="Fechar sidebar"
          style={{ ...B, background: 'none', color: M.sub0, padding: 8, minWidth: 36, minHeight: 36 }}>
          <FaTimes size={14} />
        </button>
      )}
    </div>
  );
}
