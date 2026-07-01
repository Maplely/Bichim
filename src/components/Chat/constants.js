export const light = {
  base: '#FFFFFF', mantle: '#F9F7F4', crust: '#F0EDE8',
  surface0: '#F0EDE8', surface1: '#FDFBF8', surface2: '#EDE9E0',
  text: '#1A1A1A', sub0: '#5A5A5A', sub1: '#8A8A8A', ov0: '#BFBFBF',
  ov1: '#E0D7CC', ov2: '#EDE9E0',
  mauve: '#D64A38', green: '#22C55E', yellow: '#F59E0B', blue: '#3B82F6',
  red: '#EF4444', pink: '#FFE8E0', peach: '#F5A623',
  chatSent: '#FFE8E0', chatReceived: '#F0EDE8',
  accent: '#E8A200', tertiary: '#8B6F47',
};

export const dark = {
  base: '#0F0F0F', mantle: '#1A1A1A', crust: '#252525',
  surface0: '#252525', surface1: '#2D2D2D', surface2: '#3A3A3A',
  text: '#FFFFFF', sub0: '#BFBFBF', sub1: '#808080', ov0: '#4A4A4A',
  ov1: '#3A3A3A', ov2: '#2A2A2A',
  mauve: '#FF6B4A', green: '#4ADE80', yellow: '#FDB022', blue: '#60A5FA',
  red: '#FF6B6B', pink: '#3A2420', peach: '#FFB547',
  chatSent: '#3A2420', chatReceived: '#2A2A2A',
  accent: '#FFD700', tertiary: '#C4B5A0',
};

export const B = {
  border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
  fontFamily: 'inherit', transition: 'all 0.15s', display: 'flex',
  alignItems: 'center', justifyContent: 'center', gap: '6px',
};

const avatarColors = ['#FF6B4A', '#F5A623', '#60A5FA', '#4ADE80', '#FDB022', '#FFD700', '#C4B5A0', '#FF8A6B'];
export function getColor(name) {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export const emojiList = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '🎉', '💀', '👀', '✨', '🚀', '💯', '✅', '🤔', '👻', '🙌', '💪', '🫡', '🦆'];

export const slashCommands = [
  { cmd: '/gif', desc: 'Buscar GIF animado', action: 'gif' },
  { cmd: '/spoiler', desc: 'Texto oculto: /spoiler texto', action: 'spoiler' },
  { cmd: '/poll', desc: 'Criar enquete: /poll pergunta | op1 | op2', action: 'poll' },
  { cmd: '/me', desc: 'Ação em terceira pessoa', action: 'me' },
  { cmd: '/shrug', desc: 'Inserir ¯\\_(ツ)_/¯', action: 'shrug' },
  { cmd: '/code', desc: 'Bloco de código', action: 'code' },
  { cmd: '/bold', desc: 'Texto em negrito', action: 'bold' },
  { cmd: '/italic', desc: 'Texto em itálico', action: 'italic' },
  { cmd: '/save', desc: 'Salvar mensagem', action: 'save' },
  { cmd: '/clear', desc: 'Limpar chat (só pra você)', action: 'clear' },
  { cmd: '/topic', desc: 'Definir tópico da sala (admin)', action: 'topic' },
  { cmd: '/help', desc: 'Listar comandos', action: 'help' },
];

export const stickerList = ['😊', '👍', '❤️', '🔥', '🎉', '✨', '💀', '👀', '🚀', '💯', '✅', '🙏', '💪', '🌈', '⭐', '🦊', '🐱', '🐶', '🌸', '🍕'];
