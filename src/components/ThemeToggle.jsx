import { useState, useEffect } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';

export function getTheme() {
  if (typeof localStorage === 'undefined') return 'dark';
  try {
    const stored = localStorage.getItem('chat-theme');
    if (stored) return stored;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
    return 'dark';
  } catch { return 'dark'; }
}

export function applyTheme(t) {
  try {
    localStorage.setItem('chat-theme', t);
    document.documentElement.dataset.theme = t;
  } catch {}
}

const btnStyle = {
  border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
  fontFamily: 'inherit', transition: 'all 0.15s', display: 'flex',
  alignItems: 'center', justifyContent: 'center', gap: '6px',
};

export default function ThemeToggle({ onToggle, M, size }) {
  const [theme, setThemeState] = useState(getTheme);

  useEffect(() => {
    const handler = () => setThemeState(getTheme());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const handleClick = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setThemeState(next);
    if (onToggle) {
      onToggle(next);
    } else {
      applyTheme(next);
    }
  };

  return (
    <button onClick={handleClick}
      style={{ ...btnStyle, background: 'none', color: M ? M.peach : 'var(--peach)', padding: 8, minWidth: 36, minHeight: 36 }}
      title="Alternar tema" aria-label="Alternar tema">
      {theme === 'dark' ? <FaSun size={size || 13} /> : <FaMoon size={size || 13} />}
    </button>
  );
}
