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
};

export async function updateSuggestion(id: string, data: SongInput) {
  await requireAdmin();

  const supabase = await createClient();

  const { error } = await supabase
    .from('song_suggestions')
    .update({
      title: data.title.trim(),
      melody: data.melody?.trim() || null,
      author: data.author?.trim() || null,
      chorus: data.chorus?.trim() || null,
      verses: data.verses,
    })
    .eq('id', id);

  if (error) {
    console.error(error);
    throw new Error(error.message || 'Kunne ikke oppdatere forslag');
  }

  revalidatePath('/admin');
  revalidatePath(`/admin/suggestions/${id}`);
  revalidatePath(`/admin/suggestions/${id}/edit`);

  return { success: true };
}

export async function deleteSuggestion(id: string) {
  await requireAdmin();

  const supabase = await createClient();

  const { error } = await supabase.from('song_suggestions').delete().eq('id', id);

  if (error) {
    console.error(error);
    throw new Error(error.message || 'Kunne ikke slette forslag');
  }

  revalidatePath('/admin');

  return { success: true };
}

export async function approveSuggestion(id: string) {
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

  // 2. Insert to songs
  const { error: insertErr } = await supabase.from('songs').insert({
    title: suggestion.title,
    melody: suggestion.melody,
    author: suggestion.author,
    chorus: suggestion.chorus,
    verses: suggestion.verses,
  });

  if (insertErr) {
    console.error(insertErr);
    throw new Error('Kunne ikke legge til sang');
  }

  // 3. Delete suggestion
  const { error: delErr } = await supabase.from('song_suggestions').delete().eq('id', id);

  if (delErr) {
    console.error(delErr);
    throw new Error('Kunne ikke fjerne forslag etter godkjenning');
  }

  revalidatePath('/admin');
  revalidatePath('/'); // if homepage shows songs

  return { success: true };
}
