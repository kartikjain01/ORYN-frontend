import { supabase } from '../supabaseClient';

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return {};
  return { Authorization: `Bearer ${session.access_token}` };
}

export async function authFetch(url, options = {}) {
  const authHeaders = await getAuthHeaders();
  const headers = {
    ...authHeaders,
    ...(options.headers || {}),
  };
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    const { error } = await supabase.auth.signOut();
    if (!error) window.location.href = '/register';
    throw new Error('Session expired');
  }
  return res;
}

export async function authJsonFetch(url, body, options = {}) {
  return authFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    ...options,
  });
}

export async function authUploadFetch(url, formData, options = {}) {
  return authFetch(url, {
    method: 'POST',
    body: formData,
    ...options,
  });
}

export function downloadName(prefix, label, ext) {
  const slug = (label || '')
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 40) || prefix;
  const ts = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');
  return `${prefix}_${slug}_${ts}.${ext}`;
}
