import { FaSave, FaThumbtack, FaUsers } from 'react-icons/fa';
import { B } from './constants.js';

export default function SidebarQuickAccess({ savedMsgs, pinnedMsgs, onSavedClick, onPinnedClick, onContactsClick, M }) {
  return (
    <>
      <div style={{
        padding: '7px 8px 4px', marginTop: 8, fontSize: '0.67rem', fontWeight: 700,
        color: M.ov2, textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        Acesso rápido
      </div>
      <div onClick={onSavedClick}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
          borderRadius: 8, cursor: 'pointer', color: M.sub0, fontSize: '0.83rem',
        }}>
        <FaSave size={12} /> Salvos {savedMsgs.size > 0 &&
          <span style={{
            fontSize: '0.62rem', background: M.surface0, borderRadius: 8,
            padding: '1px 6px', color: M.sub0,
          }}>{savedMsgs.size}</span>}
      </div>
      <div onClick={onPinnedClick}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
          borderRadius: 8, cursor: 'pointer', color: M.sub0, fontSize: '0.83rem',
        }}>
        <FaThumbtack size={12} /> Fixadas {pinnedMsgs.length > 0 &&
          <span style={{
            fontSize: '0.62rem', background: M.surface0, borderRadius: 8,
            padding: '1px 6px', color: M.sub0,
          }}>{pinnedMsgs.length}</span>}
      </div>
      <div onClick={onContactsClick}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
          borderRadius: 8, cursor: 'pointer', color: M.sub0, fontSize: '0.83rem',
        }}>
        <FaUsers size={12} /> Contatos
      </div>
    </>
  );
}
