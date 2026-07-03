import { defineMiddleware } from 'astro:middleware';
import { getSessionToken } from '../lib/auth/sessao';

const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/cadastro', '/auth/verificacao', '/404'];

const PORT = process.env.PORT || 3000;

async function isValidToken(token: string | null): Promise<boolean> {
  if (!token) return false;
  try {
    const res = await fetch(`http://127.0.0.1:${PORT}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
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
