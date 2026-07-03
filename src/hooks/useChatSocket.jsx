import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { showToast } from '../components/Toast.jsx';

export default function useChatSocket({ roomId, token, userId, setMsgs, setMembers }) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(true);
  const [typing, setTyping] = useState([]);
  const [recordingUsers, setRecordingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    if (socketRef.current) socketRef.current.disconnect();
    const s = io({ auth: { token } });
    socketRef.current = s;

    s.on('connect', () => { setConnected(true); s.emit('join-room', parseInt(roomId)); });
    s.on('disconnect', () => { setConnected(false); });
    s.on('reconnect', () => { setConnected(true); });

    s.on('message', (msg) => setMsgs(prev => [...prev, msg]));
    s.on('message-deleted', ({ id }) => setMsgs(prev => prev.filter(m => m.id !== id)));
    s.on('message-edited', (msg) => setMsgs(prev => prev.map(m => m.id === msg.id ? { ...m, content: msg.content, edited: true } : m)));
    s.on('reaction-update', ({ message_id, reactions }) => setMsgs(prev => prev.map(m => m.id === message_id ? { ...m, reactions } : m)));

    s.on('typing', ({ roomId: rId, users }) => {
      if (rId === parseInt(roomId)) setTyping(users);
    });
    s.on('recording', ({ roomId: rId, users }) => {
      if (rId === parseInt(roomId)) setRecordingUsers(users);
    });
    s.on('online-users', ({ roomId: rId, users }) => {
      if (rId === parseInt(roomId)) setOnlineUsers(new Set(users));
    });

    s.on('user-joined', ({ user: u }) => {
      setMembers(prev => prev.some(m => m.id === u.id) ? prev : [...prev, u]);
      showToast(`${u.nome} entrou na sala`, 'info');
    });
    s.on('user-left', ({ userId: uid }) => setMembers(prev => prev.filter(m => m.id !== uid)));
    s.on('member-kicked', ({ userId: uid }) => {
      if (uid === userId) { window.location.href = '/chat'; return; }
      setMembers(prev => prev.filter(m => m.id !== uid));
    });

    return () => {
      if (s.connected) { s.emit('leave-room', parseInt(roomId)); s.emit('stop-typing', { roomId: parseInt(roomId) }); s.emit('stop-recording', { roomId: parseInt(roomId) }); }
      s.disconnect();
    };
  }, [roomId, token, userId]);

  return { socketRef, connected, typing, recordingUsers, onlineUsers };
}
