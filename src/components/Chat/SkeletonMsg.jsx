export default function SkeletonMsg() {
  return (
    <div style={{ display: 'flex', gap: 8, padding: '10px 0' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--s0, #252525)', flexShrink: 0, animation: 'pulse 1.5s infinite' }} />
      <div style={{ flex: 1 }}>
        <div style={{ width: 80, height: 10, background: 'var(--s0, #252525)', borderRadius: 4, marginBottom: 6, animation: 'pulse 1.5s infinite' }} />
        <div style={{ width: '60%', height: 32, background: 'var(--s0, #252525)', borderRadius: 8, animation: 'pulse 1.5s infinite' }} />
      </div>
    </div>
  );
}
