export default function UnreadDivider({ M }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
      <div style={{ flex: 1, height: 1, background: M.mauve }} />
      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: M.mauve, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>Novas mensagens</span>
      <div style={{ flex: 1, height: 1, background: M.mauve }} />
    </div>
  );
}
