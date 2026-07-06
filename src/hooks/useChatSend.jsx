import { useState, useRef, useCallback } from 'react';
import { slashCommands } from '../components/Chat/constants.js';

export default function useChatSend({
  input,
  replyingTo,
  roomId,
  headers,
  socketRef,
  taRef,
  user,
  msgs,
  setInput,
  setReplyingTo,
  setMsgs,
  processPreviews,
  toggleSaveMsg,
  showToast,
  setShowSlashHelp,
}) {
  const [sending, setSending] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const [gifQuery, setGifQuery] = useState('');
  const [gifResults, setGifResults] = useState([]);
  const gifTimer = useRef(null);

  const handleSendPoll = useCallback(async (question, options) => {
    const pollContent = `📊 **${question}**\n\n` + options.map((o, i) => `${i + 1}. ${o} — 0 votos`).join('\n');
    const socket = socketRef.current;
    const payload = { roomId: parseInt(roomId), content: pollContent, reply_to: null };
    if (socket?.connected) {
      socket.emit('new-message', payload);
    } else {
      fetch(`/api/rooms/${roomId}/messages`, {
        method: 'POST', headers, credentials: 'include',
        body: JSON.stringify({ content: pollContent }),
      });
    }
  }, [roomId, headers, socketRef]);

  const handleGifSearch = useCallback((query) => {
    showToast(`Buscando GIF: "${query}" — integração com Tenor/GIPHY pendente`, 'info');
  }, [showToast]);

  const send = useCallback(() => {
    if (!input.trim() || sending) return;
    setSending(true);
    const socket = socketRef.current;
    let content = input.trim();

    if (content.startsWith('/')) {
      const parts = content.slice(1).split(' ');
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1).join(' ');
      const found = slashCommands.find(sc => sc.cmd === `/${cmd}` || sc.cmd.split(' ')[0] === `/${cmd}`);
      if (found) {
        if (found.action === 'shrug') {
          content = '¯\\_(ツ)_/¯';
        } else if (found.action === 'me') {
          content = `_${user?.nome || 'Alguém'} ${args}_`;
        } else if (found.action === 'spoiler') {
          content = `||${args || 'spoiler'}||`;
        } else if (found.action === 'code') {
          content = `\`\`\`\n${args || 'código'}\n\`\`\``;
        } else if (found.action === 'bold') {
          content = `**${args || 'texto'}**`;
        } else if (found.action === 'italic') {
          content = `*${args || 'texto'}*`;
        } else if (found.action === 'help') {
          setShowSlashHelp(true); setSending(false); setInput(''); return;
        } else if (found.action === 'clear') {
          setMsgs([]); setSending(false); setInput(''); showToast('Chat limpo!', 'info'); return;
        } else if (found.action === 'save') {
          const last = msgs[msgs.length - 1];
          if (last && last.user_id !== user?.id) {
            toggleSaveMsg(last);
          }
          setSending(false); setInput(''); return;
        } else if (found.action === 'topic') {
          showToast('Use as configurações da sala para definir o tópico', 'info');
          setSending(false); setInput(''); return;
        } else if (found.action === 'gif') {
          if (args) {
            handleGifSearch(args);
            setSending(false); setInput(''); return;
          } else {
            setSending(false); setInput(''); showToast('Use /gif <termo> para buscar GIFs', 'info'); return;
          }
        } else if (found.action === 'poll') {
          const pollParts = content.split('|').map(s => s.trim());
          if (pollParts.length >= 3) {
            const pollQuestion = pollParts[0].replace('/poll', '').trim();
            const pollOptions = pollParts.slice(1);
            setSending(false); setInput('');
            handleSendPoll(pollQuestion, pollOptions);
            return;
          } else {
            setSending(false); setInput(''); showToast('Use /poll pergunta | op1 | op2 | op3', 'info'); return;
          }
        }
      } else {
        showToast(`Comando desconhecido: /${cmd}. Use /help`, 'error');
        setSending(false); setInput(''); return;
      }
    }

    const replyTo = replyingTo?.id || null;
    setInput('');
    setReplyingTo(null);
    processPreviews(content);

    const payload = { roomId: parseInt(roomId), content, reply_to: replyTo };

    if (socket?.connected) {
      socket.emit('new-message', payload);
      setSending(false);
    } else {
      fetch(`/api/rooms/${roomId}/messages`, {
        method: 'POST', headers, credentials: 'include',
        body: JSON.stringify({ content, reply_to: replyTo }),
      }).then(r => r.ok && r.json()).then(msg => {
        if (msg) {
          setMsgs(prev => [...prev, msg]);
          processPreviews(msg.content);
        }
      }).finally(() => setSending(false));
    }
    setTimeout(() => taRef.current?.focus(), 0);
  }, [input, sending, roomId, headers, replyingTo, user, msgs, socketRef, taRef, setInput, setReplyingTo, setMsgs, processPreviews, toggleSaveMsg, showToast, setShowSlashHelp, handleGifSearch, handleSendPoll]);

  const searchGif = useCallback((q) => {
    setGifQuery(q);
    clearTimeout(gifTimer.current);
    if (!q.trim()) { setGifResults([]); return; }
    gifTimer.current = setTimeout(async () => {
      try {
        const r = await fetch(`https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(q)}&key=AIzaSyBzFzKzKzKzKzKzKzKzKzKzKzKzKzKzKz&limit=8`);
        if (r.ok) {
          const data = await r.json();
          setGifResults((data.results || []).map(g => ({ url: g.media_formats?.tinygif?.url || g.media_formats?.gif?.url, title: g.title })));
        }
      } catch { setGifResults([]); }
    }, 400);
  }, [setGifQuery, setGifResults]);

  const sendGif = useCallback((url) => {
    setInput(`![](${url})`);
    setShowGif(false);
    setGifQuery('');
    setGifResults([]);
    setTimeout(() => send(), 50);
  }, [setInput, setShowGif, setGifQuery, setGifResults, send]);

  return {
    send,
    sending,
    showGif,
    setShowGif,
    gifQuery,
    setGifQuery,
    gifResults,
    setGifResults,
    searchGif,
    sendGif,
  };
}
