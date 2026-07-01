import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import { B } from './constants.js';

export default function SidebarUserFooter({ user, onProfile, M }) {
  if (!user) return null;
  return (
    <div style={{
      padding: '10px 12px', borderTop: `1px solid ${M.surface0}`,
      display: 'flex', alignItems: 'center', gap: '8px',
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        background: M.mauve, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontWeight: 700, fontSize: '0.72rem', color: M.crust,
      }}>
        {user.nome?.[0]?.toUpperCase() || '?'}
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{
          fontSize: '0.78rem', fontWeight: 600, overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{user.nome}</div>
        <div style={{
          fontSize: '0.68rem', color: M.green, display: 'flex', alignItems: 'center', gap: '3px',
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: '50%', background: M.green, display: 'inline-block',
          }} /> online
        </div>
      </div>
      <button onClick={onProfile}
        style={{ ...B, background: 'none', color: M.sub0, padding: 8, minWidth: 36, minHeight: 36 }}
        title="Meu perfil"><FaUser size={12} /></button>
      <a href="/chat"
        style={{
          ...B, background: 'none', color: M.sub0, padding: 8, minWidth: 36, minHeight: 36,
          textDecoration: 'none',
        }} title="Voltar"><FaSignOutAlt size={14} /></a>
    </div>
  );
}
