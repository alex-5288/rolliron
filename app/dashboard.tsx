'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import {
  DAY_TYPE_LABEL, PHASE_LABEL, isLiftDay,
  type ProgramDay, type PrescribedExercise,
  type BjjSession, type BodyMetric,
} from '@/lib/database.types';
import { saveBodyMetric } from '@/app/body/actions';
import { BottomNav } from '@/components/BottomNav';

// ─── Root dashboard ───────────────────────────────────────────────────────────

export function Dashboard({
  pd, exercises, daysToComp, latestWeight, latestBjj, today,
}: {
  pd: ProgramDay | null;
  exercises: PrescribedExercise[];
  daysToComp: number | null;
  latestWeight: BodyMetric | null;
  latestBjj: BjjSession | null;
  today: string;
}) {
  return (
    <>
      {/* Header */}
      <div className="mb-4 flex items-baseline justify-between">
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

      {/* Today strip */}
      {pd && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-xs">
          <span className="pill bg-neon text-black">Week {pd.week_number}</span>
          <span className="pill bg-ink-700 text-bone">{PHASE_LABEL[pd.phase]}</span>
          <span className="ml-auto pill border border-neon text-neon">{DAY_TYPE_LABEL[pd.day_type]}</span>
        </div>
      )}

      {/* 2×2 tile grid */}
      <div className="grid grid-cols-2 gap-3">
        <LiftTile pd={pd} exercises={exercises} />
        <BjjTile pd={pd} lastSession={latestBjj} />
        <GarminTile />
        <WeightTile lastEntry={latestWeight} today={today} />
      </div>

      <BottomNav />
    </>
  );
}

// ─── Lift tile ────────────────────────────────────────────────────────────────

function LiftTile({ pd, exercises }: { pd: ProgramDay|null; exercises: PrescribedExercise[] }) {
  const isToday = pd && isLiftDay(pd.day_type);
  const href = isToday ? `/log/lift/${pd.id}` : '/history';

  return (
    <Link href={href} className="card flex flex-col gap-2 active:opacity-80">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-mute">Lifting</span>
        <span className="text-xl leading-none">🏋️</span>
      </div>

      {isToday ? (
        <>
          <div className="pill w-fit border border-neon text-neon text-[11px]">
            {DAY_TYPE_LABEL[pd.day_type]} — Today
          </div>
          <ul className="mt-1 space-y-1.5">
            {exercises.slice(0, 4).map(ex => (
              <li key={ex.id} className="flex items-baseline justify-between text-[11px]">
                <span className="text-bone truncate max-w-[60%]">{ex.name}</span>
                <span className="text-mute shrink-0 ml-1">{ex.sets}×{ex.rep_scheme}</span>
              </li>
            ))}
            {exercises.length > 4 && (
              <li className="text-[10px] text-mute">+{exercises.length - 4} more</li>
            )}
          </ul>
          <div className="mt-auto pt-2">
            <span className="btn-primary block text-center text-xs py-1.5">Log session →</span>
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-1 mt-1">
          <p className="text-xs text-mute">
            {pd ? `${DAY_TYPE_LABEL[pd.day_type]} day` : 'No program today'}
          </p>
          <span className="text-[11px] text-neon mt-auto pt-2">View history →</span>
        </div>
      )}
    </Link>
  );
}

// ─── BJJ tile ─────────────────────────────────────────────────────────────────

function BjjTile({ pd, lastSession }: { pd: ProgramDay|null; lastSession: BjjSession|null }) {
  const isBjjToday = pd?.day_type === 'bjj';

  return (
    <Link href="/log/bjj" className="card flex flex-col gap-2 active:opacity-80">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-mute">BJJ</span>
        <span className="text-xl leading-none">🥋</span>
      </div>

      {isBjjToday && (
        <div className="pill w-fit border border-neon text-neon text-[11px]">BJJ — Today</div>
      )}

      {lastSession ? (
        <>
          <p className="text-[10px] text-mute -mt-1">{fmtDate(lastSession.date)} · {lastSession.gi === 'gi' ? 'Gi' : 'No-gi'}</p>

          {/* ORB-style 2×2 stat grid */}
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
            <div>
              <div className="text-mute leading-none">❤️ Avg HR</div>
              <div className="text-bone font-semibold">
                {lastSession.avg_hr != null ? `${lastSession.avg_hr} bpm` : lastSession.duration_minutes != null ? '—' : '—'}
              </div>
            </div>
            <div>
              <div className="text-mute leading-none">⏱ Duration</div>
              <div className="text-bone font-semibold">
                {lastSession.duration_minutes != null ? fmtDuration(lastSession.duration_minutes) : '—'}
              </div>
            </div>
            <div>
              <div className="text-mute leading-none">🔥 Calories</div>
              <div className="text-bone font-semibold">
                {lastSession.calories != null ? `${lastSession.calories} kcal` : '—'}
              </div>
            </div>
            <div>
              <div className="text-mute leading-none">⚡ Workload</div>
              <div className="text-neon font-bold">
                {lastSession.workload != null ? lastSession.workload : '—'}
              </div>
            </div>
          </div>

          {/* Most active zone */}
          {lastSession.most_active_zone != null && (
            <div className="text-[11px]">
              <span className="text-mute">Peak zone </span>
              <span className={`font-bold ${zoneColor(lastSession.most_active_zone)}`}>
                Zone {lastSession.most_active_zone}
              </span>
            </div>
          )}
        </>
      ) : (
        <p className="text-xs text-mute mt-1">No sessions yet</p>
      )}

      <span className="text-[11px] text-neon mt-auto pt-2">Log session →</span>
    </Link>
  );
}

function zoneColor(z: number) {
  return ['', 'text-blue-400', 'text-teal-400', 'text-green-400', 'text-orange-400', 'text-red-400'][z] ?? 'text-bone';
}

function fmtDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2,'0')}m` : `${m}m`;
}

// ─── Garmin tile (Phase 2 placeholder) ───────────────────────────────────────

function GarminTile() {
  return (
    <div className="card flex flex-col gap-2 opacity-50">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-mute">Garmin</span>
        <span className="text-xl leading-none">⌚</span>
      </div>

      {/* 2×2 grid matching Garmin Connect "At a Glance" */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-2 mt-1 text-[11px]">
        <div>
          <div className="text-mute leading-none">Body Battery</div>
          <div className="text-bone font-bold text-base leading-tight">—</div>
        </div>
        <div>
          <div className="text-mute leading-none">Resting HR</div>
          <div className="text-bone font-semibold">— bpm</div>
        </div>
        <div>
          <div className="text-mute leading-none">HRV</div>
          <div className="text-bone font-semibold">— ms</div>
        </div>
        <div>
          <div className="text-mute leading-none">Sleep Score</div>
          <div className="text-bone font-semibold">—</div>
        </div>
      </div>

      <div className="flex justify-between text-[11px] mt-1">
        <span className="text-mute">Stress</span>
        <span className="text-bone">—</span>
      </div>

      <span className="text-[10px] text-mute mt-auto pt-1">Syncing in Phase 2</span>
    </div>
  );
}

// ─── Weight tile (inline quick-log) ──────────────────────────────────────────

function WeightTile({ lastEntry, today }: { lastEntry: BodyMetric|null; today: string }) {
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState('');
  const [weight, setWeight] = useState('');
  const [bf, setBf] = useState('');
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await saveBodyMetric({
          date: today,
          weight_lbs: weight ? parseFloat(weight) : null,
          body_fat_pct: bf ? parseFloat(bf) : null,
          muscle_pct: null,
          water_pct: null,
          notes: '',
        });
        setSaved(true);
        setWeight('');
        setBf('');
        setTimeout(() => setSaved(false), 3000);
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : 'Error saving');
      }
    });
  }

  return (
    <div className="card flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-mute">Weight</span>
        <span className="text-xl leading-none">⚖️</span>
      </div>

      {lastEntry && !saved && (
        <div className="text-[11px] space-y-1">
          <div className="flex justify-between">
            <span className="text-mute">Last logged</span>
            <span className="text-bone">{fmtDate(lastEntry.date)}</span>
          </div>
          {lastEntry.weight_lbs != null && (
            <div className="flex justify-between">
              <span className="text-mute">Weight</span>
              <span className="text-neon font-bold">{lastEntry.weight_lbs} lbs</span>
            </div>
          )}
          {lastEntry.body_fat_pct != null && (
            <div className="flex justify-between">
              <span className="text-mute">Body fat</span>
              <span className="text-bone">{lastEntry.body_fat_pct}%</span>
            </div>
          )}
        </div>
      )}

      {saved && (
        <p className="text-[11px] text-neon font-bold">✓ Logged for today</p>
      )}

      <form onSubmit={handleSubmit} className="mt-1 space-y-1.5">
        <input
          type="number"
          step="0.1"
          placeholder="Weight (lbs)"
          value={weight}
          onChange={e => setWeight(e.target.value)}
          className="input text-xs py-1.5"
          required
        />
        <input
          type="number"
          step="0.1"
          placeholder="Body fat % (opt)"
          value={bf}
          onChange={e => setBf(e.target.value)}
          className="input text-xs py-1.5"
        />
        <button
          type="submit"
          disabled={pending}
          className="btn-primary w-full text-xs py-1.5"
        >
          {pending ? 'Saving…' : 'Log today'}
        </button>
        {err && <p className="text-[10px] text-neon">{err}</p>}
      </form>
    </div>
  );
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
