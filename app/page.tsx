import Link from 'next/link';
import { getSupabaseServer } from '@/lib/supabase/server';
import {
  DAY_TYPE_LABEL, PHASE_LABEL, isLiftDay,
  type ProgramDay, type PrescribedExercise, type Program,
} from '@/lib/database.types';
import { BottomNav } from '@/components/BottomNav';

function todayIsoLocal(): string {
  // Local-time ISO date (yyyy-mm-dd). Browser tz from server is iffy;
  // for now, server clock is fine since this is a single-user app and
  // we'll deploy in the same tz. We can revisit with intl in Phase 2.
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const dynamic = 'force-dynamic';

export default async function TodayPage() {
  const supabase = await getSupabaseServer();
  const today = todayIsoLocal();

  const { data: pd } = await supabase
    .from('program_days')
    .select('*')
    .eq('date', today)
    .single<ProgramDay>();

  const { data: program } = await supabase
    .from('programs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single<Program>();

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
    ? Math.max(
        0,
        Math.ceil(
          (new Date(program.competition_date).getTime() - new Date(today).getTime()) /
            86_400_000,
        ),
      )
    : null;

  return (
    <>
      <div className="mb-3 flex items-baseline justify-between">
        <h1 className="text-3xl font-black tracking-tight">
          <span className="text-bone">ROLL</span>
          <span className="text-neon"> & </span>
          <span className="text-bone">IRON</span>
        </h1>
        {daysToComp !== null && (
          <div className="text-right">
            <div className="text-2xl font-bold text-neon leading-none">{daysToComp}</div>
            <div className="text-[10px] uppercase tracking-wider text-mute">days to comp</div>
          </div>
        )}
      </div>

      {!pd ? (
        <NoProgramYet />
      ) : (
        <TodayCard
          pd={pd}
          exercises={exercises}
        />
      )}

      <BottomNav />
    </>
  );
}

function NoProgramYet() {
  return (
    <div className="card text-center">
      <p className="mb-3 text-sm text-mute">
        No program is set up for today.
      </p>
      <p className="text-xs text-mute">
        If you just signed in, sign out and back in to seed the default 9-week cycle.
      </p>
    </div>
  );
}

function TodayCard({
  pd, exercises,
}: { pd: ProgramDay; exercises: PrescribedExercise[] }) {
  return (
    <article className="card">
      <div className="mb-4 flex items-center gap-2">
        <span className="pill bg-neon text-black">Week {pd.week_number}</span>
        <span className="pill bg-ink-700 text-bone">{PHASE_LABEL[pd.phase]}</span>
        <span className="pill border border-neon text-neon">
          {DAY_TYPE_LABEL[pd.day_type]}
        </span>
      </div>

      {pd.notes ? (
        <p className="mb-4 text-xs text-mute italic">{pd.notes}</p>
      ) : null}

      {pd.day_type === 'rest' && <RestPanel />}
      {pd.day_type === 'comp' && <CompPanel />}
      {pd.day_type === 'bjj' && <BjjPanel />}
      {pd.day_type === 'cardio' && <CardioPanel />}
      {isLiftDay(pd.day_type) && (
        <LiftPanel programDayId={pd.id} exercises={exercises} />
      )}
    </article>
  );
}

function RestPanel() {
  return (
    <div className="py-8 text-center">
      <div className="mb-2 text-5xl">𝟶</div>
      <p className="text-sm text-mute">Full rest. Hydrate, stretch, sleep.</p>
    </div>
  );
}

function CompPanel() {
  return (
    <div className="py-8 text-center">
      <div className="mb-2 text-4xl">🥇</div>
      <p className="text-lg font-bold text-neon">COMPETITION DAY</p>
      <p className="mt-2 text-xs text-mute">Compete. Have fun. Be safe.</p>
    </div>
  );
}

function BjjPanel() {
  return (
    <div>
      <p className="mb-4 text-sm text-mute">Grappling technique & sparring.</p>
      <Link href="/log/bjj" className="btn-primary w-full">
        Log BJJ session
      </Link>
    </div>
  );
}

function CardioPanel() {
  return (
    <div>
      <p className="mb-2 text-sm text-mute">Sunday cardio.</p>
      <ul className="mb-4 space-y-1 text-sm">
        <li>• 20-min incline walk</li>
        <li>• Assault Bike sprints</li>
      </ul>
      <Link href="/log/cardio" className="btn-primary w-full">
        Log cardio
      </Link>
    </div>
  );
}

function LiftPanel({
  programDayId, exercises,
}: { programDayId: string; exercises: PrescribedExercise[] }) {
  return (
    <div>
      <details className="mb-4 rounded-md border border-ink-700 bg-ink-800 p-3 text-sm">
        <summary className="cursor-pointer text-mute">10-min dynamic warmup</summary>
        <ul className="mt-3 space-y-1 text-xs text-mute">
          <li>• Cat-Cow ×10</li>
          <li>• Thread the Needle ×8/side</li>
          <li>• World's Greatest Stretch ×5/side</li>
          <li>• 90/90 Hip Switches ×8/side</li>
          <li>• Banded Shoulder Pass-Throughs ×15</li>
        </ul>
      </details>

      <ul className="mb-4 space-y-2">
        {exercises.map((ex) => (
          <li
            key={ex.id}
            className="flex items-baseline justify-between rounded-md border border-ink-700 bg-ink-800 px-3 py-2"
          >
            <div>
              <div className="font-semibold">{ex.name}</div>
              {ex.notes && (
                <div className="text-[11px] text-mute">{ex.notes}</div>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm">
                {ex.sets} × {ex.rep_scheme}
              </div>
              {ex.rpe_target && (
                <div className="text-[11px] text-neon">RPE {ex.rpe_target}</div>
              )}
            </div>
          </li>
        ))}
      </ul>

      <Link
        href={`/log/lift/${programDayId}`}
        className="btn-primary w-full"
      >
        Log this session
      </Link>
    </div>
  );
}
