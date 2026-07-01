import { FaBold, FaItalic, FaCode, FaListUl, FaPaperclip, FaMicrophone, FaImage, FaGift, FaSmile, FaCheckSquare } from 'react-icons/fa';
import { B } from './constants.js';

export default function FormatToolbar({
  onFormat, onAttach, onRecord, recording, onStopRecord,
  gifOpen, onGifClick, stickerOpen, onStickersClick,
  emojiOpen, onEmojiClick, onSlashHelp, multiSelect, onMultiSelect, fileInputRef, M,
}) {
  return (
    <div style={{
      display: 'flex', gap: 1, padding: '4px 6px 0', borderBottom: `1px solid ${M.surface1}55`,
    }}>
      <button onClick={() => onFormat('**', '**')}
        style={{ ...B, background: 'none', color: M.sub0, padding: '4px 6px', borderRadius: 4 }}
        title="Negrito" aria-label="Negrito"><FaBold size={11} /></button>
      <button onClick={() => onFormat('*', '*')}
        style={{ ...B, background: 'none', color: M.sub0, padding: '4px 6px', borderRadius: 4 }}
        title="Itálico" aria-label="Itálico"><FaItalic size={11} /></button>
      <button onClick={() => onFormat('`', '`')}
        style={{ ...B, background: 'none', color: M.sub0, padding: '4px 6px', borderRadius: 4 }}
        title="Código" aria-label="Código"><FaCode size={11} /></button>
      <button onClick={() => onFormat('\n- ', '')}
        style={{ ...B, background: 'none', color: M.sub0, padding: '4px 6px', borderRadius: 4 }}
        title="Lista" aria-label="Lista"><FaListUl size={11} /></button>
      <div style={{ flex: 1 }} />
      <button onClick={() => fileInputRef.current?.click()}
        style={{ ...B, background: 'none', color: M.sub0, padding: '4px 6px', borderRadius: 4 }}
        title="Anexar" aria-label="Anexar"><FaPaperclip size={11} /></button>
      <input ref={fileInputRef} type="file" hidden
        onChange={e => { onAttach(e.target.files?.[0]); e.target.value = ''; }} />
      <button onClick={() => { if (recording) onStopRecord(); else onRecord(); }}
        style={{
          ...B, background: recording ? M.red + '40' : 'none',
          color: recording ? M.red : M.sub0, padding: '4px 6px', borderRadius: 4,
          animation: recording ? 'pulse 1s infinite' : 'none',
        }}
        title={recording ? 'Parar gravação' : 'Gravar áudio'}
        aria-label={recording ? 'Parar gravação' : 'Gravar áudio'}>
        {recording
          ? <span style={{ width: 8, height: 8, borderRadius: '50%', background: M.red, display: 'inline-block' }} />
          : <FaMicrophone size={11} />}
      </button>
      <button onClick={onGifClick}
        style={{ ...B, background: gifOpen ? M.surface1 : 'none', color: M.sub0, padding: '4px 6px', borderRadius: 4 }}
        title="GIF" aria-label="GIF"><FaImage size={11} /></button>
      <button onClick={onStickersClick}
        style={{ ...B, background: stickerOpen ? M.surface1 : 'none', color: M.sub0, padding: '4px 6px', borderRadius: 4 }}
        title="Stickers" aria-label="Stickers"><FaGift size={11} /></button>
      <button onClick={onEmojiClick}
        style={{ ...B, background: emojiOpen ? M.surface1 : 'none', color: M.sub0, padding: '4px 6px', borderRadius: 4 }}
        title="Emoji" aria-label="Emoji"><FaSmile size={11} /></button>
      <button onClick={onSlashHelp}
        style={{ ...B, background: 'none', color: M.sub0, padding: '4px 6px', borderRadius: 4 }}
        title="Comandos (/)" aria-label="Comandos"><span style={{ fontSize: '11px', fontWeight: 700 }}>/</span></button>
      <button onClick={onMultiSelect}
        style={{
          ...B, background: multiSelect ? M.surface1 : 'none',
          color: multiSelect ? M.mauve : M.sub0, padding: '4px 6px', borderRadius: 4,
        }}
        title="Selecionar" aria-label="Selecionar"><FaCheckSquare size={11} /></button>
    </div>
  );
}
