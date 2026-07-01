import { useState, useRef, useEffect } from 'react';
import { FaBars, FaLock, FaHashtag, FaCheck, FaClipboard, FaInfoCircle, FaSearch, FaThumbtack, FaHistory, FaArchive, FaUsers, FaEllipsisV, FaTrash, FaSignOutAlt } from 'react-icons/fa';
import { B } from './constants.js';

export default function RoomHeader({
  room, M, mobile, copied, pinnedMsgs, showDesc, searchOpen, showPinned,
  canModerate, members, membersOpen,
  onToggleSide, onToggleSearch, onTogglePinned, onOpenAudit, onToggleMembers,
  onCopyCode, onArchive, onDeleteRoom, onLeave, onOpenSidebar,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handle = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  const menuItems = [
    { icon: FaInfoCircle, label: 'Info', onClick: onToggleSide, active: showDesc },
    { icon: FaSearch, label: 'Pesquisar', onClick: onToggleSearch, active: searchOpen },
    ...(pinnedMsgs.length > 0 ? [{ icon: FaThumbtack, label: `Fixadas (${pinnedMsgs.length})`, onClick: onTogglePinned, active: showPinned, color: M.yellow }] : []),
    ...(canModerate ? [{ icon: FaHistory, label: 'Auditoria', onClick: onOpenAudit }] : []),
    ...(room?.is_owner ? [{ icon: FaArchive, label: 'Arquivar', onClick: onArchive }] : []),
    ...(room?.is_owner ? [{ icon: FaTrash, label: 'Deletar', onClick: onDeleteRoom }] : []),
    ...(room && !room?.is_owner ? [{ icon: FaSignOutAlt, label: 'Sair', onClick: onLeave }] : []),
  ];

  return (
    <header style={{ background: M.mantle, borderBottom: `1px solid ${M.surface0}`, padding: '11px 16px', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
      {mobile && <button onClick={onOpenSidebar} style={{ ...B, background: 'none', color: M.sub0, padding: '4px', flexShrink: 0 }}><FaBars size={14} /></button>}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: '14px', lineHeight: 0 }}>{room?.password_hash ? <FaLock size={14} /> : <FaHashtag size={14} />}</span>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span style={{ fontWeight: 700, fontSize: '0.92rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {room?.name || 'Carregando...'}
          </span>
          {room?.description && <span style={{ fontSize: '0.68rem', color: M.ov0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{room.description}</span>}
        </div>
        {room?.code && (
          <button onClick={onCopyCode} style={{ border: `1px solid ${M.surface1}`, borderRadius: '6px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 600, fontSize: '0.72rem', transition: 'all 0.15s', background: copied ? M.green : 'none', color: copied ? M.crust : M.sub0, padding: '2px 7px', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            {copied ? <FaCheck size={10} /> : <FaClipboard size={10} />} {room.code}
          </button>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.73rem', color: M.sub0, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: M.green, display: 'inline-block' }} />
            {members.length}
          </span>
          <button onClick={onToggleMembers} style={{ ...B, background: membersOpen ? M.surface0 : 'none', color: membersOpen ? M.text : M.sub0, padding: '6px 8px', borderRadius: '8px', lineHeight: 0 }}>
            <FaUsers size={16} />
          </button>
        </div>
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button onClick={() => setMenuOpen(v => !v)} style={{ ...B, background: menuOpen ? M.surface0 : 'none', color: M.sub0, padding: '8px', minWidth: 36, minHeight: 36, borderRadius: '8px', lineHeight: 0 }}>
            <FaEllipsisV size={14} />
          </button>
          {menuOpen && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 4,
              background: M.mantle, border: `1px solid ${M.surface1}`, borderRadius: 8,
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)', zIndex: 100,
              minWidth: 180, padding: '4px 0',
            }}>
              {menuItems.map((item, i) => (
                <button key={i} onClick={() => { item.onClick(); close(); }}
                  style={{
                    ...B, width: '100%', justifyContent: 'flex-start', gap: 10,
                    padding: '8px 14px', borderRadius: 0, fontSize: '0.82rem',
                    background: item.active ? M.surface0 : 'none',
                    color: item.color || (item.active ? M.text : M.sub0),
                  }}>
                  <item.icon size={13} />
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
