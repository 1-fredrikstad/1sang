'use server';

import { createClient } from '@/src/lib/supabase/server';
import { requireAdmin } from '@/src/lib/actions/auth';
import { revalidatePath } from 'next/cache';

type SongInput = {
  title: string;
  melody?: string | null;
  author?: string | null;
  chorus?: string | null;
  verses: string[];
  spotify_youtube?: string;
  has_chords: boolean;
};

// Update suggestion
export async function updateSuggestion(id: string, data: SongInput) {
  // Restrict to admins
  await requireAdmin();

  const supabase = await createClient();

  // Update existing suggestion
  const { error } = await supabase
    .from('song_suggestions')
    .update({
      title: data.title.trim(),
      melody: data.melody?.trim() || null,
      author: data.author?.trim() || null,
      chorus: data.chorus?.trim() || null,
      verses: data.verses,
      spotify_youtube: data.spotify_youtube,
      has_chords: data.has_chords,
    })
    .eq('id', id);

  if (error) {
    console.error(error);
    throw new Error(error.message || 'Kunne ikke oppdatere forslag');
  }

  // Refresh affected pages
  revalidatePath('/admin');
  revalidatePath(`/admin/suggestions/${id}`);
  revalidatePath(`/admin/suggestions/${id}/edit`);

  return { success: true };
}

// Delete suggestion
export async function deleteSuggestion(id: string) {
  // Restrict action to admins
  await requireAdmin();

  const supabase = await createClient();

  const { error } = await supabase.from('song_suggestions').delete().eq('id', id);

  // Delete suggestion by id
  if (error) {
    console.error(error);
    throw new Error(error.message || 'Kunne ikke slette forslag');
  }

  revalidatePath('/admin');

  return { success: true };
}

export async function approveSuggestion(id: string) {
  // Restrict action to admin
  await requireAdmin();

  const supabase = await createClient();

  // 1. Get suggestion
  const { data: suggestion, error: getErr } = await supabase
    .from('song_suggestions')
    .select('*')
    .eq('id', id)
    .single();

  if (getErr || !suggestion) {
    console.error('Approve get error:', getErr);
    throw new Error('Fant ikke forslag');
  }

  // 2. Insert approved suggestion to songs
  const { error: insertErr } = await supabase.from('songs').insert({
    title: suggestion.title,
    melody: suggestion.melody,
    author: suggestion.author,
    chorus: suggestion.chorus,
    verses: suggestion.verses,
    spotify_youtube: suggestion.spotify_youtube,
    has_chords: suggestion.has_chords,
  });

  if (insertErr) {
    console.error(insertErr);
    throw new Error('Kunne ikke legge til sang');
  }

  // 3. Remove original suggestion
  const { error: delErr } = await supabase.from('song_suggestions').delete().eq('id', id);

  if (delErr) {
    console.error(delErr);
    throw new Error('Kunne ikke fjerne forslag etter godkjenning');
  }

  // Refresh admin + public pages
  revalidatePath('/admin');
  revalidatePath('/'); // if homepage shows songs

  return { success: true };
}
