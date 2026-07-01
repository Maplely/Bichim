import { FaTimes, FaCheck, FaUser, FaCrown, FaUserShield, FaStar } from 'react-icons/fa';
import { B, getColor } from './constants.js';

export default function ProfileModal({ profileUser, M, onClose, onStartDM }) {
  if (!profileUser) return null;

  const color = getColor(profileUser.nome);

  const stats = [
    { label: 'Mensagens', value: profileUser.msg_count ?? '—' },
    { label: 'Contagem', value: profileUser.contagem ?? '—' },
    { label: 'Nível', value: profileUser.verification ?? 0 },
    { label: 'Votos', value: profileUser.votos ?? '—' },
  ];

  return (
    <div role="dialog" aria-modal="true" aria-label="Perfil" onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px', backdropFilter: 'blur(4px)',
    }}>
      <div style={{ background: M.mantle, border: `1px solid ${M.surface0}`, borderRadius: '16px', width: '100%', maxWidth: '360px', overflow: 'hidden' }}>
        <div style={{ background: `linear-gradient(135deg, ${color}40, ${M.mantle})`, padding: '24px 20px 20px', position: 'relative' }}>
          <button onClick={onClose} aria-label="Fechar" style={{ ...B, position: 'absolute', top: 12, right: 12, padding: 6, background: 'rgba(0,0,0,0.3)', borderRadius: 10, color: '#fff', display: 'flex' }}><FaTimes size={14} /></button>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>{profileUser.nome?.[0]?.toUpperCase()}</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                {profileUser.nome}
                {profileUser.role === 'owner' && <FaCrown size={13} style={{ color: M.yellow }} />}
                {profileUser.role === 'admin' && <FaUserShield size={13} style={{ color: M.blue }} />}
                {profileUser.verification >= 2 && <FaCheck size={12} style={{ color: M.green }} />}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.76rem' }}>{profileUser.role === 'owner' ? 'Dono' : profileUser.role === 'admin' ? 'Admin' : 'Membro'}</div>
            </div>
          </div>
        </div>
        <div style={{ padding: '16px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            {stats.map(s => (
              <div key={s.label} style={{ background: M.surface0, borderRadius: 10, padding: '10px', textAlign: 'center' }}>
                <div style={{ color: M.text, fontWeight: 700, fontSize: '0.9rem' }}>{s.value}</div>
                <div style={{ color: M.sub0, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.02em', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <button onClick={() => { onStartDM?.(profileUser.id); onClose?.(); }} style={{ ...B, width: '100%', padding: '10px', background: M.mauve, color: '#fff', borderRadius: 10, fontSize: '0.82rem', fontWeight: 600 }}>
            Enviar mensagem
          </button>
        </div>
      </div>
    </div>
  );
}
