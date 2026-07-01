import { FaSave } from 'react-icons/fa';

export default function SavedMsgsBar({ msgs, savedMsgs, M }) {
  if (!savedMsgs || savedMsgs.size === 0) return null;
  return (
    <div style={{ background: `${M.blue}08`, borderBottom: `1px solid ${M.blue}30`, padding: '8px 14px', maxHeight: 150, overflowY: 'auto' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: M.blue, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
        <FaSave size={10} /> Salvos
      </div>
      {msgs.filter(m => savedMsgs.has(m.id)).map(msg => (
        <div key={msg.id} style={{ fontSize: '0.78rem', padding: '2px 0', color: M.sub0 }}>
          <span style={{ color: M.mauve, fontWeight: 600 }}>{msg.user_name}</span>: {msg.content.slice(0, 80)}{msg.content.length > 80 ? '…' : ''}
        </div>
      ))}
    </div>
  );
}
