import { FaArrowUp } from 'react-icons/fa';

export default function ScrollToBottomBtn({ visible, onClick, M }) {
  if (!visible) return null;
  return (
    <button onClick={onClick} aria-label="Rolar para baixo" style={{
      position: 'fixed', bottom: 120, right: 20, zIndex: 50, width: 36, height: 36,
      borderRadius: '50%', border: `1px solid ${M.surface1}`, background: M.surface0,
      color: M.sub0, cursor: 'pointer', display: 'flex', alignItems: 'center',
      justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    }}>
      <FaArrowUp size={14} style={{ transform: 'rotate(180deg)' }} />
    </button>
  );
}
