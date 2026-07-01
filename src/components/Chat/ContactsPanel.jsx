import { useState } from 'react';
import { FaTimes, FaSearch } from 'react-icons/fa';
import { B } from './constants.js';

export default function ContactsPanel({ contacts, onStartDM, onClose, M }) {
  const [search, setSearch] = useState('');

  const filtered = (contacts || []).filter(c =>
    c.nome?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div role="dialog" aria-modal="true" aria-label="Contatos" style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px', backdropFilter: 'blur(4px)',
    }}>
      <div style={{ background: M.mantle, border: `1px solid ${M.surface0}`, borderRadius: '16px', width: '100%', maxWidth: '400px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 8px' }}>
          <span style={{ color: M.text, fontWeight: 700, fontSize: '0.92rem' }}>Contatos</span>
          <button onClick={onClose} aria-label="Fechar" style={{ ...B, padding: 6, background: M.surface0, borderRadius: 10, color: M.text, display: 'flex' }}><FaTimes size={14} /></button>
        </div>
        <div style={{ padding: '8px 16px', position: 'relative' }}>
          <FaSearch size={12} style={{ position: 'absolute', left: 26, top: '50%', transform: 'translateY(-50%)', color: M.sub0 }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar contato..." aria-label="Buscar contato" style={{ width: '100%', padding: '8px 8px 8px 28px', background: M.surface0, border: 'none', borderRadius: 10, color: M.text, fontSize: '0.82rem', outline: 'none' }} />
        </div>
        <div style={{ overflow: 'auto', flex: 1, padding: '0 16px 16px' }}>
          {filtered.map(c => (
            <div key={c.id} onClick={() => { onStartDM(c.id); onClose(); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', cursor: 'pointer', borderBottom: `1px solid ${M.surface0}`, color: M.text }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: M.mauve, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>{c.nome?.[0]?.toUpperCase()}</div>
              <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{c.nome}</span>
            </div>
          ))}
          {filtered.length === 0 && <div style={{ color: M.sub0, textAlign: 'center', padding: '20px 0', fontSize: '0.82rem' }}>Nenhum contato encontrado</div>}
        </div>
      </div>
    </div>
  );
}
