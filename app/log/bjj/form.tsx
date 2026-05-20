'use client';

import { useState } from 'react';
import { submitBjjSession } from './actions';
import type { GiType } from '@/lib/database.types';

function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function BjjForm() {
  const [date, setDate] = useState<string>(todayLocal());
  const [duration, setDuration] = useState<string>('');
  const [gi, setGi] = useState<GiType>('gi');
  const [focus, setFocus] = useState<string>('');
  const [numRolls, setNumRolls] = useState<string>('');
  const [tapsGiven, setTapsGiven] = useState<string>('');
  const [tapsReceived, setTapsReceived] = useState<string>('');
  const [rpe, setRpe] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [orb, setOrb] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [err, setErr] = useState<string>('');

  function n(s: string): number | null { return s === '' ? null : Number(s); }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setIsSaving(true);
    try {
      await submitBjjSession({
        date,
        duration_minutes: n(duration),
        gi,
        technique_focus: focus,
        num_rolls: n(numRolls),
        taps_given: n(tapsGiven),
        taps_received: n(tapsReceived),
        rpe: n(rpe),
        notes,
        orb_summary: orb,
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
            <label className="label">Duration (min)</label>
            <input type="number" inputMode="numeric" className="input" value={duration} onChange={(e) => setDuration(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">Style</label>
          <div className="flex gap-2">
            {(['gi', 'no_gi'] as GiType[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGi(g)}
                className={
                  'flex-1 rounded-md border px-3 py-2 text-sm ' +
                  (gi === g
                    ? 'border-neon bg-neon text-black font-semibold'
                    : 'border-ink-600 text-bone')
                }
              >
                {g === 'gi' ? 'Gi' : 'No-Gi'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Technique focus</label>
          <input
            className="input"
            placeholder="e.g. guard retention, passing"
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
          />
        </div>
      </div>

      <div className="card space-y-3">
        <h3 className="text-xs uppercase tracking-wider text-mute">Rolling</h3>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="label"># Rolls</label>
            <input type="number" inputMode="numeric" className="input" value={numRolls} onChange={(e) => setNumRolls(e.target.value)} />
          </div>
          <div>
            <label className="label">Taps given</label>
            <input type="number" inputMode="numeric" className="input" value={tapsGiven} onChange={(e) => setTapsGiven(e.target.value)} />
          </div>
          <div>
            <label className="label">Taps recv'd</label>
            <input type="number" inputMode="numeric" className="input" value={tapsReceived} onChange={(e) => setTapsReceived(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">RPE (1–10)</label>
          <input type="number" inputMode="decimal" step="0.5" min="0" max="10" className="input" value={rpe} onChange={(e) => setRpe(e.target.value)} />
        </div>
      </div>

      <div className="card space-y-3">
        <div>
          <label className="label">Notes</label>
          <textarea className="input min-h-24" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What worked, what didn't, anything to drill?" />
        </div>
        <div>
          <label className="label">ORB Sport summary <span className="text-mute">(optional)</span></label>
          <textarea
            className="input min-h-16"
            value={orb}
            onChange={(e) => setOrb(e.target.value)}
            placeholder="impact count, peak G, notable hits…"
          />
        </div>
      </div>

      {err && (
        <p className="rounded-md border border-neon bg-neon/10 p-3 text-xs text-neon">{err}</p>
      )}

      <button type="submit" className="btn-primary w-full" disabled={isSaving}>
        {isSaving ? 'Saving…' : 'Save BJJ session'}
      </button>
    </form>
  );
}
