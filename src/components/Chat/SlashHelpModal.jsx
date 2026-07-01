import { FaTimes } from 'react-icons/fa';
import { B } from './constants.js';
import { slashCommands } from './constants.js';

export default function SlashHelpModal({ M, onClose }) {
  return (
    <div role="dialog" aria-modal="true" aria-label="Comandos" onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px', backdropFilter: 'blur(4px)',
    }}>
      <div style={{ background: M.mantle, border: `1px solid ${M.surface0}`, borderRadius: '16px', width: '100%', maxWidth: '400px', maxHeight: '80vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 8px' }}>
          <span style={{ color: M.text, fontWeight: 700, fontSize: '0.92rem' }}>Comandos</span>
          <button onClick={onClose} aria-label="Fechar" style={{ ...B, padding: 6, background: M.surface0, borderRadius: 10, color: M.text, display: 'flex' }}><FaTimes size={14} /></button>
        </div>
        <div style={{ padding: '8px 16px 16px' }}>
          {slashCommands.map((cmd, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 0', borderBottom: `1px solid ${M.surface0}` }}>
              <span style={{ background: M.mauve + '20', color: M.mauve, borderRadius: 6, padding: '2px 8px', fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap', fontFamily: 'monospace' }}>{cmd.command}</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: M.text, fontSize: '0.82rem' }}>{cmd.name}</div>
                <div style={{ color: M.sub0, fontSize: '0.72rem' }}>{cmd.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
