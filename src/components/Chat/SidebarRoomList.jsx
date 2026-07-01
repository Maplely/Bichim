import { FaArchive, FaStar } from 'react-icons/fa';
import { B } from './constants.js';
import RoomListItem from './RoomListItem.jsx';

export default function SidebarRoomList({
  rooms, M, roomId, favorites, mobile, showArchived,
  onSwitch, onToggleFavorite, onToggleArchived, onCloseSidebar,
}) {
  const closeSide = () => { if (mobile) onCloseSidebar(); };
  const dms = rooms.filter(r => r.is_dm);
  const channels = rooms.filter(r => !r.is_dm);
  const favs = channels.filter(r => favorites.has(r.id));
  const others = channels.filter(r => !favorites.has(r.id));
  const cats = [...new Set(others.map(r => r.category || '').sort())];

  return (<>
    <div style={{ padding: '7px 8px 4px', fontSize: '0.67rem', fontWeight: 700, color: M.ov2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
      Salas {showArchived ? '(arquivadas)' : ''}
    </div>
    <button onClick={onToggleArchived} style={{ ...B, background: 'none', color: M.ov0, padding: '4px 8px', fontSize: '0.68rem', width: '100%', justifyContent: 'flex-start', gap: 4 }}>
      <FaArchive size={10} /> {showArchived ? 'Mostrar ativas' : 'Mostrar arquivadas'}
    </button>
    {dms.length > 0 && <>
      <div style={{ padding: '7px 8px 4px', marginTop: 4, fontSize: '0.67rem', fontWeight: 700, color: M.ov2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Mensagens diretas</div>
      {dms.map(r => (
        <RoomListItem key={r.id} room={r} currentRoomId={roomId} isDM
          onSwitch={(r) => { onSwitch(r); closeSide(); }} M={M} />
      ))}
    </>}
    {favs.length > 0 && <>
      <div style={{ padding: '7px 8px 4px', marginTop: 4, fontSize: '0.67rem', fontWeight: 700, color: M.peach, textTransform: 'uppercase', letterSpacing: '0.08em' }}><FaStar size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} /> Favoritos</div>
      {favs.map(r => (
        <RoomListItem key={r.id} room={r} currentRoomId={roomId} isFavorite
          onSwitch={(r) => { onSwitch(r); closeSide(); }}
          onToggleFavorite={onToggleFavorite} M={M} />
      ))}
    </>}
    {others.length > 0 && <>
      {cats.length === 0 || cats.length === 1 && cats[0] === '' ? (
        <div style={{ padding: '7px 8px 4px', marginTop: 4, fontSize: '0.67rem', fontWeight: 700, color: M.ov2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Canais</div>
      ) : null}
      {cats.filter(c => c).map(cat => (
        <div key={cat}>
          <div style={{ padding: '7px 8px 4px', marginTop: 4, fontSize: '0.67rem', fontWeight: 700, color: M.green, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{cat}</div>
          {others.filter(r => (r.category || '') === cat).map(r => (
            <RoomListItem key={r.id} room={r} currentRoomId={roomId}
              onSwitch={(r) => { onSwitch(r); closeSide(); }}
              onToggleFavorite={onToggleFavorite} M={M} />
          ))}
        </div>
      ))}
      {(!cats.length || cats.length === 1 && cats[0] === '') && others.filter(r => !r.category).map(r => (
        <RoomListItem key={r.id} room={r} currentRoomId={roomId}
          onSwitch={(r) => { onSwitch(r); closeSide(); }}
          onToggleFavorite={onToggleFavorite} M={M} />
      ))}
    </>}
  </>);
}
