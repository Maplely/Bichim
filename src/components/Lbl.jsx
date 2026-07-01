const M = {
  sub1: '#808080',
};

export default function Lbl({ children }) {
  return (
    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: M.sub1, marginBottom: '6px' }}>
      {children}
    </div>
  );
}
