export const light = {
  base: '#eff1f5', mantle: '#e6e9ef', crust: '#dce0e8',
  surface0: '#ccd0da', surface1: '#bcc0cc', surface2: '#acb0be',
  text: '#4c4f69', sub0: '#6c6f85', sub1: '#5c5f77', ov0: '#9ca0b0',
  ov1: '#8c8fa1', ov2: '#7c7f93',
  mauve: '#8839ef', green: '#40a02b', yellow: '#df8e1d', blue: '#1e66f5',
  red: '#d20f39', pink: '#ea76cb', peach: '#fe640b',
};

export const dark = {
  base: '#1e1e2e', mantle: '#181825', crust: '#11111b',
  surface0: '#313244', surface1: '#45475a', surface2: '#585b70',
  text: '#cdd6f4', sub0: '#a6adc8', sub1: '#bac2de', ov0: '#6c7086',
  ov1: '#7f849c', ov2: '#9399b2',
  mauve: '#cba6f7', green: '#a6e3a1', yellow: '#f9e2af', blue: '#89b4fa',
  red: '#f38ba8', pink: '#f5c2e7', peach: '#fab387',
};

export const B = {
  border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
  fontFamily: 'inherit', transition: 'all 0.15s', display: 'flex',
  alignItems: 'center', justifyContent: 'center', gap: '6px',
};

const avatarColors = ['#74c7ec', '#f5c2e7', '#cba6f7', '#a6e3a1', '#fab387', '#89b4fa', '#f9e2af', '#f38ba8'];
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
