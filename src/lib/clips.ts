import { supabase } from './supabase';

export type Clip = { id: string; user_id: string; day: string; hour: number; path: string };

export async function listClips(day: string) {
  const { data, error } = await supabase.from('clips').select('id,user_id,day,hour,path').eq('day', day);
  if (error) throw error;
  return data as Clip[];
}

export async function uploadClip(opts: { uri: string; mimeType?: string; coupleId: string; userId: string; day: string; hour: number }) {
  const { uri, coupleId, userId, day, hour } = opts;
  const contentType = opts.mimeType ?? 'video/mp4';
  const ext = contentType.includes('quicktime') ? 'mov' : contentType.includes('webm') ? 'webm' : 'mp4';
  const path = `${coupleId}/${userId}/${day}-${hour}.${ext}`;
  const body = await (await fetch(uri)).arrayBuffer();
  const up = await supabase.storage.from('clips').upload(path, body, { contentType, upsert: true });
  if (up.error) throw up.error;
  const { error } = await supabase.from('clips')
    .upsert({ couple_id: coupleId, user_id: userId, day, hour, path }, { onConflict: 'user_id,day,hour' });
  if (error) throw error;
}

export async function clipUrl(path: string) {
  const { data, error } = await supabase.storage.from('clips').createSignedUrl(path, 60 * 60);
  if (error) throw error;
  return data.signedUrl;
}

export async function deleteClip(clip: Clip) {
  await supabase.storage.from('clips').remove([clip.path]);
  const { error } = await supabase.from('clips').delete().eq('id', clip.id);
  if (error) throw error;
}
