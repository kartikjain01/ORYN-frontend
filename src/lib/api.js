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

export async function gradioUpload(spaceUrl, file) {
  const base = spaceUrl.replace(/\/+$/, '');
  const form = new FormData();
  form.append('files', file);
  const res = await fetch(`${base}/gradio_api/upload`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  const paths = await res.json();
  return { path: paths[0], meta: { _type: 'gradio.FileData' } };
}

export async function gradioCall(spaceUrl, fnName, data) {
  const base = spaceUrl.replace(/\/+$/, '');
  const submitRes = await fetch(`${base}/gradio_api/call/${fnName}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data }),
  });
  if (!submitRes.ok) {
    const errText = await submitRes.text();
    throw new Error(`${fnName} failed: ${submitRes.status} - ${errText}`);
  }
  const { event_id } = await submitRes.json();

  return new Promise((resolve, reject) => {
    const es = new EventSource(`${base}/gradio_api/call/${fnName}/${event_id}`);
    let settled = false;
    const done = (fn) => { if (!settled) { settled = true; es.close(); fn(); } };
    es.addEventListener('complete', (e) => {
      try { done(() => resolve(JSON.parse(e.data))); }
      catch { done(() => reject(new Error('Invalid response from server'))); }
    });
    es.addEventListener('error', (e) => {
      let msg = 'Server processing failed';
      try {
        const d = JSON.parse(e.data);
        if (typeof d === 'string') msg = d;
        else if (d?.error) msg = d.error;
      } catch {}
      done(() => reject(new Error(msg)));
    });
    es.onerror = () => {
      done(() => reject(new Error('Connection to server lost')));
    };
  });
}

export function gradioFileUrl(spaceUrl, fileData) {
  if (!fileData) return null;
  const raw = fileData?.url || fileData?.path || (typeof fileData === 'string' ? fileData : null);
  if (!raw) return null;
  if (raw.startsWith('http')) return raw;
  const base = spaceUrl.replace(/\/+$/, '');
  return `${base}/gradio_api/file=${raw}`;
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
