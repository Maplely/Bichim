import { getColor } from './constants.js';

export default function MentionAutocomplete({ members, userId, onSelect, mentionIndex, M }) {
  return (
    <div style={{
      position: 'absolute', bottom: '100%', left: 60, background: M.crust,
      border: `1px solid ${M.surface1}`, borderRadius: 8, padding: 2,
      maxHeight: 120, overflowY: 'auto', zIndex: 100,
    }}>
      {members.filter(m => m.id !== userId).map((m, idx) => (
        <div key={m.id} onClick={() => onSelect(m)}
          style={{
            padding: '4px 10px', borderRadius: 4, cursor: 'pointer',
            background: idx === mentionIndex ? M.surface0 : 'none',
            fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6,
          }}>
          <div style={{
            width: 18, height: 18, borderRadius: '50%', background: getColor(m.nome),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.55rem', color: '#fff', fontWeight: 700,
          }}>
            {m.nome[0]?.toUpperCase()}
          </div>
          {m.nome}
          {m.is_owner ? <span style={{ fontSize: '0.6rem', color: M.mauve }}>dono</span> : null}
        </div>
      ))}
      <div onClick={() => onSelect('everyone')}
        style={{ padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem', color: M.yellow }}>
        @everyone — Notificar todos
      </div>
      <div onClick={() => onSelect('here')}
        style={{ padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem', color: M.green }}>
        @here — Notificar online
      </div>
    </div>
  );
}
