'use client';

import { useState } from 'react';
import { submitCardioSession } from './actions';
import type { CardioKind } from '@/lib/database.types';

function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const KINDS: { value: CardioKind; label: string }[] = [
  { value: 'incline_walk', label: 'Incline Walk' },
  { value: 'assault_bike', label: 'Assault Bike' },
  { value: 'run', label: 'Run' },
  { value: 'row', label: 'Row' },
  { value: 'other', label: 'Other' },
];

export function CardioForm() {
  const [date, setDate] = useState(todayLocal());
  const [kind, setKind] = useState<CardioKind>('incline_walk');
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [avgHr, setAvgHr] = useState('');
  const [maxHr, setMaxHr] = useState('');
  const [calories, setCalories] = useState('');
  const [rpe, setRpe] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [err, setErr] = useState('');

  function n(s: string): number | null { return s === '' ? null : Number(s); }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setIsSaving(true);
    try {
      await submitCardioSession({
        date,
        cardio_type: kind,
        duration_minutes: n(duration),
        distance_miles: n(distance),
        avg_hr: n(avgHr),
        max_hr: n(maxHr),
        calories: n(calories),
        rpe: n(rpe),
        notes,
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="card space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Date</label>
            <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="label">Type</label>
            <select
              className="input"
              value={kind}
              onChange={(e) => setKind(e.target.value as CardioKind)}
            >
              {KINDS.map((k) => (
                <option key={k.value} value={k.value}>{k.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Duration (min)</label>
            <input type="number" inputMode="numeric" className="input" value={duration} onChange={(e) => setDuration(e.target.value)} />
          </div>
          <div>
            <label className="label">Distance (mi)</label>
            <input type="number" inputMode="decimal" step="0.01" className="input" value={distance} onChange={(e) => setDistance(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="label">Avg HR</label>
            <input type="number" inputMode="numeric" className="input" value={avgHr} onChange={(e) => setAvgHr(e.target.value)} />
          </div>
          <div>
            <label className="label">Max HR</label>
            <input type="number" inputMode="numeric" className="input" value={maxHr} onChange={(e) => setMaxHr(e.target.value)} />
          </div>
          <div>
            <label className="label">Cals</label>
            <input type="number" inputMode="numeric" className="input" value={calories} onChange={(e) => setCalories(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">RPE (1–10)</label>
          <input type="number" inputMode="decimal" step="0.5" min="0" max="10" className="input" value={rpe} onChange={(e) => setRpe(e.target.value)} />
        </div>

        <div>
          <label className="label">Notes</label>
          <textarea className="input min-h-20" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Intervals, hill, mood…" />
        </div>
      </div>

      {err && (
        <p className="rounded-md border border-neon bg-neon/10 p-3 text-xs text-neon">{err}</p>
      )}

      <button type="submit" className="btn-primary w-full" disabled={isSaving}>
        {isSaving ? 'Saving…' : 'Save cardio'}
      </button>
    </form>
  );
}
