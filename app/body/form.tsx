'use client';

import { useState } from 'react';
import { saveBodyMetric } from './actions';

function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function BodyForm() {
  const [date, setDate] = useState(todayLocal());
  const [w, setW] = useState('');
  const [bf, setBf] = useState('');
  const [mu, setMu] = useState('');
  const [wa, setWa] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  function n(s: string): number | null { return s === '' ? null : Number(s); }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setIsSaving(true);
    try {
      await saveBodyMetric({
        date,
        weight_lbs: n(w),
        body_fat_pct: n(bf),
        muscle_pct: n(mu),
        water_pct: n(wa),
        notes,
      });
      setMsg({ kind: 'ok', text: 'Saved' });
    } catch (e) {
      setMsg({ kind: 'err', text: e instanceof Error ? e.message : 'Save failed' });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-3">
      <div>
        <label className="label">Date</label>
        <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Weight (lb)</label>
          <input type="number" inputMode="decimal" step="0.1" className="input" value={w} onChange={(e) => setW(e.target.value)} />
        </div>
        <div>
          <label className="label">Body fat %</label>
          <input type="number" inputMode="decimal" step="0.1" className="input" value={bf} onChange={(e) => setBf(e.target.value)} />
        </div>
        <div>
          <label className="label">Muscle %</label>
          <input type="number" inputMode="decimal" step="0.1" className="input" value={mu} onChange={(e) => setMu(e.target.value)} />
        </div>
        <div>
          <label className="label">Water %</label>
          <input type="number" inputMode="decimal" step="0.1" className="input" value={wa} onChange={(e) => setWa(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea className="input min-h-16" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="time of day, hydration, etc." />
      </div>
      <button type="submit" className="btn-primary w-full" disabled={isSaving}>
        {isSaving ? 'Saving…' : 'Save'}
      </button>
      {msg && (
        <p className={'text-xs ' + (msg.kind === 'ok' ? 'text-neon' : 'text-neon')}>
          {msg.text}
        </p>
      )}
    </form>
  );
}
