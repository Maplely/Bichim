import { FaSearch, FaSpinner, FaTimes } from 'react-icons/fa';
import { B } from './constants.js';

export default function SearchBar({ open, query, searching, results, onQueryChange, onClose, onResultClick, M }) {
  if (!open) return null;
  return (
    <div style={{ padding: '8px 14px', background: M.mantle, borderBottom: `1px solid ${M.surface0}` }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', background: M.surface0, borderRadius: 8, padding: '0 10px' }}>
        <FaSearch size={12} color={M.ov0} />
        <input type="text" value={query} onChange={e => onQueryChange(e.target.value)}
          placeholder="Pesquisar mensagens..." aria-label="Pesquisar mensagens" autoFocus
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none', color: M.text,
            fontFamily: 'inherit', fontSize: '0.84rem', padding: '8px 0',
          }} />
        {searching && <FaSpinner size={12} style={{ animation: 'spin 1s linear infinite', color: M.ov0 }} />}
        <button onClick={onClose} aria-label="Fechar pesquisa"
          style={{ ...B, background: 'none', color: M.sub0, padding: 8, minWidth: 36, minHeight: 36 }}>
          <FaTimes size={12} />
        </button>
      </div>
      {results.length > 0 && (
        <div style={{ marginTop: 4, maxHeight: 200, overflowY: 'auto', background: M.surface0, borderRadius: 8 }}>
          {results.map(msg => (
            <div key={msg.id} style={{
              padding: '6px 10px', fontSize: '0.78rem',
              borderBottom: `1px solid ${M.surface1}`, cursor: 'pointer',
            }} onClick={() => onResultClick(msg)}>
              <span style={{ color: M.mauve, fontWeight: 600 }}>{msg.user_name}</span>
              <span style={{ color: M.ov0, marginLeft: 6, fontSize: '0.65rem' }}>
                {new Date(msg.created_at).toLocaleString('pt-BR')}
              </span>
              <div style={{
                color: M.sub0, marginTop: 2, overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{msg.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
