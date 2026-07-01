import { FaExclamationTriangle } from 'react-icons/fa';

export default function ReconnectBanner({ connected, M }) {
  if (connected) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      background: M.red, color: M.crust, textAlign: 'center',
      padding: '6px 16px', fontSize: '0.78rem', fontWeight: 600,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    }}>
      <FaExclamationTriangle size={12} /> Reconectando...
    </div>
  );
}
