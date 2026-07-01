import { useState, useEffect } from 'react';
import { FaComment, FaSignOutAlt, FaPlus, FaHashtag, FaClipboard, FaCheck, FaArrowRight, FaArrowLeft, FaRocket, FaSmile } from 'react-icons/fa';
import RoomCard from './RoomCard.jsx';
import Modal from './Modal.jsx';
import Lbl from './Lbl.jsx';
import ThemeToggle, { getTheme, applyTheme } from './ThemeToggle.jsx';
import { light, dark } from './Chat/constants.js';

const B = {
  border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
  fontFamily: 'inherit', transition: 'all 0.15s', display: 'flex',
  alignItems: 'center', justifyContent: 'center', gap: '6px',
};

function SkeletonCard({ M }) {
  return (
    <div style={{
      background: M.mantle, border: `1px solid ${M.surface0}`, borderRadius: '12px',
      padding: '14px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: M.surface0, animation: 'pulse 1.5s infinite' }} />
        <div style={{ flex: 1 }}>
          <div style={{ width: '60%', height: 12, background: M.surface0, borderRadius: 4, marginBottom: 4, animation: 'pulse 1.5s infinite' }} />
          <div style={{ width: '30%', height: 10, background: M.surface0, borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
        </div>
      </div>
      <div style={{ width: '40%', height: 10, background: M.surface0, borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
    </div>
  );
}

function genCode() {
  const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 6 }, () => c[Math.floor(Math.random() * c.length)]).join('');
}

function getToken() {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? match[1] : null;
}

export default function Dashboard({ token: _token }) {
  const [theme, setThemeState] = useState(getTheme);
  const M = theme === 'light' ? light : dark;

  const setTheme = (t) => { setThemeState(t); applyTheme(t); };

  const I = {
    background: M.base, border: `1px solid ${M.surface0}`, borderRadius: '8px',
    color: M.text, fontFamily: 'inherit', fontSize: '0.875rem',
    padding: '10px 12px', outline: 'none', width: '100%', boxSizing: 'border-box',
  };

  const token = _token || getToken();
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  const API = '';

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const fetchMe = () =>
    fetch(`${API}/api/auth/me`, { headers, credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(setUser);

  const fetchRooms = () =>
    fetch(`${API}/api/rooms`, { headers, credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then(setRooms)
      .finally(() => setLoading(false));

  useEffect(() => {
    fetchMe();
    fetchRooms();
  }, []);

  const handleLogout = () => {
    fetch(`${API}/api/auth/logout`, {
      method: 'POST', headers, credentials: 'include',
    }).finally(() => {
      document.cookie = 'token=; path=/; max-age=0';
      window.location.href = '/auth/login';
    });
  };

  const handleEnter = (room) => {
    window.location.href = `/chat/${room.id}`;
  };

  const handleDelete = (roomId) => {
    fetch(`${API}/api/rooms/${roomId}`, {
      method: 'DELETE', headers, credentials: 'include',
    }).then(r => {
      if (r.ok) setRooms(rs => rs.filter(x => x.id !== roomId));
    });
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: M.base, color: M.text, fontFamily: 'system-ui,-apple-system,sans-serif' }}>
        <header style={{
          background: M.mantle, borderBottom: `1px solid ${M.surface0}`,
          padding: '13px 20px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: M.surface0, animation: 'pulse 1.5s infinite' }} />
            <div style={{ width: 100, height: 14, background: M.surface0, borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
          </div>
          <ThemeToggle M={M} />
        </header>
        <main style={{ maxWidth: '920px', margin: '0 auto', padding: '24px 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '10px' }}>
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} M={M} />)}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: M.base, fontFamily: 'system-ui,-apple-system,sans-serif', color: M.text }}>
      <header style={{
        background: M.mantle, borderBottom: `1px solid ${M.surface0}`,
        padding: '13px 20px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: M.mauve, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaComment size={15} color={M.crust} />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1rem' }}>Bichim</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ThemeToggle M={M} />
          <div style={{
            width: 30, height: 30, borderRadius: '50%', background: M.mauve,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.8rem', color: M.crust,
          }}>
            {user?.nome?.[0]?.toUpperCase() || '?'}
          </div>
          <button onClick={handleLogout} style={{ ...B, background: 'none', color: M.sub0, padding: '6px' }} title="Sair" aria-label="Sair"><FaSignOutAlt size={14} /></button>
        </div>
      </header>

      <main style={{ maxWidth: '920px', margin: '0 auto', padding: '24px 16px' }}>
        <div style={{
          background: `${M.green}12`, border: `1px solid ${M.green}35`,
          borderRadius: '12px', padding: '12px 16px', marginBottom: '24px',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <FaRocket size={18} color={M.green} />
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: M.green }}>Servidor ativo</div>
            <div style={{ fontSize: '0.73rem', color: M.sub0 }}>
              Acessível de qualquer lugar via túnel
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ margin: '0 0 3px', fontSize: '1.25rem', fontWeight: 700 }}>
              Olá, {user?.nome || 'Usuário'} 
            </h2>
            <p style={{ margin: 0, color: M.sub0, fontSize: '0.82rem' }}>
              {rooms.length} sala{rooms.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setShowCreate(true)} style={{ ...B, background: M.mauve, color: M.crust, padding: '9px 16px', fontSize: '0.84rem' }}>
              <FaPlus size={14} /> Nova sala
            </button>
            <button onClick={() => setShowJoin(true)} style={{ ...B, background: M.surface0, color: M.text, padding: '9px 16px', fontSize: '0.84rem' }}>
              <FaHashtag size={12} /> Entrar com código
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '10px' }}>
          {rooms.map(r => (
            <RoomCard key={r.id} room={r} onEnter={() => handleEnter(r)} onDelete={r.is_owner ? () => handleDelete(r.id) : null} />
          ))}
        </div>

        {rooms.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: M.sub0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <FaComment size={48} style={{ opacity: 0.2 }} />
            <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: M.text }}>Nenhuma sala ainda</p>
            <p style={{ margin: 0, fontSize: '0.83rem' }}>Crie uma sala ou entre com um código para começar a conversar.</p>
          </div>
        )}
      </main>

      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreate={(r) => { window.location.href = `/chat/${r.id}`; }}
          token={token} M={M} I={I}
        />
      )}
      {showJoin && (
        <JoinModal
          onClose={() => setShowJoin(false)}
          onJoin={(r) => { handleEnter(r); setShowJoin(false); }}
          token={token} M={M} I={I}
        />
      )}
    </div>
  );
}

function CreateModal({ onClose, onCreate, token, M, I }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [code] = useState(genCode);
  const [usePw, setUsePw] = useState(false);
  const [pw, setPw] = useState('');
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState('');

  const copy = () => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const create = async () => {
    if (!name.trim()) { setErr('Nome da sala é obrigatório'); return; }
    try {
      const r = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: name.trim(), password: usePw ? pw : null, code, description: desc.trim() || undefined }),
        credentials: 'include',
      });
      if (r.ok) {
        const room = await r.json();
        onCreate(room);
      } else {
        const errData = await r.json();
        setErr(errData.erro || 'Erro ao criar sala');
      }
    } catch {
      setErr('Erro ao criar sala');
    }
  };

  return (
    <Modal title="Nova sala" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <Lbl htmlFor="roomNameInput">Nome da sala</Lbl>
          <input id="roomNameInput" type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="minha-sala" autoFocus style={I}
            onKeyDown={e => e.key === 'Enter' && create()} />
        </div>
        <div>
          <Lbl htmlFor="roomDescInput">Descrição (opcional)</Lbl>
          <textarea id="roomDescInput" value={desc} onChange={e => setDesc(e.target.value)}
            placeholder="Descrição da sala..."
            rows={2} style={{ ...I, resize: 'none', fontFamily: 'inherit' }} />
        </div>
        <div>
          <Lbl htmlFor="roomCodeInput">Código de convite (automático)</Lbl>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ ...I, flex: 1, fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.12em', color: M.mauve, cursor: 'default' }}>
              {code}
            </div>
            <button onClick={copy} style={{ ...B, background: copied ? M.green : M.surface0, color: copied ? M.crust : M.text, padding: '10px 14px', flexShrink: 0 }}>
              {copied ? <FaCheck size={14} /> : <FaClipboard size={14} />}
            </button>
          </div>
          <p style={{ margin: '5px 0 0', color: M.sub0, fontSize: '0.73rem' }}>
            Compartilhe para convidar — código de 6 dígitos gerado automaticamente.
          </p>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: M.sub1, fontSize: '0.84rem' }}>
          <input type="checkbox" checked={usePw} onChange={e => setUsePw(e.target.checked)} style={{ accentColor: M.mauve, width: 15, height: 15 }} />
          Adicionar senha (opcional)
        </label>
        {usePw && (
          <div>
            <Lbl htmlFor="roomPwInput">Senha da sala</Lbl>
            <input id="roomPwInput" type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Senha da sala" style={I} />
          </div>
        )}
        {err && <p style={{ margin: 0, color: M.red, fontSize: '0.8rem' }}>{err}</p>}
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <button onClick={onClose} style={{ ...B, flex: 1, padding: '11px', background: M.surface0, color: M.text, fontSize: '0.84rem' }}>Cancelar</button>
          <button onClick={create} style={{ ...B, flex: 2, padding: '11px', background: M.mauve, color: M.crust, fontSize: '0.84rem' }}><FaPlus size={14} /> Criar sala</button>
        </div>
      </div>
    </Modal>
  );
}

function JoinModal({ onClose, onJoin, token, M, I }) {
  const [code, setCode] = useState('');
  const [pw, setPw] = useState('');
  const [step, setStep] = useState(1);
  const [err, setErr] = useState('');

  const next = async () => {
    const c = code.trim().toUpperCase();
    if (c.length !== 6) { setErr('O código deve ter exatamente 6 caracteres.'); return; }
    setErr('');
    try {
      const r = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code: c }),
        credentials: 'include',
      });
      if (r.ok) {
        const room = await r.json();
        onJoin(room);
      } else if (r.status === 400) {
        const errData = await r.json();
        if (errData.erro === 'Senha obrigatória para esta sala') {
          setStep(2);
        } else {
          setErr(errData.erro || 'Erro ao entrar na sala');
        }
      } else {
        const errData = await r.json();
        setErr(errData.erro || 'Erro ao entrar na sala');
      }
    } catch {
      setErr('Erro ao entrar na sala');
    }
  };

  const joinRoom = async (joinCode, password) => {
    try {
      const r = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code: joinCode || code, password: password || pw || null }),
        credentials: 'include',
      });
      if (r.ok) {
        const room = await r.json();
        onJoin(room);
      } else {
        const errData = await r.json();
        setErr(errData.erro || 'Erro ao entrar na sala');
      }
    } catch {
      setErr('Erro ao entrar na sala');
    }
  };

  return (
    <Modal title={step === 1 ? 'Entrar com código' : 'Senha da sala'} onClose={onClose}>
      {step === 1 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <Lbl htmlFor="joinCodeInput">Código da sala (6 caracteres)</Lbl>
            <input id="joinCodeInput" type="text" value={code}
              onChange={e => setCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="UFP42X" maxLength={6} autoFocus
              style={{ ...I, fontFamily: 'monospace', fontSize: '1.15rem', fontWeight: 700, letterSpacing: '0.2em', textAlign: 'center' }}
              onKeyDown={e => e.key === 'Enter' && next()} />
          </div>
          {err && <p style={{ margin: 0, color: M.red, fontSize: '0.8rem' }}>{err}</p>}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onClose} style={{ ...B, flex: 1, padding: '11px', background: M.surface0, color: M.text, fontSize: '0.84rem' }}>Cancelar</button>
            <button onClick={next} style={{ ...B, flex: 2, padding: '11px', background: M.blue, color: M.crust, fontSize: '0.84rem' }}>Continuar <FaArrowRight size={12} /></button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ margin: 0, color: M.sub0, fontSize: '0.84rem' }}>
            A sala é protegida por senha.
          </p>
          <div>
            <Lbl htmlFor="joinPwInput">Senha</Lbl>
            <input id="joinPwInput" type="password" value={pw} onChange={e => setPw(e.target.value)}
              placeholder="••••••••" autoFocus style={I}
              onKeyDown={e => e.key === 'Enter' && joinRoom(code, pw)} />
          </div>
          {err && <p style={{ margin: 0, color: M.red, fontSize: '0.8rem' }}>{err}</p>}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => { setStep(1); setErr(''); }} style={{ ...B, flex: 1, padding: '11px', background: M.surface0, color: M.text, fontSize: '0.84rem' }}><FaArrowLeft size={12} /> Voltar</button>
            <button onClick={() => joinRoom(code, pw)} style={{ ...B, flex: 2, padding: '11px', background: M.blue, color: M.crust, fontSize: '0.84rem' }}>Entrar</button>
          </div>
        </div>
      )}
    </Modal>
  );
}
