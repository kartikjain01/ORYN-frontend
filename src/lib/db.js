import { supabase } from '../supabaseClient';

// ── Cache ──────────────────────────────────────────────────

const cache = new Map();
const CACHE_TTL = 120_000;

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  return { data: entry.data, stale: Date.now() - entry.time > CACHE_TTL };
}

function setCache(key, data) {
  cache.set(key, { data, time: Date.now() });
}

export function clearCache() {
  cache.clear();
}

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

let _userPromise = null;
let _userTime = 0;
async function getUser() {
  if (_userPromise && Date.now() - _userTime < 30000) return _userPromise;
  _userTime = Date.now();
  _userPromise = supabase.auth.getSession().then(({ data: { session } }) => session?.user ?? null);
  return _userPromise;
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

export function formatDuration(seconds) {
  if (!seconds) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.max(1, Math.round(seconds % 60));
  if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function timeAgo(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ', ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
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
    rawDate: row.updated_at || row.created_at,
    duration: formatDuration(row.duration_seconds),
    durationSeconds: row.duration_seconds || 0,
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

export async function getRecentProjects(limit = 4, onRefresh) {
  const user = await getUser();
  if (!user) { console.warn('[DB] getRecentProjects: no user session'); return []; }
  const key = `recent_${user.id}_${limit}`;
  const cached = getCached(key);
  if (cached && !cached.stale) return cached.data;

  const fetchFresh = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select(PROJECT_COLS)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(limit);
    if (error) { console.error('[DB] getRecentProjects FAILED:', error.message, error.code); return cached?.data || []; }
    const mapped = data.map(mapProject);
    setCache(key, mapped);
    return mapped;
  };

  if (cached && onRefresh) {
    fetchFresh().then(onRefresh);
    return cached.data;
  }
  return fetchFresh();
}

export async function getProjects({ type, search, sort, onRefresh } = {}) {
  const user = await getUser();
  if (!user) return [];
  const key = `projects_${user.id}_${type || 'All'}_${sort || 'Recent'}_${search || ''}`;
  const cached = getCached(key);
  if (cached && !cached.stale) return cached.data;

  const fetchFresh = async () => {
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
    if (error) { console.error('getProjects:', error); return cached?.data || []; }
    const mapped = data.map(mapProject);
    setCache(key, mapped);
    return mapped;
  };

  if (cached && onRefresh) {
    fetchFresh().then(onRefresh);
    return cached.data;
  }
  return fetchFresh();
}

export async function getProjectsByType(dbType, limit = 20) {
  const user = await getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('projects')
    .select('id,title,output_url,metadata,created_at,duration_seconds')
    .eq('user_id', user.id)
    .eq('type', dbType)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) { console.error('getProjectsByType:', error); return []; }
  return data;
}

export async function createProject({ title, type, outputUrl, thumbnailUrl, durationSeconds, fileSizeBytes, metadata }) {
  const user = await getUser();
  if (!user) { console.error('[DB] createProject: no user session'); throw new Error('Not authenticated'); }
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
  if (error) { console.error('[DB] createProject FAILED:', error.message, error.code, error.details); throw error; }
  clearCache();
  return data;
}

export async function renameProject(projectId, newTitle) {
  const { error } = await supabase.from('projects').update({ title: newTitle }).eq('id', projectId);
  if (error) throw error;
  clearCache();
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
  clearCache();
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
  const { data: projects } = await supabase
    .from('projects').select('type').eq('user_id', user.id);

  const stats = { voiceClone: 0, tts: 0, voiceEditor: 0, captions: 0 };

  (projects || []).forEach(p => {
    if (p.type === 'voice_clone') stats.voiceClone++;
    if (p.type === 'tts') stats.tts++;
    if (p.type === 'voice_editor') stats.voiceEditor++;
    if (p.type === 'captions') stats.captions++;
  });

  stats.total = (projects || []).length;
  return stats;
}

export async function getAnalyticsData() {
  const user = await getUser();
  if (!user) return null;

  const [{ data: projects }, { data: voices }] = await Promise.all([
    supabase.from('projects').select('type,duration_seconds,created_at').eq('user_id', user.id),
    supabase.from('voices').select('type,duration_seconds,created_at').eq('user_id', user.id),
  ]);

  const pList = projects || [];
  const vList = voices || [];

  const byType = { voice_clone: 0, tts: 0, voice_editor: 0, captions: 0 };
  const minutesByType = { voice_clone: 0, tts: 0, voice_editor: 0, captions: 0 };
  let totalMinutes = 0;

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthStr = monthStart.toISOString().slice(0, 10);
  let thisMonth = 0;

  pList.forEach(p => {
    const mins = (p.duration_seconds || 0) / 60;
    totalMinutes += mins;
    if (byType[p.type] !== undefined) byType[p.type]++;
    if (minutesByType[p.type] !== undefined) minutesByType[p.type] += mins;
    if (p.created_at?.slice(0, 10) >= monthStr) thisMonth++;
  });

  vList.forEach(v => {
    const mins = (v.duration_seconds || 0) / 60;
    totalMinutes += mins;
    if (minutesByType[v.type] !== undefined) minutesByType[v.type] += mins;
    if (v.created_at?.slice(0, 10) >= monthStr) thisMonth++;
  });

  const now = Date.now();
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now - (29 - i) * 86400000);
    return d.toISOString().slice(0, 10);
  });

  const activityMap = {};
  last30.forEach(d => { activityMap[d] = 0; });
  pList.forEach(p => {
    const day = p.created_at?.slice(0, 10);
    if (day && activityMap[day] !== undefined) activityMap[day]++;
  });
  vList.forEach(v => {
    const day = v.created_at?.slice(0, 10);
    if (day && activityMap[day] !== undefined) activityMap[day]++;
  });

  const activity = last30.map(d => ({ date: d, count: activityMap[d] }));

  return {
    totalProjects: pList.length,
    totalVoices: vList.length,
    totalMinutes,
    thisMonth,
    byType,
    minutesByType,
    activity,
  };
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

// ── Account Reset ──────────────────────────────────────────

export async function resetAccount() {
  const user = await getUser();
  if (!user) throw new Error('Not authenticated');

  // 1. Delete all project storage files
  const { data: projects } = await supabase
    .from('projects')
    .select('output_url,thumbnail_url')
    .eq('user_id', user.id);
  if (projects) {
    await Promise.all(
      projects.flatMap(p => [removeStorageFile(p.output_url), removeStorageFile(p.thumbnail_url)])
    );
  }

  // 2. Delete all voice storage files
  const { data: voices } = await supabase
    .from('voices')
    .select('audio_url')
    .eq('user_id', user.id);
  if (voices) {
    await Promise.all(voices.map(v => removeStorageFile(v.audio_url)));
  }

  // 3. Delete avatar files from storage
  const { data: avatarFiles } = await supabase.storage.from('avatars').list(user.id);
  if (avatarFiles && avatarFiles.length > 0) {
    await supabase.storage.from('avatars').remove(avatarFiles.map(f => `${user.id}/${f.name}`));
  }

  // 4. Delete all data rows
  await Promise.all([
    supabase.from('projects').delete().eq('user_id', user.id),
    supabase.from('voices').delete().eq('user_id', user.id),
    supabase.from('notifications').delete().eq('user_id', user.id),
  ]);

  // 5. Mark profile as deleted (keep row as ghost record for tracking)
  await supabase.from('profiles').update({
    full_name: 'Deleted User',
    avatar_url: null,
    age: null,
    gender: null,
    mobile: null,
    birthday: null,
    deleted_at: new Date().toISOString(),
  }).eq('id', user.id);

  // 6. Clear cache and sign out all sessions
  clearCache();
  await supabase.auth.signOut({ scope: 'global' });
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
