'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSupabaseServer } from '@/lib/supabase/server';

export interface SetInput {
  prescribed_exercise_id: string | null;
  exercise_name: string;
  set_number: number;
  reps: number | null;
  weight_lbs: number | null;
  rpe: number | null;
}

export interface SubmitPayload {
  program_day_id: string;
  duration_minutes: number | null;
  session_rpe: number | null;
  notes: string;
  sets: SetInput[];
}

export async function submitLiftSession(payload: SubmitPayload) {
  const supabase = await getSupabaseServer();
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) throw new Error('Not signed in');

  // 1. Create the session_log row
  const { data: session, error: sessionErr } = await supabase
    .from('session_logs')
    .insert({
      user_id: user.id,
      program_day_id: payload.program_day_id,
      kind: 'lift',
      duration_minutes: payload.duration_minutes,
      rpe: payload.session_rpe,
      notes: payload.notes || null,
    })
    .select('id')
    .single();

  if (sessionErr || !session) {
    throw new Error(sessionErr?.message ?? 'Could not create session');
  }

  // 2. Create exercise_log rows (skip empty entries)
  const validSets = payload.sets.filter(
    (s) => s.reps != null || s.weight_lbs != null,
  );

  if (validSets.length > 0) {
    const rows = validSets.map((s) => ({
      session_log_id: session.id,
      user_id: user.id,
      prescribed_exercise_id: s.prescribed_exercise_id,
      exercise_name: s.exercise_name,
      set_number: s.set_number,
      reps: s.reps,
      weight_lbs: s.weight_lbs,
      rpe: s.rpe,
    }));
    const { error: exErr } = await supabase.from('exercise_logs').insert(rows);
    if (exErr) throw new Error(exErr.message);
  }

  revalidatePath('/');
  revalidatePath('/history');
  redirect('/');
}
