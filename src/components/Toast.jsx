import { useState, useEffect, useCallback } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const M = { green: '#a6e3a1', red: '#f38ba8', blue: '#89b4fa', surface0: '#313244', text: '#cdd6f4', sub0: '#a6adc8' };

let addToastFn = null;

export function showToast(msg, type = 'info') {
  if (addToastFn) addToastFn(msg, type);
}

const icons = { success: FaCheckCircle, error: FaExclamationCircle, info: FaInfoCircle };
const colors = { success: M.green, error: M.red, info: M.blue };

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((msg, type) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  useEffect(() => { addToastFn = add; return () => { addToastFn = null; }; }, [add]);

  const remove = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 'calc(100vw - 32px)' }}>
      {toasts.map(t => {
        const Icon = icons[t.type] || FaInfoCircle;
        const c = colors[t.type] || M.blue;
        return (
          <div key={t.id} style={{
            background: M.surface0, border: `1px solid ${c}55`, borderRadius: 10,
            padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
            color: M.text, fontSize: '0.85rem', minWidth: 260, maxWidth: 'calc(100vw - 32px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            animation: 'slideIn 0.25s ease-out',
          }}>
            <Icon size={16} color={c} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{t.msg}</span>
            <button onClick={() => remove(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: M.sub0, padding: 2, display: 'flex' }}>
              <FaTimes size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
