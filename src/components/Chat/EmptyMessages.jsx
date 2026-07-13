export default function EmptyMessages({ M }) {
  const logoSrc = M.base === '#0F0F0F' ? '/BichimDarkMode.svg' : '/BichimWhiteMode.svg';
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: M.ov0, gap: '10px' }}>
      <img src={logoSrc} alt="Bichim" style={{ width: 48, height: 48, opacity: 0.3 }} />
      <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 600 }}>Nenhuma mensagem ainda</p>
      <p style={{ margin: 0, fontSize: '0.82rem' }}>Seja o primeiro a enviar uma mensagem!</p>
    </div>
  );
}
