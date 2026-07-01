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
