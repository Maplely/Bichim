import { emojiList } from './constants.js';

export default function EmojiPicker({ onEmojiSelect, M }) {
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 3, padding: '4px 8px',
      borderBottom: `1px solid ${M.surface1}55`, maxHeight: 100, overflowY: 'auto',
    }}>
      {emojiList.map(e => (
        <button key={e} onClick={() => onEmojiSelect(e)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', padding: '2px 3px', borderRadius: 4 }}
          onMouseEnter={e2 => e2.currentTarget.style.background = M.surface1}
          onMouseLeave={e2 => e2.currentTarget.style.background = 'none'}>{e}</button>
      ))}
    </div>
  );
}
