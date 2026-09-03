import { supabase } from '../supabaseClient';

const TYPE_TAG_MAP = {
  voice_clone: { tag: 'Voice Clone', tagColor: 'bg-blue-600' },
  tts: { tag: 'TTS', tagColor: 'bg-indigo-600' },
  voice_editor: { tag: 'Voice Editor', tagColor: 'bg-cyan-600' },
  captions: { tag: 'Captions', tagColor: 'bg-amber-600' },
  video: { tag: 'Video', tagColor: 'bg-cyan-600' },
};

const VOICE_COLORS = [
  { playColor: 'bg-indigo-50', iconColor: 'text-indigo-500' },
  { playColor: 'bg-blue-50', iconColor: 'text-blue-500' },
  { playColor: 'bg-rose-50', iconColor: 'text-rose-500' },
  { playColor: 'bg-amber-50', iconColor: 'text-amber-500' },
  { playColor: 'bg-emerald-50', iconColor: 'text-emerald-500' },
  { playColor: 'bg-violet-50', iconColor: 'text-violet-500' },
  { playColor: 'bg-cyan-50', iconColor: 'text-cyan-500' },
  { playColor: 'bg-pink-50', iconColor: 'text-pink-500' },
];

const PROJECT_COLS = 'id,title,type,thumbnail_url,output_url,duration_seconds,views,status,created_at,updated_at';
const PROJECT_COLS_STATS = 'type,duration_seconds,file_size_bytes';
const VOICE_COLS = 'id,name,type,voice_id,audio_url,duration_seconds,created_at';
const VOICE_COLS_STATS = 'type,duration_seconds';

async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

function extractStoragePath(url) {
  if (!url) return null;
  const marker = '/storage/v1/object/public/outputs/';
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.substring(idx + marker.length);
}

async function removeStorageFile(url) {
  const path = extractStoragePath(url);
  if (!path) return;
  await supabase.storage.from('outputs').remove([path]);
}

function formatDuration(seconds) {
  if (!seconds) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `Edited ${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `Edited ${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `Edited ${Math.floor(diff / 86400)}d ago`;
  return `Edited ${Math.floor(diff / 604800)}w ago`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `Created on ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

export function mapProject(row) {
  const meta = TYPE_TAG_MAP[row.type] || { tag: row.type, tagColor: 'bg-slate-600' };
  return {
    id: row.id,
    tag: meta.tag,
    tagColor: meta.tagColor,
    title: row.title,
    time: timeAgo(row.updated_at || row.created_at),
    duration: formatDuration(row.duration_seconds),
    views: row.views || 0,
    thumbnailUrl: row.thumbnail_url,
    outputUrl: row.output_url,
    status: row.status,
    type: row.type,
  };
}

export function mapVoice(row, index) {
  const colors = VOICE_COLORS[index % VOICE_COLORS.length];
  return {
    id: row.id,
    name: row.name,
    type: row.type === 'voice_clone' ? 'Voice Clone' : 'TTS',
    rawType: row.type,
    date: formatDate(row.created_at),
    duration: formatDuration(row.duration_seconds),
    audioUrl: row.audio_url,
    voiceId: row.voice_id,
    ...colors,
  };
}

// ── Projects ────────────────────────────────────────────────

export async function getRecentProjects(limit = 4) {
  const user = await getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('projects')
    .select(PROJECT_COLS)
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(limit);
  if (error) { console.error('getRecentProjects:', error); return []; }
  return data.map(mapProject);
}

export async function getProjects({ type, search, sort } = {}) {
  const user = await getUser();
  if (!user) return [];
  let query = supabase.from('projects').select(PROJECT_COLS).eq('user_id', user.id);
  if (type && type !== 'All') {
    const dbType = Object.entries(TYPE_TAG_MAP).find(([, v]) => v.tag === type)?.[0];
    if (dbType) query = query.eq('type', dbType);
  }
  if (search) query = query.ilike('title', `%${search}%`);
  switch (sort) {
    case 'Oldest': query = query.order('created_at', { ascending: true }); break;
    case 'A-Z': query = query.order('title', { ascending: true }); break;
    case 'Z-A': query = query.order('title', { ascending: false }); break;
    default: query = query.order('updated_at', { ascending: false });
  }
  const { data, error } = await query;
  if (error) { console.error('getProjects:', error); return []; }
  return data.map(mapProject);
}

export async function createProject({ title, type, outputUrl, thumbnailUrl, durationSeconds, fileSizeBytes, metadata }) {
  const user = await getUser();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      title,
      type,
      output_url: outputUrl || null,
      thumbnail_url: thumbnailUrl || null,
      duration_seconds: durationSeconds || 0,
      file_size_bytes: fileSizeBytes || 0,
      metadata: metadata || {},
    })
    .select('id')
    .single();
  if (error) throw error;
  return data;
}

export async function renameProject(projectId, newTitle) {
  const { error } = await supabase.from('projects').update({ title: newTitle }).eq('id', projectId);
  if (error) throw error;
}

export async function deleteProject(projectId) {
  const { data } = await supabase
    .from('projects')
    .select('output_url,thumbnail_url')
    .eq('id', projectId)
    .single();
  if (data) {
    await Promise.all([
      removeStorageFile(data.output_url),
      removeStorageFile(data.thumbnail_url),
    ]);
  }
  const { error } = await supabase.from('projects').delete().eq('id', projectId);
  if (error) throw error;
}

// ── Voices ──────────────────────────────────────────────────

export async function getRecentVoices(limit = 4) {
  const user = await getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('voices')
    .select(VOICE_COLS)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) { console.error('getRecentVoices:', error); return []; }
  return data.map(mapVoice);
}

export async function getVoices({ type, search } = {}) {
  const user = await getUser();
  if (!user) return [];
  let query = supabase.from('voices').select(VOICE_COLS).eq('user_id', user.id);
  if (type && type !== 'All') {
    const dbType = type === 'Voice Clone' ? 'voice_clone' : 'tts';
    query = query.eq('type', dbType);
  }
  if (search) query = query.ilike('name', `%${search}%`);
  query = query.order('created_at', { ascending: false });
  const { data, error } = await query;
  if (error) { console.error('getVoices:', error); return []; }
  return data.map(mapVoice);
}

export async function createVoice({ name, type, voiceId, audioUrl, durationSeconds, metadata }) {
  const user = await getUser();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('voices')
    .insert({
      user_id: user.id,
      name,
      type,
      voice_id: voiceId || null,
      audio_url: audioUrl || null,
      duration_seconds: durationSeconds || 0,
      metadata: metadata || {},
    })
    .select('id')
    .single();
  if (error) throw error;
  return data;
}

export async function renameVoice(voiceId, newName) {
  const { error } = await supabase.from('voices').update({ name: newName }).eq('id', voiceId);
  if (error) throw error;
}

export async function deleteVoice(voiceId) {
  const { data } = await supabase
    .from('voices')
    .select('audio_url')
    .eq('id', voiceId)
    .single();
  if (data) await removeStorageFile(data.audio_url);
  const { error } = await supabase.from('voices').delete().eq('id', voiceId);
  if (error) throw error;
}

// ── Usage Stats ─────────────────────────────────────────────

export async function getUsageStats() {
  const user = await getUser();
  if (!user) return null;
  const [{ data: projects }, { data: voices }] = await Promise.all([
    supabase.from('projects').select(PROJECT_COLS_STATS).eq('user_id', user.id),
    supabase.from('voices').select(VOICE_COLS_STATS).eq('user_id', user.id),
  ]);

  const stats = { voiceCloneMinutes: 0, ttsMinutes: 0, voiceEditorMinutes: 0, storageBytes: 0 };

  (projects || []).forEach(p => {
    const mins = (p.duration_seconds || 0) / 60;
    stats.storageBytes += p.file_size_bytes || 0;
    if (p.type === 'voice_clone') stats.voiceCloneMinutes += mins;
    if (p.type === 'tts') stats.ttsMinutes += mins;
    if (p.type === 'voice_editor') stats.voiceEditorMinutes += mins;
  });

  (voices || []).forEach(v => {
    const mins = (v.duration_seconds || 0) / 60;
    if (v.type === 'voice_clone') stats.voiceCloneMinutes += mins;
    if (v.type === 'tts') stats.ttsMinutes += mins;
  });

  return stats;
}

// ── Storage Cleanup ─────────────────────────────────────────

export async function cleanupOrphanFolder(folderName) {
  const { data: files } = await supabase.storage.from('outputs').list(folderName);
  if (!files || files.length === 0) return 0;
  const paths = files.map(f => `${folderName}/${f.name}`);
  await supabase.storage.from('outputs').remove(paths);
  return paths.length;
}

export async function cleanupRootTmpFiles() {
  const { data: files } = await supabase.storage.from('outputs').list('', { limit: 500 });
  if (!files) return 0;
  const tmpFiles = files.filter(f => f.name && f.name.startsWith('tmp'));
  if (tmpFiles.length === 0) return 0;
  const paths = tmpFiles.map(f => f.name);
  await supabase.storage.from('outputs').remove(paths);
  return paths.length;
}

// ── Notifications ───────────────────────────────────────────

const NOTIF_COLS = 'id,title,body,type,is_read,created_at';

function timeAgoShort(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 604800)}w ago`;
}

export function mapNotification(row) {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    type: row.type,
    isRead: row.is_read,
    time: timeAgoShort(row.created_at),
    createdAt: row.created_at,
  };
}

export async function getNotifications(limit = 50) {
  const user = await getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('notifications')
    .select(NOTIF_COLS)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) { console.error('getNotifications:', error); return []; }
  return data.map(mapNotification);
}

export async function getUnreadCount() {
  const user = await getUser();
  if (!user) return 0;
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false);
  if (error) { console.error('getUnreadCount:', error); return 0; }
  return count || 0;
}

export async function markNotificationRead(notifId) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notifId);
  if (error) throw error;
}

export async function markAllNotificationsRead() {
  const user = await getUser();
  if (!user) return;
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false);
  if (error) throw error;
}

export async function dismissNotification(notifId) {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notifId);
  if (error) throw error;
}

export function subscribeToNotifications(userId, onInsert) {
  const channel = supabase
    .channel('notifications-realtime')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onInsert(mapNotification(payload.new));
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
