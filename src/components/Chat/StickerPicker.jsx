import { stickerList } from './constants.js';

export default function StickerPicker({ onStickerSelect, M }) {
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 3, padding: '4px 8px',
      borderBottom: `1px solid ${M.surface1}55`, maxHeight: 100, overflowY: 'auto',
    }}>
      {stickerList.map(s => (
        <button key={s} onClick={() => onStickerSelect(s)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', padding: '2px 3px', borderRadius: 4 }}
          onMouseEnter={e2 => e2.currentTarget.style.background = M.surface1}
          onMouseLeave={e2 => e2.currentTarget.style.background = 'none'}>{s}</button>
      ))}
    </div>
  );
}
