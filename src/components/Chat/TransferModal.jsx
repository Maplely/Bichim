import { FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { B } from './constants.js';

export default function TransferModal({ target, room, M, onClose, onConfirm }) {
  if (!target) return null;
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px', backdropFilter: 'blur(4px)',
    }}>
      <div style={{ background: M.mantle, border: `1px solid ${M.surface0}`, borderRadius: '16px', width: '100%', maxWidth: '380px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, color: M.yellow }}>
          <FaExclamationTriangle size={20} />
          <span style={{ color: M.text, fontWeight: 700, fontSize: '0.92rem' }}>Transferir sala</span>
        </div>
        <p style={{ color: M.sub0, fontSize: '0.82rem', lineHeight: 1.5, margin: '0 0 20px' }}>
          Tem certeza que deseja transferir a sala <strong style={{ color: M.text }}>{room?.nome}</strong> para <strong style={{ color: M.text }}>{target?.nome}</strong>? Você perderá o cargo de dono.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ ...B, background: M.surface0, color: M.sub0, padding: '8px 16px', fontSize: '0.82rem' }}>Cancelar</button>
          <button onClick={() => { onConfirm?.(target); onClose?.(); }} style={{ ...B, background: M.red, color: '#fff', padding: '8px 16px', fontSize: '0.82rem' }}>Transferir</button>
        </div>
      </div>
    </div>
  );
}
