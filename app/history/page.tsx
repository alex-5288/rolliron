import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { getSupabaseServer } from '@/lib/supabase/server';
import type { SessionLog, SessionKind } from '@/lib/database.types';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const KIND_LABEL: Record<SessionKind, string> = {
  lift: 'Lift',
  bjj: 'BJJ',
  cardio: 'Cardio',
};

const KIND_COLOR: Record<SessionKind, string> = {
  lift: 'border-neon text-neon',
  bjj: 'border-bone text-bone',
  cardio: 'border-mute text-mute',
};

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const sp = await searchParams;
  const filter = (sp.kind as SessionKind | undefined) ?? null;

  const supabase = await getSupabaseServer();
  let q = supabase
    .from('session_logs')
    .select('*')
    .order('performed_at', { ascending: false })
    .limit(50);
  if (filter) q = q.eq('kind', filter);
  const { data: sessions } = await q;
  const rows = (sessions ?? []) as SessionLog[];

  return (
    <>
      <Header title="History" />

      <div className="mb-4 flex gap-2">
        <FilterPill label="All" href="/history" active={!filter} />
        <FilterPill label="Lift" href="/history?kind=lift" active={filter === 'lift'} />
        <FilterPill label="BJJ" href="/history?kind=bjj" active={filter === 'bjj'} />
        <FilterPill label="Cardio" href="/history?kind=cardio" active={filter === 'cardio'} />
      </div>

      {rows.length === 0 ? (
        <p className="card text-center text-sm text-mute">
          No sessions logged yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {rows.map((s) => (
            <li key={s.id} className="card flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">
                  {new Date(s.performed_at).toLocaleDateString(undefined, {
                    weekday: 'short', month: 'short', day: 'numeric',
                  })}
                </div>
                <div className="text-[11px] text-mute">
                  {s.duration_minutes ? `${s.duration_minutes} min` : ''}
                  {s.rpe ? ` · RPE ${s.rpe}` : ''}
                </div>
                {s.notes && (
                  <div className="mt-1 text-xs text-mute line-clamp-2">{s.notes}</div>
                )}
              </div>
              <span className={'pill border ' + KIND_COLOR[s.kind]}>
                {KIND_LABEL[s.kind]}
              </span>
            </li>
          ))}
        </ul>
      )}

      <BottomNav />
    </>
  );
}

function FilterPill({
  label, href, active,
}: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={
        'rounded-full px-3 py-1 text-xs uppercase tracking-wider ' +
        (active
          ? 'bg-neon text-black font-bold'
          : 'border border-ink-600 text-mute')
      }
    >
      {label}
    </Link>
  );
}
