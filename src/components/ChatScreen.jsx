import { useState, useEffect, useRef, useCallback } from 'react';



import ToastContainer, { showToast } from './Toast.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import { light, dark, B, slashCommands } from './Chat/constants.js';
import { getToken, playMsgSound, pushNotify, setFaviconBadge, getTheme } from './Chat/utils.js';
import LoadingSkeleton from './Chat/LoadingSkeleton.jsx';
import RoomHeader from './Chat/RoomHeader.jsx';
import useChatSend from '../hooks/useChatSend.jsx';
import SidebarHeader from './Chat/SidebarHeader.jsx';
import SidebarQuickAccess from './Chat/SidebarQuickAccess.jsx';
import SidebarRoomList from './Chat/SidebarRoomList.jsx';
import SidebarUserFooter from './Chat/SidebarUserFooter.jsx';

import SearchBar from './Chat/SearchBar.jsx';
import ScrollToBottomBtn from './Chat/ScrollToBottomBtn.jsx';
import ChatInput from './Chat/ChatInput.jsx';
import useChatSocket from '../hooks/useChatSocket.jsx';
import useChatKeyboard from '../hooks/useChatKeyboard.jsx';
import ReconnectBanner from './Chat/ReconnectBanner.jsx';
import MobileOverlay from './Chat/MobileOverlay.jsx';
import EditMsgModal from './Chat/EditMsgModal.jsx';


import PinnedMsgsBar from './Chat/PinnedMsgsBar.jsx';
import MessageList from './Chat/MessageList.jsx';
import SavedMsgsBar from './Chat/SavedMsgsBar.jsx';
import ContactsPanel from './Chat/ContactsPanel.jsx';
import MembersPanel from './Chat/MembersPanel.jsx';
import ProfileModal from './Chat/ProfileModal.jsx';
import TransferModal from './Chat/TransferModal.jsx';
import AuditModal from './Chat/AuditModal.jsx';
import LightboxModal from './Chat/LightboxModal.jsx';
import ShortcutsModal from './Chat/ShortcutsModal.jsx';
import SlashHelpModal from './Chat/SlashHelpModal.jsx';
import DescEditModal from './Chat/DescEditModal.jsx';
import ContextMenu from './Chat/ContextMenu.jsx';
import ForwardModal from './Chat/ForwardModal.jsx';
import MultiSelectBar from './Chat/MultiSelectBar.jsx';

export default function ChatScreen({ roomId, token: _token }) {
  const [theme, setThemeState] = useState(getTheme);
  const M = theme === 'light' ? light : dark;

  const setTheme = (t) => { setThemeState(t); try { localStorage.setItem('chat-theme', t); document.documentElement.dataset.theme = t; } catch {} };

  const token = _token || getToken();
  const [user, setUser] = useState(null);
  const [room, setRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');

  const [sideOpen, setSideOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [showContacts, setShowContacts] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showEmoji, setShowEmoji] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [ctxMsg, setCtxMsg] = useState(null);
  const [ctxPos, setCtxPos] = useState({ x: 0, y: 0 });
  const [showDesc, setShowDesc] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [pinnedMsgs, setPinnedMsgs] = useState([]);
  const [showPinned, setShowPinned] = useState(false);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [showArchived, setShowArchived] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [previews, setPreviews] = useState({});
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashFilter, setSlashFilter] = useState('');
  const [lastReadId, setLastReadId] = useState(null);
  const [multiSelect, setMultiSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [savedMsgs, setSavedMsgs] = useState(new Set());
  const [showSaved, setShowSaved] = useState(false);
  const [showSlashHelp, setShowSlashHelp] = useState(false);
  const [showProfile, setShowProfile] = useState(null);
  const [showAudit, setShowAudit] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [showTransfer, setShowTransfer] = useState(false);
  const [recording, setRecording] = useState(false);

  const [showForward, setShowForward] = useState(null);
  const [showStickers, setShowStickers] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [favorites, setFavorites] = useState(new Set());
  const [confirm, setConfirm] = useState(null);
  const [editingMsg, setEditingMsg] = useState(null);
  const editRef = useRef(null);

  const endRef = useRef(null);
  const taRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const mainRef = useRef(null);
  const prevMsgCount = useRef(0);
  const soundEnabled = useRef(true);
  const searchTimer = useRef(null);
  const fileInputRef = useRef(null);
  const dragRef = useRef(null);
  const prevTitle = useRef(typeof document !== 'undefined' ? document.title : 'Bichim');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  useEffect(() => {
    setMobile(window.innerWidth < 768);
    const h = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', h);
    if (Notification.permission === 'default') Notification.requestPermission();
    return () => window.removeEventListener('resize', h);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me', { headers, credentials: 'include' }).then(r => r.ok ? r.json() : null),
      fetch(`/api/rooms${showArchived ? '?archived=1' : ''}`, { headers, credentials: 'include' }).then(r => r.ok ? r.json() : []),
    ]).then(([u, rs]) => {
      setUser(u);
      setRooms(rs);
      setFavorites(new Set(rs.filter(r => r.is_favorite).map(r => r.id)));
    });
  }, [showArchived]);

  useEffect(() => {
    if (!roomId) return;
    setLoading(true);
    setMsgs([]);
    setHasMore(true);
    setPinnedMsgs([]);
    setLastReadId(null);
    setSelectedIds(new Set());
    setMultiSelect(false);
    Promise.all([
      fetch(`/api/rooms/${roomId}`, { headers, credentials: 'include' }).then(r => r.ok ? r.json() : null),
      fetch(`/api/rooms/${roomId}/members`, { headers, credentials: 'include' }).then(r => r.ok ? r.json() : []),
      fetch(`/api/rooms/${roomId}/messages`, { headers, credentials: 'include' }).then(r => r.ok ? r.json() : []),
      fetch(`/api/rooms/${roomId}/messages/pinned`, { headers, credentials: 'include' }).then(r => r.ok ? r.json() : []),
    ]).then(([rm, mems, m, pinned]) => {
      setRoom(rm);
      setMembers(mems);
      setMsgs(m);
      setPinnedMsgs(pinned);
      setLoading(false);
      prevMsgCount.current = 0;
      try {
        const saved = JSON.parse(localStorage.getItem('chat-saved-msgs') || '{}');
        setSavedMsgs(new Set(saved[roomId] || []));
      } catch {}
    });
  }, [roomId]);

  useEffect(() => {
    if (prevMsgCount.current > 0 && msgs.length > prevMsgCount.current && document.hidden) {
      const last = msgs[msgs.length - 1];
      if (last && last.user_id !== user?.id) {
        soundEnabled.current && playMsgSound();
        if (!last.__system) {
          pushNotify(`${last.user_name} em ${room?.name || 'Bichim'}`, last.content.slice(0, 100));
        }
      }
    }
    if (!loading && msgs.length > 0) {
      endRef.current?.scrollIntoView({ behavior: prevMsgCount.current === 0 ? 'auto' : 'smooth' });
    }
    prevMsgCount.current = msgs.length;
  }, [msgs, loading]);

  useEffect(() => {
    const unread = msgs.filter(m => !m.__system && m.user_id !== user?.id && (lastReadId ? m.id > lastReadId : false)).length;
    setFaviconBadge(unread);
    if (unread > 0) {
      document.title = `(${unread}) ${room?.name || 'Bichim'} - Bichim`;
    } else {
      document.title = prevTitle.current;
    }
  }, [msgs, lastReadId, user?.id, room?.name]);

  useEffect(() => {
    const ta = taRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const fetchPreview = useCallback(async (url) => {
    if (previews[url]) return;
    try {
      const r = await fetch(`/api/preview?url=${encodeURIComponent(url)}`, { headers, credentials: 'include' });
      if (r.ok) {
        const data = await r.json();
        if (data.title || data.image) {
          setPreviews(prev => ({ ...prev, [url]: data }));
        }
      }
    } catch {}
  }, [headers, previews]);

  const processPreviews = useCallback((content) => {
    const urls = content.match(/https?:\/\/[^\s<]+[^\s<.,;:!?)]/g);
    if (urls) urls.forEach(url => fetchPreview(url));
  }, [fetchPreview]);

  const toggleSaveMsg = (msg) => {
    const next = new Set(savedMsgs);
    if (next.has(msg.id)) next.delete(msg.id); else next.add(msg.id);
    setSavedMsgs(next);
    try {
      const all = JSON.parse(localStorage.getItem('chat-saved-msgs') || '{}');
      all[roomId] = [...next];
      localStorage.setItem('chat-saved-msgs', JSON.stringify(all));
    } catch {}
    showToast(next.has(msg.id) ? 'Mensagem salva!' : 'Mensagem removida dos salvos', 'success');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const socketHook = useChatSocket({ roomId, token, userId: user?.id, setMsgs, setMembers });
  const { socketRef, connected, typing, recordingUsers, onlineUsers } = socketHook;

  const chatSend = useChatSend({
    input, replyingTo, roomId, headers, socketRef, taRef, user, msgs,
    setInput, setReplyingTo, setMsgs,
    processPreviews, toggleSaveMsg, showToast,
    setShowSlashHelp,
  });
  const { send, sending, showGif, setShowGif, gifQuery, setGifQuery, gifResults, setGifResults, searchGif, sendGif } = chatSend;

  useChatKeyboard({
    multiSelect, onEscape: () => {
      setShowEmoji(false); setReplyingTo(null); setCtxMsg(null);
      setShowDesc(false); setSearchOpen(false); setShowPinned(false);
      setCtxMsg(null); setLightbox(null); setShowSaved(false);
      setShowSlashHelp(false);
      if (multiSelect) { setMultiSelect(false); setSelectedIds(new Set()); }
    },
    onToggleShortcuts: () => setShowShortcuts(s => !s),
    onToggleSearch: () => setSearchOpen(s => !s),
    onToggleFullscreen: toggleFullscreen,
    onClickAway: () => { setCtxMsg(null); setMentionOpen(false); setSlashOpen(false); },
  });

  useEffect(() => {
    if (searchQuery.trim().length < 2) { setSearchResults([]); return; }
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSearching(true);
      fetch(`/api/rooms/${roomId}/search?q=${encodeURIComponent(searchQuery.trim())}`, { headers, credentials: 'include' })
        .then(r => r.ok ? r.json() : [])
        .then(setSearchResults)
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(searchTimer.current);
  }, [searchQuery, roomId]);

  useEffect(() => {
    window.__openLightbox = (src) => setLightbox(src);
    return () => { window.__openLightbox = undefined; };
  }, []);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore || msgs.length === 0) return;
    setLoadingMore(true);
    const before = msgs[0]?.id;
    fetch(`/api/rooms/${roomId}/messages?before=${before}&limit=30`, { headers, credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then(older => {
        if (older.length < 30) setHasMore(false);
        setMsgs(prev => [...older, ...prev]);
        requestAnimationFrame(() => {
          if (mainRef.current) {
            const prevScroll = mainRef.current.scrollHeight;
            requestAnimationFrame(() => {
              mainRef.current.scrollTop = mainRef.current.scrollHeight - prevScroll;
            });
          }
        });
      })
      .finally(() => setLoadingMore(false));
  }, [roomId, loadingMore, hasMore, msgs, headers]);

  const handleScroll = useCallback(() => {
    const el = mainRef.current;
    if (!el || loadingMore || !hasMore) return;
    if (el.scrollTop < 80) loadMore();
  }, [loadMore, loadingMore, hasMore]);

  const sendTyping = useCallback(() => {
    const s = socketRef.current;
    if (s?.connected) {
      s.emit('typing', { roomId: parseInt(roomId) });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        s.emit('stop-typing', { roomId: parseInt(roomId) });
      }, 2000);
    }
  }, [roomId]);

  const resolvePreview = useCallback((msg) => {
    if (msg.file_url) return null;
    const urls = msg.content?.match(/https?:\/\/[^\s<]+[^\s<.,;:!?)]/g);
    if (urls) {
      for (const url of urls) {
        if (previews[url]) return previews[url];
      }
    }
    return null;
  }, [previews]);



  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);
    sendTyping();
    const atMatch = val.match(/@(\w*)$/);
    if (atMatch) {
      const term = atMatch[1].toLowerCase();
      const filtered = members.filter(m =>
        m.nome.toLowerCase().startsWith(term) &&
        m.id !== user?.id
      );
      const allMatch = ['everyone', 'here'].filter(x => x.startsWith(term));
      setMentionOpen(filtered.length > 0 || allMatch.length > 0);
      setMentionIndex(0);
    } else {
      setMentionOpen(false);
    }
    if (val.startsWith('/')) {
      const cmdPart = val.slice(1).split(' ')[0].toLowerCase();
      setSlashFilter(cmdPart);
      setSlashOpen(slashCommands.some(sc => sc.cmd.slice(1).startsWith(cmdPart)));
    } else {
      setSlashOpen(false);
    }
  };

  const selectMention = (m) => {
    const atMatch = input.match(/@(\w*)$/);
    if (!atMatch) return;
    const newInput = input.slice(0, atMatch.index) + `@${m.nome || m} ` + input.slice(atMatch.index + atMatch[0].length);
    setInput(newInput);
    setMentionOpen(false);
    taRef.current?.focus();
  };

  const handleReact = useCallback((messageId, emoji) => {
    const socket = socketRef.current;
    if (socket?.connected) {
      socket.emit('react', { messageId, emoji, roomId: parseInt(roomId) });
    } else {
      fetch(`/api/rooms/${roomId}/messages/${messageId}/react`, {
        method: 'POST', headers, credentials: 'include',
        body: JSON.stringify({ emoji }),
      });
    }
  }, [roomId, headers]);

  const submitEdit = useCallback((msg, content) => {
    if (!content || content.trim() === msg.content) return;
    const socket = socketRef.current;
    if (socket?.connected) {
      socket.emit('edit-message', { messageId: msg.id, content: content.trim(), roomId: parseInt(roomId) });
    } else {
      fetch(`/api/rooms/${roomId}/messages/${msg.id}`, {
        method: 'PUT', headers, credentials: 'include',
        body: JSON.stringify({ content: content.trim() }),
      });
    }
  }, [roomId, headers]);

  const handleEdit = useCallback((msg) => {
    setEditingMsg(msg);
  }, []);

  const handleDelete = useCallback((msg) => {
    setConfirm({ message: 'Excluir mensagem?', danger: true, label: 'Excluir', onConfirm: () => {
      const socket = socketRef.current;
      if (socket?.connected) {
        socket.emit('delete-message', { messageId: msg.id, roomId: parseInt(roomId) });
      } else {
        fetch(`/api/rooms/${roomId}/messages/${msg.id}`, {
          method: 'DELETE', headers, credentials: 'include',
        });
      }
    }});
  }, [roomId, headers]);

  const handlePin = useCallback((msg) => {
    fetch(`/api/rooms/${roomId}/messages/${msg.id}/pin`, {
      method: 'POST', headers, credentials: 'include',
    }).then(r => r.ok ? r.json() : null).then(res => {
      if (res) {
        setMsgs(prev => prev.map(m => m.id === msg.id ? { ...m, pinned: res.pinned } : m));
        showToast(res.pinned ? 'Mensagem fixada!' : 'Mensagem desafixada!', 'success');
      }
    });
  }, [roomId, headers]);

  const handleUpload = (file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    fetch(`/api/rooms/${roomId}/messages/upload`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` }, credentials: 'include',
      body: fd,
    }).then(r => r.ok ? r.json() : null).then(msg => {
      if (msg) setMsgs(prev => [...prev, msg]);
    });
  };

  const handlePaste = useCallback((e) => {
    const file = e.clipboardData?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      e.preventDefault();
      handleUpload(file);
    }
  }, [roomId]);

  const handleKick = (userId) => {
    setConfirm({ message: 'Expulsar este membro?', label: 'Expulsar', onConfirm: () => {
      fetch(`/api/rooms/${roomId}/kick`, {
        method: 'POST', headers, credentials: 'include',
        body: JSON.stringify({ userId }),
      }).then(r => {
        if (r.ok) { showToast('Membro expulso!', 'success'); setMembers(prev => prev.filter(m => m.id !== userId)); }
      });
    }});
  };

  const handleBan = (userId) => {
    setConfirm({ message: 'Banir este membro permanentemente?', danger: true, label: 'Banir', onConfirm: () => {
      fetch(`/api/rooms/${roomId}/ban`, {
        method: 'POST', headers, credentials: 'include',
        body: JSON.stringify({ userId }),
      }).then(r => {
        if (r.ok) { showToast('Membro banido!', 'success'); setMembers(prev => prev.filter(m => m.id !== userId)); }
      });
    }});
  };

  const handleTransfer = (userId) => {
    fetch(`/api/rooms/${roomId}/transfer`, {
      method: 'POST', headers, credentials: 'include',
      body: JSON.stringify({ userId }),
    }).then(r => {
      if (r.ok) { showToast('Posse transferida!', 'success'); setShowTransfer(false); window.location.reload(); }
    });
  };

  const startRecording = () => {
    if (!navigator.mediaDevices?.getUserMedia) { showToast('Gravação de áudio não suportada', 'error'); return; }
    setRecording(true);
    socketRef.current?.emit('recording', { roomId: parseInt(roomId) });
    audioChunksRef.current = [];
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        socketRef.current?.emit('stop-recording', { roomId: parseInt(roomId) });
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (blob.size > 0) {
          const fd = new FormData();
          fd.append('file', blob, `voice-${Date.now()}.webm`);
          fetch(`/api/rooms/${roomId}/messages/upload`, {
            method: 'POST', headers: { Authorization: `Bearer ${token}` }, credentials: 'include',
            body: fd,
          }).then(r => r.ok ? r.json() : null).then(msg => { if (msg) setMsgs(prev => [...prev, msg]); });
        }
        setRecording(false);
      };
      recorder.start();
      setTimeout(() => { if (recorder.state === 'recording') recorder.stop(); }, 10000);
    }).catch(() => { showToast('Microfone não disponível', 'error'); setRecording(false); });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleForward = (msg, targetRoomId) => {
    const socket = socketRef.current;
    const content = `📨 **Encaminhada de ${msg.user_name}:**\n\n${msg.content}`;
    const payload = { roomId: parseInt(targetRoomId), content, reply_to: null };
    if (socket?.connected) {
      socket.emit('new-message', payload);
      showToast('Mensagem encaminhada!', 'success');
    } else {
      fetch(`/api/rooms/${targetRoomId}/messages`, {
        method: 'POST', headers, credentials: 'include',
        body: JSON.stringify({ content }),
      }).then(r => {
        if (r.ok) showToast('Mensagem encaminhada!', 'success');
        else showToast('Erro ao encaminhar mensagem', 'error');
      });
    }
    setShowForward(null);
  };

  const toggleFavorite = (rid) => {
    fetch(`/api/rooms/${rid}/favorite`, { method: 'POST', headers, credentials: 'include' })
      .then(r => r.ok ? r.json() : null).then(res => {
        if (res) {
          setFavorites(prev => { const next = new Set(prev); if (res.is_favorite) next.add(rid); else next.delete(rid); return next; });
          showToast(res.is_favorite ? 'Sala favoritada!' : 'Sala desafavoritada', 'success');
        }
      });
  };

  const fetchAudit = () => {
    fetch(`/api/rooms/${roomId}/audit`, { headers, credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then(setAuditLogs);
  };

  const handleRoleChange = (userId, role) => {
    fetch(`/api/rooms/${roomId}/role`, {
      method: 'PUT', headers, credentials: 'include',
      body: JSON.stringify({ userId, role }),
    }).then(r => {
      if (r.ok) { showToast(`Cargo alterado para ${role}`, 'success'); }
    });
  };

  const handleArchive = () => {
    fetch(`/api/rooms/${roomId}/archive`, {
      method: 'POST', headers, credentials: 'include',
    }).then(r => r.ok ? r.json() : null).then(res => {
      if (res) {
        showToast(res.archived ? 'Sala arquivada!' : 'Sala restaurada!', 'success');
        setRoom(prev => ({ ...prev, archived: res.archived }));
      }
    });
  };

  const handleSwitch = (r) => { window.location.href = `/chat/${r.id}`; };

  const copyCode = () => {
    if (room?.code) {
      navigator.clipboard.writeText(room.code).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLeave = () => {
    setConfirm({ message: 'Tem certeza que deseja sair da sala?', label: 'Sair', onConfirm: () => {
      fetch(`/api/rooms/${roomId}/leave`, { method: 'POST', headers, credentials: 'include' })
        .then(r => { if (r.ok) window.location.href = '/chat'; });
    }});
  };

  const handleDeleteRoom = () => {
    setConfirm({ message: 'Tem certeza que deseja deletar esta sala?', danger: true, label: 'Deletar', onConfirm: () => {
      fetch(`/api/rooms/${roomId}`, { method: 'DELETE', headers, credentials: 'include' })
        .then(r => { if (r.ok) window.location.href = '/chat'; });
    }});
  };

  const handleContextMenu = useCallback((e, msg) => {
    e.preventDefault();
    setCtxPos({ x: e.clientX, y: e.clientY });
    setCtxMsg(msg);
  }, []);

  const insertFormat = (before, after) => {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart, end = ta.selectionEnd;
    setInput(input.slice(0, start) + before + input.slice(start, end) + after + input.slice(end));
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + before.length, end + before.length); }, 0);
  };

  const insertEmoji = (emoji) => {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    setInput(input.slice(0, start) + emoji + input.slice(start));
    setShowEmoji(false);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + emoji.length, start + emoji.length); }, 0);
  };

  const shouldShowDateSep = (msgs, i) => {
    if (i === 0) return true;
    return new Date(msgs[i].created_at).toDateString() !== new Date(msgs[i - 1].created_at).toDateString();
  };

  const scrollToBottom = () => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); };

  const toggleSelect = (msgId) => {
    const next = new Set(selectedIds);
    if (next.has(msgId)) next.delete(msgId); else next.add(msgId);
    setSelectedIds(next);
  };

  const bulkDelete = () => {
    if (selectedIds.size === 0) return;
    setConfirm({ message: `Excluir ${selectedIds.size} mensagem(ns)?`, danger: true, label: 'Excluir', onConfirm: () => {
      selectedIds.forEach(id => {
        const socket = socketRef.current;
        if (socket?.connected) {
          socket.emit('delete-message', { messageId: id, roomId: parseInt(roomId) });
        } else {
          fetch(`/api/rooms/${roomId}/messages/${id}`, { method: 'DELETE', headers, credentials: 'include' });
        }
      });
      setSelectedIds(new Set());
      setMultiSelect(false);
    }});
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer?.files?.[0];
    if (file) handleUpload(file);
  }, [roomId]);

  const SW = 232;
  const typingText = (typing.length > 0 || recordingUsers.length > 0)
    ? [
        typing.length > 0 && `${typing.map(t => t.userName).join(', ')}${typing.length > 1 ? ' estão' : ' está'} digitando...`,
        recordingUsers.length > 0 && `${recordingUsers.map(t => t.userName).join(', ')}${recordingUsers.length > 1 ? ' estão' : ' está'} gravando áudio...`,
      ].filter(Boolean).join(' · ')
    : null;
  const canModerate = room?.is_owner || room?.role === 'admin';

  if (loading && msgs.length === 0) {
    return <LoadingSkeleton M={M} />;
  }

  return (
    <div ref={dragRef} onDragOver={handleDragOver} onDrop={handleDrop}
      style={{ height: '100vh', display: 'flex', background: M.base, fontFamily: 'system-ui,-apple-system,sans-serif', color: M.text, overflow: 'hidden', position: 'relative' }}>
      <ToastContainer />
      {confirm && (
        <ConfirmDialog
          message={confirm.message}
          onConfirm={() => { confirm.onConfirm(); setConfirm(null); }}
          onCancel={() => setConfirm(null)}
          danger={confirm.danger}
          confirmLabel={confirm.label || 'Confirmar'}
        />
      )}
      <EditMsgModal editingMsg={editingMsg} M={M}
        onClose={() => setEditingMsg(null)}
        onSubmit={(msg, content) => submitEdit(msg, content)} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <MobileOverlay mobile={mobile} sideOpen={sideOpen} onClose={() => setSideOpen(false)} M={M} />
      <ReconnectBanner connected={connected} M={M} />

      <aside role="complementary" aria-label="Barra lateral" style={{
        width: SW, flexShrink: 0, background: M.mantle, borderRight: `1px solid ${M.surface0}`,
        display: 'flex', flexDirection: 'column', height: '100vh',
        position: mobile ? 'fixed' : 'relative',
        left: mobile ? (sideOpen ? 0 : -SW) : 0, top: 0,
        zIndex: mobile ? 300 : 'auto',
        transition: mobile ? 'left 0.25s cubic-bezier(0.4,0,0.2,1)' : 'none',
      }}>
        <SidebarHeader setTheme={setTheme} mobile={mobile} onClose={() => setSideOpen(false)} M={M} />
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
          <nav aria-label="Salas">
            <SidebarRoomList
              rooms={rooms} M={M} roomId={roomId} favorites={favorites}
              mobile={mobile} showArchived={showArchived}
              onSwitch={handleSwitch}
              onToggleFavorite={toggleFavorite}
              onToggleArchived={() => setShowArchived(s => !s)}
              onCloseSidebar={() => setSideOpen(false)}
            />
          </nav>
          <nav aria-label="Acesso rápido">
            <SidebarQuickAccess savedMsgs={savedMsgs} pinnedMsgs={pinnedMsgs}
              onSavedClick={() => setShowSaved(s => !s)}
              onPinnedClick={() => setShowPinned(s => !s)}
              onContactsClick={() => { fetch('/api/users/contacts', { headers, credentials: 'include' }).then(r => r.ok ? r.json() : []).then(cs => { setContacts(cs); setShowContacts(s => !s); setShowProfile({}); }); }} M={M} />
          </nav>
        </div>
        <SidebarUserFooter user={user} M={M}
          onProfile={() => setShowProfile({ id: user.id, nome: user.nome, bio: user.bio, created_at: user.created_at, is_owner: false })} />
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh' }}>
        <RoomHeader
          room={room} M={M} mobile={mobile} copied={copied} pinnedMsgs={pinnedMsgs}
          showDesc={showDesc} searchOpen={searchOpen} showPinned={showPinned}
          canModerate={canModerate} members={members} membersOpen={membersOpen}
          typing={typing} recordingUsers={recordingUsers}
          onToggleSide={() => setShowDesc(s => !s)}
          onToggleSearch={() => setSearchOpen(s => !s)}
          onTogglePinned={() => setShowPinned(s => !s)}
          onOpenAudit={() => { fetchAudit(); setShowAudit(true); }}
          onToggleMembers={() => setMembersOpen(s => !s)}
          onCopyCode={copyCode}
          onArchive={handleArchive}
          onDeleteRoom={handleDeleteRoom}
          onLeave={handleLeave}
          onOpenSidebar={() => setSideOpen(true)}
        />

        <SearchBar open={searchOpen} query={searchQuery} searching={searching} results={searchResults}
          onQueryChange={setSearchQuery}
          onClose={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
          onResultClick={() => { setSearchQuery(''); setSearchResults([]); setSearchOpen(false); }} M={M} />

        {showPinned && <PinnedMsgsBar pinnedMsgs={pinnedMsgs} M={M} />}
        {showSaved && <SavedMsgsBar msgs={msgs} savedMsgs={savedMsgs} M={M} />}

        <MessageList
          msgs={msgs} M={M} user={user} canModerate={canModerate}
          multiSelect={multiSelect} selectedIds={selectedIds} lastReadId={lastReadId}
          loadingMore={loadingMore} hasMore={hasMore} typingText={typingText}
          mainRef={mainRef} endRef={endRef}
          onScroll={(e) => { handleScroll(e); if (mainRef.current && mainRef.current.scrollTop + mainRef.current.clientHeight >= mainRef.current.scrollHeight - 100 && lastReadId === null && msgs.length > 0) { setLastReadId(msgs[msgs.length - 1]?.id); } }}
          onContextMenu={handleContextMenu}
          onReact={handleReact}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPin={handlePin}
          onToggleSelect={toggleSelect}
          onReply={(m) => setReplyingTo(m)}
          onImageClick={(src) => setLightbox(src)}
          resolvePreview={resolvePreview}
          shouldShowDateSep={shouldShowDateSep}
        />

        <ScrollToBottomBtn visible={msgs.length > 10} onClick={scrollToBottom} M={M} />

        <ChatInput
          input={input} sending={sending} replyingTo={replyingTo} M={M} room={room}
          taRef={taRef} fileInputRef={fileInputRef}
          mentionOpen={mentionOpen} mentionIndex={mentionIndex}
          members={members} userId={user?.id}
          onSelectMention={selectMention}
          slashOpen={slashOpen} slashFilter={slashFilter}
          onSelectSlash={(cmd) => { setInput(cmd + ' '); setSlashOpen(false); taRef.current?.focus(); }}
          showEmoji={showEmoji} onEmojiClick={() => setShowEmoji(s => !s)}
          showStickers={showStickers} onStickersClick={() => { setShowStickers(s => !s); setShowGif(false); }}
          showGif={showGif} onGifOpen={() => { setShowGif(s => !s); setShowStickers(false); }}
          gifQuery={gifQuery} gifResults={gifResults}
          onGifSearch={searchGif} onGifSelect={sendGif}
          onGifClose={() => { setShowGif(false); setGifQuery(''); setGifResults([]); }}
          onEmojiSelect={insertEmoji}
          recording={recording} multiSelect={multiSelect}
          onFormat={insertFormat} onAttach={handleUpload}
          onRecord={startRecording} onStopRecord={stopRecording}
          onMultiSelectToggle={() => setMultiSelect(s => { if (!s) setSelectedIds(new Set()); return !s; })}
          onSlashHelp={() => setShowSlashHelp(s => !s)}
          onSend={send} onInputChange={handleInputChange}
          onPaste={handlePaste} onCancelReply={() => setReplyingTo(null)}
          onTextareaKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
            if (mentionOpen && e.key === 'ArrowDown') { e.preventDefault(); setMentionIndex(i => Math.min(i + 1, members.filter(m => m.id !== user?.id).length)); }
            if (mentionOpen && e.key === 'ArrowUp') { e.preventDefault(); setMentionIndex(i => Math.max(i - 1, 0)); }
            if (mentionOpen && e.key === 'Enter') { e.preventDefault(); const filtered = members.filter(m => m.id !== user?.id); if (filtered[mentionIndex]) selectMention(filtered[mentionIndex]); }
            if (slashOpen && e.key === 'Tab') { e.preventDefault(); const filtered = slashCommands.filter(sc => sc.cmd.slice(1).startsWith(slashFilter)); if (filtered[0]) { setInput(filtered[0].cmd + ' '); setSlashOpen(false); } }
          }}
        />
      </div>

      {showContacts && <ContactsPanel contacts={contacts} M={M}
        onClose={() => setShowContacts(false)}
        onStartDM={(id) => { fetch(`/api/rooms/dm/${id}`, { headers, credentials: 'include' }).then(r => r.ok ? r.json() : null).then(dm => { if (dm) window.location.href = `/chat/${dm.id}`; }); }} />}

      {membersOpen && !showContacts && <MembersPanel members={members} onlineUsers={onlineUsers} user={user} room={room} M={M}
        onClose={() => setMembersOpen(false)}
        onTransfer={(m) => { setCtxMsg(m); setShowTransfer(true); }}
        onKick={handleKick}
        onBan={handleBan}
        onChangeRole={handleRoleChange} />}

      {showProfile && <ProfileModal profileUser={showProfile} M={M}
        onClose={() => setShowProfile(null)}
        onStartDM={(id) => { fetch(`/api/rooms/dm/${id}`, { headers, credentials: 'include' }).then(r => r.ok ? r.json() : null).then(dm => { if (dm) { setShowProfile(null); window.location.href = `/chat/${dm.id}`; } }); }} />}

      {showTransfer && ctxMsg && <TransferModal target={ctxMsg} room={room} M={M}
        onClose={() => { setShowTransfer(false); setCtxMsg(null); }}
        onConfirm={(target) => handleTransfer(target.id)} />}

      {showAudit && <AuditModal auditLog={auditLogs} M={M}
        onClose={() => { setShowAudit(false); setAuditLogs([]); }} />}

      {typeof lightbox === 'string' && <LightboxModal images={[lightbox]} currentIndex={0} M={M}
        onClose={() => setLightbox(null)} />}

      {showShortcuts && !showSlashHelp && <ShortcutsModal M={M} onClose={() => setShowShortcuts(false)} />}
      {showSlashHelp && <SlashHelpModal M={M} onClose={() => setShowSlashHelp(false)} />}

      {showDesc && <DescEditModal desc={room?.description} room={room} M={M}
        onClose={() => setShowDesc(false)}
        onSave={(desc) => { fetch(`/api/rooms/${roomId}/description`, { method: 'PUT', headers, credentials: 'include', body: JSON.stringify({ description: desc }) }).then(r => { if (r.ok) showToast('Descrição atualizada!', 'success'); else showToast('Erro ao atualizar', 'error'); }); }} />}

      {ctxMsg && <ContextMenu ctxMsg={ctxMsg} user={user} M={M}
        onClose={() => setCtxMsg(null)}
        onAction={(action) => {
          if (action === 'reply') setReplyingTo(ctxMsg);
          if (action === 'edit') handleEdit(ctxMsg);
          if (action === 'delete') handleDelete(ctxMsg);
          if (action === 'save') toggleSaveMsg(ctxMsg);
          if (action === 'pin') handlePin(ctxMsg);
          if (action === 'forward') setShowForward(ctxMsg);
          if (action === 'copy') { navigator.clipboard.writeText(ctxMsg.content).catch(() => {}); showToast('Copiado!', 'success'); }
          if (action === 'profile') setShowProfile(ctxMsg);
        }} />}

      {showForward && <ForwardModal rooms={rooms} currentRoomId={roomId} M={M}
        onClose={() => setShowForward(null)}
        onForward={(targetId) => handleForward(showForward, targetId)} />}

      <MultiSelectBar selectedMsgs={selectedIds} M={M}
        onClear={() => { setMultiSelect(false); setSelectedIds(new Set()); }}
        onDelete={bulkDelete}
        onForward={() => {
          const first = msgs.find(m => selectedIds.has(m.id));
          if (first) setShowForward(first);
        }}
        onSave={() => { selectedIds.forEach(id => { const m = msgs.find(x => x.id === id); if (m) toggleSaveMsg(m); }); }} />
    </div>
  );
}
