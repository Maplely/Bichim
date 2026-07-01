import { FaTimes } from 'react-icons/fa';
import { B } from './constants.js';

const SHORTCUTS = [
  { keys: '?', desc: 'Abrir/fechar atalhos' },
  { keys: 'Esc', desc: 'Fechar modais / limpar seleção' },
  { keys: 'Ctrl+K', desc: 'Buscar mensagens' },
  { keys: 'Ctrl+F', desc: 'Buscar mensagens' },
  { keys: 'F11', desc: 'Tela cheia' },
  { keys: '@', desc: 'Mencionar usuário' },
  { keys: '/', desc: 'Comandos rápidos' },
  { keys: 'Enter', desc: 'Enviar mensagem' },
  { keys: 'Shift+Enter', desc: 'Nova linha' },
];

export default function ShortcutsModal({ M, onClose }) {
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px', backdropFilter: 'blur(4px)',
    }}>
      <div style={{ background: M.mantle, border: `1px solid ${M.surface0}`, borderRadius: '16px', width: '100%', maxWidth: '400px', maxHeight: '80vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 8px' }}>
          <span style={{ color: M.text, fontWeight: 700, fontSize: '0.92rem' }}>Atalhos do teclado</span>
          <button onClick={onClose} style={{ ...B, padding: 6, background: M.surface0, borderRadius: 10, color: M.text, display: 'flex' }}><FaTimes size={14} /></button>
        </div>
        <div style={{ padding: '8px 16px 16px' }}>
          {SHORTCUTS.map((sc, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${M.surface0}` }}>
              <span style={{ color: M.sub0, fontSize: '0.82rem' }}>{sc.desc}</span>
              <kbd style={{ background: M.surface0, padding: '3px 8px', borderRadius: 6, fontSize: '0.72rem', color: M.mauve, fontWeight: 600, fontFamily: 'inherit' }}>{sc.keys}</kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
