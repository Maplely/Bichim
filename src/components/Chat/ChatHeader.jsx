import { FaArrowLeft, FaInfoCircle, FaEnvelope, FaEye, FaGlobe, FaUsers, FaChevronDown } from 'react-icons/fa';
import { B } from './constants.js';

export default function ChatHeader({
  room, user, banidos, connected, onlineUsers, typing, members, M,
  onBack, onToggleSide, onOpenDescEdit, onOpenMembers, onOpenContacts,
  onOpenForward, onOpenAudit, toggleBanidos, isOwner, isAdmin, mobile,
}) {
  const padding = { paddingTop: 'env(safe-area-inset-top, 0px)' };
  const nome = room?.nome?.[0]?.toUpperCase() + room?.nome?.slice(1);
  const onlineCount = onlineUsers.size;

  return (
    <div className="chat-header" style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: `${M.mantle}dd`, backdropFilter: 'blur(14px)',
      borderBottom: `1px solid ${M.surface0}`, ...padding,
    }}>
      <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
        {mobile && (
          <button onClick={onBack} aria-label="Voltar" style={{ ...B, padding: '6px', borderRadius: '12px', background: M.surface0, color: M.text, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 4 }}>
            <FaArrowLeft size={14} />
          </button>
        )}

        <div onClick={onOpenDescEdit} style={{ flex: 1, display: 'flex', flexDirection: 'column', cursor: 'pointer', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: M.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nome || 'Carregando...'}</span>
            {room?.tipo === 'privado' ? <FaEnvelope size={12} style={{ color: M.yellow, opacity: 0.8 }} /> : room?.tipo === 'suporte' ? <FaEye size={12} style={{ color: M.green, opacity: 0.8 }} /> : room?.tipo === 'publico' ? <FaGlobe size={12} style={{ color: M.blue, opacity: 0.8 }} /> : <FaUsers size={12} style={{ color: M.mauve, opacity: 0.8 }} />}
            {!connected && <FaChevronDown size={12} />}
          </div>
          <div style={{ fontSize: '0.72rem', color: connected ? M.green : M.red, display: 'flex', alignItems: 'center', gap: 4 }}>
            {connected
              ? <>🟢 {onlineCount} online{typing.length > 0 && ` — ${typing.map(t => t.userName).join(', ')} digitando...`}</>
              : 'Desconectado — tentando reconectar...'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          {(isOwner || isAdmin) && (
            <button onClick={onOpenMembers} title="Gerenciar Membros" aria-label="Gerenciar Membros" style={{ ...B, padding: '8px', background: `${M.mauve}18`, color: M.mauve, borderRadius: '12px', fontSize: '0.76rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <FaUsers size={13} /> {!mobile && `Membros (${members.length})`}
            </button>
          )}
          <button onClick={onToggleSide} title="Informações" aria-label="Informações" style={{ ...B, padding: '8px', background: `${M.surface0}60`, color: M.sub0, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.76rem' }}>
            <FaInfoCircle size={13} /> {!mobile && 'Info'}
          </button>
        </div>
      </div>
    </div>
  );
}
