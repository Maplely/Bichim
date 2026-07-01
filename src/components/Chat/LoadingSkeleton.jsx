import SkeletonMsg from './SkeletonMsg.jsx';

const SW = 232;

export default function LoadingSkeleton({ M }) {
  return (
    <div style={{ height: '100vh', display: 'flex', background: M.base, fontFamily: 'system-ui,-apple-system,sans-serif', color: M.text, overflow: 'hidden' }}>
      <div style={{ width: SW, flexShrink: 0, background: M.mantle, display: 'flex', flexDirection: 'column', height: '100vh', borderRight: `1px solid ${M.surface0}` }}>
        <div style={{ padding: '13px 14px', borderBottom: `1px solid ${M.surface0}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: M.surface0, animation: 'pulse 1.5s infinite' }} />
          <div style={{ width: 100, height: 12, background: M.surface0, borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
        </div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', margin: '2px 6px' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: M.surface0, animation: 'pulse 1.5s infinite' }} />
            <div style={{ flex: 1, height: 10, background: M.surface0, borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
          </div>
        ))}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '10px 14px' }}>
        {[1, 2, 3].map(i => <SkeletonMsg key={i} />)}
      </div>
    </div>
  );
}
