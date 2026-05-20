'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseServer } from '@/lib/supabase/server';

export interface BodyPayload {
  date: string;
  weight_lbs: number | null;
  body_fat_pct: number | null;
  muscle_pct: number | null;
  water_pct: number | null;
  notes: string;
}

export async function saveBodyMetric(p: BodyPayload) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  // Upsert on (user_id, date) — one entry per morning.
  const { error } = await supabase
    .from('body_metrics')
    .upsert(
      {
        user_id: user.id,
        date: p.date,
        weight_lbs: p.weight_lbs,
        body_fat_pct: p.body_fat_pct,
        muscle_pct: p.muscle_pct,
        water_pct: p.water_pct,
        notes: p.notes || null,
      },
      { onConflict: 'user_id,date' },
    );
  if (error) throw new Error(error.message);

  revalidatePath('/body');
  revalidatePath('/');
}
