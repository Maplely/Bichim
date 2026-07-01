import { FaTimes, FaTrash, FaShare, FaSave } from 'react-icons/fa';
import { B } from './constants.js';

export default function MultiSelectBar({ selectedMsgs, M, onClear, onDelete, onForward, onSave }) {
  if (selectedMsgs.size === 0) return null;
  return (
    <div style={{
      position: 'sticky', bottom: 0, zIndex: 99,
      background: `${M.mauve}15`, borderTop: `1px solid ${M.mauve}30`,
      backdropFilter: 'blur(12px)', padding: '10px 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ color: M.text, fontSize: '0.82rem', fontWeight: 600 }}>
        {selectedMsgs.size} selecionada{selectedMsgs.size > 1 ? 's' : ''}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onSave} style={{ ...B, padding: '8px 12px', background: M.surface0, borderRadius: 10, color: M.blue, fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: 4 }}>
          <FaSave size={12} /> Salvar
        </button>
        <button onClick={onForward} style={{ ...B, padding: '8px 12px', background: M.surface0, borderRadius: 10, color: M.mauve, fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: 4 }}>
          <FaShare size={12} /> Encaminhar
        </button>
        <button onClick={onDelete} style={{ ...B, padding: '8px 12px', background: `${M.red}20`, borderRadius: 10, color: M.red, fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: 4 }}>
          <FaTrash size={12} /> Excluir
        </button>
        <button onClick={onClear} style={{ ...B, padding: 8, background: M.surface0, borderRadius: 10, color: M.sub0, display: 'flex' }}>
          <FaTimes size={14} />
        </button>
      </div>
    </div>
  );
}
