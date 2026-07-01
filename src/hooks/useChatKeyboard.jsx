import { useEffect } from 'react';

export default function useChatKeyboard({
  multiSelect, onEscape, onToggleShortcuts, onToggleSearch, onToggleFullscreen, onClickAway,
}) {
  useEffect(() => {
    const h = (e) => {
      if (e.key === '?' && !e.target.closest('input,textarea')) {
        e.preventDefault();
        onToggleShortcuts?.();
      }
      if (e.key === 'Escape') onEscape?.();
      if ((e.key === 'k' || e.key === 'f') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        onToggleSearch?.();
      }
      if (e.key === 'F11' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        onToggleFullscreen?.();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [multiSelect, onEscape, onToggleShortcuts, onToggleSearch, onToggleFullscreen]);

  useEffect(() => {
    window.__onClickAway = onClickAway;
    return () => { window.__onClickAway = undefined; };
  }, [onClickAway]);
}
