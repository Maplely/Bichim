import { FaSave, FaPaintBrush, FaCode, FaUserPlus, FaUsers, FaGlobeAmericas, FaThumbtack, FaBan, FaTrash, FaVolumeMute, FaVolumeUp, FaShare, FaClipboard } from 'react-icons/fa';
import { B } from './constants.js';

const styleBtn = (M) => ({ ...B, width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, fontSize: '0.78rem', color: M.text, background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' });

const labels = {
  save: 'Salvar mensagem', saved: 'Remover dos salvos',
  edit: 'Editar', reply: 'Responder', copy: 'Copiar texto',
  pin: 'Fixar', unpin: 'Desafixar',
  delete: 'Excluir', forward: 'Encaminhar',
  report: 'Denunciar', mute: 'Silenciar', unmute: 'Ativar som',
  ban: 'Banir', unban: 'Desbanir',
  profile: 'Ver perfil',
};

const icons = {
  save: FaSave, saved: FaSave, edit: FaPaintBrush, reply: FaShare, copy: FaClipboard,
  pin: FaThumbtack, unpin: FaThumbtack, delete: FaTrash, forward: FaShare,
  report: FaCode, mute: FaVolumeMute, unmute: FaVolumeUp,
  ban: FaBan, unban: FaBan, profile: FaUserPlus,
};

export default function ChatHeaderActions({ actions, onAction, M, onClose }) {
  if (!actions || actions.length === 0) return null;
  return (
    <div style={{ padding: '4px 0' }}>
      {actions.map((action, i) => {
        const Icon = icons[action] || FaGlobeAmericas;
        const label = labels[action] || action;
        return (
          <button key={i} onClick={() => { onAction(action); onClose?.(); }} style={styleBtn(M)}
            onMouseEnter={e => e.currentTarget.style.background = M.surface0}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <Icon size={12} style={{ color: M.sub0 }} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
