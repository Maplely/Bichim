import { FaSpinner, FaCheckSquare, FaRegSquare } from 'react-icons/fa';
import { B } from './constants.js';
import MsgBubble from '../MsgBubble.jsx';
import DateSeparator from '../DateSeparator.jsx';
import UnreadDivider from './UnreadDivider.jsx';
import EmptyMessages from './EmptyMessages.jsx';

export default function MessageList({
  msgs, M, user, canModerate, multiSelect, selectedIds, lastReadId,
  loadingMore, hasMore, typingText, mainRef, endRef, onScroll,
  onContextMenu, onReact, onEdit, onDelete, onPin, onToggleSelect,
  onReply, onImageClick, resolvePreview, shouldShowDateSep,
}) {
  return (
    <main ref={mainRef} onScroll={onScroll} role="log" aria-live="polite" aria-label="Mensagens"
      style={{ flex: 1, overflowY: 'auto', padding: '10px 14px', display: 'flex', flexDirection: 'column' }}>
      {loadingMore && <div style={{ textAlign: 'center', padding: '8px', color: M.ov0 }}><FaSpinner size={14} style={{ animation: 'spin 1s linear infinite' }} /></div>}
      {!hasMore && msgs.length > 0 && <div style={{ textAlign: 'center', padding: '12px 0 4px', fontSize: '0.7rem', color: M.ov0 }}>— início do histórico —</div>}
      {msgs.length === 0 ? (
        <EmptyMessages M={M} />
      ) : (
        msgs.map((msg, i) => {
          if (msg.__system || msg.is_system) return <MsgBubble key={msg.id} msg={{ ...msg, __system: true }} grouped={false} isOwn={false} />;
          const showUnreadDivider = lastReadId && msg.id === lastReadId && i < msgs.length - 1;
          return (
            <div key={msg.id}>
              {shouldShowDateSep(msgs, i) && <DateSeparator date={msg.created_at} />}
              {showUnreadDivider && <UnreadDivider M={M} />}
              <div onContextMenu={(e) => onContextMenu(e, msg)} style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                {multiSelect && (
                  <button onClick={() => onToggleSelect(msg.id)} style={{ ...B, background: 'none', color: M.sub0, padding: '6px 2px', marginTop: 12, flexShrink: 0 }}>
                    {selectedIds.has(msg.id) ? <FaCheckSquare size={14} color={M.mauve} /> : <FaRegSquare size={14} />}
                  </button>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <MsgBubble msg={msg}
                    grouped={i > 0 && !msgs[i - 1].__system && msgs[i - 1].user_id === msg.user_id && !shouldShowDateSep(msgs, i)}
                    isOwn={user && msg.user_id === user.id}
                    onReact={onReact}
                    onEdit={user && msg.user_id === user.id ? onEdit : null}
                    onDelete={user && (msg.user_id === user.id || canModerate) ? onDelete : null}
                    onReply={onReply}
                    onPin={canModerate ? onPin : null}
                    onImageClick={onImageClick}
                    preview={resolvePreview(msg)} />
                </div>
              </div>
            </div>
          );
        })
      )}
      {typingText && <div style={{ fontSize: '0.72rem', color: M.ov0, fontStyle: 'italic', padding: '4px 0 2px 40px', animation: 'fadeIn 0.2s ease-out' }}>{typingText}</div>}
      <div ref={endRef} />
    </main>
  );
}
