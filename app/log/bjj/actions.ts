'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSupabaseServer } from '@/lib/supabase/server';
import type { GiType } from '@/lib/database.types';

export interface BjjPayload {
  date: string;
  duration_minutes: number | null;
  gi: GiType;
  technique_focus: string;
  num_rolls: number | null;
  taps_given: number | null;
  taps_received: number | null;
  rpe: number | null;
  notes: string;
  orb_summary: string;
}

export async function submitBjjSession(p: BjjPayload) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  // Find optional program_day_id for the date
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
      kind: 'bjj',
      duration_minutes: p.duration_minutes,
      rpe: p.rpe,
      notes: p.notes || null,
    })
    .select('id')
    .single();
  if (sErr || !session) throw new Error(sErr?.message ?? 'session insert failed');

  const { error: bErr } = await supabase.from('bjj_sessions').insert({
    user_id: user.id,
    session_log_id: session.id,
    date: p.date,
    duration_minutes: p.duration_minutes,
    gi: p.gi,
    technique_focus: p.technique_focus || null,
    num_rolls: p.num_rolls,
    taps_given: p.taps_given,
    taps_received: p.taps_received,
    rpe: p.rpe,
    notes: p.notes || null,
    orb_summary: p.orb_summary || null,
  });
  if (bErr) throw new Error(bErr.message);

  revalidatePath('/');
  revalidatePath('/history');
  redirect('/');
}
