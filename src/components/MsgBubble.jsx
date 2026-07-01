import { useState, useRef } from 'react';
import { marked } from 'marked';
import { FaEdit, FaTrash, FaReply, FaCheckDouble, FaDownload, FaThumbtack, FaClock, FaLanguage } from 'react-icons/fa';

marked.setOptions({ breaks: true, gfm: true });

const _M = {
  mauve: '#EA5A3E', surface0: '#252525', surface1: '#2D2D2D',
  crust: '#252525', sub0: '#BFBFBF', ov0: '#636363', peach: '#FFB547',
  green: '#4ADE80', blue: '#60A5FA', yellow: '#FDB022', red: '#FF6B6B',
  pink: '#3A2420', text: '#FFFFFF',
  s0: '#252525', s1: '#2D2D2D',
};

const avatarColors = ['#EA5A3E', '#C4871C', '#60A5FA', '#4ADE80', '#FDB022', '#BE8700', '#C4B5A0', '#FF8A6B'];

function getColor(name) {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

const emojis = ['👍', '❤️', '😂', '😮', '😢', '🙏'];
const emojiRegex = /^(\p{Emoji}|[\u2600-\u27BF\u2B50\uFE0F\u200D]){1,3}$/u;
const urlRegex = /https?:\/\/[^\s<]+[^\s<.,;:!?)]/g;

function highlightCode(code, lang) {
  const keywords = { js: ['const','let','var','function','return','if','else','class','import','export','from','await','async','new','this','true','false','null','undefined'], py: ['def','class','return','if','else','import','from','True','False','None','self','for','while','in','not','and','or','print'], sql: ['SELECT','FROM','WHERE','INSERT','INTO','VALUES','UPDATE','SET','DELETE','CREATE','TABLE','JOIN','ON','GROUP','BY','ORDER','LIMIT','AND','OR','NOT','NULL'] };
  const kw = keywords[lang] || keywords.js;
  let h = code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  kw.forEach(k => { h = h.replace(new RegExp(`\\b(${k})\\b`, 'gi'), `<span style="color:${M.mauve};font-weight:600">$1</span>`); });
  h = h.replace(/(".*?"|'.*?')/g, `<span style="color:${M.green}">$1</span>`);
  h = h.replace(/(\/\/.*)/g, `<span style="color:${M.ov0}">$1</span>`);
  h = h.replace(/(\/\*[\s\S]*?\*\/)/g, `<span style="color:${M.ov0}">$1</span>`);
  h = h.replace(/\b(\d+)\b/g, `<span style="color:${M.peach}">$1</span>`);
  return h;
}

function renderMd(raw, previews) {
  if (!raw) return '';
  const html = marked.parse(raw);
  let r = html
    .replace(/<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g, (_, lang, code) => {
      const hl = highlightCode(code, lang);
      return `<div style="background:${M.crust};border:1px solid ${M.s1};border-radius:10px;overflow:hidden;margin:8px 0 4px;"><div style="padding:3px 12px;font-size:0.7rem;color:${M.sub0};font-family:monospace;background:${M.s0};border-bottom:1px solid ${M.s1};display:flex;justify-content:space-between"><span>${lang}</span><span style="cursor:pointer;display:inline-flex;align-items:center" onclick="navigator.clipboard.writeText(this.closest('div').nextSibling.textContent)" title="Copiar código"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 384 512" fill="currentColor"><path d="M336 64h-80c0-35.3-28.7-64-64-64s-64 28.7-64 64H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48zM192 40c13.3 0 24 10.7 24 24s-10.7 24-24 24-24-10.7-24-24 10.7-24 24-24zm144 418c0 3.3-2.7 6-6 6H54c-3.3 0-6-2.7-6-6V118c0-3.3 2.7-6 6-6h42v36c0 6.6 5.4 12 12 12h168c6.6 0 12-5.4 12-12v-36h42c3.3 0 6 2.7 6 6v340z"/></svg></span></div><pre style="margin:0;padding:10px 14px;overflow-x:auto;font-size:0.8rem;line-height:1.4;tab-size:2"><code>${hl}</code></pre></div>`;
    })
    .replace(/<pre>/g, `<div style="background:${M.crust};border:1px solid ${M.s1};border-radius:10px;overflow:hidden;margin:8px 0 4px;"><div style="padding:3px 12px;font-size:0.7rem;color:${M.sub0};font-family:monospace;background:${M.s0};border-bottom:1px solid ${M.s1};">código</div><pre style="margin:0;padding:10px 14px;overflow-x:auto;">`)
    .replace(/<\/pre>/g, '</pre></div>')
    .replace(/<code>/g, `<code style="background:${M.s0};color:${M.peach};padding:1px 6px;border-radius:4px;font-family:monospace;font-size:0.875em;">`)
    .replace(/<h1>/g, `<div style="font-size:1.8em;font-weight:700;color:${M.mauve};margin:10px 0 4px;line-height:1.3;">`)
    .replace(/<\/h1>/g, '</div>')
    .replace(/<h2>/g, `<div style="font-size:1.4em;font-weight:700;color:${M.blue};margin:8px 0 3px;line-height:1.3;">`)
    .replace(/<\/h2>/g, '</div>')
    .replace(/<h3>/g, `<div style="font-size:1.15em;font-weight:700;color:${M.yellow};margin:6px 0 3px;line-height:1.3;">`)
    .replace(/<\/h3>/g, '</div>')
    .replace(/<ul>/g, '<ul style="margin:4px 0;padding-left:20px;list-style:none;">')
    .replace(/<li>/g, `<li style="margin:2px 0;display:flex;gap:6px;align-items:flex-start;"><span style="color:${M.mauve};margin-top:1px;">•</span><span>`)
    .replace(/<\/li>/g, '</span></li>')
    .replace(/<input disabled="" type="checkbox" checked="">/g, `<span style="color:${M.green};font-weight:700;">✓</span>`)
    .replace(/<input disabled="" type="checkbox">/g, `<span style="color:${M.ov0};">○</span>`)
    .replace(/<blockquote>/g, `<blockquote style="border-left:3px solid ${M.mauve};margin:6px 0;padding:4px 10px;color:${M.sub0};background:${M.s0};border-radius:0 8px 8px 0;">`)
    .replace(/<hr>/g, `<hr style="border:none;border-top:1px solid ${M.s1};margin:8px 0;">`)
    .replace(/<a /g, `<a style="color:${M.blue};text-decoration:underline;" target="_blank" rel="noopener noreferrer" `)
    .replace(/<table>/g, `<table style="border-collapse:collapse;margin:6px 0;width:100%;font-size:0.85em;">`)
    .replace(/<th>/g, `<th style="border:1px solid ${M.s1};padding:6px 10px;background:${M.s0};text-align:left;">`)
    .replace(/<td>/g, `<td style="border:1px solid ${M.s1};padding:6px 10px;">`)
    .replace(/<img /g, `<img alt="Imagem" style="max-width:100%;border-radius:8px;margin:4px 0;cursor:pointer;" onclick="window.__openLightbox && window.__openLightbox(this.src)" `);
  r = r.replace(/\|\|(.+?)\|\|/g, `<span class="spoiler" style="background:${M.surface1};color:transparent;cursor:pointer;border-radius:4px;padding:0 3px;transition:color 0.2s" onclick="this.style.color=this.style.background==='transparent'?'':this.style.background='transparent';this.style.color=this.style.color==='transparent'?'${M.text}':'transparent';" onmouseenter="this.style.color='${M.text}'" onmouseleave="if(this.style.background!=='transparent')this.style.color='transparent'">$1</span>`);
  return r;
}

function EqReactions({ reactions, onReact }) {
  if (!reactions || reactions.length === 0) return null;
  const counts = {};
  reactions.forEach(r => { counts[r.emoji] = (counts[r.emoji] || 0) + 1; });
  return (
    <div style={{ display: 'flex', gap: 3, marginTop: 4, flexWrap: 'wrap' }}>
      {Object.entries(counts).map(([emoji, count]) => (
        <span key={emoji} onClick={() => onReact(emoji)}
          style={{ fontSize: '0.75rem', background: M.surface0, borderRadius: 8, padding: '1px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, border: `1px solid ${M.surface1}` }}>
          {emoji} {count > 1 && <span style={{ fontSize: '0.65rem', color: M.sub0 }}>{count}</span>}
        </span>
      ))}
    </div>
  );
}

function FilePreview({ file, onImageClick }) {
  if (!file) return null;
  const isImage = file.file_type?.startsWith('image/');
  return (
    <div style={{ marginTop: 6 }}>
      {isImage ? (
        <img src={file.file_url} alt={file.file_name}
          onClick={() => onImageClick?.(file.file_url)}
          style={{ maxWidth: 260, maxHeight: 200, borderRadius: 8, cursor: 'pointer' }} />
      ) : (
        <a href={file.file_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, color: M.blue, fontSize: '0.8rem', textDecoration: 'none', padding: '4px 8px', background: M.s0, borderRadius: 6 }}>
          <FaDownload size={12} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{file.file_name}</span>
          {!!file.file_size && <span style={{ fontSize: '0.65rem', color: M.ov0 }}>{(file.file_size / 1024).toFixed(1)}KB</span>}
        </a>
      )}
    </div>
  );
}

function LinkPreview({ preview, onImageClick }) {
  if (!preview) return null;
  return (
    <a href={preview.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block', marginTop: 6 }}>
      <div style={{ border: `1px solid ${M.s1}`, borderRadius: 10, overflow: 'hidden', maxWidth: 300, background: M.s0 }}>
        {preview.image && (
          <img src={preview.image} alt={preview.title || 'Preview do link'} onClick={(e) => { e.preventDefault(); onImageClick?.(preview.image); }}
            style={{ width: '100%', height: 140, objectFit: 'cover', cursor: 'pointer' }} />
        )}
        <div style={{ padding: '8px 10px' }}>
          {preview.title && <div style={{ fontSize: '0.78rem', fontWeight: 600, color: M.text, marginBottom: 2, lineHeight: '1.3' }}>{preview.title}</div>}
          {preview.description && <div style={{ fontSize: '0.7rem', color: M.sub0, lineHeight: '1.3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{preview.description}</div>}
          <div style={{ fontSize: '0.62rem', color: M.ov0, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{preview.url}</div>
        </div>
      </div>
    </a>
  );
}

export default function MsgBubble({ msg, grouped, isOwn, onReact, onEdit, onDelete, onReply, onPin, onImageClick, onTranslate, preview, M: MProp }) {
  const M = MProp || _M;
  const [hover, setHover] = useState(false);
  const [translated, setTranslated] = useState(null);
  const isTouch = useRef(typeof window !== 'undefined' && 'ontouchstart' in window);
  const isEmojiOnly = emojiRegex.test(msg.content?.trim());
  const expiresIn = msg.expires_at ? new Date(msg.expires_at) - new Date() : 0;

  if (msg.__system) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0' }} className="msg-fade">
        <div style={{
          fontSize: '0.75rem', color: M.ov0, background: M.surface0,
          padding: '4px 14px', borderRadius: '20px', textAlign: 'center', maxWidth: '90%',
        }}>
          {msg.content}
        </div>
      </div>
    );
  }

  const bubble = (
    <div style={{
      maxWidth: isEmojiOnly ? '30%' : '75%', display: 'flex', flexDirection: 'column',
      ...(isOwn ? { alignItems: 'flex-end' } : {}),
    }}>
      {!grouped && (
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '3px',
          ...(isOwn ? { justifyContent: 'flex-end' } : {}),
        }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isOwn ? M.mauve : getColor(msg.user_name) }}>
            {msg.user_name}
          </span>
          <span style={{ fontSize: '0.67rem', color: 'var(--subtext0, #808080)' }}>
            {msg.created_at ? new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
          </span>
        </div>
      )}
      <div onClick={() => isTouch.current && setHover(v => !v)} onMouseEnter={() => !isTouch.current && setHover(true)} onMouseLeave={() => !isTouch.current && setHover(false)}
        style={{
          background: isOwn ? `${M.mauve}20` : M.surface0,
          borderRadius: isOwn ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
          padding: isEmojiOnly ? '4px 8px' : '8px 12px',
          fontSize: isEmojiOnly ? '2.2rem' : '0.875rem',
          lineHeight: isEmojiOnly ? '1.2' : '1.55',
          border: isOwn ? `1px solid ${M.mauve}45` : `1px solid ${M.surface1}`,
          wordBreak: 'break-word', position: 'relative',
        }}>
        {msg.pinned ? <FaThumbtack size={10} color={M.yellow} style={{ position: 'absolute', top: 4, right: 4, opacity: 0.5 }} /> : null}
        {isEmojiOnly ? (
          <span style={{ fontSize: '2.8rem', lineHeight: 1 }}>{msg.content.trim()}</span>
        ) : translated ? (
          <div style={{ color: M.green, fontSize: '0.82rem' }}>
            <div>{translated}</div>
            <div style={{ fontSize: '0.6rem', color: M.ov0, marginTop: 4 }}>Traduzido · <span style={{ cursor: 'pointer', color: M.blue, textDecoration: 'underline' }} onClick={() => setTranslated(null)}>Mostrar original</span></div>
          </div>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: renderMd(msg.content, preview) }} />
        )}
        {msg.file_url && <FilePreview file={msg} onImageClick={onImageClick} />}
        {preview && !msg.file_url && <LinkPreview preview={preview} onImageClick={onImageClick} />}
        {msg.edited ? <span style={{ fontSize: '0.6rem', color: M.ov0, marginLeft: 4 }}>(editado)</span> : null}

        {hover && (
          <div style={{
            position: 'absolute', top: -34,
            [isOwn ? 'right' : 'left']: 0,
            display: 'flex', gap: 1, background: M.crust, borderRadius: 8, padding: '3px 4px',
            border: `1px solid ${M.surface1}`, boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}>
            {onReply && <button onClick={() => onReply(msg)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: M.sub0, padding: '6px 8px', display: 'flex', fontSize: '0.7rem', alignItems: 'center', justifyContent: 'center' }} title="Responder" aria-label="Responder"><FaReply size={12} /></button>}
            {emojis.slice(0, 4).map(emoji => (
              <button key={emoji} onClick={() => onReact?.(msg.id, emoji)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', fontSize: '0.85rem', lineHeight: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{emoji}</button>
            ))}
            {onTranslate && <button onClick={async () => { if (!translated) { setTranslated('...'); try { const r = await fetch('/api/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: msg.content, target_lang: 'pt-br' }) }); const d = await r.json(); setTranslated(d.translated || msg.content); } catch { setTranslated(msg.content); } } else { setTranslated(null); } }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: M.blue, padding: '6px 8px', display: 'flex', fontSize: '0.7rem', alignItems: 'center', justifyContent: 'center' }} title="Traduzir" aria-label="Traduzir"><FaLanguage size={12} /></button>}
            {onPin && <button onClick={() => onPin(msg)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: msg.pinned ? M.yellow : M.sub0, padding: '6px 8px', display: 'flex', fontSize: '0.7rem', alignItems: 'center', justifyContent: 'center' }} title={msg.pinned ? 'Desafixar' : 'Fixar'} aria-label={msg.pinned ? 'Desafixar' : 'Fixar'}><FaThumbtack size={12} /></button>}
            {onEdit && <button onClick={() => onEdit(msg)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: M.sub0, padding: '6px 8px', display: 'flex', fontSize: '0.7rem', alignItems: 'center', justifyContent: 'center' }} title="Editar" aria-label="Editar"><FaEdit size={12} /></button>}
            {onDelete && <button onClick={() => onDelete(msg)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: M.red, padding: '6px 8px', display: 'flex', fontSize: '0.7rem', alignItems: 'center', justifyContent: 'center' }} title="Excluir" aria-label="Excluir"><FaTrash size={12} /></button>}
          </div>
        )}
      </div>
      <EqReactions reactions={msg.reactions} onReact={(emoji) => onReact?.(msg.id, emoji)} />
      {isOwn && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginTop: 2, paddingRight: 2 }}>
          {msg.read_count > 0 ? (
            <span style={{ position: 'relative' }} title={`Visto por ${msg.read_count} pessoa(s)`}>
              <FaCheckDouble size={10} color={M.blue} />
            </span>
          ) : (
            <FaCheckDouble size={10} color={M.blue} />
          )}
        </div>
      )}
      {expiresIn > 0 && expiresIn < 3600000 && (
        <div style={{ fontSize: '0.55rem', color: M.ov0, marginTop: 1, textAlign: 'right' }}>
          <FaClock size={10} style={{ verticalAlign: 'middle', marginRight: 2 }} /> {Math.ceil(expiresIn / 1000)}s
        </div>
      )}
    </div>
  );

  return (
    <div style={{
      display: 'flex', gap: '8px',
      padding: grouped ? '1px 0' : '10px 0 2px',
      alignItems: 'flex-end',
      ...(isOwn ? { flexDirection: 'row-reverse' } : {}),
    }} className={!msg.__system ? 'msg-fade' : ''}>
      {!grouped ? (
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: isOwn ? M.mauve : getColor(msg.user_name),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: '0.78rem', color: isOwn ? M.crust : '#fff',
        }}>
          {(msg.user_name || '?')[0].toUpperCase()}
        </div>
      ) : (
        <div style={{ width: 32, flexShrink: 0 }} />
      )}
      {bubble}
    </div>
  );
}
