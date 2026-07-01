import { FaComment } from 'react-icons/fa';

export default function EmptyMessages({ M }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: M.ov0, gap: '10px' }}>
      <FaComment size={40} style={{ opacity: 0.3 }} />
      <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 600 }}>Nenhuma mensagem ainda</p>
      <p style={{ margin: 0, fontSize: '0.82rem' }}>Seja o primeiro a enviar uma mensagem!</p>
    </div>
  );
}
