import { slashCommands } from './constants.js';

export default function SlashAutocomplete({ filter, onSelect, M }) {
  const filtered = slashCommands.filter(sc => sc.cmd.slice(1).startsWith(filter));
  if (filtered.length === 0) return null;
  return (
    <div style={{
      position: 'absolute', bottom: '100%', left: 60, background: M.crust,
      border: `1px solid ${M.surface1}`, borderRadius: 8, padding: 2,
      maxHeight: 200, overflowY: 'auto', zIndex: 100, minWidth: 200,
    }}>
      {filtered.map((sc, idx) => (
        <div key={sc.cmd} onClick={() => onSelect(sc.cmd)}
          style={{
            padding: '4px 10px', borderRadius: 4, cursor: 'pointer',
            background: idx === 0 ? M.surface0 : 'none',
            fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6,
          }}>
          <span style={{ color: M.mauve, fontFamily: 'monospace', fontWeight: 600 }}>{sc.cmd}</span>
          <span style={{ color: M.ov0, fontSize: '0.7rem' }}>{sc.desc}</span>
        </div>
      ))}
    </div>
  );
}
