import type { AppState, ResourceName } from './types';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) {
    let message = `Erreur ${res.status}`;
    const body = await res.json().catch(() => null) as { error?: string } | null;
    if (body?.error) message = body.error;
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export const api = {
  state: () => request<AppState>('/api/state'),
  create: <T>(resource: ResourceName, body: unknown) =>
    request<T>(`/api/${resource}`, { method: 'POST', body: JSON.stringify(body) }),
  update: <T>(resource: ResourceName, id: string, body: unknown) =>
    request<T>(`/api/${resource}/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (resource: ResourceName, id: string) =>
    request<{ ok: boolean }>(`/api/${resource}/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  testCamera: (id: string) =>
    request<{ ok: boolean; message: string; ms: number; statut: string }>(
      `/api/cameras/${encodeURIComponent(id)}/test`,
      { method: 'POST' },
    ),
};
