const M = { surface0: '#252525', overlay0: '#636363' };

function fmt(d) {
  const now = new Date();
  const t = new Date(d);
  const s = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (s(t, now)) return 'Hoje';
  const y = new Date(now); y.setDate(y.getDate() - 1);
  if (s(t, y)) return 'Ontem';
  return t.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: t.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}

export default function DateSeparator({ date }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0 8px' }}>
      <div style={{ flex: 1, height: 1, background: M.surface0 }} />
      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: M.overlay0, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
        {fmt(date)}
      </span>
      <div style={{ flex: 1, height: 1, background: M.surface0 }} />
    </div>
  );
}
