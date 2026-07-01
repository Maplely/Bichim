import { FaLock, FaHashtag, FaUser, FaStar } from 'react-icons/fa';
import { B } from './constants.js';

export default function RoomListItem({ room, currentRoomId, onSwitch, onToggleFavorite, isFavorite, isDM, mobile, onSideClose, M }) {
  return (
    <div onClick={() => { onSwitch(room); if (mobile) onSideClose(); }}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px',
        borderRadius: '8px', cursor: 'pointer',
        background: room.id === parseInt(currentRoomId) ? M.surface0 : 'transparent',
      }}>
      <span style={{ fontSize: '12px', lineHeight: 0, color: isDM ? M.blue : M.sub0 }}>
        {isDM ? <FaUser size={12} /> : (room.password_hash ? <FaLock size={12} /> : <FaHashtag size={12} />)}
      </span>
      <span style={{
        flex: 1, fontSize: '0.83rem',
        fontWeight: room.id === parseInt(currentRoomId) ? 600 : 400,
        color: room.id === parseInt(currentRoomId) ? M.text : M.sub1,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{room.name}</span>
      {onToggleFavorite && (
        <button onClick={e => { e.stopPropagation(); onToggleFavorite(room.id); }}
          style={{ ...B, background: 'none', color: isFavorite ? M.peach : M.ov0, padding: 2, minWidth: 28, minHeight: 28 }}>
          <FaStar size={11} />
        </button>
      )}
      {room.member_count != null && (
        <span style={{
          fontSize: '0.62rem', color: M.ov1, background: M.surface0,
          borderRadius: 8, padding: '1px 6px', whiteSpace: 'nowrap',
        }}>{room.member_count}</span>
      )}
    </div>
  );
}
