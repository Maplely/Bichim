import { useState } from 'react';
import { FaTimes, FaCrown, FaUserShield, FaUser, FaUserMinus, FaBan, FaCheck, FaStar } from 'react-icons/fa';
import { B } from './constants.js';

export default function MembersPanel({ members, onlineUsers, user, room, M, onClose, onTransfer, onKick, onBan, onChangeRole }) {
  const [tab, setTab] = useState('members');

  const sorted = [...members].sort((a, b) => {
    if (a.id === room?.owner_id) return -1;
    if (b.id === room?.owner_id) return 1;
    if (a.role === 'admin') return -1;
    if (b.role === 'admin') return 1;
    return 0;
  });

  const handleAction = (action, target) => {
    if (action === 'transfer') onTransfer?.(target);
    if (action === 'kick') onKick?.(target);
    if (action === 'ban') onBan?.(target);
    if (action === 'toggleAdmin') onChangeRole?.(target, target.role === 'admin' ? 'member' : 'admin');
  };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px', backdropFilter: 'blur(4px)',
    }}>
      <div style={{ background: M.mantle, border: `1px solid ${M.surface0}`, borderRadius: '16px', width: '100%', maxWidth: '400px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 8px' }}>
          <span style={{ color: M.text, fontWeight: 700, fontSize: '0.92rem' }}>Membros ({members.length})</span>
          <button onClick={onClose} style={{ ...B, padding: 6, background: M.surface0, borderRadius: 10, color: M.text, display: 'flex' }}><FaTimes size={14} /></button>
        </div>
        <div style={{ overflow: 'auto', flex: 1, padding: '8px 16px 16px' }}>
          {sorted.map(m => {
            const isOwner = m.id === room?.owner_id;
            const isSelf = m.id === user?.id;
            const canManage = (user?.id === room?.owner_id) && !isSelf && !isOwner;
            return (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${M.surface0}` }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: onlineUsers.has(m.id) ? M.green : M.surface0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.72rem', fontWeight: 700, color: onlineUsers.has(m.id) ? '#fff' : M.sub0, flexShrink: 0,
                }}>{m.nome?.[0]?.toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: M.text, fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {m.nome}
                    {isOwner && <FaCrown size={11} style={{ color: M.yellow }} />}
                    {m.role === 'admin' && !isOwner && <FaUserShield size={11} style={{ color: M.blue }} />}
                    {m.verification >= 2 && <FaCheck size={10} style={{ color: M.green }} />}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: M.sub0 }}>
                    {onlineUsers.has(m.id) ? 'Online' : 'Offline'} {isSelf && '(você)'}
                  </div>
                </div>
                {canManage && (
                  <div style={{ display: 'flex', gap: 2 }}>
                    <button onClick={() => handleAction('toggleAdmin', m)} title={m.role === 'admin' ? 'Remover admin' : 'Tornar admin'} style={{ ...B, padding: 6, background: M.surface0, borderRadius: 8, color: M.blue, fontSize: '0.72rem' }}><FaUserShield size={11} /></button>
                    <button onClick={() => handleAction('transfer', m)} title="Transferir propriedade" style={{ ...B, padding: 6, background: M.surface0, borderRadius: 8, color: M.yellow, fontSize: '0.72rem' }}><FaStar size={11} /></button>
                    <button onClick={() => handleAction('kick', m)} title="Expulsar" style={{ ...B, padding: 6, background: M.surface0, borderRadius: 8, color: M.red, fontSize: '0.72rem' }}><FaUserMinus size={11} /></button>
                    <button onClick={() => handleAction('ban', m)} title="Banir" style={{ ...B, padding: 6, background: M.surface0, borderRadius: 8, color: M.red, fontSize: '0.72rem' }}><FaBan size={11} /></button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
