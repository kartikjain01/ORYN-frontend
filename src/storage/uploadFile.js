import { supabase } from '../supabaseClient';

export const uploadFile = async (
  file,
  folder = 'general',
  userId = 'guest'
) => {
  try {
    const filePath = `${userId}/${folder}/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from('outputs')
      .upload(filePath, file);

    if (error) throw error;

    const { data } = supabase.storage.from('outputs').getPublicUrl(filePath);

    return data.publicUrl;
  } catch (err) {
    console.error('Upload error:', err);
    return null;
  }
};
