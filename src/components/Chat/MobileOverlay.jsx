export default function MobileOverlay({ mobile, sideOpen, onClose, M }) {
  if (!mobile || !sideOpen) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
      zIndex: 200, backdropFilter: 'blur(2px)',
    }} />
  );
}
