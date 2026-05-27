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
  // ORB Sport fields
  avg_hr: number | null;
  max_hr: number | null;
  min_hr: number | null;
  calories: number | null;
  workload: number | null;
  most_active_zone: number | null;
  zone_restorative_sec: number | null;
  zone_1_sec: number | null;
  zone_2_sec: number | null;
  zone_3_sec: number | null;
  zone_4_sec: number | null;
  zone_5_sec: number | null;
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
    avg_hr: p.avg_hr,
    max_hr: p.max_hr,
    min_hr: p.min_hr,
    calories: p.calories,
    workload: p.workload,
    most_active_zone: p.most_active_zone,
    zone_restorative_sec: p.zone_restorative_sec,
    zone_1_sec: p.zone_1_sec,
    zone_2_sec: p.zone_2_sec,
    zone_3_sec: p.zone_3_sec,
    zone_4_sec: p.zone_4_sec,
    zone_5_sec: p.zone_5_sec,
  });
  if (bErr) throw new Error(bErr.message);

  revalidatePath('/');
  revalidatePath('/history');
  redirect('/');
}
