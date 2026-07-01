import { FaTimes } from 'react-icons/fa';
import { B } from './constants.js';

export default function GifPicker({ query, results, searching, onSearch, onSelect, onClose, M }) {
  return (
    <div style={{
      padding: '4px 8px', borderBottom: `1px solid ${M.surface1}55`,
      maxHeight: 200, overflowY: 'auto',
    }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        <input type="text" value={query} onChange={e => onSearch(e.target.value)}
          placeholder="Buscar GIFs..." autoFocus
          style={{
            flex: 1, background: M.surface1, border: 'none', borderRadius: 6,
            padding: '4px 8px', color: M.text, fontSize: '0.78rem',
            outline: 'none', fontFamily: 'inherit',
          }} />
        <button onClick={onClose}
          style={{ ...B, background: 'none', color: M.sub0, padding: 8, minWidth: 36, minHeight: 36 }}>
          <FaTimes size={12} />
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
        {results.map((g, i) => (
          <img key={i} src={g.url} alt={g.title || 'GIF'} onClick={() => onSelect(g.url)}
            style={{ width: '100%', borderRadius: 6, cursor: 'pointer', aspectRatio: '1', objectFit: 'cover' }} />
        ))}
        {query && results.length === 0 &&
          <p style={{ color: M.ov0, fontSize: '0.72rem', gridColumn: '1/-1', textAlign: 'center' }}>
            Digite para buscar GIFs...
          </p>}
      </div>
    </div>
  );
}
