'use client';

import { useState } from 'react';
import { submitLiftSession, type SetInput } from './actions';
import type { PrescribedExercise } from '@/lib/database.types';

interface Row extends SetInput {
  uiKey: string;
}

export function LiftLoggerForm({
  programDayId, exercises,
}: { programDayId: string; exercises: PrescribedExercise[] }) {
  const [rows, setRows] = useState<Row[]>(() =>
    exercises.flatMap((ex) =>
      Array.from({ length: ex.sets }, (_, i) => ({
        uiKey: `${ex.id}-${i + 1}`,
        prescribed_exercise_id: ex.id,
        exercise_name: ex.name,
        set_number: i + 1,
        reps: null,
        weight_lbs: null,
        rpe: null,
      })),
    ),
  );
  const [duration, setDuration] = useState<string>('');
  const [sessionRpe, setSessionRpe] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');

  function updateRow(key: string, patch: Partial<Row>) {
    setRows((cur) => cur.map((r) => (r.uiKey === key ? { ...r, ...patch } : r)));
  }

  function addSetFor(exerciseId: string) {
    setRows((cur) => {
      const ex = exercises.find((e) => e.id === exerciseId);
      if (!ex) return cur;
      const existing = cur.filter((r) => r.prescribed_exercise_id === exerciseId);
      const setNum = existing.length + 1;
      const newRow: Row = {
        uiKey: `${exerciseId}-extra-${setNum}-${Date.now()}`,
        prescribed_exercise_id: exerciseId,
        exercise_name: ex.name,
        set_number: setNum,
        reps: null,
        weight_lbs: null,
        rpe: null,
      };
      // insert after the last existing row for this exercise
      const idx = cur.map((r) => r.prescribed_exercise_id).lastIndexOf(exerciseId);
      const next = [...cur];
      next.splice(idx + 1, 0, newRow);
      return next;
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      await submitLiftSession({
        program_day_id: programDayId,
        duration_minutes: duration ? Number(duration) : null,
        session_rpe: sessionRpe ? Number(sessionRpe) : null,
        notes,
        sets: rows.map(({ uiKey: _u, ...rest }) => rest),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  }

  // group rows by exercise for display
  const groups = exercises.map((ex) => ({
    ex,
    rows: rows.filter((r) => r.prescribed_exercise_id === ex.id),
  }));

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {groups.map(({ ex, rows: exRows }) => (
        <section key={ex.id} className="card">
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="font-semibold">{ex.name}</h2>
            <span className="text-xs text-mute">
              {ex.sets} × {ex.rep_scheme}
              {ex.rpe_target ? ` @ RPE ${ex.rpe_target}` : ''}
            </span>
          </div>
          {ex.notes && <p className="mb-2 text-[11px] text-mute">{ex.notes}</p>}

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-mute">
                <th className="w-10 pb-1">Set</th>
                <th className="pb-1">Reps</th>
                <th className="pb-1">Weight (lb)</th>
                <th className="pb-1">RPE</th>
              </tr>
            </thead>
            <tbody>
              {exRows.map((r) => (
                <tr key={r.uiKey}>
                  <td className="py-1 text-mute">{r.set_number}</td>
                  <td className="py-1 pr-1">
                    <input
                      type="number"
                      inputMode="numeric"
                      className="input py-1 px-2"
                      value={r.reps ?? ''}
                      onChange={(e) =>
                        updateRow(r.uiKey, { reps: e.target.value ? Number(e.target.value) : null })
                      }
                    />
                  </td>
                  <td className="py-1 pr-1">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.5"
                      className="input py-1 px-2"
                      value={r.weight_lbs ?? ''}
                      onChange={(e) =>
                        updateRow(r.uiKey, { weight_lbs: e.target.value ? Number(e.target.value) : null })
                      }
                    />
                  </td>
                  <td className="py-1">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.5"
                      min="0"
                      max="10"
                      className="input py-1 px-2"
                      value={r.rpe ?? ''}
                      onChange={(e) =>
                        updateRow(r.uiKey, { rpe: e.target.value ? Number(e.target.value) : null })
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            type="button"
            onClick={() => addSetFor(ex.id)}
            className="btn-ghost mt-2 w-full text-xs"
          >
            + Add set
          </button>
        </section>
      ))}

      <section className="card space-y-3">
        <h2 className="font-semibold">Session</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Duration (min)</label>
            <input
              type="number"
              inputMode="numeric"
              className="input"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Session RPE</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.5" min="0" max="10"
              className="input"
              value={sessionRpe}
              onChange={(e) => setSessionRpe(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="label">Notes</label>
          <textarea
            className="input min-h-20"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did it feel? Any niggles?"
          />
        </div>
      </section>

      {error && (
        <p className="rounded-md border border-neon bg-neon/10 p-3 text-xs text-neon">
          {error}
        </p>
      )}

      <button type="submit" disabled={isSaving} className="btn-primary w-full">
        {isSaving ? 'Saving…' : 'Save session'}
      </button>
    </form>
  );
}
