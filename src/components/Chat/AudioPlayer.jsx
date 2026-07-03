import { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause } from 'react-icons/fa';

export default function AudioPlayer({ file, M }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const progressRef = useRef(null);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onLoaded = () => setDuration(el.duration);
    const onTime = () => { if (!seeking) setCurrent(el.currentTime); };
    const onEnd = () => setPlaying(false);
    el.addEventListener('loadedmetadata', onLoaded);
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('ended', onEnd);
    return () => {
      el.removeEventListener('loadedmetadata', onLoaded);
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('ended', onEnd);
    };
  }, [seeking]);

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) { el.pause(); setPlaying(false); }
    else { el.play().then(() => setPlaying(true)).catch(() => {}); }
  };

  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const seek = (e) => {
    const el = audioRef.current;
    const bar = progressRef.current;
    if (!el || !bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const t = Math.max(0, Math.min(x, 1)) * duration;
    el.currentTime = t;
    setCurrent(t);
  };

  const pct = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, marginTop: 6,
      padding: '6px 10px', background: M.surface0, borderRadius: 8,
      maxWidth: 260, border: `1px solid ${M.surface1}`,
    }}>
      <audio ref={audioRef} src={file.file_url} preload="metadata" />
      <button onClick={toggle} aria-label={playing ? 'Pausar' : 'Ouvir'}
        style={{
          border: 'none', cursor: 'pointer', width: 28, height: 28, borderRadius: '50%',
          background: M.mauve, color: M.crust, display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s',
          fontSize: '0.6rem',
        }}>
        {playing ? <FaPause size={10} /> : <FaPlay size={10} style={{ marginLeft: 2 }} />}
      </button>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: '0.65rem', color: M.sub0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {file.file_name}
        </div>
        <div ref={progressRef} onClick={seek}
          style={{
            width: '100%', height: 4, background: M.surface1, borderRadius: 2,
            cursor: 'pointer', position: 'relative',
          }}>
          <div style={{
            width: `${pct}%`, height: '100%', background: M.mauve, borderRadius: 2,
            transition: seeking ? 'none' : 'width 0.1s linear',
          }} />
        </div>
        <div style={{ fontSize: '0.6rem', color: M.ov0, display: 'flex', justifyContent: 'space-between' }}>
          <span>{fmt(current)}</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>
    </div>
  );
}
