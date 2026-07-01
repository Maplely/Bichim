import { useRef } from 'react';
import { B } from './constants.js';

export default function EditMsgModal({ editingMsg, onClose, onSubmit, M }) {
  const editRef = useRef(null);
  if (!editingMsg) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label="Editar mensagem" onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px', backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: M.mantle, border: `1px solid ${M.surface0}`, borderRadius: '16px',
        padding: '24px', width: '100%', maxWidth: '480px',
      }}>
        <div style={{ color: M.text, fontWeight: 700, fontSize: '0.92rem', marginBottom: '12px' }}>Editar mensagem</div>
        <textarea ref={editRef} defaultValue={editingMsg.content} aria-label="Editar mensagem"
          onKeyDown={e => { if (e.key === 'Escape') onClose(); if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSubmit(editingMsg, editRef.current?.value); onClose(); } }}
          style={{ width: '100%', minHeight: 80, background: M.surface0, border: 'none', borderRadius: 8, color: M.text, padding: '10px', fontFamily: 'inherit', fontSize: '0.85rem', resize: 'vertical', outline: 'none' }}
          autoFocus />
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
          <button onClick={onClose} style={{ ...B, background: M.surface0, color: M.sub0, padding: '8px 16px', fontSize: '0.82rem' }}>Cancelar</button>
          <button onClick={() => { onSubmit(editingMsg, editRef.current?.value); onClose(); }} style={{ ...B, background: M.mauve, color: '#fff', padding: '8px 16px', fontSize: '0.82rem' }}>Salvar</button>
        </div>
      </div>
    </div>
  );
}
