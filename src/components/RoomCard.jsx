import { useState } from 'react';
import { FaLock, FaHashtag, FaUsers, FaClipboard, FaCheck, FaTrash } from 'react-icons/fa';

const M = {
  mantle: '#1A1A1A', surface0: '#252525', surface1: '#2D2D2D',
  text: '#FFFFFF', sub0: '#BFBFBF', mauve: '#EA5A3E',
  green: '#4ADE80', maroon: '#FF6B6B', yellow: '#FDB022',
};

const B = {
  border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
  fontFamily: 'inherit', transition: 'all 0.15s', display: 'flex',
  alignItems: 'center', justifyContent: 'center', gap: '6px',
};

function ago(dateStr) {
  if (!dateStr) return 'agora';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function RoomCard({ room, onEnter, onDelete }) {
  const [copied, setCopied] = useState(false);
  const copy = e => {
    e.stopPropagation();
    navigator.clipboard.writeText(room.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        background: M.mantle, border: `1px solid ${M.surface0}`, borderRadius: '12px',
        padding: '14px 16px', cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = M.mauve; e.currentTarget.style.boxShadow = `0 0 0 1px ${M.mauve}40`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = M.surface0; e.currentTarget.style.boxShadow = 'none'; }}
      onClick={onEnter}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            background: room.password_hash ? `${M.yellow}1a` : `${M.mauve}1a`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: room.password_hash ? M.yellow : M.mauve, lineHeight: 0 }}>
              {room.password_hash ? <FaLock size={15} /> : <FaHashtag size={15} />}
            </span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{room.name}</div>
            <div style={{ color: M.sub0, fontSize: '0.72rem', marginTop: '2px' }}>{ago(room.last_activity)} atrás</div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '10px', fontSize: '0.73rem', color: M.sub0, alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <FaUsers size={12} /> {room.member_count || 0}
          </span>
          <button
            onClick={copy}
            style={{
              ...B, background: 'none', color: copied ? M.green : M.sub0,
              padding: '2px 7px', fontSize: '0.73rem', border: `1px solid ${M.surface1}`,
              borderRadius: '6px', gap: '4px', fontFamily: 'monospace', fontWeight: 600,
            }}
          >
            {copied ? <FaCheck size={10} /> : <FaClipboard size={10} />} {room.code}
          </button>
        </div>
        {!!room.is_owner && onDelete && (
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            style={{ ...B, background: 'none', color: M.maroon, padding: '4px', borderRadius: '6px' }}
            title="Deletar sala"
          >
            <FaTrash size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
