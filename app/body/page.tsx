import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { getSupabaseServer } from '@/lib/supabase/server';
import { BodyForm } from './form';
import type { BodyMetric } from '@/lib/database.types';

export const dynamic = 'force-dynamic';

export default async function BodyPage() {
  const supabase = await getSupabaseServer();
  const { data: recent } = await supabase
    .from('body_metrics')
    .select('*')
    .order('date', { ascending: false })
    .limit(7);

  const rows = (recent ?? []) as BodyMetric[];

  return (
    <>
      <Header title="Body" />
      <BodyForm />
      <h2 className="mt-8 mb-2 text-xs uppercase tracking-wider text-mute">
        Last 7 entries
      </h2>
      {rows.length === 0 ? (
        <p className="card text-center text-sm text-mute">No entries yet.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li
              key={r.id}
              className="grid grid-cols-5 gap-2 rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-xs"
            >
              <span className="text-mute">{r.date.slice(5)}</span>
              <span>{r.weight_lbs ?? '—'} <span className="text-mute">lb</span></span>
              <span>{r.body_fat_pct ?? '—'}<span className="text-mute">%bf</span></span>
              <span>{r.muscle_pct ?? '—'}<span className="text-mute">%m</span></span>
              <span>{r.water_pct ?? '—'}<span className="text-mute">%w</span></span>
            </li>
          ))}
        </ul>
      )}
      <BottomNav />
    </>
  );
}
