import { redirect } from 'next/navigation';
import { getSupabaseServer } from '@/lib/supabase/server';
import { Header } from '@/components/Header';
import { LiftLoggerForm } from './form';
import type { PrescribedExercise, ProgramDay } from '@/lib/database.types';

export const dynamic = 'force-dynamic';

export default async function LiftLogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await getSupabaseServer();

  const { data: pd } = await supabase
    .from('program_days')
    .select('*')
    .eq('id', id)
    .single<ProgramDay>();

  if (!pd) redirect('/');

  const { data: exercises } = await supabase
    .from('prescribed_exercises')
    .select('*')
    .eq('program_day_id', id)
    .order('order_index', { ascending: true });

  return (
    <>
      <Header title={`Log Lift — Week ${pd.week_number}`} back="/" />
      <LiftLoggerForm
        programDayId={pd.id}
        exercises={(exercises ?? []) as PrescribedExercise[]}
      />
    </>
  );
}
