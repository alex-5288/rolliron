import { getSupabaseServer } from '@/lib/supabase/server';
import {
  isLiftDay,
  type ProgramDay, type PrescribedExercise, type Program,
  type BjjSession, type BodyMetric,
} from '@/lib/database.types';
import { Dashboard } from './dashboard';

function todayIsoLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = await getSupabaseServer();
  const today = todayIsoLocal();

  const [
    { data: pd },
    { data: program },
    { data: latestWeight },
    { data: latestBjj },
  ] = await Promise.all([
    supabase.from('program_days').select('*').eq('date', today).single<ProgramDay>(),
    supabase.from('programs').select('id,competition_date,name').order('created_at',{ascending:false}).limit(1).single<Program>(),
    supabase.from('body_metrics').select('id,date,weight_lbs,body_fat_pct').order('date',{ascending:false}).limit(1).single<BodyMetric>(),
    supabase.from('bjj_sessions').select('id,date,duration_minutes,gi,num_rolls,rpe,taps_given,taps_received,technique_focus').order('date',{ascending:false}).limit(1).single<BjjSession>(),
  ]);

  let exercises: PrescribedExercise[] = [];
  if (pd && isLiftDay(pd.day_type)) {
    const { data } = await supabase
      .from('prescribed_exercises')
      .select('*')
      .eq('program_day_id', pd.id)
      .order('order_index', { ascending: true });
    exercises = data ?? [];
  }

  const daysToComp = program?.competition_date
    ? Math.max(0, Math.ceil(
        (new Date(program.competition_date).getTime() - new Date(today).getTime()) / 86_400_000
      ))
    : null;

  return (
    <Dashboard
      pd={pd ?? null}
      exercises={exercises}
      daysToComp={daysToComp}
      latestWeight={latestWeight ?? null}
      latestBjj={latestBjj ?? null}
      today={today}
    />
  );
}
