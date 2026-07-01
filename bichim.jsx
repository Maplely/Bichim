/**
 * ============================================================================
 *  BICHIM — Chat Application (Astro + React + Socket.IO + SQLite + Express)
 * ============================================================================
 *
 *  This file is a concatenation of ALL source files in the project.
 *  Each section is clearly labeled with its original file path.
 *
 *  ┌──────────────────────────────────────────────────────────────────────┐
 *  │  ARCHITECTURE OVERVIEW                                              │
 *  ├──────────────────────────────────────────────────────────────────────┤
 *  │                                                                      │
 *  │  Astro Pages (src/pages/)                                           │
 *  │    ├── index.astro          → Redirect to /auth/login               │
 *  │    ├── auth/login.astro     → Login form (SSR POST)                │
 *  │    ├── auth/cadastro.astro  → Registration form (SSR POST)         │
 *  │    ├── auth/verificacao.astro → Email verification (SSR POST)      │
 *  │    ├── chat/index.astro     → Dashboard (room list) + React hydrate │
 *  │    └── chat/[id].astro      → Chat screen + React hydrate          │
 *  │                                                                      │
 *  │  React Components (src/components/)                                 │
 *  │    ├── ChatScreen.jsx       → Main chat orchestrator (~842 lines)  │
 *  │    ├── Dashboard.jsx        → Room list / landing page              │
 *  │    ├── MsgBubble.jsx        → Message bubble (markdown render)     │
 *  │    ├── Toast.jsx            → Toast notification system             │
 *  │    ├── Modal.jsx            → Shared modal wrapper                  │
 *  │    ├── ConfirmDialog.jsx    → Yes/no confirmation dialog           │
 *  │    ├── PollRenderer.jsx     → Poll display widget                  │
 *  │    ├── RoomCard.jsx         → Room card (dashboard)                │
 *  │    ├── DateSeparator.jsx    → Date divider in chat                 │
 *  │    └── Lbl.jsx              → Label utility component              │
 *  │      └── Chat/              → ~35 sub-components                   │
 *  │                                                                      │
 *  │  Hooks (src/hooks/)                                                 │
 *  │    ├── useChatSocket.jsx    → Socket.IO connection + realtime      │
 *  │    ├── useChatSend.jsx      → Message sending + slash commands     │
 *  │    └── useChatKeyboard.jsx  → Keyboard shortcuts                   │
 *  │                                                                      │
 *  │  Layouts (src/layouts/)                                             │
 *  │    └── BaseLayout.astro     → HTML shell + CSS variables + themes  │
 *  │                                                                      │
 *  │  Server / Shared (src/lib/)                                         │
 *  │    ├── api/cliente.ts       → API fetch wrapper                    │
 *  │    └── auth/sessao.ts       → Session cookie helpers               │
 *  │                                                                      │
 *  │  Middleware (src/middleware/)                                        │
 *  │    └── index.ts             → JWT validation + route protection    │
 *  │                                                                      │
 *  │  KEY FEATURES:                                                      │
 *  │    • Real-time messaging via Socket.IO                              │
 *  │    • Dark/Light theme with localStorage persistence                 │
 *  │    • Markdown rendering in messages (with syntax highlighting)      │
 *  │    • Slash commands (/gif, /poll, /spoiler, /me, etc.)              │
 *  │    • Message reactions, editing, deletion, pinning                  │
 *  │    • Room management (create, join, archive, transfer ownership)    │
 *  │    • Member roles (owner, admin, member) with kick/ban              │
 *  │    • File uploads (images) with preview                             │
 *  │    • WCAG AA accessible (aria-labels, semantic HTML, contrast)      │
 *  │                                                                      │
 *  └──────────────────────────────────────────────────────────────────────┘
 */


// ==========================================================================
//  FILE: src/layouts/BaseLayout.astro
//  TYPE: Astro Layout
// ==========================================================================

---
export interface Props {
  title: string;
}
const { title } = Astro.props;
---
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title} | Bichim</title>
    <style is:global>
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      :root {
        --base: #0F0F0F;
        --mantle: #1A1A1A;
        --crust: #252525;
        --surface0: #252525;
        --surface1: #2D2D2D;
        --surface2: #3A3A3A;
        --borda: #636363;
        --overlay0: #636363;
        --overlay1: #3A3A3A;
        --overlay2: #2A2A2A;
        --subtext0: #BFBFBF;
        --subtext1: #808080;
        --text: #FFFFFF;
        --blue: #60A5FA;
        --green: #4ADE80;
        --yellow: #FDB022;
        --peach: #FFB547;
        --red: #FF6B6B;
        --mauve: #EA5A3E;
        --pink: #3A2420;
        --font: system-ui, -apple-system, sans-serif;
      }
      [data-theme="light"] {
        --base: #FFFFFF;
        --mantle: #F9F7F4;
        --crust: #F0EDE8;
        --surface0: #F0EDE8;
        --surface1: #FDFBF8;
        --surface2: #EDE9E0;
        --borda: #979797;
        --overlay0: #979797;
        --overlay1: #E0D7CC;
        --overlay2: #EDE9E0;
        --subtext0: #5A5A5A;
        --subtext1: #6E6E6E;
        --text: #1A1A1A;
        --blue: #3B82F6;
        --green: #22C55E;
        --yellow: #F59E0B;
        --peach: #C4871C;
        --red: #EF4444;
        --mauve: #C73F2E;
        --pink: #FFE8E0;
        --font: system-ui, -apple-system, sans-serif;
      }
      html { font-size: 16px; -webkit-font-smoothing: antialiased; }
      body {
        font-family: var(--font);
        background: var(--base);
        color: var(--text);
        line-height: 1.6;
        min-height: 100vh;
        overscroll-behavior: none;
      }
      a { color: var(--mauve); text-decoration: none; }
      a:hover { text-decoration: underline; }
      ::-webkit-scrollbar { width: 5px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: var(--surface1); border-radius: 3px; }
      @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.45;} }
      @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
      @keyframes slideIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
      @keyframes shimmer { 0%{background-position:-200px 0} 100%{background-position:calc(200px + 100%) 0} }
      .msg-fade { animation: fadeIn 0.2s ease-out; }
      @media (max-width: 767px) {
        body { padding-bottom: env(safe-area-inset-bottom); }
        ::-webkit-scrollbar { width: 3px; }
      }
    </style>
  </head>
  <body>
    <slot />
    <script is:inline>
      (function() {
        var t = localStorage.getItem('chat-theme');
        if (t === 'light' || (!t && window.matchMedia('(prefers-color-scheme: light)').matches)) {
          document.documentElement.setAttribute('data-theme', 'light');
        }
      })();
    </script>
  </body>
</html>

// ==========================================================================
//  FILE: src/pages/auth/cadastro.astro
//  TYPE: Astro Page
// ==========================================================================

---
import BaseLayout from '../../layouts/BaseLayout.astro';
const PORT = process.env.PORT || 3000;
const API_BASE = `http://127.0.0.1:${PORT}`;
let errorMessage = '';

if (Astro.request.method === 'POST') {
  try {
    const formData = await Astro.request.formData();
    const nome = formData.get('nome')?.toString().trim() || '';
    const email = formData.get('email')?.toString().toLowerCase().trim() || '';
    const senha = formData.get('senha')?.toString() || '';

    if (!nome || !email || !senha) {
      errorMessage = 'Preencha todos os campos.';
    } else if (senha.length < 6) {
      errorMessage = 'Senha deve ter no mínimo 6 caracteres.';
    } else {
      const response = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha }),
      });

      if (response.ok) {
        return Astro.redirect(`/auth/verificacao?email=${encodeURIComponent(email)}`);
      } else {
        const err = await response.json();
        errorMessage = err.erro || 'Não foi possível criar a conta.';
      }
    }
  } catch (error) {
    console.error('[Cadastro Error]', error);
    errorMessage = 'Erro interno. Tente novamente.';
  }
}
---

<BaseLayout title="Cadastro">
  <main style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;background:var(--base);font-family:var(--font);color:var(--text)">
    <div style="text-align:center;margin-bottom:32px">
      <div style="width:58px;height:58px;border-radius:18px;background:var(--mauve);display:flex;align-items:center;justify-content:center;margin:0 auto 14px;box-shadow:0 8px 32px var(--mauve)">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--crust)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      </div>
      <h1 style="margin:0 0 6px;font-size:1.65rem;font-weight:800;letter-spacing:-0.02em">Bichim</h1>
      <p style="margin:0;color:var(--subtext0);font-size:0.85rem">Criar nova conta</p>
    </div>

    <div style="background:var(--mantle);border:1px solid var(--borda);border-radius:18px;padding:28px;width:100%;max-width:380px">
      <form method="POST" id="cadastroForm">
        <div style="display:flex;flex-direction:column;gap:16px">
          <div>
            <label for="nomeInput" style="font-size:0.78rem;font-weight:600;color:var(--subtext1);margin-bottom:6px;display:block">Nome</label>
            <input type="text" name="nome" required autocomplete="name" placeholder="Seu nome" id="nomeInput"
              style="background:var(--base);border:1px solid var(--borda);border-radius:8px;color:var(--text);font-family:inherit;font-size:0.875rem;padding:10px 12px;outline:none;width:100%;box-sizing:border-box" />
          </div>
          <div>
            <label for="emailInput" style="font-size:0.78rem;font-weight:600;color:var(--subtext1);margin-bottom:6px;display:block">Email</label>
            <input type="email" name="email" required autocomplete="email" placeholder="seu@email.com" id="emailInput"
              style="background:var(--base);border:1px solid var(--borda);border-radius:8px;color:var(--text);font-family:inherit;font-size:0.875rem;padding:10px 12px;outline:none;width:100%;box-sizing:border-box" />
          </div>
          <div>
            <label for="senhaInput" style="font-size:0.78rem;font-weight:600;color:var(--subtext1);margin-bottom:6px;display:block">Senha</label>
            <input type="password" name="senha" required autocomplete="new-password" placeholder="Mínimo 6 caracteres" id="senhaInput"
              style="background:var(--base);border:1px solid var(--borda);border-radius:8px;color:var(--text);font-family:inherit;font-size:0.875rem;padding:10px 12px;outline:none;width:100%;box-sizing:border-box" />
          </div>

          <p id="cadastroError" style="margin:0;color:var(--red);font-size:0.8rem">{errorMessage}</p>

          <button type="submit" id="cadastroBtn"
            style="display:flex;align-items:center;justify-content:center;gap:6px;width:100%;margin-top:4px;padding:13px;border:none;border-radius:8px;cursor:pointer;font-weight:700;font-family:inherit;transition:all 0.15s;background:var(--mauve);color:var(--crust);font-size:0.9rem">
            Criar conta
          </button>

          <p style="text-align:center;font-size:0.85rem;color:var(--subtext0);margin-top:8px">
            Já tem conta? <a href="/auth/login" style="color:var(--mauve);font-weight:600">Fazer login</a>
          </p>
        </div>
      </form>
    </div>

    <script>
      const form = document.getElementById('cadastroForm');
      const nomeInput = document.getElementById('nomeInput');
      const emailInput = document.getElementById('emailInput');
      const senhaInput = document.getElementById('senhaInput');
      const errorEl = document.getElementById('cadastroError');
      form.addEventListener('submit', function(e) {
        const errors = [];
        if (!nomeInput.value.trim()) errors.push('Nome é obrigatório.');
        if (!emailInput.value.trim()) errors.push('Email é obrigatório.');
        if (!senhaInput.value) errors.push('Senha é obrigatória.');
        else if (senhaInput.value.length < 6) errors.push('Senha deve ter no mínimo 6 caracteres.');
        if (errors.length > 0) {
          e.preventDefault();
          errorEl.textContent = errors.join(' ');
        }
      });
      [nomeInput, emailInput, senhaInput].forEach(el => {
        el.addEventListener('input', () => { if (errorEl.textContent) errorEl.textContent = ''; });
      });
    </script>
  </main>
</BaseLayout>

// ==========================================================================
//  FILE: src/pages/auth/login.astro
//  TYPE: Astro Page
// ==========================================================================

---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { setSessionToken } from '../../lib/auth/sessao';
const PORT = process.env.PORT || 3000;
const API_BASE = `http://127.0.0.1:${PORT}`;
const erroParam = Astro.url.searchParams.get('erro');
let errorMessage = erroParam === 'nao_autorizado' ? 'Sua sessão expirou. Faça login novamente.' : '';

if (Astro.request.method === 'POST') {
  try {
    const formData = await Astro.request.formData();
    const email = formData.get('email')?.toString().toLowerCase().trim() || '';
    const senha = formData.get('senha')?.toString() || '';

    if (!email || !senha) {
      errorMessage = 'Email e senha são obrigatórios.';
    } else {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      if (response.ok) {
        const data = await response.json();
        setSessionToken(Astro.cookies, data.token);
        return Astro.redirect('/chat');
      } else {
        const err = await response.json();
        errorMessage = err.erro || 'Credenciais inválidas.';
      }
    }
  } catch (error) {
    console.error('[Login Error]', error);
    errorMessage = 'Erro interno. Tente novamente.';
  }
}
---

<BaseLayout title="Login">
  <main style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;background:var(--base);font-family:var(--font);color:var(--text)">
    <div style="text-align:center;margin-bottom:32px">
      <div style="width:58px;height:58px;border-radius:18px;background:var(--mauve);display:flex;align-items:center;justify-content:center;margin:0 auto 14px;box-shadow:0 8px 32px var(--mauve)">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--crust)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      </div>
      <h1 style="margin:0 0 6px;font-size:1.65rem;font-weight:800;letter-spacing:-0.02em">Bichim</h1>
      <p style="margin:0;color:var(--subtext0);font-size:0.85rem">Seu servidor. Seus dados. Seu controle.</p>
    </div>

    <div style="background:var(--mantle);border:1px solid var(--borda);border-radius:18px;padding:28px;width:100%;max-width:380px">
      <form method="POST" id="loginForm">
        <div style="display:flex;flex-direction:column;gap:16px">
          <div>
            <label for="emailInput" style="font-size:0.78rem;font-weight:600;color:var(--subtext1);margin-bottom:6px;display:block">Email</label>
              <input type="email" name="email" required autocomplete="email" placeholder="seu@email.com"
                id="emailInput"
                style="background:var(--base);border:1px solid var(--borda);border-radius:8px;color:var(--text);font-family:inherit;font-size:0.875rem;padding:10px 12px;outline:none;width:100%;box-sizing:border-box" />
            </div>
            <div>
              <label for="senhaInput" style="font-size:0.78rem;font-weight:600;color:var(--subtext1);margin-bottom:6px;display:block">Senha</label>
              <input type="password" name="senha" required autocomplete="current-password" placeholder="••••••••"
                id="senhaInput"
                style="background:var(--base);border:1px solid var(--borda);border-radius:8px;color:var(--text);font-family:inherit;font-size:0.875rem;padding:10px 12px;outline:none;width:100%;box-sizing:border-box" />
          </div>

          <p id="loginError" style="margin:0;color:var(--red);font-size:0.8rem">{errorMessage}</p>

          <button type="submit" id="loginBtn"
            style="display:flex;align-items:center;justify-content:center;gap:6px;width:100%;margin-top:4px;padding:13px;border:none;border-radius:8px;cursor:pointer;font-weight:700;font-family:inherit;transition:all 0.15s;background:var(--mauve);color:var(--crust);font-size:0.9rem">
            Entrar
          </button>

          <p style="text-align:center;font-size:0.85rem;color:var(--subtext0);margin-top:8px">
            Não tem conta? <a href="/auth/cadastro" style="color:var(--mauve);font-weight:600">Cadastre-se</a>
          </p>
        </div>
      </form>
    </div>

    <script>
      const form = document.getElementById('loginForm');
      const emailInput = document.getElementById('emailInput');
      const senhaInput = document.getElementById('senhaInput');
      const errorEl = document.getElementById('loginError');
      form.addEventListener('submit', function(e) {
        const errors = [];
        if (!emailInput.value.trim()) errors.push('Email é obrigatório.');
        if (!senhaInput.value) errors.push('Senha é obrigatória.');
        if (errors.length > 0) {
          e.preventDefault();
          errorEl.textContent = errors.join(' ');
          errorEl.style.display = 'block';
        }
      });
      emailInput.addEventListener('input', () => { if (errorEl.style.display !== 'none') errorEl.style.display = 'none'; });
      senhaInput.addEventListener('input', () => { if (errorEl.style.display !== 'none') errorEl.style.display = 'none'; });
    </script>
  </main>
</BaseLayout>

// ==========================================================================
//  FILE: src/pages/auth/verificacao.astro
//  TYPE: Astro Page
// ==========================================================================

---
import BaseLayout from '../../layouts/BaseLayout.astro';
const PORT = process.env.PORT || 3000;
const API_BASE = `http://127.0.0.1:${PORT}`;
let errorMessage = '';
let successMessage = '';
let verificado = false;

const email = Astro.url.searchParams.get('email') ?? '';
if (!email) return Astro.redirect('/auth/login');

if (Astro.request.method === 'POST') {
  try {
    const formData = await Astro.request.formData();
    const action = formData.get('_action')?.toString();
    const codigo = formData.get('codigo')?.toString().trim() ?? '';

    if (action === 'reenviar') {
      const response = await fetch(`${API_BASE}/api/auth/reenviar-codigo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        errorMessage = '';
        successMessage = 'Novo código enviado para seu e-mail.';
      } else {
        successMessage = '';
        errorMessage = 'Erro ao reenviar código. Tente novamente.';
      }
    } else if (!codigo || codigo.length !== 6 || !/^\d{6}$/.test(codigo)) {
      successMessage = '';
      errorMessage = 'Digite um código válido de 6 dígitos.';
    } else {
      const response = await fetch(`${API_BASE}/api/auth/verificar-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, codigo }),
      });

      if (response.ok) {
        verificado = true;
        errorMessage = '';
        successMessage = 'E-mail verificado com sucesso!';
      } else {
        successMessage = '';
        const err = await response.json();
        errorMessage = err.erro || 'Código inválido ou expirado.';
      }
    }
  } catch (error) {
    console.error('[Verificacao Error]', error);
    successMessage = '';
    errorMessage = 'Erro interno. Tente novamente.';
  }
}
---

<BaseLayout title="Verificar Email">
  <main style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;background:var(--base);font-family:var(--font);color:var(--text)">
    <div style="background:var(--mantle);border:1px solid var(--borda);border-radius:18px;padding:28px;width:100%;max-width:400px">
      <h1 style="font-size:1.25rem;font-weight:700;margin-bottom:4px;color:var(--text)">Verifique seu e-mail</h1>
      <p style="font-size:0.85rem;color:var(--subtext0);margin-bottom:20px">
        Enviamos um código de 6 dígitos para<br /><strong>{email}</strong>
      </p>

      {verificado ? (
        <div style="text-align:center;padding:16px 0">
          <div style="width:48px;height:48px;border-radius:50%;background:var(--green);color:var(--crust);display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:700;margin:0 auto 16px">✓</div>
          <p style="color:var(--green);margin-bottom:16px">{successMessage}</p>
          <a href="/auth/login" style="display:flex;align-items:center;justify-content:center;gap:6px;padding:13px;border:none;border-radius:8px;cursor:pointer;font-weight:700;background:var(--mauve);color:var(--crust);font-size:0.9rem;text-decoration:none">Ir para o login</a>
        </div>
      ) : (
        <form method="POST" style="display:flex;flex-direction:column;gap:16px">
          <div>
            <label for="codigoInput" style="font-size:0.78rem;font-weight:600;color:var(--subtext1);margin-bottom:6px;display:block">Código de verificação</label>
            <input type="text" name="codigo" id="codigoInput" inputmode="numeric" maxlength="6" required placeholder="000000"
              style="background:var(--base);border:1px solid var(--borda);border-radius:8px;color:var(--text);font-family:inherit;font-size:1.5rem;padding:10px 12px;outline:none;width:100%;box-sizing:border-box;text-align:center;letter-spacing:0.5rem;font-weight:700" />
          </div>

          {errorMessage && <p style="margin:0;color:var(--red);font-size:0.8rem">{errorMessage}</p>}
          {successMessage && <p style="margin:0;color:var(--green);font-size:0.8rem">{successMessage}</p>}

          <button type="submit"
            style="display:flex;align-items:center;justify-content:center;gap:6px;padding:13px;border:none;border-radius:8px;cursor:pointer;font-weight:700;background:var(--mauve);color:var(--crust);font-size:0.9rem;width:100%">
            Verificar código
          </button>

          <p style="text-align:center;font-size:0.82rem;color:var(--subtext0)">
            Não recebeu?{' '}
            <button type="submit" name="_action" value="reenviar"
              style="background:none;border:none;color:var(--mauve);font-weight:600;cursor:pointer;font-size:0.82rem;padding:0;text-decoration:underline;font-family:inherit">
              Reenviar código
            </button>
          </p>
        </form>
      )}

      <p style="text-align:center;font-size:0.82rem;color:var(--subtext0);margin-top:12px">
        <a href="/auth/login" style="color:var(--mauve)">← Voltar ao login</a>
      </p>
    </div>
  </main>
</BaseLayout>

// ==========================================================================
//  FILE: src/pages/chat/index.astro
//  TYPE: Astro Page
// ==========================================================================

---
import BaseLayout from '../../layouts/BaseLayout.astro';
import Dashboard from '../../components/Dashboard.jsx';
const token = Astro.locals.token;
---
<BaseLayout title="Bichim">
  <h1 style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0">Bichim</h1>
  <Dashboard client:load token={token} />
</BaseLayout>

// ==========================================================================
//  FILE: src/pages/chat/[id].astro
//  TYPE: Astro Page
// ==========================================================================

---
import BaseLayout from '../../layouts/BaseLayout.astro';
import ChatScreen from '../../components/ChatScreen.jsx';
const { id } = Astro.params;
const token = Astro.locals.token;
---
<BaseLayout title="Sala">
  <h1 style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0">Sala {id}</h1>
  <ChatScreen client:load roomId={id} token={token} />
</BaseLayout>

// ==========================================================================
//  FILE: src/pages/index.astro
//  TYPE: Astro Page
// ==========================================================================

---
export const prerender = false;
---
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Bichim</title>
    <meta http-equiv="refresh" content="0;url=/auth/login" />
  </head>
  <body>
    <p style="text-align:center;padding:2rem;color:#808080">Redirecionando...</p>
  </body>
</html>

// ==========================================================================
//  FILE: src/components/Chat/AuditModal.jsx
//  TYPE: React Component
// ==========================================================================

import { FaTimes } from 'react-icons/fa';
import { B } from './constants.js';

export default function AuditModal({ auditLog, M, onClose }) {
  if (!auditLog || auditLog.length === 0) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label="Registro de Auditoria" onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px', backdropFilter: 'blur(4px)',
    }}>
      <div style={{ background: M.mantle, border: `1px solid ${M.surface0}`, borderRadius: '16px', width: '100%', maxWidth: '500px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 8px' }}>
          <span style={{ color: M.text, fontWeight: 700, fontSize: '0.92rem' }}>Registro de Auditoria</span>
          <button onClick={onClose} aria-label="Fechar" style={{ ...B, padding: 6, background: M.surface0, borderRadius: 10, color: M.text, display: 'flex' }}><FaTimes size={14} /></button>
        </div>
        <div style={{ overflow: 'auto', flex: 1, padding: '8px 16px 16px' }}>
          {auditLog.map((entry, i) => (
            <div key={i} style={{ padding: '8px 0', borderBottom: `1px solid ${M.surface0}`, fontSize: '0.78rem', color: M.sub0 }}>
              <span style={{ color: M.mauve, fontWeight: 600 }}>{entry.user_name}</span>
              {' '}{entry.action}{entry.target_name ? ` — ${entry.target_name}` : ''}
              <div style={{ fontSize: '0.68rem', color: M.ov0, marginTop: 2 }}>{new Date(entry.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
//  FILE: src/components/Chat/ChatHeader.jsx
//  TYPE: React Component
// ==========================================================================

import { FaArrowLeft, FaInfoCircle, FaEnvelope, FaEye, FaGlobe, FaUsers, FaChevronDown } from 'react-icons/fa';
import { B } from './constants.js';

export default function ChatHeader({
  room, user, banidos, connected, onlineUsers, typing, members, M,
  onBack, onToggleSide, onOpenDescEdit, onOpenMembers, onOpenContacts,
  onOpenForward, onOpenAudit, toggleBanidos, isOwner, isAdmin, mobile,
}) {
  const padding = { paddingTop: 'env(safe-area-inset-top, 0px)' };
  const nome = room?.nome?.[0]?.toUpperCase() + room?.nome?.slice(1);
  const onlineCount = onlineUsers.size;

  return (
    <div className="chat-header" style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: `${M.mantle}dd`, backdropFilter: 'blur(14px)',
      borderBottom: `1px solid ${M.surface0}`, ...padding,
    }}>
      <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
        {mobile && (
          <button onClick={onBack} aria-label="Voltar" style={{ ...B, padding: '6px', borderRadius: '12px', background: M.surface0, color: M.text, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 4 }}>
            <FaArrowLeft size={14} />
          </button>
        )}

        <div onClick={onOpenDescEdit} style={{ flex: 1, display: 'flex', flexDirection: 'column', cursor: 'pointer', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: M.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nome || 'Carregando...'}</span>
            {room?.tipo === 'privado' ? <FaEnvelope size={12} style={{ color: M.yellow, opacity: 0.8 }} /> : room?.tipo === 'suporte' ? <FaEye size={12} style={{ color: M.green, opacity: 0.8 }} /> : room?.tipo === 'publico' ? <FaGlobe size={12} style={{ color: M.blue, opacity: 0.8 }} /> : <FaUsers size={12} style={{ color: M.mauve, opacity: 0.8 }} />}
            {!connected && <FaChevronDown size={12} />}
          </div>
          <div style={{ fontSize: '0.72rem', color: connected ? M.green : M.red, display: 'flex', alignItems: 'center', gap: 4 }}>
            {connected
              ? <>🟢 {onlineCount} online{typing.length > 0 && ` — ${typing.map(t => t.userName).join(', ')} digitando...`}</>
              : 'Desconectado — tentando reconectar...'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          {(isOwner || isAdmin) && (
            <button onClick={onOpenMembers} title="Gerenciar Membros" aria-label="Gerenciar Membros" style={{ ...B, padding: '8px', background: `${M.mauve}18`, color: M.mauve, borderRadius: '12px', fontSize: '0.76rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <FaUsers size={13} /> {!mobile && `Membros (${members.length})`}
            </button>
          )}
          <button onClick={onToggleSide} title="Informações" aria-label="Informações" style={{ ...B, padding: '8px', background: `${M.surface0}60`, color: M.sub0, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.76rem' }}>
            <FaInfoCircle size={13} /> {!mobile && 'Info'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
//  FILE: src/components/Chat/ChatHeaderActions.jsx
//  TYPE: React Component
// ==========================================================================

import { FaSave, FaPaintBrush, FaCode, FaUserPlus, FaUsers, FaGlobeAmericas, FaThumbtack, FaBan, FaTrash, FaVolumeMute, FaVolumeUp, FaShare, FaClipboard } from 'react-icons/fa';
import { B } from './constants.js';

const styleBtn = (M) => ({ ...B, width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, fontSize: '0.78rem', color: M.text, background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' });

const labels = {
  save: 'Salvar mensagem', saved: 'Remover dos salvos',
  edit: 'Editar', reply: 'Responder', copy: 'Copiar texto',
  pin: 'Fixar', unpin: 'Desafixar',
  delete: 'Excluir', forward: 'Encaminhar',
  report: 'Denunciar', mute: 'Silenciar', unmute: 'Ativar som',
  ban: 'Banir', unban: 'Desbanir',
  profile: 'Ver perfil',
};

const icons = {
  save: FaSave, saved: FaSave, edit: FaPaintBrush, reply: FaShare, copy: FaClipboard,
  pin: FaThumbtack, unpin: FaThumbtack, delete: FaTrash, forward: FaShare,
  report: FaCode, mute: FaVolumeMute, unmute: FaVolumeUp,
  ban: FaBan, unban: FaBan, profile: FaUserPlus,
};

export default function ChatHeaderActions({ actions, onAction, M, onClose }) {
  if (!actions || actions.length === 0) return null;
  return (
    <div style={{ padding: '4px 0' }}>
      {actions.map((action, i) => {
        const Icon = icons[action] || FaGlobeAmericas;
        const label = labels[action] || action;
        return (
          <button key={i} onClick={() => { onAction(action); onClose?.(); }} style={styleBtn(M)}
            onMouseEnter={e => e.currentTarget.style.background = M.surface0}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <Icon size={12} style={{ color: M.sub0 }} />
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ==========================================================================
//  FILE: src/components/Chat/ChatInput.jsx
//  TYPE: React Component
// ==========================================================================

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
          <button onClick={onSend} disabled={!input.trim() || sending} aria-label="Enviar mensagem"
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

// ==========================================================================
//  FILE: src/components/Chat/constants.js
//  TYPE: React Component
// ==========================================================================

export const light = {
  base: '#FFFFFF', mantle: '#F9F7F4', crust: '#F0EDE8',
  surface0: '#F0EDE8', surface1: '#FDFBF8', surface2: '#EDE9E0',
  text: '#1A1A1A', sub0: '#5A5A5A', sub1: '#6E6E6E', ov0: '#979797',
  ov1: '#E0D7CC', ov2: '#EDE9E0',
  mauve: '#C73F2E', green: '#22C55E', yellow: '#F59E0B', blue: '#3B82F6',
  red: '#EF4444', pink: '#FFE8E0', peach: '#C4871C',
  chatSent: '#FFE8E0', chatReceived: '#F0EDE8',
  accent: '#BE8700', tertiary: '#8B6F47',
};

export const dark = {
  base: '#0F0F0F', mantle: '#1A1A1A', crust: '#252525',
  surface0: '#252525', surface1: '#2D2D2D', surface2: '#3A3A3A',
  text: '#FFFFFF', sub0: '#BFBFBF', sub1: '#808080', ov0: '#636363',
  ov1: '#3A3A3A', ov2: '#2A2A2A',
  mauve: '#EA5A3E', green: '#4ADE80', yellow: '#FDB022', blue: '#60A5FA',
  red: '#FF6B6B', pink: '#3A2420', peach: '#FFB547',
  chatSent: '#3A2420', chatReceived: '#2A2A2A',
  accent: '#FFD700', tertiary: '#C4B5A0',
};

export const B = {
  border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
  fontFamily: 'inherit', transition: 'all 0.15s', display: 'flex',
  alignItems: 'center', justifyContent: 'center', gap: '6px',
};

const avatarColors = ['#EA5A3E', '#C4871C', '#60A5FA', '#4ADE80', '#FDB022', '#BE8700', '#C4B5A0', '#FF8A6B'];
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

// ==========================================================================
//  FILE: src/components/Chat/ContactsPanel.jsx
//  TYPE: React Component
// ==========================================================================

import { useState } from 'react';
import { FaTimes, FaSearch } from 'react-icons/fa';
import { B } from './constants.js';

export default function ContactsPanel({ contacts, onStartDM, onClose, M }) {
  const [search, setSearch] = useState('');

  const filtered = (contacts || []).filter(c =>
    c.nome?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div role="dialog" aria-modal="true" aria-label="Contatos" style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px', backdropFilter: 'blur(4px)',
    }}>
      <div style={{ background: M.mantle, border: `1px solid ${M.surface0}`, borderRadius: '16px', width: '100%', maxWidth: '400px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 8px' }}>
          <span style={{ color: M.text, fontWeight: 700, fontSize: '0.92rem' }}>Contatos</span>
          <button onClick={onClose} aria-label="Fechar" style={{ ...B, padding: 6, background: M.surface0, borderRadius: 10, color: M.text, display: 'flex' }}><FaTimes size={14} /></button>
        </div>
        <div style={{ padding: '8px 16px', position: 'relative' }}>
          <FaSearch size={12} style={{ position: 'absolute', left: 26, top: '50%', transform: 'translateY(-50%)', color: M.sub0 }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar contato..." aria-label="Buscar contato" style={{ width: '100%', padding: '8px 8px 8px 28px', background: M.surface0, border: 'none', borderRadius: 10, color: M.text, fontSize: '0.82rem', outline: 'none' }} />
        </div>
        <div style={{ overflow: 'auto', flex: 1, padding: '0 16px 16px' }}>
          {filtered.map(c => (
            <div key={c.id} onClick={() => { onStartDM(c.id); onClose(); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', cursor: 'pointer', borderBottom: `1px solid ${M.surface0}`, color: M.text }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: M.mauve, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>{c.nome?.[0]?.toUpperCase()}</div>
              <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{c.nome}</span>
            </div>
          ))}
          {filtered.length === 0 && <div style={{ color: M.sub0, textAlign: 'center', padding: '20px 0', fontSize: '0.82rem' }}>Nenhum contato encontrado</div>}
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
//  FILE: src/components/Chat/ContextMenu.jsx
//  TYPE: React Component
// ==========================================================================

import { useRef, useEffect } from 'react';
import { FaSave, FaPaintBrush, FaReply, FaClipboard, FaThumbtack, FaTrash, FaShare, FaUserPlus } from 'react-icons/fa';
import { B } from './constants.js';

const ctxBtn = (M) => ({ ...B, width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, fontSize: '0.78rem', color: M.text, background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' });

export default function ContextMenu({ ctxMsg, user, M, onClose, onAction }) {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  if (!ctxMsg) return null;

  const isOwner = ctxMsg.user_id === user?.id;
  const isAdmin = user?.role === 'admin' || user?.id === ctxMsg.owner_id;
  const items = [];

  items.push({ id: 'reply', icon: FaReply, label: 'Responder' });
  if (isOwner) items.push({ id: 'edit', icon: FaPaintBrush, label: 'Editar' });
  items.push({ id: 'save', icon: FaSave, label: ctxMsg._saved ? 'Remover dos salvos' : 'Salvar' });
  items.push({ id: 'copy', icon: FaClipboard, label: 'Copiar texto' });
  items.push({ id: 'forward', icon: FaShare, label: 'Encaminhar' });
  items.push({ id: 'pin', icon: FaThumbtack, label: 'Fixar/Desafixar' });
  items.push({ id: 'profile', icon: FaUserPlus, label: 'Ver perfil' });
  if (isAdmin && !isOwner) {
    items.push({ id: 'delete', icon: FaTrash, label: 'Excluir' });
  }
  if (isOwner) items.push({ id: 'delete', icon: FaTrash, label: 'Excluir' });

  return (
    <div ref={ref} style={{
      position: 'fixed', zIndex: 9998, background: M.mantle, border: `1px solid ${M.surface0}`,
      borderRadius: 12, padding: '4px', minWidth: 190, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      top: ctxMsg._y, left: ctxMsg._x,
    }}>
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <button key={i} onClick={() => { onAction(item.id); onClose(); }} style={ctxBtn(M)}
            onMouseEnter={e => e.currentTarget.style.background = M.surface0}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <Icon size={12} style={{ color: M.sub0 }} />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

// ==========================================================================
//  FILE: src/components/Chat/DescEditModal.jsx
//  TYPE: React Component
// ==========================================================================

import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { B } from './constants.js';

export default function DescEditModal({ desc, room, M, onClose, onSave }) {
  if (!room) return null;
  const [val, setVal] = useState(desc || room?.descricao || '');

  return (
    <div role="dialog" aria-modal="true" aria-label="Editar descrição" onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px', backdropFilter: 'blur(4px)',
    }}>
      <div style={{ background: M.mantle, border: `1px solid ${M.surface0}`, borderRadius: '16px', width: '100%', maxWidth: '420px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ color: M.text, fontWeight: 700, fontSize: '0.92rem' }}>Editar descrição</span>
          <button onClick={onClose} aria-label="Fechar" style={{ ...B, padding: 6, background: M.surface0, borderRadius: 10, color: M.text, display: 'flex' }}><FaTimes size={14} /></button>
        </div>
        <textarea value={val} onChange={e => setVal(e.target.value)} aria-label="Descrição da sala"
          placeholder="Descrição da sala..."
          style={{ width: '100%', minHeight: 100, background: M.surface0, border: 'none', borderRadius: 8, color: M.text, padding: '10px', fontFamily: 'inherit', fontSize: '0.85rem', resize: 'vertical', outline: 'none' }}
          autoFocus />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
          <button onClick={onClose} style={{ ...B, background: M.surface0, color: M.sub0, padding: '8px 16px', fontSize: '0.82rem' }}>Cancelar</button>
          <button onClick={() => { onSave?.(val); onClose(); }} style={{ ...B, background: M.mauve, color: '#fff', padding: '8px 16px', fontSize: '0.82rem' }}>Salvar</button>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
//  FILE: src/components/Chat/EditMsgModal.jsx
//  TYPE: React Component
// ==========================================================================

import { useRef } from 'react';
import { B } from './constants.js';

export default function EditMsgModal({ editingMsg, onClose, onSubmit, M }) {
  const editRef = useRef(null);
  if (!editingMsg) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label="Editar mensagem" onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px', backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: M.mantle, border: `1px solid ${M.surface0}`, borderRadius: '16px',
        padding: '24px', width: '100%', maxWidth: '480px',
      }}>
        <div style={{ color: M.text, fontWeight: 700, fontSize: '0.92rem', marginBottom: '12px' }}>Editar mensagem</div>
        <textarea ref={editRef} defaultValue={editingMsg.content} aria-label="Editar mensagem"
          onKeyDown={e => { if (e.key === 'Escape') onClose(); if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSubmit(editingMsg, editRef.current?.value); onClose(); } }}
          style={{ width: '100%', minHeight: 80, background: M.surface0, border: 'none', borderRadius: 8, color: M.text, padding: '10px', fontFamily: 'inherit', fontSize: '0.85rem', resize: 'vertical', outline: 'none' }}
          autoFocus />
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
          <button onClick={onClose} style={{ ...B, background: M.surface0, color: M.sub0, padding: '8px 16px', fontSize: '0.82rem' }}>Cancelar</button>
          <button onClick={() => { onSubmit(editingMsg, editRef.current?.value); onClose(); }} style={{ ...B, background: M.mauve, color: '#fff', padding: '8px 16px', fontSize: '0.82rem' }}>Salvar</button>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
//  FILE: src/components/Chat/EmojiPicker.jsx
//  TYPE: React Component
// ==========================================================================

import { emojiList } from './constants.js';

export default function EmojiPicker({ onEmojiSelect, M }) {
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 3, padding: '4px 8px',
      borderBottom: `1px solid ${M.surface1}55`, maxHeight: 100, overflowY: 'auto',
    }}>
      {emojiList.map(e => (
        <button key={e} onClick={() => onEmojiSelect(e)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', padding: '2px 3px', borderRadius: 4 }}
          onMouseEnter={e2 => e2.currentTarget.style.background = M.surface1}
          onMouseLeave={e2 => e2.currentTarget.style.background = 'none'}>{e}</button>
      ))}
    </div>
  );
}

// ==========================================================================
//  FILE: src/components/Chat/EmptyMessages.jsx
//  TYPE: React Component
// ==========================================================================

import { FaComment } from 'react-icons/fa';

export default function EmptyMessages({ M }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: M.ov0, gap: '10px' }}>
      <FaComment size={40} style={{ opacity: 0.3 }} />
      <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 600 }}>Nenhuma mensagem ainda</p>
      <p style={{ margin: 0, fontSize: '0.82rem' }}>Seja o primeiro a enviar uma mensagem!</p>
    </div>
  );
}

// ==========================================================================
//  FILE: src/components/Chat/FormatToolbar.jsx
//  TYPE: React Component
// ==========================================================================

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

// ==========================================================================
//  FILE: src/components/Chat/ForwardModal.jsx
//  TYPE: React Component
// ==========================================================================

import { useState } from 'react';
import { FaTimes, FaSearch, FaCheck } from 'react-icons/fa';
import { B } from './constants.js';

export default function ForwardModal({ rooms, currentRoomId, M, onClose, onForward }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = (rooms || []).filter(r =>
    r.id !== parseInt(currentRoomId) && r.nome?.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirm = () => {
    if (selected) { onForward(selected); onClose(); }
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Encaminhar mensagem" onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px', backdropFilter: 'blur(4px)',
    }}>
      <div style={{ background: M.mantle, border: `1px solid ${M.surface0}`, borderRadius: '16px', width: '100%', maxWidth: '400px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 8px' }}>
          <span style={{ color: M.text, fontWeight: 700, fontSize: '0.92rem' }}>Encaminhar mensagem</span>
          <button onClick={onClose} aria-label="Fechar" style={{ ...B, padding: 6, background: M.surface0, borderRadius: 10, color: M.text, display: 'flex' }}><FaTimes size={14} /></button>
        </div>
        <div style={{ padding: '8px 16px', position: 'relative' }}>
          <FaSearch size={12} style={{ position: 'absolute', left: 26, top: '50%', transform: 'translateY(-50%)', color: M.sub0 }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar sala..." aria-label="Buscar sala" style={{ width: '100%', padding: '8px 8px 8px 28px', background: M.surface0, border: 'none', borderRadius: 10, color: M.text, fontSize: '0.82rem', outline: 'none' }} />
        </div>
        <div style={{ overflow: 'auto', flex: 1, padding: '0 16px 16px' }}>
          {filtered.map(r => (
            <div key={r.id} onClick={() => setSelected(r.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', cursor: 'pointer', borderBottom: `1px solid ${M.surface0}`, color: M.text }}>
              <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${selected === r.id ? M.mauve : M.surface1}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: selected === r.id ? M.mauve : 'transparent' }}>
                {selected === r.id && <FaCheck size={10} style={{ color: '#fff' }} />}
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{r.nome}</span>
            </div>
          ))}
          {filtered.length === 0 && <div style={{ color: M.sub0, textAlign: 'center', padding: '20px 0', fontSize: '0.82rem' }}>Nenhuma sala encontrada</div>}
        </div>
        {selected && (
          <div style={{ padding: '8px 16px 16px' }}>
            <button onClick={handleConfirm} style={{ ...B, width: '100%', padding: '10px', background: M.mauve, color: '#fff', borderRadius: 10, fontSize: '0.82rem', fontWeight: 600 }}>Encaminhar</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================================================
//  FILE: src/components/Chat/GifPicker.jsx
//  TYPE: React Component
// ==========================================================================

import { FaTimes } from 'react-icons/fa';
import { B } from './constants.js';

export default function GifPicker({ query, results, searching, onSearch, onSelect, onClose, M }) {
  return (
    <div style={{
      padding: '4px 8px', borderBottom: `1px solid ${M.surface1}55`,
      maxHeight: 200, overflowY: 'auto',
    }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        <input type="text" value={query} onChange={e => onSearch(e.target.value)}
          placeholder="Buscar GIFs..." aria-label="Buscar GIFs" autoFocus
          style={{
            flex: 1, background: M.surface1, border: 'none', borderRadius: 6,
            padding: '4px 8px', color: M.text, fontSize: '0.78rem',
            outline: 'none', fontFamily: 'inherit',
          }} />
        <button onClick={onClose} aria-label="Fechar GIFs"
          style={{ ...B, background: 'none', color: M.sub0, padding: 8, minWidth: 36, minHeight: 36 }}>
          <FaTimes size={12} />
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
        {results.map((g, i) => (
          <img key={i} src={g.url} alt={g.title || 'GIF'} onClick={() => onSelect(g.url)}
            style={{ width: '100%', borderRadius: 6, cursor: 'pointer', aspectRatio: '1', objectFit: 'cover' }} />
        ))}
        {query && results.length === 0 &&
          <p style={{ color: M.ov0, fontSize: '0.72rem', gridColumn: '1/-1', textAlign: 'center' }}>
            Digite para buscar GIFs...
          </p>}
      </div>
    </div>
  );
}

// ==========================================================================
//  FILE: src/components/Chat/LightboxModal.jsx
//  TYPE: React Component
// ==========================================================================

import { FaTimes, FaDownload, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { B } from './constants.js';

export default function LightboxModal({ images, currentIndex, M, onClose, onPrev, onNext }) {
  if (!images || currentIndex === null) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label="Visualizador de imagens" onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 99999, cursor: 'pointer',
    }}>
      {images.length > 1 && (
        <button onClick={e => { e.stopPropagation(); onPrev?.(); }} aria-label="Imagem anterior" style={{ ...B, position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: '#fff', padding: 12, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FaArrowLeft size={18} />
        </button>
      )}
      <img src={images[currentIndex]} alt="Imagem em tela cheia" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 8, cursor: 'default' }} onClick={e => e.stopPropagation()} />
      {images.length > 1 && (
        <button onClick={e => { e.stopPropagation(); onNext?.(); }} aria-label="Próxima imagem" style={{ ...B, position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: '#fff', padding: 12, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FaArrowRight size={18} />
        </button>
      )}
      <button onClick={onClose} aria-label="Fechar" style={{ ...B, position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,0.5)', color: '#fff', padding: 10, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <FaTimes size={18} />
      </button>
      <a href={images[currentIndex]} download aria-label="Baixar imagem" style={{ ...B, position: 'absolute', bottom: 16, right: 16, background: 'rgba(0,0,0,0.5)', color: '#fff', padding: 10, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <FaDownload size={16} />
      </a>
      {images.length > 1 && (
        <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', background: 'rgba(0,0,0,0.5)', padding: '4px 12px', borderRadius: 12 }}>
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}

// ==========================================================================
//  FILE: src/components/Chat/LoadingSkeleton.jsx
//  TYPE: React Component
// ==========================================================================

import SkeletonMsg from './SkeletonMsg.jsx';

const SW = 232;

export default function LoadingSkeleton({ M }) {
  return (
    <div style={{ height: '100vh', display: 'flex', background: M.base, fontFamily: 'system-ui,-apple-system,sans-serif', color: M.text, overflow: 'hidden' }}>
      <div style={{ width: SW, flexShrink: 0, background: M.mantle, display: 'flex', flexDirection: 'column', height: '100vh', borderRight: `1px solid ${M.surface0}` }}>
        <div style={{ padding: '13px 14px', borderBottom: `1px solid ${M.surface0}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: M.surface0, animation: 'pulse 1.5s infinite' }} />
          <div style={{ width: 100, height: 12, background: M.surface0, borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
        </div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', margin: '2px 6px' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: M.surface0, animation: 'pulse 1.5s infinite' }} />
            <div style={{ flex: 1, height: 10, background: M.surface0, borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
          </div>
        ))}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '10px 14px' }}>
        {[1, 2, 3].map(i => <SkeletonMsg key={i} />)}
      </div>
    </div>
  );
}

// ==========================================================================
//  FILE: src/components/Chat/MembersPanel.jsx
//  TYPE: React Component
// ==========================================================================

import { useState } from 'react';
import { FaTimes, FaCrown, FaUserShield, FaUser, FaUserMinus, FaBan, FaCheck, FaStar } from 'react-icons/fa';
import { B } from './constants.js';

export default function MembersPanel({ members, onlineUsers, user, room, M, onClose, onTransfer, onKick, onBan, onChangeRole }) {
  const [tab, setTab] = useState('members');

  const sorted = [...members].sort((a, b) => {
    if (a.id === room?.owner_id) return -1;
    if (b.id === room?.owner_id) return 1;
    if (a.role === 'admin') return -1;
    if (b.role === 'admin') return 1;
    return 0;
  });

  const handleAction = (action, target) => {
    if (action === 'transfer') onTransfer?.(target);
    if (action === 'kick') onKick?.(target);
    if (action === 'ban') onBan?.(target);
    if (action === 'toggleAdmin') onChangeRole?.(target, target.role === 'admin' ? 'member' : 'admin');
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Membros" onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px', backdropFilter: 'blur(4px)',
    }}>
      <div style={{ background: M.mantle, border: `1px solid ${M.surface0}`, borderRadius: '16px', width: '100%', maxWidth: '400px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 8px' }}>
          <span style={{ color: M.text, fontWeight: 700, fontSize: '0.92rem' }}>Membros ({members.length})</span>
          <button onClick={onClose} aria-label="Fechar" style={{ ...B, padding: 6, background: M.surface0, borderRadius: 10, color: M.text, display: 'flex' }}><FaTimes size={14} /></button>
        </div>
        <div style={{ overflow: 'auto', flex: 1, padding: '8px 16px 16px' }}>
          {sorted.map(m => {
            const isOwner = m.id === room?.owner_id;
            const isSelf = m.id === user?.id;
            const canManage = (user?.id === room?.owner_id) && !isSelf && !isOwner;
            return (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${M.surface0}` }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: onlineUsers.has(m.id) ? M.green : M.surface0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.72rem', fontWeight: 700, color: onlineUsers.has(m.id) ? '#fff' : M.sub0, flexShrink: 0,
                }}>{m.nome?.[0]?.toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: M.text, fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {m.nome}
                    {isOwner && <FaCrown size={11} style={{ color: M.yellow }} />}
                    {m.role === 'admin' && !isOwner && <FaUserShield size={11} style={{ color: M.blue }} />}
                    {m.verification >= 2 && <FaCheck size={10} style={{ color: M.green }} />}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: M.sub0 }}>
                    {onlineUsers.has(m.id) ? 'Online' : 'Offline'} {isSelf && '(você)'}
                  </div>
                </div>
                {canManage && (
                  <div style={{ display: 'flex', gap: 2 }}>
                    <button onClick={() => handleAction('toggleAdmin', m)} title={m.role === 'admin' ? 'Remover admin' : 'Tornar admin'} aria-label={m.role === 'admin' ? 'Remover admin' : 'Tornar admin'} style={{ ...B, padding: 6, background: M.surface0, borderRadius: 8, color: M.blue, fontSize: '0.72rem' }}><FaUserShield size={11} /></button>
                    <button onClick={() => handleAction('transfer', m)} title="Transferir propriedade" aria-label="Transferir propriedade" style={{ ...B, padding: 6, background: M.surface0, borderRadius: 8, color: M.yellow, fontSize: '0.72rem' }}><FaStar size={11} /></button>
                    <button onClick={() => handleAction('kick', m)} title="Expulsar" aria-label="Expulsar" style={{ ...B, padding: 6, background: M.surface0, borderRadius: 8, color: M.red, fontSize: '0.72rem' }}><FaUserMinus size={11} /></button>
                    <button onClick={() => handleAction('ban', m)} title="Banir" aria-label="Banir" style={{ ...B, padding: 6, background: M.surface0, borderRadius: 8, color: M.red, fontSize: '0.72rem' }}><FaBan size={11} /></button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
//  FILE: src/components/Chat/MentionAutocomplete.jsx
//  TYPE: React Component
// ==========================================================================

import { getColor } from './constants.js';

export default function MentionAutocomplete({ members, userId, onSelect, mentionIndex, M }) {
  return (
    <div style={{
      position: 'absolute', bottom: '100%', left: 60, background: M.crust,
      border: `1px solid ${M.surface1}`, borderRadius: 8, padding: 2,
      maxHeight: 120, overflowY: 'auto', zIndex: 100,
    }}>
      {members.filter(m => m.id !== userId).map((m, idx) => (
        <div key={m.id} onClick={() => onSelect(m)}
          style={{
            padding: '4px 10px', borderRadius: 4, cursor: 'pointer',
            background: idx === mentionIndex ? M.surface0 : 'none',
            fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6,
          }}>
          <div style={{
            width: 18, height: 18, borderRadius: '50%', background: getColor(m.nome),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.55rem', color: '#fff', fontWeight: 700,
          }}>
            {m.nome[0]?.toUpperCase()}
          </div>
          {m.nome}
          {m.is_owner ? <span style={{ fontSize: '0.6rem', color: M.mauve }}>dono</span> : null}
        </div>
      ))}
      <div onClick={() => onSelect('everyone')}
        style={{ padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem', color: M.yellow }}>
        @everyone — Notificar todos
      </div>
      <div onClick={() => onSelect('here')}
        style={{ padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem', color: M.green }}>
        @here — Notificar online
      </div>
    </div>
  );
}

// ==========================================================================
//  FILE: src/components/Chat/MessageList.jsx
//  TYPE: React Component
// ==========================================================================

import { FaSpinner, FaCheckSquare, FaRegSquare } from 'react-icons/fa';
import { B } from './constants.js';
import MsgBubble from '../MsgBubble.jsx';
import DateSeparator from '../DateSeparator.jsx';
import UnreadDivider from './UnreadDivider.jsx';
import EmptyMessages from './EmptyMessages.jsx';

export default function MessageList({
  msgs, M, user, canModerate, multiSelect, selectedIds, lastReadId,
  loadingMore, hasMore, typingText, mainRef, endRef, onScroll,
  onContextMenu, onReact, onEdit, onDelete, onPin, onToggleSelect,
  onReply, onImageClick, resolvePreview, shouldShowDateSep,
}) {
  return (
    <main ref={mainRef} onScroll={onScroll} role="log" aria-live="polite" aria-label="Mensagens"
      style={{ flex: 1, overflowY: 'auto', padding: '10px 14px', display: 'flex', flexDirection: 'column' }}>
      {loadingMore && <div style={{ textAlign: 'center', padding: '8px', color: M.ov0 }}><FaSpinner size={14} style={{ animation: 'spin 1s linear infinite' }} /></div>}
      {!hasMore && msgs.length > 0 && <div style={{ textAlign: 'center', padding: '12px 0 4px', fontSize: '0.7rem', color: M.ov0 }}>— início do histórico —</div>}
      {msgs.length === 0 ? (
        <EmptyMessages M={M} />
      ) : (
        msgs.map((msg, i) => {
          if (msg.__system || msg.is_system) return <MsgBubble key={msg.id} msg={{ ...msg, __system: true }} grouped={false} isOwn={false} M={M} />;
          const showUnreadDivider = lastReadId && msg.id === lastReadId && i < msgs.length - 1;
          return (
            <div key={msg.id}>
              {shouldShowDateSep(msgs, i) && <DateSeparator date={msg.created_at} />}
              {showUnreadDivider && <UnreadDivider M={M} />}
              <div onContextMenu={(e) => onContextMenu(e, msg)} style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                {multiSelect && (
                  <button onClick={() => onToggleSelect(msg.id)} aria-label={selectedIds.has(msg.id) ? 'Desselecionar mensagem' : 'Selecionar mensagem'} style={{ ...B, background: 'none', color: M.sub0, padding: '6px 2px', marginTop: 12, flexShrink: 0 }}>
                    {selectedIds.has(msg.id) ? <FaCheckSquare size={14} color={M.mauve} /> : <FaRegSquare size={14} />}
                  </button>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <MsgBubble msg={msg} M={M}
                    grouped={i > 0 && !msgs[i - 1].__system && msgs[i - 1].user_id === msg.user_id && !shouldShowDateSep(msgs, i)}
                    isOwn={user && msg.user_id === user.id}
                    onReact={onReact}
                    onEdit={user && msg.user_id === user.id ? onEdit : null}
                    onDelete={user && (msg.user_id === user.id || canModerate) ? onDelete : null}
                    onReply={onReply}
                    onPin={canModerate ? onPin : null}
                    onImageClick={onImageClick}
                    preview={resolvePreview(msg)} />
                </div>
              </div>
            </div>
          );
        })
      )}
      {typingText && <div style={{ fontSize: '0.72rem', color: M.ov0, fontStyle: 'italic', padding: '4px 0 2px 40px', animation: 'fadeIn 0.2s ease-out' }}>{typingText}</div>}
      <div ref={endRef} />
    </main>
  );
}

// ==========================================================================
//  FILE: src/components/Chat/MobileOverlay.jsx
//  TYPE: React Component
// ==========================================================================

export default function MobileOverlay({ mobile, sideOpen, onClose, M }) {
  if (!mobile || !sideOpen) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
      zIndex: 200, backdropFilter: 'blur(2px)',
    }} />
  );
}

// ==========================================================================
//  FILE: src/components/Chat/MultiSelectBar.jsx
//  TYPE: React Component
// ==========================================================================

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
        <button onClick={onClear} aria-label="Limpar seleção" style={{ ...B, padding: 8, background: M.surface0, borderRadius: 10, color: M.sub0, display: 'flex' }}>
          <FaTimes size={14} />
        </button>
      </div>
    </div>
  );
}

// ==========================================================================
//  FILE: src/components/Chat/PinnedMsgsBar.jsx
//  TYPE: React Component
// ==========================================================================

import { FaThumbtack } from 'react-icons/fa';

export default function PinnedMsgsBar({ pinnedMsgs, M }) {
  if (!pinnedMsgs || pinnedMsgs.length === 0) return null;
  return (
    <div style={{ background: `${M.yellow}08`, borderBottom: `1px solid ${M.yellow}30`, padding: '8px 14px', maxHeight: 150, overflowY: 'auto' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: M.yellow, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
        <FaThumbtack size={10} /> Fixadas
      </div>
      {pinnedMsgs.map(msg => (
        <div key={msg.id} style={{ fontSize: '0.78rem', padding: '2px 0', color: M.sub0 }}>
          <span style={{ color: M.mauve, fontWeight: 600 }}>{msg.user_name}</span>: {msg.content.slice(0, 80)}{msg.content.length > 80 ? '…' : ''}
        </div>
      ))}
    </div>
  );
}

// ==========================================================================
//  FILE: src/components/Chat/ProfileModal.jsx
//  TYPE: React Component
// ==========================================================================

import { FaTimes, FaCheck, FaUser, FaCrown, FaUserShield, FaStar } from 'react-icons/fa';
import { B, getColor } from './constants.js';

export default function ProfileModal({ profileUser, M, onClose, onStartDM }) {
  if (!profileUser) return null;

  const color = getColor(profileUser.nome);

  const stats = [
    { label: 'Mensagens', value: profileUser.msg_count ?? '—' },
    { label: 'Contagem', value: profileUser.contagem ?? '—' },
    { label: 'Nível', value: profileUser.verification ?? 0 },
    { label: 'Votos', value: profileUser.votos ?? '—' },
  ];

  return (
    <div role="dialog" aria-modal="true" aria-label="Perfil" onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px', backdropFilter: 'blur(4px)',
    }}>
      <div style={{ background: M.mantle, border: `1px solid ${M.surface0}`, borderRadius: '16px', width: '100%', maxWidth: '360px', overflow: 'hidden' }}>
        <div style={{ background: `linear-gradient(135deg, ${color}40, ${M.mantle})`, padding: '24px 20px 20px', position: 'relative' }}>
          <button onClick={onClose} aria-label="Fechar" style={{ ...B, position: 'absolute', top: 12, right: 12, padding: 6, background: 'rgba(0,0,0,0.3)', borderRadius: 10, color: '#fff', display: 'flex' }}><FaTimes size={14} /></button>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>{profileUser.nome?.[0]?.toUpperCase()}</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                {profileUser.nome}
                {profileUser.role === 'owner' && <FaCrown size={13} style={{ color: M.yellow }} />}
                {profileUser.role === 'admin' && <FaUserShield size={13} style={{ color: M.blue }} />}
                {profileUser.verification >= 2 && <FaCheck size={12} style={{ color: M.green }} />}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.76rem' }}>{profileUser.role === 'owner' ? 'Dono' : profileUser.role === 'admin' ? 'Admin' : 'Membro'}</div>
            </div>
          </div>
        </div>
        <div style={{ padding: '16px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            {stats.map(s => (
              <div key={s.label} style={{ background: M.surface0, borderRadius: 10, padding: '10px', textAlign: 'center' }}>
                <div style={{ color: M.text, fontWeight: 700, fontSize: '0.9rem' }}>{s.value}</div>
                <div style={{ color: M.sub0, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.02em', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <button onClick={() => { onStartDM?.(profileUser.id); onClose?.(); }} style={{ ...B, width: '100%', padding: '10px', background: M.mauve, color: '#fff', borderRadius: 10, fontSize: '0.82rem', fontWeight: 600 }}>
            Enviar mensagem
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
//  FILE: src/components/Chat/ReconnectBanner.jsx
//  TYPE: React Component
// ==========================================================================

import { FaExclamationTriangle } from 'react-icons/fa';

export default function ReconnectBanner({ connected, M }) {
  if (connected) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      background: M.red, color: M.crust, textAlign: 'center',
      padding: '6px 16px', fontSize: '0.78rem', fontWeight: 600,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    }}>
      <FaExclamationTriangle size={12} /> Reconectando...
    </div>
  );
}

// ==========================================================================
//  FILE: src/components/Chat/ReplyIndicator.jsx
//  TYPE: React Component
// ==========================================================================

import { FaReply, FaTimes } from 'react-icons/fa';

export default function ReplyIndicator({ replyingTo, onCancel, M }) {
  if (!replyingTo) return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px',
      marginBottom: 4, background: M.surface0, borderRadius: 8, fontSize: '0.75rem',
    }}>
      <FaReply size={10} color={M.mauve} />
      <span style={{ flex: 1, color: M.sub0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        Respondendo a <strong style={{ color: M.mauve }}>{replyingTo.user_name}</strong>: {replyingTo.content}
      </span>
      <button onClick={onCancel} aria-label="Cancelar resposta"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: M.sub0, display: 'flex', padding: 2 }}>
        <FaTimes size={10} />
      </button>
    </div>
  );
}

// ==========================================================================
//  FILE: src/components/Chat/RoomHeader.jsx
//  TYPE: React Component
// ==========================================================================

import { useState, useRef, useEffect } from 'react';
import { FaBars, FaLock, FaHashtag, FaCheck, FaClipboard, FaInfoCircle, FaSearch, FaThumbtack, FaHistory, FaArchive, FaUsers, FaEllipsisV, FaTrash, FaSignOutAlt } from 'react-icons/fa';
import { B } from './constants.js';

export default function RoomHeader({
  room, M, mobile, copied, pinnedMsgs, showDesc, searchOpen, showPinned,
  canModerate, members, membersOpen,
  onToggleSide, onToggleSearch, onTogglePinned, onOpenAudit, onToggleMembers,
  onCopyCode, onArchive, onDeleteRoom, onLeave, onOpenSidebar,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handle = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  const menuItems = [
    { icon: FaInfoCircle, label: 'Info', onClick: onToggleSide, active: showDesc },
    { icon: FaSearch, label: 'Pesquisar', onClick: onToggleSearch, active: searchOpen },
    ...(pinnedMsgs.length > 0 ? [{ icon: FaThumbtack, label: `Fixadas (${pinnedMsgs.length})`, onClick: onTogglePinned, active: showPinned, color: M.yellow }] : []),
    ...(canModerate ? [{ icon: FaHistory, label: 'Auditoria', onClick: onOpenAudit }] : []),
    ...(room?.is_owner ? [{ icon: FaArchive, label: 'Arquivar', onClick: onArchive }] : []),
    ...(room?.is_owner ? [{ icon: FaTrash, label: 'Deletar', onClick: onDeleteRoom }] : []),
    ...(room && !room?.is_owner ? [{ icon: FaSignOutAlt, label: 'Sair', onClick: onLeave }] : []),
  ];

  return (
    <header style={{ background: M.mantle, borderBottom: `1px solid ${M.surface0}`, padding: '11px 16px', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
      {mobile && <button onClick={onOpenSidebar} aria-label="Abrir sidebar" style={{ ...B, background: 'none', color: M.sub0, padding: '4px', flexShrink: 0 }}><FaBars size={14} /></button>}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: '14px', lineHeight: 0 }}>{room?.password_hash ? <FaLock size={14} /> : <FaHashtag size={14} />}</span>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span style={{ fontWeight: 700, fontSize: '0.92rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {room?.name || 'Carregando...'}
          </span>
          {room?.description && <span style={{ fontSize: '0.68rem', color: M.ov0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{room.description}</span>}
        </div>
        {room?.code && (
          <button onClick={onCopyCode} style={{ border: `1px solid ${M.surface1}`, borderRadius: '6px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 600, fontSize: '0.72rem', transition: 'all 0.15s', background: copied ? M.green : 'none', color: copied ? M.crust : M.sub0, padding: '2px 7px', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            {copied ? <FaCheck size={10} /> : <FaClipboard size={10} />} {room.code}
          </button>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.73rem', color: M.sub0, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: M.green, display: 'inline-block' }} />
            {members.length}
          </span>
          <button onClick={onToggleMembers} aria-label={membersOpen ? 'Fechar membros' : 'Membros'} style={{ ...B, background: membersOpen ? M.surface0 : 'none', color: membersOpen ? M.text : M.sub0, padding: '6px 8px', borderRadius: '8px', lineHeight: 0 }}>
            <FaUsers size={16} />
          </button>
        </div>
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button onClick={() => setMenuOpen(v => !v)} aria-label="Menu da sala" style={{ ...B, background: menuOpen ? M.surface0 : 'none', color: M.sub0, padding: '8px', minWidth: 36, minHeight: 36, borderRadius: '8px', lineHeight: 0 }}>
            <FaEllipsisV size={14} />
          </button>
          {menuOpen && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 4,
              background: M.mantle, border: `1px solid ${M.surface1}`, borderRadius: 8,
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)', zIndex: 100,
              minWidth: 180, padding: '4px 0',
            }}>
              {menuItems.map((item, i) => (
                <button key={i} onClick={() => { item.onClick(); close(); }}
                  style={{
                    ...B, width: '100%', justifyContent: 'flex-start', gap: 10,
                    padding: '8px 14px', borderRadius: 0, fontSize: '0.82rem',
                    background: item.active ? M.surface0 : 'none',
                    color: item.color || (item.active ? M.text : M.sub0),
                  }}>
                  <item.icon size={13} />
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// ==========================================================================
//  FILE: src/components/Chat/RoomListItem.jsx
//  TYPE: React Component
// ==========================================================================

import { FaLock, FaHashtag, FaUser, FaStar } from 'react-icons/fa';
import { B } from './constants.js';

export default function RoomListItem({ room, currentRoomId, onSwitch, onToggleFavorite, isFavorite, isDM, mobile, onSideClose, M }) {
  return (
    <div onClick={() => { onSwitch(room); if (mobile) onSideClose(); }}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px',
        borderRadius: '8px', cursor: 'pointer',
        background: room.id === parseInt(currentRoomId) ? M.surface0 : 'transparent',
      }}>
      <span style={{ fontSize: '12px', lineHeight: 0, color: isDM ? M.blue : M.sub0 }}>
        {isDM ? <FaUser size={12} /> : (room.password_hash ? <FaLock size={12} /> : <FaHashtag size={12} />)}
      </span>
      <span style={{
        flex: 1, fontSize: '0.83rem',
        fontWeight: room.id === parseInt(currentRoomId) ? 600 : 400,
        color: room.id === parseInt(currentRoomId) ? M.text : M.sub1,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{room.name}</span>
      {onToggleFavorite && (
        <button onClick={e => { e.stopPropagation(); onToggleFavorite(room.id); }}
          aria-label={isFavorite ? 'Desfavoritar sala' : 'Favoritar sala'}
          style={{ ...B, background: 'none', color: isFavorite ? M.peach : M.ov0, padding: 2, minWidth: 28, minHeight: 28 }}>
          <FaStar size={11} />
        </button>
      )}
      {room.member_count != null && (
        <span style={{
          fontSize: '0.62rem', color: M.ov0, background: M.surface0,
          borderRadius: 8, padding: '1px 6px', whiteSpace: 'nowrap',
        }}>{room.member_count}</span>
      )}
    </div>
  );
}

// ==========================================================================
//  FILE: src/components/Chat/SavedMsgsBar.jsx
//  TYPE: React Component
// ==========================================================================

import { FaSave } from 'react-icons/fa';

export default function SavedMsgsBar({ msgs, savedMsgs, M }) {
  if (!savedMsgs || savedMsgs.size === 0) return null;
  return (
    <div style={{ background: `${M.blue}08`, borderBottom: `1px solid ${M.blue}30`, padding: '8px 14px', maxHeight: 150, overflowY: 'auto' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: M.blue, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
        <FaSave size={10} /> Salvos
      </div>
      {msgs.filter(m => savedMsgs.has(m.id)).map(msg => (
        <div key={msg.id} style={{ fontSize: '0.78rem', padding: '2px 0', color: M.sub0 }}>
          <span style={{ color: M.mauve, fontWeight: 600 }}>{msg.user_name}</span>: {msg.content.slice(0, 80)}{msg.content.length > 80 ? '…' : ''}
        </div>
      ))}
    </div>
  );
}

// ==========================================================================
//  FILE: src/components/Chat/ScrollToBottomBtn.jsx
//  TYPE: React Component
// ==========================================================================

import { FaArrowUp } from 'react-icons/fa';

export default function ScrollToBottomBtn({ visible, onClick, M }) {
  if (!visible) return null;
  return (
    <button onClick={onClick} aria-label="Rolar para baixo" style={{
      position: 'fixed', bottom: 120, right: 20, zIndex: 50, width: 36, height: 36,
      borderRadius: '50%', border: `1px solid ${M.surface1}`, background: M.surface0,
      color: M.sub0, cursor: 'pointer', display: 'flex', alignItems: 'center',
      justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    }}>
      <FaArrowUp size={14} style={{ transform: 'rotate(180deg)' }} />
    </button>
  );
}

// ==========================================================================
//  FILE: src/components/Chat/SearchBar.jsx
//  TYPE: React Component
// ==========================================================================

import { FaSearch, FaSpinner, FaTimes } from 'react-icons/fa';
import { B } from './constants.js';

export default function SearchBar({ open, query, searching, results, onQueryChange, onClose, onResultClick, M }) {
  if (!open) return null;
  return (
    <div style={{ padding: '8px 14px', background: M.mantle, borderBottom: `1px solid ${M.surface0}` }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', background: M.surface0, borderRadius: 8, padding: '0 10px' }}>
        <FaSearch size={12} color={M.ov0} />
        <input type="text" value={query} onChange={e => onQueryChange(e.target.value)}
          placeholder="Pesquisar mensagens..." aria-label="Pesquisar mensagens" autoFocus
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none', color: M.text,
            fontFamily: 'inherit', fontSize: '0.84rem', padding: '8px 0',
          }} />
        {searching && <FaSpinner size={12} style={{ animation: 'spin 1s linear infinite', color: M.ov0 }} />}
        <button onClick={onClose} aria-label="Fechar pesquisa"
          style={{ ...B, background: 'none', color: M.sub0, padding: 8, minWidth: 36, minHeight: 36 }}>
          <FaTimes size={12} />
        </button>
      </div>
      {results.length > 0 && (
        <div style={{ marginTop: 4, maxHeight: 200, overflowY: 'auto', background: M.surface0, borderRadius: 8 }}>
          {results.map(msg => (
            <div key={msg.id} style={{
              padding: '6px 10px', fontSize: '0.78rem',
              borderBottom: `1px solid ${M.surface1}`, cursor: 'pointer',
            }} onClick={() => onResultClick(msg)}>
              <span style={{ color: M.mauve, fontWeight: 600 }}>{msg.user_name}</span>
              <span style={{ color: M.ov0, marginLeft: 6, fontSize: '0.65rem' }}>
                {new Date(msg.created_at).toLocaleString('pt-BR')}
              </span>
              <div style={{
                color: M.sub0, marginTop: 2, overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{msg.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================================================
//  FILE: src/components/Chat/ShortcutsModal.jsx
//  TYPE: React Component
// ==========================================================================

import { FaTimes } from 'react-icons/fa';
import { B } from './constants.js';

const SHORTCUTS = [
  { keys: '?', desc: 'Abrir/fechar atalhos' },
  { keys: 'Esc', desc: 'Fechar modais / limpar seleção' },
  { keys: 'Ctrl+K', desc: 'Buscar mensagens' },
  { keys: 'Ctrl+F', desc: 'Buscar mensagens' },
  { keys: 'F11', desc: 'Tela cheia' },
  { keys: '@', desc: 'Mencionar usuário' },
  { keys: '/', desc: 'Comandos rápidos' },
  { keys: 'Enter', desc: 'Enviar mensagem' },
  { keys: 'Shift+Enter', desc: 'Nova linha' },
];

export default function ShortcutsModal({ M, onClose }) {
  return (
    <div role="dialog" aria-modal="true" aria-label="Atalhos do teclado" onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px', backdropFilter: 'blur(4px)',
    }}>
      <div style={{ background: M.mantle, border: `1px solid ${M.surface0}`, borderRadius: '16px', width: '100%', maxWidth: '400px', maxHeight: '80vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 8px' }}>
          <span style={{ color: M.text, fontWeight: 700, fontSize: '0.92rem' }}>Atalhos do teclado</span>
          <button onClick={onClose} aria-label="Fechar" style={{ ...B, padding: 6, background: M.surface0, borderRadius: 10, color: M.text, display: 'flex' }}><FaTimes size={14} /></button>
        </div>
        <div style={{ padding: '8px 16px 16px' }}>
          {SHORTCUTS.map((sc, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${M.surface0}` }}>
              <span style={{ color: M.sub0, fontSize: '0.82rem' }}>{sc.desc}</span>
              <kbd style={{ background: M.surface0, padding: '3px 8px', borderRadius: 6, fontSize: '0.72rem', color: M.mauve, fontWeight: 600, fontFamily: 'inherit' }}>{sc.keys}</kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
//  FILE: src/components/Chat/SidebarHeader.jsx
//  TYPE: React Component
// ==========================================================================

import { FaComment, FaSun, FaMoon, FaTimes } from 'react-icons/fa';
import { B } from './constants.js';

export default function SidebarHeader({ theme, setTheme, mobile, onClose, M }) {
  return (
    <div style={{
      padding: '13px 14px', borderBottom: `1px solid ${M.surface0}`,
      display: 'flex', alignItems: 'center', gap: '8px',
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%', background: M.mauve,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <FaComment size={13} color={M.crust} />
      </div>
      <span style={{ fontWeight: 700, fontSize: '0.88rem', flex: 1 }}>Bichim</span>
      <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        style={{ ...B, background: 'none', color: M.peach, padding: 8, minWidth: 36, minHeight: 36 }}
        title="Alternar tema" aria-label="Alternar tema">
        {theme === 'dark' ? <FaSun size={13} /> : <FaMoon size={13} />}
      </button>
      {mobile && (
        <button onClick={onClose} aria-label="Fechar sidebar"
          style={{ ...B, background: 'none', color: M.sub0, padding: 8, minWidth: 36, minHeight: 36 }}>
          <FaTimes size={14} />
        </button>
      )}
    </div>
  );
}

// ==========================================================================
//  FILE: src/components/Chat/SidebarQuickAccess.jsx
//  TYPE: React Component
// ==========================================================================

import { FaSave, FaThumbtack, FaUsers } from 'react-icons/fa';
import { B } from './constants.js';

export default function SidebarQuickAccess({ savedMsgs, pinnedMsgs, onSavedClick, onPinnedClick, onContactsClick, M }) {
  return (
    <>
      <div style={{
        padding: '7px 8px 4px', marginTop: 8, fontSize: '0.67rem', fontWeight: 700,
        color: M.text, textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        Acesso rápido
      </div>
      <div onClick={onSavedClick}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
          borderRadius: 8, cursor: 'pointer', color: M.sub0, fontSize: '0.83rem',
        }}>
        <FaSave size={12} /> Salvos {savedMsgs.size > 0 &&
          <span style={{
            fontSize: '0.62rem', background: M.surface0, borderRadius: 8,
            padding: '1px 6px', color: M.sub0,
          }}>{savedMsgs.size}</span>}
      </div>
      <div onClick={onPinnedClick}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
          borderRadius: 8, cursor: 'pointer', color: M.sub0, fontSize: '0.83rem',
        }}>
        <FaThumbtack size={12} /> Fixadas {pinnedMsgs.length > 0 &&
          <span style={{
            fontSize: '0.62rem', background: M.surface0, borderRadius: 8,
            padding: '1px 6px', color: M.sub0,
          }}>{pinnedMsgs.length}</span>}
      </div>
      <div onClick={onContactsClick}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
          borderRadius: 8, cursor: 'pointer', color: M.sub0, fontSize: '0.83rem',
        }}>
        <FaUsers size={12} /> Contatos
      </div>
    </>
  );
}

// ==========================================================================
//  FILE: src/components/Chat/SidebarRoomList.jsx
//  TYPE: React Component
// ==========================================================================

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
      <div style={{ padding: '7px 8px 4px', fontSize: '0.67rem', fontWeight: 700, color: M.text, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Salas {showArchived ? '(arquivadas)' : ''}
      </div>
    <button onClick={onToggleArchived} style={{ ...B, background: 'none', color: M.ov0, padding: '4px 8px', fontSize: '0.68rem', width: '100%', justifyContent: 'flex-start', gap: 4 }}>
      <FaArchive size={10} /> {showArchived ? 'Mostrar ativas' : 'Mostrar arquivadas'}
    </button>
    {dms.length > 0 && <>
      <div style={{ padding: '7px 8px 4px', marginTop: 4, fontSize: '0.67rem', fontWeight: 700, color: M.text, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Mensagens diretas</div>
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
        <div style={{ padding: '7px 8px 4px', marginTop: 4, fontSize: '0.67rem', fontWeight: 700, color: M.text, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Canais</div>
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

// ==========================================================================
//  FILE: src/components/Chat/SidebarUserFooter.jsx
//  TYPE: React Component
// ==========================================================================

import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import { B } from './constants.js';

export default function SidebarUserFooter({ user, onProfile, M }) {
  if (!user) return null;
  return (
    <div style={{
      padding: '10px 12px', borderTop: `1px solid ${M.surface0}`,
      display: 'flex', alignItems: 'center', gap: '8px',
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        background: M.mauve, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontWeight: 700, fontSize: '0.72rem', color: M.crust,
      }}>
        {user.nome?.[0]?.toUpperCase() || '?'}
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{
          fontSize: '0.78rem', fontWeight: 600, overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{user.nome}</div>
        <div style={{
          fontSize: '0.68rem', color: M.green, display: 'flex', alignItems: 'center', gap: '3px',
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: '50%', background: M.green, display: 'inline-block',
          }} /> online
        </div>
      </div>
      <button onClick={onProfile}
        style={{ ...B, background: 'none', color: M.sub0, padding: 8, minWidth: 36, minHeight: 36 }}
        title="Meu perfil" aria-label="Meu perfil"><FaUser size={12} /></button>
      <a href="/chat"
        style={{
          ...B, background: 'none', color: M.sub0, padding: 8, minWidth: 36, minHeight: 36,
          textDecoration: 'none',
        }} title="Voltar" aria-label="Voltar"><FaSignOutAlt size={14} /></a>
    </div>
  );
}

// ==========================================================================
//  FILE: src/components/Chat/SkeletonMsg.jsx
//  TYPE: React Component
// ==========================================================================

export default function SkeletonMsg() {
  return (
    <div style={{ display: 'flex', gap: 8, padding: '10px 0' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface0, #252525)', flexShrink: 0, animation: 'pulse 1.5s infinite' }} />
      <div style={{ flex: 1 }}>
        <div style={{ width: 80, height: 10, background: 'var(--surface0, #252525)', borderRadius: 4, marginBottom: 6, animation: 'pulse 1.5s infinite' }} />
        <div style={{ width: '60%', height: 32, background: 'var(--surface0, #252525)', borderRadius: 8, animation: 'pulse 1.5s infinite' }} />
      </div>
    </div>
  );
}

// ==========================================================================
//  FILE: src/components/Chat/SlashAutocomplete.jsx
//  TYPE: React Component
// ==========================================================================

import { slashCommands } from './constants.js';

export default function SlashAutocomplete({ filter, onSelect, M }) {
  const filtered = slashCommands.filter(sc => sc.cmd.slice(1).startsWith(filter));
  if (filtered.length === 0) return null;
  return (
    <div style={{
      position: 'absolute', bottom: '100%', left: 60, background: M.crust,
      border: `1px solid ${M.surface1}`, borderRadius: 8, padding: 2,
      maxHeight: 200, overflowY: 'auto', zIndex: 100, minWidth: 200,
    }}>
      {filtered.map((sc, idx) => (
        <div key={sc.cmd} onClick={() => onSelect(sc.cmd)}
          style={{
            padding: '4px 10px', borderRadius: 4, cursor: 'pointer',
            background: idx === 0 ? M.surface0 : 'none',
            fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6,
          }}>
          <span style={{ color: M.mauve, fontFamily: 'monospace', fontWeight: 600 }}>{sc.cmd}</span>
          <span style={{ color: M.ov0, fontSize: '0.7rem' }}>{sc.desc}</span>
        </div>
      ))}
    </div>
  );
}

// ==========================================================================
//  FILE: src/components/Chat/SlashHelpModal.jsx
//  TYPE: React Component
// ==========================================================================

import { FaTimes } from 'react-icons/fa';
import { B } from './constants.js';
import { slashCommands } from './constants.js';

export default function SlashHelpModal({ M, onClose }) {
  return (
    <div role="dialog" aria-modal="true" aria-label="Comandos" onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px', backdropFilter: 'blur(4px)',
    }}>
      <div style={{ background: M.mantle, border: `1px solid ${M.surface0}`, borderRadius: '16px', width: '100%', maxWidth: '400px', maxHeight: '80vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 8px' }}>
          <span style={{ color: M.text, fontWeight: 700, fontSize: '0.92rem' }}>Comandos</span>
          <button onClick={onClose} aria-label="Fechar" style={{ ...B, padding: 6, background: M.surface0, borderRadius: 10, color: M.text, display: 'flex' }}><FaTimes size={14} /></button>
        </div>
        <div style={{ padding: '8px 16px 16px' }}>
          {slashCommands.map((cmd, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 0', borderBottom: `1px solid ${M.surface0}` }}>
              <span style={{ background: M.mauve + '20', color: M.mauve, borderRadius: 6, padding: '2px 8px', fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap', fontFamily: 'monospace' }}>{cmd.command}</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: M.text, fontSize: '0.82rem' }}>{cmd.name}</div>
                <div style={{ color: M.sub0, fontSize: '0.72rem' }}>{cmd.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
//  FILE: src/components/Chat/StickerPicker.jsx
//  TYPE: React Component
// ==========================================================================

import { stickerList } from './constants.js';

export default function StickerPicker({ onStickerSelect, M }) {
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 3, padding: '4px 8px',
      borderBottom: `1px solid ${M.surface1}55`, maxHeight: 100, overflowY: 'auto',
    }}>
      {stickerList.map(s => (
        <button key={s} onClick={() => onStickerSelect(s)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', padding: '2px 3px', borderRadius: 4 }}
          onMouseEnter={e2 => e2.currentTarget.style.background = M.surface1}
          onMouseLeave={e2 => e2.currentTarget.style.background = 'none'}>{s}</button>
      ))}
    </div>
  );
}

// ==========================================================================
//  FILE: src/components/Chat/TransferModal.jsx
//  TYPE: React Component
// ==========================================================================

import { FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { B } from './constants.js';

export default function TransferModal({ target, room, M, onClose, onConfirm }) {
  if (!target) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label="Transferir sala" onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px', backdropFilter: 'blur(4px)',
    }}>
      <div style={{ background: M.mantle, border: `1px solid ${M.surface0}`, borderRadius: '16px', width: '100%', maxWidth: '380px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, color: M.yellow }}>
          <FaExclamationTriangle size={20} />
          <span style={{ color: M.text, fontWeight: 700, fontSize: '0.92rem' }}>Transferir sala</span>
        </div>
        <p style={{ color: M.sub0, fontSize: '0.82rem', lineHeight: 1.5, margin: '0 0 20px' }}>
          Tem certeza que deseja transferir a sala <strong style={{ color: M.text }}>{room?.nome}</strong> para <strong style={{ color: M.text }}>{target?.nome}</strong>? Você perderá o cargo de dono.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ ...B, background: M.surface0, color: M.sub0, padding: '8px 16px', fontSize: '0.82rem' }}>Cancelar</button>
          <button onClick={() => { onConfirm?.(target); onClose?.(); }} style={{ ...B, background: M.red, color: '#fff', padding: '8px 16px', fontSize: '0.82rem' }}>Transferir</button>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
//  FILE: src/components/Chat/UnreadDivider.jsx
//  TYPE: React Component
// ==========================================================================

export default function UnreadDivider({ M }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
      <div style={{ flex: 1, height: 1, background: M.mauve }} />
      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: M.mauve, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>Novas mensagens</span>
      <div style={{ flex: 1, height: 1, background: M.mauve }} />
    </div>
  );
}

// ==========================================================================
//  FILE: src/components/Chat/utils.js
//  TYPE: React Component
// ==========================================================================

export function getToken() {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? match[1] : null;
}

export function playMsgSound() {
  if (typeof window === 'undefined') return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 520;
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  } catch {}
}

export function pushNotify(title, body) {
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.svg' });
  }
}

export function setFaviconBadge(count) {
  const c = document.querySelector('link[rel="icon"]') || document.createElement('link');
  c.rel = 'icon';
  if (count > 0) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#0F0F0F"/><text x="16" y="22" text-anchor="middle" font-size="14" font-weight="bold" fill="#FF6B6B">${count > 9 ? '9+' : count}</text></svg>`;
    c.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  } else {
    c.href = '/favicon.svg';
  }
  document.head.appendChild(c);
}

export function getTheme() {
  if (typeof localStorage === 'undefined') return 'dark';
  try {
    const stored = localStorage.getItem('chat-theme');
    if (stored) return stored;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
    return 'dark';
  } catch { return 'dark'; }
}

// ==========================================================================
//  FILE: src/components/ChatScreen.jsx
//  TYPE: React Component
// ==========================================================================

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
  const { socketRef, connected, typing, onlineUsers } = socketHook;

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
    audioChunksRef.current = [];
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = () => {
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
  const typingText = typing.length > 0
    ? `${typing.map(t => t.userName).join(', ')}${typing.length > 1 ? ' estão' : ' está'} digitando...`
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
        <SidebarHeader theme={theme} setTheme={setTheme} mobile={mobile} onClose={() => setSideOpen(false)} M={M} />
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

// ==========================================================================
//  FILE: src/components/ConfirmDialog.jsx
//  TYPE: React Component
// ==========================================================================

const M = { mantle: '#1A1A1A', surface0: '#252525', surface1: '#2D2D2D', text: '#FFFFFF', sub0: '#BFBFBF', red: '#FF6B6B', mauve: '#EA5A3E' };

const B = {
  border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
  fontFamily: 'inherit', transition: 'all 0.15s', display: 'flex',
  alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 20px', fontSize: '0.84rem',
};

export default function ConfirmDialog({ message, onConfirm, onCancel, confirmLabel = 'Confirmar', danger = false }) {
  return (
    <div role="dialog" aria-modal="true" aria-label="Confirmação" onClick={e => e.target === e.currentTarget && onCancel()} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px', backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: M.mantle, border: `1px solid ${M.surface0}`, borderRadius: '16px',
        padding: '24px', width: '100%', maxWidth: '380px', textAlign: 'center',
      }}>
        <div style={{ color: M.text, fontSize: '0.92rem', marginBottom: '24px' }}>{message}</div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button onClick={onCancel} style={{ ...B, background: M.surface0, color: M.sub0, flex: 1 }}>Cancelar</button>
          <button onClick={onConfirm} style={{ ...B, background: danger ? M.red : M.mauve, color: '#fff', flex: 1 }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
//  FILE: src/components/Dashboard.jsx
//  TYPE: React Component
// ==========================================================================

import { useState, useEffect } from 'react';
import { FaComment, FaSignOutAlt, FaPlus, FaHashtag, FaClipboard, FaCheck, FaArrowRight, FaArrowLeft, FaRocket, FaSmile } from 'react-icons/fa';
import RoomCard from './RoomCard.jsx';
import Modal from './Modal.jsx';
import Lbl from './Lbl.jsx';

const M = {
  base: '#0F0F0F', mantle: '#1A1A1A', crust: '#252525',
  surface0: '#252525', surface1: '#2D2D2D',
  text: '#FFFFFF', sub0: '#BFBFBF', sub1: '#808080',
  mauve: '#EA5A3E', green: '#4ADE80', blue: '#60A5FA',
  red: '#FF6B6B', ov0: '#636363', ov1: '#3A3A3A',
};

const B = {
  border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
  fontFamily: 'inherit', transition: 'all 0.15s', display: 'flex',
  alignItems: 'center', justifyContent: 'center', gap: '6px',
};

const I = {
  background: M.base, border: `1px solid ${M.surface0}`, borderRadius: '8px',
  color: M.text, fontFamily: 'inherit', fontSize: '0.875rem',
  padding: '10px 12px', outline: 'none', width: '100%', boxSizing: 'border-box',
};

function SkeletonCard() {
  return (
    <div style={{
      background: M.mantle, border: `1px solid ${M.surface0}`, borderRadius: '12px',
      padding: '14px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: M.surface0, animation: 'pulse 1.5s infinite' }} />
        <div style={{ flex: 1 }}>
          <div style={{ width: '60%', height: 12, background: M.surface0, borderRadius: 4, marginBottom: 4, animation: 'pulse 1.5s infinite' }} />
          <div style={{ width: '30%', height: 10, background: M.surface0, borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
        </div>
      </div>
      <div style={{ width: '40%', height: 10, background: M.surface0, borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
    </div>
  );
}

function genCode() {
  const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 6 }, () => c[Math.floor(Math.random() * c.length)]).join('');
}

function getToken() {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? match[1] : null;
}

export default function Dashboard({ token: _token }) {
  const token = _token || getToken();
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  const API = '';

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const fetchMe = () =>
    fetch(`${API}/api/auth/me`, { headers, credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(setUser);

  const fetchRooms = () =>
    fetch(`${API}/api/rooms`, { headers, credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then(setRooms)
      .finally(() => setLoading(false));

  useEffect(() => {
    fetchMe();
    fetchRooms();
  }, []);

  const handleLogout = () => {
    fetch(`${API}/api/auth/logout`, {
      method: 'POST', headers, credentials: 'include',
    }).finally(() => {
      document.cookie = 'token=; path=/; max-age=0';
      window.location.href = '/auth/login';
    });
  };

  const handleEnter = (room) => {
    window.location.href = `/chat/${room.id}`;
  };

  const handleDelete = (roomId) => {
    fetch(`${API}/api/rooms/${roomId}`, {
      method: 'DELETE', headers, credentials: 'include',
    }).then(r => {
      if (r.ok) setRooms(rs => rs.filter(x => x.id !== roomId));
    });
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: M.base, color: M.text, fontFamily: 'system-ui,-apple-system,sans-serif' }}>
        <header style={{
          background: M.mantle, borderBottom: `1px solid ${M.surface0}`,
          padding: '13px 20px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: M.surface0, animation: 'pulse 1.5s infinite' }} />
            <div style={{ width: 100, height: 14, background: M.surface0, borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
          </div>
        </header>
        <main style={{ maxWidth: '920px', margin: '0 auto', padding: '24px 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '10px' }}>
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: M.base, fontFamily: 'system-ui,-apple-system,sans-serif', color: M.text }}>
      <header style={{
        background: M.mantle, borderBottom: `1px solid ${M.surface0}`,
        padding: '13px 20px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: M.mauve, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaComment size={15} color={M.crust} />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1rem' }}>Bichim</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%', background: M.mauve,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.8rem', color: M.crust,
          }}>
            {user?.nome?.[0]?.toUpperCase() || '?'}
          </div>
          <button onClick={handleLogout} style={{ ...B, background: 'none', color: M.sub0, padding: '6px' }} title="Sair" aria-label="Sair"><FaSignOutAlt size={14} /></button>
        </div>
      </header>

      <main style={{ maxWidth: '920px', margin: '0 auto', padding: '24px 16px' }}>
        <div style={{
          background: `${M.green}12`, border: `1px solid ${M.green}35`,
          borderRadius: '12px', padding: '12px 16px', marginBottom: '24px',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <FaRocket size={18} color={M.green} />
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: M.green }}>Servidor ativo</div>
            <div style={{ fontSize: '0.73rem', color: M.sub0 }}>
              Acessível de qualquer lugar via túnel
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ margin: '0 0 3px', fontSize: '1.25rem', fontWeight: 700 }}>
              Olá, {user?.nome || 'Usuário'} 
            </h2>
            <p style={{ margin: 0, color: M.sub0, fontSize: '0.82rem' }}>
              {rooms.length} sala{rooms.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setShowCreate(true)} style={{ ...B, background: M.mauve, color: M.crust, padding: '9px 16px', fontSize: '0.84rem' }}>
              <FaPlus size={14} /> Nova sala
            </button>
            <button onClick={() => setShowJoin(true)} style={{ ...B, background: M.surface0, color: M.text, padding: '9px 16px', fontSize: '0.84rem' }}>
              <FaHashtag size={12} /> Entrar com código
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '10px' }}>
          {rooms.map(r => (
            <RoomCard key={r.id} room={r} onEnter={() => handleEnter(r)} onDelete={r.is_owner ? () => handleDelete(r.id) : null} />
          ))}
        </div>

        {rooms.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: M.sub0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <FaComment size={48} style={{ opacity: 0.2 }} />
            <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: M.text }}>Nenhuma sala ainda</p>
            <p style={{ margin: 0, fontSize: '0.83rem' }}>Crie uma sala ou entre com um código para começar a conversar.</p>
          </div>
        )}
      </main>

      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreate={(r) => { window.location.href = `/chat/${r.id}`; }}
          token={token}
        />
      )}
      {showJoin && (
        <JoinModal
          onClose={() => setShowJoin(false)}
          onJoin={(r) => { handleEnter(r); setShowJoin(false); }}
          token={token}
        />
      )}
    </div>
  );
}

function CreateModal({ onClose, onCreate, token }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [code] = useState(genCode);
  const [usePw, setUsePw] = useState(false);
  const [pw, setPw] = useState('');
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState('');

  const copy = () => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const create = async () => {
    if (!name.trim()) { setErr('Nome da sala é obrigatório'); return; }
    try {
      const r = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: name.trim(), password: usePw ? pw : null, code, description: desc.trim() || undefined }),
        credentials: 'include',
      });
      if (r.ok) {
        const room = await r.json();
        onCreate(room);
      } else {
        const errData = await r.json();
        setErr(errData.erro || 'Erro ao criar sala');
      }
    } catch {
      setErr('Erro ao criar sala');
    }
  };

  return (
    <Modal title="Nova sala" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <Lbl htmlFor="roomNameInput">Nome da sala</Lbl>
          <input id="roomNameInput" type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="minha-sala" autoFocus style={I}
            onKeyDown={e => e.key === 'Enter' && create()} />
        </div>
        <div>
          <Lbl htmlFor="roomDescInput">Descrição (opcional)</Lbl>
          <textarea id="roomDescInput" value={desc} onChange={e => setDesc(e.target.value)}
            placeholder="Descrição da sala..."
            rows={2} style={{ ...I, resize: 'none', fontFamily: 'inherit' }} />
        </div>
        <div>
          <Lbl htmlFor="roomCodeInput">Código de convite (automático)</Lbl>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ ...I, flex: 1, fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.12em', color: M.mauve, cursor: 'default' }}>
              {code}
            </div>
            <button onClick={copy} style={{ ...B, background: copied ? M.green : M.surface0, color: copied ? M.crust : M.text, padding: '10px 14px', flexShrink: 0 }}>
              {copied ? <FaCheck size={14} /> : <FaClipboard size={14} />}
            </button>
          </div>
          <p style={{ margin: '5px 0 0', color: M.sub0, fontSize: '0.73rem' }}>
            Compartilhe para convidar — código de 6 dígitos gerado automaticamente.
          </p>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: M.sub1, fontSize: '0.84rem' }}>
          <input type="checkbox" checked={usePw} onChange={e => setUsePw(e.target.checked)} style={{ accentColor: M.mauve, width: 15, height: 15 }} />
          Adicionar senha (opcional)
        </label>
        {usePw && (
          <div>
            <Lbl htmlFor="roomPwInput">Senha da sala</Lbl>
            <input id="roomPwInput" type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Senha da sala" style={I} />
          </div>
        )}
        {err && <p style={{ margin: 0, color: M.red, fontSize: '0.8rem' }}>{err}</p>}
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <button onClick={onClose} style={{ ...B, flex: 1, padding: '11px', background: M.surface0, color: M.text, fontSize: '0.84rem' }}>Cancelar</button>
          <button onClick={create} style={{ ...B, flex: 2, padding: '11px', background: M.mauve, color: M.crust, fontSize: '0.84rem' }}><FaPlus size={14} /> Criar sala</button>
        </div>
      </div>
    </Modal>
  );
}

function JoinModal({ onClose, onJoin, token }) {
  const [code, setCode] = useState('');
  const [pw, setPw] = useState('');
  const [step, setStep] = useState(1);
  const [err, setErr] = useState('');

  const next = async () => {
    const c = code.trim().toUpperCase();
    if (c.length !== 6) { setErr('O código deve ter exatamente 6 caracteres.'); return; }
    setErr('');
    try {
      const r = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code: c }),
        credentials: 'include',
      });
      if (r.ok) {
        const room = await r.json();
        onJoin(room);
      } else if (r.status === 400) {
        const errData = await r.json();
        if (errData.erro === 'Senha obrigatória para esta sala') {
          setStep(2);
        } else {
          setErr(errData.erro || 'Erro ao entrar na sala');
        }
      } else {
        const errData = await r.json();
        setErr(errData.erro || 'Erro ao entrar na sala');
      }
    } catch {
      setErr('Erro ao entrar na sala');
    }
  };

  const joinRoom = async (joinCode, password) => {
    try {
      const r = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code: joinCode || code, password: password || pw || null }),
        credentials: 'include',
      });
      if (r.ok) {
        const room = await r.json();
        onJoin(room);
      } else {
        const errData = await r.json();
        setErr(errData.erro || 'Erro ao entrar na sala');
      }
    } catch {
      setErr('Erro ao entrar na sala');
    }
  };

  return (
    <Modal title={step === 1 ? 'Entrar com código' : 'Senha da sala'} onClose={onClose}>
      {step === 1 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <Lbl htmlFor="joinCodeInput">Código da sala (6 caracteres)</Lbl>
            <input id="joinCodeInput" type="text" value={code}
              onChange={e => setCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="UFP42X" maxLength={6} autoFocus
              style={{ ...I, fontFamily: 'monospace', fontSize: '1.15rem', fontWeight: 700, letterSpacing: '0.2em', textAlign: 'center' }}
              onKeyDown={e => e.key === 'Enter' && next()} />
          </div>
          {err && <p style={{ margin: 0, color: M.red, fontSize: '0.8rem' }}>{err}</p>}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onClose} style={{ ...B, flex: 1, padding: '11px', background: M.surface0, color: M.text, fontSize: '0.84rem' }}>Cancelar</button>
            <button onClick={next} style={{ ...B, flex: 2, padding: '11px', background: M.blue, color: M.crust, fontSize: '0.84rem' }}>Continuar <FaArrowRight size={12} /></button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ margin: 0, color: M.sub0, fontSize: '0.84rem' }}>
            A sala é protegida por senha.
          </p>
          <div>
            <Lbl htmlFor="joinPwInput">Senha</Lbl>
            <input id="joinPwInput" type="password" value={pw} onChange={e => setPw(e.target.value)}
              placeholder="••••••••" autoFocus style={I}
              onKeyDown={e => e.key === 'Enter' && joinRoom(code, pw)} />
          </div>
          {err && <p style={{ margin: 0, color: M.red, fontSize: '0.8rem' }}>{err}</p>}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => { setStep(1); setErr(''); }} style={{ ...B, flex: 1, padding: '11px', background: M.surface0, color: M.text, fontSize: '0.84rem' }}><FaArrowLeft size={12} /> Voltar</button>
            <button onClick={() => joinRoom(code, pw)} style={{ ...B, flex: 2, padding: '11px', background: M.blue, color: M.crust, fontSize: '0.84rem' }}>Entrar</button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ==========================================================================
//  FILE: src/components/DateSeparator.jsx
//  TYPE: React Component
// ==========================================================================

const M = { surface0: '#252525', overlay0: '#636363' };

function fmt(d) {
  const now = new Date();
  const t = new Date(d);
  const s = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (s(t, now)) return 'Hoje';
  const y = new Date(now); y.setDate(y.getDate() - 1);
  if (s(t, y)) return 'Ontem';
  return t.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: t.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}

export default function DateSeparator({ date }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0 8px' }}>
      <div style={{ flex: 1, height: 1, background: M.surface0 }} />
      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: M.overlay0, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
        {fmt(date)}
      </span>
      <div style={{ flex: 1, height: 1, background: M.surface0 }} />
    </div>
  );
}

// ==========================================================================
//  FILE: src/components/Lbl.jsx
//  TYPE: React Component
// ==========================================================================

const M = {
  sub1: '#808080',
};

export default function Lbl({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} style={{ fontSize: '0.78rem', fontWeight: 600, color: M.sub1, marginBottom: '6px', display: 'block' }}>
      {children}
    </label>
  );
}

// ==========================================================================
//  FILE: src/components/Modal.jsx
//  TYPE: React Component
// ==========================================================================

import { FaTimes } from 'react-icons/fa';

const M = { mantle: '#1A1A1A', surface0: '#252525', text: '#FFFFFF', sub0: '#BFBFBF' };

const B = {
  border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
  fontFamily: 'inherit', transition: 'all 0.15s', display: 'flex',
  alignItems: 'center', justifyContent: 'center', gap: '6px',
};

export default function Modal({ title, onClose, children }) {
  return (
    <div role="dialog" aria-modal="true" aria-label={title}
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '16px', backdropFilter: 'blur(4px)',
      }}
    >
      <div style={{
        background: M.mantle, border: `1px solid ${M.surface0}`, borderRadius: '16px',
        padding: '24px', width: '100%', maxWidth: '400px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: M.text, fontSize: '1.05rem', fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} aria-label="Fechar" style={{ ...B, background: 'none', color: M.sub0, padding: '4px' }}><FaTimes size={14} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ==========================================================================
//  FILE: src/components/MsgBubble.jsx
//  TYPE: React Component
// ==========================================================================

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

// ==========================================================================
//  FILE: src/components/PollRenderer.jsx
//  TYPE: React Component
// ==========================================================================

import { useState, useEffect } from 'react';
import { FaCheck, FaChartBar } from 'react-icons/fa';

const M = {
  mauve: '#EA5A3E', surface0: '#252525', surface1: '#2D2D2D',
  crust: '#252525', text: '#FFFFFF', sub0: '#BFBFBF', ov0: '#636363',
  green: '#4ADE80', blue: '#60A5FA', peach: '#FFB547', red: '#FF6B6B',
};

export default function PollRenderer({ poll, onVote, userVoted, isClosed }) {
  const total = poll.options?.reduce((s, o) => s + (o.votes || 0), 0) || 0;

  return (
    <div style={{ background: M.surface0, borderRadius: 12, border: `1px solid ${M.surface1}`, padding: '12px 14px', maxWidth: 320, marginTop: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <FaChartBar size={12} color={M.mauve} />
        <span style={{ fontWeight: 600, fontSize: '0.84rem', color: M.text, flex: 1 }}>{poll.question}</span>
        {isClosed && <span style={{ fontSize: '0.62rem', color: M.ov0, background: M.surface1, padding: '1px 6px', borderRadius: 4 }}>Encerrada</span>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {poll.options.map(opt => {
          const pct = total > 0 ? Math.round((opt.votes || 0) / total * 100) : 0;
          const selected = userVoted === opt.id;
          return (
            <div key={opt.id} onClick={() => !isClosed && onVote?.(opt.id)}
              style={{ cursor: isClosed ? 'default' : 'pointer', position: 'relative', background: selected ? `${M.mauve}15` : M.surface1, borderRadius: 8, padding: '8px 10px', overflow: 'hidden', transition: 'background 0.15s' }}
              onMouseEnter={e => { if (!isClosed) e.currentTarget.style.background = M.mauve + '25'; }}
              onMouseLeave={e => { if (!isClosed) e.currentTarget.style.background = selected ? `${M.mauve}15` : M.surface1; }}>
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${pct}%`, background: selected ? `${M.mauve}30` : M.surface0, transition: 'width 0.3s', borderRadius: 8 }} />
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, zIndex: 1 }}>
                <span style={{ fontSize: '0.8rem', color: M.text, flex: 1 }}>{opt.text}</span>
                <span style={{ fontSize: '0.68rem', color: M.ov0, fontWeight: 600, minWidth: 30, textAlign: 'right' }}>{pct}%</span>
                {selected && <FaCheck size={10} color={M.mauve} />}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: '0.6rem', color: M.ov0, marginTop: 8, textAlign: 'right' }}>
        {total} voto(s)
      </div>
    </div>
  );
}

// ==========================================================================
//  FILE: src/components/RoomCard.jsx
//  TYPE: React Component
// ==========================================================================

import { useState } from 'react';
import { FaLock, FaHashtag, FaUsers, FaClipboard, FaCheck, FaTrash } from 'react-icons/fa';

const M = {
  mantle: '#1A1A1A', surface0: '#252525', surface1: '#2D2D2D',
  text: '#FFFFFF', sub0: '#BFBFBF', mauve: '#EA5A3E',
  green: '#4ADE80', maroon: '#FF6B6B', yellow: '#FDB022',
};

const B = {
  border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
  fontFamily: 'inherit', transition: 'all 0.15s', display: 'flex',
  alignItems: 'center', justifyContent: 'center', gap: '6px',
};

function ago(dateStr) {
  if (!dateStr) return 'agora';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function RoomCard({ room, onEnter, onDelete }) {
  const [copied, setCopied] = useState(false);
  const copy = e => {
    e.stopPropagation();
    navigator.clipboard.writeText(room.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        background: M.mantle, border: `1px solid ${M.surface0}`, borderRadius: '12px',
        padding: '14px 16px', cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = M.mauve; e.currentTarget.style.boxShadow = `0 0 0 1px ${M.mauve}40`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = M.surface0; e.currentTarget.style.boxShadow = 'none'; }}
      onClick={onEnter}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            background: room.password_hash ? `${M.yellow}1a` : `${M.mauve}1a`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: room.password_hash ? M.yellow : M.mauve, lineHeight: 0 }}>
              {room.password_hash ? <FaLock size={15} /> : <FaHashtag size={15} />}
            </span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{room.name}</div>
            <div style={{ color: M.sub0, fontSize: '0.72rem', marginTop: '2px' }}>{ago(room.last_activity)} atrás</div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '10px', fontSize: '0.73rem', color: M.sub0, alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <FaUsers size={12} /> {room.member_count || 0}
          </span>
          <button
            onClick={copy}
            style={{
              ...B, background: 'none', color: copied ? M.green : M.sub0,
              padding: '2px 7px', fontSize: '0.73rem', border: `1px solid ${M.surface1}`,
              borderRadius: '6px', gap: '4px', fontFamily: 'monospace', fontWeight: 600,
            }}
          >
            {copied ? <FaCheck size={10} /> : <FaClipboard size={10} />} {room.code}
          </button>
        </div>
        {!!room.is_owner && onDelete && (
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            style={{ ...B, background: 'none', color: M.maroon, padding: '4px', borderRadius: '6px' }}
            title="Deletar sala" aria-label="Deletar sala"
          >
            <FaTrash size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

// ==========================================================================
//  FILE: src/components/Toast.jsx
//  TYPE: React Component
// ==========================================================================

import { useState, useEffect, useCallback } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const M = { green: '#4ADE80', red: '#FF6B6B', blue: '#60A5FA', surface0: '#252525', text: '#FFFFFF', sub0: '#BFBFBF' };

let addToastFn = null;

export function showToast(msg, type = 'info') {
  if (addToastFn) addToastFn(msg, type);
}

const icons = { success: FaCheckCircle, error: FaExclamationCircle, info: FaInfoCircle };
const colors = { success: M.green, error: M.red, info: M.blue };

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((msg, type) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  useEffect(() => { addToastFn = add; return () => { addToastFn = null; }; }, [add]);

  const remove = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 'calc(100vw - 32px)' }}>
      {toasts.map(t => {
        const Icon = icons[t.type] || FaInfoCircle;
        const c = colors[t.type] || M.blue;
        return (
          <div key={t.id} style={{
            background: M.surface0, border: `1px solid ${c}55`, borderRadius: 10,
            padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
            color: M.text, fontSize: '0.85rem', minWidth: 260, maxWidth: 'calc(100vw - 32px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            animation: 'slideIn 0.25s ease-out',
          }}>
            <Icon size={16} color={c} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{t.msg}</span>
            <button onClick={() => remove(t.id)} aria-label="Fechar notificação" style={{ background: 'none', border: 'none', cursor: 'pointer', color: M.sub0, padding: 2, display: 'flex' }}>
              <FaTimes size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ==========================================================================
//  FILE: src/hooks/useChatKeyboard.jsx
//  TYPE: React Hook
// ==========================================================================

import { useEffect } from 'react';

export default function useChatKeyboard({
  multiSelect, onEscape, onToggleShortcuts, onToggleSearch, onToggleFullscreen, onClickAway,
}) {
  useEffect(() => {
    const h = (e) => {
      if (e.key === '?' && !e.target.closest('input,textarea')) {
        e.preventDefault();
        onToggleShortcuts?.();
      }
      if (e.key === 'Escape') onEscape?.();
      if ((e.key === 'k' || e.key === 'f') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        onToggleSearch?.();
      }
      if (e.key === 'F11' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        onToggleFullscreen?.();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [multiSelect, onEscape, onToggleShortcuts, onToggleSearch, onToggleFullscreen]);

  useEffect(() => {
    window.__onClickAway = onClickAway;
    return () => { window.__onClickAway = undefined; };
  }, [onClickAway]);
}

// ==========================================================================
//  FILE: src/hooks/useChatSend.jsx
//  TYPE: React Hook
// ==========================================================================

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

    const doFetch = () => {
      fetch(`/api/rooms/${roomId}/messages`, {
        method: 'POST', headers, credentials: 'include',
        body: JSON.stringify({ content, reply_to: replyTo }),
      }).then(r => r.ok && r.json()).then(msg => {
        if (msg) {
          setMsgs(prev => [...prev, msg]);
          processPreviews(msg.content);
        }
      }).finally(() => setSending(false));
    };

    if (socket?.connected) {
      socket.emit('new-message', payload, (res) => {
        if (!res?.success) doFetch(); else setSending(false);
      });
    } else { doFetch(); }
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

// ==========================================================================
//  FILE: src/hooks/useChatSocket.jsx
//  TYPE: React Hook
// ==========================================================================

import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { showToast } from '../components/Toast.jsx';

export default function useChatSocket({ roomId, token, userId, setMsgs, setMembers }) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(true);
  const [typing, setTyping] = useState([]);
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

    s.on('typing', ({ userId, roomId: rId, users }) => {
      if (rId === parseInt(roomId)) setTyping(users.filter(u => u.userId !== userId));
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
      if (s.connected) { s.emit('leave-room', parseInt(roomId)); s.emit('stop-typing', { roomId: parseInt(roomId) }); }
      s.disconnect();
    };
  }, [roomId, token, userId]);

  return { socketRef, connected, typing, onlineUsers };
}

// ==========================================================================
//  FILE: src/lib/api/cliente.ts
//  TYPE: Utility / Library
// ==========================================================================

export const API_URL = import.meta.env.PUBLIC_API_URL || '';

function getTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? match[1] : null;
}

export async function apiClient<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = getTokenFromCookie();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string> || {}) },
    credentials: 'include',
  });

  if (!response.ok) {
    let errorData: Record<string, string> = {};
    try {
      errorData = await response.json();
    } catch {
      errorData.erro = `Erro na requisição: ${response.status}`;
    }
    throw new Error(errorData.erro || `Erro na requisição: ${response.status}`);
  }

  return response.json();
}

// ==========================================================================
//  FILE: src/lib/auth/sessao.ts
//  TYPE: Utility / Library
// ==========================================================================

import type { AstroCookies } from 'astro';

const SESSION_COOKIE = 'token';

export function getSessionToken(cookies: AstroCookies): string | null {
  return cookies.get(SESSION_COOKIE)?.value ?? null;
}

export function setSessionToken(cookies: AstroCookies, token: string): void {
  cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearSession(cookies: AstroCookies): void {
  cookies.delete(SESSION_COOKIE, { path: '/' });
}

// ==========================================================================
//  FILE: src/middleware/index.ts
//  TYPE: Middleware
// ==========================================================================

import { defineMiddleware } from 'astro:middleware';
import { jwtVerify } from 'jose';
import { getSessionToken } from '../lib/auth/sessao';

const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/cadastro', '/auth/verificacao', '/404'];

let _jwtSecret: Uint8Array | null = null;
function getJwtSecret(): Uint8Array {
  if (!_jwtSecret) {
    const secret = import.meta.env.JWT_SECRET || process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET environment variable is required');
    _jwtSecret = new TextEncoder().encode(secret);
  }
  return _jwtSecret;
}

async function isValidToken(token: string | null): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return false;
    if (payload.nbf && payload.nbf > now) return false;
    if (!payload.id && !payload.sub) return false;
    return true;
  } catch {
    return false;
  }
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect } = context;
  const isPublicRoute = PUBLIC_ROUTES.includes(url.pathname);
  const token = getSessionToken(cookies);
  const authenticated = await isValidToken(token);

  context.locals.token = token;

  if (authenticated && isPublicRoute && url.pathname !== '/') {
    return redirect('/chat');
  }

  if (isPublicRoute) {
    return next();
  }

  if (!authenticated) {
    if (url.pathname.startsWith('/api/')) {
      return new Response(
        JSON.stringify({ error: 'Sessão expirada ou não autorizada.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return redirect('/auth/login?erro=nao_autorizado');
  }

  return next();
});

// ==========================================================================
//  FILE: src/env.d.ts
//  TYPE: Source File
// ==========================================================================

/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_API_URL: string;
  readonly JWT_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
