'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSupabaseServer } from '@/lib/supabase/server';
import type { CardioKind } from '@/lib/database.types';

export interface CardioPayload {
  date: string;
  cardio_type: CardioKind;
  duration_minutes: number | null;
  distance_miles: number | null;
  avg_hr: number | null;
  max_hr: number | null;
  calories: number | null;
  rpe: number | null;
  notes: string;
}

export async function submitCardioSession(p: CardioPayload) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const { data: pd } = await supabase
    .from('program_days')
    .select('id')
    .eq('date', p.date)
    .maybeSingle();

  const { data: session, error: sErr } = await supabase
    .from('session_logs')
    .insert({
      user_id: user.id,
      program_day_id: pd?.id ?? null,
      kind: 'cardio',
      duration_minutes: p.duration_minutes,
      rpe: p.rpe,
      notes: p.notes || null,
    })
    .select('id')
    .single();
  if (sErr || !session) throw new Error(sErr?.message ?? 'session insert failed');

  const { error: cErr } = await supabase.from('cardio_sessions').insert({
    user_id: user.id,
    session_log_id: session.id,
    date: p.date,
    cardio_type: p.cardio_type,
    duration_minutes: p.duration_minutes,
    distance_miles: p.distance_miles,
    avg_hr: p.avg_hr,
    max_hr: p.max_hr,
    calories: p.calories,
    rpe: p.rpe,
    source: 'manual',
    garmin_activity_id: null,
    notes: p.notes || null,
  });
  if (cErr) throw new Error(cErr.message);

  revalidatePath('/');
  revalidatePath('/history');
  redirect('/');
}
