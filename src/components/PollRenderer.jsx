import { useState, useEffect } from 'react';
import { FaCheck, FaChartBar } from 'react-icons/fa';

const M = {
  mauve: '#cba6f7', surface0: '#313244', surface1: '#45475a',
  crust: '#11111b', text: '#cdd6f4', sub0: '#a6adc8', ov0: '#6c7086',
  green: '#a6e3a1', blue: '#89b4fa', peach: '#fab387', red: '#f38ba8',
};

export default function PollRenderer({ poll, onVote, userVoted, isClosed }) {
  const total = poll.options?.reduce((s, o) => s + (o.votes || 0), 0) || 0;

  return (
    <div style={{ background: M.surface0, borderRadius: 12, border: `1px solid ${M.surface1}`, padding: '12px 14px', maxWidth: 320, marginTop: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <FaChartBar size={12} color={M.mauve} />
        <span style={{ fontWeight: 600, fontSize: '0.84rem', color: M.text, flex: 1 }}>{poll.question}</span>
        {isClosed && <span style={{ fontSize: '0.62rem', color: M.ov0, background: M.surface1, padding: '1px 6px', borderRadius: 4 }}>Encerrada</span>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {poll.options.map(opt => {
          const pct = total > 0 ? Math.round((opt.votes || 0) / total * 100) : 0;
          const selected = userVoted === opt.id;
          return (
            <div key={opt.id} onClick={() => !isClosed && onVote?.(opt.id)}
              style={{ cursor: isClosed ? 'default' : 'pointer', position: 'relative', background: selected ? `${M.mauve}15` : M.surface1, borderRadius: 8, padding: '8px 10px', overflow: 'hidden', transition: 'background 0.15s' }}
              onMouseEnter={e => { if (!isClosed) e.currentTarget.style.background = M.mauve + '25'; }}
              onMouseLeave={e => { if (!isClosed) e.currentTarget.style.background = selected ? `${M.mauve}15` : M.surface1; }}>
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${pct}%`, background: selected ? `${M.mauve}30` : M.surface0, transition: 'width 0.3s', borderRadius: 8 }} />
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, zIndex: 1 }}>
                <span style={{ fontSize: '0.8rem', color: M.text, flex: 1 }}>{opt.text}</span>
                <span style={{ fontSize: '0.68rem', color: M.ov0, fontWeight: 600, minWidth: 30, textAlign: 'right' }}>{pct}%</span>
                {selected && <FaCheck size={10} color={M.mauve} />}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: '0.6rem', color: M.ov0, marginTop: 8, textAlign: 'right' }}>
        {total} voto(s)
      </div>
    </div>
  );
}
