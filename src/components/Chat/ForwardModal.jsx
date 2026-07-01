import { useState } from 'react';
import { FaTimes, FaSearch, FaCheck } from 'react-icons/fa';
import { B } from './constants.js';

export default function ForwardModal({ rooms, currentRoomId, M, onClose, onForward }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = (rooms || []).filter(r =>
    r.id !== parseInt(currentRoomId) && r.nome?.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirm = () => {
    if (selected) { onForward(selected); onClose(); }
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Encaminhar mensagem" onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px', backdropFilter: 'blur(4px)',
    }}>
      <div style={{ background: M.mantle, border: `1px solid ${M.surface0}`, borderRadius: '16px', width: '100%', maxWidth: '400px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 8px' }}>
          <span style={{ color: M.text, fontWeight: 700, fontSize: '0.92rem' }}>Encaminhar mensagem</span>
          <button onClick={onClose} aria-label="Fechar" style={{ ...B, padding: 6, background: M.surface0, borderRadius: 10, color: M.text, display: 'flex' }}><FaTimes size={14} /></button>
        </div>
        <div style={{ padding: '8px 16px', position: 'relative' }}>
          <FaSearch size={12} style={{ position: 'absolute', left: 26, top: '50%', transform: 'translateY(-50%)', color: M.sub0 }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar sala..." aria-label="Buscar sala" style={{ width: '100%', padding: '8px 8px 8px 28px', background: M.surface0, border: 'none', borderRadius: 10, color: M.text, fontSize: '0.82rem', outline: 'none' }} />
        </div>
        <div style={{ overflow: 'auto', flex: 1, padding: '0 16px 16px' }}>
          {filtered.map(r => (
            <div key={r.id} onClick={() => setSelected(r.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', cursor: 'pointer', borderBottom: `1px solid ${M.surface0}`, color: M.text }}>
              <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${selected === r.id ? M.mauve : M.surface1}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: selected === r.id ? M.mauve : 'transparent' }}>
                {selected === r.id && <FaCheck size={10} style={{ color: '#fff' }} />}
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{r.nome}</span>
            </div>
          ))}
          {filtered.length === 0 && <div style={{ color: M.sub0, textAlign: 'center', padding: '20px 0', fontSize: '0.82rem' }}>Nenhuma sala encontrada</div>}
        </div>
        {selected && (
          <div style={{ padding: '8px 16px 16px' }}>
            <button onClick={handleConfirm} style={{ ...B, width: '100%', padding: '10px', background: M.mauve, color: '#fff', borderRadius: 10, fontSize: '0.82rem', fontWeight: 600 }}>Encaminhar</button>
          </div>
        )}
      </div>
    </div>
  );
}
