import { FaTimes } from 'react-icons/fa';
import { B } from './constants.js';

export default function AuditModal({ auditLog, M, onClose }) {
  if (!auditLog || auditLog.length === 0) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label="Registro de Auditoria" onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px', backdropFilter: 'blur(4px)',
    }}>
      <div style={{ background: M.mantle, border: `1px solid ${M.surface0}`, borderRadius: '16px', width: '100%', maxWidth: '500px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 8px' }}>
          <span style={{ color: M.text, fontWeight: 700, fontSize: '0.92rem' }}>Registro de Auditoria</span>
          <button onClick={onClose} aria-label="Fechar" style={{ ...B, padding: 6, background: M.surface0, borderRadius: 10, color: M.text, display: 'flex' }}><FaTimes size={14} /></button>
        </div>
        <div style={{ overflow: 'auto', flex: 1, padding: '8px 16px 16px' }}>
          {auditLog.map((entry, i) => (
            <div key={i} style={{ padding: '8px 0', borderBottom: `1px solid ${M.surface0}`, fontSize: '0.78rem', color: M.sub0 }}>
              <span style={{ color: M.mauve, fontWeight: 600 }}>{entry.user_name}</span>
              {' '}{entry.action}{entry.target_name ? ` — ${entry.target_name}` : ''}
              <div style={{ fontSize: '0.68rem', color: M.ov0, marginTop: 2 }}>{new Date(entry.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
