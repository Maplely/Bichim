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
