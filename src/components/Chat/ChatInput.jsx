import { FaPaperPlane, FaSpinner } from 'react-icons/fa';
import { B } from './constants.js';
import ReplyIndicator from './ReplyIndicator.jsx';
import MentionAutocomplete from './MentionAutocomplete.jsx';
import SlashAutocomplete from './SlashAutocomplete.jsx';
import FormatToolbar from './FormatToolbar.jsx';
import EmojiPicker from './EmojiPicker.jsx';
import StickerPicker from './StickerPicker.jsx';
import GifPicker from './GifPicker.jsx';

export default function ChatInput({
  input, sending, replyingTo, M, room, taRef, fileInputRef,
  mentionOpen, mentionIndex, members, userId, onSelectMention,
  slashOpen, slashFilter, onSelectSlash,
  showEmoji, onEmojiClick, showStickers, onStickersClick,
  showGif, onGifOpen, gifQuery, gifResults, onGifSearch, onGifSelect,
  onGifClose, onEmojiSelect,
  recording, multiSelect,
  onFormat, onAttach, onRecord, onStopRecord,
  onMultiSelectToggle, onSlashHelp,
  onSend, onInputChange, onPaste, onTextareaKeyDown, onCancelReply,
}) {
  return (
    <div style={{ background: M.mantle, borderTop: `1px solid ${M.surface0}`, padding: '8px 14px 10px', flexShrink: 0 }}>
      <ReplyIndicator replyingTo={replyingTo} onCancel={onCancelReply} M={M} />

      {mentionOpen && (
        <MentionAutocomplete members={members} userId={userId} mentionIndex={mentionIndex}
          onSelect={onSelectMention} M={M} />
      )}

      {slashOpen && (
        <SlashAutocomplete filter={slashFilter}
          onSelect={onSelectSlash} M={M} />
      )}

      <div style={{ background: M.surface0, borderRadius: '12px', display: 'flex', flexDirection: 'column', border: input.trim() ? `1px solid ${M.mauve}45` : 'none', transition: 'border 0.15s', position: 'relative' }}>
        <FormatToolbar onFormat={onFormat} onAttach={onAttach} onRecord={onRecord}
          recording={recording} onStopRecord={onStopRecord}
          gifOpen={showGif} onGifClick={onGifOpen}
          stickerOpen={showStickers} onStickersClick={onStickersClick}
          emojiOpen={showEmoji} onEmojiClick={onEmojiClick}
          onSlashHelp={onSlashHelp}
          multiSelect={multiSelect} onMultiSelect={onMultiSelectToggle}
          fileInputRef={fileInputRef} M={M} />
        {showEmoji && <EmojiPicker onEmojiSelect={onEmojiSelect} M={M} />}
        {showStickers && <StickerPicker onStickerSelect={onEmojiSelect} M={M} />}
        {showGif && <GifPicker query={gifQuery} results={gifResults} searching={false}
          onSearch={onGifSearch} onSelect={onGifSelect}
          onClose={onGifClose} M={M} />}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', padding: '2px 4px 4px 4px' }}>
          <textarea ref={taRef} value={input} onChange={onInputChange}
            onKeyDown={onTextareaKeyDown}
            onPaste={onPaste}
            placeholder="Digite uma mensagem..."
            rows={1} aria-label="Campo de mensagem"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: M.text, fontFamily: 'inherit', fontSize: '0.875rem', resize: 'none', lineHeight: '1.5', padding: '8px 0 8px 8px', maxHeight: '120px', overflowY: 'auto' }} />
          <button onClick={onSend} disabled={!input.trim() || sending}
            style={{ ...B, padding: '8px', borderRadius: '9px', flexShrink: 0, background: sending ? M.surface1 : (input.trim() ? M.mauve : M.surface1), color: sending ? M.ov0 : (input.trim() ? M.crust : M.ov0), cursor: (!input.trim() || sending) ? 'not-allowed' : 'pointer', opacity: sending ? 0.6 : 1 }}>
            {sending ? <FaSpinner size={17} style={{ animation: 'spin 1s linear infinite' }} /> : <FaPaperPlane size={17} />}
          </button>
        </div>
      </div>
      <p style={{ margin: '5px 0 0', fontSize: '0.67rem', color: M.ov0, textAlign: 'center' }}>
        Enter enviar · Shift+Enter linha · <kbd style={{ background: M.surface0, padding: '1px 4px', borderRadius: 3, fontFamily: 'monospace', fontSize: '0.65rem' }}>?</kbd> atalhos · <kbd style={{ background: M.surface0, padding: '1px 4px', borderRadius: 3, fontFamily: 'monospace', fontSize: '0.65rem' }}>Ctrl+K</kbd> buscar · @ menção · / comandos · <kbd style={{ background: M.surface0, padding: '1px 4px', borderRadius: 3, fontFamily: 'monospace', fontSize: '0.65rem' }}>F11</kbd> tela cheia
      </p>
    </div>
  );
}
