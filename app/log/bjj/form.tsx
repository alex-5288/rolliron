'use client';

import { useState } from 'react';
import { submitBjjSession } from './actions';
import type { GiType } from '@/lib/database.types';

function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Convert "mm:ss" string to total seconds (for zone times from ORB)
function parseMMSS(s: string): number | null {
  if (!s.trim()) return null;
  const parts = s.split(':');
  if (parts.length === 2) {
    const m = parseInt(parts[0], 10);
    const sec = parseInt(parts[1], 10);
    if (!isNaN(m) && !isNaN(sec)) return m * 60 + sec;
  }
  const n = parseInt(s, 10);
  return isNaN(n) ? null : n * 60; // plain number treated as minutes
}

function fmtMMSS(secs: number | null): string {
  if (secs === null) return '';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function BjjForm() {
  // Session basics
  const [date, setDate] = useState(todayLocal());
  const [duration, setDuration] = useState('');
  const [gi, setGi] = useState<GiType>('gi');
  const [focus, setFocus] = useState('');
  const [numRolls, setNumRolls] = useState('');
  const [tapsGiven, setTapsGiven] = useState('');
  const [tapsReceived, setTapsReceived] = useState('');
  const [rpe, setRpe] = useState('');
  const [notes, setNotes] = useState('');
  const [orb, setOrb] = useState('');

  // ORB Sport data
  const [avgHr, setAvgHr] = useState('');
  const [maxHr, setMaxHr] = useState('');
  const [minHr, setMinHr] = useState('');
  const [calories, setCalories] = useState('');
  const [workload, setWorkload] = useState('');
  const [mostActiveZone, setMostActiveZone] = useState('');
  const [zoneR, setZoneR] = useState('');   // Restorative mm:ss
  const [zone1, setZone1] = useState('');
  const [zone2, setZone2] = useState('');
  const [zone3, setZone3] = useState('');
  const [zone4, setZone4] = useState('');
  const [zone5, setZone5] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [err, setErr] = useState('');

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
        avg_hr: n(avgHr),
        max_hr: n(maxHr),
        min_hr: n(minHr),
        calories: n(calories),
        workload: n(workload),
        most_active_zone: n(mostActiveZone),
        zone_restorative_sec: parseMMSS(zoneR),
        zone_1_sec: parseMMSS(zone1),
        zone_2_sec: parseMMSS(zone2),
        zone_3_sec: parseMMSS(zone3),
        zone_4_sec: parseMMSS(zone4),
        zone_5_sec: parseMMSS(zone5),
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">

      {/* ── Session basics ── */}
      <div className="card space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Date</label>
            <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div>
            <label className="label">Duration (min)</label>
            <input type="number" inputMode="numeric" className="input" value={duration} onChange={e => setDuration(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">Style</label>
          <div className="flex gap-2">
            {(['gi', 'no_gi'] as GiType[]).map(g => (
              <button
                key={g} type="button" onClick={() => setGi(g)}
                className={`flex-1 rounded-md border px-3 py-2 text-sm ${
                  gi === g ? 'border-neon bg-neon text-black font-semibold' : 'border-ink-600 text-bone'
                }`}
              >
                {g === 'gi' ? 'Gi' : 'No-Gi'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Technique focus</label>
          <input className="input" placeholder="e.g. guard retention, passing" value={focus} onChange={e => setFocus(e.target.value)} />
        </div>
      </div>

      {/* ── Rolling ── */}
      <div className="card space-y-3">
        <h3 className="text-xs uppercase tracking-wider text-mute">Rolling</h3>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="label"># Rolls</label>
            <input type="number" inputMode="numeric" className="input" value={numRolls} onChange={e => setNumRolls(e.target.value)} />
          </div>
          <div>
            <label className="label">Taps given</label>
            <input type="number" inputMode="numeric" className="input" value={tapsGiven} onChange={e => setTapsGiven(e.target.value)} />
          </div>
          <div>
            <label className="label">Taps recv'd</label>
            <input type="number" inputMode="numeric" className="input" value={tapsReceived} onChange={e => setTapsReceived(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">RPE (1–10)</label>
          <input type="number" inputMode="decimal" step="0.5" min="0" max="10" className="input" value={rpe} onChange={e => setRpe(e.target.value)} />
        </div>
      </div>

      {/* ── ORB Sport data ── */}
      <div className="card space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xs uppercase tracking-wider text-mute">ORB Sport Data</h3>
          <span className="text-[10px] text-mute">(optional — copy from app)</span>
        </div>

        {/* 4-stat grid mirroring ORB layout */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label">❤️ Avg HR (bpm)</label>
            <input type="number" inputMode="numeric" className="input" value={avgHr} onChange={e => setAvgHr(e.target.value)} placeholder="139" />
          </div>
          <div>
            <label className="label">⏱ Duration (min)</label>
            <div className="input opacity-50 text-sm">{duration || '—'}</div>
          </div>
          <div>
            <label className="label">🔥 Calories (kcal)</label>
            <input type="number" inputMode="numeric" className="input" value={calories} onChange={e => setCalories(e.target.value)} placeholder="880" />
          </div>
          <div>
            <label className="label">⚡ Workload</label>
            <input type="number" inputMode="numeric" className="input" value={workload} onChange={e => setWorkload(e.target.value)} placeholder="181" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label">Max HR (bpm)</label>
            <input type="number" inputMode="numeric" className="input" value={maxHr} onChange={e => setMaxHr(e.target.value)} placeholder="184" />
          </div>
          <div>
            <label className="label">Min HR (bpm)</label>
            <input type="number" inputMode="numeric" className="input" value={minHr} onChange={e => setMinHr(e.target.value)} placeholder="65" />
          </div>
        </div>

        {/* HR Zones */}
        <div>
          <label className="label mb-1">HR Zones <span className="text-mute">(mm:ss)</span></label>
          <div className="space-y-1.5">
            {[
              { label: 'Restorative  <94 bpm',  val: zoneR,  set: setZoneR,  color: 'bg-purple-500' },
              { label: 'Zone 1  94–111 bpm',    val: zone1,  set: setZone1,  color: 'bg-blue-500' },
              { label: 'Zone 2  112–130 bpm',   val: zone2,  set: setZone2,  color: 'bg-teal-400' },
              { label: 'Zone 3  131–149 bpm',   val: zone3,  set: setZone3,  color: 'bg-green-400' },
              { label: 'Zone 4  150–168 bpm',   val: zone4,  set: setZone4,  color: 'bg-orange-400' },
              { label: 'Zone 5  169+ bpm',      val: zone5,  set: setZone5,  color: 'bg-red-500' },
            ].map(z => (
              <div key={z.label} className="flex items-center gap-2">
                <span className={`h-2 w-2 shrink-0 rounded-full ${z.color}`} />
                <span className="text-[11px] text-mute w-36 shrink-0">{z.label}</span>
                <input
                  type="text"
                  inputMode="numeric"
                  className="input flex-1 text-xs py-1"
                  placeholder="00:00"
                  value={z.val}
                  onChange={e => z.set(e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Most Active Zone (1–5)</label>
          <div className="flex gap-2">
            {[1,2,3,4,5].map(z => (
              <button
                key={z} type="button"
                onClick={() => setMostActiveZone(mostActiveZone === String(z) ? '' : String(z))}
                className={`flex-1 rounded-md border px-2 py-2 text-sm ${
                  mostActiveZone === String(z) ? 'border-neon bg-neon text-black font-bold' : 'border-ink-600 text-bone'
                }`}
              >
                {z}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Notes ── */}
      <div className="card space-y-3">
        <div>
          <label className="label">Notes</label>
          <textarea className="input min-h-24" value={notes} onChange={e => setNotes(e.target.value)} placeholder="What worked, what didn't, anything to drill?" />
        </div>
        <div>
          <label className="label">ORB impact summary <span className="text-mute">(optional)</span></label>
          <textarea className="input min-h-16" value={orb} onChange={e => setOrb(e.target.value)} placeholder="impact count, peak G, notable hits…" />
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
