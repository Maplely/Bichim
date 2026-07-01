import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { B } from './constants.js';

export default function DescEditModal({ desc, room, M, onClose, onSave }) {
  if (!room) return null;
  const [val, setVal] = useState(desc || room?.descricao || '');

  return (
    <div role="dialog" aria-modal="true" aria-label="Editar descrição" onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px', backdropFilter: 'blur(4px)',
    }}>
      <div style={{ background: M.mantle, border: `1px solid ${M.surface0}`, borderRadius: '16px', width: '100%', maxWidth: '420px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ color: M.text, fontWeight: 700, fontSize: '0.92rem' }}>Editar descrição</span>
          <button onClick={onClose} aria-label="Fechar" style={{ ...B, padding: 6, background: M.surface0, borderRadius: 10, color: M.text, display: 'flex' }}><FaTimes size={14} /></button>
        </div>
        <textarea value={val} onChange={e => setVal(e.target.value)} aria-label="Descrição da sala"
          placeholder="Descrição da sala..."
          style={{ width: '100%', minHeight: 100, background: M.surface0, border: 'none', borderRadius: 8, color: M.text, padding: '10px', fontFamily: 'inherit', fontSize: '0.85rem', resize: 'vertical', outline: 'none' }}
          autoFocus />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
          <button onClick={onClose} style={{ ...B, background: M.surface0, color: M.sub0, padding: '8px 16px', fontSize: '0.82rem' }}>Cancelar</button>
          <button onClick={() => { onSave?.(val); onClose(); }} style={{ ...B, background: M.mauve, color: '#fff', padding: '8px 16px', fontSize: '0.82rem' }}>Salvar</button>
        </div>
      </div>
    </div>
  );
}
