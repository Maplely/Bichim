const M = { mantle: '#1A1A1A', surface0: '#252525', surface1: '#2D2D2D', text: '#FFFFFF', sub0: '#BFBFBF', red: '#FF6B6B', mauve: '#EA5A3E' };

const B = {
  border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
  fontFamily: 'inherit', transition: 'all 0.15s', display: 'flex',
  alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 20px', fontSize: '0.84rem',
};

export default function ConfirmDialog({ message, onConfirm, onCancel, confirmLabel = 'Confirmar', danger = false }) {
  return (
    <div role="dialog" aria-modal="true" aria-label="Confirmação" onClick={e => e.target === e.currentTarget && onCancel()} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px', backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: M.mantle, border: `1px solid ${M.surface0}`, borderRadius: '16px',
        padding: '24px', width: '100%', maxWidth: '380px', textAlign: 'center',
      }}>
        <div style={{ color: M.text, fontSize: '0.92rem', marginBottom: '24px' }}>{message}</div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button onClick={onCancel} style={{ ...B, background: M.surface0, color: M.sub0, flex: 1 }}>Cancelar</button>
          <button onClick={onConfirm} style={{ ...B, background: danger ? M.red : M.mauve, color: '#fff', flex: 1 }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}