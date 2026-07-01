import { FaReply, FaTimes } from 'react-icons/fa';

export default function ReplyIndicator({ replyingTo, onCancel, M }) {
  if (!replyingTo) return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px',
      marginBottom: 4, background: M.surface0, borderRadius: 8, fontSize: '0.75rem',
    }}>
      <FaReply size={10} color={M.mauve} />
      <span style={{ flex: 1, color: M.sub0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        Respondendo a <strong style={{ color: M.mauve }}>{replyingTo.user_name}</strong>: {replyingTo.content}
      </span>
      <button onClick={onCancel}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: M.sub0, display: 'flex', padding: 2 }}>
        <FaTimes size={10} />
      </button>
    </div>
  );
}
