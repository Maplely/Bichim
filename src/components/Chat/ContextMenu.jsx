import { useRef, useEffect } from 'react';
import { FaSave, FaPaintBrush, FaReply, FaClipboard, FaThumbtack, FaTrash, FaShare, FaUserPlus } from 'react-icons/fa';
import { B } from './constants.js';

const ctxBtn = (M) => ({ ...B, width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, fontSize: '0.78rem', color: M.text, background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' });

export default function ContextMenu({ ctxMsg, user, M, onClose, onAction }) {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  if (!ctxMsg) return null;

  const isOwner = ctxMsg.user_id === user?.id;
  const isAdmin = user?.role === 'admin' || user?.id === ctxMsg.owner_id;
  const items = [];

  items.push({ id: 'reply', icon: FaReply, label: 'Responder' });
  if (isOwner) items.push({ id: 'edit', icon: FaPaintBrush, label: 'Editar' });
  items.push({ id: 'save', icon: FaSave, label: ctxMsg._saved ? 'Remover dos salvos' : 'Salvar' });
  items.push({ id: 'copy', icon: FaClipboard, label: 'Copiar texto' });
  items.push({ id: 'forward', icon: FaShare, label: 'Encaminhar' });
  items.push({ id: 'pin', icon: FaThumbtack, label: 'Fixar/Desafixar' });
  items.push({ id: 'profile', icon: FaUserPlus, label: 'Ver perfil' });
  if (isAdmin && !isOwner) {
    items.push({ id: 'delete', icon: FaTrash, label: 'Excluir' });
  }
  if (isOwner) items.push({ id: 'delete', icon: FaTrash, label: 'Excluir' });

  return (
    <div ref={ref} style={{
      position: 'fixed', zIndex: 9998, background: M.mantle, border: `1px solid ${M.surface0}`,
      borderRadius: 12, padding: '4px', minWidth: 190, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      top: ctxMsg._y, left: ctxMsg._x,
    }}>
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <button key={i} onClick={() => { onAction(item.id); onClose(); }} style={ctxBtn(M)}
            onMouseEnter={e => e.currentTarget.style.background = M.surface0}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <Icon size={12} style={{ color: M.sub0 }} />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
